// components/RentalReports.js
import React, { useState, useEffect } from 'react';
import { 
  getFirestore, 
  collection, 
  getDocs, 
  query, 
  where,
  orderBy,
  limit
} from 'firebase/firestore';
import Sidebar from './layout/Sidebar';
import { 
  Calendar, 
  Download, 
  Filter, 
  Search, 
  ArrowLeft, 
  FileText,
  User,
  Car,
  Clock,
  UserRoundCog,
  RefreshCw,
  ChevronDown,
  PieChart,
  BarChart4,
  CheckCircle,
  X
} from 'lucide-react';

const RentalReports = ({ user, db: propDb }) => {
  const [rentalReports, setRentalReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [dateRange, setDateRange] = useState({
    startDate: '',
    endDate: ''
  });
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  
  const db = propDb || getFirestore();
  
  const toggleSidebar = () => {
    setIsSidebarCollapsed(!isSidebarCollapsed);
  };
  
  // Add custom styles for the reports page
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
      
      .card-glassmorphism {
        background: rgba(255, 255, 255, 0.7);
        backdrop-filter: blur(10px);
        border: 1px solid rgba(255, 255, 255, 0.2);
        box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
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
      
      .input-field {
        background: rgba(255, 255, 255, 0.5);
        border: 1px solid rgba(229, 231, 235, 0.8);
        transition: all 0.2s ease;
      }
      
      .input-field:focus {
        background: rgba(255, 255, 255, 0.9);
        box-shadow: 0 0 0 2px rgba(45, 55, 72, 0.2);
      }
      
      .btn-primary {
        background: #2d3748;
        color: white;
        transition: all 0.2s ease;
      }
      
      .btn-primary:hover {
        background: #1a202c;
        transform: translateY(-1px);
      }
      
      .btn-primary:active {
        transform: translateY(0);
      }
      
      .btn-success {
        background: #38a169;
        color: white;
        transition: all 0.2s ease;
      }
      
      .btn-success:hover {
        background: #2f855a;
        transform: translateY(-1px);
      }
      
      .report-row {
        transition: all 0.2s ease;
      }
      
      .report-row:hover {
        background-color: rgba(243, 244, 246, 0.7);
      }
    `;
    
    const styleElement = document.createElement('style');
    styleElement.textContent = styles;
    document.head.appendChild(styleElement);
    
    return () => {
      if (document.head.contains(styleElement)) {
        document.head.removeChild(styleElement);
      }
    };
  }, []);
  
  useEffect(() => {
    const fetchRentalReports = async () => {
      try {
        // Create a base query for rentals
        let rentalsQuery = collection(db, 'rentals');
        
        // Start with a query that fetches most recent rentals
        rentalsQuery = query(
          rentalsQuery,
          orderBy('createdAt', 'desc'),
          limit(50)
        );
        
        const querySnapshot = await getDocs(rentalsQuery);
        
        // Process rental data
        const rentalData = [];
        
        for (const doc of querySnapshot.docs) {
          const rental = {
            id: doc.id,
            ...doc.data()
          };
          
          // Format dates for display
          if (rental.rentalDate) {
            rental.rentalDateFormatted = new Date(rental.rentalDate.seconds * 1000).toLocaleDateString();
          }
          
          if (rental.returnDate) {
            rental.returnDateFormatted = new Date(rental.returnDate.seconds * 1000).toLocaleDateString();
          }
          
          rentalData.push(rental);
        }
        
        setRentalReports(rentalData);
        
        // Add a small delay to demonstrate loading animation
        setTimeout(() => {
          setLoading(false);
        }, 600);
      } catch (error) {
        console.error('Error fetching rental reports:', error);
        setLoading(false);
      }
    };
    
    fetchRentalReports();
  }, [db]);
  
  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
  };
  
  const handleStatusFilter = (e) => {
    setFilterStatus(e.target.value);
  };
  
  const handleDateChange = (e) => {
    const { name, value } = e.target;
    setDateRange({
      ...dateRange,
      [name]: value
    });
  };
  
  const handleResetFilters = () => {
    setSearchTerm('');
    setFilterStatus('all');
    setDateRange({
      startDate: '',
      endDate: ''
    });
  };
  
  // Filter reports based on search term, status and date range
  const filteredReports = rentalReports.filter(report => {
    // First filter by search term
    const matchesSearch = 
      (report.car?.model?.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (report.car?.plateNumber?.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (report.customer?.name?.toLowerCase().includes(searchTerm.toLowerCase()));
    
    // Then filter by status
    const matchesStatus = filterStatus === 'all' || report.status === filterStatus;
    
    // Finally filter by date range
    let matchesDateRange = true;
    
    if (dateRange.startDate) {
      const rentalDate = report.rentalDate ? new Date(report.rentalDate.seconds * 1000) : null;
      const startDate = new Date(dateRange.startDate);
      startDate.setHours(0, 0, 0, 0);
      
      if (rentalDate && rentalDate < startDate) {
        matchesDateRange = false;
      }
    }
    
    if (dateRange.endDate && matchesDateRange) {
      const rentalDate = report.rentalDate ? new Date(report.rentalDate.seconds * 1000) : null;
      const endDate = new Date(dateRange.endDate);
      endDate.setHours(23, 59, 59, 999);
      
      if (rentalDate && rentalDate > endDate) {
        matchesDateRange = false;
      }
    }
    
    return matchesSearch && matchesStatus && matchesDateRange;
  });
  
  // Calculate statistics
  const reportStats = {
    total: filteredReports.length,
    active: filteredReports.filter(report => report.status === 'active').length,
    completed: filteredReports.filter(report => report.status === 'completed').length,
    cancelled: filteredReports.filter(report => report.status === 'cancelled').length,
    overdue: filteredReports.filter(report => report.status === 'overdue').length,
  };
  
  const generateCSV = () => {
    // CSV Header
    const headers = [
      'Rental ID',
      'Car Model',
      'Plate Number',
      'Customer Name',
      'Rental Date',
      'Return Date',
      'Status',
      'Rental Amount'
    ].join(',');
    
    // CSV Rows
    const rows = filteredReports.map(report => [
      report.id,
      report.car?.model || '',
      report.car?.plateNumber || '',
      report.customer?.name || '',
      report.rentalDateFormatted || '',
      report.returnDateFormatted || '',
      report.status || '',
      report.rentalAmount || '0'
    ].join(','));
    
    // Combine headers and rows
    const csv = [headers, ...rows].join('\n');
    
    // Create blob and download
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.setAttribute('hidden', '');
    a.setAttribute('href', url);
    a.setAttribute('download', `rental_reports_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };
  
  return (
    <div className="flex h-screen bg-pattern">
      <Sidebar currentPage="reports" />
      
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
              <h1 className="text-xl font-semibold text-gray-800">Rental Reports</h1>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="hidden md:flex items-center text-sm text-gray-500">
                <Clock size={16} className="mr-1" />
                Last updated: {new Date().toLocaleTimeString()}
              </div>
              <button 
                onClick={generateCSV}
                className="btn-success px-4 py-2 rounded-md shadow-sm flex items-center"
              >
                <Download size={18} className="mr-2" />
                <span className="hidden md:inline">Export CSV</span>
              </button>
            </div>
          </div>
        </header>
        
        <main className="flex-1 overflow-x-hidden overflow-y-auto custom-scrollbar">
          <div className="container px-4 sm:px-6 py-8 mx-auto">
            {/* Dashboard Header */}
            <div className="mb-6 animate-fadeIn">
              <h2 className="text-2xl font-bold text-gray-800 mb-2">Rental Analytics</h2>
              <p className="text-gray-500">View and analyze car rental records</p>
            </div>
            
            {/* Stats Cards */}
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
              <div className="card-glassmorphism rounded-lg p-4 flex items-center justify-between animate-slideUp" style={{ animationDelay: '0ms' }}>
                <div>
                  <p className="text-xs text-gray-500 uppercase">Total</p>
                  <p className="text-xl font-semibold text-gray-800">{reportStats.total}</p>
                </div>
                <div className="bg-gray-200 rounded-full p-2">
                  <FileText size={18} className="text-gray-700" />
                </div>
              </div>
              <div className="card-glassmorphism rounded-lg p-4 flex items-center justify-between animate-slideUp" style={{ animationDelay: '100ms' }}>
                <div>
                  <p className="text-xs text-gray-500 uppercase">Active</p>
                  <p className="text-xl font-semibold text-green-600">{reportStats.active}</p>
                </div>
                <div className="bg-green-100 rounded-full p-2">
                  <Car size={18} className="text-green-600" />
                </div>
              </div>
              <div className="card-glassmorphism rounded-lg p-4 flex items-center justify-between animate-slideUp" style={{ animationDelay: '200ms' }}>
                <div>
                  <p className="text-xs text-gray-500 uppercase">Completed</p>
                  <p className="text-xl font-semibold text-blue-600">{reportStats.completed}</p>
                </div>
                <div className="bg-blue-100 rounded-full p-2">
                  <CheckCircle size={18} className="text-blue-600" />
                </div>
              </div>
              <div className="card-glassmorphism rounded-lg p-4 flex items-center justify-between animate-slideUp" style={{ animationDelay: '300ms' }}>
                <div>
                  <p className="text-xs text-gray-500 uppercase">Cancelled</p>
                  <p className="text-xl font-semibold text-red-600">{reportStats.cancelled}</p>
                </div>
                <div className="bg-red-100 rounded-full p-2">
                  <X size={18} className="text-red-600" />
                </div>
              </div>
              <div className="card-glassmorphism rounded-lg p-4 flex items-center justify-between animate-slideUp" style={{ animationDelay: '400ms' }}>
                <div>
                  <p className="text-xs text-gray-500 uppercase">Overdue</p>
                  <p className="text-xl font-semibold text-yellow-600">{reportStats.overdue}</p>
                </div>
                <div className="bg-yellow-100 rounded-full p-2">
                  <Clock size={18} className="text-yellow-600" />
                </div>
              </div>
            </div>
            
            {/* Filters Section */}
            <div className="card-glassmorphism rounded-lg p-4 mb-6 animate-fadeIn">
              <div className="flex flex-col md:flex-row md:items-end justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-800 mb-2 md:mb-0">Filters</h3>
                <button 
                  onClick={handleResetFilters}
                  className="inline-flex items-center text-gray-600 hover:text-gray-900"
                >
                  <RefreshCw size={14} className="mr-1" />
                  Reset Filters
                </button>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                {/* Search filter */}
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Search size={16} className="text-gray-400" />
                  </div>
                  <input
                    type="text"
                    placeholder="Search car, plate or customer..."
                    className="input-field w-full pl-10 pr-4 py-2 rounded-md focus:outline-none"
                    value={searchTerm}
                    onChange={handleSearch}
                  />
                </div>
                
                {/* Status filter */}
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Filter size={16} className="text-gray-400" />
                  </div>
                  <div className="relative">
                    <select
                      className="input-field w-full pl-10 pr-4 py-2 rounded-md appearance-none focus:outline-none"
                      value={filterStatus}
                      onChange={handleStatusFilter}
                    >
                      <option value="all">All Status</option>
                      <option value="active">Active</option>
                      <option value="completed">Completed</option>
                      <option value="cancelled">Cancelled</option>
                      <option value="overdue">Overdue</option>
                    </select>
                    <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                      <ChevronDown size={16} className="text-gray-400" />
                    </div>
                  </div>
                </div>
                
                {/* Date range filter - Start date */}
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Calendar size={16} className="text-gray-400" />
                  </div>
                  <input
                    type="date"
                    name="startDate"
                    placeholder="Start Date"
                    className="input-field w-full pl-10 pr-4 py-2 rounded-md focus:outline-none"
                    value={dateRange.startDate}
                    onChange={handleDateChange}
                  />
                </div>
                
                {/* Date range filter - End date */}
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Calendar size={16} className="text-gray-400" />
                  </div>
                  <input
                    type="date"
                    name="endDate"
                    placeholder="End Date"
                    className="input-field w-full pl-10 pr-4 py-2 rounded-md focus:outline-none"
                    value={dateRange.endDate}
                    onChange={handleDateChange}
                  />
                </div>
              </div>
            </div>
            
            {/* Reports Table */}
            {loading ? (
              <div className="flex justify-center my-10">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-700"></div>
              </div>
            ) : (
              <div className="card-glassmorphism rounded-lg overflow-hidden animate-fadeIn shadow-sm">
                <div className="p-4 border-b border-gray-200 bg-gray-50 bg-opacity-70 flex justify-between items-center">
                  <h3 className="text-sm font-semibold text-gray-700">
                    Rental Records ({filteredReports.length})
                  </h3>
                  
                  <div className="flex space-x-2">
                    <button className="p-1 rounded text-gray-500 hover:text-gray-700 hover:bg-gray-100">
                      <BarChart4 size={16} />
                    </button>
                    <button className="p-1 rounded text-gray-500 hover:text-gray-700 hover:bg-gray-100">
                      <PieChart size={16} />
                    </button>
                  </div>
                </div>
                
                {filteredReports.length > 0 ? (
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead>
                        <tr className="bg-gray-50 bg-opacity-80">
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Rental Period
                          </th>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Vehicle
                          </th>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Customer
                          </th>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Owner
                          </th>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Status
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200">
                        {filteredReports.map((report, index) => (
                          <tr key={report.id} className="report-row" style={{ animationDelay: `${index * 50}ms` }}>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="flex items-center">
                                <Calendar size={16} className="text-gray-400 mr-2" />
                                <div>
                                  <div className="text-sm font-medium text-gray-900">
                                    {report.rentalDateFormatted || 'N/A'}
                                  </div>
                                  <div className="text-xs text-gray-500">
                                    Return: {report.returnDateFormatted || 'N/A'}
                                  </div>
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="flex items-center">
                                <Car size={16} className="text-gray-400 mr-2" />
                                <div>
                                  <div className="text-sm font-medium text-gray-900">{report.car?.model || 'N/A'}</div>
                                  <div className="text-xs text-gray-500">{report.car?.plateNumber || 'N/A'}</div>
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="flex items-center">
                                <User size={16} className="text-gray-400 mr-2" />
                                <div>
                                  <div className="text-sm font-medium text-gray-900">{report.customer?.name || 'N/A'}</div>
                                  <div className="text-xs text-gray-500">{report.customer?.email || 'N/A'}</div>
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="flex items-center">
                                <UserRoundCog size={16} className="text-gray-400 mr-2" />
                                <span className="text-sm text-gray-900">{report.owner?.name || 'N/A'}</span>
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full 
                                ${report.status === 'active' ? 'bg-green-100 text-green-800' : 
                                  report.status === 'completed' ? 'bg-blue-100 text-blue-800' : 
                                  report.status === 'cancelled' ? 'bg-red-100 text-red-800' : 
                                  report.status === 'overdue' ? 'bg-yellow-100 text-yellow-800' : 
                                  'bg-gray-100 text-gray-800'}`}>
                                {report.status || 'N/A'}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="py-12 text-center">
                    <div className="mx-auto w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mb-4">
                      <FileText size={32} className="text-gray-400" />
                    </div>
                    <h3 className="text-lg font-medium text-gray-900 mb-1">No rental reports found</h3>
                    <p className="text-gray-500 mb-6">
                      {searchTerm || filterStatus !== 'all' || dateRange.startDate || dateRange.endDate ? 
                        'Try adjusting your filters to see more results' : 
                        'No rental reports available in the system'}
                    </p>
                    {(searchTerm || filterStatus !== 'all' || dateRange.startDate || dateRange.endDate) && (
                      <button 
                        onClick={handleResetFilters}
                        className="btn-outline border px-4 py-2 rounded-md shadow-sm inline-flex items-center"
                      >
                        <RefreshCw size={16} className="mr-2" />
                        Reset Filters
                      </button>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
};

export default RentalReports;