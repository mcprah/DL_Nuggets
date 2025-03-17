import { useState, useEffect } from "react";
import { Link, Outlet, useLoaderData } from "@remix-run/react";
import { MdArrowRight } from "react-icons/md";
import axios from "axios";
import { LoaderFunction } from "@remix-run/node";

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

const Judges = () => {
  return (
    <div className="">
      <Outlet />
    </div>
  );
};

export default Judges;
