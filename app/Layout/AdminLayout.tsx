import { useState, useEffect } from "react";
import axios from "axios";
import { Link, NavLink, useLocation, useNavigation } from "@remix-run/react";
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
} from "@nextui-org/react";
import { IoMenuOutline } from "react-icons/io5";
import { MdHome, MdSearch, MdBookmark, MdVerifiedUser } from "react-icons/md";
import logo from "~/images/logo.png";

interface NavItem {
  icon: React.ReactNode;
  label: string;
  path: string;
}

const navItems: NavItem[] = [
  {
    icon: <MdHome className="text-xl" />,
    label: "Explore",
    path: "/dashboard",
  },
  {
    icon: <MdBookmark className="text-xl" />,
    label: "Lex Nuggets",
    path: "/nuggets",
  },
  {
    icon: <MdVerifiedUser className="text-xl" />,
    label: "My Profile",
    path: "/profile",
  },
];

const AdminLayout = ({ children }: { children: React.ReactNode }) => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [suggestions, setSuggestions] = useState([]);
  const [loading, setLoading] = useState(false);
  const location = useLocation();
  const navigation = useNavigation();
  const isLoading = navigation.state === "loading";

  useEffect(() => {
    const checkScreenSize = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
      setIsCollapsed(true);
    };
    checkScreenSize();
    window.addEventListener("resize", checkScreenSize);
    return () => window.removeEventListener("resize", checkScreenSize);
  }, []);

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

  return (
    <div className="overflow-y-hidden min-h-screen bg-slate-50">
      <div className="flex px-2 py-2 gap-4">
        {/* Sidebar */}
        <aside
          className={`fixed md:flex hidden h-[97vh] gap-4 flex flex-col transition-all duration-300 z-50
          ${
            isMobile
              ? isCollapsed
                ? "-translate-x-full"
                : "translate-x-0"
              : isCollapsed
              ? "w-[70px]"
              : "w-[250px]"
          }`}
        >
          {/* Sidebar Header */}
          <div className="h-16 flex items-center justify-between px-4 bg-white rounded-xl shadow-lg">
            {!isCollapsed && <h1 className="text-xl font-bold">DL Nuggets</h1>}
            <Button
              isIconOnly
              variant="light"
              onClick={() => setIsCollapsed(!isCollapsed)}
              className="ml-auto"
            >
              <img src={logo} alt="Logo" />
            </Button>
          </div>

          {/* Navigation Items */}
          <nav
            className={`p-2 flex flex-col gap-3 shadow-lg h-full bg-white text-gray-500 rounded-xl  ${
              isCollapsed ? " items-center" : ""
            }`}
          >
            {navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-colors
                  ${
                    location.pathname === item.path
                      ? " text-blue-600"
                      : "hover:bg-white hover:shadow-sm hover:text-[#249DD0]"
                  }
                `}
              >
                {item.icon}
                {!isCollapsed && <span>{item.label}</span>}
              </Link>
            ))}
          </nav>
        </aside>

        <main className="flex-1 overflow-auto">
          <header className="h-16 bg-white shadow-sm border border-black/5 px-4 flex items-center justify-between rounded-xl">
            {isMobile && (
              <Button
                isIconOnly
                variant="light"
                onClick={() => setIsCollapsed(!isCollapsed)}
                className="mr-4"
              >
                <IoMenuOutline className="text-xl" />
              </Button>
            )}
            <h2 className="text-xl font-semibold">
              {navItems.find((item) => item.path === location.pathname)
                ?.label || "Dashboard"}
            </h2>
            <Button
              isIconOnly
              variant="light"
              onClick={() => setIsSearchOpen(true)}
            >
              <MdSearch className="text-2xl" />
            </Button>
          </header>

          <div className="mb-16 md:mb-0">{children}</div>

          <div className="flex-1 md:hidden flex text-gray-500 overflow-auto fixed bottom-0 w-full bg-white h-14 p-2 border-t border-gray-200">
            <NavLink
              to="/dashboard"
              className="flex-1 flex flex-col items-center justify-center"
            >
              <MdHome className="text-2xl" />
              <span className="text-xs">Home</span>
            </NavLink>
            <NavLink
              to="/nuggets"
              className="flex-1 flex flex-col items-center justify-center"
            >
              <MdBookmark className="text-2xl" />
              <span className="text-xs">Nuggets</span>
            </NavLink>
            <NavLink
              to="/search"
              className="flex-1 flex flex-col items-center justify-center"
            >
              <MdSearch className="text-2xl" />
              <span className="text-xs">Search</span>
            </NavLink>
            <NavLink
              to="/profile"
              className="flex-1 flex flex-col items-center justify-center"
            >
              <MdVerifiedUser className="text-2xl" />
              <span className="text-xs">Profile</span>
            </NavLink>
          </div>
        </main>
      </div>

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
            />
            {suggestions.length > 0 && (
              <div className="absolute w-full bg-white shadow-lg rounded-lg mt-2">
                {suggestions.map((user) => (
                  <div
                    key={user.id}
                    className="p-2 hover:bg-gray-100 cursor-pointer"
                    onClick={() => setSearchQuery(user.firstName)}
                  >
                    {user.firstName} {user.lastName}
                  </div>
                ))}
              </div>
            )}
            <div className="flex gap-2 mt-4">
              <Button onClick={handleSearch}>Search</Button>
              <Button
                onClick={() => setSearchQuery("")}
                className="bg-red-500 text-white"
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
