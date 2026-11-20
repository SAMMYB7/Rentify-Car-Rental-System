import { useEffect, useState } from "react";
import api from "../../api/axios";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { FaCar, FaCalendarAlt, FaArrowLeft, FaCheckCircle, FaClock, FaTimes, FaRupeeSign } from "react-icons/fa";

const AllBookings = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBookings = async () => {
      try {
        // Each booking already includes carBrand, rentalDays and totalPrice from the backend.
        const res = await api.get("/users/bookings");
        setBookings(res.data);
      } catch (err) {
        console.error("Error fetching bookings:", err);
        // handle error or redirect to login
      } finally {
        setLoading(false);
      }
    };
    
    fetchBookings();
  }, []);

  const getStatusIcon = (status) => {
    switch (status) {
      case "PAID":
        return <FaCheckCircle className="text-green-500" />;
      case "BOOKED":
        return <FaClock className="text-yellow-500" />;
      case "CANCELLED":
        return <FaTimes className="text-red-500" />;
      default:
        return null;
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
      className="max-w-5xl mx-auto py-12 px-4 sm:px-6"
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
              <p className="text-gray-500 mb-4">You don't have any bookings yet.</p>
              <Link 
                to="/cars"
                className="bg-gray-900 text-white px-6 py-2 inline-block hover:bg-gray-800 transition-colors duration-200"
              >
                Browse Cars
              </Link>
            </div>
          ) : (
            <div className="overflow-hidden">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-100">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Car</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Dates</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {bookings.map((booking) => {
                    // Days and total come from the backend (same formula used when charging)
                    const start = new Date(booking.startDate);
                    const end = new Date(booking.endDate);
                    const days = booking.rentalDays;
                    
                    // Format dates for display
                    const startFormatted = start.toLocaleDateString('en-US', {
                      year: 'numeric', month: 'short', day: 'numeric'
                    });
                    const endFormatted = end.toLocaleDateString('en-US', {
                      year: 'numeric', month: 'short', day: 'numeric'
                    });

                    return (
                      <tr key={booking.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">{booking.carModel || "Vehicle"}</div>
                          <div className="text-sm text-gray-500">{booking.carBrand}</div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex flex-col">
                            <div className="flex items-center text-sm text-gray-900">
                              <FaCalendarAlt className="mr-2 text-gray-400" /> 
                              <span>From: {startFormatted}</span>
                            </div>
                            <div className="flex items-center text-sm text-gray-900 mt-1">
                              <FaCalendarAlt className="mr-2 text-gray-400" /> 
                              <span>To: {endFormatted}</span>
                            </div>
                            <div className="text-xs text-gray-500 mt-1">
                              {days} {days === 1 ? 'day' : 'days'}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            {getStatusIcon(booking.status)}
                            <span className={`ml-2 inline-flex text-xs font-medium rounded-full px-2 py-1 ${
                              booking.status === 'PAID' ? 'bg-green-100 text-green-800' :
                              booking.status === 'BOOKED' ? 'bg-yellow-100 text-yellow-800' :
                              'bg-red-100 text-red-800'
                            }`}>
                              {booking.status === 'PAID' ? 'Paid' :
                               booking.status === 'BOOKED' ? 'Pending Payment' : 
                               'Cancelled'}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          <div className="flex items-center">
                            <FaRupeeSign className="text-gray-500 mr-1" />
                            <span className="font-medium">
                              {booking.totalPrice != null
                                ? booking.totalPrice.toLocaleString("en-IN")
                                : "N/A"}
                            </span>
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
    </motion.div>
  );
};

export default AllBookings;