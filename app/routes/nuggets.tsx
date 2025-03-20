import { useState, useEffect } from "react";
import { Button } from "@nextui-org/react";
import AdminLayout from "../Layout/AdminLayout";
import { MdArrowRight } from "react-icons/md";
import {
  Link,
  Outlet,
  useLoaderData,
  useLocation,
  useNavigate,
  useSearchParams,
} from "@remix-run/react";
import axios from "axios";
import { LoaderFunction } from "@remix-run/node";

// Define types for our data
interface Item {
  id: number;
  name: string;
}

interface PaginatedResponse {
  current_page: number;
  data: Item[];
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

interface CategoryData {
  areaOfLaw: PaginatedResponse | null;
  courts: PaginatedResponse | null;
  judges: PaginatedResponse | null;
}

type CategoryType = "areaOfLaw" | "courts" | "judges";

const Nuggets = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const defaultCategory =
    (searchParams.get("category") as CategoryType) || "areaOfLaw";
  const [selectedCategory, setSelectedCategory] =
    useState<CategoryType>(defaultCategory);
  const [categoryData, setCategoryData] = useState<CategoryData>({
    areaOfLaw: null,
    courts: null,
    judges: null,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { baseUrl } = useLoaderData<typeof loader>();

  // Fetch data based on category
  const fetchCategoryData = async (category: CategoryType) => {
    setLoading(true);
    setError(null);
    try {
      let endpoint = "";
      switch (category) {
        case "areaOfLaw":
          endpoint = "/area-of-law";
          break;
        case "courts":
          endpoint = "/courts";
          break;
        case "judges":
          endpoint = "/judges";
          break;
      }
      const response = await axios.get(`${baseUrl}${endpoint}`);
      setCategoryData((prev) => ({
        ...prev,
        [category]: response.data,
      }));
    } catch (err) {
      setError("Failed to fetch data. Please try again later.");
      console.error("Error fetching data:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategoryData(selectedCategory);
  }, [selectedCategory]);

  // Update URL query when a category is selected
  const updateCategory = (category: CategoryType) => {
    setSelectedCategory(category);
    setSearchParams({ category });
  };
  const location = useLocation();
  const pathname = location.pathname;

  // Get data based on selected category
  const getCategoryData = () => {
    const data = categoryData[selectedCategory];
    return data?.data || [];
  };

  const navigate = useNavigate();

  return (
    <AdminLayout>
      <div className="pt-2 flex flex-col gap-2">
        {["/nuggets", "/nuggets/courts", "/nuggets/judges"].includes(
          pathname
        ) && (
          <div className="w-full flex justify-center">
            <div className="flex gap-2 p-2 rounded-xl shadow-sm max-w-max bg-white mx-auto">
              <Button
                size="sm"
                onPress={() => navigate("/nuggets")}
                className={`transition-all duration-300 px-6 py-2 rounded-lg 
                            ${
                              pathname === "/nuggets"
                                ? "bg-primary text-white"
                                : "bg-gray-200 text-black hover:bg-primary hover:text-white active:bg-primary"
                            }
                        `}
              >
                Area of Law
              </Button>
              <Button
                size="sm"
                onPress={() => navigate("/nuggets/courts")}
                className={`transition-all duration-300 px-6 py-2 rounded-lg 
                            ${
                              pathname === "/nuggets/courts"
                                ? "bg-primary text-white"
                                : "bg-gray-200 text-black hover:bg-primary hover:text-white active:bg-primary"
                            }
                        `}
              >
                Courts
              </Button>
              <Button
                size="sm"
                onPress={() => navigate("/nuggets/judges")}
                className={`transition-all duration-300 px-6 py-2 rounded-lg 
                            ${
                              pathname === "/nuggets/judges"
                                ? "bg-primary text-white"
                                : "bg-gray-200 text-black hover:bg-primary hover:text-white active:bg-primary"
                            }
                        `}
              >
                Judges
              </Button>
            </div>
          </div>
        )}

        <Outlet />
      </div>
    </AdminLayout>
  );
};

export default Nuggets;

export const loader: LoaderFunction = async () => {
  const baseUrl = process.env.NEXT_PUBLIC_DL_LIVE_URL;

  return { baseUrl };
};
