import { useState, useEffect, useRef } from "react";
import axios from "axios";
import {
  Link,
  useLocation,
  useNavigate,
  useSearchParams,
  useLoaderData,
} from "@remix-run/react";
import {
  Button,
  Input,
  Card,
  CardBody,
  Spinner,
  Chip,
  Pagination,
} from "@nextui-org/react";
import { MdSearch, MdHistory, MdClear, MdTrendingUp } from "react-icons/md";
import AdminLayout from "~/Layout/AdminLayout";
import NuggetCard from "~/components/NuggetCard";
import { Nugget } from "~/components/NuggetDrawer";
import { LoaderFunction, MetaFunction, json } from "@remix-run/node";

interface SearchResult {
  nuggets: Nugget[];
  totalResults: number;
  currentPage: number;
  totalPages: number;
}

interface LoaderData {
  baseUrl: string;
  initialQuery: string | null;
}

export const meta: MetaFunction = ({ data }) => {
  const query = (data as LoaderData)?.initialQuery || "";
  return [
    { title: query ? `Search: ${query} | Dennis Law` : "Search | Dennis Law" },
    {
      name: "description",
      content:
        "Search for legal nuggets across different areas of law, courts, and judges",
    },
    {
      name: "og:title",
      content: query ? `Search: ${query} | Dennis Law` : "Search | Dennis Law",
    },
    {
      name: "og:description",
      content:
        "Find relevant legal principles and case law with our powerful search engine",
    },
  ];
};

export const loader: LoaderFunction = async ({ request }) => {
  const url = new URL(request.url);
  const query = url.searchParams.get("q");
  const baseUrl = process.env.NEXT_PUBLIC_DL_LIVE_URL;

  return json({
    baseUrl,
    initialQuery: query,
  });
};

const Search = () => {
  const { baseUrl, initialQuery } = useLoaderData<LoaderData>();
  const [searchParams, setSearchParams] = useSearchParams();
  const [searchQuery, setSearchQuery] = useState(initialQuery || "");
  const [results, setResults] = useState<Nugget[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedNugget, setSelectedNugget] = useState<Nugget | null>(null);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const [totalResults, setTotalResults] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const navigate = useNavigate();

  const trendingKeywords = [
    "Constitutional Law",
    "Criminal Procedure",
    "Tort Law",
    "Evidence",
    "Contract Law",
    "Property Law",
  ];

  // Load recent searches from localStorage
  useEffect(() => {
    if (typeof window !== "undefined") {
      const savedSearches = localStorage.getItem("recentSearches");
      if (savedSearches) {
        setRecentSearches(JSON.parse(savedSearches));
      }
    }
  }, []);

  // Run search if query is provided in URL
  useEffect(() => {
    if (initialQuery) {
      handleSearch(initialQuery, 1);
    }
  }, [initialQuery]);

  // Save recent searches to localStorage
  const saveRecentSearch = (query: string) => {
    if (!query.trim()) return;

    // Add to recent searches without duplicates and keep only last 5
    const updatedSearches = [
      query,
      ...recentSearches.filter((item) => item !== query),
    ].slice(0, 5);

    setRecentSearches(updatedSearches);

    if (typeof window !== "undefined") {
      localStorage.setItem("recentSearches", JSON.stringify(updatedSearches));
    }
  };

  const handleSearch = async (query: string, page: number = 1) => {
    if (!query.trim()) return;

    setLoading(true);
    setError(null);

    try {
      // Update URL params
      setSearchParams({ q: query });

      // Save to recent searches
      saveRecentSearch(query);

      const response = await axios.get(`${baseUrl}/nuggets/search`, {
        params: {
          query: query.trim(),
          page,
          limit: 12,
        },
      });

      setResults(response.data?.data || []);
      setTotalResults(response.data?.meta?.total || 0);
      setCurrentPage(response.data?.meta?.current_page || 1);
      setTotalPages(response.data?.meta?.last_page || 1);
    } catch (error) {
      console.error("Search error:", error);
      setError("Failed to perform search. Please try again.");
      setResults([]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeywordClick = (keyword: string) => {
    setSearchQuery(keyword);
    handleSearch(keyword);
  };

  const handleClearSearch = () => {
    setSearchQuery("");
    setResults([]);
    setSearchParams({});
  };

  const handleClearRecentSearches = () => {
    setRecentSearches([]);
    if (typeof window !== "undefined") {
      localStorage.removeItem("recentSearches");
    }
  };

  const handleViewNugget = (nugget: Nugget) => {
    setSelectedNugget(nugget);
    navigate(`/nuggets/${nugget.id}`);
  };

  return (
    <AdminLayout>
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-2xl font-bold mb-4">Search Dennis Law</h1>

          <div className="flex gap-2">
            <Input
              type="text"
              placeholder="Search for cases, principles, keywords..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyPress={(e) => e.key === "Enter" && handleSearch(searchQuery)}
              startContent={<MdSearch className="text-gray-400" />}
              endContent={
                searchQuery ? (
                  <MdClear
                    className="text-gray-400 cursor-pointer"
                    onClick={handleClearSearch}
                  />
                ) : null
              }
              classNames={{
                input: "text-lg",
              }}
              className="flex-1"
            />
            <Button
              color="primary"
              isLoading={loading}
              onClick={() => handleSearch(searchQuery)}
            >
              Search
            </Button>
          </div>
        </div>

        {/* Recent Searches */}
        {recentSearches.length > 0 && !results.length && !loading && (
          <div className="mb-8">
            <div className="flex justify-between items-center mb-3">
              <div className="flex items-center gap-2">
                <MdHistory className="text-gray-500" />
                <h2 className="text-lg font-semibold">Recent Searches</h2>
              </div>
              <Button
                size="sm"
                variant="light"
                color="danger"
                onClick={handleClearRecentSearches}
              >
                Clear
              </Button>
            </div>
            <div className="flex flex-wrap gap-2">
              {recentSearches.map((term, index) => (
                <Chip
                  key={index}
                  variant="flat"
                  color="default"
                  className="cursor-pointer hover:bg-gray-200 transition-colors"
                  onClick={() => {
                    setSearchQuery(term);
                    handleSearch(term);
                  }}
                >
                  {term}
                </Chip>
              ))}
            </div>
          </div>
        )}

        {/* Trending or Popular Searches */}
        {!results.length && !loading && (
          <div className="mb-8">
            <div className="flex items-center gap-2 mb-3">
              <MdTrendingUp className="text-primary" />
              <h2 className="text-lg font-semibold">Trending Topics</h2>
            </div>
            <div className="flex flex-wrap gap-2">
              {trendingKeywords.map((keyword, index) => (
                <Chip
                  key={index}
                  variant="flat"
                  color="primary"
                  className="cursor-pointer hover:bg-primary/20 transition-colors"
                  onClick={() => handleKeywordClick(keyword)}
                >
                  {keyword}
                </Chip>
              ))}
            </div>
          </div>
        )}

        {/* Search Status */}
        {loading && (
          <div className="flex flex-col items-center justify-center py-12">
            <Spinner size="lg" color="primary" />
            <p className="mt-4 text-gray-600">Searching the database...</p>
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="p-4 mb-6 bg-red-50 text-red-600 rounded-lg border border-red-200">
            <p>{error}</p>
          </div>
        )}

        {/* Search Results */}
        {!loading && results.length > 0 && (
          <div>
            <div className="mb-4">
              <p className="text-gray-600">
                Found {totalResults} results for "{searchQuery}"
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
              {results.map((nugget) => (
                <NuggetCard
                  key={nugget.id}
                  nugget={nugget}
                  onClick={handleViewNugget}
                  isSelected={false}
                />
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex justify-center mt-6">
                <Pagination
                  color="secondary"
                  page={currentPage}
                  total={Math.ceil(totalPages)}
                  showControls
                  onChange={(page) => handleSearch(searchQuery, page)}
                />
              </div>
            )}
          </div>
        )}

        {/* No Results */}
        {!loading && searchParams.get("q") && results.length === 0 && (
          <div className="text-center py-12">
            <div className="text-5xl mb-4">🔍</div>
            <h2 className="text-xl font-semibold mb-2">No results found</h2>
            <p className="text-gray-600 mb-4">
              We couldn't find any nuggets matching "{searchParams.get("q")}".
            </p>
            <p className="text-gray-600">
              Try using different keywords or check your spelling.
            </p>
          </div>
        )}
      </div>
    </AdminLayout>
  );
};

export default Search;
