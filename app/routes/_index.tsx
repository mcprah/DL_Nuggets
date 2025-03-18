import { json, LoaderFunction } from "@remix-run/node";
import { useLoaderData, useNavigate } from "@remix-run/react";
import { useState, useEffect } from "react";
import { FaGoogle, FaApple, FaFacebook } from "react-icons/fa";
import {
  MdEmail,
  MdLock,
  MdPerson,
  MdPhone,
  MdVisibility,
  MdVisibilityOff,
} from "react-icons/md";
import axios from "axios";
import logo from "~/images/logo-removebg-preview.png";

interface APIError {
  response?: {
    data?: {
      msg?: string;
      error?: string;
      message?: string;
    };
    status?: number;
  };
  message?: string;
}

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [isSignUp, setIsSignUp] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const { baseUrl } = useLoaderData<typeof loader>();
  const navigate = useNavigate();

  // Use useEffect to safely interact with browser APIs
  useEffect(() => {
    // This code will only run in the browser, not during server-side rendering
    if (typeof window !== "undefined") {
      const storedMessage = window.sessionStorage.getItem("signupSuccess");
      if (storedMessage) {
        setSuccessMessage(storedMessage);
        window.sessionStorage.removeItem("signupSuccess");
      }
    }
  }, []);

  // Email validation
  const isValidEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleSubmit = async () => {
    // Form validation
    if (!email || !password) {
      setError("Email and password are required.");
      return;
    }

    if (!isValidEmail(email)) {
      setError("Please enter a valid email address.");
      return;
    }

    if (isSignUp && (!fullName || !phone)) {
      setError("All fields are required for sign-up.");
      return;
    }

    if (isSignUp && password.length < 8) {
      setError("Password must be at least 8 characters long.");
      return;
    }

    if (isSignUp && password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const endpoint = isSignUp ? `${baseUrl}/sign-up` : `${baseUrl}/login`;
      const data = isSignUp
        ? { name: fullName, phone, email, password }
        : { email, password, device_name: "Browser" };

      const response = await axios.post(endpoint, data, {
        headers: {
          "Content-Type": "application/json",
        },
        withCredentials: true, // Allows cross-origin cookies (CORS fix)
      });

      if (isSignUp) {
        // Redirect to login page after sign-up with a success message
        setIsSignUp(false);
        setFullName("");
        setPhone("");
        setEmail("");
        setPassword("");
        setConfirmPassword("");
        // Store success message in session storage to display after redirect
        if (typeof window !== "undefined") {
          window.sessionStorage.setItem(
            "signupSuccess",
            "Account created successfully! Please log in."
          );
        }
        // Set success message directly as well
        setSuccessMessage("Account created successfully! Please log in.");
      } else {
        // Store token securely for login
        const token = response.data.access_token;
        if (typeof window !== "undefined") {
          window.localStorage.setItem("access_token", token);
        }

        // Redirect to dashboard after login
        navigate("/dashboard");
      }
    } catch (err) {
      const apiError = err as APIError;
      console.error("Login error:", apiError);

      const errorMessage =
        apiError.response?.data?.msg ||
        apiError.response?.data?.error ||
        apiError.response?.data?.message ||
        apiError.message ||
        "An error occurred. Please try again.";

      setError(errorMessage);
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
            {isSignUp
              ? "Please enter your details to sign up"
              : "Please enter your details to login"}
          </p>

          {/* Toggle between Sign In and Sign Up */}
          <div className="flex mb-6">
            <button
              className={`font-montserrat flex-1 py-2 rounded-lg font-semibold transition-all duration-300 ${
                !isSignUp
                  ? "bg-primary text-white"
                  : "text-gray-500 hover:bg-gray-100"
              }`}
              onClick={() => setIsSignUp(false)}
            >
              Sign In
            </button>
            <button
              className={`flex-1 py-2 rounded-lg font-semibold font-montserrat transition-all duration-300 ${
                isSignUp
                  ? "bg-primary text-white"
                  : "text-gray-500 hover:bg-gray-100"
              }`}
              onClick={() => setIsSignUp(true)}
            >
              Sign Up
            </button>
          </div>

          {/* Success message from sign-up */}
          {successMessage && (
            <div className="mb-4 p-3 bg-green-100 text-green-700 rounded-lg">
              {successMessage}
            </div>
          )}

          {/* Form Fields */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSubmit();
            }}
            className="space-y-4"
          >
            {isSignUp && (
              <>
                <div className="relative flex items-center border rounded-lg px-3 py-2.5 focus-within:ring-2 focus-within:ring-primary/50 focus-within:border-primary transition-all duration-300">
                  <MdPerson className="text-gray-400 mr-2 text-lg" />
                  <input
                    type="text"
                    placeholder="Full Name"
                    className="flex-1 outline-none font-nunito"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                  />
                </div>
                <div className="relative flex items-center border rounded-lg px-3 py-2.5 focus-within:ring-2 focus-within:ring-primary/50 focus-within:border-primary transition-all duration-300">
                  <MdPhone className="text-gray-400 mr-2 text-lg" />
                  <input
                    type="tel"
                    placeholder="Phone Number"
                    className="flex-1 outline-none font-nunito"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                  />
                </div>
              </>
            )}
            <div className="relative flex items-center border rounded-lg px-3 py-2.5 focus-within:ring-2 focus-within:ring-primary/50 focus-within:border-primary transition-all duration-300">
              <MdEmail className="text-gray-400 mr-2 text-lg" />
              <input
                type="email"
                placeholder="Email Address"
                className="flex-1 outline-none font-nunito"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div className="relative flex items-center border rounded-lg px-3 py-2.5 focus-within:ring-2 focus-within:ring-primary/50 focus-within:border-primary transition-all duration-300">
              <MdLock className="text-gray-400 mr-2 text-lg" />
              <input
                type={showPassword ? "text" : "password"}
                placeholder="Password"
                className="flex-1 outline-none font-nunito"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="text-gray-400 hover:text-primary transition-colors duration-300"
              >
                {showPassword ? <MdVisibilityOff /> : <MdVisibility />}
              </button>
            </div>
            {isSignUp && (
              <div className="relative flex items-center border rounded-lg px-3 py-2.5 focus-within:ring-2 focus-within:ring-primary/50 focus-within:border-primary transition-all duration-300">
                <MdLock className="text-gray-400 mr-2 text-lg" />
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  placeholder="Confirm Password"
                  className="flex-1 outline-none font-nunito"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="text-gray-400 hover:text-primary transition-colors duration-300"
                >
                  {showConfirmPassword ? <MdVisibilityOff /> : <MdVisibility />}
                </button>
              </div>
            )}

            {/* Remember me and forgot password */}
            {!isSignUp && (
              <div className="flex justify-between items-center text-sm">
                <label className="flex items-center text-gray-600">
                  <input type="checkbox" className="mr-2" />
                  Remember me
                </label>
                <a
                  href="/forgot-password"
                  className="text-primary hover:underline"
                >
                  Forgot password?
                </a>
              </div>
            )}

            {/* Error display */}
            {error && (
              <div className="text-red-500 text-sm p-2 bg-red-50 rounded-lg border border-red-100">
                {error}
              </div>
            )}

            {/* Submit button */}
            <button
              type="submit"
              className="mt-4 w-full py-2.5 bg-primary text-white font-montserrat font-bold rounded-lg hover:bg-primary/90 transition-all duration-300 flex items-center justify-center"
              disabled={loading}
            >
              {loading ? (
                <>
                  <svg
                    className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  Processing...
                </>
              ) : isSignUp ? (
                "Create Account"
              ) : (
                "Sign In"
              )}
            </button>
          </form>

          {/* Social login options */}
          <div className="mt-6">
            <p className="text-center text-gray-500 my-4 font-nunito relative before:content-[''] before:absolute before:left-0 before:top-1/2 before:h-px before:w-1/3 before:bg-gray-300 after:content-[''] after:absolute after:right-0 after:top-1/2 after:h-px after:w-1/3 after:bg-gray-300">
              Or Continue With
            </p>
            <div className="flex justify-center gap-4">
              <button className="p-3 rounded-full bg-gray-200 hover:bg-gray-300 transition-colors duration-300">
                <FaGoogle className="text-gray-700" />
              </button>
              <button className="p-3 rounded-full bg-black hover:bg-gray-800 transition-colors duration-300">
                <FaApple className="text-white" />
              </button>
              <button className="p-3 rounded-full bg-blue-600 hover:bg-blue-700 transition-colors duration-300">
                <FaFacebook className="text-white" />
              </button>
            </div>
          </div>
        </div>

        {/* Right Side */}
        <div className="w-full md:w-1/2 bg-gradient-to-br from-blue-100 to-blue-50 flex flex-col items-center justify-center p-8">
          <div className="text-center">
            <h2 className="text-3xl font-montserrat font-bold text-primary mb-4">
              Lex Nuggets
            </h2>
            <p className="text-gray-600 mb-6">
              Access legal principles at your fingertips
            </p>
          </div>
          <img src={logo} alt="Lex Nuggets" className="w-3/4 drop-shadow-lg" />
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
