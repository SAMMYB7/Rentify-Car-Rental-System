import { useEffect, useState } from "react";
import api from "../../api/axios";
import { motion } from "framer-motion";
import { FaFileInvoiceDollar, FaCheck, FaExclamationTriangle } from "react-icons/fa";

const AdminPayments = () => {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    total: 0,
    paid: 0,
    pending: 0
  });

  useEffect(() => {
    const fetchPayments = async () => {
      try {
        const res = await api.get("/payments/all");
        setPayments(res.data);
        
        // Calculate payment stats - fix the status check
        const total = res.data.reduce((sum, p) => sum + (p.amount || 0), 0);
        // Look for "SUCCESS" as well as "PAID" since the backend might be using either
        const paidPayments = res.data.filter(p => 
          p.status === "PAID" || p.status === "SUCCESS").length;
        const pendingPayments = res.data.length - paidPayments;
        
        setStats({
          total,
          paid: paidPayments,
          pending: pendingPayments
        });
      } catch (err) {
        setPayments([]);
      } finally {
        setLoading(false);
      }
    };
    fetchPayments();
  }, []);

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric', 
      month: 'short', 
      day: 'numeric',
      hour: '2-digit', 
      minute: '2-digit'
    }).format(date);
  };

  // Helper to determine the status style
  const getStatusStyle = (status) => {
    // Check for both "PAID" and "SUCCESS" status values
    if (status === "PAID" || status === "SUCCESS") {
      return "bg-green-100 text-green-800";
    }
    return "bg-yellow-100 text-yellow-800";
  };

  // Helper to display a normalized status
  const displayStatus = (status) => {
    if (status === "PAID" || status === "SUCCESS") {
      return "Completed";
    }
    return status || "PENDING";
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
            <FaFileInvoiceDollar className="mr-3 text-gray-700" /> Payment Management
          </h1>
          <span className="bg-gray-200 py-1 px-3 text-sm font-medium text-gray-800 rounded-full">
            Total Revenue: ₹{stats.total.toLocaleString()}
          </span>
        </div>

        {/* Payment Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          <div className="bg-white border border-gray-200 rounded-none p-6 hover:shadow-md transition-shadow">
            <div className="flex items-center gap-4">
              <div className="bg-blue-100 p-3 rounded-lg">
                <FaFileInvoiceDollar className="h-6 w-6 text-blue-500" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Total Payments</p>
                <h3 className="text-2xl font-bold text-gray-900">{payments.length}</h3>
              </div>
            </div>
          </div>

          <div className="bg-white border border-gray-200 rounded-none p-6 hover:shadow-md transition-shadow">
            <div className="flex items-center gap-4">
              <div className="bg-green-100 p-3 rounded-lg">
                <FaCheck className="h-6 w-6 text-green-500" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Completed Payments</p>
                <h3 className="text-2xl font-bold text-gray-900">{stats.paid}</h3>
              </div>
            </div>
          </div>

          <div className="bg-white border border-gray-200 rounded-none p-6 hover:shadow-md transition-shadow">
            <div className="flex items-center gap-4">
              <div className="bg-yellow-100 p-3 rounded-lg">
                <FaExclamationTriangle className="h-6 w-6 text-yellow-500" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Pending Payments</p>
                <h3 className="text-2xl font-bold text-gray-900">{stats.pending}</h3>
              </div>
            </div>
          </div>
        </div>

        {/* Payments Table */}
        {payments.length === 0 ? (
          <div className="py-12 text-center bg-gray-50 border border-gray-200">
            <FaFileInvoiceDollar className="mx-auto h-12 w-12 text-gray-300 mb-4" />
            <p className="text-gray-500 mb-4">No payment records found.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-100">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Order ID</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Booking ID</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Time</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {payments.map((payment, idx) => (
                  <tr key={idx} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {payment.orderId || "N/A"}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">₹{payment.amount?.toLocaleString() || "N/A"}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-3 py-1 inline-flex text-xs font-medium rounded-full ${getStatusStyle(payment.status)}`}>
                        {displayStatus(payment.status)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {payment.bookingId || "N/A"}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {payment.userEmail || "N/A"}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {formatDate(payment.paymentTime)}
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

export default AdminPayments;