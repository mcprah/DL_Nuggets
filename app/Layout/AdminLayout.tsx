import { useState, useEffect } from "react";
import axios from "axios";
import {
  Link,
  NavLink,
  useLocation,
  useNavigate,
  useNavigation,
} from "@remix-run/react";
import {
  Button,
  User,
  Modal,
  ModalBody,
  ModalHeader,
  ModalContent,
  Input,
  Card,
  CardBody,
  Dropdown,
  DropdownTrigger,
  DropdownMenu,
  DropdownItem,
  Avatar,
  Tooltip,
} from "@nextui-org/react";
import { IoMenuOutline } from "react-icons/io5";
import {
  MdHome,
  MdSearch,
  MdBookmark,
  MdVerifiedUser,
  MdLogout,
  MdSettings,
  MdNotifications,
  MdChevronLeft,
  MdChevronRight,
  MdBookOnline,
  MdBook,
  MdBookmarks,
} from "react-icons/md";
import logo from "~/images/logo.png";

interface NavItem {
  icon: React.ReactNode;
  label: string;
  path: string;
  content: string;
}

// Define SearchUser interface to fix linter errors
interface SearchUser {
  id: number;
  firstName: string;
  lastName: string;
  image?: string;
}

const navItems: NavItem[] = [
  {
    icon: <MdHome className="text-xl" />,
    label: "Explore",
    path: "/dashboard",
    content: "Explore",
  },
  {
    icon: <MdBook className="text-xl" />,
    label: "Nuggets",
    path: "/nuggets",
    content: "Nuggets",
  },
  {
    icon: <MdBookmarks className="text-xl" />,
    label: "My Nuggets",
    path: "/my-nuggets",
    content: "My Nuggets",
  },
  {
    icon: <MdVerifiedUser className="text-xl" />,
    label: "My Profile",
    path: "/profile",
    content: "Profile",
  },
];

const AdminLayout = ({ children }: { children: React.ReactNode }) => {
  // Get initial state from localStorage or default to true (collapsed)
  const getInitialSidebarState = () => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("sidebarCollapsed");
      return saved !== null ? saved === "true" : true;
    }
    return true;
  };

  // Initialize with the correct initial state
  const [isCollapsed, setIsCollapsed] = useState(() =>
    getInitialSidebarState()
  );
  const [isMobile, setIsMobile] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<SearchUser[]>([]);
  const [suggestions, setSuggestions] = useState<SearchUser[]>([]);
  const [loading, setLoading] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const location = useLocation();
  const navigation = useNavigation();
  const navigate = useNavigate();
  const isLoading = navigation.state === "loading";

  // Effect for screen size checking
  useEffect(() => {
    const checkScreenSize = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
      if (mobile) {
        setIsCollapsed(true);
      }
    };

    checkScreenSize();
    window.addEventListener("resize", checkScreenSize);
    return () => window.removeEventListener("resize", checkScreenSize);
  }, []);

  // Save sidebar state to localStorage when it changes
  useEffect(() => {
    if (!isMobile && typeof window !== "undefined") {
      localStorage.setItem("sidebarCollapsed", String(isCollapsed));
    }
  }, [isCollapsed, isMobile]);

  useEffect(() => {
    if (searchQuery.length > 1) {
      fetchSuggestions(searchQuery);
    } else {
      setSuggestions([]);
    }
  }, [searchQuery]);

  const fetchSuggestions = async (query: string) => {
    try {
      const response = await axios.get(
        `https://dummyjson.com/users/search?q=${query}`
      );
      setSuggestions(response.data.users || []);
    } catch (error) {
      console.error("Suggestion error:", error);
      setSuggestions([]);
    }
  };

  const handleSearch = async () => {
    if (!searchQuery) return;
    setLoading(true);
    try {
      const response = await axios.get(
        `https://dummyjson.com/users/search?q=${searchQuery}`
      );
      setSearchResults(response.data.users || []);
    } catch (error) {
      console.error("Search error:", error);
      setSearchResults([]);
    }
    setLoading(false);
  };

  const handleSearchClick = () => {
    navigate("/search");
  };

  const handleLogout = () => {
    if (typeof window !== "undefined") {
      localStorage.removeItem("access_token");
      window.location.href = "/";
    }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="flex">
        {/* Fixed Sidebar */}
        <aside
          className={`fixed top-0 left-0 h-full z-40 transition-all duration-300 ease-in-out
          ${
            isMobile
              ? isCollapsed
                ? "-translate-x-full"
                : "translate-x-0 w-64"
              : isCollapsed
              ? "w-[70px]"
              : "w-64"
          }`}
        >
          {/* Sidebar Content */}
          <div className="flex flex-col h-full bg-white shadow-lg">
            {/* Logo Area */}
            <div className="flex items-center h-16 px-4 border-b bg-white">
              {!isCollapsed && (
                <h1 className="text-xl font-bold text-primary">DL Nuggets</h1>
              )}
              <div className={`${isCollapsed ? "mx-auto" : "ml-auto"}`}>
                <img src={logo} alt="Logo" className="h-10" />
              </div>
            </div>

            {/* Navigation Items */}
            <nav className="flex-1 overflow-y-auto py-6">
              <div className="px-3 space-y-1">
                {navItems.map((item) => (
                  <Tooltip key={item.path} content={item.content}>
                    <Link
                      key={item.path}
                      to={item.path}
                      className={`flex items-center gap-3 px-3 py-3 rounded-lg transition-all duration-200
                    ${
                      location.pathname === item.path
                        ? "bg-primary text-white"
                        : "text-gray-600 hover:bg-gray-100"
                    }`}
                    >
                      <div className={`${isCollapsed ? "mx-auto" : ""}`}>
                        {item.icon}
                      </div>
                      {!isCollapsed && <span>{item.label}</span>}
                    </Link>
                  </Tooltip>
                ))}
              </div>
            </nav>

            {/* Sidebar Footer */}
            <div className="border-t p-2">
              <Button
                className={`w-full justify-center bg-gray-100 text-gray-700`}
                onPress={() => setIsCollapsed(!isCollapsed)}
                isIconOnly
              >
                {isCollapsed ? (
                  <MdChevronRight className="text-xl" />
                ) : (
                  <>
                    <MdChevronLeft className="text-xl" />
                    <span className="ml-2">Collapse</span>
                  </>
                )}
              </Button>
            </div>
          </div>
        </aside>

        {/* Main Content */}
        <main
          className={`relative flex-1 transition-all duration-300 ${
            isMobile ? "ml-0" : isCollapsed ? "ml-[70px]" : "ml-64"
          }`}
        >
          {/* Header */}
          <header className="sticky top-0 z-30 h-16 bg-white shadow-sm px-4 flex items-center justify-between">
            <div className="flex items-center">
              {isMobile && (
                <Button
                  isIconOnly
                  variant="light"
                  onPress={() => setIsCollapsed(!isCollapsed)}
                  className="mr-4"
                >
                  <IoMenuOutline className="text-xl" />
                </Button>
              )}
              <h2 className="text-xl font-semibold text-gray-800">
                {navItems.find((item) => item.path === location.pathname)
                  ?.label || ""}
              </h2>
            </div>

            <div className="flex items-center gap-3">
              <Button
                isIconOnly
                variant="light"
                onPress={handleSearchClick}
                className="relative"
              >
                <MdSearch className="text-2xl text-gray-600" />
              </Button>

              {/* <Button isIconOnly variant="light" className="relative">
                <MdNotifications className="text-2xl text-gray-600" />
                <span className="absolute top-0 right-0 h-2 w-2 bg-red-500 rounded-full"></span>
              </Button> */}

              {/* User dropdown */}
              <Dropdown>
                <DropdownTrigger>
                  <Button
                    className="bg-gradient-to-r from-blue-500 to-primary p-0"
                    isIconOnly
                  >
                    <span className="text-white font-bold">JD</span>
                  </Button>
                </DropdownTrigger>
                <DropdownMenu aria-label="User actions">
                  <DropdownItem
                    key="profile"
                    startContent={<MdVerifiedUser className="text-primary" />}
                    description="Manage your account"
                    onPress={() => navigate("/profile")}
                  >
                    My Profile
                  </DropdownItem>
                  {/* <DropdownItem
                    key="settings"
                    startContent={<MdSettings className="text-gray-500" />}
                  >
                    Settings
                  </DropdownItem> */}
                  <DropdownItem
                    key="logout"
                    className="text-danger"
                    color="danger"
                    startContent={<MdLogout className="text-danger" />}
                    onPress={handleLogout}
                  >
                    Logout
                  </DropdownItem>
                </DropdownMenu>
              </Dropdown>
            </div>
          </header>

          {/* Page Content */}
          <div className="p-4 pb-20 md:pb-4">
            {/* Loading state */}
            {isLoading ? (
              <div className="flex items-center justify-center h-[calc(100vh-4rem)]">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
              </div>
            ) : (
              children
            )}
          </div>

          {/* Mobile Bottom Navigation */}
          <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-30">
            <div className="flex justify-around py-2">
              {navItems
                .filter((item) => item.path !== "/profile")
                .map((item) => (
                  <NavLink
                    key={item.path}
                    to={item.path}
                    className={({ isActive }) =>
                      `flex flex-col items-center py-1 px-3 ${
                        isActive ? "text-primary" : "text-gray-500"
                      }`
                    }
                  >
                    {item.icon}
                    <span className="text-xs mt-1">{item.label}</span>
                  </NavLink>
                ))}
              <div
                className="flex flex-col items-center py-1 px-3 text-gray-500 cursor-pointer"
                onClick={handleLogout}
              >
                <MdLogout className="text-xl" />
                <span className="text-xs mt-1">Logout</span>
              </div>
            </div>
          </div>
        </main>
      </div>

      {/* Search Modal */}
      <Modal
        isOpen={isSearchOpen}
        onOpenChange={setIsSearchOpen}
        backdrop="blur"
      >
        <ModalContent>
          <ModalHeader className="text-center">Search</ModalHeader>
          <ModalBody className="flex flex-col items-center p-6">
            <Input
              type="text"
              placeholder="Search for anything..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              startContent={<MdSearch />}
              className="w-full"
            />
            {suggestions.length > 0 && (
              <div className="w-full bg-white shadow-lg rounded-lg mt-2 max-h-60 overflow-y-auto">
                {suggestions.map((user) => (
                  <div
                    key={user.id}
                    className="p-3 hover:bg-gray-100 cursor-pointer flex items-center gap-2"
                    onClick={() => setSearchQuery(user.firstName)}
                  >
                    {user.image && (
                      <img
                        src={user.image}
                        alt={user.firstName}
                        className="w-8 h-8 rounded-full"
                      />
                    )}
                    {user.firstName} {user.lastName}
                  </div>
                ))}
              </div>
            )}
            <div className="flex gap-2 mt-4 w-full">
              <Button
                onPress={handleSearch}
                className="flex-1 bg-primary text-white"
              >
                Search
              </Button>
              <Button
                onPress={() => setSearchQuery("")}
                className="flex-1 bg-gray-200"
              >
                Clear
              </Button>
            </div>
          </ModalBody>
        </ModalContent>
      </Modal>
    </div>
  );
};

export default AdminLayout;
