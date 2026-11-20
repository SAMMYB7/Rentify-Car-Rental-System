import { useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { FaEnvelope, FaCheckCircle } from "react-icons/fa";
import { toast } from "sonner";
import api from "../api/axios";

const getErrorMessage = (err, fallback) =>
  err.response?.data?.message ||
  (typeof err.response?.data === "string" && err.response.data) ||
  fallback;

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);
    try {
      await api.post("/v1/auth/forgot-password", { email: email.trim() });
      setSent(true);
      toast.success("Check your inbox for the reset link.");
    } catch (err) {
      const msg = getErrorMessage(err, "Could not send the reset email. Please try again.");
      setError(msg);
      toast.error(msg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <motion.div
        className="max-w-md w-full bg-white p-8 shadow-md rounded-none border-t-2 border-gray-900"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="text-center mb-8">
          <h2 className="text-3xl font-extrabold text-gray-900 mb-2">Forgot Password</h2>
          <p className="text-gray-600">
            Enter your account email and we&apos;ll send you a link to reset your password.
          </p>
        </div>

        {sent ? (
          <div className="space-y-6">
            <div className="bg-green-50 border-l-4 border-green-500 p-4 flex items-start">
              <FaCheckCircle className="h-5 w-5 text-green-600 mr-3 mt-0.5 flex-shrink-0" />
              <p className="text-sm text-green-800">
                If an account exists for <span className="font-medium">{email.trim()}</span>, a reset
                link is on its way. The link is valid for 1 hour. Check your spam folder if you
                don&apos;t see it.
              </p>
            </div>
            <button
              type="button"
              onClick={() => setSent(false)}
              className="w-full py-3 px-4 border border-gray-900 font-medium rounded-none text-gray-900 bg-white hover:bg-gray-100 transition-colors duration-200"
            >
              Send another link
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="email" className="sr-only">Email</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FaEnvelope className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="email"
                  type="email"
                  autoComplete="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="appearance-none rounded-none relative block w-full px-10 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-gray-900 focus:border-gray-900 focus:z-10 sm:text-sm"
                  placeholder="Email address"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full flex justify-center py-3 px-4 border border-transparent font-medium rounded-none text-white bg-gray-900 hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-700 transition-colors duration-200 disabled:opacity-60"
            >
              {isLoading ? "Sending..." : "Send Reset Link"}
            </button>

            {error && (
              <div className="bg-red-50 border-l-4 border-red-500 p-4">
                <p className="text-sm text-red-700">{error}</p>
              </div>
            )}
          </form>
        )}

        <div className="mt-6 text-center">
          <Link to="/login" className="font-medium text-gray-900 hover:underline">
            Back to Sign In
          </Link>
        </div>
      </motion.div>
    </div>
  );
};

export default ForgotPassword;
