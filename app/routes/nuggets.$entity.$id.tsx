import { useState, useEffect } from "react";
import { useParams, useNavigate, useLoaderData } from "@remix-run/react";
import { MdArrowBack } from "react-icons/md";
import { Pagination } from "@nextui-org/react";
import { LoaderFunction, MetaFunction } from "@remix-run/node";
import axios from "axios";
import NuggetDrawer, { Nugget } from "~/components/NuggetDrawer";
import NuggetCard from "~/components/NuggetCard";
import { recordResourceAccess } from "~/utils/api";

interface EntityDetails {
  id: number;
  name?: string;
  fullname?: string;
  display_name?: string;
}

interface LoaderData {
  details: EntityDetails;
  nuggets: Nugget[];
  baseUrl: string;
  currentPage: number;
  totalPages: number;
  perPage: number;
  entityType: string;
}

export const meta: MetaFunction = ({ data, params }) => {
  if (!data) {
    const entityTitle = getEntityTitle(params.entity || "");
    return [
      { title: `${entityTitle} Nuggets | Dennislaw` },
      {
        name: "description",
        content: `View nuggets by ${entityTitle.toLowerCase()}`,
      },
    ];
  }

  const { details, entityType } = data as LoaderData;
  const displayName = getDisplayName(details, entityType);
  const entityTitle = getEntityTitle(entityType);

  return [
    { title: `${displayName || entityTitle} | Dennislaw` },
    {
      name: "description",
      content: getMetaDescription(displayName, entityType),
    },
    { name: "og:title", content: `${displayName || entityTitle} | Dennislaw` },
    {
      name: "og:description",
      content: getOgDescription(displayName, entityType),
    },
    {
      tagName: "link",
      rel: "canonical",
      href: `https://dennislaw.com/nuggets/${params.entity}/${params.id}`,
    },
  ];
};

// Helper functions for metadata
function getEntityTitle(entityType: string): string {
  switch (entityType) {
    case "courts":
      return "Court";
    case "judges":
      return "Judge";
    default:
      return "Area of Law";
  }
}

function getDisplayName(details: EntityDetails, entityType: string): string {
  switch (entityType) {
    case "courts":
      return details?.name || "Court";
    case "judges":
      return details?.fullname || "Judge";
    default:
      return details?.display_name || details?.name || "Area of Law";
  }
}

function getMetaDescription(displayName: string, entityType: string): string {
  switch (entityType) {
    case "courts":
      return `Legal nuggets from ${displayName}`;
    case "judges":
      return `Legal nuggets by ${displayName}`;
    default:
      return `Legal nuggets related to ${displayName}`;
  }
}

function getOgDescription(displayName: string, entityType: string): string {
  switch (entityType) {
    case "courts":
      return `Browse legal nuggets from ${displayName}`;
    case "judges":
      return `Browse legal nuggets authored by ${displayName}`;
    default:
      return `Browse legal nuggets related to ${displayName}`;
  }
}

function getParentType(entityType: string): "court" | "judge" | "area" {
  switch (entityType) {
    case "courts":
      return "court";
    case "judges":
      return "judge";
    default:
      return "area";
  }
}

function getBackPath(entityType: string): string {
  switch (entityType) {
    case "courts":
      return "/nuggets/courts";
    case "judges":
      return "/nuggets/judges";
    default:
      return "/nuggets";
  }
}

const EntityDetails = () => {
  const { id, entity } = useParams();
  const navigate = useNavigate();
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [selectedSubNugget, setSelectedSubNugget] = useState<Nugget | null>(
    null
  );

  const {
    details,
    nuggets,
    baseUrl,
    currentPage,
    totalPages,
    perPage,
    entityType,
  } = useLoaderData<LoaderData>();

  const displayName = getDisplayName(details, entityType);
  const parentType = getParentType(entityType);
  const backPath = getBackPath(entityType);

  useEffect(() => {
    // Track resource access when component mounts
    if (entity && id) {
      let resourceType: "area_of_law" | "court" | "judge";

      switch (entity) {
        case "area-of-law":
          resourceType = "area_of_law";
          break;
        case "court":
          resourceType = "court";
          break;
        case "judge":
          resourceType = "judge";
          break;
        default:
          return; // If not a trackable entity, do nothing
      }

      recordResourceAccess(baseUrl, resourceType, id);
    }
  }, [entity, id, baseUrl]);

  // Open drawer with selected sub-nugget details
  const openDrawer = (subNugget: Nugget) => {
    setSelectedSubNugget(subNugget);
    setIsDrawerOpen(true);
  };

  // Close drawer
  const closeDrawer = () => {
    setIsDrawerOpen(false);
  };

  return (
    <div className="flex transition-all duration-300">
      {/* Main Content Area */}
      <div
        className={`p-2 overflow-x-hidden transition-all duration-300 overflow-y-hidden ${
          isDrawerOpen ? "w-full sm:w-1/3 md:w-3/6 lg:w-2xl" : "flex-1"
        }`}
      >
        {/* Back Button and Title */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => navigate(backPath)}
            className="text-gray-600 hover:text-primary transition-all duration-300"
          >
            <MdArrowBack className="text-2xl" />
          </button>
          <p className="font-montserrat font-bold text-xl">
            {displayName || `${getEntityTitle(entityType)} Details`}
          </p>
        </div>

        {/* Grid Layout for Sub-Nuggets */}
        <div
          className={`grid grid-cols-1 sm:grid-cols-1 gap-4 mt-6 bg-white rounded-xl shadow-sm border border-black/10 p-4 ${
            isDrawerOpen ? "lg:grid-cols-2" : "lg:grid-cols-3"
          }`}
        >
          {nuggets.length > 0 ? (
            nuggets.map((nugget: Nugget) => (
              <NuggetCard
                key={nugget.id}
                nugget={nugget}
                isSelected={selectedSubNugget?.id === nugget.id && isDrawerOpen}
                onClick={openDrawer}
              />
            ))
          ) : (
            <p className="text-gray-500">No related nuggets available.</p>
          )}
        </div>

        {totalPages > 1 && (
          <div className="flex justify-center mt-6">
            <Pagination
              color="primary"
              page={currentPage}
              total={Math.ceil(totalPages / perPage)}
              showControls
              onChange={(page) =>
                navigate(`/nuggets/${entity}/${id}?page=${page}`)
              }
            />
          </div>
        )}
      </div>

      {/* Use the NuggetDrawer component */}
      <NuggetDrawer
        isOpen={isDrawerOpen}
        onClose={closeDrawer}
        nugget={selectedSubNugget}
        parentName={displayName}
        parentType={parentType}
        baseUrl={baseUrl}
      />
    </div>
  );
};

export default EntityDetails;

export const loader: LoaderFunction = async ({ params, request }) => {
  const url = new URL(request.url);
  const searchParams = new URLSearchParams(url.search);
  const page = searchParams.get("page") || "1";
  const limit = searchParams.get("limit") || "9";
  const { id, entity } = params;

  // Handle invalid entity type
  if (
    !entity ||
    (!["courts", "judges"].includes(entity) && entity !== "area-of-law")
  ) {
    throw new Error(`Invalid entity type: ${entity}`);
  }

  const entityType = entity;
  const baseUrl = process.env.NEXT_PUBLIC_DL_LIVE_URL;

  try {
    // Determine the API endpoint based on entity type
    let endpoint;
    if (entity === "area-of-law") {
      endpoint = `${baseUrl}/nuggets/area-of-law/${id}?page=${page}&limit=${limit}`;
    } else {
      // Remove trailing 's' for singular endpoint
      const singularEntity = entity.endsWith("s")
        ? entity.slice(0, -1)
        : entity;
      endpoint = `${baseUrl}/nuggets/${singularEntity}/${id}?page=${page}&limit=${limit}`;
    }

    const response = await axios.get(endpoint);

    // Extract details based on entity type
    let details = null;
    if (entity === "courts") {
      details = response.data?.data[0]?.court || null;
    } else if (entity === "judges") {
      details = response.data?.data[0]?.judge || null;
    } else {
      details = response.data?.data[0]?.area_of_laws?.[0]?.area_of_law || null;
    }

    return {
      details,
      nuggets: response.data?.data || [],
      baseUrl,
      currentPage: parseInt(page),
      totalPages: parseInt(response.data?.meta?.total),
      perPage: parseInt(response.data?.meta?.per_page),
      entityType,
    };
  } catch (error) {
    throw new Error(`Failed to fetch ${entity} nuggets`);
  }
};
