import { useEffect, useState } from "react";
import api from "../../api/axios";
import { motion } from "framer-motion";
import { FaFileAlt, FaTrash, FaCalendarAlt, FaUserCircle, FaCarSide } from "react-icons/fa";

const AdminBookings = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    total: 0,
    active: 0,
    paid: 0,
    cancelled: 0
  });

  useEffect(() => {
    const fetchBookings = async () => {
      try {
        const res = await api.get("/bookings");
        setBookings(res.data);
        
        // Calculate booking stats
        const total = res.data.length;
        const active = res.data.filter(b => b.status === "BOOKED").length;
        const paid = res.data.filter(b => b.status === "PAID").length;
        const cancelled = res.data.filter(b => b.status === "CANCELLED").length;
        
        setStats({
          total,
          active,
          paid,
          cancelled
        });
      } catch (err) {
        setBookings([]);
      } finally {
        setLoading(false);
      }
    };
    fetchBookings();
  }, []);

  const handleCancel = async (id) => {
    if (!window.confirm("Are you sure you want to cancel this booking?")) return;
    try {
      await api.delete(`/bookings/${id}`);
      setBookings(bookings => bookings.map(b => b.id === id ? { ...b, status: "CANCELLED" } : b));
      
      // Update stats after cancellation
      setStats(prev => ({
        ...prev,
        active: prev.active - 1,
        cancelled: prev.cancelled + 1
      }));
    } catch (err) {
      alert(err.response?.data?.message || "Failed to cancel booking.");
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric', 
      month: 'short', 
      day: 'numeric'
    }).format(date);
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
      className="max-w-6xl mx-auto py-12 px-4 sm:px-6"
    >
      <div className="bg-white shadow-md rounded-none border-t-2 border-gray-900 p-6 md:p-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-2xl font-bold text-gray-900 flex items-center">
            <FaFileAlt className="mr-3 text-gray-700" /> Booking Management
          </h1>
          <span className="bg-gray-200 py-1 px-3 text-sm font-medium text-gray-800 rounded-full">
            Total Bookings: {stats.total}
          </span>
        </div>

        {/* Booking Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-8">
          <div className="bg-white border border-gray-200 rounded-none p-6 hover:shadow-md transition-shadow">
            <div className="flex items-center gap-4">
              <div className="bg-yellow-100 p-3 rounded-lg">
                <FaFileAlt className="h-6 w-6 text-yellow-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Pending Bookings</p>
                <h3 className="text-2xl font-bold text-gray-900">{stats.active}</h3>
              </div>
            </div>
          </div>

          <div className="bg-white border border-gray-200 rounded-none p-6 hover:shadow-md transition-shadow">
            <div className="flex items-center gap-4">
              <div className="bg-green-100 p-3 rounded-lg">
                <FaFileAlt className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Paid Bookings</p>
                <h3 className="text-2xl font-bold text-gray-900">{stats.paid}</h3>
              </div>
            </div>
          </div>

          <div className="bg-white border border-gray-200 rounded-none p-6 hover:shadow-md transition-shadow">
            <div className="flex items-center gap-4">
              <div className="bg-red-100 p-3 rounded-lg">
                <FaFileAlt className="h-6 w-6 text-red-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Cancelled Bookings</p>
                <h3 className="text-2xl font-bold text-gray-900">{stats.cancelled}</h3>
              </div>
            </div>
          </div>
        </div>

        {/* Bookings Table */}
        {bookings.length === 0 ? (
          <div className="py-12 text-center bg-gray-50 border border-gray-200">
            <FaFileAlt className="mx-auto h-12 w-12 text-gray-300 mb-4" />
            <p className="text-gray-500 mb-4">No booking records found.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-100">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Car</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Dates</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Created</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {bookings.map((booking) => (
                  <tr key={booking.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      #{booking.id}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <FaUserCircle className="h-5 w-5 text-gray-400 mr-2" />
                        <div className="text-sm text-gray-900">
                          {booking.userName || booking.user?.name || "N/A"}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <FaCarSide className="h-5 w-5 text-gray-400 mr-2" />
                        <div className="text-sm text-gray-900">
                          {booking.carModel || booking.car?.model || "N/A"}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col">
                        <div className="flex items-center text-sm text-gray-900">
                          <FaCalendarAlt className="mr-2 text-gray-400" /> 
                          <span>From: {formatDate(booking.startDate)}</span>
                        </div>
                        <div className="flex items-center text-sm text-gray-900 mt-1">
                          <FaCalendarAlt className="mr-2 text-gray-400" /> 
                          <span>To: {formatDate(booking.endDate)}</span>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-3 py-1 inline-flex text-xs font-medium rounded-full ${
                        booking.status === 'PAID' ? 'bg-green-100 text-green-800' :
                        booking.status === 'BOOKED' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        {booking.status === 'PAID' ? 'Paid' :
                         booking.status === 'BOOKED' ? 'Pending' : 
                         'Cancelled'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {booking.createdAt ? formatDate(booking.createdAt) : "N/A"}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      {booking.status !== "CANCELLED" && (
                        <button 
                          onClick={() => handleCancel(booking.id)}
                          className="inline-flex items-center text-red-600 hover:text-red-900"
                        >
                          <FaTrash className="mr-1" /> Cancel
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default AdminBookings;