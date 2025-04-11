import { useState, useEffect } from "react";
import { Button, Card, Pagination, Spinner } from "@nextui-org/react";
import { MdEdit, MdBookmark, MdDelete } from "react-icons/md";
import AdminLayout from "../Layout/AdminLayout";
import profilePic from "~/images/logo.png";
import axios from "axios";
import { Nugget } from "~/components/NuggetDrawer";
import { useLoaderData, useNavigate } from "@remix-run/react";
import { LoaderFunction, MetaFunction } from "@remix-run/node";

export const meta: MetaFunction = () => {
  return [
    { title: "User Profile | Dennislaw" },
    {
      name: "description",
      content:
        "View and manage your profile information and bookmarked nuggets",
    },
    { name: "og:title", content: "User Profile | Dennislaw" },
    {
      name: "og:description",
      content: "Manage your personal profile and bookmarked legal nuggets",
    },
    {
      tagName: "link",
      rel: "canonical",
      href: "https://dennislaw.com/profile",
    },
  ];
};

const Profile = () => {
  const [bookmarkedNuggets, setBookmarkedNuggets] = useState<Nugget[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [userData, setUserData] = useState({
    name: "John Doe",
    email: "johndoe@example.com",
    phone: "+123 456 7890",
    location: "New York, USA",
  });
  const navigate = useNavigate();

  const { baseUrl } = useLoaderData<typeof loader>();

  useEffect(() => {
    fetchUserData();
    fetchBookmarkedNuggets(1);
  }, []);

  const fetchUserData = async () => {
    try {
      const token = localStorage.getItem("access_token");
      if (!token) {
        return;
      }

      const response = await axios.get(`${baseUrl}/user`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.data && response.data.data) {
        const user = response.data?.data?.user_data;
        setUserData({
          name: user.name || "User",
          email: user.email || "N/A",
          phone: user.phone || "N/A",
          location: user.location || "N/A",
        });

        // Store name in localStorage for dashboard
        localStorage.setItem("user_name", user.name || "User");
      }
    } catch (error) {
      console.error("Error fetching user data:", error);
    }
  };

  const fetchBookmarkedNuggets = async (page: number) => {
    setLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem("access_token");
      if (!token) {
        setError("You must be logged in to view bookmarked nuggets.");
        setLoading(false);
        return;
      }

      const response = await axios.get(
        `${baseUrl}/bookmarked-nuggets?page=${page}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setBookmarkedNuggets(response.data?.data || []);
      setTotalPages(response.data?.meta?.last_page || 1);
      setCurrentPage(page);
    } catch (error) {
      console.error("Error fetching bookmarked nuggets:", error);
      setError("Failed to load bookmarked nuggets. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  const removeBookmark = async (nuggetId: number) => {
    try {
      const token = localStorage.getItem("access_token");
      if (!token) return;

      await axios.delete(`${baseUrl}/bookmark-nugget/${nuggetId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      // Refresh the bookmarks
      fetchBookmarkedNuggets(currentPage);
    } catch (error) {
      console.error("Error removing bookmark:", error);
    }
  };

  const clearAllBookmarks = async () => {
    if (!confirm("Are you sure you want to remove all bookmarked nuggets?"))
      return;

    try {
      const token = localStorage.getItem("access_token");
      if (!token) return;

      await axios.delete(`${baseUrl}/bookmark-nugget`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      // Refresh the bookmarks
      setBookmarkedNuggets([]);
      setTotalPages(1);
      setCurrentPage(1);
    } catch (error) {
      console.error("Error clearing bookmarks:", error);
    }
  };

  return (
    <AdminLayout>
      <div className="flex flex-col w-full bg-gray-50 py-10 px-4 gap-8">
        {/* Profile Card */}
        <div className="relative w-full max-w-3xl mx-auto bg-white shadow-lg rounded-2xl overflow-hidden p-6 flex flex-col items-center text-center">
          {/* Profile Image */}
          <div className="relative w-32 h-32 rounded-full overflow-hidden border-4 border-blue-500 shadow-md">
            <img
              src={profilePic}
              alt="Profile"
              className="w-full h-full object-cover"
            />
          </div>

          {/* User Details */}
          <h2 className="mt-4 text-2xl font-bold text-gray-900">
            {userData.name}
          </h2>
          <p className="text-gray-500 text-sm">{userData.email}</p>

          {/* Edit Button */}
          <Button className="mt-4 bg-gradient-to-r from-blue-500 to-indigo-600 text-white px-6 py-2 rounded-lg flex items-center gap-2 transition-transform transform hover:scale-105">
            <MdEdit className="text-lg" /> Edit Profile
          </Button>
        </div>

        {/* Additional Info */}
        <div className="w-full max-w-3xl mx-auto bg-white shadow-md rounded-2xl p-6">
          <h3 className="text-xl font-semibold text-gray-800 mb-4">
            Profile Details
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div>
              <p className="text-gray-600 text-sm">Full Name</p>
              <p className="text-gray-900 font-semibold">{userData.name}</p>
            </div>
            <div>
              <p className="text-gray-600 text-sm">Email</p>
              <p className="text-gray-900 font-semibold">{userData.email}</p>
            </div>
            <div>
              <p className="text-gray-600 text-sm">Phone</p>
              <p className="text-gray-900 font-semibold">{userData.phone}</p>
            </div>
            <div>
              <p className="text-gray-600 text-sm">Location</p>
              <p className="text-gray-900 font-semibold">{userData.location}</p>
            </div>
          </div>
        </div>

        {/* Bookmarked Nuggets Section */}
        <div className="w-full max-w-3xl mx-auto bg-white shadow-md rounded-2xl p-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-xl font-semibold text-gray-800">
              Bookmarked Nuggets
            </h3>
            {bookmarkedNuggets.length > 0 && (
              <Button
                color="danger"
                variant="light"
                onClick={clearAllBookmarks}
                startContent={<MdDelete />}
              >
                Clear All
              </Button>
            )}
          </div>

          {loading ? (
            <div className="flex justify-center py-10">
              <Spinner color="primary" size="lg" />
            </div>
          ) : error ? (
            <div className="p-4 bg-red-50 text-red-600 rounded-lg border border-red-200">
              <p>{error}</p>
            </div>
          ) : bookmarkedNuggets.length === 0 ? (
            <div className="text-center py-10">
              <div className="flex justify-center mb-4">
                <MdBookmark className="text-5xl text-gray-300" />
              </div>
              <p className="text-gray-500 mb-4">
                You haven't bookmarked any nuggets yet.
              </p>
              <Button color="primary" onClick={() => navigate("/nuggets")}>
                Explore Nuggets
              </Button>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 gap-4">
                {bookmarkedNuggets.map((nugget) => (
                  <Card
                    key={nugget.id}
                    className="shadow-sm hover:shadow-md transition-shadow"
                  >
                    <div className="p-4">
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="text-sm text-gray-500">
                            {nugget.dl_citation_no || nugget.citation_no}
                            {nugget.year && ` (${nugget.year})`}
                          </p>
                          <h3 className="font-semibold line-clamp-2 mt-1">
                            {nugget.headnote || nugget.title}
                          </h3>
                          <p className="text-sm text-gray-600 line-clamp-2 mt-2">
                            {nugget.principle}
                          </p>
                        </div>
                        <Button
                          isIconOnly
                          color="danger"
                          variant="light"
                          onClick={() => removeBookmark(nugget.id)}
                        >
                          <MdDelete />
                        </Button>
                      </div>
                      <div className="mt-4 flex justify-end">
                        <Button
                          size="sm"
                          color="primary"
                          onClick={() =>
                            navigate(`/nuggets/details/${nugget.id}`)
                          }
                        >
                          View Details
                        </Button>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>

              {totalPages > 1 && (
                <div className="flex justify-center mt-8">
                  <Pagination
                    total={totalPages}
                    initialPage={currentPage}
                    onChange={(page) => fetchBookmarkedNuggets(page)}
                  />
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </AdminLayout>
  );
};

export default Profile;

export const loader: LoaderFunction = async ({ params, request }) => {
  const baseUrl = process.env.NEXT_PUBLIC_DL_LIVE_URL;
  try {
    return {
      baseUrl,
    };
  } catch (error) {
    throw new Error("Failed to fetch judges");
  }
};
