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
  Select,
  SelectItem,
  Accordion,
  AccordionItem,
} from "@nextui-org/react";
import {
  MdSearch,
  MdHistory,
  MdClear,
  MdTrendingUp,
  MdFilterAlt,
  MdFilterListOff,
} from "react-icons/md";
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
  const [showFilters, setShowFilters] = useState(false);

  // Search filters
  const [selectedAreaOfLaw, setSelectedAreaOfLaw] = useState<string>("");
  const [selectedKeyword, setSelectedKeyword] = useState<string>("");
  const [selectedJudge, setSelectedJudge] = useState<string>("");
  const [selectedYear, setSelectedYear] = useState<string>("");

  const navigate = useNavigate();

  // Sample data for filter options
  const areasOfLaw = [
    "Constitutional Law",
    "Criminal Law",
    "Civil Law",
    "Family Law",
    "Administrative Law",
    "Corporate Law",
  ];

  const keywords = [
    "Evidence",
    "Procedure",
    "Rights",
    "Contract",
    "Liability",
    "Damages",
  ];

  // Trending keywords (also used for trending topics section)
  const trendingKeywords = [
    "Constitutional Law",
    "Criminal Procedure",
    "Tort Law",
    "Evidence",
    "Contract Law",
    "Property Law",
  ];

  const judges = [
    "Justice Smith",
    "Justice Johnson",
    "Justice Brown",
    "Justice Davis",
    "Justice Miller",
  ];

  const years = Array.from({ length: 30 }, (_, i) =>
    (new Date().getFullYear() - i).toString()
  );

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
    if (
      !query.trim() &&
      !selectedAreaOfLaw &&
      !selectedKeyword &&
      !selectedJudge &&
      !selectedYear
    )
      return;

    setLoading(true);
    setError(null);

    try {
      // Build search params
      const params: Record<string, any> = {
        page,
        limit: 12,
      };

      if (query.trim()) {
        params.q = query.trim();
      }

      if (selectedAreaOfLaw) {
        params.areaoflaw = selectedAreaOfLaw;
      }

      if (selectedKeyword) {
        params.keyword = selectedKeyword;
      }

      if (selectedJudge) {
        params.judge = selectedJudge;
      }

      if (selectedYear) {
        params.year = selectedYear;
      }

      // Update URL params
      setSearchParams(params);

      // Save to recent searches if there's a query
      if (query.trim()) {
        saveRecentSearch(query);
      }

      const response = await axios.get(`${baseUrl}/nuggets/search`, { params });

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

  const handleClearFilters = () => {
    setSelectedAreaOfLaw("");
    setSelectedKeyword("");
    setSelectedJudge("");
    setSelectedYear("");
  };

  const hasActiveFilters =
    selectedAreaOfLaw || selectedKeyword || selectedJudge || selectedYear;

  return (
    <AdminLayout>
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-2xl font-bold mb-4">Search Dennis Law</h1>

          <div className="flex gap-2 mb-4">
            <Input
              type="text"
              placeholder="Search for cases, principles, keywords..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyPress={(e) =>
                e.key === "Enter" && handleSearch(searchQuery, 1)
              }
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
              onClick={() => handleSearch(searchQuery, 1)}
            >
              Search
            </Button>
            <Button
              isIconOnly
              variant={hasActiveFilters ? "solid" : "flat"}
              color={hasActiveFilters ? "secondary" : "default"}
              onClick={() => setShowFilters(!showFilters)}
            >
              <MdFilterAlt />
            </Button>
          </div>

          {/* Advanced Filters */}
          {showFilters && (
            <Card className="mb-4">
              <CardBody>
                <div className="flex justify-between items-center mb-2">
                  <h2 className="text-lg font-semibold">Advanced Filters</h2>
                  {hasActiveFilters && (
                    <Button
                      size="sm"
                      variant="light"
                      color="danger"
                      startContent={<MdFilterListOff />}
                      onClick={handleClearFilters}
                    >
                      Clear Filters
                    </Button>
                  )}
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <Select
                    label="Area of Law"
                    placeholder="Select area of law"
                    selectedKeys={selectedAreaOfLaw ? [selectedAreaOfLaw] : []}
                    onSelectionChange={(keys) =>
                      setSelectedAreaOfLaw(
                        Array.from(keys as Set<string>)[0] || ""
                      )
                    }
                    className="w-full"
                  >
                    {areasOfLaw.map((area) => (
                      <SelectItem key={area} value={area}>
                        {area}
                      </SelectItem>
                    ))}
                  </Select>

                  <Select
                    label="Keyword"
                    placeholder="Select keyword"
                    selectedKeys={selectedKeyword ? [selectedKeyword] : []}
                    onSelectionChange={(keys) =>
                      setSelectedKeyword(
                        Array.from(keys as Set<string>)[0] || ""
                      )
                    }
                    className="w-full"
                  >
                    {keywords.map((keyword) => (
                      <SelectItem key={keyword} value={keyword}>
                        {keyword}
                      </SelectItem>
                    ))}
                  </Select>

                  <Select
                    label="Judge"
                    placeholder="Select judge"
                    selectedKeys={selectedJudge ? [selectedJudge] : []}
                    onSelectionChange={(keys) =>
                      setSelectedJudge(Array.from(keys as Set<string>)[0] || "")
                    }
                    className="w-full"
                  >
                    {judges.map((judge) => (
                      <SelectItem key={judge} value={judge}>
                        {judge}
                      </SelectItem>
                    ))}
                  </Select>

                  <Select
                    label="Year"
                    placeholder="Select year"
                    selectedKeys={selectedYear ? [selectedYear] : []}
                    onSelectionChange={(keys) =>
                      setSelectedYear(Array.from(keys as Set<string>)[0] || "")
                    }
                    className="w-full"
                  >
                    {years.map((year) => (
                      <SelectItem key={year} value={year}>
                        {year}
                      </SelectItem>
                    ))}
                  </Select>
                </div>
                <Button
                  className="w-full mt-4"
                  color="secondary"
                  onClick={() => handleSearch(searchQuery, 1)}
                >
                  Apply Filters
                </Button>
              </CardBody>
            </Card>
          )}

          {/* Active Filters Display */}
          {hasActiveFilters && (
            <div className="flex flex-wrap gap-2 mb-4">
              {selectedAreaOfLaw && (
                <Chip
                  variant="flat"
                  color="secondary"
                  onClose={() => setSelectedAreaOfLaw("")}
                >
                  Area: {selectedAreaOfLaw}
                </Chip>
              )}
              {selectedKeyword && (
                <Chip
                  variant="flat"
                  color="secondary"
                  onClose={() => setSelectedKeyword("")}
                >
                  Keyword: {selectedKeyword}
                </Chip>
              )}
              {selectedJudge && (
                <Chip
                  variant="flat"
                  color="secondary"
                  onClose={() => setSelectedJudge("")}
                >
                  Judge: {selectedJudge}
                </Chip>
              )}
              {selectedYear && (
                <Chip
                  variant="flat"
                  color="secondary"
                  onClose={() => setSelectedYear("")}
                >
                  Year: {selectedYear}
                </Chip>
              )}
            </div>
          )}
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
              {trendingKeywords.map((keyword: string, index: number) => (
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
