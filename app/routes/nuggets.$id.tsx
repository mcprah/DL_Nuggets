import { useState } from "react";
import { useParams, useNavigate } from "@remix-run/react";
import AdminLayout from "../Layout/AdminLayout";
import { MdArrowBack } from "react-icons/md";
import { Button } from "@nextui-org/react";

// Full Data Array to Match `Nuggets.tsx`
const data = [
    { id: 1, name: "Accident", category: "areaOfLaw", details: "Accident law covers cases involving personal injury, liability, and negligence." },
    { id: 2, name: "Alternative Dispute Resolution", category: "areaOfLaw", details: "Resolving disputes outside courts through mediation or arbitration." },
    { id: 3, name: "Arbitration", category: "areaOfLaw", details: "A legally binding alternative to court trials." },
];

// Example Sub-Nuggets for Selected Categories
const subNuggets = {
    1: [
        { title: "Agency - Contract Procured by Agent", description: "Commencement of action against agent and principal.", source: "REPUBLIC BANK (GH) LIMITED vs. GLOBAL MOTORS TRADING CO. LTD, NARESWA MOIRANTH..." },
        { title: "Agency - Duties of an Agent", description: "Exploring fiduciary responsibilities of an agent.", source: "SMITH vs. DOE & Co. LTD." },
    ],
    2: [
        { title: "Mediation", description: "A voluntary process where a neutral third party helps resolve disputes.", source: "JOHNSON vs. PEACE ORG." },
    ],
};

const NuggetsDetails = () => {
    const { id } = useParams(); // Get nugget ID from URL
    const navigate = useNavigate();
    const [isDrawerOpen, setIsDrawerOpen] = useState(false);
    const [selectedSubNugget, setSelectedSubNugget] = useState(null);

    // Find the clicked nugget's details
    const nuggetDetails = data.find((item) => item.id === Number(id));

    // Get related sub-nuggets (default to empty if none exist)
    const relatedSubNuggets = subNuggets[id] || [];

    // Open drawer with selected sub-nugget details
    const openDrawer = (subNugget) => {
        setSelectedSubNugget(subNugget);
        setIsDrawerOpen(true);
    };

    // Redirect to `Nuggets.tsx` with selected category
    const redirectToCategory = (category) => {
        navigate(`/nuggets?category=${category}`);
    };

    return (
        <AdminLayout>
            <div className="flex transition-all duration-300">
                {/* Main Content Area */}
                <div className={`flex-1 p-6 transition-all duration-300 ${isDrawerOpen ? "pr-[400px]" : ""}`}>
                    {/* Back Button and Title */}
                    <div className="flex items-center gap-2">
                        <button onClick={() => navigate(-1)} className="text-gray-600 hover:text-primary transition">
                            <MdArrowBack className="text-2xl" />
                        </button>
                        <p className="font-montserrat font-bold text-xl">{nuggetDetails?.name || "Nugget Details"}</p>
                    </div>

                    {/* Category Selection Buttons
                    <div className="flex gap-4 p-2 rounded-xl shadow-sm max-w-max bg-white mt-4">
                        <Button
                            size="sm"
                            onClick={() => redirectToCategory("areaOfLaw")}
                            className="transition-all duration-300 px-6 py-2 rounded-lg bg-gray-200 hover:bg-primary hover:text-white active:bg-primary"
                        >
                            Area of Law
                        </Button>
                        <Button
                            size="sm"
                            onClick={() => redirectToCategory("courts")}
                            className="transition-all duration-300 px-6 py-2 rounded-lg bg-gray-200 hover:bg-primary hover:text-white active:bg-primary"
                        >
                            Courts
                        </Button>
                        <Button
                            size="sm"
                            onClick={() => redirectToCategory("judges")}
                            className="transition-all duration-300 px-6 py-2 rounded-lg bg-gray-200 hover:bg-primary hover:text-white active:bg-primary"
                        >
                            Judges
                        </Button>
                    </div> */}

                    {/* Grid Layout for Sub-Nuggets */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-6 bg-white rounded-xl shadow-sm border border-black/10 p-4">
                        {relatedSubNuggets.length > 0 ? (
                            relatedSubNuggets.map((sub, index) => (
                                <div
                                    key={index}
                                    className={`p-4 border rounded-lg bg-gray-50 shadow-sm cursor-pointer transition-all duration-300 ${selectedSubNugget?.title === sub.title ? " " : "hover:bg-gray-100"
                                        }`}
                                    onClick={() => openDrawer(sub)} // Open Drawer on Click
                                >
                                    <p className="font-bold">{sub.title}</p>
                                    <p className="text-sm mt-1">{sub.description}</p>
                                </div>
                            ))
                        ) : (
                            <p className="text-gray-500">No related sub-nuggets available.</p>
                        )}
                    </div>
                </div>

                {/* Drawer - Full Preview */}
                <div
                    className={`fixed right-0 top-0 h-full w-[400px] bg-white shadow-lg transition-transform duration-300 border-l ${isDrawerOpen ? "translate-x-0" : "translate-x-full"
                        }`}
                >
                    {isDrawerOpen && (
                        <div className="p-6 flex flex-col h-full">
                            {/* Close Button */}
                            <button
                                className="text-gray-600 hover:text-primary self-end"
                                onClick={() => setIsDrawerOpen(false)}
                            >
                                ✕ Close
                            </button>

                            {/* Source Quote */}
                            <p className="text-sm text-gray-500 mt-4">
                                <strong>QUOTE FROM:</strong><br />
                                {selectedSubNugget?.source || "Unknown Source"}
                            </p>

                            {/* Nugget Title */}
                            <h2 className="font-bold text-xl mt-4">{selectedSubNugget?.title}</h2>

                            {/* Description */}
                            <p className="text-gray-700 mt-2">{selectedSubNugget?.description}</p>

                            {/* Tags & Keywords */}
                            <div className="mt-4 flex gap-2 flex-wrap">
                                <span className="bg-gray-200 px-3 py-1 rounded-full text-sm text-gray-700">Keyword</span>
                                <span className="bg-gray-200 px-3 py-1 rounded-full text-sm text-gray-700">Keyword</span>
                                <span className="bg-gray-200 px-3 py-1 rounded-full text-sm text-gray-700">Keyword</span>
                            </div>

                            {/* Metadata */}
                            <div className="mt-6">
                                <p className="text-sm text-gray-500">Area of Law</p>
                                <p className="font-semibold">Commercial Law</p>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </AdminLayout>
    );
};

export default NuggetsDetails;
