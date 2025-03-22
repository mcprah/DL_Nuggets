import { useState, useEffect } from "react";
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
} from "@nextui-org/react";
import {
  MdContentCopy,
  MdShare,
  MdBookmark,
  MdBookmarkBorder,
  MdArrowBack,
  MdPrint,
} from "react-icons/md";
import { Link } from "@remix-run/react";
import { CaseDigest, CaseDigestResponse } from "~/types/CaseDigest";
import {
  generateCaseDigest,
  getCaseDigestByDlCitationFromDB,
  getCaseDigestFromAI,
} from "~/api/case-digest";
import { storeVectorFileIDs } from "~/api/vector_files";

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

  const navigate = useNavigate();

  // Fetch with auth token on client side if needed
  useEffect(() => {
    const fetchWithAuth = async () => {
      const token = localStorage.getItem("access_token");
      if (!token) return; // Skip if no token

      try {
        setLoading(true);
        setLoadingDigest(true);
        const response = await axios
          .get(`${baseUrl}/case/${caseData.dl_citation_no}/fetch`, {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          })
          .then((caseResData) => {
            const data = caseResData.data.data;

            setCaseDetails(data);

            if (caseDigestFromDB == null) {
              generateCaseDigest(baseAIUrl, data, token).then(
                async (digestResponse) => {
                  console.log("digestResponse", digestResponse.data);
                  const digestInfo = digestResponse.data;
                  setCaseDigest(digestInfo);
                  await storeVectorFileIDs(
                    baseUrl,
                    digestInfo?.vector_store_id,
                    digestInfo?.file_id,
                    digestInfo?.dl_citation_no,
                    token
                  );
                  setLoadingDigest(false);
                }
              );
            } else {
              getCaseDigestFromAI(
                baseAIUrl,
                caseDigest?.vector_store_id!,
                caseDigest?.dl_citation_no!,
                token
              ).then((digestResponse) => {
                setCaseDigest(digestResponse as CaseDigest);
              });
            }
          });

        // Continue without digest if it fails
      } catch (err) {
        console.error("Error fetching with auth:", err);
        // Keep using the data we already have
      } finally {
        setLoading(false);
        setLoadingDigest(false);
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
      <div className="max-w-6xl mx-auto pb-20">
        {/* Header with back button */}
        <div className="flex items-center mb-4">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-gray-600 hover:text-primary transition-all px-3 py-1.5 rounded-lg hover:bg-gray-100"
          >
            <MdArrowBack className="text-xl" />
            <span className="text-sm font-medium">Back</span>
          </button>
        </div>

        {loading ? (
          <div className="flex justify-center items-center h-96">
            <Spinner size="md" label="Loading case..." />
          </div>
        ) : error ? (
          <Card className="p-6 text-center">
            <p className="text-red-500">{error}</p>
            <Button as={Link} to="/nuggets" className="mt-4" color="primary">
              Back to Nuggets
            </Button>
          </Card>
        ) : (
          <>
            {/* Case Info Card */}
            <Card
              shadow="none"
              className="mb-6 border border-gray-100 bg-transparent"
            >
              <div className="p-6">
                {/* Title and Actions */}
                <div className="flex flex-col md:flex-row md:justify-between md:items-start gap-4 mb-4">
                  <h1 className="text-xl md:text-2xl font-bold text-gray-800">
                    {caseDetails.title}
                  </h1>
                  <div className="flex gap-2 flex-wrap justify-end print:hidden">
                    <Tooltip content={copySuccess ? "Copied!" : "Copy text"}>
                      <Button
                        isIconOnly
                        variant="light"
                        onPress={handleCopyText}
                        className="text-gray-600"
                      >
                        <MdContentCopy />
                      </Button>
                    </Tooltip>
                    <Tooltip content="Print case">
                      <Button
                        isIconOnly
                        variant="light"
                        onPress={handlePrint}
                        className="text-gray-600"
                      >
                        <MdPrint />
                      </Button>
                    </Tooltip>
                    <Tooltip content="Share case">
                      <Button
                        isIconOnly
                        variant="light"
                        onPress={handleShare}
                        className="text-gray-600"
                      >
                        <MdShare />
                      </Button>
                    </Tooltip>
                    <Tooltip
                      content={
                        isBookmarked ? "Remove bookmark" : "Bookmark this case"
                      }
                    >
                      <Button
                        isIconOnly
                        variant="light"
                        onPress={handleBookmark}
                        className="text-gray-600"
                      >
                        {isBookmarked ? <MdBookmark /> : <MdBookmarkBorder />}
                      </Button>
                    </Tooltip>
                  </div>
                </div>

                {/* Case Metadata */}
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
                    caseDetails.area_of_law.split(",").map((area, index) => (
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
                  <Tab key="digest" title="Case Digest">
                    <div className="py-4">
                      {/* Summary Section */}
                      <div className="mb-6">
                        <h3 className="text-lg font-semibold mb-2">Summary</h3>
                        <p className="text-gray-700">{caseDigest?.summary}</p>
                      </div>

                      {/* Accordion for Key Components */}
                      <div className="space-y-4">
                        <Accordion>
                          <AccordionItem key="facts" title="Facts">
                            <ul className="list-disc pl-5 space-y-2">
                              {caseDigest?.facts?.map((item, index) => (
                                <li key={index}>
                                  {item.content || item.value}
                                </li>
                              ))}
                            </ul>
                          </AccordionItem>

                          <AccordionItem key="issues" title="Issues">
                            <ul className="list-disc pl-5 space-y-2">
                              {caseDigest?.issues?.map((item, index) => (
                                <li key={index}>
                                  {item.content || item.value}
                                </li>
                              ))}
                            </ul>
                          </AccordionItem>

                          {/* New Arguments Section */}
                          <AccordionItem key="arguments" title="Arguments">
                            {caseDigest?.arguments?.map((arg, index) => (
                              <div key={index} className="mb-4">
                                <h4 className="font-medium mb-2">
                                  {arg.party}
                                </h4>
                                <p className="pl-4 border-l-2 border-gray-300">
                                  {arg.argument}
                                </p>
                              </div>
                            ))}
                          </AccordionItem>

                          <AccordionItem key="holding" title="Holding">
                            <ul className="list-disc pl-5 space-y-2">
                              {caseDigest?.holding?.map((item, index) => (
                                <li key={index}>
                                  {item.content || item.value}
                                </li>
                              ))}
                            </ul>
                          </AccordionItem>

                          <AccordionItem key="reasoning" title="Reasoning">
                            <h4 className="font-medium mb-2">
                              Ratio Decidendi
                            </h4>
                            <p className="mb-4">
                              {caseDigest?.ratio_decidendi}
                            </p>

                            {caseDigest?.obiter_dicta &&
                              caseDigest?.obiter_dicta.length > 0 && (
                                <>
                                  <h4 className="font-medium mb-2">
                                    Obiter Dicta
                                  </h4>
                                  <ul className="list-disc pl-5 space-y-2">
                                    {caseDigest?.obiter_dicta.map(
                                      (item, index) => (
                                        <li key={index}>
                                          {item.content || item.value}
                                        </li>
                                      )
                                    )}
                                  </ul>
                                </>
                              )}

                            {/* New Opinions Sections */}
                            {caseDigest?.concurring_opinions &&
                              caseDigest?.concurring_opinions.length > 0 && (
                                <>
                                  <h4 className="font-medium mt-4 mb-2">
                                    Concurring Opinions
                                  </h4>
                                  {caseDigest?.concurring_opinions.map(
                                    (opinion, index) => (
                                      <div
                                        key={index}
                                        className="mb-3 p-3 bg-gray-50 rounded"
                                      >
                                        <p className="italic mb-1">
                                          {opinion.judge || "Judge"}:
                                        </p>
                                        <p>
                                          {opinion.content || opinion.opinion}
                                        </p>
                                      </div>
                                    )
                                  )}
                                </>
                              )}

                            {caseDigest?.dissenting_opinions &&
                              caseDigest?.dissenting_opinions.length > 0 && (
                                <>
                                  <h4 className="font-medium mt-4 mb-2">
                                    Dissenting Opinions
                                  </h4>
                                  {caseDigest?.dissenting_opinions.map(
                                    (opinion, index) => (
                                      <div
                                        key={index}
                                        className="mb-3 p-3 bg-gray-50 rounded"
                                      >
                                        <p className="italic mb-1">
                                          {opinion.judge || "Judge"}:
                                        </p>
                                        <p>
                                          {opinion.content || opinion.opinion}
                                        </p>
                                      </div>
                                    )
                                  )}
                                </>
                              )}
                          </AccordionItem>
                        </Accordion>
                      </div>
                    </div>
                  </Tab>

                  <Tab key="references" title="References">
                    <div className="py-4">
                      {/* Cases Cited Section */}
                      <div className="mb-6">
                        <h3 className="text-lg font-semibold mb-3">
                          Cases Cited
                        </h3>
                        <ul className="list-disc pl-5 space-y-2">
                          {caseDigest?.cases_cited?.map((item, index) => (
                            <li key={index}>{item.content || item.value}</li>
                          ))}
                        </ul>
                      </div>

                      {/* Laws Cited Section */}
                      <div className="mb-6">
                        <h3 className="text-lg font-semibold mb-3">
                          Laws Cited
                        </h3>
                        <ul className="list-disc pl-5 space-y-2">
                          {caseDigest?.laws_cited?.map((item, index) => (
                            <li key={index}>{item.content || item.value}</li>
                          ))}
                        </ul>
                      </div>

                      {/* New Metadata Section */}
                      <Accordion>
                        <AccordionItem
                          key="metadata"
                          title="Additional Metadata"
                        >
                          {/* Subject Matter */}
                          {caseDigest?.subject_matter &&
                            caseDigest?.subject_matter.length > 0 && (
                              <div className="mb-4">
                                <h4 className="font-medium mb-2">
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
                                <h4 className="font-medium mb-2">Keywords</h4>
                                <div className="flex flex-wrap gap-2">
                                  {caseDigest?.keywords.map((item, index) => (
                                    <Chip
                                      key={index}
                                      size="sm"
                                      variant="flat"
                                      color="default"
                                    >
                                      {item.content || item.value}
                                    </Chip>
                                  ))}
                                </div>
                              </div>
                            )}
                        </AccordionItem>
                      </Accordion>
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
          </>
        )}
      </div>
    </AdminLayout>
  );
}
