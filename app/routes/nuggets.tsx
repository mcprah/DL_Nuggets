import { Button } from "@nextui-org/react";
import AdminLayout from "../Layout/AdminLayout";

const Nuggets = () => {
    return (
        <AdminLayout>
            <div className="pt-4 flex flex-col gap-2">
                <p className="font-montserrat font-bold text-xl">Lex Nuggets</p>
                <p className="font-nunito">Quickly and easily access catalogues of legal principles at play in any case</p>

                {/* Compact background for buttons */}
                <div className="flex gap-4 p-2 rounded-xl shadow-sm max-w-max bg-white">
                    <Button
                        className="transition-all duration-300 bg-gray-200 text-black px-6 py-2 rounded-lg 
                                   hover:bg-primary hover:text-white active:bg-primary"
                    >
                        Area of Law
                    </Button>
                    <Button
                        className="transition-all duration-300 bg-gray-200 text-black px-6 py-2 rounded-lg 
                                   hover:bg-primary hover:text-white active:bg-primary"
                    >
                        Courts
                    </Button>
                    <Button
                        className="transition-all duration-300 bg-gray-200 text-black px-6 py-2 rounded-lg 
                                   hover:bg-primary hover:text-white active:bg-primary"
                    >
                        Judges
                    </Button>
                </div>
            </div>
        </AdminLayout>
    );
};

export default Nuggets;
