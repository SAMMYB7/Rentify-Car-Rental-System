import { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import api from "../api/axios";
import { useAuth } from "../context/AuthContext";
import { toast } from "sonner";
import { motion } from "framer-motion";
import { FaCar, FaCalendarAlt, FaStar, FaStarHalfAlt, FaRegStar } from "react-icons/fa";

const CarDetails = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [car, setCar] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [booking, setBooking] = useState({ startDate: "", endDate: "" });
  const [bookingError, setBookingError] = useState("");
  const [bookingSuccess, setBookingSuccess] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [carRes, reviewsRes] = await Promise.all([
          api.get(`/cars/${id}`),
          api.get(`/reviews?carId=${id}`)
        ]);
        setCar(carRes.data);
        setReviews(reviewsRes.data);
      } catch {
        setCar(null);
      }
      setLoading(false);
    };
    fetchData();
  }, [id]);

  const handleBookingChange = (e) => {
    setBooking({ ...booking, [e.target.name]: e.target.value });
  };

  const handleBook = async (e) => {
    e.preventDefault();
    setBookingError("");
    setBookingSuccess("");
    if (!user) {
      setBookingError("You must be logged in to book.");
      return;
    }
    try {
      await api.post("/bookings", {
        carId: id,
        startDate: booking.startDate,
        endDate: booking.endDate
      });
      setBookingSuccess("Booking successful! Proceed to your dashboard for payment.");
      toast.success("Booking created successfully!");
      setTimeout(() => navigate("/dashboard"), 1500);
    } catch (err) {
      let msg =
        err.response?.data?.message ||
        (typeof err.response?.data === "string" ? err.response.data : "Booking failed.");

      setBookingError(msg);

      // Check for the phrase in the string (case-insensitive)
      if (msg.toLowerCase().includes("not available")) {
        toast.error("Car is not available for those dates. Please select different dates.");
      } else {
        toast.error(msg);
      }
    }
  };

  // Function to render star ratings
  const renderRating = (rating) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating - fullStars >= 0.5;
    
    for (let i = 0; i < fullStars; i++) {
      stars.push(<FaStar key={`star-${i}`} className="text-yellow-500" />);
    }
    
    if (hasHalfStar) {
      stars.push(<FaStarHalfAlt key="half-star" className="text-yellow-500" />);
    }
    
    const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);
    for (let i = 0; i < emptyStars; i++) {
      stars.push(<FaRegStar key={`empty-${i}`} className="text-yellow-500" />);
    }
    
    return <div className="flex">{stars}</div>;
  };

  // Calculate average rating
  const averageRating = reviews.length
    ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1)
    : 0;

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <div className="w-16 h-16 border-4 border-gray-900 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!car) {
    return (
      <div className="max-w-3xl mx-auto py-16 px-4 text-center">
        <FaCar className="w-16 h-16 mx-auto text-gray-300 mb-4" />
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Car Not Found</h2>
        <p className="mb-8 text-gray-600">
          The car you're looking for doesn't exist or has been removed.
        </p>
        <Link to="/cars" className="bg-gray-900 text-white py-2 px-6 font-medium hover:bg-gray-800 transition-colors duration-200">
          Browse All Cars
        </Link>
      </div>
    );
  }

  return (
    <motion.div
      className="max-w-5xl mx-auto py-12 px-4 sm:px-6"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      {/* Car Image and Basic Info */}
      <div className="bg-white shadow-md mb-8">
        <div className="relative h-80 overflow-hidden">
          {car.imageUrl ? (
            <img 
              src={car.imageUrl} 
              alt={`${car.brand} ${car.model}`} 
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full bg-gray-200 flex items-center justify-center">
              <FaCar className="w-20 h-20 text-gray-400" />
            </div>
          )}
          {!car.available && (
            <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
              <span className="bg-red-600 text-white px-6 py-2 text-lg font-bold uppercase tracking-wider">
                Not Available
              </span>
            </div>
          )}
        </div>

        <div className="p-8">
          <div className="flex flex-wrap items-start justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">{car.brand} {car.model}</h1>
              <div className="flex items-center mb-2">
                <span className="bg-gray-200 text-gray-800 text-sm px-3 py-1 rounded-sm font-medium mr-2">
                  {car.type}
                </span>
                {car.available ? (
                  <span className="bg-green-100 text-green-800 text-sm px-3 py-1 rounded-sm font-medium">
                    Available
                  </span>
                ) : (
                  <span className="bg-red-100 text-red-800 text-sm px-3 py-1 rounded-sm font-medium">
                    Unavailable
                  </span>
                )}
              </div>
            </div>
            <div className="text-right">
              <div className="text-3xl font-bold text-gray-900">₹{car.pricePerDay}</div>
              <div className="text-gray-500 text-sm">per day</div>
            </div>
          </div>

          <hr className="my-6 border-gray-200" />

          <div className="mb-6">
            <h2 className="text-xl font-semibold mb-3 text-gray-900">Description</h2>
            <p className="text-gray-700">
              {car.description || "No description available for this vehicle."}
            </p>
          </div>

          {reviews.length > 0 && (
            <div className="flex items-center mb-6">
              <div className="flex items-center mr-3">
                {renderRating(parseFloat(averageRating))}
              </div>
              <span className="text-lg font-semibold">{averageRating}</span>
              <span className="text-gray-500 ml-2">({reviews.length} {reviews.length === 1 ? 'review' : 'reviews'})</span>
            </div>
          )}
        </div>
      </div>

      {/* Booking Section */}
      <div className="bg-white shadow-md mb-8">
        <div className="p-8">
          <h2 className="text-2xl font-semibold mb-6 text-gray-900">Book This Car</h2>
          
          {user && user.role === "CUSTOMER" ? (
            car.available ? (
              <form onSubmit={handleBook} className="space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div>
                    <label htmlFor="startDate" className="block text-sm font-medium text-gray-700 mb-1">
                      Start Date
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <FaCalendarAlt className="h-5 w-5 text-gray-400" />
                      </div>
                      <input
                        id="startDate"
                        name="startDate"
                        type="date"
                        value={booking.startDate}
                        onChange={handleBookingChange}
                        required
                        min={new Date().toISOString().split('T')[0]}
                        className="appearance-none rounded-none block w-full pl-10 py-3 border border-gray-300 focus:outline-none focus:ring-gray-900 focus:border-gray-900 sm:text-sm"
                      />
                    </div>
                  </div>
                  
                  <div>
                    <label htmlFor="endDate" className="block text-sm font-medium text-gray-700 mb-1">
                      End Date
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <FaCalendarAlt className="h-5 w-5 text-gray-400" />
                      </div>
                      <input
                        id="endDate"
                        name="endDate"
                        type="date"
                        value={booking.endDate}
                        onChange={handleBookingChange}
                        required
                        min={booking.startDate || new Date().toISOString().split('T')[0]}
                        className="appearance-none rounded-none block w-full pl-10 py-3 border border-gray-300 focus:outline-none focus:ring-gray-900 focus:border-gray-900 sm:text-sm"
                      />
                    </div>
                  </div>
                </div>
                
                {bookingError && (
                  <div className="bg-red-50 border-l-4 border-red-500 p-4">
                    <div className="flex">
                      <div className="ml-3">
                        <p className="text-sm text-red-700">{bookingError}</p>
                      </div>
                    </div>
                  </div>
                )}
                
                {bookingSuccess && (
                  <div className="bg-green-50 border-l-4 border-green-500 p-4">
                    <div className="flex">
                      <div className="ml-3">
                        <p className="text-sm text-green-700">{bookingSuccess}</p>
                      </div>
                    </div>
                  </div>
                )}
                
                <div>
                  <button
                    type="submit"
                    className="w-full bg-gray-900 hover:bg-gray-800 text-white font-medium py-3 transition-colors duration-200 border-b-2 border-gray-700 transform hover:-translate-y-1 hover:shadow-md"
                  >
                    Book Now
                  </button>
                </div>
              </form>
            ) : (
              <div className="bg-red-50 border-l-4 border-red-500 p-4">
                <div className="flex">
                  <div className="ml-3">
                    <p className="text-sm text-red-700 font-semibold">This car is currently not available for booking.</p>
                    <p className="text-sm text-red-700 mt-1">Please check back later or browse our other available vehicles.</p>
                  </div>
                </div>
              </div>
            )
          ) : (
            <div className="bg-gray-50 border-l-4 border-gray-500 p-4">
              <div className="flex">
                <div className="ml-3">
                  <p className="text-sm text-gray-700">
                    Please {user ? "switch to a customer account" : <Link to="/login" className="text-gray-900 font-semibold underline">login</Link>} to book this car.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
      
      {/* Reviews Section */}
      <div className="bg-white shadow-md">
        <div className="p-8">
          <h2 className="text-2xl font-semibold mb-6 text-gray-900">Customer Reviews</h2>
          
          {reviews.length === 0 ? (
            <div className="text-gray-600 italic">
              No reviews yet. Be the first to review this car after your rental!
            </div>
          ) : (
            <div className="space-y-8">
              {reviews.map((review) => (
                <motion.div 
                  key={review.id}
                  className="border-b border-gray-200 pb-6 last:border-0 last:pb-0"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.5 }}
                >
                  <div className="flex items-center mb-2">
                    <div className="mr-2">
                      {renderRating(review.rating)}
                    </div>
                    <span className="font-semibold text-gray-900">{review.rating}/5</span>
                  </div>
                  <p className="mb-2 text-gray-700">{review.comment}</p>
                  <div className="flex justify-between items-center">
                    <span className="font-medium text-gray-900">{review.username}</span>
                    <span className="text-sm text-gray-500">
                      {new Date(review.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </div>
      
      {/* Back to cars link */}
      <div className="mt-6 text-center">
        <Link to="/cars" className="inline-flex items-center text-gray-700 hover:text-gray-900">
          <span className="mr-2">←</span> Back to all cars
        </Link>
      </div>
    </motion.div>
  );
};

export default CarDetails;