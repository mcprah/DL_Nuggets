import { Button } from "@nextui-org/react";
import AdminLayout from "../Layout/AdminLayout";
import { MdArrowRight } from "react-icons/md";
import { useNavigate } from "@remix-run/react";
import Law from "~/images/img1.png";
import court from "~/images/img2.png";
import judge from "~/images/img3.png";
import backgroundImage from "~/images/Library-Postcard-004_2.webp"; // Background image for the entire page

const Home = () => {
    const navigate = useNavigate();

    const goToCategory = (category) => {
        navigate(`/nuggets?category=${category}`);
    };

    return (
        <AdminLayout>
            {/* Full Page Background with Dark Overlay */}
            <div
                className="relative w-full lg:h-[87vh] flex flex-col items-center px-4 py-8 mt-4 rounded-xl text-white"
                style={{ backgroundImage: `url(${backgroundImage})`, backgroundSize: 'cover', backgroundPosition: 'center' }}
            >
                {/* Dark Overlay */}
                <div className="absolute inset-0 bg-black opacity-50 rounded-xl"></div>
                <div className="relative z-10 flex flex-col items-center w-full">
                    {/* Hero Section */}
                    <div className="text-center mb-6">
                        <p className="text-xl font-bold font-nunito">Not sure what to search?</p>
                        <p className="text-lg font-nunito">No worries.</p>
                        <Button className="mt-4 bg-gradient-to-r from-blue-500 to-indigo-600 text-white px-6 py-2 rounded-lg font-montserrat transition-transform transform hover:scale-105" onClick={() => navigate('/nuggets')}>Explore Lex Nuggets</Button>
                    </div>
                    {/* Main Content */}
                    <div className="w-full max-w-3xl">
                        <div className="text-center mb-6">
                            <p className="text-2xl font-montserrat">Lex Nuggets Catalogue</p>
                        </div>
                        {/* Responsive Grid */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 gap-4 w-full">
                            {/* Card 1 - Area of Law */}
                            <div className="flex flex-col items-start bg-pink-200 p-6 rounded-xl shadow-md transition-all duration-300 hover:shadow-lg hover:scale-105">
                                <div className="flex items-center gap-3">
                                    <span className="text-pink-600 text-xl">✨</span>
                                    <p className="text-lg font-bold text-pink-700">Area of Law</p>
                                </div>
                                <Button
                                    className="mt-4 bg-gradient-to-r from-pink-500 to-pink-700 text-white border border-pink-500 px-4 py-2 rounded-lg transition-transform transform hover:scale-105"
                                    onClick={() => goToCategory("areaOfLaw")}
                                >
                                    Explore
                                </Button>
                            </div>
                            {/* Card 2 - Courts */}
                            <div className="flex flex-col items-start bg-blue-200 p-6 rounded-xl shadow-md transition-all duration-300 hover:shadow-lg hover:scale-105">
                                <div className="flex items-center gap-3">
                                    <span className="text-blue-600 text-xl">✨</span>
                                    <p className="text-lg font-bold text-blue-700">Courts</p>
                                </div>
                                <Button
                                    className="mt-4 bg-gradient-to-r from-blue-500 to-blue-700 text-white border border-blue-500 px-4 py-2 rounded-lg transition-transform transform hover:scale-105"
                                    onClick={() => goToCategory("courts")}
                                >
                                    Explore
                                </Button>
                            </div>
                            {/* Card 3 - Judges */}
                            <div className="flex flex-col items-start bg-green-200 p-6 rounded-xl shadow-md col-span-2 transition-all duration-300 hover:shadow-lg hover:scale-105">
                                <div className="flex items-center gap-3">
                                    <span className="text-green-600 text-xl">✨</span>
                                    <p className="text-lg font-bold text-green-700">Judges</p>
                                </div>
                                <Button
                                    className="mt-4 bg-gradient-to-r from-green-500 to-green-700 text-white border border-green-500 px-4 py-2 rounded-lg transition-transform transform hover:scale-105"
                                    onClick={() => goToCategory("judges")}
                                >
                                    Explore
                                </Button>
                            </div>
                        </div>
                        {/* Explore Cases Section */}
                        <div className="mt-6 text-white p-6 rounded-xl text-center max-w-3xl shadow-md transition-all duration-300 hover:shadow-lg hover:scale-105">
                            <p className="text-lg font-bold">Explore Cases and Laws</p>
                            <Button className="mt-2 bg-gradient-to-r from-indigo-700 to-blue-900 text-white px-4 py-2 rounded-lg transition-transform transform hover:scale-105" onClick={() => navigate('/dennislaw')}>Go to Dennislaw →</Button>
                        </div>
                    </div>
                </div>
            </div>
        </AdminLayout>
    );
};

export default Home;