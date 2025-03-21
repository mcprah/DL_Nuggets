import { json, LoaderFunction, MetaFunction } from "@remix-run/node";
import { Link, useLoaderData, useNavigate } from "@remix-run/react";
import { useState } from "react";
import { MdArrowBack, MdEmail } from "react-icons/md";
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

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const { baseUrl } = useLoaderData<typeof loader>();
  const navigate = useNavigate();

  const isValidEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleSubmit = async () => {
    if (!email) {
      setError("Email is required.");
      return;
    }

    if (!isValidEmail(email)) {
      setError("Please enter a valid email address.");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await axios.post(
        `${baseUrl}/reset-password`,
        { email },
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      // Check if the response indicates success
      if (response.data && !response.data.error) {
        setSuccessMessage(
          response.data.message ||
            "Password reset instructions have been sent to your email."
        );
        setEmail("");
      } else {
        // Handle API error response
        setError(
          response.data.message ||
            "Failed to send reset instructions. Please try again."
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
          <h1 className="text-2xl font-bold text-center">Reset Password</h1>
        </div>
        <p className="text-gray-500 text-center text-sm mb-8">
          Enter your email address to receive password reset instructions
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
          <div className="relative">
            <input
              type="email"
              placeholder="your@email.com"
              className="w-full px-3 py-2.5 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-primary"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
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
              "Send Reset Instructions"
            )}
          </button>

          <p className="text-center text-gray-500 text-sm mt-4">
            Remembered your password?{" "}
            <Link to="/" className="text-primary hover:underline">
              Sign In
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
};

export default ForgotPassword;

export const loader: LoaderFunction = async () => {
  const baseUrl = process.env.NEXT_PUBLIC_DL_LIVE_URL;
  return json({ baseUrl });
};

export const meta: MetaFunction = () => {
  return [
    { title: "Reset Password | Lex Nuggets" },
    {
      name: "description",
      content:
        "Reset your password to regain access to your Lex Nuggets account.",
    },
    { name: "viewport", content: "width=device-width,initial-scale=1" },
    { name: "robots", content: "noindex" }, // Prevent search engines from indexing this page
  ];
};
