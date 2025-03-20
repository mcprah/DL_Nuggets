import { Link, useLoaderData, useNavigate } from "@remix-run/react";
import { MdArrowRight } from "react-icons/md";
import axios from "axios";
import { LoaderFunction, MetaFunction } from "@remix-run/node";
import { Pagination } from "@nextui-org/react";

// Define types for our data
interface AreaOfLaw {
  id: number;
  name: string;
  display_name: string;
  value?: string;
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
  currentPage: number;
  totalPages: number;
  perPage: number;
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
  const { areaOfLaw, currentPage, totalPages, perPage } =
    useLoaderData<LoaderData>();

  const navigate = useNavigate();

  console.log(areaOfLaw);

  return (
    <div className="">
      {/* <div className="mb-6 flex flex-col space-y-2">
        <h1 className="text-2xl font-bold">Areas of Law</h1>
        <p className="text-gray-600">
          Browse nuggets by area of law, or explore by{" "}
          <Link to="/nuggets/courts" className="text-primary hover:underline">
            courts
          </Link>{" "}
          or{" "}
          <Link to="/nuggets/judges" className="text-primary hover:underline">
            judges
          </Link>
          .
        </p>
      </div> */}

      <div className="flex flex-col lg:grid lg:grid-cols-4 gap-4 bg-white p-4 shadow-sm rounded-xl border border-black/5">
        {areaOfLaw.data.map((area) => (
          <Link
            key={area.id}
            to={`/nuggets/area-of-law/${area.id}`}
            className="bg-white border border-black/10 flex justify-between p-3 rounded-lg shadow-sm cursor-pointer hover:bg-gray-100 transition-all duration-300"
          >
            <p className="text-black">{area?.value}</p>
            <MdArrowRight className="text-xl text-gray-700" />
          </Link>
        ))}
      </div>

      {totalPages > 1 && (
        <div className="flex justify-center mt-6">
          <Pagination
            color="primary"
            page={currentPage}
            total={Math.ceil(totalPages / perPage)}
            showControls
            onChange={(page) => navigate(`/nuggets?page=${page}`)}
          />
        </div>
      )}
    </div>
  );
};

export default AreaOfLaw;

export const loader: LoaderFunction = async ({ request }) => {
  const url = new URL(request.url);
  const searchParams = new URLSearchParams(url.search);
  const page = searchParams.get("page") || "1";

  const baseUrl = process.env.NEXT_PUBLIC_DL_LIVE_URL;
  try {
    const response = await axios.get(
      `${baseUrl}/area-of-law?limit=16&page=${page}&`
    );
    return {
      areaOfLaw: response.data,
      baseUrl,
      currentPage: parseInt(response.data.meta.current_page),
      totalPages: parseInt(response.data?.meta?.total),
      perPage: parseInt(response.data?.meta?.per_page),
    };
  } catch (error) {
    throw new Error("Failed to fetch areas of law");
  }
};
