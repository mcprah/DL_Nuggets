import { useState, useEffect } from "react";
import { Link, Outlet, useLoaderData } from "@remix-run/react";
import { MdArrowRight } from "react-icons/md";
import axios from "axios";
import { LoaderFunction } from "@remix-run/node";

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

const Courts = () => {
  return (
    <div className="">
      <Outlet />
    </div>
  );
};

export default Courts;
