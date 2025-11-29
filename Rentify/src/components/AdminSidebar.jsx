import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { motion } from "framer-motion";
import { 
  FaChartLine, 
  FaUser, 
  FaCar, 
  FaCalendarAlt, 
  FaMoneyBillWave, 
  FaSignOutAlt 
} from "react-icons/fa";

const AdminSidebar = () => {
  const location = useLocation();
  const { logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const isActive = (path) => {
    return path === "/admin"
      ? location.pathname === "/admin"
      : location.pathname.startsWith(path);
  };

  const linkVariants = {
    hover: {
      backgroundColor: "rgba(0, 0, 0, 0.05)",
      transition: { duration: 0.2 }
    }
  };

  return (
    <motion.aside
      initial={{ x: -220 }}
      animate={{ x: 0 }}
      transition={{ duration: 0.3 }}
      className="w-[220px] min-h-screen bg-white border-r border-gray-200 fixed left-0 top-0 bottom-0 z-10"
    >
      <div className="flex flex-col h-full">
        <div className="py-6 border-b border-gray-200">
          <div className="flex items-center justify-center">
            <FaChartLine className="h-6 w-6 text-gray-900 mr-2" />
            <h1 className="font-bold text-xl text-gray-900">Admin Panel</h1>
          </div>
        </div>

        <nav className="flex-grow py-6 px-4 space-y-1">
          <motion.div variants={linkVariants} whileHover="hover">
            <Link 
              to="/admin" 
              className={`flex items-center px-4 py-3 text-base font-medium rounded-none transition-colors ${
                isActive("/admin") 
                ? "bg-gray-900 text-white" 
                : "text-gray-700 hover:bg-gray-100"
              }`}
            >
              <FaChartLine className="mr-3 h-5 w-5" />
              Dashboard
            </Link>
          </motion.div>
          
          <motion.div variants={linkVariants} whileHover="hover">
            <Link 
              to="/admin/users" 
              className={`flex items-center px-4 py-3 text-base font-medium rounded-none transition-colors ${
                isActive("/admin/users") 
                ? "bg-gray-900 text-white" 
                : "text-gray-700 hover:bg-gray-100"
              }`}
            >
              <FaUser className="mr-3 h-5 w-5" />
              Manage Users
            </Link>
          </motion.div>
          
          <motion.div variants={linkVariants} whileHover="hover">
            <Link 
              to="/admin/cars" 
              className={`flex items-center px-4 py-3 text-base font-medium rounded-none transition-colors ${
                isActive("/admin/cars") 
                ? "bg-gray-900 text-white" 
                : "text-gray-700 hover:bg-gray-100"
              }`}
            >
              <FaCar className="mr-3 h-5 w-5" />
              Manage Cars
            </Link>
          </motion.div>
          
          <motion.div variants={linkVariants} whileHover="hover">
            <Link 
              to="/admin/bookings" 
              className={`flex items-center px-4 py-3 text-base font-medium rounded-none transition-colors ${
                isActive("/admin/bookings") 
                ? "bg-gray-900 text-white" 
                : "text-gray-700 hover:bg-gray-100"
              }`}
            >
              <FaCalendarAlt className="mr-3 h-5 w-5" />
              Manage Bookings
            </Link>
          </motion.div>
          
          <motion.div variants={linkVariants} whileHover="hover">
            <Link 
              to="/admin/payments" 
              className={`flex items-center px-4 py-3 text-base font-medium rounded-none transition-colors ${
                isActive("/admin/payments") 
                ? "bg-gray-900 text-white" 
                : "text-gray-700 hover:bg-gray-100"
              }`}
            >
              <FaMoneyBillWave className="mr-3 h-5 w-5" />
              Payments
            </Link>
          </motion.div>
        </nav>
        
        <div className="p-4 border-t border-gray-200">
          <button
            onClick={handleLogout}
            className="flex w-full items-center justify-center px-4 py-3 bg-gray-900 hover:bg-gray-800 text-white font-medium rounded-none transition-colors"
          >
            <FaSignOutAlt className="mr-3 h-5 w-5" />
            Logout
          </button>
        </div>
      </div>
    </motion.aside>
  );
};

export default AdminSidebar;