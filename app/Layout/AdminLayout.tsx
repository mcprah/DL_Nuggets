import { useState, useEffect } from "react";
import { Link, useLocation, useNavigation } from "@remix-run/react";
import { Button, User } from "@nextui-org/react";
import { IoMenuOutline } from "react-icons/io5";
import {
    MdHome,
    MdSearch,
    MdBookmark,
    MdVerifiedUser
} from "react-icons/md";
import logo from "~/images/logo.png";

interface NavItem {
    icon: React.ReactNode;
    label: string;
    path: string;
}

const navItems: NavItem[] = [
    { icon: <MdHome className="text-xl" />, label: "Explore", path: "/" },
    { icon: <MdSearch className="text-xl" />, label: "Search", path: "/admin/users" },
    { icon: <MdBookmark className="text-xl" />, label: "My Nuggets", path: "/nuggets" },
    { icon: <MdVerifiedUser className="text-xl" />, label: "My Profile", path: "/admin/category" },
];

const AdminLayout = ({ children }: { children: React.ReactNode }) => {
    const [isCollapsed, setIsCollapsed] = useState(true);
    const [isMobile, setIsMobile] = useState(false);
    const location = useLocation();
    const navigation = useNavigation();
    const isLoading = navigation.state === "loading";

    useEffect(() => {
        const checkScreenSize = () => {
            const mobile = window.innerWidth < 768;
            setIsMobile(mobile);
            setIsCollapsed(true); // Hide sidebar by default on mobile
        };

        checkScreenSize();
        window.addEventListener("resize", checkScreenSize);
        return () => window.removeEventListener("resize", checkScreenSize);
    }, []);

    return (
        <div className="overflow-y-hidden min-h-screen bg-slate-50">
            <div className="flex px-2 py-2">
                {/* Sidebar */}
                <aside
                    className={`fixed md:relative h-[97vh] rounded-xl bg-[#249DD0] text-white shadow-lg transition-all duration-300 z-50
          ${isMobile ? (isCollapsed ? "-translate-x-full" : "translate-x-0") : isCollapsed ? "w-[70px]" : "w-[250px]"}`}
                >
                    {/* Sidebar Header */}
                    <div className="h-16 flex items-center justify-between px-4 border-b">
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
                    <nav className={`p-2 flex flex-col gap-1 ${isCollapsed ? "justify-center items-center" : ""}`}>
                        {navItems.map((item) => (
                            <Link
                                key={item.path}
                                to={item.path}
                                className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-colors
                  ${location.pathname === item.path ? " text-white" : "hover:bg-white hover:shadow-sm hover:text-[#249DD0]"}
                `}
                            >
                                {item.icon}
                                {!isCollapsed && <span>{item.label}</span>}
                            </Link>
                        ))}
                    </nav>
                </aside>

                {/* Main Content */}
                <main className="flex-1 overflow-auto pl-4">
                    {/* Top Header */}
                    <header className="h-16 bg-white shadow-sm border border-black/5 px-4 flex items-center justify-between rounded-xl">
                        {/* Toggle Button for Mobile */}
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
                            {navItems.find((item) => item.path === location.pathname)?.label || "Dashboard"}
                        </h2>
                        <User
                            avatarProps={{
                                src: "https://i.pravatar.cc/150?u=a04258114e29026702d",
                            }}
                        />
                    </header>

                    {/* Loading overlay */}
                    {isLoading && (
                        <div className="absolute top-0 left-0 w-full h-full bg-black bg-opacity-50 flex items-center justify-center z-50">
                            <div className="loader border-t-4 border-blue-500 rounded-full w-16 h-16 animate-spin"></div>
                        </div>
                    )}

                    {/* Page Content */}
                    <div>{children}</div>
                </main>
            </div>

            {/* Mobile Overlay (Closes Sidebar When Clicked) */}
            {isMobile && !isCollapsed && (
                <div
                    className="fixed inset-0 bg-black/50 z-40"
                    onClick={() => setIsCollapsed(true)}
                />
            )}
        </div>
    );
};

export default AdminLayout;
