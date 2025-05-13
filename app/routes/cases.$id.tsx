import { useState, useEffect, useRef } from "react";
import { useLoaderData, useNavigate, useParams } from "@remix-run/react";
import { json, LoaderFunction, MetaFunction, redirect } from "@remix-run/node";
import axios from "axios";
import AdminLayout from "~/Layout/AdminLayout";
import {
  Card,
  Chip,
  Spinner,
  Divider,
  Tabs,
  Tab,
  Button,
  Tooltip,
  Accordion,
  AccordionItem,
  Skeleton, // Add this import
} from "@nextui-org/react";
import {
  MdContentCopy,
  MdShare,
  MdBookmark,
  MdBookmarkBorder,
  MdArrowBack,
  MdPrint,
  MdChat,
  MdChevronLeft,
  MdChevronRight,
  MdClose,
} from "react-icons/md";
import { Link } from "@remix-run/react";
import { CaseDigest, CaseDigestResponse } from "~/types/CaseDigest";
import {
  generateCaseDigest,
  getCaseDigestByDlCitationFromDB,
  getCaseDigestFromAI,
  storeCaseDigest,
} from "~/api/case-digest";
import { storeVectorFileIDs } from "~/api/vector_files";
import ChatInterface from "~/components/ChatInterface";
import { analyzeCaseWithAI, CaseAnalysis } from "~/api/case-analysis";
import CaseAnalysisDisplay from "~/components/CaseAnalysisDisplay";
import { convertAnalysisToMarkdown } from "~/utils/helpers";

interface CaseData {
  id: number;
  title: string;
  date: string;
  dl_citation_no: string;
  decision: string;
  c_t: number;

  // Court information
  court_type?: string;
  court?: string | null;

  // Case metadata
  suit_reference_number?: string;
  year?: string;
  file_url?: string;
  file_name?: string;
  citation?: string | null;

  // Location information
  town?: string;
  region?:
    | string
    | {
        code: string;
        name: string;
      };

  // People involved
  presiding_judge?: string;
  judgement_by?: string;
  judges?: string;
  lawyers?: string | null;

  // Categorization fields
  area_of_law?: string | null;
  keywords_phrases?: string | null;
  subject_matters?: string | null;
  snippet?: string;
  type?: string;
}

interface LoaderData {
  caseData: CaseData;
  baseUrl: string;
  baseAIUrl: string;
  caseDigestFromDB: any;
}

export const meta: MetaFunction = ({ data }) => {
  const { caseData } = data as LoaderData;
  return [
    { title: `${caseData.title} | Dennislaw` },
    {
      name: "description",
      content: `Read the full case of ${caseData.title} - ${caseData.dl_citation_no}`,
    },
  ];
};

export const loader: LoaderFunction = async ({ request, params }) => {
  const { id } = params;
  const baseUrl = process.env.NEXT_PUBLIC_DL_LIVE_URL;
  const baseAIUrl = process.env.NEXT_PUBLIC_DL_AI_API_URL;

  try {
    // Make initial request for case details
    const caseResponse = await axios.get(`${baseUrl}/case/${id}/fetch`);
    const dl_citation_no = caseResponse.data.data?.dl_citation_no;
    const caseDigestFromDB = await getCaseDigestByDlCitationFromDB(
      baseUrl!,
      dl_citation_no
    );

    return json({
      caseData: caseResponse.data.data,
      baseUrl,
      baseAIUrl,
      caseDigestFromDB,
    });
  } catch (error) {
    console.error("Error fetching case:", error);
    throw new Response("Case not found", { status: 404 });
  }
};

export default function CasePreview() {
  const { caseData, baseUrl, caseDigestFromDB, baseAIUrl } =
    useLoaderData<LoaderData>();
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [caseDetails, setCaseDetails] = useState(caseData);
  const [selectedTab, setSelectedTab] = useState("full");
  const [copySuccess, setCopySuccess] = useState(false);
  const [caseDigest, setCaseDigest] = useState<CaseDigest>();
  const [loadingDigest, setLoadingDigest] = useState(false);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const mainContentRef = useRef<HTMLDivElement>(null);
  const apiCallMadeRef = useRef(false);
  const [analysisLoading, setAnalysisLoading] = useState(false);
  const [vectorStoreId, setVectorStoreId] = useState<string | null>(null);
  const [caseAnalysis, setCaseAnalysis] = useState<CaseAnalysis | null>(null);

  const navigate = useNavigate();

  // Check screen size
  useEffect(() => {
    const checkScreenSize = () => {
      setIsMobile(window.innerWidth < 1024);
    };

    checkScreenSize();
    window.addEventListener("resize", checkScreenSize);

    return () => {
      window.removeEventListener("resize", checkScreenSize);
    };
  }, []);

  // Adjust main content height when chat is toggled
  useEffect(() => {
    if (mainContentRef.current) {
      mainContentRef.current.style.height =
        isChatOpen && !isMobile ? "calc(100vh - 120px)" : "auto";
    }
  }, [isChatOpen, isMobile]);

  // Fetch with auth token on client side if needed
  useEffect(() => {
    const fetchWithAuth = async () => {
      // Skip if we've already made this API call for this citation number
      if (apiCallMadeRef.current) {
        return;
      }

      const token = localStorage.getItem("access_token");
      if (!token) {
        setLoading(false);
        navigate("/");
        return;
      }

      try {
        apiCallMadeRef.current = true;
        setLoading(true);
        setLoadingDigest(true);

        const response = await axios.get(
          `${baseUrl}/case/${caseData.dl_citation_no}/fetch`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        const data = response.data.data;
        const analysisMarkdown = convertAnalysisToMarkdown(data);
        setCaseDetails({
          ...data,
          analysis: analysisMarkdown,
          vector_store_id: data.vector_store_id,
          vector_file_id: data.file_id,
        });

        if (caseDigestFromDB == null) {
          // generateCaseDigest(baseAIUrl, data, token).then(
          //   async (digestResponse) => {
          //     console.log("digestResponse", digestResponse.data);
          //     const digestInfo = digestResponse.data;
          //     setCaseDigest(digestInfo);
          //     setLoadingDigest(false);
          //     await storeCaseDigest(baseUrl, digestInfo, token);
          //   }
          // );
        } else {
          setCaseDigest(caseDigestFromDB as CaseDigest);
          setLoadingDigest(false);
        }
      } catch (err) {
        console.error("Error fetching with auth:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchWithAuth();
  }, [caseData.dl_citation_no]);

  // Format the decision text for better readability
  const formatDecision = (text: string) => {
    // Replace new lines with proper HTML line breaks
    return text.split("\r\n").map((paragraph, index) => (
      <p key={index} className={`${paragraph.trim() === "" ? "h-4" : "mb-4"}`}>
        {paragraph}
      </p>
    ));
  };

  const handleCopyText = () => {
    navigator.clipboard.writeText(caseDetails.decision);
    setCopySuccess(true);
    setTimeout(() => setCopySuccess(false), 2000);
  };

  const handleBookmark = () => {
    setIsBookmarked(!isBookmarked);
    // Add your bookmark logic here
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: caseDetails.title,
        text: `Check out this case: ${caseDetails.title} - ${caseDetails.dl_citation_no}`,
        url: window.location.href,
      });
    } else {
      navigator.clipboard.writeText(window.location.href);
      alert("Link copied to clipboard!");
    }
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <AdminLayout>
      <div className="container mx-auto py-0 relative">
        {loading ? (
          <div className="h-96 flex items-center justify-center">
            <Spinner size="lg" color="primary" label="Loading case..." />
          </div>
        ) : error ? (
          <div className="text-center my-8">
            <h2 className="text-2xl font-bold text-red-500 mb-2">Error</h2>
            <p>{error}</p>
            <Button
              color="primary"
              variant="flat"
              className="mt-4"
              onClick={() => navigate(-1)}
              startContent={<MdArrowBack />}
            >
              Go Back
            </Button>
          </div>
        ) : (
          <>
            {/* Main Content with Canvas-style Layout */}
            <div className="flex flex-col lg:flex-row w-full gap-0 relative">
              {/* Main Case Content */}
              <div
                ref={mainContentRef}
                className={`${
                  isChatOpen
                    ? "w-full lg:w-3/5 lg:border-r border-gray-200"
                    : "w-full"
                } transition-all duration-300 ease-in-out overflow-y-auto px-4`}
              >
                {/* Back button row */}
                <div className="flex justify-between items-center mb-4 sticky top-0 bg-white z-10 py-2 px-4">
                  <Button
                    color="default"
                    variant="light"
                    onPress={() => navigate(-1)}
                    startContent={<MdArrowBack />}
                    size="sm"
                  >
                    Back
                  </Button>

                  <div className="flex items-center gap-2">
                    {!isChatOpen && (
                      <Tooltip content={"Ask AI"}>
                        <Button
                          isIconOnly
                          color="default"
                          variant="flat"
                          startContent={<MdChat size={16} />}
                          onPress={() => setIsChatOpen(true)}
                        ></Button>
                      </Tooltip>
                    )}
                    <Tooltip content={copySuccess ? "Copied!" : "Copy Text"}>
                      <Button
                        isIconOnly
                        color="default"
                        variant="flat"
                        aria-label="Copy Text"
                        onPress={handleCopyText}
                      >
                        <MdContentCopy />
                      </Button>
                    </Tooltip>

                    <Tooltip content="Share">
                      <Button
                        isIconOnly
                        color="default"
                        variant="flat"
                        aria-label="Share"
                        onPress={handleShare}
                      >
                        <MdShare />
                      </Button>
                    </Tooltip>

                    <Tooltip
                      content={isBookmarked ? "Remove Bookmark" : "Bookmark"}
                    >
                      <Button
                        isIconOnly
                        color="default"
                        variant="flat"
                        aria-label="Bookmark"
                        onPress={handleBookmark}
                      >
                        {isBookmarked ? <MdBookmark /> : <MdBookmarkBorder />}
                      </Button>
                    </Tooltip>

                    <Tooltip content="Print">
                      <Button
                        isIconOnly
                        color="default"
                        variant="flat"
                        aria-label="Print"
                      >
                        <MdPrint />
                      </Button>
                    </Tooltip>
                  </div>
                </div>

                <Card className="shadow-sm mb-20">
                  <div className="p-6">
                    {/* Case Header */}
                    <h1 className="text-2xl font-bold mb-2 text-primary">
                      {caseDetails.title}
                    </h1>

                    {/* Case Metadata Grid - Enhanced */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                      <div>
                        <p className="text-sm text-gray-500">Citation:</p>
                        <p className="font-semibold">
                          {caseDetails.dl_citation_no}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Date:</p>
                        <p className="font-semibold">{caseDetails.date}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Court:</p>
                        <p className="font-semibold">
                          {caseDetails.court_type === "SC"
                            ? "Supreme Court"
                            : caseDetails.court_type === "CA"
                            ? "Court of Appeal"
                            : caseDetails.court_type === "HC"
                            ? "High Court"
                            : caseDetails.court ||
                              caseDetails.court_type ||
                              "Not specified"}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">
                          Reference Number:
                        </p>
                        <p className="font-semibold">
                          {caseDetails.suit_reference_number || "Not specified"}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Year:</p>
                        <p className="font-semibold">
                          {caseDetails.year ||
                            (caseDetails.date &&
                              new Date(caseDetails.date).getFullYear()) ||
                            "Not specified"}
                        </p>
                      </div>
                    </div>

                    {/* Judges & Lawyers Section */}
                    <div className="mb-4">
                      <p className="text-sm text-gray-500">Presiding Judge:</p>
                      <p className="font-semibold">
                        {caseDetails.judgement_by ||
                          (caseDetails.presiding_judge &&
                            caseDetails.presiding_judge.split(",")[0]) ||
                          "Not specified"}
                      </p>
                    </div>

                    <div className="mb-4">
                      <p className="text-sm text-gray-500">Judges:</p>
                      <p className="font-semibold">
                        {caseDetails.presiding_judge ||
                          caseDetails.judges ||
                          "Not specified"}
                      </p>
                    </div>

                    {caseDetails.lawyers && (
                      <div className="mb-4">
                        <p className="text-sm text-gray-500">Lawyers:</p>
                        <p className="font-semibold">
                          {caseDetails.lawyers.split(",").map((lawyer, idx) => (
                            <span key={idx} className="block">
                              {lawyer.trim()}
                            </span>
                          ))}
                        </p>
                      </div>
                    )}

                    {/* Categorizations */}
                    <div className="flex flex-wrap gap-2 mb-4">
                      {caseDetails.area_of_law &&
                        caseDetails.area_of_law
                          .split(",")
                          .map((area, index) => (
                            <Chip
                              key={index}
                              size="sm"
                              variant="flat"
                              color="primary"
                            >
                              {area.trim()}
                            </Chip>
                          ))}
                    </div>

                    <Divider className="my-4" />

                    {/* Case Content Tabs */}
                    <Tabs
                      size="lg"
                      color="default"
                      selectedKey={selectedTab}
                      onSelectionChange={(key) => setSelectedTab(key as string)}
                      className="print:hidden"
                      classNames={{
                        tabList: "shadow-sm bg-gray-200/50",
                      }}
                    >
                      <Tab key="full" title="Full Case">
                        <div className="py-4 prose prose-slate max-w-none">
                          {formatDecision(caseDetails.decision)}
                        </div>
                      </Tab>

                      <Tab
                        key="analysis"
                        title={
                          <div className="flex items-center gap-1">
                            Case Analysis{" "}
                            <span className="text-xs bg-blue-100 text-blue-600 px-1.5 py-0.5 rounded">
                              AI
                            </span>
                          </div>
                        }
                      >
                        <CaseAnalysisDisplay
                          caseData={caseDetails}
                          baseAIUrl={baseAIUrl}
                          baseUrl={baseUrl}
                          initialAnalysis={caseAnalysis}
                          onAnalysisGenerated={(analysis) => {
                            setCaseAnalysis(analysis);
                            setAnalysisLoading(false);
                          }}
                        />
                      </Tab>
                    </Tabs>

                    {/* Print version - only visible when printing */}
                    <div className="hidden print:block">
                      <h2 className="text-xl font-bold mb-4">Full Text</h2>
                      <div className="prose prose-slate max-w-none">
                        {formatDecision(caseDetails.decision)}
                      </div>
                    </div>
                  </div>
                </Card>
              </div>

              {/* Chat Canvas - ChatGPT Style */}
              <div
                className={`${
                  isChatOpen ? "block lg:w-2/5" : "hidden"
                } fixed lg:static inset-0 bg-white z-30 transition-all duration-300 h-screen lg:h-[calc(100vh-120px)] overflow-hidden`}
                style={{
                  boxShadow: isChatOpen ? "0 0 15px rgba(0,0,0,0.1)" : "none",
                }}
              >
                {isChatOpen && (
                  <div className="h-full flex flex-col">
                    <div className="p-3 border-b flex justify-between items-center">
                      <h2 className="font-semibold">
                        Dennislaw AI Case Assistant
                      </h2>
                      <Button
                        isIconOnly
                        size="sm"
                        variant="light"
                        onPress={() => setIsChatOpen(false)}
                      >
                        <MdClose />
                      </Button>
                    </div>
                    <div className="flex-grow overflow-hidden">
                      <ChatInterface
                        caseTitle={caseDetails.title}
                        dlCitationNo={caseDetails.dl_citation_no}
                        baseAIUrl={baseAIUrl}
                        vectorStoreId={caseDigest?.vector_store_id}
                        fileId={caseDigest?.file_id}
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>
          </>
        )}
      </div>
    </AdminLayout>
  );
}
