import { useEffect, useState } from "react";
import api from "../../api/axios";
import { useAuth } from "../../context/AuthContext";
import { motion } from "framer-motion";
import { 
  FaUser, 
  FaCar, 
  FaCalendarAlt, 
  FaMoneyBillWave, 
  FaChartLine,
  FaUsersCog,
  FaCarSide,
  FaFileInvoiceDollar,
  FaFileAlt,
  FaPercentage
} from "react-icons/fa";
import { Link } from "react-router-dom";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  BarElement,
  ArcElement,
} from 'chart.js';
import { Line, Bar, Doughnut } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  BarElement,
  ArcElement
);

const AdminDashboard = () => {
  const [stats, setStats] = useState({
    users: 0,
    cars: 0,
    bookings: 0,
    revenue: 0,
  });
  const [chartData, setChartData] = useState({
    monthlyRevenue: [],
    bookingsByStatus: {},
    carsByType: {},
    userRegistrations: [],
    monthlyBookings: [],
    carUtilization: [],
    revenueByCarType: {},
    bookingsByDayOfWeek: {},
    bookingsByHour: {},
    averageBookingDuration: [],
    customerLifetimeValue: [],
    popularCars: []
  });
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState(null);
  const { user } = useAuth();

  useEffect(() => {
    // Fetch summary stats and chart data
    const fetchStats = async () => {
      try {
        const [usersRes, carsRes, bookingsRes, paymentsRes] = await Promise.all([
          api.get("/users"),
          api.get("/cars"),
          api.get("/bookings"),
          api.get("/payments/all"),
        ]);
        
        const users = usersRes.data;
        const cars = carsRes.data;
        const bookings = bookingsRes.data;
        const payments = paymentsRes.data;
        
        setStats({
          users: users.length,
          cars: cars.length,
          bookings: bookings.length,
          revenue: payments.reduce((sum, p) => sum + (p.amount || 0), 0),
        });

        // Prepare chart data
        prepareChartData(users, cars, bookings, payments);
        
      } catch (err) {
        console.error("Error fetching dashboard data:", err);
      } finally {
        setLoading(false);
      }
    };

    const prepareChartData = (users, cars, bookings, payments) => {
      // Monthly revenue for last 6 months
      const monthlyRevenue = generateMonthlyRevenue(payments);
      
      // Bookings by status
      const bookingsByStatus = bookings.reduce((acc, booking) => {
        acc[booking.status] = (acc[booking.status] || 0) + 1;
        return acc;
      }, {});

      // Cars by type
      const carsByType = cars.reduce((acc, car) => {
        acc[car.type] = (acc[car.type] || 0) + 1;
        return acc;
      }, {});

      // User registrations over time (last 6 months)
      const userRegistrations = generateMonthlyUserRegistrations(users);
      
      // Monthly bookings (last 6 months)
      const monthlyBookings = generateMonthlyBookings(bookings);

      // Car utilization rate
      const carUtilization = generateCarUtilization(cars, bookings);

      // Revenue by car type
      const revenueByCarType = generateRevenueByCarType(cars, bookings, payments);

      // Bookings by day of week
      const bookingsByDayOfWeek = generateBookingsByDayOfWeek(bookings);

      // Bookings by hour
      const bookingsByHour = generateBookingsByHour(bookings);

      // Average booking duration
      const averageBookingDuration = generateAverageBookingDuration(bookings);

      // Customer lifetime value
      const customerLifetimeValue = generateCustomerLifetimeValue(users, bookings, payments);

      // Popular cars
      const popularCars = generatePopularCars(cars, bookings);

      setChartData({
        monthlyRevenue,
        bookingsByStatus,
        carsByType,
        userRegistrations,
        monthlyBookings,
        carUtilization,
        revenueByCarType,
        bookingsByDayOfWeek,
        bookingsByHour,
        averageBookingDuration,
        customerLifetimeValue,
        popularCars
      });
    };

    const generateMonthlyRevenue = (payments) => {
      const last6Months = [];
      const now = new Date();
      
      for (let i = 5; i >= 0; i--) {
        const month = new Date(now.getFullYear(), now.getMonth() - i, 1);
        const monthName = month.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
        
        const monthlyTotal = payments
          .filter(payment => {
            if (!payment.paymentTime) return false;
            const paymentDate = new Date(payment.paymentTime);
            return paymentDate.getMonth() === month.getMonth() && 
                   paymentDate.getFullYear() === month.getFullYear();
          })
          .reduce((sum, payment) => sum + (payment.amount || 0), 0);
        
        last6Months.push({ month: monthName, revenue: monthlyTotal });
      }
      return last6Months;
    };

    const generateMonthlyUserRegistrations = (users) => {
      const last6Months = [];
      const now = new Date();
      
      for (let i = 5; i >= 0; i--) {
        const month = new Date(now.getFullYear(), now.getMonth() - i, 1);
        const monthName = month.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
        
        const monthlyRegistrations = users
          .filter(user => {
            if (!user.createdAt) return false;
            const userDate = new Date(user.createdAt);
            return userDate.getMonth() === month.getMonth() && 
                   userDate.getFullYear() === month.getFullYear();
          }).length;
        
        last6Months.push({ month: monthName, registrations: monthlyRegistrations });
      }
      return last6Months;
    };

    const generateMonthlyBookings = (bookings) => {
      const last6Months = [];
      const now = new Date();
      
      for (let i = 5; i >= 0; i--) {
        const month = new Date(now.getFullYear(), now.getMonth() - i, 1);
        const monthName = month.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
        
        const monthlyBookings = bookings
          .filter(booking => {
            if (!booking.createdAt) return false;
            const bookingDate = new Date(booking.createdAt);
            return bookingDate.getMonth() === month.getMonth() && 
                   bookingDate.getFullYear() === month.getFullYear();
          }).length;
        
        last6Months.push({ month: monthName, bookings: monthlyBookings });
      }
      return last6Months;
    };

    const generateCarUtilization = (cars, bookings) => {
      return cars.map(car => {
        const carBookings = bookings.filter(booking => booking.carId === car.id);
        const totalBookings = carBookings.length;
        const utilization = totalBookings > 0 ? Math.min(totalBookings * 10, 100) : 0; // Assuming max 10 bookings = 100% utilization
        return {
          carName: `${car.brand} ${car.model}`,
          utilization: utilization
        };
      }).sort((a, b) => b.utilization - a.utilization).slice(0, 10);
    };

    const generateRevenueByCarType = (cars, bookings, payments) => {
      const revenueByType = {};
      
      bookings.forEach(booking => {
        const car = cars.find(c => c.id === booking.carId);
        const payment = payments.find(p => p.bookingId === booking.id);
        
        if (car && payment) {
          revenueByType[car.type] = (revenueByType[car.type] || 0) + (payment.amount || 0);
        }
      });
      
      return revenueByType;
    };

    const generateBookingsByDayOfWeek = (bookings) => {
      const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
      const bookingsByDay = {};
      
      days.forEach(day => {
        bookingsByDay[day] = 0;
      });
      
      bookings.forEach(booking => {
        if (booking.createdAt) {
          const date = new Date(booking.createdAt);
          const dayName = days[date.getDay()];
          bookingsByDay[dayName]++;
        }
      });
      
      return bookingsByDay;
    };

    const generateBookingsByHour = (bookings) => {
      const hourlyBookings = {};
      
      for (let i = 0; i < 24; i++) {
        hourlyBookings[i] = 0;
      }
      
      bookings.forEach(booking => {
        if (booking.createdAt) {
          const date = new Date(booking.createdAt);
          const hour = date.getHours();
          hourlyBookings[hour]++;
        }
      });
      
      return hourlyBookings;
    };

    const generateAverageBookingDuration = (bookings) => {
      const last6Months = [];
      const now = new Date();
      
      for (let i = 5; i >= 0; i--) {
        const month = new Date(now.getFullYear(), now.getMonth() - i, 1);
        const monthName = month.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
        
        const monthlyBookings = bookings.filter(booking => {
          if (!booking.createdAt) return false;
          const bookingDate = new Date(booking.createdAt);
          return bookingDate.getMonth() === month.getMonth() && 
                 bookingDate.getFullYear() === month.getFullYear();
        });
        
        const totalDuration = monthlyBookings.reduce((sum, booking) => {
          if (booking.startDate && booking.endDate) {
            const start = new Date(booking.startDate);
            const end = new Date(booking.endDate);
            const duration = (end - start) / (1000 * 60 * 60 * 24); // Duration in days
            return sum + duration;
          }
          return sum;
        }, 0);
        
        const avgDuration = monthlyBookings.length > 0 ? totalDuration / monthlyBookings.length : 0;
        
        last6Months.push({ month: monthName, avgDuration: avgDuration });
      }
      
      return last6Months;
    };

    const generateCustomerLifetimeValue = (users, bookings, payments) => {
      const customerValues = users.map(user => {
        const userBookings = bookings.filter(booking => booking.userId === user.id);
        const totalRevenue = userBookings.reduce((sum, booking) => {
          const payment = payments.find(p => p.bookingId === booking.id);
          return sum + (payment ? payment.amount : 0);
        }, 0);
        
        return {
          customerName: user.name,
          totalRevenue: totalRevenue,
          bookingCount: userBookings.length
        };
      }).filter(customer => customer.totalRevenue > 0)
        .sort((a, b) => b.totalRevenue - a.totalRevenue)
        .slice(0, 10);
      
      return customerValues;
    };

    const generatePopularCars = (cars, bookings) => {
      const carPopularity = cars.map(car => {
        const carBookings = bookings.filter(booking => booking.carId === car.id);
        return {
          carName: `${car.brand} ${car.model}`,
          bookingCount: carBookings.length,
          car: car
        };
      }).sort((a, b) => b.bookingCount - a.bookingCount).slice(0, 10);
      
      return carPopularity;
    };

    fetchStats();
    // Fetch admin profile
    api.get("/users/me").then(res => setProfile(res.data));
  }, []);

  // Chart configuration options
  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
        labels: {
          usePointStyle: true,
          padding: 20,
          font: {
            size: 12,
            family: 'Inter, sans-serif'
          }
        }
      },
      tooltip: {
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        titleColor: 'white',
        bodyColor: 'white',
        borderColor: 'rgba(0, 0, 0, 0.2)',
        borderWidth: 1
      }
    },
    scales: {
      x: {
        grid: {
          display: false
        },
        ticks: {
          font: {
            size: 11
          }
        }
      },
      y: {
        grid: {
          color: 'rgba(0, 0, 0, 0.1)'
        },
        ticks: {
          font: {
            size: 11
          }
        }
      }
    }
  };

  const doughnutOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom',
        labels: {
          usePointStyle: true,
          padding: 15,
          font: {
            size: 12,
            family: 'Inter, sans-serif'
          }
        }
      },
      tooltip: {
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        titleColor: 'white',
        bodyColor: 'white'
      }
    }
  };

  // Chart data configurations
  const revenueChartData = {
    labels: chartData.monthlyRevenue.map(item => item.month),
    datasets: [
      {
        label: 'Revenue (₹)',
        data: chartData.monthlyRevenue.map(item => item.revenue),
        borderColor: 'rgb(0, 0, 0)',
        backgroundColor: 'rgba(0, 0, 0, 0.1)',
        borderWidth: 2,
        fill: true,
        tension: 0.4
      }
    ]
  };

  const bookingsChartData = {
    labels: chartData.monthlyBookings.map(item => item.month),
    datasets: [
      {
        label: 'Bookings',
        data: chartData.monthlyBookings.map(item => item.bookings),
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        borderColor: 'rgb(0, 0, 0)',
        borderWidth: 1
      }
    ]
  };

  const statusChartData = {
    labels: Object.keys(chartData.bookingsByStatus),
    datasets: [
      {
        data: Object.values(chartData.bookingsByStatus),
        backgroundColor: [
          'rgba(34, 197, 94, 0.8)',   // Green for PAID
          'rgba(251, 191, 36, 0.8)',  // Yellow for BOOKED
          'rgba(239, 68, 68, 0.8)',   // Red for CANCELLED
        ],
        borderColor: [
          'rgb(34, 197, 94)',
          'rgb(251, 191, 36)',
          'rgb(239, 68, 68)',
        ],
        borderWidth: 2
      }
    ]
  };

  const carTypeChartData = {
    labels: Object.keys(chartData.carsByType),
    datasets: [
      {
        data: Object.values(chartData.carsByType),
        backgroundColor: [
          'rgba(0, 0, 0, 0.8)',
          'rgba(75, 85, 99, 0.8)',
          'rgba(156, 163, 175, 0.8)',
          'rgba(209, 213, 219, 0.8)',
          'rgba(229, 231, 235, 0.8)'
        ],
        borderColor: [
          'rgb(0, 0, 0)',
          'rgb(75, 85, 99)',
          'rgb(156, 163, 175)',
          'rgb(209, 213, 219)',
          'rgb(229, 231, 235)'
        ],
        borderWidth: 2
      }
    ]
  };

  // Additional chart configurations
  const userRegistrationChartData = {
    labels: chartData.userRegistrations.map(item => item.month),
    datasets: [
      {
        label: 'New Users',
        data: chartData.userRegistrations.map(item => item.registrations),
        borderColor: 'rgb(99, 102, 241)',
        backgroundColor: 'rgba(99, 102, 241, 0.1)',
        borderWidth: 2,
        fill: true,
        tension: 0.4
      }
    ]
  };

  const carUtilizationChartData = {
    labels: chartData.carUtilization.map(item => item.carName),
    datasets: [
      {
        label: 'Utilization %',
        data: chartData.carUtilization.map(item => item.utilization),
        backgroundColor: 'rgba(16, 185, 129, 0.8)',
        borderColor: 'rgb(16, 185, 129)',
        borderWidth: 1
      }
    ]
  };

  const revenueByCarTypeChartData = {
    labels: Object.keys(chartData.revenueByCarType),
    datasets: [
      {
        data: Object.values(chartData.revenueByCarType),
        backgroundColor: [
          'rgba(245, 158, 11, 0.8)',
          'rgba(239, 68, 68, 0.8)',
          'rgba(59, 130, 246, 0.8)',
          'rgba(16, 185, 129, 0.8)',
          'rgba(139, 92, 246, 0.8)'
        ],
        borderColor: [
          'rgb(245, 158, 11)',
          'rgb(239, 68, 68)',
          'rgb(59, 130, 246)',
          'rgb(16, 185, 129)',
          'rgb(139, 92, 246)'
        ],
        borderWidth: 2
      }
    ]
  };

  const bookingsByDayChartData = {
    labels: Object.keys(chartData.bookingsByDayOfWeek),
    datasets: [
      {
        label: 'Bookings',
        data: Object.values(chartData.bookingsByDayOfWeek),
        backgroundColor: 'rgba(168, 85, 247, 0.8)',
        borderColor: 'rgb(168, 85, 247)',
        borderWidth: 1
      }
    ]
  };

  const bookingsByHourChartData = {
    labels: Object.keys(chartData.bookingsByHour).map(hour => `${hour}:00`),
    datasets: [
      {
        label: 'Bookings',
        data: Object.values(chartData.bookingsByHour),
        borderColor: 'rgb(236, 72, 153)',
        backgroundColor: 'rgba(236, 72, 153, 0.1)',
        borderWidth: 2,
        fill: true
      }
    ]
  };

  const avgBookingDurationChartData = {
    labels: chartData.averageBookingDuration.map(item => item.month),
    datasets: [
      {
        label: 'Average Days',
        data: chartData.averageBookingDuration.map(item => item.avgDuration),
        backgroundColor: 'rgba(34, 197, 94, 0.8)',
        borderColor: 'rgb(34, 197, 94)',
        borderWidth: 1
      }
    ]
  };

  const popularCarsChartData = {
    labels: chartData.popularCars.map(item => item.carName),
    datasets: [
      {
        label: 'Bookings',
        data: chartData.popularCars.map(item => item.bookingCount),
        backgroundColor: 'rgba(249, 115, 22, 0.8)',
        borderColor: 'rgb(249, 115, 22)',
        borderWidth: 1
      }
    ]
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
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
      <div className="bg-white shadow-md rounded-none border-t-2 border-gray-900 p-6 md:p-8 mb-8">
        <div className="flex flex-wrap items-center justify-between mb-8">
          <h1 className="text-2xl font-bold text-gray-900 flex items-center">
            <FaChartLine className="mr-3 text-gray-700" /> Admin Dashboard
          </h1>
        </div>

        {/* Admin Profile Section */}
        <div className="p-6 bg-gray-50 border-l-4 border-gray-900 mb-8">
          <h2 className="text-xl font-semibold mb-4 text-gray-900">Admin Profile</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-gray-600 text-sm mb-1">Name</p>
              <p className="font-medium text-gray-900">{profile?.name || user?.name || "N/A"}</p>
            </div>
            <div>
              <p className="text-gray-600 text-sm mb-1">Email</p>
              <p className="font-medium text-gray-900">{profile?.email || user?.email || "N/A"}</p>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white border border-gray-200 rounded-none p-6 hover:shadow-md transition-shadow">
            <div className="flex items-center gap-4">
              <div className="bg-blue-100 p-3 rounded-lg">
                <FaUsersCog className="h-6 w-6 text-blue-500" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Total Users</p>
                <h3 className="text-2xl font-bold text-gray-900">{stats.users}</h3>
              </div>
            </div>
            <div className="mt-4">
              <Link 
                to="/admin/users" 
                className="text-sm text-blue-600 hover:text-blue-800 font-medium flex items-center"
              >
                View All Users
                <span className="ml-1">→</span>
              </Link>
            </div>
          </div>

          <div className="bg-white border border-gray-200 rounded-none p-6 hover:shadow-md transition-shadow">
            <div className="flex items-center gap-4">
              <div className="bg-amber-100 p-3 rounded-lg">
                <FaCarSide className="h-6 w-6 text-amber-500" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Total Cars</p>
                <h3 className="text-2xl font-bold text-gray-900">{stats.cars}</h3>
              </div>
            </div>
            <div className="mt-4">
              <Link 
                to="/admin/cars" 
                className="text-sm text-amber-600 hover:text-amber-800 font-medium flex items-center"
              >
                View All Cars
                <span className="ml-1">→</span>
              </Link>
            </div>
          </div>

          <div className="bg-white border border-gray-200 rounded-none p-6 hover:shadow-md transition-shadow">
            <div className="flex items-center gap-4">
              <div className="bg-green-100 p-3 rounded-lg">
                <FaFileAlt className="h-6 w-6 text-green-500" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Total Bookings</p>
                <h3 className="text-2xl font-bold text-gray-900">{stats.bookings}</h3>
              </div>
            </div>
            <div className="mt-4">
              <Link 
                to="/admin/bookings" 
                className="text-sm text-green-600 hover:text-green-800 font-medium flex items-center"
              >
                View All Bookings
                <span className="ml-1">→</span>
              </Link>
            </div>
          </div>

          <div className="bg-white border border-gray-200 rounded-none p-6 hover:shadow-md transition-shadow">
            <div className="flex items-center gap-4">
              <div className="bg-rose-100 p-3 rounded-lg">
                <FaFileInvoiceDollar className="h-6 w-6 text-rose-500" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Total Revenue</p>
                <h3 className="text-2xl font-bold text-gray-900">₹{stats.revenue.toLocaleString()}</h3>
              </div>
            </div>
            <div className="mt-4">
              <Link 
                to="/admin/payments" 
                className="text-sm text-rose-600 hover:text-rose-800 font-medium flex items-center"
              >
                View All Payments
                <span className="ml-1">→</span>
              </Link>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold mb-4 text-gray-900">Quick Actions</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <Link 
              to="/admin/users" 
              className="bg-gray-900 text-white p-4 flex flex-col items-center text-center hover:bg-gray-800 transition-colors duration-200"
            >
              <FaUser className="h-8 w-8 mb-2" />
              <span className="font-medium">Manage Users</span>
            </Link>
            <Link 
              to="/admin/cars" 
              className="bg-gray-900 text-white p-4 flex flex-col items-center text-center hover:bg-gray-800 transition-colors duration-200"
            >
              <FaCar className="h-8 w-8 mb-2" />
              <span className="font-medium">Manage Cars</span>
            </Link>
            <Link 
              to="/admin/bookings" 
              className="bg-gray-900 text-white p-4 flex flex-col items-center text-center hover:bg-gray-800 transition-colors duration-200"
            >
              <FaCalendarAlt className="h-8 w-8 mb-2" />
              <span className="font-medium">Manage Bookings</span>
            </Link>
            <Link 
              to="/admin/payments" 
              className="bg-gray-900 text-white p-4 flex flex-col items-center text-center hover:bg-gray-800 transition-colors duration-200"
            >
              <FaMoneyBillWave className="h-8 w-8 mb-2" />
              <span className="font-medium">View Payments</span>
            </Link>
          </div>
        </div>

        {/* Analytics Charts */}
        <div className="space-y-8">
          <h2 className="text-xl font-semibold text-gray-900 flex items-center">
            Business Analytics
          </h2>

          {/* Revenue and Bookings Trends */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="bg-white p-6 border border-gray-200 rounded-none">
              <h3 className="text-lg font-semibold mb-4 text-gray-900 flex items-center">
                <FaMoneyBillWave className="mr-2 text-green-600" /> Monthly Revenue
              </h3>
              <div className="h-64">
                <Line data={revenueChartData} options={chartOptions} />
              </div>
            </div>

            <div className="bg-white p-6 border border-gray-200 rounded-none">
              <h3 className="text-lg font-semibold mb-4 text-gray-900 flex items-center">
                <FaCalendarAlt className="mr-2 text-blue-600" /> Monthly Bookings
              </h3>
              <div className="h-64">
                <Bar data={bookingsChartData} options={chartOptions} />
              </div>
            </div>
          </div>

          {/* User Growth and Car Utilization */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="bg-white p-6 border border-gray-200 rounded-none">
              <h3 className="text-lg font-semibold mb-4 text-gray-900 flex items-center">
                <FaUser className="mr-2 text-indigo-600" /> User Growth
              </h3>
              <div className="h-64">
                <Line data={userRegistrationChartData} options={chartOptions} />
              </div>
            </div>

            <div className="bg-white p-6 border border-gray-200 rounded-none">
              <h3 className="text-lg font-semibold mb-4 text-gray-900 flex items-center">
                <FaCar className="mr-2 text-green-600" /> Top Car Utilization
              </h3>
              <div className="h-64">
                <Bar data={carUtilizationChartData} options={chartOptions} />
              </div>
            </div>
          </div>

          {/* Booking Patterns */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="bg-white p-6 border border-gray-200 rounded-none">
              <h3 className="text-lg font-semibold mb-4 text-gray-900 flex items-center">
                <FaCalendarAlt className="mr-2 text-purple-600" /> Bookings by Day of Week
              </h3>
              <div className="h-64">
                <Bar data={bookingsByDayChartData} options={chartOptions} />
              </div>
            </div>

            <div className="bg-white p-6 border border-gray-200 rounded-none">
              <h3 className="text-lg font-semibold mb-4 text-gray-900 flex items-center">
                <FaChartLine className="mr-2 text-pink-600" /> Bookings by Hour
              </h3>
              <div className="h-64">
                <Line data={bookingsByHourChartData} options={chartOptions} />
              </div>
            </div>
          </div>

          {/* Revenue Analysis */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="bg-white p-6 border border-gray-200 rounded-none">
              <h3 className="text-lg font-semibold mb-4 text-gray-900 flex items-center">
                <FaMoneyBillWave className="mr-2 text-amber-600" /> Revenue by Car Type
              </h3>
              <div className="h-64">
                <Doughnut data={revenueByCarTypeChartData} options={doughnutOptions} />
              </div>
            </div>

            <div className="bg-white p-6 border border-gray-200 rounded-none">
              <h3 className="text-lg font-semibold mb-4 text-gray-900 flex items-center">
                <FaCalendarAlt className="mr-2 text-green-600" /> Average Booking Duration
              </h3>
              <div className="h-64">
                <Bar data={avgBookingDurationChartData} options={chartOptions} />
              </div>
            </div>
          </div>

          {/* Distribution Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="bg-white p-6 border border-gray-200 rounded-none">
              <h3 className="text-lg font-semibold mb-4 text-gray-900 flex items-center">
                <FaFileAlt className="mr-2 text-yellow-600" /> Booking Status Distribution
              </h3>
              <div className="h-64">
                <Doughnut data={statusChartData} options={doughnutOptions} />
              </div>
            </div>

            <div className="bg-white p-6 border border-gray-200 rounded-none">
              <h3 className="text-lg font-semibold mb-4 text-gray-900 flex items-center">
                <FaCarSide className="mr-2 text-purple-600" /> Car Types Distribution
              </h3>
              <div className="h-64">
                <Doughnut data={carTypeChartData} options={doughnutOptions} />
              </div>
            </div>
          </div>

          {/* Popular Cars */}
          <div className="bg-white p-6 border border-gray-200 rounded-none">
            <h3 className="text-lg font-semibold mb-4 text-gray-900 flex items-center">
              <FaCar className="mr-2 text-orange-600" /> Most Popular Cars
            </h3>
            <div className="h-64">
              <Bar data={popularCarsChartData} options={chartOptions} />
            </div>
          </div>

          {/* Customer Insights */}
          <div className="bg-white p-6 border border-gray-200 rounded-none">
            <h3 className="text-lg font-semibold mb-4 text-gray-900 flex items-center">
              <FaUser className="mr-2 text-indigo-600" /> Top Customers by Revenue
            </h3>
            <div className="overflow-x-auto">
              <table className="min-w-full">
                <thead>
                  <tr className="bg-gray-50">
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Customer
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Total Revenue
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Bookings
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Avg. per Booking
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {chartData.customerLifetimeValue.map((customer, index) => (
                    <tr key={index} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {customer.customerName}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        ₹{customer.totalRevenue.toLocaleString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {customer.bookingCount}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        ₹{Math.round(customer.totalRevenue / customer.bookingCount).toLocaleString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Performance Metrics */}
          <div className="bg-white p-6 border border-gray-200 rounded-none">
            <h3 className="text-lg font-semibold mb-4 text-gray-900 flex items-center">
              <FaPercentage className="mr-2 text-indigo-600" /> Key Performance Indicators
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="text-center p-4 bg-gray-50">
                <div className="text-2xl font-bold text-gray-900">
                  {stats.bookings > 0 ? ((chartData.bookingsByStatus.PAID || 0) / stats.bookings * 100).toFixed(1) : 0}%
                </div>
                <div className="text-sm text-gray-600">Booking Success Rate</div>
              </div>
              <div className="text-center p-4 bg-gray-50">
                <div className="text-2xl font-bold text-gray-900">
                  ₹{stats.bookings > 0 ? Math.round(stats.revenue / stats.bookings) : 0}
                </div>
                <div className="text-sm text-gray-600">Average Revenue per Booking</div>
              </div>
              <div className="text-center p-4 bg-gray-50">
                <div className="text-2xl font-bold text-gray-900">
                  {stats.cars > 0 ? (stats.bookings / stats.cars).toFixed(1) : 0}
                </div>
                <div className="text-sm text-gray-600">Bookings per Car</div>
              </div>
              <div className="text-center p-4 bg-gray-50">
                <div className="text-2xl font-bold text-gray-900">
                  {chartData.averageBookingDuration.length > 0 ? 
                    chartData.averageBookingDuration[chartData.averageBookingDuration.length - 1].avgDuration.toFixed(1) : 0}
                </div>
                <div className="text-sm text-gray-600">Avg. Booking Duration (Days)</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default AdminDashboard;