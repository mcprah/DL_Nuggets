import { Link, useLoaderData } from "@remix-run/react";
import { MdArrowRight } from "react-icons/md";
import axios from "axios";
import { LoaderFunction, MetaFunction } from "@remix-run/node";

// Define types for our data
interface AreaOfLaw {
  id: number;
  name: string;
  display_name: string;
}

interface PaginatedResponse {
  current_page: number;
  data: AreaOfLaw[];
  first_page_url: string;
  from: number;
  last_page: number;
  last_page_url: string;
  next_page_url: string | null;
  path: string;
  per_page: number;
  prev_page_url: string | null;
  to: number;
  total: number;
}

interface LoaderData {
  areaOfLaw: PaginatedResponse;
  baseUrl: string;
}

export const meta: MetaFunction = () => {
  return [
    { title: "Areas of Law | Dennislaw" },
    {
      name: "description",
      content: "Browse nuggets by different areas of law",
    },
    { name: "og:title", content: "Areas of Law | Dennislaw" },
    {
      name: "og:description",
      content: "Explore legal principles categorized by different areas of law",
    },
    {
      tagName: "link",
      rel: "canonical",
      href: "https://dennislaw.com/nuggets",
    },
  ];
};

const AreaOfLaw = () => {
  const { areaOfLaw } = useLoaderData<LoaderData>();

  return (
    <div className="">
      <div className="flex flex-col lg:grid lg:grid-cols-4 gap-4 bg-white p-4 shadow-sm rounded-xl border border-black/5">
        {areaOfLaw.data.map((area) => (
          <Link
            key={area.id}
            to={`/nuggets/${area.id}`}
            className="bg-white border border-black/10 flex justify-between p-3 rounded-lg shadow-sm cursor-pointer hover:bg-gray-100 transition-all duration-300"
          >
            <p className="text-black">{area.value}</p>
            <MdArrowRight className="text-xl text-gray-700" />
          </Link>
        ))}
      </div>
    </div>
  );
};

export default AreaOfLaw;

export const loader: LoaderFunction = async () => {
  const baseUrl = process.env.NEXT_PUBLIC_DL_LIVE_URL;
  try {
    const response = await axios.get(`${baseUrl}/area-of-law`);
    return {
      areaOfLaw: response.data,
      baseUrl,
    };
  } catch (error) {
    throw new Error("Failed to fetch areas of law");
  }
};
