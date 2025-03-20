import { useState, useEffect, useRef, useCallback } from "react";
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
  initialAreaOfLaw: string | null;
  initialKeyword: string | null;
  initialJudge: string | null;
  initialYear: string | null;
}

export const meta: MetaFunction = ({ data }) => {
  const query = (data as LoaderData)?.initialQuery || "";
  return [
    { title: query ? `Search: ${query} | Dennislaw` : "Search | Dennislaw" },
    {
      name: "description",
      content:
        "Search for legal nuggets across different areas of law, courts, and judges",
    },
    {
      name: "og:title",
      content: query ? `Search: ${query} | Dennislaw` : "Search | Dennislaw",
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
  const areaoflaw = url.searchParams.get("areaoflaw");
  const keyword = url.searchParams.get("keyword");
  const judge = url.searchParams.get("judge");
  const year = url.searchParams.get("year");
  const baseUrl = process.env.NEXT_PUBLIC_DL_LIVE_URL;

  return json({
    baseUrl,
    initialQuery: query,
    initialAreaOfLaw: areaoflaw,
    initialKeyword: keyword,
    initialJudge: judge,
    initialYear: year,
  });
};

const Search = () => {
  const {
    baseUrl,
    initialQuery,
    initialAreaOfLaw,
    initialKeyword,
    initialJudge,
    initialYear,
  } = useLoaderData<LoaderData>();
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
  const [selectedAreaOfLaw, setSelectedAreaOfLaw] = useState<string>(
    initialAreaOfLaw || ""
  );
  const [selectedKeyword, setSelectedKeyword] = useState<string>(
    initialKeyword || ""
  );
  const [selectedJudge, setSelectedJudge] = useState<string>(
    initialJudge || ""
  );
  const [selectedYear, setSelectedYear] = useState<string>(initialYear || "");

  // Filter data states
  const [areasOfLaw, setAreasOfLaw] = useState<
    Array<{ id: number; value: string; display_name?: string }>
  >([]);
  const [keywords, setKeywords] = useState<
    Array<{ id: number; value: string }>
  >([]);
  const [judges, setJudges] = useState<Array<{ id: number; fullname: string }>>(
    []
  );
  const [loadingFilters, setLoadingFilters] = useState(false);

  const navigate = useNavigate();

  // Generate years dynamically (current year to 30 years ago)
  const years = Array.from({ length: 30 }, (_, i) =>
    (new Date().getFullYear() - i).toString()
  );

  // Trending keywords for the trending topics section
  const trendingKeywords = [
    "Constitutional Law",
    "Criminal Procedure",
    "Tort Law",
    "Evidence",
    "Contract Law",
    "Property Law",
  ];

  // Load filter data on component mount
  useEffect(() => {
    fetchFilterData();
  }, []);

  // Run search if query or filters are provided in URL on initial component mount
  useEffect(() => {
    const hasFilters =
      initialQuery ||
      initialAreaOfLaw ||
      initialKeyword ||
      initialJudge ||
      initialYear;

    console.log("Initial URL parameters:", {
      query: initialQuery,
      areaoflaw: initialAreaOfLaw,
      keyword: initialKeyword,
      judge: initialJudge,
      year: initialYear,
    });

    if (hasFilters) {
      // Once filter data is loaded, perform the search
      if (
        !loadingFilters &&
        areasOfLaw.length > 0 &&
        keywords.length > 0 &&
        judges.length > 0
      ) {
        // Special handling for numeric judge IDs in URL
        if (initialJudge && /^\d+$/.test(initialJudge)) {
          console.log(`Using judge_id ${initialJudge} for search`);

          // Create a special set of params for direct ID search
          const params: Record<string, any> = {
            limit: 12,
          };

          if (initialQuery) params.q = initialQuery;

          // Use judge_id directly instead of judge parameter
          params.judge_id = initialJudge;

          setLoading(true);
          axios
            .get(`${baseUrl}/nuggets/search`, { params })
            .then((response) => {
              console.log("Direct judge_id search response:", response.data);
              setResults(response.data?.data || []);
              setTotalResults(response.data?.meta?.total || 0);
              setCurrentPage(response.data?.meta?.current_page || 1);
              setTotalPages(response.data?.meta?.last_page || 1);
            })
            .catch((error) => {
              console.error("Search error:", error);
              setError("Failed to perform search. Please try again.");
              setResults([]);
            })
            .finally(() => {
              setLoading(false);
            });
        } else {
          // Use the standard search for all other cases
          console.log("Using standard search handler");
          handleSearch(initialQuery || "", 1);
        }
      }
    }
  }, [
    initialQuery,
    initialAreaOfLaw,
    initialKeyword,
    initialJudge,
    initialYear,
    loadingFilters,
    areasOfLaw,
    keywords,
    judges,
  ]);

  // Function to fetch all filter data
  const fetchFilterData = async () => {
    setLoadingFilters(true);
    try {
      // Fetch areas of law
      const aolResponse = await axios.get(`${baseUrl}/area-of-law`);
      if (aolResponse.data && aolResponse.data.data) {
        setAreasOfLaw(aolResponse.data.data);
      }

      // Fetch judges
      const judgesResponse = await axios.get(`${baseUrl}/judges`);
      if (judgesResponse.data && judgesResponse.data.data) {
        setJudges(judgesResponse.data.data);
      }

      // Fetch keywords using the new endpoint
      const keywordsResponse = await axios.get(`${baseUrl}/keywords`);
      if (keywordsResponse.data && keywordsResponse.data.data) {
        setKeywords(keywordsResponse.data.data);
      } else {
        // Fallback to sample data if API fails
        setKeywords([
          { id: 1, value: "Evidence" },
          { id: 2, value: "Procedure" },
          { id: 3, value: "Rights" },
          { id: 4, value: "Contract" },
          { id: 5, value: "Liability" },
          { id: 6, value: "Damages" },
        ]);
      }

      // After filter data is loaded, check for direct ID parameters and update UI
      const directAreaId = searchParams.get("areaoflaw");
      const directKeywordId = searchParams.get("keyword");
      const directJudgeId = searchParams.get("judge");

      // If we have a numeric ID in the URL, find the display value for the UI
      if (directAreaId && /^\d+$/.test(directAreaId)) {
        const area = aolResponse.data.data.find(
          (a: any) => a.id.toString() === directAreaId
        );
        if (area) {
          setSelectedAreaOfLaw(area.value);
        }
      }

      if (directKeywordId && /^\d+$/.test(directKeywordId)) {
        const keyword = keywordsResponse.data.data.find(
          (k: any) => k.id.toString() === directKeywordId
        );
        if (keyword) {
          setSelectedKeyword(keyword.value);
        }
      }

      if (directJudgeId && /^\d+$/.test(directJudgeId)) {
        // Use the judges data we just loaded
        const judge = judgesResponse.data.data.find(
          (j: any) => j.id.toString() === directJudgeId
        );
        if (judge) {
          setSelectedJudge(judge.fullname);
        }
      }
    } catch (error) {
      console.error("Error fetching filter data:", error);
      // Set fallback data for keywords if API fails
      setKeywords([
        { id: 1, value: "Evidence" },
        { id: 2, value: "Procedure" },
        { id: 3, value: "Rights" },
        { id: 4, value: "Contract" },
        { id: 5, value: "Liability" },
        { id: 6, value: "Damages" },
      ]);
    } finally {
      setLoadingFilters(false);
    }
  };

  // Load recent searches from localStorage
  useEffect(() => {
    if (typeof window !== "undefined") {
      const savedSearches = localStorage.getItem("recentSearches");
      if (savedSearches) {
        setRecentSearches(JSON.parse(savedSearches));
      }
    }
  }, []);

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

  // Advanced Filters Card
  const renderFiltersCard = () => {
    if (!showFilters) return null;

    return (
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
                setSelectedAreaOfLaw(Array.from(keys as Set<string>)[0] || "")
              }
              className="w-full"
              isLoading={loadingFilters}
            >
              {areasOfLaw.map((area) => (
                <SelectItem key={area.id.toString()} value={area.value}>
                  {area.value}
                </SelectItem>
              ))}
            </Select>

            <Select
              label="Keyword"
              placeholder="Select keyword"
              selectedKeys={selectedKeyword ? [selectedKeyword] : []}
              onSelectionChange={(keys) =>
                setSelectedKeyword(Array.from(keys as Set<string>)[0] || "")
              }
              className="w-full"
              isLoading={loadingFilters}
            >
              {keywords.map((keyword) => (
                <SelectItem key={keyword.id.toString()} value={keyword.value}>
                  {keyword.value}
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
              isLoading={loadingFilters}
            >
              {judges.map((judge) => (
                <SelectItem key={judge.id.toString()} value={judge.fullname}>
                  {judge.fullname}
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
    );
  };

  // Original search handler with UI state
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

      // For direct ID searches, we need to handle them differently
      // Check URL parameters to see if we have direct IDs
      const directAreaId = searchParams.get("areaoflaw");
      const directKeywordId = searchParams.get("keyword");
      const directJudgeId = searchParams.get("judge");

      // If we have direct numeric IDs in the URL, use those
      if (directAreaId && /^\d+$/.test(directAreaId)) {
        params.areaoflaw = directAreaId;
      } else if (selectedAreaOfLaw) {
        // Otherwise use the selected values from the UI
        const selectedArea = areasOfLaw.find(
          (area) => area.value === selectedAreaOfLaw
        );
        params.areaoflaw = selectedArea ? selectedArea.id : selectedAreaOfLaw;
      }

      if (directKeywordId && /^\d+$/.test(directKeywordId)) {
        params.keyword = directKeywordId;
      } else if (selectedKeyword) {
        const selectedKey = keywords.find(
          (keyword) => keyword.value === selectedKeyword
        );
        params.keyword = selectedKey ? selectedKey.id : selectedKeyword;
      }

      // Use judge_id parameter for the API instead of judge
      // This matches the backend expectation in judge() method
      if (directJudgeId && /^\d+$/.test(directJudgeId)) {
        // For numeric judge IDs, use judge_id not judge
        params.judge_id = directJudgeId;
      } else if (selectedJudge) {
        const selectedJudgeObj = judges.find(
          (judge) => judge.fullname === selectedJudge
        );
        if (selectedJudgeObj) {
          params.judge_id = selectedJudgeObj.id;
        } else {
          params.judge = selectedJudge;
        }
      }

      if (selectedYear) {
        params.year = selectedYear;
      }

      // Update URL params for user-friendly URLs
      // We'll keep the display values in the URL for better UX
      const urlParams: Record<string, string> = {};
      if (query.trim()) urlParams.q = query.trim();
      if (selectedAreaOfLaw) urlParams.areaoflaw = selectedAreaOfLaw;
      if (selectedKeyword) urlParams.keyword = selectedKeyword;
      if (selectedJudge) urlParams.judge = selectedJudge;
      if (selectedYear) urlParams.year = selectedYear;
      if (page > 1) urlParams.page = page.toString();

      // If we had direct IDs in the URL and no UI selection, keep the ID in the URL
      if (directAreaId && /^\d+$/.test(directAreaId) && !selectedAreaOfLaw) {
        urlParams.areaoflaw = directAreaId;
      }
      if (
        directKeywordId &&
        /^\d+$/.test(directKeywordId) &&
        !selectedKeyword
      ) {
        urlParams.keyword = directKeywordId;
      }
      if (directJudgeId && /^\d+$/.test(directJudgeId) && !selectedJudge) {
        urlParams.judge = directJudgeId;
      }

      setSearchParams(urlParams);

      // Save to recent searches if there's a query
      if (query.trim()) {
        saveRecentSearch(query);
      }

      console.log("Search params:", params);
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

  return (
    <AdminLayout>
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-2xl font-bold mb-4">Search Dennislaw</h1>

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
          {renderFiltersCard()}

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
                  detailsPath={`/nuggets/details/${nugget.id}`}
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
