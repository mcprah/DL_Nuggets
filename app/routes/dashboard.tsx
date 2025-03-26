import { Button, Card, Progress } from "@nextui-org/react";
import AdminLayout from "../Layout/AdminLayout";
import {
  MdArrowRight,
  MdBookmark,
  MdTrendingUp,
  MdSearch,
  MdLibraryBooks,
  MdOutlineGavel,
  MdPerson,
  MdCalendarToday,
} from "react-icons/md";
import { useNavigate, useLoaderData } from "@remix-run/react";
import { useState, useEffect } from "react";
import { MetaFunction, LoaderFunction, json } from "@remix-run/node";
import axios from "axios";
import backgroundImage from "~/images/Library-Postcard-004_2.webp";
import MostAccessed from "~/components/MostAccessed";

export const meta: MetaFunction = () => {
  return [
    { title: "Dashboard | Dennislaw" },
    {
      name: "description",
      content:
        "Explore legal principles, search cases, and build your legal knowledge",
    },
    { name: "og:title", content: "Dashboard | Dennislaw" },
    {
      name: "og:description",
      content:
        "Your personal dashboard for legal research and nugget exploration",
    },
    {
      tagName: "link",
      rel: "canonical",
      href: "https://dennislaw.com/dashboard",
    },
  ];
};

// Server loader to provide base URL
export const loader: LoaderFunction = async () => {
  return json({
    baseUrl: process.env.NEXT_PUBLIC_DL_LIVE_URL,
  });
};

const Dashboard = () => {
  const navigate = useNavigate();
  const { baseUrl } = useLoaderData<{ baseUrl: string }>();
  const [userName, setUserName] = useState("User");
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [timeFrame, setTimeFrame] = useState(30); // Default 30 days
  const [stats, setStats] = useState({
    recentViews: 0,
    savedNuggets: 0,
    timeFrameLabel: "30 days",
  });

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);

      // Get token from localStorage
      const token = localStorage.getItem("access_token");
      if (!token) {
        setIsAuthenticated(false);
        setIsLoading(false);
        return;
      }

      setIsAuthenticated(true);

      try {
        // Fetch user data
        const userResponse = await axios.get(`${baseUrl}/user`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (userResponse.data && userResponse.data.data) {
          const userData = userResponse.data.data;
          setUserName(userData.name || userData.fullname || "User");
          // Store user name in localStorage for other components
          if (typeof window !== "undefined") {
            window.localStorage.setItem(
              "user_name",
              userData.name || userData.fullname || "User"
            );
          }
        }

        // Fetch recently viewed count with time frame
        const recentViewsResponse = await axios.get(
          `${baseUrl}/recently-viewed-count?days=${timeFrame}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        // Fetch bookmarked nuggets count
        const bookmarksResponse = await axios.get(
          `${baseUrl}/bookmarked-nuggets?page=1&limit=1`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        setStats({
          recentViews: recentViewsResponse.data?.data?.count || 0,
          savedNuggets: bookmarksResponse.data?.data?.length || 0,
          timeFrameLabel:
            recentViewsResponse.data?.data?.time_frame || `${timeFrame} days`,
        });
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
        // Set default values in case of error
        setStats({
          recentViews: 0,
          savedNuggets: 0,
          timeFrameLabel: `${timeFrame} days`,
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [baseUrl, timeFrame]);

  // Function to change time frame
  const changeTimeFrame = (days: number) => {
    setTimeFrame(days);
  };

  const goToCategory = (category: string) => {
    navigate(`/nuggets?category=${category}`);
  };

  // Most searched keywords
  const trendingKeywords = [
    "Constitutional Law",
    "Criminal Procedure",
    "Tort Law",
    "Evidence",
    "Contract Law",
    "Property Law",
  ];

  return (
    <AdminLayout>
      <div className="w-full">
        {/* <section className="mb-8">
          <div className="bg-gradient-to-r from-primary to-secondary p-6 rounded-xl text-white">
            <h1 className="text-2xl font-bold">Welcome, {userName}!</h1>
            <p className="mt-2 opacity-90">
              Discover legal nuggets, bookmark important principles, and enhance
              your legal knowledge.
            </p>
          </div>
        </section> */}

        {/* Statistics Row */}
        <section className="mb-8 grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card className="p-4 shadow-md hover:shadow-lg transition-shadow">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div className="p-3 rounded-full bg-gray-200 mr-4">
                  <MdSearch className=" text-xl" />
                </div>
                <div>
                  <p className="text-gray-500 text-sm">Recent Views</p>
                  {isLoading ? (
                    <div className="h-6 w-16 bg-gray-200 animate-pulse rounded"></div>
                  ) : (
                    <p className="font-bold text-xl">{stats.recentViews}</p>
                  )}
                </div>
              </div>
              <div className="flex items-center">
                <MdCalendarToday className="text-gray-400 mr-2" />
                <span className="text-xs text-gray-500">
                  {stats.timeFrameLabel}
                </span>
              </div>
            </div>

            <Progress
              size="sm"
              value={stats.recentViews}
              maxValue={100}
              color="default"
              className="mt-2"
              isIndeterminate={isLoading}
            />
            <div className="mt-2 text-right flex justify-between">
              <div className="flex gap-2 flex-wrap">
                <Button
                  size="sm"
                  variant={timeFrame === 7 ? "solid" : "flat"}
                  color="default"
                  onPress={() => changeTimeFrame(7)}
                >
                  7 Days
                </Button>
                <Button
                  size="sm"
                  variant={timeFrame === 30 ? "solid" : "flat"}
                  color="default"
                  onPress={() => changeTimeFrame(30)}
                >
                  30 Days
                </Button>
                <Button
                  size="sm"
                  variant={timeFrame === 90 ? "solid" : "flat"}
                  color="default"
                  onPress={() => changeTimeFrame(90)}
                >
                  90 Days
                </Button>
              </div>

              <Button
                variant="light"
                size="sm"
                endContent={<MdArrowRight />}
                onPress={() => navigate(`/recently-viewed?days=${timeFrame}`)}
              >
                View History
              </Button>
            </div>
          </Card>

          <Card className="p-4 shadow-md hover:shadow-lg transition-shadow">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-gray-200 mr-4">
                <MdBookmark className=" text-xl" />
              </div>
              <div>
                <p className="text-gray-500 text-sm">Saved Nuggets</p>
                {isLoading ? (
                  <div className="h-6 w-16 bg-gray-200 animate-pulse rounded"></div>
                ) : (
                  <p className="font-bold text-xl">{stats.savedNuggets}</p>
                )}
              </div>
            </div>
            <Progress
              size="sm"
              value={stats.savedNuggets}
              maxValue={20}
              color="default"
              className="mt-2"
              isIndeterminate={isLoading}
            />
            <div className="mt-2 text-right">
              <Button
                variant="light"
                color="default"
                size="sm"
                endContent={<MdArrowRight />}
                onPress={() => navigate("/profile")}
              >
                View Saved
              </Button>
            </div>
          </Card>
        </section>

        {/* Trending Section */}
        {/* <section className="mb-8">
          <div className="bg-gray-50 rounded-xl p-6 border border-gray-200">
            <div className="flex items-center gap-2 mb-4">
              <MdTrendingUp className="text-primary text-xl" />
              <h2 className="text-xl font-bold text-gray-800">Trending</h2>
            </div>

            <div className="flex flex-wrap gap-2">
              {trendingKeywords.map((keyword, index) => (
                <Button
                  key={index}
                  className="bg-white border border-gray-200 text-gray-700 hover:bg-gray-100"
                  onPress={() => navigate(`/search?q=${keyword}`)}
                >
                  {keyword}
                </Button>
              ))}
            </div>
          </div>
        </section> */}

        {/* Most Accessed Resources Section */}
        <section className="mb-8">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold text-gray-800">
              Popular Resources
            </h2>
            <Button
              className=" bg-transparent"
              onPress={() => navigate("/most-accessed/all")}
              endContent={<MdArrowRight />}
            >
              View All
            </Button>
          </div>

          <MostAccessed
            baseUrl={baseUrl}
            limit={5}
            showTitle={false}
            type="all"
          />

          <div className="flex  mt-4 gap-3">
            <Button
              className="bg-white border border-default  hover:bg-primary-50"
              onPress={() => navigate("/most-accessed/area-of-law")}
              size="sm"
            >
              Areas of Law
            </Button>
            <Button
              className="bg-white border border-default  hover:bg-primary-50"
              onPress={() => navigate("/most-accessed/court")}
              size="sm"
            >
              Courts
            </Button>
            <Button
              className="bg-white border border-default  hover:bg-primary-50"
              onPress={() => navigate("/most-accessed/judge")}
              size="sm"
            >
              Judges
            </Button>
          </div>
        </section>

        {/* Main Categories Section */}
        <section className="mb-8">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold text-gray-800">
              Browse Categories
            </h2>
            <Button
              className=" bg-transparent"
              onPress={() => navigate("/nuggets")}
              endContent={<MdArrowRight />}
            >
              View All
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Card 1 - Area of Law */}
            <Card className="overflow-hidden border shadow-sm hover:shadow-lg transition-all duration-300 hover:scale-[1.02]">
              <div className="h-20 relative">
                <div className="absolute inset-0 bg-pattern opacity-30"></div>
                <div className="absolute left-4 bottom-4 p-3 bg-default-200 rounded-full">
                  <MdLibraryBooks className="text-default-800 text-xl" />
                </div>
              </div>
              <div className="p-4">
                <h3 className="text-lg font-bold text-gray-800">
                  Areas of Law
                </h3>
                <p className="text-gray-600 text-sm mt-1 mb-3">
                  Browse legal principles categorized by different areas of law
                </p>
                <Button
                  className="w-full bg-default "
                  onPress={() => navigate("/nuggets")}
                >
                  Explore Areas
                </Button>
              </div>
            </Card>

            {/* Card 2 - Courts */}
            <Card className="overflow-hidden border shadow-sm hover:shadow-lg transition-all duration-300 hover:scale-[1.02]">
              <div className="h-20 relative">
                <div className="absolute inset-0 bg-pattern opacity-30"></div>
                <div className="absolute left-4 bottom-4 p-3 bg-default rounded-full">
                  <MdOutlineGavel className="text-default-800 text-xl" />
                </div>
              </div>
              <div className="p-4">
                <h3 className="text-lg font-bold text-gray-800">Courts</h3>
                <p className="text-gray-600 text-sm mt-1 mb-3">
                  Access nuggets by different courts and judicial bodies
                </p>
                <Button
                  className="w-full bg-default"
                  onPress={() => navigate("/nuggets/courts")}
                >
                  Explore Courts
                </Button>
              </div>
            </Card>

            {/* Card 3 - Judges */}
            <Card className="overflow-hidden border shadow-sm hover:shadow-lg transition-all duration-300 hover:scale-[1.02]">
              <div className="h-20 relative">
                <div className="absolute inset-0 bg-pattern opacity-30"></div>
                <div className="absolute left-4 bottom-4 p-3 bg-default rounded-full">
                  <MdPerson className="text-default-800 text-xl" />
                </div>
              </div>
              <div className="p-4">
                <h3 className="text-lg font-bold text-gray-800">Judges</h3>
                <p className="text-gray-600 text-sm mt-1 mb-3">
                  Find legal principles from notable judges and justices
                </p>
                <Button
                  className="w-full bg-default"
                  onPress={() => navigate("/nuggets/judges")}
                >
                  Explore Judges
                </Button>
              </div>
            </Card>
          </div>
        </section>

        {/* Dennislaw Section */}
        <section>
          <Card className="overflow-hidden border shadow-sm hover:shadow-lg transition-all duration-300">
            <div className="flex flex-col md:flex-row">
              <div className="md:w-2/3 p-6">
                <div className="flex items-center gap-2 mb-2">
                  <span className="bg-default  text-xs px-2 py-1 rounded-full">
                    External Resource
                  </span>
                </div>
                <h3 className="text-xl font-bold text-gray-800 mb-2">
                  Dennislaw Library
                </h3>
                <p className="text-gray-600 mb-4">
                  Access comprehensive case law and legal resources in our
                  advanced library.
                </p>
                <Button
                  className="bg-default"
                  endContent={<MdArrowRight />}
                  onPress={() => navigate("/dennislaw")}
                >
                  Go to Dennislaw
                </Button>
              </div>
              {/* <div className="md:w-1/3 bg-gradient-to-br from-indigo-500 to-blue-700 flex items-center justify-center p-6">
                <div className="text-white text-center">
                  <p className="text-3xl font-bold">DL</p>
                  <p className="text-sm">Full Legal Library</p>
                </div>
              </div> */}
            </div>
          </Card>
        </section>
      </div>

      {/* CSS for decorative patterns */}
      <style>{`
        .bg-pattern {
          background-image: url("data:image/svg+xml,%3Csvg width='20' height='20' viewBox='0 0 20 20' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%23ffffff' fill-opacity='0.2' fill-rule='evenodd'%3E%3Ccircle cx='3' cy='3' r='3'/%3E%3Ccircle cx='13' cy='13' r='3'/%3E%3C/g%3E%3C/svg%3E");
                }
            `}</style>
    </AdminLayout>
  );
};

export default Dashboard;
