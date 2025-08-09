// components/AdminProfile.js
import React, { useState, useEffect } from 'react';
import { 
  getFirestore, 
  doc, 
  getDoc, 
  updateDoc,
  serverTimestamp
} from 'firebase/firestore';
import { getAuth, updateEmail, updatePassword, reauthenticateWithCredential, EmailAuthProvider } from 'firebase/auth';
import Sidebar from './layout/Sidebar';
import { Save, X, UserCircle, Camera, ArrowLeft, Phone, Mail, MapPin, User, Shield, Clock } from 'lucide-react';

const AdminProfile = ({ user }) => {
  const [profile, setProfile] = useState({
    name: '',
    email: '',
    contact: '',
    username: '',
    address: '',
    profileImage: '',
  });
  
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const [showReauthModal, setShowReauthModal] = useState(false);
  const [password, setPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordError, setPasswordError] = useState('');
  
  const db = getFirestore();
  const auth = getAuth();
  
  // Toggle sidebar
  const toggleSidebar = () => {
    setIsSidebarCollapsed(!isSidebarCollapsed);
  };
  
  // Fetch admin profile on component mount
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        if (user) {
          // Try to find admin in Firestore
          const adminRef = doc(db, 'admins', user.uid);
          const adminSnap = await getDoc(adminRef);
          
          if (adminSnap.exists()) {
            setProfile({
              ...adminSnap.data(),
              email: user.email || adminSnap.data().email || '',
            });
          } else {
            // If admin doc doesn't exist, use auth user info
            setProfile({
              name: '',
              email: user.email || '',
              contact: '',
              username: '',
              address: '',
              profileImage: '',
            });
          }
        }
      } catch (error) {
        console.error('Error fetching profile:', error);
        setError('Failed to load profile');
      } finally {
        setLoading(false);
      }
    };
    
    fetchProfile();
  }, [user, db]);
  
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setProfile({
      ...profile,
      [name]: value
    });
  };
  
  const handleImageChange = (e) => {
    // In a real app, you would upload this to Firebase Storage
    // For now, we'll just handle the input change
    if (e.target.files && e.target.files[0]) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setProfile({
          ...profile,
          profileImage: event.target.result
        });
      };
      reader.readAsDataURL(e.target.files[0]);
    }
  };
  
  const validatePasswordChange = () => {
    if (newPassword !== confirmPassword) {
      setPasswordError('Passwords do not match');
      return false;
    }
    
    if (newPassword && newPassword.length < 6) {
      setPasswordError('Password must be at least 6 characters');
      return false;
    }
    
    return true;
  };
  
  const handleSaveProfile = async (e) => {
    e.preventDefault();
    
    setError('');
    setSuccess(false);
    setSaving(true);
    
    try {
      // Check if email is being changed
      const emailChanged = user.email !== profile.email;
      
      if (emailChanged || newPassword) {
        // If email or password is changing, we need to reauthenticate
        setShowReauthModal(true);
        setSaving(false);
        return;
      }
      
      // Update profile in Firestore
      await updateProfileInFirestore();
      
      setSuccess(true);
    } catch (error) {
      console.error('Error updating profile:', error);
      setError('Failed to update profile: ' + error.message);
    } finally {
      setSaving(false);
    }
  };
  
  const updateProfileInFirestore = async () => {
    // Update or create admin document in Firestore
    const adminRef = doc(db, 'admins', user.uid);
    const adminSnap = await getDoc(adminRef);
    
    if (adminSnap.exists()) {
      await updateDoc(adminRef, {
        name: profile.name,
        contact: profile.contact,
        username: profile.username,
        address: profile.address,
        updatedAt: serverTimestamp(),
      });
    } else {
      // If admin doc doesn't exist, create it
      await updateDoc(adminRef, {
        name: profile.name,
        email: profile.email,
        contact: profile.contact,
        username: profile.username,
        address: profile.address,
        role: 'admin',
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
    }
  };
  
  const handleReauthenticate = async (e) => {
    e.preventDefault();
    
    setPasswordError('');
    setSaving(true);
    
    try {
      // Create credential
      const credential = EmailAuthProvider.credential(user.email, password);
      
      // Reauthenticate user
      await reauthenticateWithCredential(user, credential);
      
      // Check if email is being changed
      if (user.email !== profile.email) {
        await updateEmail(user, profile.email);
      }
      
      // Check if password is being changed
      if (newPassword && validatePasswordChange()) {
        await updatePassword(user, newPassword);
      }
      
      // Update Firestore
      await updateProfileInFirestore();
      
      // Reset password fields
      setPassword('');
      setNewPassword('');
      setConfirmPassword('');
      
      // Close modal and show success
      setShowReauthModal(false);
      setSuccess(true);
      
    } catch (error) {
      console.error('Error during reauthentication:', error);
      setPasswordError('Authentication failed. Please check your current password.');
    } finally {
      setSaving(false);
    }
  };
  
  // Custom styles for the admin interface
  useEffect(() => {
    const styles = `
      @keyframes fadeIn {
        from { opacity: 0; }
        to { opacity: 1; }
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
      
      .animate-fadein {
        animation: fadeIn 0.5s ease-out forwards;
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
    `;
    
    const styleElement = document.createElement('style');
    styleElement.textContent = styles;
    document.head.appendChild(styleElement);
    
    return () => {
      document.head.removeChild(styleElement);
    };
  }, []);
  
  return (
    <div className="flex h-screen bg-pattern">
      <Sidebar currentPage="profile" />
      
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
              <h1 className="text-xl font-semibold text-gray-800">Admin Profile</h1>
            </div>
            
            <div className="flex items-center">
              <div className="hidden md:flex items-center mr-4 text-sm text-gray-500">
                <Clock size={16} className="mr-1" />
                Last login: {new Date().toLocaleDateString()}
              </div>
              <div className="h-8 w-8 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden">
                {profile.profileImage ? (
                  <img src={profile.profileImage} alt="Profile" className="h-full w-full object-cover" />
                ) : (
                  <UserCircle className="text-gray-400" />
                )}
              </div>
            </div>
          </div>
        </header>
        
        <main className="flex-1 overflow-x-hidden overflow-y-auto custom-scrollbar">
          <div className="container px-4 sm:px-6 py-8 mx-auto">
            {/* Dashboard Header */}
            <div className="mb-8">
              <h2 className="text-2xl font-bold text-gray-800 mb-2">Account Settings</h2>
              <p className="text-gray-500">Manage your personal information and account security</p>
            </div>
            
            {loading ? (
              <div className="flex justify-center my-10">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-700"></div>
              </div>
            ) : (
              <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 animate-fadein">
                {/* Profile Summary Card */}
                <div className="card-glassmorphism rounded-lg overflow-hidden">
                  <div className="p-6">
                    <h3 className="text-lg font-semibold text-gray-800 mb-4">Profile Summary</h3>
                    
                    <div className="flex flex-col items-center">
                      <div className="relative mb-6">
                        {profile.profileImage ? (
                          <img
                            src={profile.profileImage}
                            alt="Profile"
                            className="h-32 w-32 rounded-full object-cover border-4 border-white shadow-md"
                          />
                        ) : (
                          <div className="h-32 w-32 rounded-full bg-gray-200 flex items-center justify-center border-4 border-white shadow-md">
                            <UserCircle size={64} className="text-gray-400" />
                          </div>
                        )}
                        <label htmlFor="profile-image" className="absolute bottom-0 right-0 bg-gray-800 text-white p-2 rounded-full cursor-pointer shadow-md hover:bg-gray-700 transition-all">
                          <Camera size={16} />
                          <input
                            type="file"
                            id="profile-image"
                            accept="image/*"
                            className="hidden"
                            onChange={handleImageChange}
                          />
                        </label>
                      </div>
                      
                      <h4 className="text-xl font-semibold text-gray-800">{profile.name || 'Admin User'}</h4>
                      <p className="text-gray-500 mb-4">{profile.username || 'admin'}</p>
                      
                      <div className="w-full space-y-3 mt-2">
                        <div className="flex items-center text-gray-600">
                          <Mail size={16} className="mr-2" />
                          <span className="text-sm">{profile.email}</span>
                        </div>
                        
                        <div className="flex items-center text-gray-600">
                          <Phone size={16} className="mr-2" />
                          <span className="text-sm">{profile.contact || 'Not specified'}</span>
                        </div>
                        
                        <div className="flex items-center text-gray-600">
                          <MapPin size={16} className="mr-2" />
                          <span className="text-sm">{profile.address || 'Not specified'}</span>
                        </div>
                        
                        <div className="flex items-center text-gray-600">
                          <Shield size={16} className="mr-2" />
                          <span className="text-sm">Administrator</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Edit Profile Card */}
                <div className="card-glassmorphism rounded-lg overflow-hidden xl:col-span-2">
                  <div className="p-6">
                    <h3 className="text-lg font-semibold text-gray-800 mb-4">Edit Profile</h3>
                    
                    {error && (
                      <div className="mb-4 bg-red-50 border-l-4 border-red-400 p-4 rounded">
                        <p className="text-sm text-red-600">{error}</p>
                      </div>
                    )}
                    
                    {success && (
                      <div className="mb-4 bg-green-50 border-l-4 border-green-400 p-4 rounded">
                        <p className="text-sm text-green-600">Profile updated successfully</p>
                      </div>
                    )}
                    
                    <form onSubmit={handleSaveProfile}>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                        <div>
                          <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                          <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                              <User size={16} className="text-gray-400" />
                            </div>
                            <input
                              type="text"
                              id="name"
                              name="name"
                              value={profile.name}
                              onChange={handleInputChange}
                              className="input-field pl-10 pr-3 py-2 block w-full rounded-md focus:outline-none focus:ring-2 focus:ring-gray-300"
                              placeholder="John Doe"
                            />
                          </div>
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
                              value={profile.email}
                              onChange={handleInputChange}
                              className="input-field pl-10 pr-3 py-2 block w-full rounded-md focus:outline-none focus:ring-2 focus:ring-gray-300"
                              placeholder="admin@example.com"
                            />
                          </div>
                        </div>
                        
                        <div>
                          <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-1">Username</label>
                          <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                              <UserCircle size={16} className="text-gray-400" />
                            </div>
                            <input
                              type="text"
                              id="username"
                              name="username"
                              value={profile.username}
                              onChange={handleInputChange}
                              className="input-field pl-10 pr-3 py-2 block w-full rounded-md focus:outline-none focus:ring-2 focus:ring-gray-300"
                              placeholder="admin_user"
                            />
                          </div>
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
                              value={profile.contact}
                              onChange={handleInputChange}
                              className="input-field pl-10 pr-3 py-2 block w-full rounded-md focus:outline-none focus:ring-2 focus:ring-gray-300"
                              placeholder="+1 (555) 000-0000"
                            />
                          </div>
                        </div>
                        
                        <div className="md:col-span-2">
                          <label htmlFor="address" className="block text-sm font-medium text-gray-700 mb-1">Address</label>
                          <div className="relative">
                            <div className="absolute top-3 left-3 flex items-start pointer-events-none">
                              <MapPin size={16} className="text-gray-400" />
                            </div>
                            <textarea
                              id="address"
                              name="address"
                              rows="3"
                              value={profile.address}
                              onChange={handleInputChange}
                              className="input-field pl-10 pr-3 py-2 block w-full rounded-md focus:outline-none focus:ring-2 focus:ring-gray-300"
                              placeholder="Enter your address"
                            ></textarea>
                          </div>
                        </div>
                      </div>
                      
                      <div className="border-t border-gray-200 pt-6 mb-4">
                        <h4 className="text-md font-semibold text-gray-800 mb-4">Change Password</h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div>
                            <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700 mb-1">New Password</label>
                            <input
                              type="password"
                              id="newPassword"
                              value={newPassword}
                              onChange={(e) => setNewPassword(e.target.value)}
                              className="input-field px-3 py-2 block w-full rounded-md focus:outline-none focus:ring-2 focus:ring-gray-300"
                              placeholder="Leave blank to keep current"
                            />
                          </div>
                          
                          <div>
                            <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1">Confirm New Password</label>
                            <input
                              type="password"
                              id="confirmPassword"
                              value={confirmPassword}
                              onChange={(e) => setConfirmPassword(e.target.value)}
                              className="input-field px-3 py-2 block w-full rounded-md focus:outline-none focus:ring-2 focus:ring-gray-300"
                              placeholder="Leave blank to keep current"
                            />
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex justify-end">
                        <button
                          type="submit"
                          className="btn-primary py-2 px-6 rounded-md shadow-sm focus:outline-none flex items-center"
                          disabled={saving}
                        >
                          {saving ? (
                            <div className="flex items-center">
                              <div className="animate-spin mr-2 h-4 w-4 border-2 border-white border-t-transparent rounded-full"></div>
                              Saving...
                            </div>
                          ) : (
                            <div className="flex items-center">
                              <Save size={16} className="mr-2" />
                              Save Changes
                            </div>
                          )}
                        </button>
                      </div>
                    </form>
                  </div>
                </div>
              </div>
            )}
          </div>
        </main>
      </div>
      
      {/* Reauthentication Modal */}
      {showReauthModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen px-4 text-center">
            <div className="fixed inset-0 bg-black bg-opacity-40 backdrop-blur-sm transition-opacity" 
                 onClick={() => setShowReauthModal(false)}></div>
            
            <div className="card-glassmorphism rounded-lg overflow-hidden shadow-xl transform transition-all max-w-lg w-full p-6 z-10">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold text-gray-800">Authentication Required</h3>
                <button onClick={() => setShowReauthModal(false)} className="text-gray-500 hover:text-gray-700">
                  <X size={20} />
                </button>
              </div>
              
              <p className="text-sm text-gray-600 mb-4">
                Please enter your current password to confirm these changes
              </p>
              
              {passwordError && (
                <div className="mb-4 bg-red-50 border-l-4 border-red-400 p-3 rounded">
                  <p className="text-sm text-red-600">{passwordError}</p>
                </div>
              )}
              
              <form onSubmit={handleReauthenticate}>
                <div className="mb-6">
                  <label htmlFor="current-password" className="block text-sm font-medium text-gray-700 mb-1">
                    Current Password
                  </label>
                  <input
                    type="password"
                    id="current-password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="input-field px-3 py-2 block w-full rounded-md focus:outline-none focus:ring-2 focus:ring-gray-300"
                    required
                  />
                </div>
                
                <div className="flex justify-end space-x-3">
                  <button
                    type="button"
                    onClick={() => {
                      setShowReauthModal(false);
                      setPassword('');
                      setPasswordError('');
                    }}
                    className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-300"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="btn-primary py-2 px-4 rounded-md shadow-sm focus:outline-none flex items-center"
                    disabled={saving}
                  >
                    {saving ? 'Authenticating...' : 'Authenticate'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminProfile;