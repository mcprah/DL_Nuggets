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
} from "react-icons/md";
import { useNavigate } from "@remix-run/react";
import { useState, useEffect } from "react";
import { MetaFunction } from "@remix-run/node";
import backgroundImage from "~/images/Library-Postcard-004_2.webp";

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

const Dashboard = () => {
  const navigate = useNavigate();
  const [userName, setUserName] = useState("User");
  const [isLoading, setIsLoading] = useState(true);
  const [stats, setStats] = useState({
    totalNuggets: 0,
    recentViews: 0,
    savedNuggets: 0,
  });

  useEffect(() => {
    // Simulate loading data
    const timer = setTimeout(() => {
      setIsLoading(false);
      // Mock data - in a real app, these would come from an API
      setStats({
        totalNuggets: 1458,
        recentViews: 24,
        savedNuggets: 8,
      });

      // Get user name from localStorage if available
      if (typeof window !== "undefined") {
        const storedName = window.localStorage.getItem("user_name");
        if (storedName) {
          setUserName(storedName);
        }
      }
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

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
        {/* Welcome Section
        <section className="mb-8">
          <div className="bg-gradient-to-r from-primary to-blue-700 rounded-xl p-6 text-white relative overflow-hidden">
            <div className="absolute inset-0 bg-pattern opacity-10"></div>
            <div className="relative z-10">
              <h1 className="text-2xl md:text-3xl font-bold mb-2">
                Welcome back, {userName}!
              </h1>
              <p className="opacity-90 max-w-lg">
                Explore legal principles, search cases, and build your legal
                knowledge with Lex Nuggets.
              </p>
              <div className="flex gap-3 mt-4">
                <Button
                  className="bg-white text-primary font-semibold hover:bg-opacity-90"
                  onPress={() => navigate("/nuggets")}
                >
                  Explore Nuggets
                </Button>
                <Button
                  className="bg-transparent border border-white text-white font-semibold hover:bg-white/10"
                  onPress={() => navigate("/profile")}
                >
                  View Profile
                </Button>
              </div>
            </div>

            <div className="absolute right-4 bottom-4 md:right-10 md:bottom-4 w-24 h-24 md:w-32 md:h-32 bg-white/10 rounded-full blur-xl"></div>
            <div className="absolute right-20 top-10 w-16 h-16 bg-blue-400/20 rounded-full blur-lg"></div>
          </div>
        </section> */}

        {/* Statistics Row */}
        <section className="mb-8 grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* <Card className="p-4 shadow-md hover:shadow-lg transition-shadow">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-blue-100 mr-4">
                <MdLibraryBooks className="text-blue-600 text-xl" />
              </div>
              <div>
                <p className="text-gray-500 text-sm">Total Nuggets</p>
                {isLoading ? (
                  <div className="h-6 w-16 bg-gray-200 animate-pulse rounded"></div>
                ) : (
                  <p className="font-bold text-xl">
                    {stats.totalNuggets.toLocaleString()}
                  </p>
                )}
              </div>
            </div>
            <Progress
              size="sm"
              value={100}
              color="primary"
              className="mt-4"
              isIndeterminate={isLoading}
            />
          </Card> */}

          <Card className="p-4 shadow-md hover:shadow-lg transition-shadow">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-green-100 mr-4">
                <MdSearch className="text-green-600 text-xl" />
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
            <Progress
              size="sm"
              value={stats.recentViews}
              maxValue={100}
              color="success"
              className="mt-4"
              isIndeterminate={isLoading}
            />
          </Card>

          <Card className="p-4 shadow-md hover:shadow-lg transition-shadow">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-purple-100 mr-4">
                <MdBookmark className="text-purple-600 text-xl" />
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
              color="secondary"
              className="mt-4"
              isIndeterminate={isLoading}
            />
          </Card>
        </section>
        {/* Trending Section */}
        <section className="mb-8">
          <div className="bg-gray-50 rounded-xl p-6 border border-gray-200">
            <div className="flex items-center gap-2 mb-4">
              <MdTrendingUp className="text-primary text-xl" />
              <h2 className="text-xl font-bold text-gray-800">
                Trending 
              </h2>
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
        </section>

        {/* Main Categories Section */}
        <section className="mb-8">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold text-gray-800">
              Browse Categories
            </h2>
            <Button
              className="text-primary bg-transparent"
              onPress={() => navigate("/nuggets")}
              endContent={<MdArrowRight />}
            >
              View All
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Card 1 - Area of Law */}
            <Card className="overflow-hidden shadow-md hover:shadow-lg transition-all duration-300 hover:scale-[1.02]">
              <div className="h-28 bg-gradient-to-r from-pink-400 to-pink-600 relative">
                <div className="absolute inset-0 bg-pattern opacity-30"></div>
                <div className="absolute right-4 bottom-4 p-3 bg-white rounded-full">
                  <MdLibraryBooks className="text-pink-600 text-xl" />
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
                  className="w-full bg-gradient-to-r from-pink-500 to-pink-700 text-white"
                  onPress={() => navigate("/nuggets")}
                >
                  Explore Areas
                </Button>
              </div>
            </Card>

            {/* Card 2 - Courts */}
            <Card className="overflow-hidden shadow-md hover:shadow-lg transition-all duration-300 hover:scale-[1.02]">
              <div className="h-28 bg-gradient-to-r from-blue-400 to-blue-600 relative">
                <div className="absolute inset-0 bg-pattern opacity-30"></div>
                <div className="absolute right-4 bottom-4 p-3 bg-white rounded-full">
                  <MdOutlineGavel className="text-blue-600 text-xl" />
                </div>
              </div>
              <div className="p-4">
                <h3 className="text-lg font-bold text-gray-800">Courts</h3>
                <p className="text-gray-600 text-sm mt-1 mb-3">
                  Access nuggets by different courts and judicial bodies
                </p>
                <Button
                  className="w-full bg-gradient-to-r from-blue-500 to-blue-700 text-white"
                  onPress={() => navigate("/nuggets/courts")}
                >
                  Explore Courts
                </Button>
              </div>
            </Card>

            {/* Card 3 - Judges */}
            <Card className="overflow-hidden shadow-md hover:shadow-lg transition-all duration-300 hover:scale-[1.02]">
              <div className="h-28 bg-gradient-to-r from-green-400 to-green-600 relative">
                <div className="absolute inset-0 bg-pattern opacity-30"></div>
                <div className="absolute right-4 bottom-4 p-3 bg-white rounded-full">
                  <MdPerson className="text-green-600 text-xl" />
                </div>
              </div>
              <div className="p-4">
                <h3 className="text-lg font-bold text-gray-800">Judges</h3>
                <p className="text-gray-600 text-sm mt-1 mb-3">
                  Find legal principles from notable judges and justices
                </p>
                <Button
                  className="w-full bg-gradient-to-r from-green-500 to-green-700 text-white"
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
          <Card className="overflow-hidden shadow-md hover:shadow-lg transition-all duration-300">
            <div className="flex flex-col md:flex-row">
              <div className="md:w-2/3 p-6">
                <div className="flex items-center gap-2 mb-2">
                  <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">
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
                  className="bg-gradient-to-r from-indigo-700 to-blue-900 text-white"
                  endContent={<MdArrowRight />}
                  onPress={() => navigate("/dennislaw")}
                >
                  Go to Dennislaw
                </Button>
              </div>
              <div className="md:w-1/3 bg-gradient-to-br from-indigo-500 to-blue-700 flex items-center justify-center p-6">
                <div className="text-white text-center">
                  <p className="text-3xl font-bold">DL</p>
                  <p className="text-sm">Full Legal Library</p>
                </div>
              </div>
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
