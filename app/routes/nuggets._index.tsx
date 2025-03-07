import { useState, useEffect } from "react";
import { Button } from "@nextui-org/react";
import AdminLayout from "../Layout/AdminLayout";
import { MdArrowRight } from "react-icons/md";
import { Link, useSearchParams } from "@remix-run/react"; // Import useSearchParams

// Data Arrays with IDs
const areaOfLaw = [
    { id: 1, name: "Accident" },
    { id: 2, name: "Alternative Dispute Resolution" },
    { id: 3, name: "Arbitration" },
    { id: 4, name: "Aviation" },
    { id: 5, name: "Banking" },
    { id: 6, name: "Civil Procedure" },
    { id: 7, name: "Commercial Law" },
    { id: 8, name: "Construction of Deeds and Statutes" },
    { id: 9, name: "Chieftaincy" },
];

const courts = [
    { id: 10, name: "Supreme Court" },
    { id: 11, name: "Court of Appeals" },
    { id: 12, name: "High Court" },
    { id: 13, name: "Circuit Court" },
    { id: 14, name: "District Court" },
];

const judges = [
    { id: 15, name: "Justice John Doe" },
    { id: 16, name: "Justice Mary Smith" },
    { id: 17, name: "Justice David Brown" },
    { id: 18, name: "Justice Olivia Johnson" },
    { id: 19, name: "Justice William Wilson" },
];

const Nuggets = () => {
    const [searchParams, setSearchParams] = useSearchParams();
    const defaultCategory = searchParams.get("category") || "areaOfLaw";
    const [selectedCategory, setSelectedCategory] = useState(defaultCategory);

    useEffect(() => {
        setSelectedCategory(defaultCategory);
    }, [defaultCategory]);

    // Get data based on selected category
    const getCategoryData = () => {
        switch (selectedCategory) {
            case "courts":
                return courts;
            case "judges":
                return judges;
            default:
                return areaOfLaw;
        }
    };

    // Update URL query when a category is selected
    const updateCategory = (category) => {
        setSelectedCategory(category);
        setSearchParams({ category });
    };

    return (
        <AdminLayout>
            <div className="pt-4 flex flex-col gap-2">
                <p className="font-montserrat font-bold text-xl">Lex Nuggets</p>
                <p className="font-nunito">Quickly and easily access catalogues of legal principles at play in any case</p>

                {/* Category Selection Buttons */}
                <div className="flex gap-4 p-2 rounded-xl shadow-sm max-w-max bg-white">
                    <Button
                        size="sm"
                        onClick={() => updateCategory("areaOfLaw")}
                        className={`transition-all duration-300 px-6 py-2 rounded-lg 
                            ${selectedCategory === "areaOfLaw" ? "bg-primary text-white" : "bg-gray-200 text-black hover:bg-primary hover:text-white active:bg-primary"}
                        `}
                    >
                        Area of Law
                    </Button>
                    <Button
                        size="sm"
                        onClick={() => updateCategory("courts")}
                        className={`transition-all duration-300 px-6 py-2 rounded-lg 
                            ${selectedCategory === "courts" ? "bg-primary text-white" : "bg-gray-200 text-black hover:bg-primary hover:text-white active:bg-primary"}
                        `}
                    >
                        Courts
                    </Button>
                    <Button
                        size="sm"
                        onClick={() => updateCategory("judges")}
                        className={`transition-all duration-300 px-6 py-2 rounded-lg 
                            ${selectedCategory === "judges" ? "bg-primary text-white" : "bg-gray-200 text-black hover:bg-primary hover:text-white active:bg-primary"}
                        `}
                    >
                        Judges
                    </Button>
                </div>

                {/* Display Nuggets List */}
                <div className="mt-4">
                    <div className="lg:grid lg:grid-cols-4 gap-4 bg-white p-4 shadow-sm rounded-xl border border-black/5">
                        {getCategoryData().map((item) => (
                            <Link
                                key={item.id}
                                to={`/nuggets/${item.id}`} // Pass ID to Details Page
                                className="bg-white border border-black/10 flex justify-between p-3 rounded-lg shadow-sm cursor-pointer hover:bg-gray-100 transition-all duration-300"
                            >
                                <p className="text-black">{item.name}</p>
                                <MdArrowRight className="text-xl text-gray-700" />
                            </Link>
                        ))}
                    </div>
                </div>
            </div>
        </AdminLayout>
    );
};

export default Nuggets;
