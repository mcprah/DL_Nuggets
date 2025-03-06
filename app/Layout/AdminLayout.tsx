import { useState, useEffect } from "react";
import { Link, Outlet, useActionData, useLocation, useNavigation } from "@remix-run/react";
import { Button } from "@nextui-org/react";
import { IoMenuOutline } from "react-icons/io5";
import { 
    MdDashboard, 
    MdPeople, 
    MdCategory,
    MdInventory,
    MdAutorenew,
    MdPointOfSale,
    MdAttachMoney,
    MdAssessment
} from "react-icons/md";
import { FaUserTie } from "react-icons/fa";

interface NavItem {
    icon: React.ReactNode;
    label: string;
    path: string;
}

interface AdminLayoutProps {
    children: React.ReactNode;
}

const navItems: NavItem[] = [
    { icon: <MdDashboard className="text-xl" />, label: "Dashboard", path: "/admin" },
    { icon: <MdPeople className="text-xl" />, label: "Users", path: "/admin/users" },
    { icon: <FaUserTie className="text-xl" />, label: "Suppliers", path: "/admin/suppliers" },
    { icon: <MdCategory className="text-xl" />, label: "Category", path: "/admin/category" },
    { icon: <MdInventory className="text-xl" />, label: "Products", path: "/admin/products" },
    { icon: <MdAutorenew className="text-xl" />, label: "Restocking", path: "/admin/restocking" },
    { icon: <MdPointOfSale className="text-xl" />, label: "Sales", path: "/admin/sales" },
    { icon: <MdAttachMoney className="text-xl" />, label: "Debt", path: "/admin/debt" },
    { icon: <MdAssessment className="text-xl" />, label: "Report", path: "/admin/report" },
];

const AdminLayout = ({ children }: AdminLayoutProps) => {
    const [isCollapsed, setIsCollapsed] = useState(false);
    const [isMobile, setIsMobile] = useState(false);
    const location = useLocation();
    const navigation = useNavigation()
    const isLoading = navigation.state === "loading";
    const actionData = useActionData<any>();

    useEffect(() => {
        const checkScreenSize = () => {
            setIsMobile(window.innerWidth < 768);
            setIsCollapsed(window.innerWidth < 768);
        };

        checkScreenSize();
        window.addEventListener("resize", checkScreenSize);

        return () => window.removeEventListener("resize", checkScreenSize);
    }, []);

    return (
        <div className=" overflow-y-hidden min-h-screen">
            <div className="flex px-2 py-2">
                {/* Sidebar */}
                <aside
                    className={`fixed md:relative h-[97vh] rounded-xl bg-[#249DD0] text-white shadow-lg transition-all duration-300 z-50
                    ${isCollapsed ? "w-[70px]" : "w-[250px]"}
                    ${isMobile && isCollapsed ? "-translate-x-full" : "translate-x-0"}`}
                >
                    {/* Logo Area */}
                    <div className="h-16 flex items-center justify-between px-4 border-b">
                        {!isCollapsed && <h1 className="text-xl font-bold">Admin</h1>}
                        <Button
                            isIconOnly
                            variant="light"
                            onClick={() => setIsCollapsed(!isCollapsed)}
                            className="ml-auto"
                        >
                            <IoMenuOutline className="text-xl text-white" />
                        </Button>
                    </div>

                    {/* Navigation Items */}
                    <nav className={`p-2 flex  flex-col gap-1 ${isCollapsed ? "justify-ceter items-center" : ""}`}>
                        {navItems.map((item) => (
                            <Link
                                key={item.path}
                                to={item.path}
                                className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-colors
                                    ${location.pathname === item.path
                                    ? "bg-primary text-white"
                                    : "hover:bg-gray-100"
                                    }
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
                    <header className="h-16 bg-white shadow-sm border border-black/5 px-4 flex items-center justify-between rounded-xl flex items-center ">
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
                    </header>

                    {/* Loading overlay */}
                    {isLoading && (
                        <div className="absolute top-0 left-0 w-full h-full bg-black bg-opacity-50 flex items-center justify-center z-50">
                            <div className="loader border-t-4 border-blue-500 rounded-full w-16 h-16 animate-spin"></div>
                        </div>
                    )}

                    {/* Page Content */}
                    <div className="">
                        {children}
                    </div>
                </main>
            </div>

            {/* Mobile Overlay */}
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