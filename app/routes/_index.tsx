import { json, LoaderFunction } from "@remix-run/node";
import { useLoaderData, useNavigate } from "@remix-run/react";
import { useState } from "react";
import { FaGoogle, FaApple, FaFacebook } from "react-icons/fa";
import { MdEmail, MdLock } from "react-icons/md";
import axios from "axios";
import logo from "~/images/logo-removebg-preview.png"

const Login = () => {
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [isSignUp, setIsSignUp] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const { baseUrl } = useLoaderData<typeof loader>();
    const navigate = useNavigate();

    const handleSubmit = async () => {
        if (!username || !password) {
            setError("Email and password are required.");
            return;
        }

        setLoading(true);
        setError(null);

        try {
            const response = await axios.post(`${baseUrl}/login`, {
                username,
                password,
            });

            const token = response.data.token;
            localStorage.setItem("token", token); // Store token securely
            console.log(token);


            navigate("/dashboard"); // Redirect to dashboard
        } catch (err) {
            setError(err.response?.data?.message || "An error occurred. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex h-screen w-full items-center justify-center bg-gray-100 p-4">
            <div className="flex flex-col md:flex-row bg-white rounded-2xl shadow-lg overflow-hidden w-full max-w-4xl">
                {/* Left Side */}
                <div className="w-full md:w-1/2 p-8 flex flex-col justify-center">
                    <h2 className="text-2xl font-bold text-gray-900 font-montserrat">
                        {isSignUp ? "Create an Account" : "Welcome Back"}
                    </h2>
                    <p className="text-gray-500 mb-6 font-nunito">
                        {isSignUp ? "Please enter your details to sign up" : "Please enter your details"}
                    </p>
                    <div className="flex mb-4">
                        <button
                            className={`font-montserrat flex-1 py-2 rounded-lg font-semibold ${!isSignUp ? "bg-gray-200" : "text-gray-500"}`}
                            onClick={() => setIsSignUp(false)}
                        >
                            Sign In
                        </button>
                        <button
                            className={`flex-1 py-2 rounded-lg font-semibold ${isSignUp ? "bg-gray-200" : "text-gray-500"}`}
                            onClick={() => setIsSignUp(true)}
                        >
                            Signup
                        </button>
                    </div>
                    <div className="relative flex items-center border rounded-lg px-3 py-2 mb-3">
                        <MdEmail className="text-gray-400 mr-2" />
                        <input
                            type="email"
                            placeholder="Email Address"
                            className="flex-1 outline-none"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                        />
                    </div>
                    <div className="relative flex items-center border rounded-lg px-3 py-2 mb-3">
                        <MdLock className="text-gray-400 mr-2" />
                        <input
                            type="password"
                            placeholder="Password"
                            className="flex-1 outline-none"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                        />
                    </div>
                    {error && <p className="text-red-500 text-sm mb-3">{error}</p>}
                    <button
                        className="mt-4 w-full py-2 bg-[#1B1464] text-white font-bold rounded-lg"
                        onClick={handleSubmit}
                        disabled={loading}
                    >
                        {loading ? "Processing..." : isSignUp ? "Sign Up" : "Continue"}
                    </button>
                    <p className="text-center text-gray-500 my-4">Or Continue With</p>
                    <div className="flex justify-center gap-4">
                        <button className="p-3 rounded-full bg-gray-200"><FaGoogle className="text-gray-700" /></button>
                        <button className="p-3 rounded-full bg-black"><FaApple className="text-white" /></button>
                        <button className="p-3 rounded-full bg-blue-600"><FaFacebook className="text-white" /></button>
                    </div>
                </div>

                {/* Right Side */}
                <div className="w-full md:w-1/2 bg-blue-100 flex items-center justify-center p-8">
                    <img
                        src={logo}
                        alt="Secure Login"
                        className="w-3/4"
                    />
                </div>
            </div>
        </div>
    );
};

export default Login;

export const loader: LoaderFunction = async () => {
    const baseUrl = process.env.NEXT_PUBLIC_DL_LIVE_URL;

    return json({ baseUrl });
};
