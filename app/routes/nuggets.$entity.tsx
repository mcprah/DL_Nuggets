import { Outlet } from "@remix-run/react";
import { LoaderFunction } from "@remix-run/node";
import axios from "axios";

// Define generic types to handle both judges and courts
interface EntityItem {
  id: number;
  name?: string;
  fullname?: string;
  display_name?: string;
}

interface PaginatedResponse {
  current_page: number;
  data: EntityItem[];
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
  entities: PaginatedResponse;
  baseUrl: string;
  entityType: string;
}

// Export function to fetch loader data
export async function getLoaderData(params: any, request?: Request) {
  const { entity } = params;

  // Handle invalid entity type
  if (!entity || !["courts", "judges", "area-of-law"].includes(entity)) {
    throw new Error(`Invalid entity type: ${entity}`);
  }

  const baseUrl = process.env.NEXT_PUBLIC_DL_LIVE_URL;

  // Handle pagination if request is provided
  let page = "1";
  if (request) {
    const url = new URL(request.url);
    const searchParams = new URLSearchParams(url.search);
    page = searchParams.get("page") || "1";
  }

  try {
    // Determine the API endpoint based on entity type
    let endpoint;
    if (entity === "area-of-law") {
      endpoint = `${baseUrl}/area-of-law?page=${page}`;
    } else {
      endpoint = `${baseUrl}/${entity}?page=${page}`;
    }

    const response = await axios.get(endpoint);

    return {
      entities: response.data,
      baseUrl,
      entityType: entity,
    };
  } catch (error) {
    throw new Error(`Failed to fetch ${entity}`);
  }
}

export const loader: LoaderFunction = async ({ params, request }) => {
  return getLoaderData(params, request);
};

const EntityContainer = () => {
  return (
    <div className="">
      <Outlet />
    </div>
  );
};

export default EntityContainer;
