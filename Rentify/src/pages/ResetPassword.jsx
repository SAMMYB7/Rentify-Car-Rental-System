import { useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { motion } from "framer-motion";
import { FaLock } from "react-icons/fa";
import { toast } from "sonner";
import api from "../api/axios";

const MIN_PASSWORD_LENGTH = 6; // keep in sync with ResetPasswordRequestDTO

const getErrorMessage = (err, fallback) =>
  err.response?.data?.message ||
  (typeof err.response?.data === "string" && err.response.data) ||
  fallback;

const inputClass =
  "appearance-none rounded-none relative block w-full px-10 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-gray-900 focus:border-gray-900 focus:z-10 sm:text-sm";

const ResetPassword = () => {
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");
  const navigate = useNavigate();

  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (password.length < MIN_PASSWORD_LENGTH) {
      setError(`Password must be at least ${MIN_PASSWORD_LENGTH} characters.`);
      return;
    }
    if (password !== confirm) {
      setError("Passwords do not match.");
      return;
    }

    setIsLoading(true);
    try {
      await api.post("/v1/auth/reset-password", { token, newPassword: password });
      toast.success("Password reset! Please sign in with your new password.");
      navigate("/login", { replace: true });
    } catch (err) {
      const msg = getErrorMessage(err, "Could not reset your password. Please try again.");
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
          <h2 className="text-3xl font-extrabold text-gray-900 mb-2">Reset Password</h2>
          <p className="text-gray-600">Choose a new password for your account.</p>
        </div>

        {!token ? (
          <div className="space-y-6">
            <div className="bg-red-50 border-l-4 border-red-500 p-4">
              <p className="text-sm text-red-700">
                This reset link is missing its token. Please use the link from your email, or
                request a new one.
              </p>
            </div>
            <Link
              to="/forgot-password"
              className="w-full flex justify-center py-3 px-4 font-medium rounded-none text-white bg-gray-900 hover:bg-gray-800 transition-colors duration-200"
            >
              Request a new link
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="password" className="sr-only">New password</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FaLock className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="password"
                  type="password"
                  autoComplete="new-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={MIN_PASSWORD_LENGTH}
                  className={inputClass}
                  placeholder={`New password (min ${MIN_PASSWORD_LENGTH} characters)`}
                />
              </div>
            </div>

            <div>
              <label htmlFor="confirm" className="sr-only">Confirm new password</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FaLock className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="confirm"
                  type="password"
                  autoComplete="new-password"
                  value={confirm}
                  onChange={(e) => setConfirm(e.target.value)}
                  required
                  className={inputClass}
                  placeholder="Confirm new password"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full flex justify-center py-3 px-4 border border-transparent font-medium rounded-none text-white bg-gray-900 hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-700 transition-colors duration-200 disabled:opacity-60"
            >
              {isLoading ? "Resetting..." : "Reset Password"}
            </button>

            {error && (
              <div className="bg-red-50 border-l-4 border-red-500 p-4">
                <p className="text-sm text-red-700">{error}</p>
                {/expired|invalid|already been used/i.test(error) && (
                  <Link to="/forgot-password" className="mt-2 inline-block text-sm font-medium text-gray-900 hover:underline">
                    Request a new link
                  </Link>
                )}
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

export default ResetPassword;
