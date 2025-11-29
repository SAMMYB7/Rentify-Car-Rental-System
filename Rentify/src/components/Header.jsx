import { Link, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useState } from "react";
import { FaCar, FaUserCircle, FaBars, FaTimes } from "react-icons/fa";
import { motion } from "framer-motion";

const Header = () => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <header className="bg-gray-900 text-white shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          {/* Logo */}
          <motion.div 
            className="flex items-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
          >
            <Link to="/" className="flex items-center gap-2">
              <FaCar className="h-8 w-8" />
              <span className="text-xl font-bold tracking-wider">Rentify</span>
            </Link>
          </motion.div>
          
          {/* Desktop Navigation */}
          <div className="hidden md:flex md:items-center md:space-x-6">
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
            >
              <Link to="/cars" className="text-white hover:text-gray-300 px-3 py-2 rounded-none font-medium border-b-2 border-transparent hover:border-white transition-all duration-200">
                Browse Cars
              </Link>
            </motion.div>
            
            {/* Guest Links */}
            {!user && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
              >
                <Link to="/login" className="bg-white text-gray-900 hover:bg-gray-100 px-6 py-2 font-medium transition-colors border-b-2 border-gray-900">
                  Sign In
                </Link>
              </motion.div>
            )}
            
            {/* Customer Links */}
            {user && user.role === "CUSTOMER" && (
              <div className="flex items-center space-x-5">
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.1 }}
                >
                  <Link to="/dashboard" className="text-white hover:text-gray-300 px-3 py-2 font-medium border-b-2 border-transparent hover:border-white transition-all duration-200">
                    Dashboard
                  </Link>
                </motion.div>
                
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.2 }}
                >
                  <Link to="/profile" className="flex items-center gap-2 text-white hover:text-gray-300 px-3 py-2 font-medium border-b-2 border-transparent hover:border-white transition-all duration-200">
                    <FaUserCircle />
                    <span>{user.name ? `Hi, ${user.name}` : "Profile"}</span>
                  </Link>
                </motion.div>
                
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.3 }}
                >
                  <button
                    onClick={logout}
                    className="text-white hover:text-gray-300 px-3 py-2 font-medium border-b-2 border-transparent hover:border-white transition-all duration-200"
                  >
                    Logout
                  </button>
                </motion.div>
              </div>
            )}
            
            {/* Admin Links */}
            {user && user.role === "ADMIN" && (
              <div className="flex items-center space-x-5">
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.1 }}
                >
                  <Link to="/admin" className="text-white hover:text-gray-300 px-3 py-2 font-medium border-b-2 border-transparent hover:border-white transition-all duration-200">
                    Admin Dashboard
                  </Link>
                </motion.div>
                
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.2 }}
                >
                  <button
                    onClick={logout}
                    className="text-white hover:text-gray-300 px-3 py-2 font-medium border-b-2 border-transparent hover:border-white transition-all duration-200"
                  >
                    Logout
                  </button>
                </motion.div>
              </div>
            )}
          </div>

          {/* Mobile menu button */}
          <motion.div 
            className="flex md:hidden items-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
          >
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="text-white hover:text-gray-300 transition-colors"
            >
              {isMenuOpen ? <FaTimes className="h-6 w-6" /> : <FaBars className="h-6 w-6" />}
            </button>
          </motion.div>
        </div>
      </div>

      {/* Mobile menu */}
      {isMenuOpen && (
        <motion.div 
          className="md:hidden"
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          transition={{ duration: 0.3 }}
        >
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 bg-gray-800">
            <Link
              to="/cars"
              className="text-white block px-3 py-2 text-base font-medium hover:bg-gray-700 transition-colors border-l-4 border-transparent hover:border-white"
              onClick={() => setIsMenuOpen(false)}
            >
              Browse Cars
            </Link>
            
            {!user && (
              <Link
                to="/login"
                className="text-white block px-3 py-2 text-base font-medium hover:bg-gray-700 transition-colors border-l-4 border-transparent hover:border-white"
                onClick={() => setIsMenuOpen(false)}
              >
                Sign In
              </Link>
            )}
            
            {user && user.role === "CUSTOMER" && (
              <>
                <Link
                  to="/dashboard"
                  className="text-white block px-3 py-2 text-base font-medium hover:bg-gray-700 transition-colors border-l-4 border-transparent hover:border-white"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Dashboard
                </Link>
                <Link
                  to="/profile"
                  className="text-white block px-3 py-2 text-base font-medium hover:bg-gray-700 transition-colors border-l-4 border-transparent hover:border-white"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Profile
                </Link>
                <button
                  onClick={() => {
                    logout();
                    setIsMenuOpen(false);
                  }}
                  className="text-white block w-full text-left px-3 py-2 text-base font-medium hover:bg-gray-700 transition-colors border-l-4 border-transparent hover:border-white"
                >
                  Logout
                </button>
              </>
            )}
            
            {user && user.role === "ADMIN" && (
              <>
                <Link
                  to="/admin"
                  className="text-white block px-3 py-2 text-base font-medium hover:bg-gray-700 transition-colors border-l-4 border-transparent hover:border-white"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Admin Dashboard
                </Link>
                <button
                  onClick={() => {
                    logout();
                    setIsMenuOpen(false);
                  }}
                  className="text-white block w-full text-left px-3 py-2 text-base font-medium hover:bg-gray-700 transition-colors border-l-4 border-transparent hover:border-white"
                >
                  Logout
                </button>
              </>
            )}
          </div>
        </motion.div>
      )}
    </header>
  );
};

export default Header;