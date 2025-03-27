import { useState, useEffect, useRef } from "react";
import { useLoaderData, useNavigate, useParams } from "@remix-run/react";
import { json, LoaderFunction, MetaFunction } from "@remix-run/node";
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

interface CaseData {
  id: number;
  date: string;
  dl_citation_no: string;
  type: string;
  c_t: number;
  region: {
    code: string;
    name: string;
  };
  judges: string;
  lawyers: string | null;
  court: string | null;
  keywords_phrases: string | null;
  area_of_law: string | null;
  title: string;
  subject_matters: string | null;
  snippet: string;
  decision: string;
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

export const loader: LoaderFunction = async ({ params }) => {
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
        return;
      }
      console.log("hello");

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
        setCaseDetails(data);

        if (caseDigestFromDB == null) {
          generateCaseDigest(baseAIUrl, data, token).then(
            async (digestResponse) => {
              console.log("digestResponse", digestResponse.data);
              const digestInfo = digestResponse.data;
              setCaseDigest(digestInfo);
              setLoadingDigest(false);
              // await storeVectorFileIDs(
              //   baseUrl,
              //   digestInfo?.vector_store_id,
              //   digestInfo?.file_id,
              //   digestInfo?.dl_citation_no,
              //   token
              // );
              await storeCaseDigest(baseUrl, digestInfo, token);
            }
          );
        } else {
          // getCaseDigestFromAI(
          //   baseAIUrl,
          //   caseDigestFromDB?.vector_store_id!,
          //   caseDigestFromDB?.dl_citation_no!,
          //   token
          // ).then((digestResponse) => {
            setCaseDigest(caseDigestFromDB as CaseDigest);
            setLoadingDigest(false);
          // });
        }
      } catch (err) {
        console.error("Error fetching with auth:", err);
      } finally {
        setLoading(false);
        // setLoadingDigest(false);
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

  // Extract case sections (Introduction, Issues, etc.)
  const extractSections = () => {
    const sections: { title: string; content: string }[] = [];
    const lines = caseDetails.decision.split("\r\n");

    let currentSection = "";
    let currentContent: string[] = [];

    lines.forEach((line) => {
      // Check if line is a potential section title (capitalized, ends with colon, etc.)
      if (line.trim().match(/^[A-Z].*:$/)) {
        // Save previous section if it exists
        if (currentSection && currentContent.length > 0) {
          sections.push({
            title: currentSection,
            content: currentContent.join("\r\n"),
          });
        }

        // Start new section
        currentSection = line.trim();
        currentContent = [];
      } else {
        // Add line to current section
        currentContent.push(line);
      }
    });

    // Add the last section
    if (currentSection && currentContent.length > 0) {
      sections.push({
        title: currentSection,
        content: currentContent.join("\r\n"),
      });
    }

    return sections;
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
                    {!loadingDigest && !isChatOpen && (
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

                    {/* Case Metadata Grid */}
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
                        <p className="text-sm text-gray-500">Type:</p>
                        <p className="font-semibold capitalize">
                          {caseDetails.type}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Region:</p>
                        <p className="font-semibold">
                          {caseDetails.region?.name || "Not specified"}
                        </p>
                      </div>
                    </div>

                    {/* Judges */}
                    <div className="mb-4">
                      <p className="text-sm text-gray-500">Judges:</p>
                      <p className="font-semibold">
                        {caseDetails.judges || "Not specified"}
                      </p>
                    </div>

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
                        key="digest"
                        title={
                          <div className="flex items-center gap-1">
                            Case Digest{" "}
                            <span className="text-xs bg-blue-100 text-blue-600 px-1.5 py-0.5 rounded">
                              AI
                            </span>
                          </div>
                        }
                      >
                        <div className="py-4">
                          {loadingDigest ? (
                            <div className="space-y-6">
                              {/* AI Generated Notice */}
                              <div className="bg-blue-50 border-l-4 border-blue-400 p-4 mb-6 flex items-center gap-3 rounded-md">
                                <svg
                                  xmlns="http://www.w3.org/2000/svg"
                                  className="h-6 w-6 text-blue-500"
                                  fill="none"
                                  viewBox="0 0 24 24"
                                  stroke="currentColor"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
                                  />
                                </svg>
                                <div>
                                  <p className="font-medium text-blue-700">
                                    AI-Generated Content
                                  </p>
                                  <p className="text-sm text-blue-600">
                                    This case digest is being generated using
                                    AI...
                                  </p>
                                </div>
                              </div>

                              {/* Summary Section Skeleton */}
                              <div className="mb-6">
                                <h3 className="text-lg font-semibold mb-2">
                                  Summary
                                </h3>
                                <div className="space-y-2">
                                  <Skeleton className="w-full h-4 rounded-lg" />
                                  <Skeleton className="w-full h-4 rounded-lg" />
                                  <Skeleton className="w-4/5 h-4 rounded-lg" />
                                </div>
                              </div>

                              {/* Facts Section Skeleton */}
                              <div className="mb-6">
                                <h3 className="text-lg font-semibold mb-2">
                                  Facts
                                </h3>
                                <ul className="list-disc pl-5 space-y-3">
                                  <li className="flex items-center">
                                    <Skeleton className="w-full h-4 rounded-lg" />
                                  </li>
                                  <li className="flex items-center">
                                    <Skeleton className="w-full h-4 rounded-lg" />
                                  </li>
                                  <li className="flex items-center">
                                    <Skeleton className="w-5/6 h-4 rounded-lg" />
                                  </li>
                                </ul>
                              </div>

                              {/* Issues Section Skeleton */}
                              <div className="mb-6">
                                <h3 className="text-lg font-semibold mb-2">
                                  Issues
                                </h3>
                                <ul className="list-disc pl-5 space-y-3">
                                  <li className="flex items-center">
                                    <Skeleton className="w-full h-4 rounded-lg" />
                                  </li>
                                  <li className="flex items-center">
                                    <Skeleton className="w-4/5 h-4 rounded-lg" />
                                  </li>
                                </ul>
                              </div>

                              {/* Arguments Section Skeleton */}
                              <div className="mb-6">
                                <h3 className="text-lg font-semibold mb-2">
                                  Arguments
                                </h3>
                                <div className="mb-4">
                                  <Skeleton className="w-1/4 h-5 rounded-lg mb-2" />
                                  <div className="pl-4 border-l-2 border-gray-300 space-y-2">
                                    <Skeleton className="w-full h-4 rounded-lg" />
                                    <Skeleton className="w-full h-4 rounded-lg" />
                                  </div>
                                </div>
                                <div className="mb-4">
                                  <Skeleton className="w-1/4 h-5 rounded-lg mb-2" />
                                  <div className="pl-4 border-l-2 border-gray-300 space-y-2">
                                    <Skeleton className="w-full h-4 rounded-lg" />
                                    <Skeleton className="w-full h-4 rounded-lg" />
                                  </div>
                                </div>
                              </div>

                              {/* Holding Section Skeleton */}
                              <div className="mb-6">
                                <h3 className="text-lg font-semibold mb-2">
                                  Holding
                                </h3>
                                <ul className="list-disc pl-5 space-y-3">
                                  <li className="flex items-center">
                                    <Skeleton className="w-full h-4 rounded-lg" />
                                  </li>
                                  <li className="flex items-center">
                                    <Skeleton className="w-4/5 h-4 rounded-lg" />
                                  </li>
                                </ul>
                              </div>
                            </div>
                          ) : (
                            <>
                              {/* AI Generated Notice */}
                              <div className="bg-blue-50 border-l-4 border-blue-400 p-4 mb-6 flex items-center gap-3 rounded-md">
                                <svg
                                  xmlns="http://www.w3.org/2000/svg"
                                  className="h-6 w-6 text-blue-500"
                                  fill="none"
                                  viewBox="0 0 24 24"
                                  stroke="currentColor"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
                                  />
                                </svg>
                                <div>
                                  <p className="font-medium text-blue-700">
                                    AI-Generated Content
                                  </p>
                                  <p className="text-sm text-blue-600">
                                    This case digest was automatically generated
                                    using AI and may not be comprehensive or
                                    entirely accurate.
                                  </p>
                                </div>
                              </div>

                              {/* Summary Section */}
                              <div className="mb-6">
                                <h3 className="text-lg font-semibold mb-2">
                                  Summary
                                </h3>
                                <p className="text-gray-700">
                                  {caseDigest?.summary}
                                </p>
                              </div>

                              {/* Digest Content with Cards */}
                              <div className="space-y-6">
                                {/* Facts Card */}
                                <Card
                                  shadow="sm"
                                  className="border border-gray-100 overflow-visible bg-white"
                                >
                                  <div className="p-5">
                                    <h3 className="text-lg font-semibold text-primary-800 mb-3">
                                      Facts
                                    </h3>
                                    <ul className="list-disc pl-5 space-y-2 text-gray-700">
                                      {caseDigest?.facts?.map((item, index) => (
                                        <li key={index}>
                                          {item.content || item.value}
                                        </li>
                                      ))}
                                    </ul>
                                  </div>
                                </Card>

                                {/* Issues Card */}
                                <Card
                                  shadow="sm"
                                  className="border border-gray-100  overflow-visible bg-white"
                                >
                                  <div className="p-5">
                                    <h3 className="text-lg font-semibold text-primary-800 mb-3">
                                      Issues
                                    </h3>
                                    <ul className="list-disc pl-5 space-y-2 text-gray-700">
                                      {caseDigest?.issues?.map(
                                        (item, index) => (
                                          <li key={index}>
                                            {item.content || item.value}
                                          </li>
                                        )
                                      )}
                                    </ul>
                                  </div>
                                </Card>

                                {/* Arguments Card */}
                                <Card
                                  shadow="sm"
                                  className="border border-gray-100 overflow-visible bg-white"
                                >
                                  <div className="p-5">
                                    <h3 className="text-lg font-semibold text-primary-800 mb-3">
                                      Arguments
                                    </h3>
                                    {caseDigest?.arguments?.map(
                                      (arg, index) => (
                                        <div key={index} className="mb-4">
                                          <h4 className="font-medium mb-2 text-primary-700">
                                            {arg.party}
                                          </h4>
                                          <p className="pl-4 border-l-2 border-primary-200 text-gray-700">
                                            {arg.argument}
                                          </p>
                                        </div>
                                      )
                                    )}
                                  </div>
                                </Card>

                                {/* Holding Card */}
                                <Card
                                  shadow="sm"
                                  className="border border-gray-100 overflow-visible bg-white"
                                >
                                  <div className="p-5">
                                    <h3 className="text-lg font-semibold text-primary-800 mb-3">
                                      Holding
                                    </h3>
                                    <ul className="list-disc pl-5 space-y-2 text-gray-700">
                                      {caseDigest?.holding?.map(
                                        (item, index) => (
                                          <li key={index}>
                                            {item.content || item.value}
                                          </li>
                                        )
                                      )}
                                    </ul>
                                  </div>
                                </Card>

                                {/* Reasoning Card */}
                                <Card
                                  shadow="sm"
                                  className="border border-gray-100 overflow-visible bg-white"
                                >
                                  <div className="p-5">
                                    <h3 className="text-lg font-semibold text-primary-800 mb-3">
                                      Reasoning
                                    </h3>
                                    <div className="space-y-4">
                                      <div>
                                        <h4 className="font-medium mb-2 text-primary-700">
                                          Ratio Decidendi
                                        </h4>
                                        <p className="text-gray-700">
                                          {caseDigest?.ratio_decidendi}
                                        </p>
                                      </div>
                                    </div>
                                  </div>
                                </Card>
                              </div>
                            </>
                          )}
                        </div>
                      </Tab>

                      <Tab
                        key="references"
                        title={
                          <div className="flex items-center gap-1">
                            References{" "}
                            <span className="text-xs bg-blue-100 text-blue-600 px-1.5 py-0.5 rounded">
                              AI
                            </span>
                          </div>
                        }
                      >
                        <div className="py-4">
                          {loadingDigest ? (
                            <div className="space-y-6">
                              {/* Cases Cited Section Skeleton */}
                              <div className="mb-6">
                                <h3 className="text-lg font-semibold mb-3">
                                  Cases Cited
                                </h3>
                                <ul className="list-disc pl-5 space-y-3">
                                  <li className="flex items-center">
                                    <Skeleton className="w-full h-4 rounded-lg" />
                                  </li>
                                  <li className="flex items-center">
                                    <Skeleton className="w-full h-4 rounded-lg" />
                                  </li>
                                  <li className="flex items-center">
                                    <Skeleton className="w-5/6 h-4 rounded-lg" />
                                  </li>
                                </ul>
                              </div>

                              {/* Laws Cited Section Skeleton */}
                              <div className="mb-6">
                                <h3 className="text-lg font-semibold mb-3">
                                  Laws Cited
                                </h3>
                                <ul className="list-disc pl-5 space-y-3">
                                  <li className="flex items-center">
                                    <Skeleton className="w-full h-4 rounded-lg" />
                                  </li>
                                  <li className="flex items-center">
                                    <Skeleton className="w-4/5 h-4 rounded-lg" />
                                  </li>
                                </ul>
                              </div>
                            </div>
                          ) : (
                            <>
                              {/* Cases Cited Section */}
                              <div className="mb-6">
                                <h3 className="text-lg font-semibold mb-3">
                                  Cases Cited
                                </h3>
                                <ul className="list-disc pl-5 space-y-2">
                                  {caseDigest?.cases_cited?.map(
                                    (item, index) => (
                                      <li key={index}>
                                        {item.content || item.value}
                                      </li>
                                    )
                                  )}
                                </ul>
                              </div>

                              {/* Laws Cited Section */}
                              <div className="mb-6">
                                <h3 className="text-lg font-semibold mb-3">
                                  Laws Cited
                                </h3>
                                <ul className="list-disc pl-5 space-y-2">
                                  {caseDigest?.laws_cited?.map(
                                    (item, index) => (
                                      <li key={index}>
                                        {item.content || item.value}
                                      </li>
                                    )
                                  )}
                                </ul>
                              </div>

                              {/* Metadata Card */}
                              <Card className="border border-gray-100 shadow-sm overflow-visible bg-white">
                                <div className="p-5">
                                  <h3 className="text-lg font-semibold text-primary-800 mb-3">
                                    Additional Metadata
                                  </h3>

                                  {/* Subject Matter */}
                                  {caseDigest?.subject_matter &&
                                    caseDigest?.subject_matter.length > 0 && (
                                      <div className="mb-4">
                                        <h4 className="font-medium mb-2 text-primary-700">
                                          Subject Matter
                                        </h4>
                                        <div className="flex flex-wrap gap-2">
                                          {caseDigest?.subject_matter.map(
                                            (item, index) => (
                                              <Chip
                                                key={index}
                                                size="sm"
                                                variant="flat"
                                                color="secondary"
                                                className="transition-all hover:scale-105"
                                              >
                                                {item.content || item.value}
                                              </Chip>
                                            )
                                          )}
                                        </div>
                                      </div>
                                    )}

                                  {/* Keywords */}
                                  {caseDigest?.keywords &&
                                    caseDigest?.keywords.length > 0 && (
                                      <div>
                                        <h4 className="font-medium mb-2 text-primary-700">
                                          Keywords
                                        </h4>
                                        <div className="flex flex-wrap gap-2">
                                          {caseDigest?.keywords.map(
                                            (item, index) => (
                                              <Chip
                                                key={index}
                                                size="sm"
                                                variant="flat"
                                                color="default"
                                                className="transition-all hover:scale-105"
                                              >
                                                {item.content || item.value}
                                              </Chip>
                                            )
                                          )}
                                        </div>
                                      </div>
                                    )}
                                </div>
                              </Card>
                            </>
                          )}
                        </div>
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
