import { useState } from "react";
import { useParams, useNavigate, useLoaderData } from "@remix-run/react";
import { MdArrowBack } from "react-icons/md";
import { Pagination } from "@nextui-org/react";
import { LoaderFunction } from "@remix-run/node";
import axios from "axios";
import NuggetDrawer, { Nugget } from "~/components/NuggetDrawer";

interface Court {
  id: number;
  name: string;
}

interface LoaderData {
  details: Court;
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

  // Close drawer
  const closeDrawer = () => {
    setIsDrawerOpen(false);
  };

  const { details, court, nuggets, baseUrl, currentPage, totalPages, perPage } =
    useLoaderData<LoaderData>();

  const courtData = details || court;

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
            {courtData?.name || "Court Details"}
          </p>
        </div>
        {/* Grid Layout for Sub-Nuggets */}

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-6 bg-white rounded-xl shadow-sm border border-black/10 p-4">
          {nuggets.length > 0 ? (
            nuggets.map((nugget: Nugget, index: number) => (
              <div
                key={nugget.id}
                className={`p-4 border rounded-lg bg-gray-50 shadow-sm cursor-pointer transition-all duration-300 hover:shadow-md ${
                  selectedSubNugget?.id === nugget.id
                    ? "border-primary"
                    : "hover:bg-gray-100"
                }`}
                onClick={() => openDrawer(nugget)}
              >
                <div className="flex justify-between items-start mb-2">
                  <span className="text-xs bg-blue-50 text-blue-800 px-2 py-1 rounded-full">
                    {nugget.status || "Published"}
                  </span>
                  <span className="text-xs bg-gray-200 px-2 py-1 rounded-full">
                    {nugget.year}
                  </span>
                </div>

                <p className="font-semibold line-clamp-3">
                  {nugget.headnote || nugget.title}
                </p>
                <p className="text-sm mt-1 line-clamp-3 text-gray-600">
                  {nugget.principle}
                </p>

                <div className="mt-2 flex justify-between items-center">
                  <span className="text-xs text-gray-500">
                    {nugget.citation_no || nugget.dl_citation_no}
                  </span>

                  {nugget.judge && (
                    <span className="text-xs text-gray-500 italic">
                      {nugget.judge.fullname}
                    </span>
                  )}
                </div>

                {nugget.keywords && nugget.keywords.length > 0 && (
                  <div className="mt-2 flex flex-wrap gap-1">
                    {nugget.keywords.slice(0, 2).map((keywordObj, idx) => (
                      <span
                        key={idx}
                        className="text-xs bg-gray-100 px-2 py-0.5 rounded-full"
                      >
                        {keywordObj?.keyword?.value || "No keywords"}
                      </span>
                    ))}
                    {nugget.keywords.length > 2 && (
                      <span className="text-xs text-gray-500">
                        +{nugget.keywords.length - 2} more
                      </span>
                    )}
                  </div>
                )}
              </div>
            ))
          ) : (
            <p className="text-gray-500">No related nuggets available.</p>
          )}
        </div>

        <div className="flex justify-center mt-6">
          <Pagination
            color="secondary"
            page={currentPage}
            total={Math.ceil(totalPages / perPage)}
            showControls
            onChange={(page) => navigate(`/nuggets/courts/${id}?page=${page}`)}
          />
        </div>
      </div>

      {/* Use the NuggetDrawer component */}
      <NuggetDrawer
        isOpen={isDrawerOpen}
        onClose={closeDrawer}
        nugget={selectedSubNugget}
        parentName={courtData?.name}
        parentType="court"
        baseUrl={baseUrl}
      />
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
