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
  Save,
  Eye,
  FileText,
  Clock,
  Check,
  XCircle,
  ChevronDown,
  Car
} from 'lucide-react';

const Owners = ({ user, db: propDb }) => {
  const [owners, setOwners] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [selectedOwner, setSelectedOwner] = useState(null);
  const [selectedDocument, setSelectedDocument] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [statusFilter, setStatusFilter] = useState('all');
  
  // Owner form states
  const [newOwner, setNewOwner] = useState({
    name: '',
    email: '',
    contact: '',
    address: '',
    password: '',
    confirmPassword: '',
    status: 'active',
  });
  
  const [editOwner, setEditOwner] = useState({
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
  
  const auth = getAuth();
  const db = propDb || getFirestore();
  
  const toggleSidebar = () => {
    setIsSidebarCollapsed(!isSidebarCollapsed);
  };
  
  // Sample car data
  const [ownerCars, setOwnerCars] = useState([
    {
      id: 'car1',
      ownerId: 'owner1',
      make: 'Toyota',
      model: 'Camry',
      year: 2022,
      licensePlate: 'ABC-123',
      color: 'Silver',
      status: 'approved',
      documents: [
        { id: 'doc1', type: 'Registration', fileName: 'car_registration.pdf', uploadDate: '2025-01-15', status: 'approved' },
        { id: 'doc2', type: 'Insurance', fileName: 'insurance_policy.pdf', uploadDate: '2025-01-15', status: 'approved' }
      ]
    },
    {
      id: 'car2',
      ownerId: 'owner2',
      make: 'Honda',
      model: 'Civic',
      year: 2021,
      licensePlate: 'XYZ-789',
      color: 'Blue',
      status: 'pending',
      documents: [
        { id: 'doc3', type: 'Registration', fileName: 'car_registration.pdf', uploadDate: '2025-02-20', status: 'pending' },
        { id: 'doc4', type: 'Insurance', fileName: 'insurance_policy.pdf', uploadDate: '2025-02-20', status: 'pending' }
      ]
    },
    {
      id: 'car3',
      ownerId: 'owner3',
      make: 'Tesla',
      model: 'Model 3',
      year: 2023,
      licensePlate: 'EV-456',
      color: 'Red',
      status: 'declined',
      documents: [
        { id: 'doc5', type: 'Registration', fileName: 'car_registration.pdf', uploadDate: '2025-03-10', status: 'declined', reason: 'Document expired' },
        { id: 'doc6', type: 'Insurance', fileName: 'insurance_policy.pdf', uploadDate: '2025-03-10', status: 'declined', reason: 'Insufficient coverage' }
      ]
    }
  ]);
  
  // Add custom styles for the owners page
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
      
      .owner-row {
        transition: all 0.2s ease;
      }
      
      .owner-row:hover {
        background-color: rgba(243, 244, 246, 0.7);
      }
      
      .avatar {
        transition: all 0.2s ease;
      }
      
      .owner-row:hover .avatar {
        transform: scale(1.05);
      }
      
      .notification {
        position: fixed;
        bottom: 20px;
        right: 20px;
        padding: 1rem;
        border-radius: 0.5rem;
        z-index: 50;
        animation: slideUp 0.3s ease-out forwards, fadeOut 3s ease-in 1s forwards;
      }
      
      @keyframes fadeOut {
        from { opacity: 1; }
        to { opacity: 0; }
      }
      
      .status-badge {
        display: inline-flex;
        align-items: center;
        padding: 0.25rem 0.75rem;
        border-radius: 9999px;
        font-size: 0.75rem;
        font-weight: 600;
      }
      
      .status-badge.approved {
        background-color: rgba(16, 185, 129, 0.1);
        color: rgb(16, 185, 129);
      }
      
      .status-badge.pending {
        background-color: rgba(245, 158, 11, 0.1);
        color: rgb(245, 158, 11);
      }
      
      .status-badge.declined {
        background-color: rgba(239, 68, 68, 0.1);
        color: rgb(239, 68, 68);
      }
      
      .document-card {
        transition: all 0.2s ease;
      }
      
      .document-card:hover {
        transform: translateY(-2px);
        box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.1);
      }
      
      .tab-button {
        transition: all 0.2s ease;
      }
      
      .tab-button.active {
        border-bottom: 2px solid #2d3748;
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
  
  // Fetch owners on component mount
  useEffect(() => {
    const fetchOwners = async () => {
      try {
        if (!db) return;
        
        const ownersQuery = query(collection(db, 'users'), where('role', '==', 'owner'));
        const querySnapshot = await getDocs(ownersQuery);
        
        const ownersData = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        
        // Assigning sample car data to owners for demo
        const updatedOwners = ownersData.map((owner, index) => {
          // Assign car data to first 3 owners for demo purposes
          if (index < 3) {
            return {
              ...owner,
              carId: ownerCars[index].id
            };
          }
          return owner;
        });
        
        setOwners(updatedOwners);
        
        // Add a small delay to demonstrate loading animation
        setTimeout(() => {
          setLoading(false);
        }, 600);
      } catch (error) {
        console.error('Error fetching owners:', error);
        setLoading(false);
      }
    };
    
    fetchOwners();
  }, [db]);
  
  const resetForm = () => {
    setNewOwner({
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
    setEditOwner({
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
    
    if (!newOwner.name?.trim()) errors.name = 'Name is required';
    if (!newOwner.email?.trim()) errors.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(newOwner.email)) errors.email = 'Email is invalid';
    
    if (!newOwner.contact?.trim()) errors.contact = 'Contact number is required';
    if (!newOwner.address?.trim()) errors.address = 'Address is required';
    
    if (!newOwner.password) errors.password = 'Password is required';
    else if (newOwner.password.length < 6) errors.password = 'Password must be at least 6 characters';
    
    if (newOwner.password !== newOwner.confirmPassword) {
      errors.confirmPassword = 'Passwords do not match';
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };
  
  const validateEditForm = () => {
    const errors = {};
    
    if (!editOwner.name?.trim()) errors.name = 'Name is required';
    if (!editOwner.contact?.trim()) errors.contact = 'Contact number is required';
    if (!editOwner.address?.trim()) errors.address = 'Address is required';
    
    setEditFormErrors(errors);
    return Object.keys(errors).length === 0;
  };
  
  const handleAddOwner = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setSubmitLoading(true);
    setSubmitError('');
    
    try {
      // Create user in Firebase Authentication
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        newOwner.email,
        newOwner.password
      );
      
      // Send email verification
      await sendEmailVerification(userCredential.user);
      
      // Add user data to Firestore
      const docRef = await addDoc(collection(db, 'users'), {
        uid: userCredential.user.uid,
        name: newOwner.name,
        email: newOwner.email,
        contact: newOwner.contact,
        address: newOwner.address,
        role: 'owner',
        status: newOwner.status,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
      
      // Add the new owner to the local state
      setOwners([...owners, {
        id: docRef.id,
        uid: userCredential.user.uid,
        name: newOwner.name,
        email: newOwner.email,
        contact: newOwner.contact,
        address: newOwner.address,
        role: 'owner',
        status: newOwner.status,
      }]);
      
      // Close modal and reset form
      setShowAddModal(false);
      resetForm();
      
      // Show success notification
      showNotification('Owner added successfully', 'success');
      
    } catch (error) {
      console.error('Error adding owner:', error);
      let errorMessage = 'Failed to create account';
      
      if (error.code === 'auth/email-already-in-use') {
        errorMessage = 'Email is already in use';
      }
      
      setSubmitError(errorMessage);
    } finally {
      setSubmitLoading(false);
    }
  };
  
  const handleEditClick = (owner) => {
    setEditOwner({
      id: owner.id,
      name: owner.name || '',
      email: owner.email || '',
      contact: owner.contact || '',
      address: owner.address || '',
      status: owner.status || 'active',
    });
    setShowEditModal(true);
  };

  const handleViewClick = (owner) => {
    setSelectedOwner(owner);
    setShowViewModal(true);
  };
  
  const handleUpdateOwner = async (e) => {
    e.preventDefault();
    
    if (!validateEditForm()) return;
    
    setEditLoading(true);
    setEditError('');
    
    try {
      // Update owner in Firestore
      const ownerRef = doc(db, 'users', editOwner.id);
      await updateDoc(ownerRef, {
        name: editOwner.name,
        contact: editOwner.contact,
        address: editOwner.address,
        status: editOwner.status,
        updatedAt: serverTimestamp(),
      });
      
      // Update owner in local state
      setOwners(owners.map(owner => 
        owner.id === editOwner.id ? { ...owner, ...editOwner } : owner
      ));
      
      // Close modal and reset form
      setShowEditModal(false);
      resetEditForm();
      
      // Show success notification
      showNotification('Owner updated successfully', 'success');
      
    } catch (error) {
      console.error('Error updating owner:', error);
      setEditError('Failed to update owner: ' + error.message);
    } finally {
      setEditLoading(false);
    }
  };
  
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewOwner({
      ...newOwner,
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
    setEditOwner({
      ...editOwner,
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
  
  const handleDeleteClick = (owner) => {
    setSelectedOwner(owner);
    setShowDeleteModal(true);
  };
  
  const confirmDelete = async () => {
    if (!selectedOwner) return;
    
    try {
      // Delete from Firestore
      await deleteDoc(doc(db, 'users', selectedOwner.id));
      
      // Update local state
      setOwners(owners.filter(owner => owner.id !== selectedOwner.id));
      
      // Close modal
      setShowDeleteModal(false);
      setSelectedOwner(null);
      
      // Show success notification
      showNotification('Owner deleted successfully', 'success');
      
    } catch (error) {
      console.error('Error deleting owner:', error);
      showNotification('Failed to delete owner', 'error');
    }
  };

  // Handler for document approval or rejection
  const updateDocumentStatus = (documentId, newStatus, reason = '') => {
    // In a real app, this would update Firestore
    // For now, we'll just update the local state
    
    const updatedCars = ownerCars.map(car => {
      const updatedDocs = car.documents.map(doc => {
        if (doc.id === documentId) {
          return { 
            ...doc, 
            status: newStatus,
            reason: newStatus === 'declined' ? reason : undefined
          };
        }
        return doc;
      });
      
      // Check if all documents are approved to set car status to approved
      const allDocsApproved = updatedDocs.every(doc => doc.status === 'approved');
      const anyDocDeclined = updatedDocs.some(doc => doc.status === 'declined');
      
      let carStatus = car.status;
      if (allDocsApproved) {
        carStatus = 'approved';
      } else if (anyDocDeclined) {
        carStatus = 'declined';
      } else {
        carStatus = 'pending';
      }
      
      return {
        ...car,
        documents: updatedDocs,
        status: carStatus
      };
    });
    
    setOwnerCars(updatedCars);
    
    // Show notification
    showNotification(
      `Document ${newStatus === 'approved' ? 'approved' : 'declined'} successfully`,
      'success'
    );
    
    // Close document view if we're viewing the current document
    if (selectedDocument && selectedDocument.id === documentId) {
      setSelectedDocument(null);
    }
  };
  
  // Filter owners based on search term
  const filteredOwners = owners.filter(owner => {
    const matchesSearch = 
      owner.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      owner.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      owner.contact?.includes(searchTerm);
      
    // If status filter is 'all', return all matching search results
    if (statusFilter === 'all') {
      return matchesSearch;
    }
    
    // Otherwise, filter by car status
    const ownerCar = ownerCars.find(car => car.ownerId === owner.id);
    return matchesSearch && ownerCar && ownerCar.status === statusFilter;
  });
  
  // Notification system
  const [notification, setNotification] = useState(null);
  
  const showNotification = (message, type = 'info') => {
    setNotification({ message, type });
    
    // Auto-hide notification after 3 seconds
    setTimeout(() => {
      setNotification(null);
    }, 3000);
  };

  // Handle document view
  const handleViewDocument = (document) => {
    setSelectedDocument(document);
  };
  
  return (
    <div className="flex h-screen bg-pattern">
      <Sidebar currentPage="owners" />
      
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
              <h1 className="text-xl font-semibold text-gray-800">Car Owners</h1>
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
                <span className="hidden md:inline">Add Owner</span>
              </button>
            </div>
          </div>
        </header>
        
        <main className="flex-1 overflow-x-hidden overflow-y-auto custom-scrollbar">
          <div className="container px-4 sm:px-6 py-8 mx-auto">
            {/* Dashboard Header */}
            <div className="mb-6 animate-fadeIn">
              <h2 className="text-2xl font-bold text-gray-800 mb-2">Owner Management</h2>
              <p className="text-gray-500">View and manage car owners in the system</p>
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
                  
                  <div className="flex items-center space-x-3">
                    <div className="relative">
                      <select 
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                        className="input-field pl-3 pr-8 py-2 rounded-md focus:outline-none appearance-none"
                      >
                        <option value="all">All Documents</option>
                        <option value="approved">Approved</option>
                        <option value="pending">Pending</option>
                        <option value="declined">Declined</option>
                      </select>
                      <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                        <ChevronDown size={16} className="text-gray-400" />
                      </div>
                    </div>
                    
                    <button className="p-2 rounded-md text-gray-500 hover:text-gray-700 hover:bg-gray-100 focus:outline-none">
                      <Filter size={18} />
                    </button>
                    <span className="hidden sm:inline text-sm text-gray-500">
                      {filteredOwners.length} {filteredOwners.length === 1 ? 'owner' : 'owners'} found
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
                {filteredOwners.length > 0 ? (
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead>
                        <tr className="bg-gray-50 bg-opacity-80">
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Owner
                          </th>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Contact Information
                          </th>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Address
                          </th>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Car Status
                          </th>
                          <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Actions
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200">
                        {filteredOwners.map((owner, index) => {
                          // Find the owner's car if any
                          const ownerCar = ownerCars.find(car => car.ownerId === `owner${index + 1}`);
                          
                          return (
                            <tr key={owner.id} className="owner-row" style={{ animationDelay: `${index * 50}ms` }}>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="flex items-center">
                                  <div className="avatar flex-shrink-0 h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden shadow-sm">
                                    {owner.profileImage ? (
                                      <img src={owner.profileImage} alt={owner.name} className="h-full w-full object-cover" />
                                    ) : (
                                      <span className="text-gray-600 font-medium">
                                        {owner.name ? owner.name.charAt(0).toUpperCase() : "?"}
                                      </span>
                                    )}
                                  </div>
                                  <div className="ml-4">
                                    <div className="text-sm font-semibold text-gray-900">{owner.name}</div>
                                    <div className="text-xs text-gray-500 flex items-center mt-1">
                                      <Shield size={12} className="mr-1" />
                                      Owner
                                    </div>
                                  </div>
                                </div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="flex flex-col">
                                  <div className="text-sm text-gray-900 flex items-center">
                                    <Mail size={14} className="mr-2 text-gray-400" />
                                    {owner.email}
                                  </div>
                                  <div className="text-sm text-gray-500 flex items-center mt-1">
                                    <Phone size={14} className="mr-2 text-gray-400" />
                                    {owner.contact || 'No contact'}
                                  </div>
                                </div>
                              </td>
                              <td className="px-6 py-4">
                              <div className="text-sm text-gray-900 flex items-start">
                                  <MapPin size={14} className="mr-2 text-gray-400 mt-1 flex-shrink-0" />
                                  <span className="line-clamp-2">{owner.address || 'No address'}</span>
                                </div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                {ownerCar ? (
                                  <span className={`status-badge ${ownerCar.status}`}>
                                    {ownerCar.status === 'approved' && <Check size={14} className="mr-1" />}
                                    {ownerCar.status === 'pending' && <Clock size={14} className="mr-1" />}
                                    {ownerCar.status === 'declined' && <XCircle size={14} className="mr-1" />}
                                    {ownerCar.status.charAt(0).toUpperCase() + ownerCar.status.slice(1)}
                                  </span>
                                ) : (
                                  <span className="text-xs text-gray-500">No car registered</span>
                                )}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-right">
                                <div className="flex justify-end items-center space-x-2">
                                  {/* View Button */}
                                  <button
                                    className="p-1 rounded-full text-blue-500 hover:text-blue-700 hover:bg-blue-50 focus:outline-none transition-colors"
                                    onClick={() => handleViewClick(owner)}
                                    title="View owner details"
                                  >
                                    <Eye size={16} />
                                  </button>
                                  
                                  {/* Edit Button */}
                                  <button
                                    className="p-1 rounded-full text-gray-500 hover:text-gray-700 hover:bg-gray-100 focus:outline-none transition-colors"
                                    onClick={() => handleEditClick(owner)}
                                    title="Edit owner"
                                  >
                                    <Edit size={16} />
                                  </button>
                                  
                                  {/* Delete Button */}
                                  <button
                                    className="p-1 rounded-full text-red-500 hover:text-red-700 hover:bg-red-50 focus:outline-none transition-colors"
                                    onClick={() => handleDeleteClick(owner)}
                                    title="Delete owner"
                                  >
                                    <Trash2 size={16} />
                                  </button>
                                </div>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="py-12 text-center">
                    <div className="mx-auto w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mb-4">
                      <UserCircle size={32} className="text-gray-400" />
                    </div>
                    <h3 className="text-lg font-medium text-gray-900 mb-1">No owners found</h3>
                    <p className="text-gray-500 mb-6">
                      {searchTerm ? `No results for "${searchTerm}"` : 'No car owners have been added yet'}
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
                        Add Your First Owner
                      </button>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        </main>
      </div>
      
      {/* Add Owner Modal */}
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
                    <h3 className="text-xl font-semibold text-gray-800">Add New Owner</h3>
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
                
                <form onSubmit={handleAddOwner} className="space-y-5">
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
                        value={newOwner.name}
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
                        value={newOwner.email}
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
                        value={newOwner.contact}
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
                        value={newOwner.address}
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
                          value={newOwner.password}
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
                          value={newOwner.confirmPassword}
                          onChange={handleInputChange}
                          className={`input-field pl-10 pr-3 py-2 block w-full rounded-md focus:outline-none ${
                            formErrors.confirmPassword ? 'border-red-300 bg-red-50' : ''
                          }`}
                          placeholder="••••••"
                        />
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
                        value={newOwner.status}
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
                          <span>Add Owner</span>
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
      
      {/* Edit Owner Modal */}
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
                    <h3 className="text-xl font-semibold text-gray-800">Edit Owner</h3>
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
                
                <form onSubmit={handleUpdateOwner} className="space-y-5">
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
                        value={editOwner.name}
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
                        value={editOwner.email}
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
                        value={editOwner.contact}
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
                        value={editOwner.address}
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
                        value={editOwner.status}
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
      
      {/* View Owner Modal */}
      {showViewModal && selectedOwner && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center">
            <div className="fixed inset-0 bg-black bg-opacity-40 backdrop-blur-sm transition-opacity" 
                 onClick={() => {
                   setShowViewModal(false);
                   setSelectedDocument(null);
                 }}></div>
            
            <div className="modal-glassmorphism rounded-lg overflow-hidden shadow-xl transform transition-all w-full max-w-4xl z-10">
              <div className="px-6 py-6">
                <div className="flex justify-between items-center mb-6">
                  <div className="flex items-center">
                    <UserCircle size={24} className="text-gray-700 mr-3" />
                    <h3 className="text-xl font-semibold text-gray-800">Owner Details</h3>
                  </div>
                  <button
                    onClick={() => {
                      setShowViewModal(false);
                      setSelectedDocument(null);
                    }}
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
                            {selectedOwner.profileImage ? (
                              <img src={selectedOwner.profileImage} alt={selectedOwner.name} className="h-full w-full object-cover" />
                            ) : (
                              <span className="text-3xl text-gray-600 font-medium">
                                {selectedOwner.name ? selectedOwner.name.charAt(0).toUpperCase() : "?"}
                              </span>
                            )}
                          </div>
                          <h4 className="text-lg font-medium">{selectedOwner.name}</h4>
                          <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full mt-1">Car Owner</span>
                          
                          <div className="mt-6 w-full space-y-3">
                            <div className="flex items-center text-sm">
                              <Mail size={16} className="text-gray-400 mr-3" />
                              <span className="text-gray-800">{selectedOwner.email}</span>
                            </div>
                            <div className="flex items-center text-sm">
                              <Phone size={16} className="text-gray-400 mr-3" />
                              <span className="text-gray-800">{selectedOwner.contact || 'No contact'}</span>
                            </div>
                            <div className="flex items-start text-sm">
                              <MapPin size={16} className="text-gray-400 mr-3 mt-0.5" />
                              <span className="text-gray-800">{selectedOwner.address || 'No address'}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="w-full md:w-2/3">
                      {/* Tabs for owner data */}
                      <div className="border-b border-gray-200 mb-4">
                        <div className="flex">
                          <button className="tab-button active mr-4 py-2 text-sm font-medium text-gray-800">
                            Registered Cars
                          </button>
                        </div>
                      </div>
                      
                      {/* Find car data for this owner */}
                      {(() => {
                        // Get the owner index (for demo purposes)
                        const ownerIndex = owners.findIndex(o => o.id === selectedOwner.id);
                        const ownerCar = ownerCars.find(car => car.ownerId === `owner${ownerIndex + 1}`);
                        
                        if (!ownerCar) {
                          return (
                            <div className="text-center py-10">
                              <div className="mx-auto w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mb-4">
                                <Car size={24} className="text-gray-400" />
                              </div>
                              <h4 className="text-lg font-medium text-gray-900 mb-1">No cars registered</h4>
                              <p className="text-sm text-gray-500">This owner hasn't registered any cars yet.</p>
                            </div>
                          );
                        }
                        
                        return (
                          <>
                            {/* Car Summary */}
                            <div className="mb-6 card-glassmorphism rounded-lg p-4">
                              <div className="flex items-center justify-between mb-3">
                                <h4 className="text-lg font-medium">{ownerCar.make} {ownerCar.model} ({ownerCar.year})</h4>
                                <span className={`status-badge ${ownerCar.status}`}>
                                  {ownerCar.status === 'approved' && <Check size={14} className="mr-1" />}
                                  {ownerCar.status === 'pending' && <Clock size={14} className="mr-1" />}
                                  {ownerCar.status === 'declined' && <XCircle size={14} className="mr-1" />}
                                  {ownerCar.status.charAt(0).toUpperCase() + ownerCar.status.slice(1)}
                                </span>
                              </div>
                              
                              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-2">
                                <div>
                                  <span className="text-xs text-gray-500 block">License Plate</span>
                                  <span className="text-sm font-medium">{ownerCar.licensePlate}</span>
                                </div>
                                <div>
                                  <span className="text-xs text-gray-500 block">Color</span>
                                  <span className="text-sm font-medium">{ownerCar.color}</span>
                                </div>
                                <div>
                                  <span className="text-xs text-gray-500 block">Documents</span>
                                  <span className="text-sm font-medium">{ownerCar.documents.length} uploaded</span>
                                </div>
                              </div>
                            </div>
                            
                            {/* Car Documents */}
                            <h5 className="font-medium text-gray-800 mb-3">Documents</h5>
                            
                            {selectedDocument ? (
                              // Document Viewer
                              <div className="animate-fadeIn">
                                <div className="bg-white rounded-lg border border-gray-200 p-4 mb-4">
                                  <div className="flex justify-between items-center mb-4">
                                    <div>
                                      <h5 className="font-medium text-gray-800">{selectedDocument.type}</h5>
                                      <span className="text-xs text-gray-500">Uploaded on {selectedDocument.uploadDate}</span>
                                    </div>
                                    <button
                                      onClick={() => setSelectedDocument(null)}
                                      className="p-1 rounded-full text-gray-400 hover:text-gray-600 hover:bg-gray-100"
                                    >
                                      <ArrowLeft size={16} />
                                    </button>
                                  </div>
                                  
                                  {/* Placeholder for document preview - could be PDF or image in a real app */}
                                  <div className="bg-gray-100 rounded-lg p-10 flex justify-center items-center">
                                    <FileText size={64} className="text-gray-400" />
                                  </div>
                                  
                                  <div className="mt-4">
                                    <p className="text-sm text-gray-600 mb-4">Document: {selectedDocument.fileName}</p>
                                    
                                    {selectedDocument.status === 'pending' ? (
                                      <div className="flex space-x-2">
                                        <button
                                          onClick={() => updateDocumentStatus(selectedDocument.id, 'approved')}
                                          className="flex-1 bg-green-500 hover:bg-green-600 text-white py-2 px-4 rounded-md text-sm font-medium flex justify-center items-center"
                                        >
                                          <Check size={16} className="mr-2" />
                                          Approve
                                        </button>
                                        
                                        <button
                                          onClick={() => {
                                            const reason = prompt('Please enter the reason for rejection:');
                                            if (reason) {
                                              updateDocumentStatus(selectedDocument.id, 'declined', reason);
                                            }
                                          }}
                                          className="flex-1 bg-red-500 hover:bg-red-600 text-white py-2 px-4 rounded-md text-sm font-medium flex justify-center items-center"
                                        >
                                          <XCircle size={16} className="mr-2" />
                                          Decline
                                        </button>
                                      </div>
                                    ) : selectedDocument.status === 'approved' ? (
                                      <div className="bg-green-50 border-l-4 border-green-500 p-3 flex items-start">
                                        <CheckCircle size={18} className="text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                                        <div>
                                          <p className="text-sm font-medium text-green-800">Document Approved</p>
                                          <p className="text-xs text-green-700">This document has been verified and approved.</p>
                                        </div>
                                      </div>
                                    ) : (
                                      <div className="bg-red-50 border-l-4 border-red-500 p-3 flex items-start">
                                        <AlertTriangle size={18} className="text-red-500 mr-2 flex-shrink-0 mt-0.5" />
                                        <div>
                                          <p className="text-sm font-medium text-red-800">Document Declined</p>
                                          <p className="text-xs text-red-700">Reason: {selectedDocument.reason || 'No reason provided'}</p>
                                        </div>
                                      </div>
                                    )}
                                  </div>
                                </div>
                              </div>
                            ) : (
                              // Document List
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {ownerCar.documents.map((doc) => (
                                  <div 
                                    key={doc.id} 
                                    className="document-card bg-white rounded-lg border border-gray-200 p-4 cursor-pointer"
                                    onClick={() => handleViewDocument(doc)}
                                  >
                                    <div className="flex justify-between items-start">
                                      <div className="flex items-center">
                                        <div className="p-2 bg-gray-100 rounded-lg mr-3">
                                          <FileText size={16} className="text-gray-500" />
                                        </div>
                                        <div>
                                          <h6 className="text-sm font-medium text-gray-800">{doc.type}</h6>
                                          <span className="text-xs text-gray-500">{doc.fileName}</span>
                                        </div>
                                      </div>
                                      <span className={`status-badge ${doc.status}`}>
                                        {doc.status === 'approved' && <Check size={12} className="mr-1" />}
                                        {doc.status === 'pending' && <Clock size={12} className="mr-1" />}
                                        {doc.status === 'declined' && <XCircle size={12} className="mr-1" />}
                                        {doc.status.charAt(0).toUpperCase() + doc.status.slice(1)}
                                      </span>
                                    </div>
                                    <div className="mt-2 pt-2 border-t border-gray-100 flex justify-between items-center">
                                      <span className="text-xs text-gray-500">Uploaded on {doc.uploadDate}</span>
                                      <button className="text-blue-600 hover:text-blue-800 text-xs font-medium">View</button>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            )}
                          </>
                        );
                      })()}
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
                    <h3 className="text-lg font-semibold text-gray-900">Delete Owner</h3>
                    <p className="mt-2 text-sm text-gray-500">
                      Are you sure you want to delete <span className="font-medium">{selectedOwner?.name}</span>? This action cannot be undone and will remove all data associated with this owner.
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
                    Delete Owner
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* Notification Toast */}
      {notification && (
        <div className={`notification shadow-lg ${
          notification.type === 'success' ? 'bg-green-50 border-l-4 border-green-500 text-green-700' : 
          notification.type === 'error' ? 'bg-red-50 border-l-4 border-red-500 text-red-700' : 
          'bg-blue-50 border-l-4 border-blue-500 text-blue-700'
        }`}>
          <div className="flex items-center">
            {notification.type === 'success' && <CheckCircle size={20} className="mr-3 text-green-500" />}
            {notification.type === 'error' && <AlertTriangle size={20} className="mr-3 text-red-500" />}
            <p>{notification.message}</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default Owners;