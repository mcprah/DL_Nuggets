import { useState, useEffect } from "react";
import { Link, useLoaderData } from "@remix-run/react";
import { MdArrowRight } from "react-icons/md";
import axios from "axios";
import { LoaderFunction, MetaFunction } from "@remix-run/node";

// Define types for our data
interface Court {
  id: number;
  name: string;
}

interface PaginatedResponse {
  current_page: number;
  data: Court[];
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
  courts: PaginatedResponse;
  baseUrl: string;
}

export const meta: MetaFunction = () => {
  return [
    { title: "Courts | Dennislaw" },
    {
      name: "description",
      content: "Browse nuggets by different courts and jurisdictions",
    },
    { name: "og:title", content: "Courts | Dennislaw" },
    {
      name: "og:description",
      content: "Access nuggets by different courts and judicial bodies",
    },
    {
      tagName: "link",
      rel: "canonical",
      href: "https://dennislaw.com/nuggets/courts",
    },
  ];
};

const Courts = () => {
  const { courts } = useLoaderData<LoaderData>();

  return (
    <div className="">
      <div className="lg:grid lg:grid-cols-4 gap-4 bg-white p-4 shadow-sm rounded-xl border border-black/5">
        {courts.data.map((court) => (
          <Link
            key={court.id}
            to={`/nuggets/courts/${court.id}`}
            className="bg-white border border-black/10 flex justify-between p-3 rounded-lg shadow-sm cursor-pointer hover:bg-gray-100 transition-all duration-300"
          >
            <p className="text-black">{court.name}</p>
            <MdArrowRight className="text-xl text-gray-700" />
          </Link>
        ))}
      </div>
    </div>
  );
};

export default Courts;

export const loader: LoaderFunction = async () => {
  const baseUrl = process.env.NEXT_PUBLIC_DL_LIVE_URL;
  try {
    const response = await axios.get(`${baseUrl}/courts`);
    return {
      courts: response.data,
      baseUrl,
    };
  } catch (error) {
    throw new Error("Failed to fetch courts");
  }
};
