import { useState } from "react";
import { useParams, useNavigate, useLoaderData, Link } from "@remix-run/react";
import { MdArrowBack } from "react-icons/md";
import { LoaderFunction, MetaFunction } from "@remix-run/node";
import axios from "axios";

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
      { title: "Area of Law | Dennis Law" },
      { name: "description", content: "View nuggets by area of law" },
    ];
  }

  const { details } = data;
  return [
    { title: `${details?.display_name || "Area of Law"} | Dennis Law` },
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

  const { nugget, baseUrl } = useLoaderData<LoaderData>();

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
            onClick={() => navigate("/nuggets")}
            className="text-gray-600 hover:text-primary transition-all duration-300"
          >
            <MdArrowBack className="text-2xl" />
          </button>
          <p className="font-montserrat font-bold text-xl">
            {nugget?.headnote || "Nugget Details"}
          </p>
        </div>

        {/* Grid Layout for Sub-Nuggets */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-6 bg-white rounded-xl shadow-sm border border-black/10 p-4">
          <p>data</p>
        </div>
      </div>
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
    const response = await axios.get(`${baseUrl}/nugget/${id}`);
    console.log(response?.data?.data);

    return {
      nugget: response.data?.data || {},
      baseUrl,
    };
  } catch (error) {
    console.log(error);

    throw new Error("Failed to fetch area of law nuggets");
  }
};
