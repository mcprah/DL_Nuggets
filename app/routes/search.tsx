import { useState, useEffect, useRef } from "react";
import axios from "axios";
import { Link, useLocation, useNavigation } from "@remix-run/react";
import { Button, User, Modal, ModalBody, ModalHeader, ModalContent, Input, Card, CardBody } from "@nextui-org/react";
import { IoMenuOutline } from "react-icons/io5";
import { MdHome, MdSearch, MdBookmark, MdVerifiedUser } from "react-icons/md";
import logo from "~/images/logo.png";

interface NavItem {
    icon: React.ReactNode;
    label: string;
    path: string;
}

const navItems: NavItem[] = [
    { icon: <MdHome className="text-xl" />, label: "Explore", path: "/" },
    { icon: <MdSearch className="text-xl" />, label: "Search", path: "/search" },
    { icon: <MdBookmark className="text-xl" />, label: "Lex Nuggets", path: "/nuggets" },
    { icon: <MdVerifiedUser className="text-xl" />, label: "My Profile", path: "/admin/category" },
];

const AdminLayout = ({ children }: { children: React.ReactNode }) => {
    const [isCollapsed, setIsCollapsed] = useState(true);
    const [isMobile, setIsMobile] = useState(false);
    const [isSearchOpen, setIsSearchOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");
    const [searchResults, setSearchResults] = useState([]);
    const [suggestions, setSuggestions] = useState([]);
    const [loading, setLoading] = useState(false);
    const suggestionBoxRef = useRef(null);
    const location = useLocation();
    const navigation = useNavigation();
    const isLoading = navigation.state === "loading";

    useEffect(() => {
        if (searchQuery.length > 1) {
            fetchSuggestions(searchQuery);
        } else {
            setSuggestions([]);
        }
    }, [searchQuery]);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (suggestionBoxRef.current && !suggestionBoxRef.current.contains(event.target)) {
                setSuggestions([]);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, []);

    const fetchSuggestions = async (query: string) => {
        try {
            const response = await axios.get(`https://dummyjson.com/users/search?q=${query}`);
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
            const response = await axios.get(`https://dummyjson.com/users/search?q=${searchQuery}`);
            setSearchResults(response.data.users || []);
        } catch (error) {
            console.error("Search error:", error);
            setSearchResults([]);
        }
        setLoading(false);
    };

    return (
        <div className="overflow-y-hidden min-h-screen bg-slate-50">
            <Modal isOpen={isSearchOpen} onOpenChange={setIsSearchOpen} backdrop="blur">
                <ModalContent>
                    <ModalHeader className="text-center">Search</ModalHeader>
                    <ModalBody className="flex flex-col items-center p-6">
                        <div className="relative w-full" ref={suggestionBoxRef}>
                            <Input
                                type="text"
                                placeholder="Search for anything..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                            {suggestions.length > 0 && (
                                <div className="absolute top-full left-0 w-full bg-white border rounded-lg shadow-md z-10">
                                    {suggestions.map((suggestion, index) => (
                                        <div
                                            key={index}
                                            className="p-2 hover:bg-gray-200 cursor-pointer"
                                            onClick={() => {
                                                setSearchQuery(suggestion.firstName + " " + suggestion.lastName);
                                                setSuggestions([]);
                                            }}
                                        >
                                            {suggestion.firstName} {suggestion.lastName}
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                        <div className="flex gap-2 mt-4">
                            <Button onClick={handleSearch}>Search</Button>
                            <Button onClick={() => setSearchQuery("")} className="bg-red-500 text-white">Clear</Button>
                        </div>
                        {loading && <p>Loading...</p>}
                        {searchResults.length > 0 && (
                            <div className="mt-4 w-full">
                                {searchResults.map((user) => (
                                    <Card key={user.id} className="p-4 bg-white rounded-xl shadow">
                                        <CardBody>
                                            <h3 className="text-lg font-semibold">{user.firstName} {user.lastName}</h3>
                                            <p className="text-gray-600">Email: {user.email}</p>
                                        </CardBody>
                                    </Card>
                                ))}
                            </div>
                        )}
                    </ModalBody>
                </ModalContent>
            </Modal>
        </div>
    );
};

export default AdminLayout;