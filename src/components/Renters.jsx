import React, { useState, useEffect } from 'react';
import { 
  getFirestore, 
  collection, 
  getDocs, 
  addDoc, 
  doc, 
  deleteDoc, 
  query, 
  where,
  updateDoc,
  serverTimestamp
} from 'firebase/firestore';
import { getAuth, createUserWithEmailAndPassword, sendEmailVerification } from 'firebase/auth';
import Sidebar from './layout/Sidebar';
import { 
  Plus, 
  Edit, 
  Trash2, 
  X, 
  Search, 
  ArrowLeft, 
  Filter, 
  UserPlus,
  Mail,
  Phone,
  MapPin,
  Lock,
  Shield,
  UserCircle,
  AlertTriangle,
  CheckCircle,
  Car,
  Eye,
  Calendar,
  ClipboardCheck,
  CreditCard,
  FileText,
  Key,
  History,
  Clock,
  Save
} from 'lucide-react';

const Renters = ({ user, db: propDb }) => {
  const [renters, setRenters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedRenter, setSelectedRenter] = useState(null);
  const [activeTab, setActiveTab] = useState('info');
  const [searchTerm, setSearchTerm] = useState('');
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  
  // New renter form state
  const [newRenter, setNewRenter] = useState({
    name: '',
    email: '',
    contact: '',
    address: '',
    password: '',
    confirmPassword: '',
    status: 'active',
  });
  
  // Edit renter form state
  const [editRenter, setEditRenter] = useState({
    id: '',
    name: '',
    email: '',
    contact: '',
    address: '',
    status: 'active',
  });
  
  const [formErrors, setFormErrors] = useState({});
  const [editFormErrors, setEditFormErrors] = useState({});
  const [submitError, setSubmitError] = useState('');
  const [editError, setEditError] = useState('');
  const [submitLoading, setSubmitLoading] = useState(false);
  const [editLoading, setEditLoading] = useState(false);
  
  // Sample rental history data for demonstration
  const [rentalHistory, setRentalHistory] = useState([
    {
      id: 'rental1',
      renterId: 'renter1',
      carModel: 'Tesla Model 3',
      licensePlate: 'XYZ-789',
      startDate: '2025-03-10',
      endDate: '2025-03-15',
      totalAmount: 350,
      status: 'completed'
    },
    {
      id: 'rental2',
      renterId: 'renter1',
      carModel: 'Toyota Camry',
      licensePlate: 'ABC-123',
      startDate: '2025-02-20',
      endDate: '2025-02-22',
      totalAmount: 120,
      status: 'completed'
    },
    {
      id: 'rental3',
      renterId: 'renter2',
      carModel: 'Honda Civic',
      licensePlate: 'DEF-456',
      startDate: '2025-04-05',
      endDate: '2025-04-10',
      totalAmount: 250,
      status: 'active'
    }
  ]);
  
  // Sample customer ID information for demonstration
  const [customerIDs, setCustomerIDs] = useState([
    {
      id: 'id1',
      renterId: 'renter1',
      type: 'Driver\'s License',
      number: 'DL-123456789',
      issuedDate: '2020-01-15',
      expiryDate: '2030-01-15',
      isVerified: true,
      verificationDate: '2025-01-10'
    },
    {
      id: 'id2',
      renterId: 'renter1',
      type: 'Passport',
      number: 'P12345678',
      issuedDate: '2021-03-20',
      expiryDate: '2031-03-20',
      isVerified: true,
      verificationDate: '2025-01-10'
    },
    {
      id: 'id3',
      renterId: 'renter2',
      type: 'Driver\'s License',
      number: 'DL-987654321',
      issuedDate: '2022-05-10',
      expiryDate: '2032-05-10',
      isVerified: true,
      verificationDate: '2025-02-15'
    }
  ]);
  
  // Sample payment methods for demonstration
  const [paymentMethods, setPaymentMethods] = useState([
    {
      id: 'pm1',
      renterId: 'renter1',
      type: 'Credit Card',
      cardType: 'Visa',
      lastFourDigits: '4567',
      expiryDate: '05/28',
      isDefault: true
    },
    {
      id: 'pm2',
      renterId: 'renter2',
      type: 'Credit Card',
      cardType: 'MasterCard',
      lastFourDigits: '8901',
      expiryDate: '11/27',
      isDefault: true
    }
  ]);
  
  const auth = getAuth();
  const db = propDb || getFirestore();
  
  const toggleSidebar = () => {
    setIsSidebarCollapsed(!isSidebarCollapsed);
  };
  
  // Add custom styles for the renters page
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
      
      .modal-glassmorphism {
        background: rgba(255, 255, 255, 0.9);
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
      
      .btn-outline {
        border: 1px solid #2d3748;
        color: #2d3748;
        background: transparent;
        transition: all 0.2s ease;
      }
      
      .btn-outline:hover {
        background: rgba(45, 55, 72, 0.05);
      }
      
      .btn-danger {
        background: #e53e3e;
        color: white;
        transition: all 0.2s ease;
      }
      
      .btn-danger:hover {
        background: #c53030;
      }
      
      .renter-row {
        transition: all 0.2s ease;
      }
      
      .renter-row:hover {
        background-color: rgba(243, 244, 246, 0.7);
      }
      
      .avatar {
        transition: all 0.2s ease;
      }
      
      .renter-row:hover .avatar {
        transform: scale(1.05);
      }
      
      .tab-button {
        transition: all 0.2s ease;
      }
      
      .tab-button.active {
        border-bottom: 2px solid #2d3748;
        color: #2d3748;
        font-weight: 500;
      }
      
      .tab-button:not(.active) {
        color: #6B7280;
      }
      
      .credential-card {
        transition: all 0.2s ease;
      }
      
      .credential-card:hover {
        transform: translateY(-2px);
        box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.1);
      }
      
      .status-pill {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        padding: 0.25rem 0.75rem;
        border-radius: 9999px;
        font-size: 0.75rem;
        font-weight: 500;
      }
      
      .status-pill.active {
        background-color: rgba(16, 185, 129, 0.1);
        color: rgb(16, 185, 129);
      }
      
      .status-pill.inactive {
        background-color: rgba(229, 62, 62, 0.1);
        color: rgb(229, 62, 62);
      }
      
      .status-pill.completed {
        background-color: rgba(79, 70, 229, 0.1);
        color: rgb(79, 70, 229);
      }
      
      .status-pill.expired {
        background-color: rgba(245, 158, 11, 0.1);
        color: rgb(245, 158, 11);
      }
      
      .verification-badge {
        display: inline-flex;
        align-items: center;
        padding: 0.125rem 0.5rem;
        border-radius: 9999px;
        font-size: 0.75rem;
        font-weight: 500;
      }
      
      .verification-badge.verified {
        background-color: rgba(16, 185, 129, 0.1);
        color: rgb(16, 185, 129);
      }
      
      .verification-badge.pending {
        background-color: rgba(245, 158, 11, 0.1);
        color: rgb(245, 158, 11);
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
  
  // Fetch renters on component mount
  useEffect(() => {
    const fetchRenters = async () => {
      try {
        if (!db) return;
        
        const rentersQuery = query(collection(db, 'users'), where('role', '==', 'customer'));
        const querySnapshot = await getDocs(rentersQuery);
        
        const rentersData = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        
        // For demo purposes, assign some IDs that match our sample data
        const updatedRenters = rentersData.map((renter, index) => {
          if (index === 0) {
            return { ...renter, demoId: 'renter1' };
          } else if (index === 1) {
            return { ...renter, demoId: 'renter2' };
          }
          return renter;
        });
        
        setRenters(updatedRenters);
        
        // Add a small delay to demonstrate loading animation
        setTimeout(() => {
          setLoading(false);
        }, 600);
      } catch (error) {
        console.error('Error fetching renters:', error);
        setLoading(false);
      }
    };
    
    fetchRenters();
  }, [db]);
  
  const resetForm = () => {
    setNewRenter({
      name: '',
      email: '',
      contact: '',
      address: '',
      password: '',
      confirmPassword: '',
      status: 'active',
    });
    setFormErrors({});
    setSubmitError('');
  };
  
  const resetEditForm = () => {
    setEditRenter({
      id: '',
      name: '',
      email: '',
      contact: '',
      address: '',
      status: 'active',
    });
    setEditFormErrors({});
    setEditError('');
  };
  
  const validateForm = () => {
    const errors = {};
    
    if (!newRenter.name?.trim()) errors.name = 'Name is required';
    if (!newRenter.email?.trim()) errors.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(newRenter.email)) errors.email = 'Email is invalid';
    
    if (!newRenter.contact?.trim()) errors.contact = 'Contact number is required';
    if (!newRenter.address?.trim()) errors.address = 'Address is required';
    
    if (!newRenter.password) errors.password = 'Password is required';
    else if (newRenter.password.length < 6) errors.password = 'Password must be at least 6 characters';
    
    if (newRenter.password !== newRenter.confirmPassword) {
      errors.confirmPassword = 'Passwords do not match';
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };
  
  const validateEditForm = () => {
    const errors = {};
    
    if (!editRenter.name?.trim()) errors.name = 'Name is required';
    if (!editRenter.contact?.trim()) errors.contact = 'Contact number is required';
    if (!editRenter.address?.trim()) errors.address = 'Address is required';
    
    setEditFormErrors(errors);
    return Object.keys(errors).length === 0;
  };
  
  const handleAddRenter = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setSubmitLoading(true);
    setSubmitError('');
    
    try {
      // Create user in Firebase Authentication
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        newRenter.email,
        newRenter.password
      );
      
      // Send email verification
      await sendEmailVerification(userCredential.user);
      
      // Add user data to Firestore
      await addDoc(collection(db, 'users'), {
        uid: userCredential.user.uid,
        name: newRenter.name,
        email: newRenter.email,
        contact: newRenter.contact,
        address: newRenter.address,
        role: 'customer',
        status: newRenter.status,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
      
      // Add the new renter to the local state
      setRenters([...renters, {
        id: userCredential.user.uid,
        name: newRenter.name,
        email: newRenter.email,
        contact: newRenter.contact,
        address: newRenter.address,
        role: 'customer',
        status: newRenter.status,
      }]);
      
      // Close modal and reset form
      setShowAddModal(false);
      resetForm();
      
    } catch (error) {
      console.error('Error adding renter:', error);
      let errorMessage = 'Failed to create account';
      
      if (error.code === 'auth/email-already-in-use') {
        errorMessage = 'Email is already in use';
      }
      
      setSubmitError(errorMessage);
    } finally {
      setSubmitLoading(false);
    }
  };
  
  const handleEditClick = (renter) => {
    setEditRenter({
      id: renter.id,
      name: renter.name || '',
      email: renter.email || '',
      contact: renter.contact || '',
      address: renter.address || '',
      status: renter.status || 'active',
    });
    setShowEditModal(true);
  };
  
  const handleViewClick = (renter) => {
    setSelectedRenter(renter);
    setActiveTab('info');
    setShowViewModal(true);
  };
  
  const handleUpdateRenter = async (e) => {
    e.preventDefault();
    
    if (!validateEditForm()) return;
    
    setEditLoading(true);
    setEditError('');
    
    try {
      // Update renter in Firestore
      const renterRef = doc(db, 'users', editRenter.id);
      await updateDoc(renterRef, {
        name: editRenter.name,
        contact: editRenter.contact,
        address: editRenter.address,
        status: editRenter.status,
        updatedAt: serverTimestamp(),
      });
      
      // Update local state
      setRenters(renters.map(renter => 
        renter.id === editRenter.id ? { ...renter, ...editRenter } : renter
      ));
      
      // Close modal and reset form
      setShowEditModal(false);
      resetEditForm();
      
    } catch (error) {
      console.error('Error updating renter:', error);
      setEditError('Failed to update customer: ' + error.message);
    } finally {
      setEditLoading(false);
    }
  };
  
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewRenter({
      ...newRenter,
      [name]: value
    });
    
    // Clear error for this field when user types
    if (formErrors[name]) {
      setFormErrors({
        ...formErrors,
        [name]: ''
      });
    }
  };
  
  const handleEditInputChange = (e) => {
    const { name, value } = e.target;
    setEditRenter({
      ...editRenter,
      [name]: value
    });
    
    // Clear error for this field when user types
    if (editFormErrors[name]) {
      setEditFormErrors({
        ...editFormErrors,
        [name]: ''
      });
    }
  };
  
  const handleDeleteClick = (renter) => {
    setSelectedRenter(renter);
    setShowDeleteModal(true);
  };
  
  const confirmDelete = async () => {
    if (!selectedRenter) return;
    
    try {
      // Delete from Firestore
      const userQuery = query(
        collection(db, 'users'), 
        where('email', '==', selectedRenter.email)
      );
      const querySnapshot = await getDocs(userQuery);
      
      if (!querySnapshot.empty) {
        await deleteDoc(doc(db, 'users', querySnapshot.docs[0].id));
      }
      
      // Update local state
      setRenters(renters.filter(renter => renter.id !== selectedRenter.id));
      
      // Close modal
      setShowDeleteModal(false);
      setSelectedRenter(null);
      
    } catch (error) {
      console.error('Error deleting renter:', error);
    }
  };
  
  // Filter renters based on search term
  const filteredRenters = renters.filter(renter => 
    renter.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    renter.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    renter.contact?.includes(searchTerm)
  );
  
  // Get rental history for selected renter
  const getRentalHistory = (renterId) => {
    return rentalHistory.filter(rental => rental.renterId === renterId);
  };
  
  // Get ID documents for selected renter
  const getCustomerIDs = (renterId) => {
    return customerIDs.filter(id => id.renterId === renterId);
  };
  
  // Get payment methods for selected renter
  const getPaymentMethods = (renterId) => {
    return paymentMethods.filter(payment => payment.renterId === renterId);
  };
  
  // Format date for display
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };
  
  return (
    <div className="flex h-screen bg-pattern">
      <Sidebar currentPage="renters" />
      
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
              <h1 className="text-xl font-semibold text-gray-800">Customers</h1>
            </div>
            
            <div className="flex items-center space-x-4">
              <button 
                onClick={() => {
                  resetForm();
                  setShowAddModal(true);
                }}
                className="btn-primary px-4 py-2 rounded-md shadow-sm flex items-center space-x-2"
              >
                <UserPlus size={18} />
                <span className="hidden md:inline">Add Customer</span>
              </button>
            </div>
          </div>
        </header>
        
        <main className="flex-1 overflow-x-hidden overflow-y-auto custom-scrollbar">
          <div className="container px-4 sm:px-6 py-8 mx-auto">
            {/* Dashboard Header */}
            <div className="mb-6 animate-fadeIn">
              <h2 className="text-2xl font-bold text-gray-800 mb-2">Customer Management</h2>
              <p className="text-gray-500">View and manage customers who rent vehicles</p>
            </div>
            
            {/* Search and Filter */}
            <div className="mb-6 animate-fadeIn">
              <div className="card-glassmorphism rounded-lg p-4">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="relative flex-1">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Search size={18} className="text-gray-400" />
                    </div>
                    <input
                      type="text"
                      placeholder="Search by name, email or contact..."
                      className="input-field w-full pl-10 pr-4 py-2 rounded-md focus:outline-none"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </div>
                  
                  <div className="flex items-center">
                    <button className="p-2 rounded-md text-gray-500 hover:text-gray-700 hover:bg-gray-100 focus:outline-none">
                      <Filter size={18} />
                    </button>
                    <span className="mx-2 text-sm text-gray-500">
                      {filteredRenters.length} {filteredRenters.length === 1 ? 'customer' : 'customers'} found
                    </span>
                  </div>
                </div>
              </div>
            </div>
            
            {loading ? (
              <div className="flex justify-center my-10">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-700"></div>
              </div>
            ) : (
              <div className="card-glassmorphism rounded-lg overflow-hidden animate-fadeIn shadow-sm">
                {filteredRenters.length > 0 ? (
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead>
                        <tr className="bg-gray-50 bg-opacity-80">
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Customer
                          </th>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Contact Information
                          </th>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Address
                          </th>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Status
                          </th>
                          <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Actions
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200">
                        {filteredRenters.map((renter, index) => (
                          <tr key={renter.id} className="renter-row" style={{ animationDelay: `${index * 50}ms` }}>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="flex items-center">
                                <div className="avatar flex-shrink-0 h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden shadow-sm">
                                  {renter.profileImage ? (
                                    <img src={renter.profileImage} alt={renter.name} className="h-full w-full object-cover" />
                                  ) : (
                                    <span className="text-gray-600 font-medium">
                                      {renter.name ? renter.name.charAt(0).toUpperCase() : "?"}
                                    </span>
                                  )}
                                </div>
                                <div className="ml-4">
                                  <div className="text-sm font-semibold text-gray-900">{renter.name}</div>
                                  <div className="text-xs text-gray-500 flex items-center mt-1">
                                    <Car size={12} className="mr-1" />
                                    Customer
                                  </div>
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="flex flex-col">
                                <div className="text-sm text-gray-900 flex items-center">
                                  <Mail size={14} className="mr-2 text-gray-400" />
                                  {renter.email}
                                </div>
                                <div className="text-sm text-gray-500 flex items-center mt-1">
                                  <Phone size={14} className="mr-2 text-gray-400" />
                                  {renter.contact || 'No contact'}
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-4">
                              <div className="text-sm text-gray-900 flex items-start">
                                <MapPin size={14} className="mr-2 text-gray-400 mt-1 flex-shrink-0" />
                                <span className="line-clamp-2">{renter.address || 'No address'}</span>
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                renter.status === 'active' 
                                  ? 'bg-green-100 text-green-800' 
                                  : 'bg-gray-100 text-gray-800'
                              }`}>
                                {renter.status === 'active' ? 'Active' : 'Inactive'}
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-right">
                              <div className="flex justify-end items-center space-x-2">
                                <button
                                  className="p-1 rounded-full text-blue-500 hover:text-blue-700 hover:bg-blue-50 focus:outline-none transition-colors"
                                  onClick={() => handleViewClick(renter)}
                                  title="View credentials"
                                >
                                  <Eye size={16} />
                                </button>
                                <button
                                  className="p-1 rounded-full text-gray-500 hover:text-gray-700 hover:bg-gray-100 focus:outline-none transition-colors"
                                  onClick={() => handleEditClick(renter)}
                                  title="Edit customer"
                                >
                                  <Edit size={16} />
                                </button>
                                <button
                                  className="p-1 rounded-full text-red-500 hover:text-red-700 hover:bg-red-50 focus:outline-none transition-colors"
                                  onClick={() => handleDeleteClick(renter)}
                                  title="Delete customer"
                                >
                                  <Trash2 size={16} />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="py-12 text-center">
                    <div className="mx-auto w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mb-4">
                      <UserCircle size={32} className="text-gray-400" />
                    </div>
                    <h3 className="text-lg font-medium text-gray-900 mb-1">No customers found</h3>
                    <p className="text-gray-500 mb-6">
                      {searchTerm ? `No results for "${searchTerm}"` : 'No customers have been added yet'}
                    </p>
                    {!searchTerm && (
                      <button 
                        onClick={() => {
                          resetForm();
                          setShowAddModal(true);
                        }}
                        className="btn-primary px-4 py-2 rounded-md shadow-sm inline-flex items-center"
                      >
                        <UserPlus size={16} className="mr-2" />
                        Add Your First Customer
                      </button>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        </main>
      </div>
      
      {/* Add Renter Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center">
            <div className="fixed inset-0 bg-black bg-opacity-40 backdrop-blur-sm transition-opacity" 
                 onClick={() => setShowAddModal(false)}></div>
            
            <div className="modal-glassmorphism rounded-lg overflow-hidden shadow-xl transform transition-all w-full max-w-lg z-10">
              <div className="px-6 py-6">
                <div className="flex justify-between items-center mb-6">
                  <div className="flex items-center">
                    <UserPlus size={24} className="text-gray-700 mr-3" />
                    <h3 className="text-xl font-semibold text-gray-800">Add New Customer</h3>
                  </div>
                  <button
                    onClick={() => setShowAddModal(false)}
                    className="p-1 rounded-full text-gray-400 hover:text-gray-600 hover:bg-gray-100 focus:outline-none transition-colors"
                  >
                    <X size={20} />
                  </button>
                </div>
                
                {submitError && (
                  <div className="mb-6 bg-red-50 border-l-4 border-red-400 p-4 rounded">
                    <div className="flex items-start">
                      <AlertTriangle size={20} className="text-red-500 mr-3 flex-shrink-0 mt-0.5" />
                      <p className="text-sm text-red-600">{submitError}</p>
                    </div>
                  </div>
                )}
                
                <form onSubmit={handleAddRenter} className="space-y-5">
                  <div>
                    <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <UserCircle size={16} className="text-gray-400" />
                      </div>
                      <input
                        type="text"
                        id="name"
                        name="name"
                        value={newRenter.name}
                        onChange={handleInputChange}
                        className={`input-field pl-10 pr-3 py-2 block w-full rounded-md focus:outline-none ${
                          formErrors.name ? 'border-red-300 bg-red-50' : ''
                        }`}
                        placeholder="John Doe"
                      />
                    </div>
                    {formErrors.name && <p className="mt-1 text-xs text-red-600">{formErrors.name}</p>}
                  </div>
                  
                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Mail size={16} className="text-gray-400" />
                      </div>
                      <input
                        type="email"
                        id="email"
                        name="email"
                        value={newRenter.email}
                        onChange={handleInputChange}
                        className={`input-field pl-10 pr-3 py-2 block w-full rounded-md focus:outline-none ${
                          formErrors.email ? 'border-red-300 bg-red-50' : ''
                        }`}
                        placeholder="johndoe@example.com"
                      />
                    </div>
                    {formErrors.email && <p className="mt-1 text-xs text-red-600">{formErrors.email}</p>}
                  </div>
                  
                  <div>
                    <label htmlFor="contact" className="block text-sm font-medium text-gray-700 mb-1">Contact Number</label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Phone size={16} className="text-gray-400" />
                      </div>
                      <input
                        type="text"
                        id="contact"
                        name="contact"
                        value={newRenter.contact}
                        onChange={handleInputChange}
                        className={`input-field pl-10 pr-3 py-2 block w-full rounded-md focus:outline-none ${
                          formErrors.contact ? 'border-red-300 bg-red-50' : ''
                        }`}
                        placeholder="+1 (555) 000-0000"
                      />
                    </div>
                    {formErrors.contact && <p className="mt-1 text-xs text-red-600">{formErrors.contact}</p>}
                  </div>
                  
                  <div>
                    <label htmlFor="address" className="block text-sm font-medium text-gray-700 mb-1">Address</label>
                    <div className="relative">
                      <div className="absolute top-3 left-3 flex items-start pointer-events-none">
                        <MapPin size={16} className="text-gray-400" />
                      </div>
                      <textarea
                        id="address"
                        name="address"
                        rows="2"
                        value={newRenter.address}
                        onChange={handleInputChange}
                        className={`input-field pl-10 pr-3 py-2 block w-full rounded-md focus:outline-none ${
                          formErrors.address ? 'border-red-300 bg-red-50' : ''
                        }`}
                        placeholder="Enter full address"
                      ></textarea>
                    </div>
                    {formErrors.address && <p className="mt-1 text-xs text-red-600">{formErrors.address}</p>}
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div>
                      <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">Password</label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <Lock size={16} className="text-gray-400" />
                        </div>
                        <input
                          type="password"
                          id="password"
                          name="password"
                          value={newRenter.password}
                          onChange={handleInputChange}
                          className={`input-field pl-10 pr-3 py-2 block w-full rounded-md focus:outline-none ${
                            formErrors.password ? 'border-red-300 bg-red-50' : ''
                          }`}
                          placeholder="••••••"
                        />
                      </div>
                      {formErrors.password && <p className="mt-1 text-xs text-red-600">{formErrors.password}</p>}
                    </div>
                    
                    <div>
                      <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1">Confirm Password</label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <Lock size={16} className="text-gray-400" />
                        </div>
                        <input
                          type="password"
                          id="confirmPassword"
                          name="confirmPassword"
                          value={newRenter.confirmPassword}
                          onChange={handleInputChange}
                          className={`input-field pl-10 pr-3 py-2 block w-full rounded-md focus:outline-none ${
                            formErrors.confirmPassword ? 'border-red-300 bg-red-50' : ''
                          }`}
                          placeholder="••••••"/>
                      </div>
                      {formErrors.confirmPassword && <p className="mt-1 text-xs text-red-600">{formErrors.confirmPassword}</p>}
                    </div>
                  </div>
                  
                  <div>
                    <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-1">Account Status</label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Shield size={16} className="text-gray-400" />
                      </div>
                      <select
                        id="status"
                        name="status"
                        value={newRenter.status}
                        onChange={handleInputChange}
                        className="input-field pl-10 pr-3 py-2 block w-full rounded-md focus:outline-none"
                      >
                        <option value="active">Active</option>
                        <option value="inactive">Inactive</option>
                      </select>
                    </div>
                  </div>
                  
                  <div className="flex justify-end space-x-3 pt-5">
                    <button
                      type="button"
                      onClick={() => setShowAddModal(false)}
                      className="btn-outline px-4 py-2 rounded-md text-sm font-medium"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="btn-primary px-6 py-2 rounded-md text-sm font-medium flex items-center"
                      disabled={submitLoading}
                    >
                      {submitLoading ? (
                        <>
                          <div className="animate-spin mr-2 h-4 w-4 border-2 border-white border-t-transparent rounded-full"></div>
                          <span>Creating...</span>
                        </>
                      ) : (
                        <>
                          <CheckCircle size={16} className="mr-2" />
                          <span>Add Customer</span>
                        </>
                      )}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* Edit Renter Modal */}
      {showEditModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center">
            <div className="fixed inset-0 bg-black bg-opacity-40 backdrop-blur-sm transition-opacity" 
                 onClick={() => setShowEditModal(false)}></div>
            
            <div className="modal-glassmorphism rounded-lg overflow-hidden shadow-xl transform transition-all w-full max-w-lg z-10">
              <div className="px-6 py-6">
                <div className="flex justify-between items-center mb-6">
                  <div className="flex items-center">
                    <Edit size={24} className="text-gray-700 mr-3" />
                    <h3 className="text-xl font-semibold text-gray-800">Edit Customer</h3>
                  </div>
                  <button
                    onClick={() => setShowEditModal(false)}
                    className="p-1 rounded-full text-gray-400 hover:text-gray-600 hover:bg-gray-100 focus:outline-none transition-colors"
                  >
                    <X size={20} />
                  </button>
                </div>
                
                {editError && (
                  <div className="mb-6 bg-red-50 border-l-4 border-red-400 p-4 rounded">
                    <div className="flex items-start">
                      <AlertTriangle size={20} className="text-red-500 mr-3 flex-shrink-0 mt-0.5" />
                      <p className="text-sm text-red-600">{editError}</p>
                    </div>
                  </div>
                )}
                
                <form onSubmit={handleUpdateRenter} className="space-y-5">
                  <div>
                    <label htmlFor="edit-name" className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <UserCircle size={16} className="text-gray-400" />
                      </div>
                      <input
                        type="text"
                        id="edit-name"
                        name="name"
                        value={editRenter.name}
                        onChange={handleEditInputChange}
                        className={`input-field pl-10 pr-3 py-2 block w-full rounded-md focus:outline-none ${
                          editFormErrors.name ? 'border-red-300 bg-red-50' : ''
                        }`}
                        placeholder="John Doe"
                      />
                    </div>
                    {editFormErrors.name && <p className="mt-1 text-xs text-red-600">{editFormErrors.name}</p>}
                  </div>
                  
                  <div>
                    <label htmlFor="edit-email" className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Mail size={16} className="text-gray-400" />
                      </div>
                      <input
                        type="email"
                        id="edit-email"
                        name="email"
                        value={editRenter.email}
                        className="input-field pl-10 pr-3 py-2 block w-full rounded-md focus:outline-none bg-gray-100"
                        disabled
                      />
                    </div>
                    <p className="mt-1 text-xs text-gray-500">Email cannot be changed</p>
                  </div>
                  
                  <div>
                    <label htmlFor="edit-contact" className="block text-sm font-medium text-gray-700 mb-1">Contact Number</label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Phone size={16} className="text-gray-400" />
                      </div>
                      <input
                        type="text"
                        id="edit-contact"
                        name="contact"
                        value={editRenter.contact}
                        onChange={handleEditInputChange}
                        className={`input-field pl-10 pr-3 py-2 block w-full rounded-md focus:outline-none ${
                          editFormErrors.contact ? 'border-red-300 bg-red-50' : ''
                        }`}
                        placeholder="+1 (555) 000-0000"
                      />
                    </div>
                    {editFormErrors.contact && <p className="mt-1 text-xs text-red-600">{editFormErrors.contact}</p>}
                  </div>
                  
                  <div>
                    <label htmlFor="edit-address" className="block text-sm font-medium text-gray-700 mb-1">Address</label>
                    <div className="relative">
                      <div className="absolute top-3 left-3 flex items-start pointer-events-none">
                        <MapPin size={16} className="text-gray-400" />
                      </div>
                      <textarea
                        id="edit-address"
                        name="address"
                        rows="2"
                        value={editRenter.address}
                        onChange={handleEditInputChange}
                        className={`input-field pl-10 pr-3 py-2 block w-full rounded-md focus:outline-none ${
                          editFormErrors.address ? 'border-red-300 bg-red-50' : ''
                        }`}
                        placeholder="Enter full address"
                      ></textarea>
                    </div>
                    {editFormErrors.address && <p className="mt-1 text-xs text-red-600">{editFormErrors.address}</p>}
                  </div>
                  
                  <div>
                    <label htmlFor="edit-status" className="block text-sm font-medium text-gray-700 mb-1">Account Status</label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Shield size={16} className="text-gray-400" />
                      </div>
                      <select
                        id="edit-status"
                        name="status"
                        value={editRenter.status}
                        onChange={handleEditInputChange}
                        className="input-field pl-10 pr-3 py-2 block w-full rounded-md focus:outline-none"
                      >
                        <option value="active">Active</option>
                        <option value="inactive">Inactive</option>
                      </select>
                    </div>
                  </div>
                  
                  <div className="flex justify-end space-x-3 pt-5">
                    <button
                      type="button"
                      onClick={() => setShowEditModal(false)}
                      className="btn-outline px-4 py-2 rounded-md text-sm font-medium"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="btn-primary px-6 py-2 rounded-md text-sm font-medium flex items-center"
                      disabled={editLoading}
                    >
                      {editLoading ? (
                        <>
                          <div className="animate-spin mr-2 h-4 w-4 border-2 border-white border-t-transparent rounded-full"></div>
                          <span>Updating...</span>
                        </>
                      ) : (
                        <>
                          <Save size={16} className="mr-2" />
                          <span>Save Changes</span>
                        </>
                      )}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* View Customer Credentials Modal */}
      {showViewModal && selectedRenter && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center">
            <div className="fixed inset-0 bg-black bg-opacity-40 backdrop-blur-sm transition-opacity" 
                 onClick={() => setShowViewModal(false)}></div>
            
            <div className="modal-glassmorphism rounded-lg overflow-hidden shadow-xl transform transition-all w-full max-w-4xl z-10">
              <div className="px-6 py-6">
                <div className="flex justify-between items-center mb-6">
                  <div className="flex items-center">
                    <UserCircle size={24} className="text-gray-700 mr-3" />
                    <h3 className="text-xl font-semibold text-gray-800">Customer Credentials</h3>
                  </div>
                  <button
                    onClick={() => setShowViewModal(false)}
                    className="p-1 rounded-full text-gray-400 hover:text-gray-600 hover:bg-gray-100 focus:outline-none transition-colors"
                  >
                    <X size={20} />
                  </button>
                </div>
                
                <div className="mb-6">
                  <div className="flex flex-col md:flex-row">
                    <div className="w-full md:w-1/3 pr-0 md:pr-4 mb-4 md:mb-0">
                      <div className="bg-gray-50 rounded-lg p-4 h-full">
                        <div className="flex flex-col items-center">
                          <div className="avatar h-20 w-20 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden shadow-sm mb-4">
                            {selectedRenter.profileImage ? (
                              <img src={selectedRenter.profileImage} alt={selectedRenter.name} className="h-full w-full object-cover" />
                            ) : (
                              <span className="text-3xl text-gray-600 font-medium">
                                {selectedRenter.name ? selectedRenter.name.charAt(0).toUpperCase() : "?"}
                              </span>
                            )}
                          </div>
                          <h4 className="text-lg font-medium">{selectedRenter.name}</h4>
                          <span className={`status-pill ${selectedRenter.status === 'active' ? 'active' : 'inactive'} mt-1`}>
                            {selectedRenter.status === 'active' ? 'Active' : 'Inactive'}
                          </span>
                          
                          <div className="mt-6 w-full space-y-3">
                            <div className="flex items-center text-sm">
                              <Mail size={16} className="text-gray-400 mr-3" />
                              <span className="text-gray-800">{selectedRenter.email}</span>
                            </div>
                            <div className="flex items-center text-sm">
                              <Phone size={16} className="text-gray-400 mr-3" />
                              <span className="text-gray-800">{selectedRenter.contact || 'No contact'}</span>
                            </div>
                            <div className="flex items-start text-sm">
                              <MapPin size={16} className="text-gray-400 mr-3 mt-0.5" />
                              <span className="text-gray-800">{selectedRenter.address || 'No address'}</span>
                            </div>
                          </div>
                          
                          <div className="mt-6 w-full border-t border-gray-200 pt-4">
                            <div className="flex justify-between text-sm text-gray-500">
                              <span>Created:</span>
                              <span>{selectedRenter.createdAt ? new Date(selectedRenter.createdAt.seconds * 1000).toLocaleDateString() : 'N/A'}</span>
                            </div>
                            <div className="flex justify-between text-sm text-gray-500 mt-1">
                              <span>Last Updated:</span>
                              <span>{selectedRenter.updatedAt ? new Date(selectedRenter.updatedAt.seconds * 1000).toLocaleDateString() : 'N/A'}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="w-full md:w-2/3">
                      {/* Tabs for different credential types */}
                      <div className="border-b border-gray-200 mb-4">
                        <div className="flex space-x-6">
                          <button 
                            className={`tab-button py-2 text-sm ${activeTab === 'info' ? 'active' : ''}`}
                            onClick={() => setActiveTab('info')}
                          >
                            ID Documents
                          </button>
                          <button 
                            className={`tab-button py-2 text-sm ${activeTab === 'payment' ? 'active' : ''}`}
                            onClick={() => setActiveTab('payment')}
                          >
                            Payment Methods
                          </button>
                          <button 
                            className={`tab-button py-2 text-sm ${activeTab === 'history' ? 'active' : ''}`}
                            onClick={() => setActiveTab('history')}
                          >
                            Rental History
                          </button>
                        </div>
                      </div>
                      
                      {/* ID Documents Tab */}
                      {activeTab === 'info' && (
                        <div className="animate-fadeIn">
                          <h4 className="text-lg font-medium text-gray-800 mb-4">Identification Documents</h4>
                          
                          {getCustomerIDs(selectedRenter.demoId).length > 0 ? (
                            <div className="space-y-4">
                              {getCustomerIDs(selectedRenter.demoId).map((id) => (
                                <div key={id.id} className="credential-card bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
                                  <div className="flex justify-between items-start">
                                    <div className="flex items-center">
                                      <div className="p-3 rounded-full bg-blue-50 mr-3">
                                        <FileText size={18} className="text-blue-600" />
                                      </div>
                                      <div>
                                        <h5 className="font-medium text-gray-900">{id.type}</h5>
                                        <p className="text-sm text-gray-600">#{id.number}</p>
                                      </div>
                                    </div>
                                    <div className="verification-badge verified">
                                      <CheckCircle size={12} className="mr-1" />
                                      Verified
                                    </div>
                                  </div>
                                  
                                  <div className="mt-3 grid grid-cols-1 md:grid-cols-2 gap-2">
                                    <div className="text-sm">
                                      <span className="text-gray-500">Issued Date:</span>
                                      <span className="ml-2 text-gray-800">{formatDate(id.issuedDate)}</span>
                                    </div>
                                    <div className="text-sm">
                                      <span className="text-gray-500">Expiry Date:</span>
                                      <span className="ml-2 text-gray-800">{formatDate(id.expiryDate)}</span>
                                    </div>
                                    <div className="text-sm">
                                      <span className="text-gray-500">Verification Date:</span>
                                      <span className="ml-2 text-gray-800">{formatDate(id.verificationDate)}</span>
                                    </div>
                                  </div>
                                  
                                  <div className="mt-3 pt-2 border-t border-gray-100 flex justify-between">
                                    <span className="text-xs text-gray-500">Verified by Admin</span>
                                    <button className="text-xs text-blue-600 hover:text-blue-800 font-medium">View Document</button>
                                  </div>
                                </div>
                              ))}
                            </div>
                          ) : (
                            <div className="text-center py-10 bg-gray-50 rounded-lg">
                              <div className="mx-auto w-14 h-14 rounded-full bg-gray-100 flex items-center justify-center mb-3">
                                <Key size={20} className="text-gray-400" />
                              </div>
                              <h5 className="text-gray-800 font-medium mb-1">No ID Documents</h5>
                              <p className="text-sm text-gray-500">This customer has not submitted any identification documents yet.</p>
                            </div>
                          )}
                        </div>
                      )}
                      
                      {/* Payment Methods Tab */}
                      {activeTab === 'payment' && (
                        <div className="animate-fadeIn">
                          <h4 className="text-lg font-medium text-gray-800 mb-4">Payment Methods</h4>
                          
                          {getPaymentMethods(selectedRenter.demoId).length > 0 ? (
                            <div className="space-y-4">
                              {getPaymentMethods(selectedRenter.demoId).map((payment) => (
                                <div key={payment.id} className="credential-card bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
                                  <div className="flex justify-between items-start">
                                    <div className="flex items-center">
                                      <div className="p-3 rounded-full bg-purple-50 mr-3">
                                        <CreditCard size={18} className="text-purple-600" />
                                      </div>
                                      <div>
                                        <h5 className="font-medium text-gray-900">{payment.cardType}</h5>
                                        <p className="text-sm text-gray-600">**** **** **** {payment.lastFourDigits}</p>
                                      </div>
                                    </div>
                                    {payment.isDefault && (
                                      <div className="verification-badge verified">
                                        <CheckCircle size={12} className="mr-1" />
                                        Default
                                      </div>
                                    )}
                                  </div>
                                  
                                  <div className="mt-3">
                                    <div className="text-sm">
                                      <span className="text-gray-500">Expiry Date:</span>
                                      <span className="ml-2 text-gray-800">{payment.expiryDate}</span>
                                    </div>
                                  </div>
                                </div>
                              ))}
                            </div>
                          ) : (
                            <div className="text-center py-10 bg-gray-50 rounded-lg">
                              <div className="mx-auto w-14 h-14 rounded-full bg-gray-100 flex items-center justify-center mb-3">
                                <CreditCard size={20} className="text-gray-400" />
                              </div>
                              <h5 className="text-gray-800 font-medium mb-1">No Payment Methods</h5>
                              <p className="text-sm text-gray-500">This customer has not added any payment methods yet.</p>
                            </div>
                          )}
                        </div>
                      )}
                      
                      {/* Rental History Tab */}
                      {activeTab === 'history' && (
                        <div className="animate-fadeIn">
                          <h4 className="text-lg font-medium text-gray-800 mb-4">Rental History</h4>
                          
                          {getRentalHistory(selectedRenter.demoId).length > 0 ? (
                            <div className="space-y-4">
                              {getRentalHistory(selectedRenter.demoId).map((rental) => (
                                <div key={rental.id} className="credential-card bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
                                  <div className="flex justify-between items-start">
                                    <div className="flex items-center">
                                      <div className="p-3 rounded-full bg-green-50 mr-3">
                                        <Car size={18} className="text-green-600" />
                                      </div>
                                      <div>
                                        <h5 className="font-medium text-gray-900">{rental.carModel}</h5>
                                        <p className="text-sm text-gray-600">{rental.licensePlate}</p>
                                      </div>
                                    </div>
                                    <div className={`status-pill ${rental.status}`}>
                                      {rental.status === 'active' && <Clock size={12} className="mr-1" />}
                                      {rental.status === 'completed' && <CheckCircle size={12} className="mr-1" />}
                                      {rental.status.charAt(0).toUpperCase() + rental.status.slice(1)}
                                    </div>
                                  </div>
                                  
                                  <div className="mt-3 grid grid-cols-1 md:grid-cols-2 gap-2">
                                    <div className="text-sm">
                                      <span className="text-gray-500">Start Date:</span>
                                      <span className="ml-2 text-gray-800">{formatDate(rental.startDate)}</span>
                                    </div>
                                    <div className="text-sm">
                                      <span className="text-gray-500">End Date:</span>
                                      <span className="ml-2 text-gray-800">{formatDate(rental.endDate)}</span>
                                    </div>
                                    <div className="text-sm md:col-span-2">
                                      <span className="text-gray-500">Total Amount:</span>
                                      <span className="ml-2 text-gray-800">₱{rental.totalAmount.toLocaleString()}</span>
                                    </div>
                                  </div>
                                  
                                  <div className="mt-3 pt-2 border-t border-gray-100 flex justify-end">
                                    <button className="text-xs text-blue-600 hover:text-blue-800 font-medium">View Details</button>
                                  </div>
                                </div>
                              ))}
                            </div>
                          ) : (
                            <div className="text-center py-10 bg-gray-50 rounded-lg">
                              <div className="mx-auto w-14 h-14 rounded-full bg-gray-100 flex items-center justify-center mb-3">
                                <History size={20} className="text-gray-400" />
                              </div>
                              <h5 className="text-gray-800 font-medium mb-1">No Rental History</h5>
                              <p className="text-sm text-gray-500">This customer has not rented any vehicles yet.</p>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen px-4 text-center">
            <div className="fixed inset-0 bg-black bg-opacity-40 backdrop-blur-sm transition-opacity" 
                 onClick={() => setShowDeleteModal(false)}></div>
            
            <div className="modal-glassmorphism rounded-lg overflow-hidden shadow-xl transform transition-all max-w-md w-full z-10">
              <div className="px-6 py-6">
                <div className="flex items-start mb-5">
                  <div className="flex-shrink-0 bg-red-50 rounded-full p-3">
                    <Trash2 size={24} className="text-red-500" />
                  </div>
                  <div className="ml-4 text-left">
                    <h3 className="text-lg font-semibold text-gray-900">Delete Customer</h3>
                    <p className="mt-2 text-sm text-gray-500">
                      Are you sure you want to delete <span className="font-medium">{selectedRenter?.name}</span>? This action cannot be undone and will remove all data associated with this customer.
                    </p>
                  </div>
                </div>
                
                <div className="flex justify-end space-x-3">
                  <button
                    type="button"
                    onClick={() => setShowDeleteModal(false)}
                    className="btn-outline px-4 py-2 rounded-md text-sm font-medium"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    className="btn-danger px-4 py-2 rounded-md text-sm font-medium flex items-center"
                    onClick={confirmDelete}
                  >
                    <Trash2 size={16} className="mr-2" />
                    Delete Customer
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Renters;