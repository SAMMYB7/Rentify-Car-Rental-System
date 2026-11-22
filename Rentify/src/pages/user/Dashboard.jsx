import { useCallback, useEffect, useState } from "react";
import api from "../../api/axios";
import { useAuth } from "../../context/AuthContext";
import { Link } from "react-router-dom";
import ReviewModal from "../../components/ReviewModal";
import { motion } from "framer-motion";
import { toast } from "sonner";
import {
  FaCar, FaFileAlt, FaStar, FaUser, FaSignOutAlt, FaCreditCard, FaCheckCircle, FaFileDownload,
  FaCalendarAlt, FaTimesCircle,
} from "react-icons/fa";
import EditDatesModal from "../../components/booking/EditDatesModal";
import CancelBookingModal from "../../components/booking/CancelBookingModal";
import PaymentCountdown from "../../components/booking/PaymentCountdown";

// Reads the backend error message, including from blob responses (used by the PDF download).
const getErrorMessage = async (err, fallback) => {
  const data = err.response?.data;
  if (data instanceof Blob) {
    try {
      const parsed = JSON.parse(await data.text());
      return parsed.message || fallback;
    } catch {
      return fallback;
    }
  }
  return data?.message || (typeof data === "string" && data) || err.message || fallback;
};

const Dashboard = () => {
  const { user, logout } = useAuth();
  const [profile, setProfile] = useState(null);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [reviewModal, setReviewModal] = useState({ open: false, booking: null });
  const [reviewedBookings, setReviewedBookings] = useState([]);
  const [downloadingId, setDownloadingId] = useState(null);
  const [editTarget, setEditTarget] = useState(null);
  const [cancelTarget, setCancelTarget] = useState(null);

  // Loads profile, bookings and review state. Re-used after payments/reviews to refresh in place
  // (a full page reload would wipe the toast notifications).
  const loadDashboard = useCallback(async () => {
    try {
      const [profileRes, bookingsRes] = await Promise.all([
        api.get("/users/me"),
        api.get("/users/bookings"),
      ]);
      setProfile(profileRes.data);
      setBookings(bookingsRes.data);

      // Find which bookings' cars this user has already reviewed
      const reviews = await Promise.all(
        bookingsRes.data.map((b) => api.get("/reviews", { params: { carId: b.carId } }))
      );
      const reviewed = [];
      reviews.forEach((res, idx) => {
        if (res.data.some((r) => r.username === profileRes.data.name)) {
          reviewed.push(bookingsRes.data[idx].id);
        }
      });
      setReviewedBookings(reviewed);
    } catch (err) {
      console.error("Error fetching data:", err);
      if (err.response?.status === 401) logout();
    } finally {
      setLoading(false);
    }
  }, [logout]);

  useEffect(() => {
    loadDashboard();
  }, [loadDashboard]);

  const verifyPayment = async (response) => {
    const toastId = toast.loading("Verifying your payment...");
    try {
      const res = await api.post("/payments/verify", {
        razorpay_order_id: response.razorpay_order_id,
        razorpay_payment_id: response.razorpay_payment_id,
        razorpay_signature: response.razorpay_signature,
      });
      const { invoiceEmailed, alreadyVerified } = res.data;

      toast.success("Payment successful! Your booking is confirmed.", { id: toastId });
      if (invoiceEmailed) {
        toast.success("Invoice sent to your email", {
          description: `We've emailed your PDF invoice to ${profile?.email || "your inbox"}.`,
        });
      } else if (!alreadyVerified) {
        toast.warning("We couldn't email your invoice", {
          description: "Your booking is confirmed. Download the invoice from your dashboard.",
        });
      }
      await loadDashboard();
    } catch (err) {
      if (err.response?.status === 409 && err.response?.data?.refunded) {
        // Paid after the 30-minute hold expired and the car was no longer available: money refunded.
        toast.warning("Booking expired: payment refunded", {
          id: toastId,
          description: err.response.data.message,
          duration: 10000,
        });
      } else {
        toast.error("Payment verification failed", {
          id: toastId,
          description: await getErrorMessage(err, "If money was deducted, please contact support."),
          duration: 10000,
        });
      }
      await loadDashboard();
    }
  };

  const handlePayNow = async (bookingId) => {
    if (!window.Razorpay) {
      toast.error("Payment service failed to load", {
        description: "Check your connection and refresh the page.",
      });
      return;
    }
    try {
      // 1. Create (or reuse) the Razorpay order via the backend
      const res = await api.post("/payments/create", { bookingId });
      const { orderId, currency, key } = res.data;

      // 2. Open Razorpay checkout. The amount comes from the order itself, so it is not passed
      //    here (a float like 1999.99 * 100 can produce a non-integer and make checkout reject it).
      const rzp = new window.Razorpay({
        key,
        currency,
        name: "Rentify Car Rental",
        description: "Car Booking Payment",
        order_id: orderId,
        handler: verifyPayment, // 3. verify, confirm booking, email invoice
        prefill: { name: profile?.name, email: profile?.email },
        theme: { color: "#111827" },
        modal: {
          ondismiss: () => toast.info("Payment cancelled. You can pay any time from your dashboard."),
        },
      });
      rzp.on("payment.failed", (response) => {
        console.error("Razorpay payment failed:", response.error);
        toast.error("Payment failed", { description: response.error?.description || "Please try again." });
      });
      rzp.open();
    } catch (err) {
      toast.error("Could not start payment", { description: await getErrorMessage(err, "Please try again.") });
    }
  };

  const handleDownloadInvoice = async (booking) => {
    setDownloadingId(booking.id);
    try {
      const res = await api.get(`/payments/booking/${booking.id}/invoice`, { responseType: "blob" });
      const url = URL.createObjectURL(new Blob([res.data], { type: "application/pdf" }));
      const link = document.createElement("a");
      link.href = url;
      link.download = `Rentify-Invoice-${String(booking.id).slice(0, 8)}.pdf`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      URL.revokeObjectURL(url);
      toast.success("Invoice downloaded");
    } catch (err) {
      toast.error("Could not download invoice", { description: await getErrorMessage(err, "Please try again.") });
    } finally {
      setDownloadingId(null);
    }
  };

  const handleReviewSubmit = async ({ rating, comment }) => {
    try {
      await api.post("/reviews", {
        carId: reviewModal.booking.carId,
        rating,
        comment,
      });
      toast.success("Thanks! Your review has been submitted.");
      setReviewModal({ open: false, booking: null });
      await loadDashboard();
    } catch (err) {
      toast.error("Failed to submit review", { description: await getErrorMessage(err, "Please try again.") });
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
                const tripDone = (b.status === "PAID" || b.status === "COMPLETED") && endDate < now;
                const canReview = tripDone && !reviewedBookings.includes(b.id);

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
                        {b.status === "COMPLETED" && (
                          <span className="px-2 py-1 text-xs font-semibold bg-blue-100 text-blue-800 mr-2">
                            Completed
                          </span>
                        )}
                        {b.status === "CANCELLED" && (
                          <span className="px-2 py-1 text-xs font-semibold bg-red-100 text-red-800 mr-2">
                            Cancelled
                          </span>
                        )}
                      </div>
                    </div>

                    {b.status === "CANCELLED" && b.refundAmount > 0 && (
                      <p className="text-sm text-gray-600 mt-1">
                        Refunded &#8377;{b.refundAmount.toLocaleString("en-IN")} to your original payment method.
                      </p>
                    )}
                    {b.status === "BOOKED" && b.paymentDueAt && (
                      <div className="mt-2">
                        <PaymentCountdown dueAt={b.paymentDueAt} onExpire={loadDashboard} />
                      </div>
                    )}

                    <div className="flex flex-wrap mt-4 gap-3">
                      {b.status === "BOOKED" && (
                        <button
                          onClick={() => handlePayNow(b.id)}
                          className="flex items-center bg-gray-900 text-white px-4 py-2 font-medium hover:bg-gray-800 transition-colors duration-200"
                        >
                          <FaCreditCard className="mr-2" /> Pay Now
                        </button>
                      )}
                      {b.editable && (
                        <button
                          onClick={() => setEditTarget(b)}
                          className="flex items-center border border-gray-900 text-gray-900 px-4 py-2 font-medium hover:bg-gray-100 transition-colors duration-200"
                        >
                          <FaCalendarAlt className="mr-2" /> Change Dates
                        </button>
                      )}
                      {b.cancellable && (
                        <button
                          onClick={() => setCancelTarget(b)}
                          className="flex items-center border border-red-600 text-red-600 px-4 py-2 font-medium hover:bg-red-50 transition-colors duration-200"
                        >
                          <FaTimesCircle className="mr-2" /> Cancel
                        </button>
                      )}
                      {(b.status === "PAID" || b.status === "COMPLETED") && (
                        <button
                          onClick={() => handleDownloadInvoice(b)}
                          disabled={downloadingId === b.id}
                          className="flex items-center border border-gray-900 text-gray-900 px-4 py-2 font-medium hover:bg-gray-100 transition-colors duration-200 disabled:opacity-60"
                        >
                          <FaFileDownload className="mr-2" />
                          {downloadingId === b.id ? "Preparing..." : "Download Invoice"}
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
                      {tripDone && reviewedBookings.includes(b.id) && (
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
      {editTarget && (
        <EditDatesModal
          booking={editTarget}
          onClose={() => setEditTarget(null)}
          onSaved={() => { setEditTarget(null); loadDashboard(); }}
        />
      )}
      {cancelTarget && (
        <CancelBookingModal
          booking={cancelTarget}
          onClose={() => setCancelTarget(null)}
          onCancelled={() => { setCancelTarget(null); loadDashboard(); }}
        />
      )}
    </motion.div>
  );
};

export default Dashboard;