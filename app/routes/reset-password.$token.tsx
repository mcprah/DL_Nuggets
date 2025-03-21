import { json, LoaderFunction, MetaFunction } from "@remix-run/node";
import { Link, useLoaderData, useNavigate, useParams } from "@remix-run/react";
import { useState, useEffect } from "react";
import {
  MdArrowBack,
  MdLock,
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

interface LoaderData {
  baseUrl: string;
}

const ResetPassword = () => {
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [tokenValid, setTokenValid] = useState(true);

  const { baseUrl } = useLoaderData<LoaderData>();
  const navigate = useNavigate();
  const { token } = useParams();

  useEffect(() => {
    // We'll keep tokenValid true initially and let the user try with their email
    // This allows for a better UX since the backend requires both token and email
    setTokenValid(true);
  }, [token]);

  const handleSubmit = async () => {
    if (!email) {
      setError("Email address is required.");
      return;
    }

    if (!code) {
      setError("Verification code is required.");
      return;
    }

    if (!password || !confirmPassword) {
      setError("Please enter and confirm your new password.");
      return;
    }

    if (password.length < 8) {
      setError("Password must be at least 8 characters long.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // First, verify the reset token is valid
      const verifyResponse = await axios.post(
        `${baseUrl}/confirm-reset-pass-code`,
        {
          token: code,
          email,
        },
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      // If token verification is successful, update the password
      if (verifyResponse.data && !verifyResponse.data.error) {
        const updateResponse = await axios.post(
          `${baseUrl}/update-app-password`,
          {
            token: code,
            email,
            password,
            password_confirmation: confirmPassword,
          },
          {
            headers: {
              "Content-Type": "application/json",
            },
          }
        );

        if (updateResponse.data && !updateResponse.data.error) {
          setSuccessMessage(
            updateResponse.data.message ||
              "Your password has been reset successfully."
          );

          // Redirect to login page after a delay
          setTimeout(() => {
            navigate("/");
          }, 3000);
        } else {
          setError(
            updateResponse.data.message ||
              "Failed to update password. Please try again."
          );
        }
      } else {
        setError(
          verifyResponse.data.message ||
            "Invalid verification code. Please try again."
        );
      }
    } catch (err) {
      const apiError = err as APIError;
      console.error("Password reset error:", apiError);

      const errorMessage =
        apiError.response?.data?.message ||
        apiError.response?.data?.msg ||
        apiError.response?.data?.error ||
        apiError.message ||
        "An error occurred. Please try again.";

      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  if (!tokenValid) {
    return (
      <div className="flex min-h-screen bg-white items-center justify-center">
        <div className="w-full max-w-md px-8 py-12 text-center">
          <div className="mb-8 text-center">
            <img src={logo} alt="Lex Nuggets" className="h-12 mb-2 mx-auto" />
          </div>

          <h1 className="text-2xl font-bold mb-4">Invalid Reset Link</h1>
          <p className="text-gray-500 mb-8">
            This password reset link is invalid or has expired.
          </p>

          <Link
            to="/forgot-password"
            className="w-full py-2.5 bg-gray-900 text-white font-medium rounded-md hover:bg-gray-800 transition-all duration-300 inline-block"
          >
            Request New Reset Link
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-white items-center justify-center">
      <div className="w-full max-w-md px-8 py-12">
        {/* Logo */}
        <div className="mb-8 text-center">
          <img src={logo} alt="Lex Nuggets" className="h-12 mb-2 mx-auto" />
        </div>

        {/* Heading */}
        <div className="flex items-center mb-1 justify-center">
          <Link to="/" className="mr-2 text-gray-500 hover:text-primary">
            <MdArrowBack className="text-xl" />
          </Link>
          <h1 className="text-2xl font-bold text-center">
            Create New Password
          </h1>
        </div>
        <p className="text-gray-500 text-center text-sm mb-8">
          Enter your email and the verification code sent to you to create a new
          password
        </p>

        {/* Success message */}
        {successMessage && (
          <div className="mb-4 p-3 bg-green-100 text-green-700 rounded-lg text-sm">
            {successMessage}
          </div>
        )}

        {/* Form */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSubmit();
          }}
          className="space-y-4"
        >
          <div className="relative">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email Address
            </label>
            <input
              type="email"
              placeholder="Enter your email address"
              className="w-full px-3 py-2.5 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-primary"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="relative">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Verification Code
            </label>
            <input
              type="text"
              placeholder="Enter code from email"
              className="w-full px-3 py-2.5 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-primary"
              value={code}
              onChange={(e) => setCode(e.target.value)}
            />
          </div>

          <div className="relative">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              New Password
            </label>
            <input
              type={showPassword ? "text" : "password"}
              placeholder="At least 8 characters"
              className="w-full px-3 py-2.5 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-primary pr-10"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-9 text-gray-400 hover:text-primary transition-colors"
            >
              {showPassword ? <MdVisibilityOff /> : <MdVisibility />}
            </button>
          </div>

          <div className="relative">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Confirm Password
            </label>
            <input
              type={showConfirmPassword ? "text" : "password"}
              placeholder="Confirm your new password"
              className="w-full px-3 py-2.5 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-primary pr-10"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              className="absolute right-3 top-9 text-gray-400 hover:text-primary transition-colors"
            >
              {showConfirmPassword ? <MdVisibilityOff /> : <MdVisibility />}
            </button>
          </div>

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
            ) : (
              "Reset Password"
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

export default ResetPassword;

export const loader: LoaderFunction = async () => {
  const baseUrl = process.env.NEXT_PUBLIC_DL_LIVE_URL;
  return json({ baseUrl });
};

export const meta: MetaFunction = () => {
  return [
    { title: "Create New Password | Lex Nuggets" },
    {
      name: "description",
      content: "Create a new password for your Lex Nuggets account.",
    },
    { name: "viewport", content: "width=device-width,initial-scale=1" },
    { name: "robots", content: "noindex" }, // Prevent search engines from indexing this page
  ];
};
