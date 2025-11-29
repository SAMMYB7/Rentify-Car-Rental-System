import { Routes, Route, Navigate, useLocation } from "react-router-dom";
import Header from "./components/Header";
import Footer from "./components/Footer";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Landing from "./pages/Landing";
import Dashboard from "./pages/user/Dashboard";
import ProtectedRoute from "./components/ProtectedRoute";
import Cars from "./pages/Cars";
import CarDetails from "./pages/CarDetails";
import AllBookings from "./pages/user/AllBookings";
import Profile from "./pages/user/Profile";
import AdminProtectedRoute from "./components/AdminProtectedRoute";
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminLayout from "./layouts/AdminLayout";
import AdminUsers from "./pages/admin/AdminUsers";
import AdminCars from "./pages/admin/AdminCars";
import AdminPayments from "./pages/admin/AdminPayments";
import AdminBookings from "./pages/admin/AdminBookings";

function App() {
  const location = useLocation();
  const isAdminRoute = location.pathname.startsWith("/admin");

  return (
    <div className="flex flex-col min-h-screen">
      {!isAdminRoute && <Header />}
      <main className="flex-grow">
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/cars" element={<Cars />} />
          <Route path="/cars/:id" element={<CarDetails />} />
          <Route path="/all-bookings" element={<AllBookings />} />
          <Route path="/profile" element={<Profile />} />
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/*"
            element={
              <AdminProtectedRoute>
                <AdminLayout>
                  <Routes>
                    <Route path="" element={<AdminDashboard />} />
                    <Route path="users" element={<AdminUsers />} />
                    <Route path="cars" element={<AdminCars />} />
                    <Route path="payments" element={<AdminPayments />} />
                    <Route path="bookings" element={<AdminBookings />} />
                  </Routes>
                </AdminLayout>
              </AdminProtectedRoute>
            }
          />
          {/* Additional pages for footer links */}
          <Route path="/about" element={<AboutPage />} />
          <Route path="/faq" element={<FAQPage />} />
          <Route path="/terms" element={<TermsPage />} />
          <Route path="/privacy" element={<PrivacyPage />} />
          <Route path="/contact" element={<ContactPage />} />
          <Route path="/corporate" element={<CorporatePage />} />
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </main>
      {!isAdminRoute && <Footer />}
    </div>
  );
}

// Simple placeholder pages for footer links
const AboutPage = () => (
  <div className="max-w-4xl mx-auto py-16 px-4">
    <h1 className="text-3xl font-bold mb-6">About Rentify</h1>
    <p className="mb-4">
      Established in 2022, Rentify is a premium car rental service dedicated to providing exceptional
      vehicles and outstanding customer service to our clients.
    </p>
    <p className="mb-4">
      Our mission is to make car rentals accessible, convenient, and enjoyable for everyone. With a focus on
      quality vehicles and transparent pricing, we've quickly become a trusted name in the industry.
    </p>
    <p className="mb-4">
      At Rentify, we believe that renting a car should be a hassle-free experience. That's why we've
      streamlined our booking process, offer flexible pickup and return options, and provide 24/7 customer
      support.
    </p>
    <p>
      Whether you need a vehicle for a business trip, family vacation, or special occasion, our diverse
      fleet of well-maintained cars has something for every need and budget.
    </p>
  </div>
);

const FAQPage = () => (
  <div className="max-w-4xl mx-auto py-16 px-4">
    <h1 className="text-3xl font-bold mb-8">Frequently Asked Questions</h1>
    
    <div className="space-y-6">
      <div>
        <h3 className="text-xl font-semibold mb-2">What do I need to rent a car?</h3>
        <p>To rent a car, you'll need a valid driver's license, a credit or debit card for payment, and be at least 21 years of age.</p>
      </div>
      
      <div>
        <h3 className="text-xl font-semibold mb-2">How do I make a reservation?</h3>
        <p>You can make a reservation through our website by browsing available cars, selecting your dates, and completing the booking process online.</p>
      </div>
      
      <div>
        <h3 className="text-xl font-semibold mb-2">Can I modify or cancel my reservation?</h3>
        <p>Yes, you can modify or cancel your reservation through your account dashboard. Please note that cancellation fees may apply depending on how close to your pickup date you cancel.</p>
      </div>
      
      <div>
        <h3 className="text-xl font-semibold mb-2">Is there a security deposit?</h3>
        <p>Yes, a security deposit is required when you pick up the vehicle. The amount varies depending on the car model, and it will be refunded when you return the car in its original condition.</p>
      </div>
      
      <div>
        <h3 className="text-xl font-semibold mb-2">What is your fuel policy?</h3>
        <p>Our rental cars are provided with a full tank of fuel, and we ask that you return the car with a full tank. If the car is returned with less fuel, a refueling fee will be charged.</p>
      </div>
    </div>
  </div>
);

const TermsPage = () => (
  <div className="max-w-4xl mx-auto py-16 px-4">
    <h1 className="text-3xl font-bold mb-6">Terms & Conditions</h1>
    <p className="mb-4">
      By using the Rentify service, you agree to comply with and be bound by the following terms and conditions. Please review these terms carefully.
    </p>
    
    <h2 className="text-2xl font-semibold mt-8 mb-4">1. Rental Agreement</h2>
    <p className="mb-4">
      When you rent a vehicle from Rentify, you are entering into a rental agreement. This agreement outlines your responsibilities as a renter, including proper use of the vehicle, payment terms, and liability for damages.
    </p>
    
    <h2 className="text-2xl font-semibold mt-8 mb-4">2. Eligibility</h2>
    <p className="mb-4">
      To rent a vehicle, you must be at least 21 years of age and possess a valid driver's license. Additional age restrictions may apply for certain premium vehicle categories.
    </p>
    
    <h2 className="text-2xl font-semibold mt-8 mb-4">3. Payment</h2>
    <p className="mb-4">
      Payment for rentals must be made through our secure online platform. We accept major credit cards and selected payment methods available on our website. A security deposit may be required at the time of pickup.
    </p>
    
    <h2 className="text-2xl font-semibold mt-8 mb-4">4. Cancellation Policy</h2>
    <p>
      Cancellations made more than 48 hours before the scheduled pickup time will receive a full refund. Cancellations made within 48 hours of the scheduled pickup time may be subject to a cancellation fee equivalent to one day's rental.
    </p>
  </div>
);

const PrivacyPage = () => (
  <div className="max-w-4xl mx-auto py-16 px-4">
    <h1 className="text-3xl font-bold mb-6">Privacy Policy</h1>
    <p className="mb-6">
      At Rentify, we are committed to protecting your privacy. This policy outlines how we collect, use, and safeguard your personal information.
    </p>
    
    <h2 className="text-2xl font-semibold mt-8 mb-4">Information We Collect</h2>
    <p className="mb-4">
      We collect information such as your name, contact details, payment information, driving license details, and rental preferences to provide and improve our services.
    </p>
    
    <h2 className="text-2xl font-semibold mt-8 mb-4">How We Use Your Information</h2>
    <p className="mb-4">
      We use your information to process reservations, communicate with you about your rentals, improve our services, and comply with legal obligations.
    </p>
    
    <h2 className="text-2xl font-semibold mt-8 mb-4">Information Security</h2>
    <p className="mb-4">
      We implement appropriate security measures to protect your personal information against unauthorized access, alteration, disclosure, or destruction.
    </p>
    
    <h2 className="text-2xl font-semibold mt-8 mb-4">Your Rights</h2>
    <p>
      You have the right to access, correct, or delete your personal information. To exercise these rights, please contact us at shyamsundarbezawada5@gmail.com.
    </p>
  </div>
);

const ContactPage = () => (
  <div className="max-w-4xl mx-auto py-16 px-4">
    <h1 className="text-3xl font-bold mb-8">Contact Us</h1>
    
    <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
      <div>
        <h2 className="text-2xl font-semibold mb-4">Get In Touch</h2>
        <p className="mb-6">
          We'd love to hear from you! Whether you have a question about our services, need assistance with a reservation, or want to share feedback, our team is here to help.
        </p>
        
        <div className="space-y-4">
          <div className="flex items-start">
            <FaMapMarkerAlt className="h-5 w-5 text-gray-700 mr-3 mt-1" />
            <span>123 Rental Street, Hyderabad, Telangana, India</span>
          </div>
          
          <div className="flex items-center">
            <FaPhone className="h-5 w-5 text-gray-700 mr-3" />
            <span>+91 98765 43210</span>
          </div>
          
          <div className="flex items-center">
            <FaEnvelope className="h-5 w-5 text-gray-700 mr-3" />
            <a href="mailto:shyamsundarbezawada5@gmail.com" className="text-blue-600 hover:underline">
              shyamsundarbezawada5@gmail.com
            </a>
          </div>
        </div>
      </div>
      
      <div>
        <h2 className="text-2xl font-semibold mb-4">Send Us a Message</h2>
        <form className="space-y-4">
          <div>
            <label htmlFor="name" className="block mb-1 font-medium">Name</label>
            <input
              type="text"
              id="name"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>
          
          <div>
            <label htmlFor="email" className="block mb-1 font-medium">Email</label>
            <input
              type="email"
              id="email"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>
          
          <div>
            <label htmlFor="subject" className="block mb-1 font-medium">Subject</label>
            <input
              type="text"
              id="subject"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>
          
          <div>
            <label htmlFor="message" className="block mb-1 font-medium">Message</label>
            <textarea
              id="message"
              rows="4"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            ></textarea>
          </div>
          
          <button
            type="submit"
            className="px-6 py-2 bg-gray-900 text-white font-medium rounded-md hover:bg-gray-800 transition-colors"
          >
            Send Message
          </button>
        </form>
      </div>
    </div>
  </div>
);

const CorporatePage = () => (
  <div className="max-w-4xl mx-auto py-16 px-4">
    <h1 className="text-3xl font-bold mb-6">Corporate Rentals</h1>
    <p className="mb-8">
      Rentify offers specialized rental solutions designed for businesses of all sizes. Our corporate program provides flexible, cost-effective transportation options to meet your company's needs.
    </p>
    
    <h2 className="text-2xl font-semibold mt-8 mb-4">Benefits of Our Corporate Program</h2>
    <ul className="list-disc pl-5 space-y-2 mb-8">
      <li>Preferred pricing and volume discounts</li>
      <li>Dedicated account manager</li>
      <li>Streamlined billing and reporting</li>
      <li>Wide selection of vehicles to meet various business needs</li>
      <li>Flexible rental terms from daily to long-term leasing</li>
      <li>Priority vehicle availability and upgrades</li>
    </ul>
    
    <h2 className="text-2xl font-semibold mt-8 mb-4">How to Enroll</h2>
    <p className="mb-4">
      To learn more about our corporate rental program or to set up a corporate account, please contact our corporate sales team at:
    </p>
    <p className="mb-8">
      <a href="mailto:corporate@rentify.com" className="text-blue-600 hover:underline">corporate@rentify.com</a> or call +91 98765 43210
    </p>
    
    <div className="bg-gray-100 p-6 rounded-lg">
      <h3 className="text-xl font-semibold mb-3">Request Corporate Account</h3>
      <form className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="companyName" className="block mb-1 font-medium">Company Name</label>
            <input
              type="text"
              id="companyName"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>
          <div>
            <label htmlFor="contactName" className="block mb-1 font-medium">Contact Person</label>
            <input
              type="text"
              id="contactName"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="contactEmail" className="block mb-1 font-medium">Email</label>
            <input
              type="email"
              id="contactEmail"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>
          <div>
            <label htmlFor="contactPhone" className="block mb-1 font-medium">Phone</label>
            <input
              type="tel"
              id="contactPhone"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>
        </div>
        <div>
          <label htmlFor="requirements" className="block mb-1 font-medium">Requirements/Comments</label>
          <textarea
            id="requirements"
            rows="4"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          ></textarea>
        </div>
        <button
          type="submit"
          className="px-6 py-2 bg-gray-900 text-white font-medium rounded-md hover:bg-gray-800 transition-colors"
        >
          Submit Request
        </button>
      </form>
    </div>
  </div>
);

export default App;