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

  try {
    // Make initial request without the token
    const response = await axios.get(`${baseUrl}/case/${id}/fetch`);
    return json({
      caseData: response.data.data,
      baseUrl,
    });
  } catch (error) {
    console.error("Error fetching case:", error);
    throw new Response("Case not found", { status: 404 });
  }
};

export default function CasePreview() {
  const { caseData, baseUrl } = useLoaderData<LoaderData>();
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [caseDetails, setCaseDetails] = useState(caseData);
  const [selectedTab, setSelectedTab] = useState("full");
  const [copySuccess, setCopySuccess] = useState(false);

  const navigate = useNavigate();

  // Fetch with auth token on client side if needed
  useEffect(() => {
    const fetchWithAuth = async () => {
      const token = localStorage.getItem("access_token");
      if (!token) return; // Skip if no token

      try {
        setLoading(true);
        const response = await axios.get(`${baseUrl}/case/${caseData.id}/fetch`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        setCaseDetails(response.data.data);
      } catch (err) {
        console.error("Error fetching with auth:", err);
        // Keep using the data we already have
      } finally {
        setLoading(false);
      }
    };

    fetchWithAuth();
  }, [baseUrl, caseData.id]);

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
      <div className="max-w-5xl mx-auto pb-20">
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
            <Card className="mb-6 shadow-sm border border-gray-100">
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
                    <p className="font-semibold">{caseDetails.dl_citation_no}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Date:</p>
                    <p className="font-semibold">{caseDetails.date}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Type:</p>
                    <p className="font-semibold capitalize">{caseDetails.type}</p>
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
                  selectedKey={selectedTab}
                  onSelectionChange={(key) => setSelectedTab(key as string)}
                  className="print:hidden"
                >
                  <Tab key="full" title="Full Text">
                    <div className="py-4 prose prose-slate max-w-none">
                      {formatDecision(caseDetails.decision)}
                    </div>
                  </Tab>
                  <Tab key="sections" title="Sections">
                    <div className="py-4">
                      {extractSections().map((section, index) => (
                        <div key={index} className="mb-6">
                          <h3 className="text-lg font-semibold mb-2 text-gray-800">
                            {section.title}
                          </h3>
                          <div className="prose prose-slate max-w-none">
                            {formatDecision(section.content)}
                          </div>
                        </div>
                      ))}
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
