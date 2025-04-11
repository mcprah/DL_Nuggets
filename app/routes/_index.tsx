import { json, LoaderFunction } from "@remix-run/node";
import { Link, useLoaderData, useNavigate } from "@remix-run/react";
import { useState, useEffect } from "react";
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

  useEffect(() => {
    if (typeof window !== "undefined") {
      const storedMessage = window.sessionStorage.getItem("signupSuccess");
      if (storedMessage) {
        setSuccessMessage(storedMessage);
        window.sessionStorage.removeItem("signupSuccess");
      }
    }
  }, []);

  const isValidEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleSubmit = async () => {
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
      });

      if (isSignUp) {
        setIsSignUp(false);
        setFullName("");
        setPhone("");
        setEmail("");
        setPassword("");
        setConfirmPassword("");

        if (typeof window !== "undefined") {
          window.sessionStorage.setItem(
            "signupSuccess",
            "Account created successfully! Please log in."
          );
        }
        setSuccessMessage("Account created successfully! Please log in.");
      } else {
        const token = response.data.access_token;
        if (typeof window !== "undefined") {
          window.localStorage.setItem("access_token", token);
        }
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
    <div className="flex min-h-screen bg-white items-center justify-center">
      <div className="w-full max-w-md px-8 py-12">
        {/* Logo */}
        <div className="mb-8 text-center">
          <img src={logo} alt="Lex Nuggets" className="h-12 mb-2 mx-auto" />
        </div>

        {/* Heading */}
        <h1 className="text-3xl font-bold text-center mb-1">
          Welcome to Lex Nuggets
        </h1>
        <p className="text-gray-500 text-center text-sm mb-8">
          Legal principles at your fingertips
        </p>

        {/* Login/Signup toggle */}
        <div className="flex border rounded-lg mb-6 p-1 bg-gray-50">
          <button
            className={`flex-1 py-2 rounded-md text-sm font-medium transition ${!isSignUp ? "bg-white shadow-sm text-primary" : "text-gray-500"
              }`}
            onClick={() => setIsSignUp(false)}
          >
            Sign In
          </button>
          <button
            className={`flex-1 py-2 rounded-md text-sm font-medium transition ${isSignUp ? "bg-white shadow-sm text-primary" : "text-gray-500"
              }`}
            onClick={() => setIsSignUp(true)}
          >
            Sign Up
          </button>
        </div>

        <p className="text-gray-500 text-center text-sm mb-8">
          Use your Dennislaw credentials to access your account.
        </p>

        {/* Success message */}
        {successMessage && (
          <div className="mb-4 p-3 bg-green-100 text-green-700 rounded-lg text-sm">
            {successMessage}
          </div>
        )}

        {/* Email label */}
        <div className="mb-1.5">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Email
          </label>
        </div>

        {/* Form */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSubmit();
          }}
          className="space-y-4"
        >
          {isSignUp && (
            <>
              <div className="relative">
                <input
                  type="text"
                  placeholder="Full Name"
                  className="w-full px-3 py-2.5 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-primary"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                />
              </div>
              <div className="relative">
                <input
                  type="tel"
                  placeholder="Phone Number"
                  className="w-full px-3 py-2.5 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-primary"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                />
              </div>
            </>
          )}
          <div className="relative">
            <input
              type="email"
              placeholder="your@email.com"
              className="w-full px-3 py-2.5 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-primary"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              placeholder="Password"
              className="w-full px-3 py-2.5 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-primary pr-10"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-primary transition-colors"
            >
              {showPassword ? <MdVisibilityOff /> : <MdVisibility />}
            </button>
          </div>

          {isSignUp && (
            <div className="relative">
              <input
                type={showConfirmPassword ? "text" : "password"}
                placeholder="Confirm Password"
                className="w-full px-3 py-2.5 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-primary pr-10"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-primary transition-colors"
              >
                {showConfirmPassword ? <MdVisibilityOff /> : <MdVisibility />}
              </button>
            </div>
          )}

          {!isSignUp && (
            <div className="flex justify-end items-center text-sm">
              <Link
                to="/forgot-password"
                className="text-primary hover:underline text-sm"
              >
                Forgot password?
              </Link>
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
            className="w-full py-2.5 bg-gray-900 text-white font-medium rounded-md hover:bg-gray-800 transition-all duration-300 flex items-center justify-center mt-4"
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
              "Continue with email"
            ) : (
              "Continue with email"
            )}
          </button>
        </form>

        {/* Terms of Service */}
        {/* <p className="text-center text-gray-500 text-xs mt-6">
          By clicking "Continue with Google" or "Continue with email" you agree
          to our{" "}
          <Link to="/terms" className="underline">
            Terms of Use
          </Link>{" "}
          and{" "}
          <Link to="/privacy" className="underline">
            Privacy policy
          </Link>
        </p> */}
      </div>
    </div>
  );
};

export default Login;

export const loader: LoaderFunction = async () => {
  const baseUrl = process.env.NEXT_PUBLIC_DL_LIVE_URL;
  return json({ baseUrl });
};
