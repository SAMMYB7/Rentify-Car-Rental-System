import { useEffect, useState } from "react";
import api from "../../api/axios";
import { useAuth } from "../../context/AuthContext";
import { Link } from "react-router-dom";
import ReviewModal from "../../components/ReviewModal";
import { motion } from "framer-motion";
import { FaCar, FaFileAlt, FaStar, FaUser, FaSignOutAlt, FaCreditCard, FaCheckCircle } from "react-icons/fa";

const Dashboard = () => {
  const { user, logout } = useAuth();
  const [profile, setProfile] = useState(null);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [reviewModal, setReviewModal] = useState({ open: false, booking: null });
  const [reviewedBookings, setReviewedBookings] = useState([]);

  useEffect(() => {
    const fetchProfileAndBookings = async () => {
      try {
        const [profileRes, bookingsRes] = await Promise.all([
          api.get("/users/me"),
          api.get("/users/bookings"),
        ]);
        setProfile(profileRes.data);
        setBookings(bookingsRes.data);

        // Fetch reviews for all bookings' cars by this user
        const carIds = bookingsRes.data.map(b => b.carId);
        const reviews = await Promise.all(
          carIds.map(carId => api.get(`/reviews?carId=${carId}`))
        );
        // Find which bookings have already been reviewed by this user
        const reviewed = [];
        reviews.forEach((res, idx) => {
          const booking = bookingsRes.data[idx];
          if (res.data.some(r => r.username === profileRes.data.name)) {
            reviewed.push(booking.id);
          }
        });
        setReviewedBookings(reviewed);
      } catch (err) {
        console.error("Error fetching data:", err);
        // Only logout if it's an auth error
        if (err.response?.status === 401) {
          logout();
        }
      } finally {
        setLoading(false);
      }
    };
    fetchProfileAndBookings();
  }, [logout]);

  const handlePayNow = async (bookingId) => {
    try {
      // 1. Create Razorpay order via backend
      const res = await api.post("/payments/create", { bookingId });
      const { orderId, amount, currency, key } = res.data;

      // 2. Open Razorpay checkout
      const options = {
        key,
        amount: amount * 100, // Razorpay expects paise
        currency,
        name: "Rentify Car Rental",
        description: "Car Booking Payment",
        order_id: orderId,
        handler: async function (response) {
          // 3. On payment success, verify payment
          try {
            await api.post("/payments/verify", {
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
            });
            alert("Payment successful!");
            window.location.reload();
          } catch (err) {
            alert("Payment verification failed!");
          }
        },
        prefill: {
          name: profile?.name,
          email: profile?.email,
        },
        theme: { color: "#333333" },
      };
      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (err) {
      alert("Could not initiate payment: " + (err.response?.data?.message || err.message));
    }
  };

  const handleReviewSubmit = async ({ rating, comment }) => {
    try {
      await api.post("/reviews", {
        carId: reviewModal.booking.carId,
        rating,
        comment,
      });
      alert("Review submitted!");
      setReviewModal({ open: false, booking: null });
      // Optionally, refresh bookings/reviews
      window.location.reload();
    } catch (err) {
      alert("Failed to submit review: " + (err.response?.data?.message || err.message));
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
      className="max-w-4xl mx-auto py-12 px-4 sm:px-6"
    >
      {/* User Profile Card */}
      <div className="bg-white shadow-md rounded-none border-t-2 border-gray-900 mb-8">
        <div className="p-6 md:p-8">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center">
              <div className="bg-gray-200 rounded-full h-16 w-16 flex items-center justify-center mr-4">
                <FaUser className="h-8 w-8 text-gray-500" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Welcome, {profile?.name || user?.name}!</h1>
                <p className="text-gray-600">{profile?.email}</p>
              </div>
            </div>
            <div className="hidden md:block">
              <Link
                to="/profile"
                className="bg-gray-900 text-white px-4 py-2 inline-flex items-center hover:bg-gray-800 transition-colors duration-200"
              >
                <FaUser className="mr-2" /> Edit Profile
              </Link>
            </div>
          </div>
          
          <div className="md:hidden mb-4">
            <Link
              to="/profile"
              className="bg-gray-900 text-white px-4 py-2 w-full flex items-center justify-center hover:bg-gray-800 transition-colors duration-200"
            >
              <FaUser className="mr-2" /> Edit Profile
            </Link>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <Link to="/cars" className="bg-gray-100 p-4 flex flex-col items-center text-center hover:bg-gray-200 transition-colors duration-200">
              <FaCar className="h-8 w-8 mb-2 text-gray-700" />
              <span className="text-gray-900 font-medium">Browse Cars</span>
            </Link>
            <Link to="/all-bookings" className="bg-gray-100 p-4 flex flex-col items-center text-center hover:bg-gray-200 transition-colors duration-200">
              <FaFileAlt className="h-8 w-8 mb-2 text-gray-700" />
              <span className="text-gray-900 font-medium">View All Bookings</span>
            </Link>
            <button 
              onClick={logout}
              className="bg-gray-100 p-4 flex flex-col items-center text-center hover:bg-gray-200 transition-colors duration-200"
            >
              <FaSignOutAlt className="h-8 w-8 mb-2 text-gray-700" />
              <span className="text-gray-900 font-medium">Logout</span>
            </button>
          </div>
        </div>
      </div>

      {/* Recent Bookings */}
      <div className="bg-white shadow-md rounded-none border-t-2 border-gray-900">
        <div className="p-6 md:p-8">
          <h2 className="text-xl font-bold mb-6 text-gray-900 flex items-center">
            <FaFileAlt className="mr-2" /> Recent Bookings
          </h2>
          
          {bookings.length === 0 ? (
            <div className="py-8 text-center bg-gray-50">
              <FaCar className="mx-auto h-12 w-12 text-gray-300 mb-4" />
              <p className="text-gray-500 mb-4">You don't have any bookings yet.</p>
              <Link 
                to="/cars"
                className="bg-gray-900 text-white px-6 py-2 inline-block hover:bg-gray-800 transition-colors duration-200"
              >
                Browse Cars
              </Link>
            </div>
          ) : (
            <div className="space-y-6">
              {bookings.slice(0, 5).map((b) => {
                const endDate = new Date(b.endDate);
                const now = new Date();
                const canReview =
                  b.status === "PAID" &&
                  endDate < now &&
                  !reviewedBookings.includes(b.id);

                return (
                  <div 
                    key={b.id} 
                    className="border-b border-gray-200 pb-6 last:border-b-0 last:pb-0"
                  >
                    <div className="flex flex-wrap justify-between items-start mb-2">
                      <div className="mb-2 md:mb-0">
                        <h3 className="text-lg font-semibold text-gray-900">{b.carModel || "Car"}</h3>
                        <div className="flex space-x-4 mt-1">
                          <p className="text-sm text-gray-600">
                            From: <span className="font-medium">{b.startDate}</span>
                          </p>
                          <p className="text-sm text-gray-600">
                            To: <span className="font-medium">{b.endDate}</span>
                          </p>
                        </div>
                      </div>
                      
                      <div className="flex items-center">
                        {b.status === "BOOKED" && (
                          <span className="px-2 py-1 text-xs font-semibold bg-yellow-100 text-yellow-800 mr-2">
                            Pending Payment
                          </span>
                        )}
                        {b.status === "PAID" && (
                          <span className="px-2 py-1 text-xs font-semibold bg-green-100 text-green-800 mr-2">
                            Paid
                          </span>
                        )}
                        {b.status === "CANCELLED" && (
                          <span className="px-2 py-1 text-xs font-semibold bg-red-100 text-red-800 mr-2">
                            Cancelled
                          </span>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex flex-wrap mt-4 gap-3">
                      {b.status === "BOOKED" && (
                        <button
                          onClick={() => handlePayNow(b.id)}
                          className="flex items-center bg-gray-900 text-white px-4 py-2 font-medium hover:bg-gray-800 transition-colors duration-200"
                        >
                          <FaCreditCard className="mr-2" /> Pay Now
                        </button>
                      )}
                      {canReview && (
                        <button
                          onClick={() => setReviewModal({ open: true, booking: b })}
                          className="flex items-center bg-gray-700 text-white px-4 py-2 font-medium hover:bg-gray-600 transition-colors duration-200"
                        >
                          <FaStar className="mr-2" /> Leave Review
                        </button>
                      )}
                      {b.status === "PAID" && reviewedBookings.includes(b.id) && (
                        <div className="flex items-center text-green-600">
                          <FaCheckCircle className="mr-1" /> Reviewed
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
              
              {bookings.length > 5 && (
                <div className="text-center pt-4">
                  <Link 
                    to="/all-bookings"
                    className="inline-block text-gray-700 hover:text-gray-900 font-medium hover:underline"
                  >
                    View all bookings →
                  </Link>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
      
      <ReviewModal
        open={reviewModal.open}
        onClose={() => setReviewModal({ open: false, booking: null })}
        onSubmit={handleReviewSubmit}
        carModel={reviewModal.booking?.carModel}
      />
    </motion.div>
  );
};

export default Dashboard;