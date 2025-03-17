import { useState, useEffect } from "react";
import { Button } from "@nextui-org/react";
import AdminLayout from "../Layout/AdminLayout";
import { MdArrowRight } from "react-icons/md";
import { Link, useLoaderData, useSearchParams } from "@remix-run/react";
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

  // Get data based on selected category
  const getCategoryData = () => {
    const data = categoryData[selectedCategory];
    console.log(data?.data);

    return data?.data || [];
  };

  return (
    <AdminLayout>
      <div className="pt-4 flex flex-col gap-2">
        <p className="font-nunito">
          Quickly and easily access catalogues of legal principles at play in
          any case
        </p>

        {/* Category Selection Buttons */}
        <div className="flex gap-4 p-2 rounded-xl shadow-sm max-w-max bg-white">
          <Button
            size="sm"
            onClick={() => updateCategory("areaOfLaw")}
            className={`transition-all duration-300 px-6 py-2 rounded-lg 
                            ${
                              selectedCategory === "areaOfLaw"
                                ? "bg-primary text-white"
                                : "bg-gray-200 text-black hover:bg-primary hover:text-white active:bg-primary"
                            }
                        `}
          >
            Area of Law
          </Button>
          <Button
            size="sm"
            onClick={() => updateCategory("courts")}
            className={`transition-all duration-300 px-6 py-2 rounded-lg 
                            ${
                              selectedCategory === "courts"
                                ? "bg-primary text-white"
                                : "bg-gray-200 text-black hover:bg-primary hover:text-white active:bg-primary"
                            }
                        `}
          >
            Courts
          </Button>
          <Button
            size="sm"
            onClick={() => updateCategory("judges")}
            className={`transition-all duration-300 px-6 py-2 rounded-lg 
                            ${
                              selectedCategory === "judges"
                                ? "bg-primary text-white"
                                : "bg-gray-200 text-black hover:bg-primary hover:text-white active:bg-primary"
                            }
                        `}
          >
            Judges
          </Button>
        </div>

        {/* Display Nuggets List */}
        <div className="mt-4">
          {loading ? (
            <div className="flex justify-center items-center h-40">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : error ? (
            <div className="text-red-500 text-center p-4">{error}</div>
          ) : (
            <div className="lg:grid lg:grid-cols-4 gap-4 bg-white p-4 shadow-sm rounded-xl border border-black/5">
              {getCategoryData().map((item) => (
                <Link
                  key={item.id}
                  to={`/nuggets/${item.id}`}
                  className="bg-white border border-black/10 flex justify-between p-3 rounded-lg shadow-sm cursor-pointer hover:bg-gray-100 transition-all duration-300"
                >
                  <p className="text-black">
                    {item.value || item.name || item.fullname}
                  </p>
                  <MdArrowRight className="text-xl text-gray-700" />
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </AdminLayout>
  );
};

export default Nuggets;

export const loader: LoaderFunction = async () => {
  const baseUrl = process.env.NEXT_PUBLIC_DL_LIVE_URL;

  return { baseUrl };
};
