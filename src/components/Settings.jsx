// components/Settings.js
import React, { useState, useEffect } from 'react';
import { 
  getFirestore, 
  doc, 
  getDoc, 
  updateDoc,
  collection,
  getDocs
} from 'firebase/firestore';
import Sidebar from './layout/Sidebar';
import { 
  Save, 
  AlertTriangle, 
  ArrowLeft, 
  Settings as SettingsIcon, 
  Mail, 
  Phone, 
  MapPin, 
  Globe, 
  DollarSign, 
  Moon, 
  Bell, 
  Lock, 
  Shield, 
  FileText, 
  CheckCircle,
  Clock
} from 'lucide-react';

const Settings = ({ user, auth }) => {
  const [settings, setSettings] = useState({
    siteTitle: 'Vigan Car Rental',
    contactEmail: '',
    contactPhone: '',
    address: '',
    maxLoginAttempts: 5,
    disableDuration: 1, // in minutes
    enableEmailNotifications: true,
    darkMode: false,
    currency: 'PHP',
    rentalTerms: '',
  });
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('general');
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  
  const db = getFirestore();
  
  const toggleSidebar = () => {
    setIsSidebarCollapsed(!isSidebarCollapsed);
  };
  
  // Add custom styles for the settings page
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
      
      .textarea-field {
        background: rgba(255, 255, 255, 0.5);
        border: 1px solid rgba(229, 231, 235, 0.8);
        transition: all 0.2s ease;
        resize: none;
      }
      
      .textarea-field:focus {
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
      
      .tab-item {
        position: relative;
        transition: all 0.2s ease;
      }
      
      .tab-item::after {
        content: '';
        position: absolute;
        bottom: 0;
        left: 0;
        right: 0;
        height: 2px;
        background-color: transparent;
        transition: all 0.2s ease;
      }
      
      .tab-item.active::after {
        background-color: #2d3748;
      }
      
      .tab-item:hover::after {
        background-color: #e2e8f0;
      }
      
      .tab-item.active:hover::after {
        background-color: #2d3748;
      }
      
      /* Custom checkbox styles */
      .custom-checkbox {
        height: 1.25rem;
        width: 1.25rem;
        -webkit-appearance: none;
        -moz-appearance: none;
        appearance: none;
        border: 2px solid #cbd5e0;
        border-radius: 0.25rem;
        background-color: rgba(255, 255, 255, 0.7);
        cursor: pointer;
        position: relative;
        transition: all 0.2s ease;
      }
      
      .custom-checkbox:checked {
        background-color: #2d3748;
        border-color: #2d3748;
      }
      
      .custom-checkbox:checked::after {
        content: '';
        position: absolute;
        top: 0.2rem;
        left: 0.3rem;
        width: 0.5rem;
        height: 0.3rem;
        border-left: 2px solid white;
        border-bottom: 2px solid white;
        transform: rotate(-45deg);
      }
      
      .custom-checkbox:focus {
        box-shadow: 0 0 0 2px rgba(45, 55, 72, 0.2);
        outline: none;
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
  
  // Fetch settings on component mount
  useEffect(() => {
    const fetchSettings = async () => {
      try {
        // Try to get settings document
        const settingsRef = doc(db, 'settings', 'app');
        const settingsSnap = await getDoc(settingsRef);
        
        if (settingsSnap.exists()) {
          setSettings({
            ...settings,
            ...settingsSnap.data()
          });
        }
        
        // Add a small delay to demonstrate loading animation
        setTimeout(() => {
          setLoading(false);
        }, 600);
      } catch (error) {
        console.error('Error fetching settings:', error);
        setError('Failed to load settings');
        setLoading(false);
      }
    };
    
    fetchSettings();
  }, [db]);
  
  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setSettings({
      ...settings,
      [name]: type === 'checkbox' ? checked : value
    });
  };
  
  const handleNumericChange = (e) => {
    const { name, value } = e.target;
    setSettings({
      ...settings,
      [name]: parseInt(value) || 0
    });
  };
  
  const handleSaveSettings = async (e) => {
    e.preventDefault();
    
    setError('');
    setSuccess(false);
    setSaving(true);
    
    try {
      // Update settings in Firestore
      const settingsRef = doc(db, 'settings', 'app');
      await updateDoc(settingsRef, settings);
      
      setSuccess(true);
      
      // Automatically hide success message after 3 seconds
      setTimeout(() => {
        setSuccess(false);
      }, 3000);
      
    } catch (error) {
      console.error('Error updating settings:', error);
      setError('Failed to update settings: ' + error.message);
    } finally {
      setSaving(false);
    }
  };
  
  const renderGeneralSettings = () => {
    return (
      <div className="animate-fadeIn">
        <h4 className="text-lg font-medium text-gray-700 mb-6 flex items-center">
          <Globe size={20} className="mr-2 text-gray-500" />
          General Settings
        </h4>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label htmlFor="siteTitle" className="block text-sm font-medium text-gray-700 mb-1">Site Title</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Globe size={16} className="text-gray-400" />
              </div>
              <input
                type="text"
                id="siteTitle"
                name="siteTitle"
                value={settings.siteTitle}
                onChange={handleInputChange}
                className="input-field pl-10 pr-3 py-2 block w-full rounded-md focus:outline-none"
                placeholder="Enter site title"
              />
            </div>
          </div>
          
          <div>
            <label htmlFor="currency" className="block text-sm font-medium text-gray-700 mb-1">Currency</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <DollarSign size={16} className="text-gray-400" />
              </div>
              <select
                id="currency"
                name="currency"
                value={settings.currency}
                onChange={handleInputChange}
                className="input-field pl-10 pr-3 py-2 block w-full rounded-md focus:outline-none appearance-none"
              >
                <option value="PHP">PHP (₱)</option>
                <option value="USD">USD ($)</option>
                <option value="EUR">EUR (€)</option>
              </select>
            </div>
          </div>
          
          <div>
            <label htmlFor="contactEmail" className="block text-sm font-medium text-gray-700 mb-1">Contact Email</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Mail size={16} className="text-gray-400" />
              </div>
              <input
                type="email"
                id="contactEmail"
                name="contactEmail"
                value={settings.contactEmail}
                onChange={handleInputChange}
                className="input-field pl-10 pr-3 py-2 block w-full rounded-md focus:outline-none"
                placeholder="contact@example.com"
              />
            </div>
          </div>
          
          <div>
            <label htmlFor="contactPhone" className="block text-sm font-medium text-gray-700 mb-1">Contact Phone</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Phone size={16} className="text-gray-400" />
              </div>
              <input
                type="text"
                id="contactPhone"
                name="contactPhone"
                value={settings.contactPhone}
                onChange={handleInputChange}
                className="input-field pl-10 pr-3 py-2 block w-full rounded-md focus:outline-none"
                placeholder="+1 (555) 000-0000"
              />
            </div>
          </div>
          
          <div className="md:col-span-2">
            <label htmlFor="address" className="block text-sm font-medium text-gray-700 mb-1">Business Address</label>
            <div className="relative">
              <div className="absolute top-3 left-3 flex items-start pointer-events-none">
                <MapPin size={16} className="text-gray-400" />
              </div>
              <textarea
                id="address"
                name="address"
                rows="2"
                value={settings.address}
                onChange={handleInputChange}
                className="textarea-field pl-10 pr-3 py-2 block w-full rounded-md focus:outline-none"
                placeholder="Enter business address"
              ></textarea>
            </div>
          </div>
          
          <div>
            <div className="flex items-center mt-2 p-3 rounded-md bg-gray-50">
              <input
                type="checkbox"
                id="darkMode"
                name="darkMode"
                checked={settings.darkMode}
                onChange={handleInputChange}
                className="custom-checkbox"
              />
              <label htmlFor="darkMode" className="ml-2 flex items-center text-sm text-gray-700">
                <Moon size={16} className="mr-2 text-gray-500" />
                Enable Dark Mode
              </label>
            </div>
          </div>
          
          <div>
            <div className="flex items-center mt-2 p-3 rounded-md bg-gray-50">
              <input
                type="checkbox"
                id="enableEmailNotifications"
                name="enableEmailNotifications"
                checked={settings.enableEmailNotifications}
                onChange={handleInputChange}
                className="custom-checkbox"
              />
              <label htmlFor="enableEmailNotifications" className="ml-2 flex items-center text-sm text-gray-700">
                <Bell size={16} className="mr-2 text-gray-500" />
                Enable Email Notifications
              </label>
            </div>
          </div>
        </div>
      </div>
    );
  };
  
  const renderSecuritySettings = () => {
    return (
      <div className="animate-fadeIn">
        <h4 className="text-lg font-medium text-gray-700 mb-6 flex items-center">
          <Shield size={20} className="mr-2 text-gray-500" />
          Security Settings
        </h4>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label htmlFor="maxLoginAttempts" className="block text-sm font-medium text-gray-700 mb-1">Maximum Login Attempts</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Lock size={16} className="text-gray-400" />
              </div>
              <input
                type="number"
                id="maxLoginAttempts"
                name="maxLoginAttempts"
                min="1"
                max="10"
                value={settings.maxLoginAttempts}
                onChange={handleNumericChange}
                className="input-field pl-10 pr-3 py-2 block w-full rounded-md focus:outline-none"
              />
            </div>
            <p className="mt-1 text-xs text-gray-500">
              Number of failed login attempts before temporary lockout
            </p>
          </div>
          
          <div>
            <label htmlFor="disableDuration" className="block text-sm font-medium text-gray-700 mb-1">Lockout Duration (minutes)</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Clock size={16} className="text-gray-400" />
              </div>
              <input
                type="number"
                id="disableDuration"
                name="disableDuration"
                min="1"
                max="60"
                value={settings.disableDuration}
                onChange={handleNumericChange}
                className="input-field pl-10 pr-3 py-2 block w-full rounded-md focus:outline-none"
              />
            </div>
            <p className="mt-1 text-xs text-gray-500">
              Duration in minutes to lock account after exceeding maximum attempts
            </p>
          </div>
        </div>
        
        <div className="mt-6 p-4 bg-yellow-50 rounded-lg border border-yellow-100">
          <div className="flex">
            <div className="flex-shrink-0">
              <AlertTriangle className="h-5 w-5 text-yellow-400" />
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-yellow-800">Security Recommendation</h3>
              <div className="mt-2 text-sm text-yellow-700">
                <p>
                  It's recommended to set a reasonable number of login attempts and lockout duration to prevent brute force attacks.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };
  
  const renderTermsSettings = () => {
    return (
      <div className="animate-fadeIn">
        <h4 className="text-lg font-medium text-gray-700 mb-6 flex items-center">
          <FileText size={20} className="mr-2 text-gray-500" />
          Terms & Conditions
        </h4>
        
        <div>
          <label htmlFor="rentalTerms" className="block text-sm font-medium text-gray-700 mb-1">Rental Terms & Conditions</label>
          <div className="relative bg-white rounded-md shadow-sm">
            <textarea
              id="rentalTerms"
              name="rentalTerms"
              rows="12"
              value={settings.rentalTerms}
              onChange={handleInputChange}
              className="textarea-field p-4 block w-full rounded-md focus:outline-none"
              placeholder="Enter your rental terms and conditions here..."
            ></textarea>
          </div>
          <p className="mt-2 text-sm text-gray-500 flex items-center">
            <AlertTriangle size={14} className="text-gray-400 mr-1" />
            These terms will be displayed to customers before they confirm a rental.
          </p>
        </div>
      </div>
    );
  };
  
  const renderContent = () => {
    switch (activeTab) {
      case 'general':
        return renderGeneralSettings();
      case 'security':
        return renderSecuritySettings();
      case 'terms':
        return renderTermsSettings();
      default:
        return renderGeneralSettings();
    }
  };
  
  return (
    <div className="flex h-screen bg-pattern">
      <Sidebar currentPage="settings" />
      
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
              <h1 className="text-xl font-semibold text-gray-800">Application Settings</h1>
            </div>
          </div>
        </header>
        
        <main className="flex-1 overflow-x-hidden overflow-y-auto custom-scrollbar">
          <div className="container px-4 sm:px-6 py-8 mx-auto">
            {/* Dashboard Header */}
            <div className="mb-6 animate-fadeIn">
              <div className="flex items-center">
                <SettingsIcon size={24} className="text-gray-700 mr-3" />
                <div>
                  <h2 className="text-2xl font-bold text-gray-800 mb-1">System Configuration</h2>
                  <p className="text-gray-500">Configure application settings and preferences</p>
                </div>
              </div>
            </div>
            
            {loading ? (
              <div className="flex justify-center my-10">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-700"></div>
              </div>
            ) : (
              <div className="card-glassmorphism rounded-lg overflow-hidden animate-fadeIn shadow-sm">
                <div className="border-b border-gray-200 bg-gray-50 bg-opacity-70">
                  <nav className="flex">
                    <button
                      onClick={() => setActiveTab('general')}
                      className={`py-4 px-6 text-center font-medium text-sm tab-item ${
                        activeTab === 'general' ? 'active text-gray-900' : 'text-gray-500'
                      }`}
                    >
                      General
                    </button>
                    <button
                      onClick={() => setActiveTab('security')}
                      className={`py-4 px-6 text-center font-medium text-sm tab-item ${
                        activeTab === 'security' ? 'active text-gray-900' : 'text-gray-500'
                      }`}
                    >
                      Security
                    </button>
                    <button
                      onClick={() => setActiveTab('terms')}
                      className={`py-4 px-6 text-center font-medium text-sm tab-item ${
                        activeTab === 'terms' ? 'active text-gray-900' : 'text-gray-500'
                      }`}
                    >
                      Terms & Conditions
                    </button>
                  </nav>
                </div>
                
                <div className="p-6">
                  {error && (
                    <div className="mb-6 bg-red-50 border border-red-100 rounded-lg p-4 animate-fadeIn">
                      <div className="flex">
                        <AlertTriangle size={20} className="text-red-500 mr-3 flex-shrink-0" />
                        <p className="text-sm text-red-600">{error}</p>
                      </div>
                    </div>
                  )}
                  
                  {success && (
                    <div className="mb-6 bg-green-50 border border-green-100 rounded-lg p-4 animate-fadeIn">
                      <div className="flex">
                        <CheckCircle size={20} className="text-green-500 mr-3 flex-shrink-0" />
                        <p className="text-sm text-green-600">Settings updated successfully</p>
                      </div>
                    </div>
                  )}
                  
                  <form onSubmit={handleSaveSettings}>
                    {renderContent()}
                    
                    <div className="mt-8 flex justify-end">
                      <button
                        type="submit"
                        className="btn-primary py-2 px-6 rounded-md shadow-sm flex items-center"
                        disabled={saving}
                      >
                        {saving ? (
                          <div className="flex items-center">
                            <div className="animate-spin mr-2 h-4 w-4 border-2 border-white border-t-transparent rounded-full"></div>
                            <span>Saving...</span>
                          </div>
                        ) : (
                          <div className="flex items-center">
                            <Save size={16} className="mr-2" />
                            <span>Save Settings</span>
                          </div>
                        )}
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
};

export default Settings;