import { Button } from "@nextui-org/react";
import { MdEdit } from "react-icons/md";
import AdminLayout from "../Layout/AdminLayout";
import profilePic from "~/images/logo.png";

const Profile = () => {
    return (
        <AdminLayout>
            <div className="flex flex-col items-center w-full min-h-screen bg-gray-50 py-10 px-4">
                {/* Profile Card */}
                <div className="relative w-full max-w-3xl bg-white shadow-lg rounded-2xl overflow-hidden p-6 flex flex-col items-center text-center">
                    {/* Profile Image */}
                    <div className="relative w-32 h-32 rounded-full overflow-hidden border-4 border-blue-500 shadow-md">
                        <img src={profilePic} alt="Profile" className="w-full h-full object-cover" />
                    </div>

                    {/* User Details */}
                    <h2 className="mt-4 text-2xl font-bold text-gray-900">John Doe</h2>
                    <p className="text-gray-600">Senior UI/UX Designer</p>
                    <p className="text-gray-500 text-sm">johndoe@example.com</p>

                    {/* Edit Button */}
                    <Button className="mt-4 bg-gradient-to-r from-blue-500 to-indigo-600 text-white px-6 py-2 rounded-lg flex items-center gap-2 transition-transform transform hover:scale-105">
                        <MdEdit className="text-lg" /> Edit Profile
                    </Button>
                </div>

                {/* Additional Info */}
                <div className="mt-8 w-full max-w-3xl bg-white shadow-md rounded-2xl p-6">
                    <h3 className="text-xl font-semibold text-gray-800 mb-4">Profile Details</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                        <div>
                            <p className="text-gray-600 text-sm">Full Name</p>
                            <p className="text-gray-900 font-semibold">John Doe</p>
                        </div>
                        <div>
                            <p className="text-gray-600 text-sm">Email</p>
                            <p className="text-gray-900 font-semibold">johndoe@example.com</p>
                        </div>
                        <div>
                            <p className="text-gray-600 text-sm">Phone</p>
                            <p className="text-gray-900 font-semibold">+123 456 7890</p>
                        </div>
                        <div>
                            <p className="text-gray-600 text-sm">Location</p>
                            <p className="text-gray-900 font-semibold">New York, USA</p>
                        </div>
                    </div>
                </div>
            </div>
        </AdminLayout>
    );
};

export default Profile;