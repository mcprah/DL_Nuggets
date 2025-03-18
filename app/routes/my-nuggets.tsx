import { useState } from "react";
import { json, LoaderFunction } from "@remix-run/node";
import {
  useLoaderData,
  useNavigate,
  ClientLoaderFunctionArgs,
} from "@remix-run/react";
import AdminLayout from "~/Layout/AdminLayout";
import { MdArrowBack } from "react-icons/md";
import {
  Pagination,
  Card,
  CardBody,
  CardHeader,
  CardFooter,
  Button,
} from "@nextui-org/react";
import axios from "axios";
import { Nugget } from "~/components/NuggetDrawer";

// Define the server loader data type
interface ServerLoaderData {
  baseUrl: string;
}

// Define the client loader return type
interface ClientLoaderData {
  nuggets: Nugget[];
  totalPages: number;
  currentPage: number;
  perPage: number;
  error: string | null;
}

// Server loader - gets base URL but doesn't try to authenticate
export const loader: LoaderFunction = async () => {
  const baseUrl = process.env.NEXT_PUBLIC_DL_LIVE_URL;
  return json({ baseUrl });
};

// Client loader that runs on the client side and can access localStorage
export const clientLoader = async ({
  request,
  params,
  serverLoader,
}: ClientLoaderFunctionArgs) => {
  // Get data from server loader
  const { baseUrl } = await serverLoader<ServerLoaderData>();

  // Get token from localStorage (only available in browser)
  let token = null;
  if (typeof window !== "undefined") {
    token = localStorage.getItem("access_token");
  }

  if (!token) {
    return {
      nuggets: [],
      totalPages: 0,
      currentPage: 1,
      perPage: 10,
      error: "Not authenticated",
    };
  }

  try {
    // Make authenticated request
    const url = new URL(request.url);
    const page = url.searchParams.get("page") || "1";

    const response = await axios.get(
      `${baseUrl}/personal-nuggets?page=${page}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    return {
      nuggets: response.data?.data || [],
      totalPages: response.data?.meta?.last_page || 1,
      currentPage: parseInt(page),
      perPage: response.data?.meta?.per_page || 10,
      error: null,
    };
  } catch (error: any) {
    console.error("Error fetching user nuggets:", error);
    return {
      nuggets: [],
      totalPages: 0,
      currentPage: 1,
      perPage: 10,
      error: error.response?.data?.message || "Failed to fetch nuggets",
    };
  }
};

// Set hydrate to true since we need client data on initial load
clientLoader.hydrate = true;

export default function MyNuggets() {
  const { nuggets, totalPages, currentPage, error } =
    useLoaderData<ClientLoaderData>();
  const navigate = useNavigate();
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [selectedNugget, setSelectedNugget] = useState<Nugget | null>(null);

  // Open drawer with selected nugget details
  const openDrawer = (nugget: Nugget) => {
    setSelectedNugget(nugget);
    setIsDrawerOpen(true);
  };

  // Close drawer
  const closeDrawer = () => {
    setIsDrawerOpen(false);
  };

  if (error === "Not authenticated") {
    return (
      <AdminLayout>
        <div className="p-6 bg-white rounded-xl shadow-sm">
          <h1 className="text-2xl font-bold mb-4">My Nuggets</h1>
          <div className="p-4 bg-red-50 text-red-600 rounded-lg border border-red-200">
            <p>You need to be logged in to view your nuggets.</p>
            <Button
              color="primary"
              className="mt-4"
              onClick={() => navigate("/")}
            >
              Go to Login
            </Button>
          </div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="p-6 bg-white rounded-xl shadow-sm">
        <div className="flex items-center gap-2 mb-6">
          <button
            onClick={() => navigate("/dashboard")}
            className="text-gray-600 hover:text-primary transition-all duration-300"
          >
            <MdArrowBack className="text-2xl" />
          </button>
          <h1 className="text-2xl font-bold">My Nuggets</h1>
        </div>

        {error && error !== "Not authenticated" && (
          <div className="p-4 mb-6 bg-red-50 text-red-600 rounded-lg border border-red-200">
            <p>{error}</p>
          </div>
        )}

        {nuggets?.length === 0 ? (
          <div className="text-center py-10">
            <p className="text-gray-500 mb-4">
              You haven't saved any nuggets yet.
            </p>
            <Button color="primary" onClick={() => navigate("/nuggets")}>
              Explore Nuggets
            </Button>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {nuggets?.map((nugget) => (
                <Card
                  key={nugget.id}
                  className="h-full shadow-sm hover:shadow-md transition-shadow cursor-pointer"
                  onClick={() => openDrawer(nugget)}
                >
                  <CardHeader className="flex justify-between">
                    <div>
                      <p className="text-sm text-gray-500">
                        {nugget.citation_no || nugget.dl_citation_no}
                      </p>
                    </div>
                    <div>
                      <span className="bg-primary/10 text-primary px-2 py-1 rounded-full text-xs">
                        {nugget.year}
                      </span>
                    </div>
                  </CardHeader>
                  <CardBody>
                    <h3 className="font-semibold line-clamp-2 mb-2">
                      {nugget.headnote || nugget.title}
                    </h3>
                    <p className="text-sm text-gray-600 line-clamp-3">
                      {nugget.principle}
                    </p>
                  </CardBody>
                  <CardFooter>
                    <Button
                      size="sm"
                      variant="flat"
                      color="primary"
                      onClick={(e) => {
                        e.stopPropagation();
                        navigate(`/nuggets/${nugget.id}`);
                      }}
                    >
                      View Details
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>

            {totalPages > 1 && (
              <div className="flex justify-center mt-8">
                <Pagination
                  total={totalPages}
                  initialPage={currentPage}
                  onChange={(page) => navigate(`/my-nuggets?page=${page}`)}
                />
              </div>
            )}
          </>
        )}
      </div>

      {/* Nugget Drawer for viewing details */}
      {selectedNugget && (
        <div
          className={`fixed right-0 top-0 h-full w-[400px] bg-white shadow-lg transition-transform duration-300 border-l overflow-y-auto ${
            isDrawerOpen ? "translate-x-0" : "translate-x-full"
          }`}
        >
          {isDrawerOpen && selectedNugget && (
            <div className="p-6 flex flex-col h-full">
              <button
                className="text-gray-600 hover:text-primary self-end"
                onClick={closeDrawer}
              >
                ✕ Close
              </button>

              <div className="mt-2">
                <span className="bg-blue-50 text-blue-800 px-2 py-1 text-xs rounded-full">
                  {selectedNugget.status || "Published"}
                </span>
              </div>

              <div className="mt-4 flex justify-between items-center">
                <span className="text-sm font-semibold">
                  {selectedNugget.citation_no || selectedNugget.dl_citation_no}
                </span>
                <span className="bg-primary/10 text-primary px-3 py-1 rounded-full text-sm">
                  {selectedNugget.year}
                </span>
              </div>

              <h2 className="font-bold text-xl mt-4">
                {selectedNugget.headnote || selectedNugget.title}
              </h2>

              {selectedNugget.principle && (
                <div className="mt-4">
                  <p className="text-sm text-gray-500 font-semibold">
                    PRINCIPLE:
                  </p>
                  <p className="text-gray-700 mt-1">
                    {selectedNugget.principle}
                  </p>
                </div>
              )}

              {selectedNugget.keywords &&
                selectedNugget.keywords?.length > 0 && (
                  <div className="mt-4">
                    <p className="text-sm text-gray-500 font-semibold mb-2">
                      KEYWORDS:
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {selectedNugget?.keywords?.map((keywordObj, index) => (
                        <span
                          key={index}
                          className="px-2 py-1 bg-gray-100 text-gray-800 text-xs rounded-full"
                        >
                          {keywordObj.keyword.value}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

              {selectedNugget.judge && (
                <div className="mt-4">
                  <p className="text-sm text-gray-500 font-semibold">JUDGE:</p>
                  <p className="text-gray-700">
                    {selectedNugget.judge.fullname}{" "}
                    {selectedNugget.judge_title &&
                      `(${selectedNugget.judge_title})`}
                  </p>
                </div>
              )}

              <div className="mt-6 flex justify-end">
                <Button
                  color="primary"
                  onClick={() => navigate(`/nuggets/${selectedNugget.id}`)}
                >
                  View Full Details
                </Button>
              </div>
            </div>
          )}
        </div>
      )}
    </AdminLayout>
  );
}
