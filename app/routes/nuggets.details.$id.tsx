import { useState, useEffect } from "react";
import { useParams, useNavigate, useLoaderData, Link } from "@remix-run/react";
import { MdArrowBack } from "react-icons/md";
import { LoaderFunction, MetaFunction } from "@remix-run/node";
import axios from "axios";
import NuggetDrawer, { Nugget } from "~/components/NuggetDrawer";
import { Button } from "@nextui-org/react";
import { recordNuggetView, recordResourceAccess } from "~/utils/api";
import { recordResourceAccess as oldRecordResourceAccess } from "../utils/tracking";

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

  const { nugget, baseUrl } = useLoaderData<LoaderData>();

  // Record view when component mounts
  useEffect(() => {
    if (nugget?.id) {
      recordNuggetView(nugget.id, baseUrl);
    }
  }, [nugget?.id, baseUrl]);

  const openDrawer = () => {
    setIsDrawerOpen(true);
  };

  const closeDrawer = () => {
    setIsDrawerOpen(false);
  };

  const handleBookmarkChange = () => {
    // Reload data if needed after bookmark change
    // This could be implemented to update the UI
  };

  // Handle navigation to judge page with tracking
  const handleJudgeClick = (judgeId: number | string) => {
    if (judgeId) {
      recordResourceAccess(baseUrl, "judge", judgeId);
    }
  };

  // Handle navigation to court page with tracking
  const handleCourtClick = (courtId: number | string) => {
    if (courtId) {
      recordResourceAccess(baseUrl, "court", courtId);
    }
  };

  return (
    <div className="flex transition-all duration-300">
      {/* Main Content Area */}
      <div
        className={`flex-1 p-2 overflow-x-hidden transition-all duration-300 ${
          isDrawerOpen ? "pr-[400px]" : ""
        }`}
      >
        {/* Back Button and Title */}
        <div className="flex items-center gap-2 mb-4">
          <button
            onClick={() => navigate(-1)}
            className="text-gray-600 hover:text-primary transition-all duration-300"
          >
            <MdArrowBack className="text-2xl" />
          </button>
          {/* <h1 className="font-montserrat font-bold text-xl md:text-2xl">
            {nugget?.headnote || "Nugget Details"}
          </h1> */}
        </div>

        {/* Nugget Detail Card */}
        <div className="bg-white rounded-xl shadow-sm border border-black/10 p-6 mb-6">
          {/* Nugget Header */}
          <div className="mb-6">
            <h2 className="text-xl font-bold text-primary mb-4">
              {nugget?.headnote}
            </h2>

            {/* Meta Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 text-sm">
              <div>
                <span className="font-semibold text-gray-700">Case:</span>{" "}
                <span>{nugget?.case_title || nugget?.title}</span>
              </div>
              <div>
                <span className="font-semibold text-gray-700">Citation:</span>{" "}
                <span>
                  {nugget?.dl_citation_no ||
                    nugget?.case_citation ||
                    nugget?.citation_no}
                </span>
              </div>
              <div>
                <span className="font-semibold text-gray-700">Year:</span>{" "}
                <span>{nugget?.year}</span>
              </div>
              <div>
                <span className="font-semibold text-gray-700">Court:</span>{" "}
                <span>{nugget?.courts}</span>
              </div>
              <div>
                <span className="font-semibold text-gray-700">Judge:</span>{" "}
                <span>
                  {nugget?.judges ||
                    (nugget?.judge ? nugget.judge.fullname : "")}
                </span>
              </div>
              <div>
                <span className="font-semibold text-gray-700">
                  Area of Law:
                </span>
                <Link
                  to={`/nuggets/areas/${nugget?.area_of_law?.split(",")[0]}`}
                  className="text-secondary hover:underline"
                >
                  {nugget?.area_of_law}
                </Link>
              </div>
            </div>
          </div>

          {/* Principle */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold mb-2">Principle</h3>
            <div className="bg-gray-50 p-4 rounded-lg  shadow-lg">
              <p className="whitespace-pre-wrap">{nugget?.principle}</p>
            </div>
          </div>

          {/* Keywords */}
          {nugget?.keywords && (
            <div className="mb-6">
              <h3 className="text-lg font-semibold mb-2">Keywords</h3>
              <div className="flex flex-wrap gap-2">
                {Array.isArray(nugget.keywords)
                  ? nugget.keywords.map((keywordObj, index) => (
                      <Link
                        key={index}
                        to={`/search?keyword=${keywordObj.keyword.value}`}
                        className="px-3 py-1 bg-gray-100 text-gray-800 rounded-full text-sm hover:bg-secondary hover:text-white transition-colors"
                      >
                        {keywordObj.keyword.value}
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

          {/* Additional Actions */}
          <div className="mt-8 flex flex-wrap gap-4">
            <button
              className="px-4 py-2 bg-primary text-white rounded hover:bg-primary-dark transition-colors"
              onClick={() => window.print()}
            >
              Print Nugget
            </button>

            <Button className="bg-secondary text-white" onClick={openDrawer}>
              View in Drawer
            </Button>

            {nugget?.judge_id && (
              <Link
                to={`/nuggets/judges/${nugget.judge_id}`}
                className="px-4 py-2 bg-secondary text-white rounded hover:bg-secondary-dark transition-colors"
                onClick={() => handleJudgeClick(nugget.judge_id)}
              >
                More by{" "}
                {nugget?.judges?.split(",")[0] ||
                  (nugget?.judge ? nugget.judge.fullname : "")}
              </Link>
            )}

            {nugget?.courts && (
              <Link
                to={`/nuggets/courts/${nugget?.courts?.split(",")[0]}`}
                className="px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300 transition-colors"
                onClick={() => handleCourtClick(nugget?.courts?.split(",")[0])}
              >
                More from {nugget?.courts?.split(",")[0]}
              </Link>
            )}
          </div>
        </div>

        {/* Related Nuggets Section (Placeholder) */}
        {/* <div className="bg-white rounded-xl shadow-sm border border-black/10 p-6">
          <h3 className="text-lg font-semibold mb-4">Related Nuggets</h3>
          <p className="text-gray-500">
            Related nuggets will be displayed here in future updates.
          </p>
        </div> */}
      </div>

      {/* Nugget Drawer */}
      <NuggetDrawer
        isOpen={isDrawerOpen}
        onClose={closeDrawer}
        nugget={nugget}
        onBookmarkChange={handleBookmarkChange}
        baseUrl={baseUrl}
      />
    </div>
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
    console.log("Nugget details:", response?.data?.data);

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
