import { useState } from "react";
import { useParams, useNavigate, useLoaderData } from "@remix-run/react";
import { MdArrowBack } from "react-icons/md";
import { Pagination } from "@nextui-org/react";
import { LoaderFunction, MetaFunction } from "@remix-run/node";
import axios from "axios";
import NuggetDrawer, { Nugget } from "~/components/NuggetDrawer";
import NuggetCard from "~/components/NuggetCard";

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

export const meta: MetaFunction = ({ data, params }) => {
  if (!data) {
    return [
      { title: "Court Nuggets | Dennislaw" },
      { name: "description", content: "View nuggets by court" },
    ];
  }

  const { details, court } = data as LoaderData;
  const courtData = details || court;
  return [
    { title: `${courtData?.name || "Court"} | Dennislaw` },
    {
      name: "description",
      content: `Legal nuggets from ${courtData?.name || "court"}`,
    },
    { name: "og:title", content: `${courtData?.name || "Court"} | Dennislaw` },
    {
      name: "og:description",
      content: `Browse legal nuggets from ${courtData?.name || "court"}`,
    },
    {
      tagName: "link",
      rel: "canonical",
      href: `https://dennislaw.com/nuggets/courts/${params.id}`,
    },
  ];
};

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
        className={`flex-1 p-2 overflow-x-hidden transition-all duration-300 overflow-y-hidden ${
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
            nuggets.map((nugget: Nugget) => (
              <NuggetCard
                key={nugget.id}
                nugget={nugget}
                isSelected={selectedSubNugget?.id === nugget.id}
                onClick={openDrawer}
              />
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
