import { useState, useEffect } from "react";
import { Link, useLoaderData, useNavigate } from "@remix-run/react";
import { MdArrowRight } from "react-icons/md";
import axios from "axios";
import { LoaderFunction, MetaFunction } from "@remix-run/node";
import { Pagination } from "@nextui-org/react";

// Define types for our data
interface Judge {
  id: number;
  fullname: string;
}

interface PaginatedResponse {
  current_page: number;
  data: Judge[];
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
  judges: PaginatedResponse;
  baseUrl: string;
  currentPage: number;
  totalPages: number;
  perPage: number;
}

export const meta: MetaFunction = () => {
  return [
    { title: "Judges | Dennislaw" },
    {
      name: "description",
      content: "Browse nuggets by different judges and justices",
    },
    { name: "og:title", content: "Judges | Dennislaw" },
    {
      name: "og:description",
      content: "Find legal principles from notable judges and justices",
    },
    {
      tagName: "link",
      rel: "canonical",
      href: "https://dennislaw.com/nuggets/judges",
    },
  ];
};

const Judges = () => {
  const { judges, currentPage, totalPages, perPage } =
    useLoaderData<LoaderData>();
  const navigate = useNavigate();

  return (
    <div className="">
      <div className="lg:grid lg:grid-cols-4 gap-4 bg-white p-4 shadow-sm rounded-xl border border-black/5">
        {judges.data.map((judge) => (
          <Link
            key={judge.id}
            to={`/nuggets/judges/${judge.id}`}
            className="bg-white border border-black/10 flex justify-between p-3 rounded-lg shadow-sm cursor-pointer hover:bg-gray-100 transition-all duration-300"
          >
            <p className="text-black">{judge.fullname}</p>
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
            onChange={(page) => navigate(`/nuggets/judges?page=${page}`)}
          />
        </div>
      )}
    </div>
  );
};

export default Judges;

export const loader: LoaderFunction = async ({ request }) => {
  const url = new URL(request.url);
  const searchParams = new URLSearchParams(url.search);
  const page = searchParams.get("page") || "1";

  const baseUrl = process.env.NEXT_PUBLIC_DL_LIVE_URL;
  try {
    const response = await axios.get(`${baseUrl}/judges?limit=16&page=${page}`);
    return {
      judges: response.data,
      baseUrl,
      currentPage: parseInt(response.data.meta.current_page),
      totalPages: parseInt(response.data?.meta?.total),
      perPage: parseInt(response.data?.meta?.per_page),
    };
  } catch (error) {
    throw new Error("Failed to fetch judges");
  }
};
