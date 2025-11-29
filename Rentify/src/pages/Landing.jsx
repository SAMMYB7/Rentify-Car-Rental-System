import { useAuth } from "../context/AuthContext";
import { useNavigate, Link } from "react-router-dom";
import { useEffect } from "react";
import { FaCar, FaMapMarkerAlt, FaCreditCard, FaUserShield } from "react-icons/fa";
import { motion } from "framer-motion";

const Landing = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && user) {
      navigate(user.role === "ADMIN" ? "/admin" : "/dashboard", { replace: true });
    }
  }, [user, loading, navigate]);

  // Features section data
  const features = [
    {
      icon: <FaCar className="text-4xl mb-4 text-gray-800" />,
      title: "Premium Selection",
      description: "Choose from our extensive fleet of well-maintained vehicles suitable for any occasion."
    },
    {
      icon: <FaMapMarkerAlt className="text-4xl mb-4 text-gray-800" />,
      title: "Convenient Locations",
      description: "Pick up and drop off your rental car at any of our strategically located facilities."
    },
    {
      icon: <FaCreditCard className="text-4xl mb-4 text-gray-800" />,
      title: "Seamless Payment",
      description: "Secure and hassle-free online payment options for your peace of mind."
    },
    {
      icon: <FaUserShield className="text-4xl mb-4 text-gray-800" />,
      title: "24/7 Support",
      description: "Our dedicated customer service team is available around the clock to assist you."
    }
  ];

  const fadeIn = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { duration: 0.6 }
    }
  };

  const staggerContainer = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2
      }
    }
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <div className="bg-gray-900 text-white py-28 px-4 relative overflow-hidden">
        <div className="absolute inset-0 z-0">
          <div className="absolute inset-0 bg-black opacity-60"></div>
          <div className="absolute inset-0 bg-gradient-to-r from-gray-900 to-transparent"></div>
        </div>
        
        <motion.div 
          className="max-w-6xl mx-auto text-center relative z-10"
          initial="hidden"
          animate="visible"
          variants={staggerContainer}
        >
          <motion.h1 
            className="text-5xl md:text-6xl font-bold mb-6 leading-tight"
            variants={fadeIn}
          >
            Elevate Your Journey with Rentify
          </motion.h1>
          
          <motion.p 
            className="text-xl max-w-3xl mx-auto mb-10 text-gray-200"
            variants={fadeIn}
          >
            Experience unparalleled freedom on the open road with our premium car rental service.
            From executive sedans to luxury SUVs, find your perfect vehicle.
          </motion.p>
          
          <motion.div 
            className="flex flex-wrap gap-6 justify-center"
            variants={fadeIn}
          >
            <Link to="/cars" 
                  className="bg-white text-gray-900 font-bold py-3 px-10 rounded-none
                           hover:bg-gray-100 transition-all duration-300 shadow-lg
                           border-b-2 border-gray-900 transform hover:-translate-y-1">
              Browse Fleet
            </Link>
            <Link to="/login"
                  className="bg-transparent border-2 border-white text-white font-bold py-3 px-10 rounded-none
                           hover:bg-white hover:text-gray-900 transition-all duration-300 shadow-lg
                           transform hover:-translate-y-1">
              Sign In
            </Link>
          </motion.div>
        </motion.div>
      </div>

      {/* Features Section */}
      <div className="py-24 px-4 bg-white">
        <motion.div 
          className="max-w-6xl mx-auto"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
          variants={staggerContainer}
        >
          <motion.h2 
            className="text-3xl font-bold text-center mb-16 text-gray-900 after:content-[''] after:block after:w-24 after:h-1 after:bg-gray-900 after:mx-auto after:mt-4"
            variants={fadeIn}
          >
            The Rentify Advantage
          </motion.h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
            {features.map((feature, index) => (
              <motion.div 
                key={index} 
                className="text-center p-8 border border-gray-200 rounded-none hover:shadow-xl transition-all duration-300 group bg-white"
                variants={fadeIn}
                whileHover={{ y: -10, transition: { duration: 0.3 } }}
              >
                <div className="mb-6 text-gray-800 transform transition-transform duration-300 group-hover:scale-110">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-semibold mb-3 text-gray-900">{feature.title}</h3>
                <p className="text-gray-600">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Testimonial Section */}
      <motion.div 
        className="py-20 px-4 bg-gray-100"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.2 }}
        variants={staggerContainer}
      >
        <div className="max-w-5xl mx-auto">
          <motion.h2 
            className="text-3xl font-bold mb-12 text-center text-gray-900"
            variants={fadeIn}
          >
            Customer Reviews
          </motion.h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <motion.div 
              className="bg-white p-6 shadow-sm border-t-2 border-gray-900"
              variants={fadeIn}
            >
              <div className="flex items-center mb-4">
                <div className="flex text-yellow-500">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <svg key={star} className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                      <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
                    </svg>
                  ))}
                </div>
              </div>
              <p className="text-gray-700 mb-4">
                "Great service and clean cars. The pickup was quick and the staff was friendly. Would definitely use again."
              </p>
              <p className="font-medium text-gray-900">— Rahul M.</p>
            </motion.div>

            <motion.div 
              className="bg-white p-6 shadow-sm border-t-2 border-gray-900"
              variants={fadeIn}
            >
              <div className="flex items-center mb-4">
                <div className="flex text-yellow-500">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <svg key={star} className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                      <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
                    </svg>
                  ))}
                </div>
              </div>
              <p className="text-gray-700 mb-4">
                "The online booking process was smooth and the prices were reasonable. The car was in perfect condition."
              </p>
              <p className="font-medium text-gray-900">— Priya S.</p>
            </motion.div>

            <motion.div 
              className="bg-white p-6 shadow-sm border-t-2 border-gray-900"
              variants={fadeIn}
            >
              <div className="flex items-center mb-4">
                <div className="flex text-yellow-500">
                  {[1, 2, 3, 4].map((star) => (
                    <svg key={star} className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                      <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
                    </svg>
                  ))}
                  <svg className="w-5 h-5 text-gray-300 fill-current" viewBox="0 0 24 24">
                    <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
                  </svg>
                </div>
              </div>
              <p className="text-gray-700 mb-4">
                "Convenient pickup location and straightforward rental process. Good value for the price."
              </p>
              <p className="font-medium text-gray-900">— Amit K.</p>
            </motion.div>
          </div>
        </div>
      </motion.div>

      {/* CTA Section */}
      <motion.div 
        className="bg-gray-900 py-20 px-4 text-white"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.2 }}
        variants={staggerContainer}
      >
        <div className="max-w-4xl mx-auto text-center">
          <motion.h2 
            className="text-3xl font-bold mb-6"
            variants={fadeIn}
          >
            Ready to elevate your travel experience?
          </motion.h2>
          
          <motion.p 
            className="text-xl mb-10 text-gray-300"
            variants={fadeIn}
          >
            Join thousands of discerning customers who choose Rentify for their premium car rental needs.
          </motion.p>
          
          <motion.div
            variants={fadeIn}
          >
            <Link to="/register" 
                  className="bg-white text-gray-900 font-bold py-3 px-10 rounded-none
                          hover:bg-gray-100 transition-all duration-300 shadow-lg inline-block
                          border-b-2 border-gray-900 transform hover:-translate-y-1">
              Create Your Account
            </Link>
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
};

export default Landing;