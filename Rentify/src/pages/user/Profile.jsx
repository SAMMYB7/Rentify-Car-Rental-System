import { useEffect, useState } from "react";
import api from "../../api/axios";
import { motion } from "framer-motion";
import { FaUser, FaEnvelope, FaIdCard, FaEdit } from "react-icons/fa";
import { Link } from "react-router-dom";

const Profile = () => {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editMode, setEditMode] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: ""
  });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await api.get("/users/me");
        setProfile(res.data);
        setFormData({
          name: res.data.name || "",
          email: res.data.email || ""
        });
      } catch (err) {
        console.error("Failed to fetch profile:", err);
      } finally {
        setLoading(false);
      }
    };
    
    fetchProfile();
  }, []);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    
    try {
      const res = await api.put("/users/me", formData);
      setProfile(res.data);
      setSuccess("Profile updated successfully!");
      setEditMode(false);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to update profile");
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <div className="w-16 h-16 border-4 border-gray-900 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="max-w-2xl mx-auto py-12 px-4 sm:px-6"
    >
      <div className="bg-white shadow-md rounded-none border-t-2 border-gray-900">
        <div className="p-6 md:p-8">
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-2xl font-bold text-gray-900">My Profile</h1>
            {!editMode && (
              <button
                onClick={() => setEditMode(true)}
                className="flex items-center gap-2 bg-gray-900 text-white px-4 py-2 hover:bg-gray-800 transition-colors duration-200"
              >
                <FaEdit /> Edit
              </button>
            )}
          </div>

          {!editMode ? (
            <div className="space-y-6">
              <div className="flex border-b border-gray-200 py-4">
                <div className="w-10 text-gray-500 flex-shrink-0">
                  <FaUser className="w-5 h-5" />
                </div>
                <div className="ml-4">
                  <p className="text-sm text-gray-500">Name</p>
                  <p className="font-medium text-gray-900">{profile?.name || "Not provided"}</p>
                </div>
              </div>

              <div className="flex border-b border-gray-200 py-4">
                <div className="w-10 text-gray-500 flex-shrink-0">
                  <FaEnvelope className="w-5 h-5" />
                </div>
                <div className="ml-4">
                  <p className="text-sm text-gray-500">Email</p>
                  <p className="font-medium text-gray-900">{profile?.email || "Not provided"}</p>
                </div>
              </div>

              <div className="flex border-b border-gray-200 py-4">
                <div className="w-10 text-gray-500 flex-shrink-0">
                  <FaIdCard className="w-5 h-5" />
                </div>
                <div className="ml-4">
                  <p className="text-sm text-gray-500">Account Type</p>
                  <p className="font-medium text-gray-900">
                    {profile?.role === "ADMIN" 
                      ? "Administrator" 
                      : profile?.role === "CUSTOMER" 
                      ? "Customer" 
                      : profile?.role || "Unknown"}
                  </p>
                </div>
              </div>
              
              {success && (
                <div className="bg-green-50 border-l-4 border-green-500 p-4 mt-4">
                  <div className="flex">
                    <div className="ml-3">
                      <p className="text-sm text-green-700">{success}</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                  Name
                </label>
                <input
                  id="name"
                  name="name"
                  type="text"
                  value={formData.name}
                  onChange={handleChange}
                  className="appearance-none block w-full px-3 py-2 border border-gray-300 focus:outline-none focus:ring-gray-900 focus:border-gray-900"
                />
              </div>
              
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                  Email
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="appearance-none block w-full px-3 py-2 border border-gray-300 focus:outline-none focus:ring-gray-900 focus:border-gray-900"
                />
              </div>
              
              {error && (
                <div className="bg-red-50 border-l-4 border-red-500 p-4">
                  <div className="flex">
                    <div className="ml-3">
                      <p className="text-sm text-red-700">{error}</p>
                    </div>
                  </div>
                </div>
              )}
              
              <div className="flex gap-4">
                <button
                  type="submit"
                  className="bg-gray-900 hover:bg-gray-800 text-white font-medium py-2 px-6 transition-colors duration-200 border-b-2 border-gray-700"
                >
                  Save Changes
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setEditMode(false);
                    setFormData({
                      name: profile?.name || "",
                      email: profile?.email || ""
                    });
                  }}
                  className="bg-gray-100 hover:bg-gray-200 text-gray-800 font-medium py-2 px-6 transition-colors duration-200 border border-gray-300"
                >
                  Cancel
                </button>
              </div>
            </form>
          )}
          
          <div className="mt-8 border-t border-gray-200 pt-6">
            <div className="flex flex-col sm:flex-row sm:justify-between">
              <Link 
                to="/dashboard"
                className="mb-4 sm:mb-0 inline-flex items-center text-gray-700 hover:text-gray-900"
              >
                <span className="mr-2">←</span> Back to Dashboard
              </Link>
              
              <Link
                to="/all-bookings"
                className="inline-flex items-center text-gray-700 hover:text-gray-900"
              >
                View Booking History
              </Link>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default Profile;