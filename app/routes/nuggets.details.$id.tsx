import { useState, useEffect } from "react";
import { useParams, useNavigate, useLoaderData, Link } from "@remix-run/react";
import {
  MdArrowBack,
  MdContentCopy,
  MdBookmark,
  MdBookmarkBorder,
  MdShare,
  MdOutlineMenuBook,
  MdOutlineGavel,
  MdLabelOutline,
  MdOutlineCalendarToday,
  MdDescription,
} from "react-icons/md";
import { LoaderFunction, MetaFunction } from "@remix-run/node";
import axios from "axios";
import NuggetDrawer, { Nugget } from "~/components/NuggetDrawer";
import {
  Button,
  Tooltip,
  Divider,
  Chip,
  Avatar,
  Badge,
} from "@nextui-org/react";
import { recordNuggetView, recordResourceAccess } from "~/utils/api";
import { motion } from "framer-motion";

// Define the Nugget interface to fix the linter error
interface Nugget {
  id: number;
  title?: string;
  principle?: string;
  headnote?: string;
  quote?: string;
  dl_citation_no?: string;
  citation_no?: string;
  year?: string;
  judge_title?: string;
  judge?: any;
  judges?: string;
  status?: string;
  courts?: string;
  court_id?: number | string;
  judge_id?: number | string;
  keywords?: any;
  area_of_laws?: any;
  slug?: string;
  page_number?: string;
  other_citations?: string;
  file_url?: string;
  is_bookmarked?: boolean;
}

interface AreaOfLawDetail {
  id: number;
  name: string;
  display_name: string;
}

interface LoaderData {
  nugget: Nugget;
  baseUrl: string;
}

export const meta: MetaFunction<typeof loader> = ({ data }) => {
  if (!data) {
    return [
      { title: "Nugget Details | Dennislaw" },
      { name: "description", content: "View nugget details" },
    ];
  }

  const { nugget } = data;
  console.log(nugget);

  return [
    { title: `${nugget?.headnote || "Nugget Details"} | Dennislaw` },
    {
      name: "description",
      content: `${
        nugget?.principle?.substring(0, 160) || "Legal nugget details"
      }`,
    },
    {
      name: "og:title",
      content: `${nugget?.headnote || "Nugget Details"} | Dennislaw`,
    },
    {
      name: "og:description",
      content: `${
        nugget?.principle?.substring(0, 160) || "Legal nugget details"
      }`,
    },
  ];
};

const NuggetDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [copied, setCopied] = useState(false);

  const { nugget, baseUrl } = useLoaderData<LoaderData>();

  // Record view when component mounts
  useEffect(() => {
    if (nugget?.id) {
      recordNuggetView(nugget.id, baseUrl);
    }
  }, [nugget?.id, baseUrl]);

  useEffect(() => {
    setIsBookmarked(nugget?.is_bookmarked || false);
  }, [nugget?.is_bookmarked]);

  const openDrawer = () => setIsDrawerOpen(true);
  const closeDrawer = () => setIsDrawerOpen(false);

  const handleBookmarkChange = () => {
    setIsBookmarked(!isBookmarked);
    // Implement bookmark functionality here
  };

  const handleCopyPrinciple = () => {
    if (nugget?.principle) {
      const text = nugget.principle;
      const citation = nugget?.dl_citation_no  || '';
      const pageLink = window.location.href;
      
      const formattedText = `${text}\n\nSource: Dennislaw - ${citation}\nLink: ${pageLink}`;
      
      navigator.clipboard.writeText(formattedText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: nugget?.headnote || "Legal Nugget",
        text: nugget?.principle?.substring(0, 100) + "...",
        url: window.location.href,
      });
    } else {
      navigator.clipboard.writeText(window.location.href);
      alert("Link copied to clipboard!");
    }
  };

  const handleViewFullCase = () => {
    if (nugget?.dl_citation_no) {
      navigate(`/cases/${nugget.dl_citation_no}`);
    }
  };

  return (
    <motion.div
      className="max-w-6xl mx-auto p-4 sm:p-6 md:py-0 md:px-8"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4 }}
    >
      {/* Top Navigation & Actions Bar */}
      <div className="flex items-center justify-between mb-6">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-gray-600 hover:text-primary transition-all px-3 py-1.5 rounded-lg hover:bg-gray-100"
        >
          <MdArrowBack className="text-xl" />
          <span className="text-sm font-medium">Back</span>
        </button>

        <div className="flex items-center gap-2">
          <Tooltip
            content={isBookmarked ? "Remove bookmark" : "Bookmark nugget"}
          >
            <Button
              isIconOnly
              variant="light"
              size="sm"
              onClick={handleBookmarkChange}
              className={isBookmarked ? "text-primary" : "text-gray-500"}
            >
              {isBookmarked ? (
                <MdBookmark className="text-lg" />
              ) : (
                <MdBookmarkBorder className="text-lg" />
              )}
            </Button>
          </Tooltip>

          <Tooltip content="Share nugget">
            <Button
              isIconOnly
              variant="light"
              size="sm"
              onClick={handleShare}
              className="text-gray-500"
            >
              <MdShare className="text-lg" />
            </Button>
          </Tooltip>

          <Button
            variant="flat"
            color="primary"
            size="sm"
            onClick={handleViewFullCase}
            startContent={<MdOutlineMenuBook className="text-lg" />}
          >
            Full Case
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <div
        className={`transition-all duration-300 ${
          isDrawerOpen ? "pr-[400px]" : ""
        }`}
      >
        <article className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
          {/* Title Section with gradient header */}
          <div className="bg-gradient-to-r from-primary/5 to-secondary/5 border-b border-slate-200 p-6">
            <Badge
              // content="Legal Principle"
              color="secondary"
              size="sm"
              placement="top-right"
              className="absolute top-4 right-4"
            >
              <h1 className="text-2xl font-bold text-slate-800 pr-28">
                {nugget?.headnote}
              </h1>
            </Badge>
          </div>

          <div className="p-6">
            {/* Meta Information in Cards */}
            <div className="mt-4 bg-gray-50 p-4 rounded-lg border-l-4 border-gray-300 mb-8">
              {/* Quoted From Section */}
              <div className="flex justify-between items-center">
                <div>
                  <p className="text-gray-700 font-semibold">Quoted from:</p>
                  <p className="text-gray-500 text-xs italic">
                    Tap title below for full case
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  {nugget?.dl_citation_no && (
                    <Chip
                      variant="flat"
                      size="sm"
                      startContent={<MdDescription className="text-primary" />}
                      classNames={{
                        base: "bg-primary/10 text-primary-700 px-2",
                        content: "font-medium",
                      }}
                    >
                      {nugget.dl_citation_no}
                    </Chip>
                  )}
                  {nugget?.year && (
                    <Chip
                      variant="flat"
                      size="sm"
                      startContent={<MdOutlineCalendarToday />}
                      classNames={{
                        base: "bg-secondary-100 px-2",
                        content: "font-medium",
                      }}
                    >
                      {nugget.year}
                    </Chip>
                  )}
                </div>
              </div>

              {/* Title with Link */}
              <div className="mt-2">
                <button
                  onClick={handleViewFullCase}
                  className="text-sm font-medium text-blue-600 hover:underline"
                >
                  {nugget?.title}
                </button>

                <div className="flex items-center text-sm text-gray-500 mt-1">
                  <span className="font-medium">
                    {nugget?.dl_citation_no || nugget?.citation_no}
                  </span>
                  {nugget?.page_number && (
                    <span className="ml-2">at page {nugget.page_number}</span>
                  )}
                </div>
              </div>

              {/* Judge Information */}
              {(nugget?.judges || nugget?.judge) && (
                <div className="mt-3">
                  <Link
                    to={
                      nugget?.judge_id
                        ? `/nuggets/judges/${nugget.judge_id}`
                        : "#"
                    }
                    className="font-semibold hover:underline"
                  >
                    <span className="font-normal">by</span>{" "}
                    {nugget?.judges?.split(",")[0] ||
                      (nugget?.judge ? nugget.judge.fullname : "")}{" "}
                    {nugget?.judge_title}
                  </Link>
                </div>
              )}
            </div>

            {/* Principle */}
            <div className="mb-8">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-lg font-semibold text-slate-800">
                  Principle
                </h3>
                <Tooltip content={copied ? "Copied!" : "Copy principle"}>
                  <Button
                    isIconOnly
                    variant="light"
                    size="sm"
                    onPress={handleCopyPrinciple}
                    className="text-gray-500"
                  >
                    <MdContentCopy className="text-lg" />
                  </Button>
                </Tooltip>
              </div>
              <div className="bg-gradient-to-r from-slate-50 to-white p-5 rounded-lg border border-slate-200 shadow-sm">
                <p className="whitespace-pre-wrap text-slate-700 leading-relaxed">
                  {nugget?.principle}
                </p>
              </div>
            </div>
            {/* Area of Law */}
            {nugget?.area_of_laws && (
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-slate-800 mb-3">
                  Area of Law
                </h3>
                <div className="flex flex-wrap gap-2">
                  {Array.isArray(nugget.area_of_laws)
                    ? nugget.area_of_laws.map((areaOfLaw, index) => (
                        <Link
                          key={index}
                          to={`/nuggets/areas/${areaOfLaw.id}`}
                          className="px-3 py-1 bg-gray-100 text-gray-800 rounded-full text-sm hover:bg-secondary hover:text-white transition-colors"
                        >
                          {areaOfLaw.display_name}
                        </Link>
                      ))
                    : typeof nugget.area_of_laws === "string" &&
                      nugget.area_of_laws
                        ?.split(",")
                        .map((areaOfLaw, index) => (
                          <Link
                            key={index}
                            to={`/search?q=${areaOfLaw.trim()}`}
                            className="px-3 py-1 bg-gray-100 text-gray-800 rounded-full text-sm hover:bg-secondary hover:text-white transition-colors"
                          >
                            {areaOfLaw.trim()}
                          </Link>
                        ))}
                </div>
              </div>
            )}
            {/* Keywords */}
            {nugget?.keywords && (
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-slate-800 mb-3">
                  Keywords
                </h3>
                <div className="flex flex-wrap gap-2">
                  {Array.isArray(nugget.keywords)
                    ? nugget.keywords.map((keywordObj, index) => (
                        <Link
                          key={index}
                          to={`/search?q=${keywordObj?.keyword?.value}`}
                          className="px-3 py-1 bg-gray-100 text-gray-800 rounded-full text-sm hover:bg-secondary hover:text-white transition-colors"
                        >
                          {keywordObj?.keyword?.value}
                        </Link>
                      ))
                    : typeof nugget.keywords === "string" &&
                      nugget.keywords?.split(",").map((keyword, index) => (
                        <Link
                          key={index}
                          to={`/search?keyword=${keyword.trim()}`}
                          className="px-3 py-1 bg-gray-100 text-gray-800 rounded-full text-sm hover:bg-secondary hover:text-white transition-colors"
                        >
                          {keyword.trim()}
                        </Link>
                      ))}
                </div>
              </div>
            )}
          </div>
        </article>
      </div>

      {/* Nugget Drawer */}
      {/* <NuggetDrawer
        isOpen={isDrawerOpen}
        onClose={closeDrawer}
        nugget={nugget}
        onBookmarkChange={handleBookmarkChange}
        baseUrl={baseUrl}
      /> */}
    </motion.div>
  );
};

export default NuggetDetails;

export const loader: LoaderFunction = async ({ params, request }) => {
  const url = new URL(request.url);
  const searchParams = new URLSearchParams(url.search);
  const { id } = params;

  const baseUrl = process.env.NEXT_PUBLIC_DL_LIVE_URL;
  try {
    const response = await axios.get(`${baseUrl}/nugget/${id}`);

    // Map API response to match the Nugget interface if needed
    const nuggetData = response.data?.data || {};

    // Handle potential differences in API response format
    const nugget: Nugget = {
      id: nuggetData.id,
      title: nuggetData.title || nuggetData.case_title,
      principle: nuggetData.principle,
      headnote: nuggetData.headnote,
      quote: nuggetData.quote,
      dl_citation_no: nuggetData.dl_citation_no,
      citation_no: nuggetData.citation_no,
      year: nuggetData.year,
      judge_title: nuggetData.judge_title,
      judge: nuggetData.judge,
      status: nuggetData.status,
      courts: nuggetData.courts,
      keywords: nuggetData.keywords,
      area_of_laws: nuggetData.area_of_laws,
      slug: nuggetData.slug,
      page_number: nuggetData.page_number,
      other_citations: nuggetData.other_citations,
      file_url: nuggetData.file_url,
      is_bookmarked: nuggetData.is_bookmarked,
    };

    return {
      nugget,
      baseUrl,
    };
  } catch (error) {
    console.log(error);
    throw new Error("Failed to fetch nugget details");
  }
};
