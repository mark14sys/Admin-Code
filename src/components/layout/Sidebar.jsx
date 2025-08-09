// components/Sidebar.js
import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { getAuth, signOut } from 'firebase/auth';
import { 
  LayoutDashboard, 
  Users, 
  UserRoundCog,
  FileText, 
  Settings, 
  LogOut,
  Menu,
  X,
  Car,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';

const Sidebar = ({ currentPage }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const navigate = useNavigate();
  const auth = getAuth();
  
  // Handle window resize
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024) {
        setIsMenuOpen(false);
      }
    };
    
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);
  
  const handleSignOut = async () => {
    try {
      await signOut(auth);
      navigate('/login');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };
  
  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };
  
  const toggleSidebar = () => {
    setIsSidebarCollapsed(!isSidebarCollapsed);
  };
  
  const navItems = [
    { name: 'Dashboard', path: '/', icon: <LayoutDashboard size={20} />, id: 'dashboard' },
    { name: 'Owners', path: '/owners', icon: <Users size={20} />, id: 'owners' },
    { name: 'Clients', path: '/renters', icon: <UserRoundCog size={20} />, id: 'renters' },
    { name: 'Total Bookings', path: '/reports', icon: <FileText size={20} />, id: 'reports' },
    { name: 'Settings', path: '/settings', icon: <Settings size={20} />, id: 'settings' },
  ];

  // Add custom animation styles
  useEffect(() => {
    const styles = `
      @keyframes fadeIn {
        from { opacity: 0; }
        to { opacity: 1; }
      }

      @keyframes slideIn {
        from { opacity: 0; transform: translateX(-20px); }
        to { opacity: 1; transform: translateX(0); }
      }

      @keyframes slideInUp {
        from { opacity: 0; transform: translateY(20px); }
        to { opacity: 1; transform: translateY(0); }
      }

      @keyframes slideInLeft {
        from { transform: translateX(-100%); }
        to { transform: translateX(0); }
      }

      .animate-fadeIn {
        animation: fadeIn 0.3s ease forwards;
      }

      .animate-slideIn {
        animation: slideIn 0.4s ease forwards;
      }

      .animate-slideInUp {
        animation: slideInUp 0.4s ease forwards;
      }

      .animate-slideInLeft {
        animation: slideInLeft 0.3s ease forwards;
      }

      .hover\\:scale-102:hover {
        transform: scale(1.02);
      }

      .hover\\:scale-110:hover {
        transform: scale(1.1);
      }

      .active\\:scale-95:active {
        transform: scale(0.95);
      }

      .active\\:scale-98:active {
        transform: scale(0.98);
      }
      
      .sidebar-toggle {
        position: absolute;
        top: 50%;
        right: -12px;
        transform: translateY(-50%);
        width: 24px;
        height: 24px;
        border-radius: 50%;
        background-color: #1a202c;
        display: flex;
        align-items: center;
        justify-content: center;
        cursor: pointer;
        box-shadow: 0 0 10px rgba(0, 0, 0, 0.2);
        z-index: 30;
        transition: all 0.2s ease;
      }
      
      .sidebar-toggle:hover {
        background-color: #2d3748;
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
    <>
      {/* Mobile menu button */}
      <div className="lg:hidden fixed top-0 left-0 z-20 p-4">
        <button
          onClick={toggleMenu}
          className="p-2 rounded-md text-gray-300 hover:text-white hover:bg-gray-800 focus:outline-none transition-colors duration-200 transform active:scale-95 hover:scale-105"
        >
          {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>
      
      {/* Sidebar for desktop */}
      <div className={`hidden lg:flex lg:flex-col lg:fixed lg:inset-y-0 bg-gray-900 border-r border-gray-800 shadow-lg transition-all duration-300 relative ${isSidebarCollapsed ? 'w-20' : 'w-64'}`}>
        {/* Toggle button inside sidebar */}
        <div className="sidebar-toggle" onClick={toggleSidebar}>
          {isSidebarCollapsed ? 
            <ChevronRight size={16} className="text-gray-300" /> : 
            <ChevronLeft size={16} className="text-gray-300" />
          }
        </div>
        
        <div className="flex items-center justify-center h-16 border-b border-gray-800">
          <div className="flex items-center animate-fadeIn">
            <Car className="h-8 w-8 text-gray-300" />
            {!isSidebarCollapsed && (
              <span className="ml-2 text-lg font-semibold text-gray-100">Car Rental System </span>
            )}
          </div>
        </div>
        
        <div className="flex flex-col flex-1 overflow-y-auto">
          <nav className="flex-1 px-2 py-4 space-y-1">
            {navItems.map((item, index) => (
              <div
                key={item.id}
                className="animate-slideIn opacity-0"
                style={{ animationDelay: `${index * 100}ms`, animationFillMode: 'forwards' }}
              >
                <Link
                  to={item.path}
                  className={`flex items-center px-4 py-3 text-sm font-medium rounded-md transition-all duration-200 ${
                    currentPage === item.id
                      ? 'bg-gray-800 text-white'
                      : 'text-gray-300 hover:bg-gray-800 hover:text-white'
                  } ${isSidebarCollapsed ? 'justify-center' : ''}`}
                  title={isSidebarCollapsed ? item.name : ''}
                >
                  <span className={isSidebarCollapsed ? '' : 'mr-3'}>{item.icon}</span>
                  {!isSidebarCollapsed && item.name}
                </Link>
              </div>
            ))}
          </nav>
          
          <div className="px-4 py-4 border-t border-gray-800">
            <button
              onClick={handleSignOut}
              className={`flex items-center w-full px-4 py-3 text-sm font-medium text-gray-300 rounded-md hover:bg-gray-800 hover:text-white transition-all duration-200 hover:scale-102 active:scale-98 ${isSidebarCollapsed ? 'justify-center' : ''}`}
              title={isSidebarCollapsed ? 'Log Out' : ''}
            >
              <LogOut size={20} className={isSidebarCollapsed ? '' : 'mr-3'} />
              {!isSidebarCollapsed && 'Log Out'}
            </button>
          </div>
          
          {!isSidebarCollapsed && (
            <div className="flex items-center px-4 py-4 border-t border-gray-800">
              <Link to="/profile" className="flex items-center group">
                <div className="h-8 w-8 rounded-full bg-gray-700 flex items-center justify-center transition-all duration-200 group-hover:bg-gray-600">
                  <span className="text-sm font-medium text-gray-300">A</span>
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-300 group-hover:text-white transition-colors duration-200">Admin</p>
                  <p className="text-xs text-gray-500 group-hover:text-gray-400 transition-colors duration-200">View Profile</p>
                </div>
              </Link>
            </div>
          )}
          
          {isSidebarCollapsed && (
            <div className="flex justify-center px-4 py-4 border-t border-gray-800">
              <Link to="/profile" className="group" title="View Profile">
                <div className="h-8 w-8 rounded-full bg-gray-700 flex items-center justify-center transition-all duration-200 group-hover:bg-gray-600">
                  <span className="text-sm font-medium text-gray-300">A</span>
                </div>
              </Link>
            </div>
          )}
        </div>
      </div>
      
      {/* Mobile Sidebar */}
      {isMenuOpen && (
        <>
          <div 
            className="lg:hidden fixed inset-0 z-10 bg-black bg-opacity-70 animate-fadeIn" 
            onClick={toggleMenu}
          />
          
          <div 
            className="lg:hidden fixed inset-y-0 left-0 w-64 bg-gray-900 shadow-xl z-20 animate-slideInLeft" 
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between h-16 border-b border-gray-800 px-4">
              <div className="flex items-center">
                <Car className="h-8 w-8 text-gray-300" />
                <span className="ml-2 text-lg font-semibold text-gray-100">Car Rental</span>
              </div>
              <button 
                onClick={toggleMenu}
                className="p-1 rounded-md text-gray-400 hover:text-white hover:bg-gray-800 focus:outline-none transition-all duration-200 hover:scale-110 active:scale-95"
              >
                <X size={20} />
              </button>
            </div>
            
            <div className="flex flex-col flex-1 overflow-y-auto">
              <nav className="flex-1 px-2 py-4 space-y-1">
                {navItems.map((item, index) => (
                  <div
                    key={item.id}
                    className="animate-slideInUp opacity-0"
                    style={{ animationDelay: `${index * 100}ms`, animationFillMode: 'forwards' }}
                  >
                    <Link
                      to={item.path}
                      className={`flex items-center px-4 py-3 text-sm font-medium rounded-md transition-all duration-200 ${
                        currentPage === item.id
                          ? 'bg-gray-800 text-white'
                          : 'text-gray-300 hover:bg-gray-800 hover:text-white'
                      }`}
                      onClick={toggleMenu}
                    >
                      <span className="mr-3">{item.icon}</span>
                      {item.name}
                    </Link>
                  </div>
                ))}
              </nav>
              
              <div className="px-4 py-4 border-t border-gray-800">
                <button
                  onClick={handleSignOut}
                  className="flex items-center w-full px-4 py-3 text-sm font-medium text-gray-300 rounded-md hover:bg-gray-800 hover:text-white transition-all duration-200 hover:scale-102 active:scale-98"
                >
                  <LogOut size={20} className="mr-3" />
                  Log Out
                </button>
              </div>
              
              <div className="flex items-center px-4 py-4 border-t border-gray-800">
                <Link to="/profile" className="flex items-center group" onClick={toggleMenu}>
                  <div className="h-8 w-8 rounded-full bg-gray-700 flex items-center justify-center transition-all duration-200 group-hover:bg-gray-600">
                    <span className="text-sm font-medium text-gray-300">A</span>
                  </div>
                  <div className="ml-3">
                    <p className="text-sm font-medium text-gray-300 group-hover:text-white transition-colors duration-200">Admin</p>
                    <p className="text-xs text-gray-500 group-hover:text-gray-400 transition-colors duration-200">View Profile</p>
                  </div>
                </Link>
              </div>
            </div>
          </div>
        </>
      )}
    </>
  );
};

export default Sidebar;