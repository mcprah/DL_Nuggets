import { useState } from "react";
import { useParams, useNavigate, useLoaderData, Link } from "@remix-run/react";
import { MdArrowBack } from "react-icons/md";
import { Pagination } from "@nextui-org/react";
import { LoaderFunction, MetaFunction } from "@remix-run/node";
import axios from "axios";
import NuggetDrawer, { Nugget } from "~/components/NuggetDrawer";
import NuggetCard from "~/components/NuggetCard";

interface AreaOfLawDetail {
  id: number;
  name: string;
  display_name: string;
}

interface LoaderData {
  details: AreaOfLawDetail;
  nuggets: Nugget[];
  baseUrl: string;
  currentPage: number;
  totalPages: number;
  perPage: number;
}

export const meta: MetaFunction<typeof loader> = ({ data }) => {
  if (!data) {
    return [
      { title: "Area of Law | Dennislaw" },
      { name: "description", content: "View nuggets by area of law" },
    ];
  }

  const { details } = data;
  return [
    { title: `${details?.display_name || "Area of Law"} | Dennislaw` },
    {
      name: "description",
      content: `Legal nuggets related to ${
        details?.display_name || "area of law"
      }`,
    },
  ];
};

const AreaOfLawDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [selectedSubNugget, setSelectedSubNugget] = useState<Nugget | null>(
    null
  );

  const { details, nuggets, baseUrl, currentPage, totalPages, perPage } =
    useLoaderData<LoaderData>();

  // Open drawer with selected sub-nugget details
  const openDrawer = (subNugget: Nugget) => {
    setSelectedSubNugget(subNugget);
    setIsDrawerOpen(true);
  };

  // Close drawer
  const closeDrawer = () => {
    setIsDrawerOpen(false);
  };

  return (
    <div className="flex transition-all duration-300">
      {/* Main Content Area */}
      <div
        className={`p-2 overflow-x-hidden transition-all duration-300 overflow-y-hidden ${
          isDrawerOpen ? "w-full sm:w-1/3 md:w-3/6 lg:w-2xl" : "flex-1"
        }`}
      >
        {/* Back Button and Title */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => navigate("/nuggets")}
            className="text-gray-600 hover:text-primary transition-all duration-300"
          >
            <MdArrowBack className="text-2xl" />
          </button>
          <p className="font-montserrat font-bold text-xl">
            {details?.display_name || "Area of Law Details"}
          </p>
        </div>

        {/* Grid Layout for Sub-Nuggets */}
        <div
          className={`grid grid-cols-1 sm:grid-cols-1 gap-4 mt-6 bg-white rounded-xl shadow-sm border border-black/10 p-4 ${
            isDrawerOpen ? "lg:grid-cols-2" : "lg:grid-cols-3"
          }`}
        >
          {nuggets.length > 0 ? (
            nuggets.map((nugget: Nugget) => (
              <NuggetCard
                key={nugget.id}
                nugget={nugget}
                isSelected={selectedSubNugget?.id === nugget.id && isDrawerOpen}
                onClick={openDrawer}
              />
            ))
          ) : (
            <p className="text-gray-500">No related nuggets available.</p>
          )}
        </div>

        <div className="flex justify-center mt-6">
          <Pagination
            color="primary"
            page={currentPage}
            total={Math.ceil(totalPages / perPage)}
            showControls
            onChange={(page) => navigate(`/nuggets/${id}?page=${page}`)}
          />
        </div>
      </div>

      {/* Use the NuggetDrawer component */}
      <NuggetDrawer
        isOpen={isDrawerOpen}
        onClose={closeDrawer}
        nugget={selectedSubNugget}
        parentName={details?.display_name}
        parentType="area"
        baseUrl={baseUrl}
      />
    </div>
  );
};

export default AreaOfLawDetails;

export const loader: LoaderFunction = async ({ params, request }) => {
  const url = new URL(request.url);
  const searchParams = new URLSearchParams(url.search);
  const page = searchParams.get("page") || "1";
  const limit = searchParams.get("limit") || "9";
  const { id } = params;

  const baseUrl = process.env.NEXT_PUBLIC_DL_LIVE_URL;
  try {
    const response = await axios.get(
      `${baseUrl}/nuggets/area-of-law/${id}?page=${page}&limit=${limit}`
    );

    return {
      details: response.data?.data[0]?.area_of_laws?.[0]?.area_of_law || null,
      nuggets: response.data?.data || [],
      baseUrl,
      currentPage: parseInt(page),
      totalPages: parseInt(response.data?.meta?.total),
      perPage: parseInt(response.data?.meta?.per_page),
    };
  } catch (error) {
    throw new Error("Failed to fetch area of law nuggets");
  }
};
