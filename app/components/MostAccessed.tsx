import { useState, useEffect } from "react";
import axios from "axios";
import { Link } from "@remix-run/react";
import { Card, CardBody, Spinner, Chip, Divider } from "@nextui-org/react";
import {
  MdAutoGraph,
  MdArrowForward,
  MdLocalLibrary,
  MdAccountBalance,
  MdPerson,
} from "react-icons/md";
import { recordResourceAccess } from "~/utils/api";

interface ResourceAccessItem {
  id: number;
  resource_type: "area_of_law" | "court" | "judge";
  resource_id: number;
  count: number;
  details: {
    id: number;
    name?: string;
    display_name?: string;
    fullname?: string;
    value?: string;
  };
}

interface MostAccessedProps {
  baseUrl: string;
  limit?: number;
  showTitle?: boolean;
  type?: "area_of_law" | "court" | "judge" | "all";
}

export default function MostAccessed({
  baseUrl,
  limit = 5,
  showTitle = true,
  type = "all",
}: MostAccessedProps) {
  const [resources, setResources] = useState<ResourceAccessItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchMostAccessed = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`${baseUrl}/most-accessed`, {
          params: { type, limit },
        });

        if (response.data && !response.data.error) {
          setResources(response.data.data);
        } else {
          setError(response.data.msg || "Failed to fetch popular resources");
        }
      } catch (err) {
        console.error("Error fetching most accessed resources:", err);
        setError("Failed to load popular resources");
      } finally {
        setLoading(false);
      }
    };

    fetchMostAccessed();
  }, [baseUrl, limit, type]);

  // Get the appropriate title based on the type
  const getTitle = () => {
    switch (type) {
      case "area_of_law":
        return "Popular Areas of Law";
      case "court":
        return "Popular Courts";
      case "judge":
        return "Popular Judges";
      default:
        return "Popular Resources";
    }
  };

  // Get the appropriate route for each resource type
  const getResourceLink = (item: ResourceAccessItem) => {
    switch (item.resource_type) {
      case "area_of_law":
        return `/nuggets/area-of-law/${item.resource_id}`;
      case "court":
        return `/nuggets/courts/${item.resource_id}`;
      case "judge":
        return `/nuggets/judges/${item.resource_id}`;
      default:
        return "#";
    }
  };

  // Get the appropriate display name for each resource
  const getResourceName = (item: ResourceAccessItem) => {
    if (!item.details) return "Unknown";

    switch (item.resource_type) {
      case "area_of_law":
        return item.details.display_name || item.details.name || "Unknown Area";
      case "court":
        return item.details.name || "Unknown Court";
      case "judge":
        return item.details.fullname || "Unknown Judge";
      default:
        return "Unknown";
    }
  };

  // Get the appropriate icon for each resource type
  const getResourceIcon = (resourceType: string) => {
    switch (resourceType) {
      case "area_of_law":
        return <MdLocalLibrary className="text-default-400 text-lg" />;
      case "court":
        return <MdAccountBalance className="text-primary text-lg" />;
      case "judge":
        return <MdPerson className="text-primary text-lg" />;
      default:
        return null;
    }
  };

  // Filter out resources that don't have valid details (might have been deleted)
  const validResources = resources.filter((item) => item.details);

  // Handle resource click and track the access
  const handleResourceClick = (item: ResourceAccessItem) => {
    recordResourceAccess(baseUrl, item.resource_type, item.resource_id);
  };

  return (
    <Card className="bg-white shadow-sm">
      {showTitle && (
        <div className="flex items-center gap-2 p-4 pb-0">
          <MdAutoGraph className=" text-xl" />
          <h2 className="text-xl font-bold text-gray-800">{getTitle()}</h2>
        </div>
      )}

      <CardBody>
        {loading ? (
          <div className="flex justify-center p-4">
            <Spinner color="default" />
          </div>
        ) : error ? (
          <div className="text-center text-red-500 p-4">{error}</div>
        ) : validResources.length === 0 ? (
          <div className="text-center text-gray-500 p-4">
            No popular resources found
          </div>
        ) : (
          <div className="flex flex-col gap-2">
            {validResources.map((item, index) => (
              <div key={`${item.resource_type}-${item.resource_id}`}>
                <Link
                  to={getResourceLink(item)}
                  className="flex items-center justify-between p-2 hover:bg-gray-200 rounded-md "
                  onClick={() => handleResourceClick(item)}
                >
                  <div className="flex items-center gap-2">
                    {getResourceIcon(item.resource_type)}
                    <span className="font-medium">{getResourceName(item)}</span>
                    {type === "all" && (
                      <Chip
                        size="sm"
                        color={
                          item.resource_type === "area_of_law"
                            ? "default"
                            : item.resource_type === "court"
                              ? "default"
                              : "default"
                        }
                        variant="flat"
                        className="ml-2"
                      >
                        {item.resource_type === "area_of_law"
                          ? "Area"
                          : item.resource_type === "court"
                          ? "Court"
                          : "Judge"}
                      </Chip>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-500">
                      {item.count} views
                    </span>
                    <MdArrowForward className="text-gray-400" />
                  </div>
                </Link>
                {index < validResources.length - 1 && (
                  <Divider className="my-1" />
                )}
              </div>
            ))}
          </div>
        )}
      </CardBody>
    </Card>
  );
}
