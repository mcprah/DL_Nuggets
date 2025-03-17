import { useState } from "react";
import { useParams, useNavigate, useLoaderData } from "@remix-run/react";
import { MdArrowBack } from "react-icons/md";
import { Pagination } from "@nextui-org/react";
import { LoaderFunction } from "@remix-run/node";
import axios from "axios";

interface Nugget {
  id: number;
  title: string;
  principle: string;
  source?: string;
  description?: string;
  keywords?: string[];
}

interface Court {
  id: number;
  name: string;
}

interface LoaderData {
  court: Court;
  nuggets: Nugget[];
  baseUrl: string;
  currentPage: number;
  totalPages: number;
  perPage: number;
}

const CourtDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [selectedSubNugget, setSelectedSubNugget] = useState<Nugget | null>(
    null
  );

  // Open drawer with selected sub-nugget details
  const openDrawer = (subNugget: Nugget) => {
    setSelectedSubNugget(subNugget);
    setIsDrawerOpen(true);
  };

  const { court, nuggets, baseUrl, currentPage, totalPages, perPage } =
    useLoaderData<LoaderData>();

  return (
    <div className="flex transition-all duration-300">
      {/* Main Content Area */}
      <div
        className={`flex-1 p-2 overflow-x-hidden transition-all duration-300 ${
          isDrawerOpen ? "pr-[400px]" : ""
        }`}
      >
        {/* Back Button and Title */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => navigate("/nuggets/courts")}
            className="text-gray-600 hover:text-primary transition-all duration-300"
          >
            <MdArrowBack className="text-2xl" />
          </button>
          <p className="font-montserrat font-bold text-xl">
            {court?.name || "Court Details"}
          </p>
        </div>
        {/* Grid Layout for Sub-Nuggets */}

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-6 bg-white rounded-xl shadow-sm border border-black/10 p-4">
          {nuggets.length > 0 ? (
            nuggets.map((nugget: Nugget, index: number) => (
              <div
                key={nugget.id}
                className={`p-4 border rounded-lg bg-gray-50 shadow-sm cursor-pointer transition-all duration-300 ${
                  selectedSubNugget?.id === nugget.id
                    ? "border-primary"
                    : "hover:bg-gray-100"
                }`}
                onClick={() => openDrawer(nugget)}
              >
                <p className="font-bold line-clamp-3">{nugget.title}</p>
                <p className="text-sm mt-1 line-clamp-3">{nugget.principle}</p>
              </div>
            ))
          ) : (
            <p className="text-gray-500">No related nuggets available.</p>
          )}
        </div>

        <div className="flex flex-col gap-5 mt-2">
          <Pagination
            color="secondary"
            page={currentPage}
            total={Math.ceil(totalPages / perPage)}
            showControls
            onChange={(page) => navigate(`/nuggets/courts/${id}?page=${page}`)}
          />
        </div>
      </div>

      {/* Drawer - Full Preview */}
      <div
        className={`fixed right-0 top-0 h-full w-[400px] bg-white shadow-lg transition-transform duration-300 border-l ${
          isDrawerOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        {isDrawerOpen && selectedSubNugget && (
          <div className="p-6 flex flex-col h-full">
            {/* Close Button */}
            <button
              className="text-gray-600 hover:text-primary self-end"
              onClick={() => setIsDrawerOpen(false)}
            >
              ✕ Close
            </button>

            {/* Source Quote */}
            <p className="text-sm text-gray-500 mt-4">
              <strong>QUOTE FROM:</strong>
              <br />
              {selectedSubNugget.source || "Unknown Source"}
            </p>

            {/* Nugget Title */}
            <h2 className="font-bold text-xl mt-4">
              {selectedSubNugget.title}
            </h2>

            {/* Description */}
            <p className="text-gray-700 mt-2">
              {selectedSubNugget.description || selectedSubNugget.principle}
            </p>

            {/* Tags & Keywords */}
            <div className="mt-4 flex gap-2 flex-wrap">
              {selectedSubNugget.keywords?.map(
                (keyword: string, index: number) => (
                  <span
                    key={index}
                    className="bg-gray-200 px-3 py-1 rounded-full text-sm text-gray-700"
                  >
                    {keyword}
                  </span>
                )
              )}
            </div>

            {/* Metadata */}
            <div className="mt-6">
              <p className="text-sm text-gray-500">Court</p>
              <p className="font-semibold">{court?.name}</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CourtDetails;

export const loader: LoaderFunction = async ({ params, request }) => {
  const url = new URL(request.url);
  const searchParams = new URLSearchParams(url.search);
  const page = searchParams.get("page") || "1";
  const limit = searchParams.get("limit") || "9";
  const { id } = params;

  const baseUrl = process.env.NEXT_PUBLIC_DL_LIVE_URL;
  try {
    const response = await axios.get(
      `${baseUrl}/nuggets/court/${id}?page=${page}&limit=${limit}`
    );

    console.log(response.data?.data[0]);

    return {
      details: response.data?.data[0]?.court || null,
      court: response.data?.data[0]?.court || null,
      nuggets: response.data?.data || [],
      baseUrl,
      currentPage: parseInt(page),
      totalPages: parseInt(response.data?.meta?.total),
      perPage: parseInt(response.data?.meta?.per_page),
    };
  } catch (error) {
    throw new Error("Failed to fetch court nuggets");
  }
};
