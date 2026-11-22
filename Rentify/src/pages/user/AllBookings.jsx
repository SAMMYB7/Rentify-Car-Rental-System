import { useCallback, useEffect, useState } from "react";
import api from "../../api/axios";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  FaCar, FaCalendarAlt, FaArrowLeft, FaCheckCircle, FaClock, FaTimes, FaRupeeSign, FaFlagCheckered, FaTimesCircle,
} from "react-icons/fa";
import EditDatesModal from "../../components/booking/EditDatesModal";
import CancelBookingModal from "../../components/booking/CancelBookingModal";
import PaymentCountdown from "../../components/booking/PaymentCountdown";

// One place for how each booking status looks.
const STATUS = {
  BOOKED: { label: "Pending Payment", badge: "bg-yellow-100 text-yellow-800", icon: <FaClock className="text-yellow-500" /> },
  PAID: { label: "Paid", badge: "bg-green-100 text-green-800", icon: <FaCheckCircle className="text-green-500" /> },
  COMPLETED: { label: "Completed", badge: "bg-blue-100 text-blue-800", icon: <FaFlagCheckered className="text-blue-500" /> },
  CANCELLED: { label: "Cancelled", badge: "bg-red-100 text-red-800", icon: <FaTimes className="text-red-500" /> },
};

const formatDate = (iso) =>
  new Date(iso).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" });

const AllBookings = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editTarget, setEditTarget] = useState(null);
  const [cancelTarget, setCancelTarget] = useState(null);

  // Each booking already includes carBrand, rentalDays, totalPrice and the allowed actions from the backend.
  const loadBookings = useCallback(async () => {
    try {
      const res = await api.get("/users/bookings");
      setBookings(res.data);
    } catch (err) {
      console.error("Error fetching bookings:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadBookings();
  }, [loadBookings]);

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
      className="max-w-6xl mx-auto py-12 px-4 sm:px-6"
    >
      <div className="bg-white shadow-md rounded-none border-t-2 border-gray-900">
        <div className="p-6 md:p-8">
          <div className="flex items-center justify-between mb-8">
            <h1 className="text-2xl font-bold text-gray-900">Booking History</h1>
            <Link
              to="/dashboard"
              className="flex items-center gap-2 bg-gray-900 text-white px-4 py-2 hover:bg-gray-800 transition-colors duration-200"
            >
              <FaArrowLeft className="text-sm" /> Back to Dashboard
            </Link>
          </div>

          {bookings.length === 0 ? (
            <div className="py-12 text-center bg-gray-50">
              <FaCar className="mx-auto h-12 w-12 text-gray-300 mb-4" />
              <p className="text-gray-500 mb-4">You don&apos;t have any bookings yet.</p>
              <Link
                to="/cars"
                className="bg-gray-900 text-white px-6 py-2 inline-block hover:bg-gray-800 transition-colors duration-200"
              >
                Browse Cars
              </Link>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-100">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Car</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Dates</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {bookings.map((booking) => {
                    const status = STATUS[booking.status] || STATUS.CANCELLED;
                    const days = booking.rentalDays;
                    return (
                      <tr key={booking.id} className="hover:bg-gray-50 align-top">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">{booking.carModel || "Vehicle"}</div>
                          <div className="text-sm text-gray-500">{booking.carBrand}</div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center text-sm text-gray-900">
                            <FaCalendarAlt className="mr-2 text-gray-400" />
                            <span>From: {formatDate(booking.startDate)}</span>
                          </div>
                          <div className="flex items-center text-sm text-gray-900 mt-1">
                            <FaCalendarAlt className="mr-2 text-gray-400" />
                            <span>To: {formatDate(booking.endDate)}</span>
                          </div>
                          <div className="text-xs text-gray-500 mt-1">
                            {days} {days === 1 ? "day" : "days"}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center whitespace-nowrap">
                            {status.icon}
                            <span className={`ml-2 inline-flex text-xs font-medium rounded-full px-2 py-1 ${status.badge}`}>
                              {status.label}
                            </span>
                          </div>
                          {booking.status === "BOOKED" && booking.paymentDueAt && (
                            <div className="mt-2">
                              <PaymentCountdown dueAt={booking.paymentDueAt} onExpire={loadBookings} />
                            </div>
                          )}
                          {booking.status === "CANCELLED" && booking.refundAmount > 0 && (
                            <div className="text-xs text-gray-600 mt-2">
                              Refunded &#8377;{booking.refundAmount.toLocaleString("en-IN")}
                            </div>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          <div className="flex items-center">
                            <FaRupeeSign className="text-gray-500 mr-1" />
                            <span className="font-medium">
                              {booking.totalPrice != null ? booking.totalPrice.toLocaleString("en-IN") : "N/A"}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex flex-col gap-2">
                            {booking.editable && (
                              <button
                                onClick={() => setEditTarget(booking)}
                                className="inline-flex items-center text-sm border border-gray-900 text-gray-900 px-3 py-1 hover:bg-gray-100 transition-colors whitespace-nowrap"
                              >
                                <FaCalendarAlt className="mr-2" /> Change Dates
                              </button>
                            )}
                            {booking.cancellable && (
                              <button
                                onClick={() => setCancelTarget(booking)}
                                className="inline-flex items-center text-sm border border-red-600 text-red-600 px-3 py-1 hover:bg-red-50 transition-colors whitespace-nowrap"
                              >
                                <FaTimesCircle className="mr-2" /> Cancel
                              </button>
                            )}
                            {!booking.editable && !booking.cancellable && (
                              <span className="text-xs text-gray-400">No actions</span>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {editTarget && (
        <EditDatesModal
          booking={editTarget}
          onClose={() => setEditTarget(null)}
          onSaved={() => { setEditTarget(null); loadBookings(); }}
        />
      )}
      {cancelTarget && (
        <CancelBookingModal
          booking={cancelTarget}
          onClose={() => setCancelTarget(null)}
          onCancelled={() => { setCancelTarget(null); loadBookings(); }}
        />
      )}
    </motion.div>
  );
};

export default AllBookings;
