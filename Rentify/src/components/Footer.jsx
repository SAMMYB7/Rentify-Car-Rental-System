import { Link } from 'react-router-dom';
import { FaCar, FaEnvelope, FaPhone, FaMapMarkerAlt, FaFacebook, FaTwitter, FaInstagram, FaLinkedin } from 'react-icons/fa';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-gray-900 text-gray-300">
      {/* Main Footer */}
      <div className="max-w-7xl mx-auto pt-16 pb-12 px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Company Info */}
          <div>
            <div className="flex items-center mb-4">
              <FaCar className="h-8 w-8 text-white mr-2" />
              <span className="text-xl font-bold tracking-wider text-white">Rentify</span>
            </div>
            <p className="mb-4 text-sm">
              Premium car rental service providing quality vehicles for all your travel needs.
              Experience luxury, convenience and reliability on every journey.
            </p>
            <div className="flex space-x-4">
              <a href="#" className="text-gray-400 hover:text-white transition-colors">
                <FaFacebook className="h-5 w-5" />
              </a>
              <a href="#" className="text-gray-400 hover:text-white transition-colors">
                <FaTwitter className="h-5 w-5" />
              </a>
              <a href="#" className="text-gray-400 hover:text-white transition-colors">
                <FaInstagram className="h-5 w-5" />
              </a>
              <a href="#" className="text-gray-400 hover:text-white transition-colors">
                <FaLinkedin className="h-5 w-5" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-white text-lg font-semibold mb-4">Quick Links</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/cars" className="hover:text-white transition-colors">Browse Cars</Link>
              </li>
              <li>
                <Link to="/about" className="hover:text-white transition-colors">About Us</Link>
              </li>
              <li>
                <Link to="/faq" className="hover:text-white transition-colors">FAQ</Link>
              </li>
              <li>
                <Link to="/terms" className="hover:text-white transition-colors">Terms & Conditions</Link>
              </li>
              <li>
                <Link to="/privacy" className="hover:text-white transition-colors">Privacy Policy</Link>
              </li>
            </ul>
          </div>

          {/* Services */}
          <div>
            <h3 className="text-white text-lg font-semibold mb-4">Our Services</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/cars?type=luxury" className="hover:text-white transition-colors">Luxury Cars</Link>
              </li>
              <li>
                <Link to="/cars?type=SUV" className="hover:text-white transition-colors">SUVs</Link>
              </li>
              <li>
                <Link to="/cars?type=sedan" className="hover:text-white transition-colors">Sedans</Link>
              </li>
              <li>
                <Link to="/cars?type=hatchback" className="hover:text-white transition-colors">Hatchbacks</Link>
              </li>
              <li>
                <Link to="/corporate" className="hover:text-white transition-colors">Corporate Rentals</Link>
              </li>
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h3 className="text-white text-lg font-semibold mb-4">Contact Us</h3>
            <ul className="space-y-3">
              <li className="flex items-start">
                <FaMapMarkerAlt className="h-5 w-5 text-gray-400 mr-3 mt-1" />
                <span>123 Rental Street, Hyderabad, Telangana, India</span>
              </li>
              <li className="flex items-center">
                <FaPhone className="h-5 w-5 text-gray-400 mr-3" />
                <span>+91 98765 43210</span>
              </li>
              <li className="flex items-center">
                <FaEnvelope className="h-5 w-5 text-gray-400 mr-3" />
                <a href="mailto:shyamsundarbezawada5@gmail.com" className="hover:text-white transition-colors">
                  shyamsundarbezawada5@gmail.com
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Newsletter Subscription (Optional) */}
        <div className="mt-12 pt-8 border-t border-gray-800">
          <div className="max-w-md mx-auto lg:mx-0">
            <h3 className="text-white font-semibold mb-2">Subscribe to our Newsletter</h3>
            <p className="mb-4 text-sm">Get the latest updates on our services and special offers</p>
            <form className="flex">
              <input
                type="email"
                placeholder="Enter your email"
                className="flex-grow bg-gray-800 text-white px-4 py-2 rounded-l-md focus:outline-none"
                required
              />
              <button
                type="submit"
                className="bg-white text-gray-900 px-4 py-2 rounded-r-md font-medium hover:bg-gray-200 transition-colors"
              >
                Subscribe
              </button>
            </form>
          </div>
        </div>
      </div>

      {/* Copyright */}
      <div className="bg-gray-950 py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row justify-between items-center">
          <p className="text-sm">
            &copy; {currentYear} Rentify Car Services. All rights reserved.
          </p>
          <div className="mt-4 md:mt-0">
            <Link to="/terms" className="text-sm hover:text-white mr-4 transition-colors">Terms</Link>
            <Link to="/privacy" className="text-sm hover:text-white mr-4 transition-colors">Privacy</Link>
            <Link to="/contact" className="text-sm hover:text-white transition-colors">Contact</Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;