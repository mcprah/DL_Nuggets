import { useState, useEffect } from "react";
import { useSearchParams, useNavigate, useLoaderData } from "@remix-run/react";
import { Button, Card, Pagination, Chip, Spinner } from "@nextui-org/react";
import AdminLayout from "~/Layout/AdminLayout";
import { MdCalendarToday, MdArrowBack } from "react-icons/md";
import { json, LoaderFunction, MetaFunction } from "@remix-run/node";
import axios from "axios";
import NuggetCard from "~/components/NuggetCard";
import NuggetDrawer, { Nugget } from "~/components/NuggetDrawer";

// Define interface for loader data
interface LoaderData {
  baseUrl: string;
}

// Meta data for the page
export const meta: MetaFunction = () => {
  return [
    { title: "Recently Viewed Nuggets | Dennislaw" },
    {
      name: "description",
      content: "View your recently viewed legal nuggets",
    },
    { name: "og:title", content: "Recently Viewed Nuggets | Dennislaw" },
    {
      name: "og:description",
      content: "Track your legal research history with recently viewed nuggets",
    },
    {
      tagName: "link",
      rel: "canonical",
      href: "https://dennislaw.com/recently-viewed",
    },
  ];
};

// Server loader to provide base URL
export const loader: LoaderFunction = async () => {
  return json({
    baseUrl: process.env.NEXT_PUBLIC_DL_LIVE_URL,
  });
};

export default function RecentlyViewed() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { baseUrl } = useLoaderData<LoaderData>();

  // Get time frame from URL or default to 30 days
  const initialDays = parseInt(searchParams.get("days") || "30");

  const [days, setDays] = useState(initialDays);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [nuggets, setNuggets] = useState<Nugget[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isError, setIsError] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [selectedNugget, setSelectedNugget] = useState<Nugget | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  // Fetch nuggets when days or page changes
  useEffect(() => {
    const fetchNuggets = async () => {
      setIsLoading(true);
      setIsError(false);

      try {
        // Get token from localStorage
        const token = localStorage.getItem("access_token");
        if (!token) {
          setIsError(true);
          setErrorMessage(
            "You must be logged in to view your recently viewed nuggets"
          );
          setIsLoading(false);
          return;
        }

        // Update search params to reflect current time frame
        setSearchParams({ days: days.toString() });

        // Fetch recently viewed nuggets
        const response = await axios.get(
          `${baseUrl}/recently-viewed-nuggets?days=${days}&page=${currentPage}&limit=9`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (response.data && response.data.data) {
          // Process the nuggets to handle keywords that are stored as JSON strings
          const processedNuggets = response.data.data.map((nugget: any) => {
            // Try to parse keywords if it's a string that looks like JSON
            if (
              typeof nugget.keywords === "string" &&
              (nugget.keywords.startsWith("[") ||
                nugget.keywords.startsWith("{"))
            ) {
              try {
                nugget.keywords = JSON.parse(nugget.keywords);
              } catch (e) {
                // If parsing fails, leave as is and let NuggetCard handle it
              }
            }
            return nugget;
          });

          setNuggets(processedNuggets);
          setTotalPages(response.data.meta.last_page || 1);
        } else {
          setNuggets([]);
          setTotalPages(1);
        }
      } catch (error) {
        console.error("Error fetching recently viewed nuggets:", error);
        setIsError(true);
        setErrorMessage(
          "Failed to fetch recently viewed nuggets. Please try again."
        );
        setNuggets([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchNuggets();
  }, [days, currentPage, baseUrl, setSearchParams]);

  // Change time frame
  const handleTimeFrameChange = (newDays: number) => {
    setDays(newDays);
    setCurrentPage(1); // Reset to first page when time frame changes
  };

  // Handle page change
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  // Open nugget drawer
  const openDrawer = (nugget: Nugget) => {
    setSelectedNugget(nugget);
    setIsDrawerOpen(true);
  };

  // Close nugget drawer
  const closeDrawer = () => {
    setIsDrawerOpen(false);
  };

  // Handle bookmark change
  const handleBookmarkChange = () => {
    // Refresh the list to show updated bookmark status
    const fetchNuggets = async () => {
      try {
        const token = localStorage.getItem("access_token");
        if (!token) return;

        const response = await axios.get(
          `${baseUrl}/recently-viewed-nuggets?days=${days}&page=${currentPage}&limit=9`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (response.data && response.data.data) {
          // Process the nuggets to handle keywords that are stored as JSON strings
          const processedNuggets = response.data.data.map((nugget: any) => {
            // Try to parse keywords if it's a string that looks like JSON
            if (
              typeof nugget.keywords === "string" &&
              (nugget.keywords.startsWith("[") ||
                nugget.keywords.startsWith("{"))
            ) {
              try {
                nugget.keywords = JSON.parse(nugget.keywords);
              } catch (e) {
                // If parsing fails, leave as is and let NuggetCard handle it
              }
            }
            return nugget;
          });

          setNuggets(processedNuggets);
        }
      } catch (error) {
        console.error("Error refreshing nuggets:", error);
      }
    };

    fetchNuggets();
  };

  return (
    <AdminLayout>
      <div className="p-4">
        {/* Header with back button */}
        <div className="flex items-center mb-6">
          <Button
            isIconOnly
            variant="light"
            onPress={() => navigate("/dashboard")}
            className="mr-2"
          >
            <MdArrowBack className="text-xl" />
          </Button>
          <h1 className="text-2xl font-bold">Recently Viewed Nuggets</h1>
        </div>

        {/* Time frame selector */}
        <Card className="p-4 mb-6">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-lg font-semibold">Time Frame</h2>
            <div className="flex items-center">
              <MdCalendarToday className="text-gray-400 mr-2" />
              <span className="text-sm text-gray-500">Last {days} days</span>
            </div>
          </div>

          <div className="flex gap-2 flex-wrap">
            <Button
              size="sm"
              variant={days === 7 ? "solid" : "flat"}
              color="primary"
              onPress={() => handleTimeFrameChange(7)}
            >
              7 Days
            </Button>
            <Button
              size="sm"
              variant={days === 30 ? "solid" : "flat"}
              color="primary"
              onPress={() => handleTimeFrameChange(30)}
            >
              30 Days
            </Button>
            <Button
              size="sm"
              variant={days === 90 ? "solid" : "flat"}
              color="primary"
              onPress={() => handleTimeFrameChange(90)}
            >
              90 Days
            </Button>
            <Button
              size="sm"
              variant={days === 365 ? "solid" : "flat"}
              color="primary"
              onPress={() => handleTimeFrameChange(365)}
            >
              1 Year
            </Button>
          </div>
        </Card>

        {/* Error message */}
        {isError && (
          <div className="p-4 mb-6 bg-red-50 text-red-600 rounded-lg border border-red-200">
            <p>{errorMessage}</p>
            {errorMessage.includes("logged in") && (
              <Button
                color="primary"
                className="mt-4"
                onPress={() => navigate("/")}
              >
                Go to Login
              </Button>
            )}
          </div>
        )}

        {/* Loading state */}
        {isLoading && (
          <div className="flex justify-center items-center p-12">
            <Spinner size="lg" color="primary" />
            <span className="ml-4">Loading recently viewed nuggets...</span>
          </div>
        )}

        {/* Nuggets grid */}
        {!isLoading && !isError && (
          <>
            {nuggets.length === 0 ? (
              <Card className="p-8 text-center">
                <p className="text-gray-500 mb-4">
                  You haven't viewed any nuggets in the last {days} days.
                </p>
                <Button color="primary" onPress={() => navigate("/nuggets")}>
                  Explore Nuggets
                </Button>
              </Card>
            ) : (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {nuggets.map((nugget) => (
                    <NuggetCard
                      key={nugget.id}
                      nugget={nugget}
                      onClick={openDrawer}
                      isSelected={selectedNugget?.id === nugget.id}
                    />
                  ))}
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="flex justify-center mt-8">
                    <Pagination
                      total={totalPages}
                      initialPage={currentPage}
                      page={currentPage}
                      onChange={handlePageChange}
                      color="secondary"
                      showControls
                    />
                  </div>
                )}
              </>
            )}
          </>
        )}

        {/* Nugget Drawer */}
        <NuggetDrawer
          isOpen={isDrawerOpen}
          onClose={closeDrawer}
          nugget={selectedNugget}
          onBookmarkChange={handleBookmarkChange}
          baseUrl={baseUrl}
        />
      </div>
    </AdminLayout>
  );
}
