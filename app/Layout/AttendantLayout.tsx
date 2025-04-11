import { useState, useEffect } from "react";
import { Link, Outlet, useActionData, useLocation } from "@remix-run/react";
import { Button } from "@nextui-org/react";
import { IoMenuOutline } from "react-icons/io5";
import { MdDashboard, MdPointOfSale, MdAttachMoney, MdAssessment } from "react-icons/md";
import { FaCarAlt } from "react-icons/fa";
import { errorToast, successToast } from "~/components/toast";
import { Toaster } from "react-hot-toast";
interface NavItem {
    icon: React.ReactNode;
    label: string;
    path: string;
}

interface AttendantLayoutProps {
    children: React.ReactNode;
}

const navItems: NavItem[] = [
    { icon: <MdDashboard className="text-xl" />, label: "Dashboard", path: "/attendant" },
    { icon: <MdPointOfSale className="text-xl" />, label: "SalesPoint", path: "/attendant/sales" },
    { icon: <MdAttachMoney className="text-xl" />, label: "Debt", path: "/attendant/debt" },
    { icon: <MdAssessment className="text-xl" />, label: "Report", path: "/attendant/report" },
];

const AttendantLayout = ({ children }: AttendantLayoutProps) => {
    const [isCollapsed, setIsCollapsed] = useState(false);
    const [isMobile, setIsMobile] = useState(false);
    const location = useLocation();
    const actionData = useActionData<any>()
    useEffect(() => {
        if (actionData) {
            if (actionData.success) {
                successToast(actionData.message)
            } else {
                errorToast(actionData.message)
            }
        }
    }, [actionData])
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
        <div className="flex h-screen bg-gray-100">
            {/* Sidebar */}
            <aside
                className={`fixed md:relative h-screen bg-white shadow-lg transition-all duration-300 z-50 
                ${isCollapsed ? "w-[70px]" : "w-[250px]"}
                ${isMobile && isCollapsed ? "-translate-x-full" : "translate-x-0"}`}
            >
                {/* Logo Area */}
                <div className="h-16 flex items-center justify-between px-4 border-b">
                    {!isCollapsed && <h1 className="text-xl font-bold">Attendant</h1>}
                    <Button
                        isIconOnly
                        variant="light"
                        onClick={() => setIsCollapsed(!isCollapsed)}
                        className="ml-auto"
                    >
                        <IoMenuOutline className="text-xl" />
                    </Button>
                </div>

                {/* Navigation Items */}
                <nav className="p-2 flex flex-col gap-1">
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
            <main className="flex-1 overflow-auto">
                {/* Top Header */}
                <header className="h-16 bg-white shadow-sm flex items-center px-4">
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
                <Toaster position="top-right" />

                {/* Page Content */}
                <div className="p-4">

                    {children}
                </div>
            </main>

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

export default AttendantLayout;