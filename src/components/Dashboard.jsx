// components/Dashboard.js
import React, { useState, useEffect, useCallback } from 'react';
import { getFirestore, collection, getDocs, query, where, addDoc, serverTimestamp } from 'firebase/firestore';
import Sidebar from './layout/Sidebar';
import { 
  Car, 
  User, 
  UsersRound, 
  TrendingUp, 
  Clock, 
  Calendar, 
  ArrowLeft,
  Activity,
  BarChart2,
  Filter,
  Bell,
  MessageSquare,
  Star,
  X,
  Check,
  AlertTriangle
} from 'lucide-react';

const Dashboard = ({ user }) => {
  const [stats, setStats] = useState({
    totalCars: 0,
    totalOwners: 0,
    totalCustomers: 0,
    rentedCars: 0,
    totalClients: 0,
    totalFeedbacks: 0
  });
  const [loading, setLoading] = useState(true);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [notifications, setNotifications] = useState([
    { id: 1, message: "New client registration: Maria Santos", time: "10 minutes ago", read: false },
    { id: 2, message: "New feedback received from John Doe", time: "1 hour ago", read: false },
    { id: 3, message: "Car return overdue: Toyota Camry (DEF-456)", time: "2 hours ago", read: false },
    { id: 4, message: "Maintenance reminder: Tesla Model 3", time: "Yesterday", read: false }
  ]);
  
  const [notificationCount, setNotificationCount] = useState(4);
  const [showAllNotifications, setShowAllNotifications] = useState(false);
  
  const db = getFirestore();
  
  const toggleSidebar = () => {
    setIsSidebarCollapsed(!isSidebarCollapsed);
  };
  
  // Sample car category data
  const [carCategories, setCarCategories] = useState([
    { name: 'SUVs', percentage: 42, color: '#4F46E5' },
    { name: 'Electric Vehicles', percentage: 28, color: '#10B981' },
    { name: 'Sedans', percentage: 18, color: '#F59E0B' },
    { name: 'Luxury', percentage: 12, color: '#EC4899' }
  ]);
  
  const [selectedCategory, setSelectedCategory] = useState(null);
  
  // Function to add a new notification
  const addNotification = useCallback((message, type = 'info') => {
    const newNotification = {
      id: Date.now(), // unique ID based on timestamp
      message,
      time: 'Just now',
      read: false,
      type // 'info', 'warning', or 'error'
    };
    
    setNotifications(prev => [newNotification, ...prev]);
    setNotificationCount(prev => prev + 1);
    
    // Optional: You could also save to Firestore here
    // const notificationsRef = collection(db, 'notifications');
    // addDoc(notificationsRef, {
    //   ...newNotification,
    //   timestamp: serverTimestamp(),
    //   userId: user?.id // if you have user auth
    // });
    
    return newNotification.id; // return the ID so it can be referenced later
  }, []);
  
  // Function to remove a notification
  const removeNotification = useCallback((id) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
    setNotificationCount(prev => Math.max(0, prev - 1));
  }, []);
  
  useEffect(() => {
    const fetchStats = async () => {
      try {
        // Fetch cars data
        const carsQuery = collection(db, 'cars');
        const carsSnapshot = await getDocs(carsQuery);
        const totalCars = carsSnapshot.size;
        
        // Fetch owners data
        const ownersQuery = query(collection(db, 'users'), where('role', '==', 'owner'));
        const ownersSnapshot = await getDocs(ownersQuery);
        const totalOwners = ownersSnapshot.size;
        
        // Fetch customers data
        const customersQuery = query(collection(db, 'users'), where('role', '==', 'customer'));
        const customersSnapshot = await getDocs(customersQuery);
        const totalCustomers = customersSnapshot.size;
        
        // Fetch rented cars data
        const rentedCarsQuery = query(collection(db, 'cars'), where('status', '==', 'rented'));
        const rentedCarsSnapshot = await getDocs(rentedCarsQuery);
        const rentedCars = rentedCarsSnapshot.size;

        // We would fetch these from Firestore, but using dummy data for now
        const totalClients = 24;
        const totalFeedbacks = 16;
        
        setStats({
          totalCars,
          totalOwners,
          totalCustomers,
          rentedCars,
          totalClients,
          totalFeedbacks
        });
        
        // Simulate loading for demonstration purposes
        setTimeout(() => {
          setLoading(false);
        }, 800);
        
      } catch (error) {
        console.error('Error fetching stats:', error);
        setLoading(false);
      }
    };
    
    fetchStats();
  }, [db]);

  // Add custom styles for the dashboard
  useEffect(() => {
    const styles = `
      @keyframes fadeIn {
        from { opacity: 0; }
        to { opacity: 1; }
      }
      
      @keyframes slideUp {
        from { 
          opacity: 0;
          transform: translateY(20px);
        }
        to { 
          opacity: 1;
          transform: translateY(0);
        }
      }
      
      @keyframes pulse {
        0% {
          box-shadow: 0 0 0 0 rgba(45, 55, 72, 0.3);
        }
        70% {
          box-shadow: 0 0 0 10px rgba(45, 55, 72, 0);
        }
        100% {
          box-shadow: 0 0 0 0 rgba(45, 55, 72, 0);
        }
      }
      
      .card-glassmorphism {
        background: rgba(255, 255, 255, 0.7);
        backdrop-filter: blur(10px);
        border: 1px solid rgba(255, 255, 255, 0.2);
        box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
      }
      
      .card-glassmorphism-dark {
        background: rgba(45, 55, 72, 0.7);
        backdrop-filter: blur(10px);
        border: 1px solid rgba(255, 255, 255, 0.1);
        box-shadow: 0 8px 32px rgba(0, 0, 0, 0.2);
      }
      
      .bg-pattern {
        background-color: #f5f5f5;
        background-image: radial-gradient(#e0e0e0 1px, transparent 1px);
        background-size: 20px 20px;
      }
      
      .animate-fadeIn {
        animation: fadeIn 0.5s ease-out forwards;
      }
      
      .animate-slideUp {
        animation: slideUp 0.5s ease-out forwards;
      }
      
      .animate-pulse-subtle {
        animation: pulse 2s infinite;
      }
      
      .custom-scrollbar::-webkit-scrollbar {
        width: 8px;
      }
      
      .custom-scrollbar::-webkit-scrollbar-track {
        background: #f1f1f1;
        border-radius: 10px;
      }
      
      .custom-scrollbar::-webkit-scrollbar-thumb {
        background: #c1c1c1;
        border-radius: 10px;
      }
      
      .custom-scrollbar::-webkit-scrollbar-thumb:hover {
        background: #a1a1a1;
      }
      
      .stat-card {
        transition: all 0.3s ease;
      }
      
      .stat-card:hover {
        transform: translateY(-5px);
      }
      
      .stat-icon {
        transition: all 0.3s ease;
      }
      
      .stat-card:hover .stat-icon {
        transform: scale(1.1);
      }
      
      .table-row {
        transition: all 0.2s ease;
      }
      
      .table-row:hover {
        background-color: rgba(243, 244, 246, 0.7);
      }

      .notification-item {
        transition: all 0.2s ease;
      }
      
      .notification-item:hover {
        background-color: rgba(243, 244, 246, 0.7);
      }
      
      @keyframes notification-pulse {
        0% {
          box-shadow: 0 0 0 0 rgba(59, 130, 246, 0.5);
        }
        70% {
          box-shadow: 0 0 0 6px rgba(59, 130, 246, 0);
        }
        100% {
          box-shadow: 0 0 0 0 rgba(59, 130, 246, 0);
        }
      }
      
      .notification-pulse {
        animation: notification-pulse 2s infinite;
      }
    `;
    
    const styleElement = document.createElement('style');
    styleElement.textContent = styles;
    document.head.appendChild(styleElement);
    
    return () => {
      document.head.removeChild(styleElement);
    };
  }, []);

  // Sample rental data
  const rentalData = [
    {
      id: 1,
      car: { name: 'Volvo EX30', plate: 'ABC-123', image: null },
      customer: { name: 'John Doe', email: 'john@example.com' },
      rentalDate: 'April 5, 2025',
      returnDate: 'April 9, 2025',
      status: 'active'
    },
    {
      id: 2,
      car: { name: 'Tesla Model 3', plate: 'XYZ-789', image: null },
      customer: { name: 'Jane Smith', email: 'jane@example.com' },
      rentalDate: 'April 3, 2025',
      returnDate: 'April 10, 2025',
      status: 'active'
    },
    {
      id: 3,
      car: { name: 'Toyota Camry', plate: 'DEF-456', image: null },
      customer: { name: 'Robert Johnson', email: 'robert@example.com' },
      rentalDate: 'April 1, 2025',
      returnDate: 'April 4, 2025',
      status: 'completed'
    }
  ];

  // Sample feedback data
  const feedbackData = [
    {
      id: 1,
      customer: { name: 'Sarah Wilson', avatar: null },
      car: 'Tesla Model 3',
      rating: 5,
      comment: 'Great experience! The car was clean and in perfect condition.',
      date: 'April 15, 2025'
    },
    {
      id: 2,
      customer: { name: 'Michael Brown', avatar: null },
      car: 'Toyota Camry',
      rating: 4,
      comment: 'Good car, but pickup process took longer than expected.',
      date: 'April 12, 2025'
    },
    {
      id: 3,
      customer: { name: 'Emily Davis', avatar: null },
      car: 'Volvo EX30',
      rating: 5,
      comment: 'Amazing electric car! Will definitely rent again.',
      date: 'April 10, 2025'
    }
  ];

  return (
    <div className="flex h-screen bg-pattern">
      <Sidebar currentPage="dashboard" />
      
      <div className={`flex-1 flex flex-col overflow-hidden transition-all duration-300 ${isSidebarCollapsed ? 'ml-0' : 'ml-0 lg:ml-64'}`}>
        {/* Top Bar */}
        <header className="bg-white shadow-sm z-10">
          <div className="flex items-center justify-between px-6 py-4">
            <div className="flex items-center">
              <button 
                onClick={toggleSidebar}
                className="mr-4 p-1 rounded-md text-gray-500 hover:text-gray-700 focus:outline-none lg:hidden"
              >
                <ArrowLeft size={20} />
              </button>
              <h1 className="text-xl font-semibold text-gray-800">Dashboard</h1>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="hidden md:flex items-center text-sm text-gray-500">
                <Clock size={16} className="mr-1" />
                {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
              </div>
              
              <div className="relative">
                <button className="p-1 rounded-full text-gray-500 hover:text-gray-700 focus:outline-none">
                  <Filter size={20} />
                </button>
              </div>
            </div>
          </div>
        </header>
        
        <main className="flex-1 overflow-x-hidden overflow-y-auto custom-scrollbar">
          <div className="container px-4 sm:px-6 py-8 mx-auto">
            {/* Dashboard Header */}
            <div className="mb-8 animate-fadeIn">
              <h2 className="text-2xl font-bold text-gray-800 mb-2">Car Rental System</h2>
              <p className="text-gray-500">Overview of rental activity and statistics</p>
            </div>
            
            {loading ? (
              <div className="flex justify-center my-10">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-700"></div>
              </div>
            ) : (
              <>
                {/* Stats Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                  {/* Total Cars */}
                  <div className="card-glassmorphism rounded-lg overflow-hidden stat-card animate-slideUp" style={{ animationDelay: '0ms' }}>
                    <div className="p-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <h6 className="text-xs font-medium leading-none tracking-wider text-gray-500 uppercase">
                            Total Cars
                          </h6>
                          <span className="text-4xl font-semibold text-gray-800">{stats.totalCars}</span>
                          <div className="mt-1">
                            <span className="inline-block px-2 py-1 text-xs text-green-700 bg-green-100 rounded-md">
                              {stats.totalCars - stats.rentedCars} Available
                            </span>
                          </div>
                        </div>
                        <div className="p-3 bg-gray-200 rounded-full stat-icon">
                          <Car size={24} className="text-gray-700" />
                        </div>
                      </div>
                      <div className="mt-4 pt-3 border-t border-gray-200">
                        <div className="flex items-center text-xs text-gray-500">
                          <TrendingUp size={14} className="mr-1 text-green-500" />
                          <span>12% increase this month</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Total Owners */}
                  <div className="card-glassmorphism rounded-lg overflow-hidden stat-card animate-slideUp" style={{ animationDelay: '100ms' }}>
                    <div className="p-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <h6 className="text-xs font-medium leading-none tracking-wider text-gray-500 uppercase">
                            Car Owners
                          </h6>
                          <span className="text-4xl font-semibold text-gray-800">{stats.totalOwners}</span>
                          <div className="mt-1">
                            <span className="inline-block px-2 py-1 text-xs text-blue-700 bg-blue-100 rounded-md">
                              {stats.totalOwners > 0 ? '⭐ Active' : 'No owners'}
                            </span>
                          </div>
                        </div>
                        <div className="p-3 bg-gray-200 rounded-full stat-icon">
                          <UsersRound size={24} className="text-gray-700" />
                        </div>
                      </div>
                      <div className="mt-4 pt-3 border-t border-gray-200">
                        <div className="flex items-center text-xs text-gray-500">
                          <TrendingUp size={14} className="mr-1 text-green-500" />
                          <span>5% increase this month</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Total Customers */}
                  <div className="card-glassmorphism rounded-lg overflow-hidden stat-card animate-slideUp" style={{ animationDelay: '200ms' }}>
                    <div className="p-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <h6 className="text-xs font-medium leading-none tracking-wider text-gray-500 uppercase">
                            Customers
                          </h6>
                          <span className="text-4xl font-semibold text-gray-800">{stats.totalCustomers}</span>
                          <div className="mt-1">
                            <span className="inline-block px-2 py-1 text-xs text-purple-700 bg-purple-100 rounded-md">
                              {stats.totalCustomers > 0 ? '⭐ Active' : 'No customers'}
                            </span>
                          </div>
                        </div>
                        <div className="p-3 bg-gray-200 rounded-full stat-icon">
                          <User size={24} className="text-gray-700" />
                        </div>
                      </div>
                      <div className="mt-4 pt-3 border-t border-gray-200">
                        <div className="flex items-center text-xs text-gray-500">
                          <TrendingUp size={14} className="mr-1 text-green-500" />
                          <span>8% increase this month</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  {/* Total Clients - NEW CARD */}
                  <div className="card-glassmorphism rounded-lg overflow-hidden stat-card animate-slideUp" style={{ animationDelay: '300ms' }}>
                    <div className="p-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <h6 className="text-xs font-medium leading-none tracking-wider text-gray-500 uppercase">
                            Total Clients
                          </h6>
                          <span className="text-4xl font-semibold text-gray-800">{stats.totalClients}</span>
                          <div className="mt-1">
                            <span className="inline-block px-2 py-1 text-xs text-orange-700 bg-orange-100 rounded-md">
                              +3 new this week
                            </span>
                          </div>
                        </div>
                        <div className="p-3 bg-gray-200 rounded-full stat-icon">
                          <MessageSquare size={24} className="text-gray-700" />
                        </div>
                      </div>
                      <div className="mt-4 pt-3 border-t border-gray-200">
                        <div className="flex items-center text-xs text-gray-500">
                          <TrendingUp size={14} className="mr-1 text-green-500" />
                          <span>10% increase this month</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Main Content Area */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  {/* Recent Rentals Section */}
                  <div className="lg:col-span-2 animate-fadeIn" style={{ animationDelay: '200ms' }}>
                    <div className="flex items-center justify-between mb-4">
                      <h4 className="text-lg font-semibold text-gray-800">Recent Rentals</h4>
                      <div className="flex items-center space-x-2">
                        <button className="p-1 text-sm text-gray-500 hover:text-gray-800 focus:outline-none">
                          Today
                        </button>
                        <button className="p-1 text-sm text-gray-700 font-medium focus:outline-none">
                          This Week
                        </button>
                        <button className="p-1 text-sm text-gray-500 hover:text-gray-800 focus:outline-none">
                          This Month
                        </button>
                      </div>
                    </div>
                    
                    <div className="card-glassmorphism rounded-lg overflow-hidden">
                      <div className="overflow-x-auto">
                        <table className="min-w-full">
                          <thead>
                            <tr className="bg-gray-50 bg-opacity-80">
                              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Vehicle
                              </th>
                              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Customer
                              </th>
                              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Dates
                              </th>
                              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Status
                              </th>
                            </tr>
                          </thead>
                          <tbody>
                            {rentalData.map((rental, index) => (
                              <tr key={rental.id} className="table-row">
                                <td className="px-6 py-4 whitespace-nowrap">
                                  <div className="flex items-center">
                                    <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center">
                                      <Car size={16} className="text-gray-600" />
                                    </div>
                                    <div className="ml-4">
                                      <div className="text-sm font-medium text-gray-900">{rental.car.name}</div>
                                      <div className="text-xs text-gray-500">{rental.car.plate}</div>
                                    </div>
                                  </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                  <div className="text-sm text-gray-900">{rental.customer.name}</div>
                                  <div className="text-xs text-gray-500">{rental.customer.email}</div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                  <div className="text-sm text-gray-500 flex items-center">
                                    <Calendar size={14} className="mr-1" />
                                    {rental.rentalDate}
                                  </div>
                                  <div className="text-xs text-gray-400">
                                    Return: {rental.returnDate}
                                  </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                  <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                    rental.status === 'active' 
                                      ? 'bg-green-100 text-green-800' 
                                      : rental.status === 'completed'
                                        ? 'bg-blue-100 text-blue-800'
                                        : 'bg-yellow-100 text-yellow-800'
                                  }`}>
                                    {rental.status === 'active' ? 'Active' : 
                                     rental.status === 'completed' ? 'Completed' : 'Pending'}
                                  </span>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                      <div className="px-6 py-3 bg-gray-50 bg-opacity-80 flex justify-between items-center">
                        <span className="text-sm text-gray-500">Showing {rentalData.length} of {rentalData.length} rentals</span>
                        <button className="px-3 py-1 text-sm text-gray-700 hover:text-gray-900 focus:outline-none">
                          View All
                        </button>
                      </div>
                    </div>

                    {/* Feedback Section - NEW SECTION */}
                    <div className="mt-6">
                      <div className="flex items-center justify-between mb-4">
                        <h4 className="text-lg font-semibold text-gray-800">Recent Feedbacks</h4>
                        <span className="text-sm text-gray-500">{stats.totalFeedbacks} total feedbacks</span>
                      </div>
                      
                      <div className="card-glassmorphism rounded-lg overflow-hidden">
                        <div className="p-4 space-y-4">
                          {feedbackData.map((feedback) => (
                            <div key={feedback.id} className="p-4 border-b border-gray-100 last:border-0">
                              <div className="flex items-start">
                                <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center mr-3 flex-shrink-0">
                                  <User size={16} className="text-gray-600" />
                                </div>
                                <div className="flex-1">
                                  <div className="flex justify-between items-start">
                                    <div>
                                      <h5 className="text-sm font-medium text-gray-800">{feedback.customer.name}</h5>
                                      <div className="flex items-center mt-1">
                                        {[...Array(5)].map((_, i) => (
                                          <Star 
                                            key={i} 
                                            size={14} 
                                            className={i < feedback.rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'} 
                                          />
                                        ))}
                                        <span className="ml-2 text-xs text-gray-500">{feedback.car}</span>
                                      </div>
                                    </div>
                                    <span className="text-xs text-gray-400">{feedback.date}</span>
                                  </div>
                                  <p className="mt-2 text-sm text-gray-600">{feedback.comment}</p>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                        <div className="px-6 py-3 bg-gray-50 bg-opacity-80 flex justify-center">
                          <button className="px-3 py-1 text-sm text-gray-700 hover:text-gray-900 focus:outline-none">
                            View All Feedbacks
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="lg:col-span-1 space-y-6">
                    {/* Notifications Section - NEW SECTION */}
                    <div className="animate-fadeIn" style={{ animationDelay: '250ms' }}>
                      <div className="flex items-center justify-between mb-4">
                        <h4 className="text-lg font-semibold text-gray-800">Notifications</h4>
                        <div className="flex items-center">
                          <button 
                            className="p-1 rounded-full bg-gray-100 text-gray-500 hover:text-gray-700 focus:outline-none relative mr-3"
                            onClick={() => setShowAllNotifications(!showAllNotifications)}
                          >
                            <Bell size={16} />
                            {notificationCount > 0 && (
                              <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-4 w-4 flex items-center justify-center">
                                {notificationCount}
                              </span>
                            )}
                          </button>
                          <button 
                            className="text-xs text-blue-600 hover:text-blue-800"
                            onClick={() => {
                              setNotifications(notifications.map(n => ({ ...n, read: true })));
                              setNotificationCount(0);
                            }}
                          >
                            Mark all as read
                          </button>
                        </div>
                      </div>
                      
                      <div className="card-glassmorphism rounded-lg overflow-hidden">
                        <div className="p-4">
                          <div className="space-y-1">
                            {(showAllNotifications ? notifications : notifications.slice(0, 3)).map((notification) => (
                              <div 
                                key={notification.id} 
                                className={`p-3 rounded-md notification-item cursor-pointer flex items-start ${notification.read ? 'bg-white' : 'bg-blue-50'}`}
                                onClick={() => {
                                  // Mark this notification as read
                                  const updatedNotifications = notifications.map(n => 
                                    n.id === notification.id ? { ...n, read: true } : n
                                  );
                                  setNotifications(updatedNotifications);
                                  // Update unread count
                                  setNotificationCount(updatedNotifications.filter(n => !n.read).length);
                                }}
                              >
                                <div className={`p-2 rounded-full ${notification.read ? 'bg-gray-100' : 'bg-blue-100'} mr-3 flex-shrink-0`}>
                                  <Bell size={14} className={notification.read ? 'text-gray-600' : 'text-blue-600'} />
                                </div>
                                <div className="flex-1">
                                  <div className="flex justify-between">
                                    <p className={`text-sm ${notification.read ? 'text-gray-700' : 'text-gray-900 font-medium'}`}>
                                      {notification.message}
                                    </p>
                                    {!notification.read && (
                                      <span className="h-2 w-2 bg-blue-500 rounded-full ml-2 mt-1.5 flex-shrink-0"></span>
                                    )}
                                  </div>
                                  <span className="text-xs text-gray-400">{notification.time}</span>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                        <div className="px-6 py-3 bg-gray-50 bg-opacity-80 flex justify-between items-center">
                          <button 
                            className="px-3 py-1 text-sm text-gray-700 hover:text-gray-900 focus:outline-none"
                            onClick={() => setShowAllNotifications(!showAllNotifications)}
                          >
                            {showAllNotifications ? 'Show Less' : 'View All Notifications'}
                          </button>
                          
                          <button 
                            className="px-3 py-1 text-sm text-red-600 hover:text-red-800 focus:outline-none"
                            onClick={() => {
                              if (window.confirm('Are you sure you want to clear all notifications?')) {
                                setNotifications([]);
                                setNotificationCount(0);
                              }
                            }}
                          >
                            Clear All
                          </button>
                        </div>
                      </div>
                    </div>
                    
                    {/* Activity & Performance Card */}
                    <div className="animate-fadeIn" style={{ animationDelay: '300ms' }}>
                      <div className="flex items-center justify-between mb-4">
                        <h4 className="text-lg font-semibold text-gray-800">Performance</h4>
                        <button className="text-sm text-gray-500 hover:text-gray-800 focus:outline-none">
                          <BarChart2 size={16} />
                        </button>
                      </div>
                      
                      <div className="card-glassmorphism rounded-lg overflow-hidden">
                        <div className="p-6">
                          <div className="space-y-6">
                            {/* Average Rental Duration */}
                            <div>
                              <div className="flex justify-between items-center mb-2">
                                <span className="text-sm font-medium text-gray-600">Average Rental (days)</span>
                                <span className="text-sm font-bold text-gray-800">4.8</span>
                              </div>
                              <div className="w-full bg-gray-200 rounded-full h-2">
                                <div className="bg-gray-800 h-2 rounded-full animate-pulse-subtle" style={{ width: '75%' }}></div>
                              </div>
                            </div>
                            
                            {/* Customer Satisfaction */}
                            <div>
                              <div className="flex justify-between items-center mb-2">
                                <span className="text-sm font-medium text-gray-600">Customer Satisfaction</span>
                                <span className="text-sm font-bold text-gray-800">92%</span>
                              </div>
                              <div className="w-full bg-gray-200 rounded-full h-2">
                                <div className="bg-gray-800 h-2 rounded-full animate-pulse-subtle" style={{ width: '92%' }}></div>
                              </div>
                            </div>
                            
                            {/* Car Utilization */}
                            <div>
                              <div className="flex justify-between items-center mb-2">
                                <span className="text-sm font-medium text-gray-600">Car Utilization</span>
                                <span className="text-sm font-bold text-gray-800">68%</span>
                              </div>
                              <div className="w-full bg-gray-200 rounded-full h-2">
                                <div className="bg-gray-800 h-2 rounded-full animate-pulse-subtle" style={{ width: '68%' }}></div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>
        </main>
      </div>
    </div>
  );
};

export default Dashboard;