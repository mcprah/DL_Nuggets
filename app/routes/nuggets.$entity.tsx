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

export const loader: LoaderFunction = async ({ params }) => {
  const { entity } = params;

  // Handle invalid entity type
  if (!entity || !["courts", "judges"].includes(entity)) {
    throw new Error(`Invalid entity type: ${entity}`);
  }

  const baseUrl = process.env.NEXT_PUBLIC_DL_LIVE_URL;

  try {
    // Determine the API endpoint based on entity type
    const endpoint = `${baseUrl}/${entity}`;
    const response = await axios.get(endpoint);

    return {
      entities: response.data,
      baseUrl,
      entityType: entity,
    };
  } catch (error) {
    throw new Error(`Failed to fetch ${entity}`);
  }
};

const EntityContainer = () => {
  return (
    <div className="">
      <Outlet />
    </div>
  );
};

export default EntityContainer;
