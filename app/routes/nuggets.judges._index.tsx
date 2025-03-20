import { useState, useEffect } from "react";
import { Link, useLoaderData } from "@remix-run/react";
import { MdArrowRight } from "react-icons/md";
import axios from "axios";
import { LoaderFunction, MetaFunction } from "@remix-run/node";

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
  const { judges } = useLoaderData<LoaderData>();

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
    </div>
  );
};

export default Judges;

export const loader: LoaderFunction = async () => {
  const baseUrl = process.env.NEXT_PUBLIC_DL_LIVE_URL;
  try {
    const response = await axios.get(`${baseUrl}/judges`);
    return {
      judges: response.data,
      baseUrl,
    };
  } catch (error) {
    throw new Error("Failed to fetch judges");
  }
};
