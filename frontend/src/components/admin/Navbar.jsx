import React, { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { IoHome, IoLogOut, IoPerson, IoMenu, IoClose, IoLogIn } from "react-icons/io5";
import { FaHotel, FaList } from "react-icons/fa";
import { BsReceipt } from "react-icons/bs";

const Navbar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  // Check login status and user data on component mount and storage changes
  useEffect(() => {
    const checkAuthStatus = () => {
      const loggedIn = localStorage.getItem('isLoggedIn') === 'true';
      const userData = localStorage.getItem('currentUser');
      
      setIsLoggedIn(loggedIn);
      
      if (userData) {
        try {
          setCurrentUser(JSON.parse(userData));
        } catch (error) {
          console.error("Error parsing user data:", error);
          setCurrentUser(null);
        }
      } else {
        setCurrentUser(null);
      }
    };

    // Check immediately
    checkAuthStatus();

    // Listen for storage changes (when login/logout happens in other components)
    const handleStorageChange = () => {
      checkAuthStatus();
    };

    window.addEventListener('storage', handleStorageChange);
    
    // Also check periodically (in case the event doesn't fire)
    const interval = setInterval(checkAuthStatus, 1000);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      clearInterval(interval);
    };
  }, []);

  // Navigation items for logged-in users (Admin)
  const adminNavItems = [
    {
      path: "/admin",
      label: "Dashboard",
      icon: <IoHome className="w-5 h-5" />,
    },
    {
      path: "/hotels",
      label: "Hotels",
      icon: <FaList className="w-5 h-5" />,
    },
    {
      path: "/orders",
      label: "Orders",
      icon: <BsReceipt className="w-5 h-5" />,
    },
  ];

  // Navigation items for logged-out users (Public)
  const publicNavItems = [
    {
      path: "/admin",
      label: "Dashboard",
      icon: <IoHome className="w-5 h-5" />,
    },
    {
      path: "/hotels",
      label: "Hotels",
      icon: <FaList className="w-5 h-5" />,
    },
    {
      path: "/orders",
      label: "Orders",
      icon: <BsReceipt className="w-5 h-5" />,
    },
  ];

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const handleLogout = () => {
    console.log("Logging out user:", currentUser?.name);
    
    // Clear all auth-related data from localStorage
    localStorage.removeItem('isLoggedIn');
    localStorage.removeItem('currentUser');
    localStorage.removeItem('authToken');
    localStorage.removeItem('rememberMe');
    
    // Keep userProfile and registeredUsers so they can login again
    
    // Update state
    setCurrentUser(null);
    setIsLoggedIn(false);
    
    // Trigger storage event to update other components
    window.dispatchEvent(new Event('storage'));
    
    // Close mobile menu
    setIsMobileMenuOpen(false);
    
    // Redirect to home page
    navigate('/');
    
    console.log("Logout successful");
  };

  const handleLogin = () => {
    navigate('/login');
    setIsMobileMenuOpen(false);
  };

  const handleRegister = () => {
    navigate('/register');
    setIsMobileMenuOpen(false);
  };

  // Use appropriate nav items based on login status
  const navItems = isLoggedIn ? adminNavItems : publicNavItems;

  return (
    <nav className="bg-gray-800 text-white shadow-lg sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo/Brand */}
          <Link 
            to="/" 
            className="flex items-center space-x-3 hover:opacity-80 transition-opacity duration-200"
          >
            <div className="bg-blue-600 p-2 rounded-lg">
              <FaHotel className="w-6 h-6" />
            </div>
            <h1 className="text-xl font-bold text-white">
              {isLoggedIn ? "Hotel Admin" : "Hotel Booking"}
            </h1>
          </Link>

          {/* Desktop Navigation Links */}
          <div className="hidden md:block">
            <ul className="flex space-x-2">
              {navItems.map((item) => (
                <li key={item.path}>
                  <Link
                    to={item.path}
                    className={`flex items-center space-x-2 px-4 py-2 rounded-md text-sm font-medium transition-all duration-200 hover:bg-gray-700 
                    }`}
                  >
                    {item.icon}
                    <span>{item.label}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Desktop User/Auth Section */}
          <div className="hidden md:flex items-center space-x-4">
            {isLoggedIn ? (
              // Logged-in user section
              <>
                <div className="flex items-center space-x-2 text-gray-300 bg-gray-700 px-3 py-2 rounded-md border border-gray-600">
                  <IoPerson className="w-4 h-4" />
                  <span className="text-sm font-medium">
                    {currentUser ? currentUser.name : 'Loading...'}
                  </span>
                </div>
                <button 
                  onClick={handleLogout}
                  className="flex items-center space-x-2 bg-red-600 hover:bg-red-700 px-4 py-2 rounded text-sm font-medium transition-all duration-200 hover:shadow-lg transform hover:scale-105"
                >
                  <IoLogOut className="w-4 h-4" />
                  <span>Logout</span>
                </button>
              </>
            ) : (
              // Logged-out user section
              <>
                <button 
                  onClick={handleLogin}
                  className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded text-sm font-medium transition-all duration-200 hover:shadow-lg transform hover:scale-105"
                >
                  <IoLogIn className="w-4 h-4" />
                  <span>Login</span>
                </button>
                <button 
                  onClick={handleRegister}
                  className="flex items-center space-x-2 bg-green-600 hover:bg-green-700 px-4 py-2 rounded text-sm font-medium transition-all duration-200 hover:shadow-lg transform hover:scale-105"
                >
                  <IoPerson className="w-4 h-4" />
                  <span>Register</span>
                </button>
              </>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button 
              onClick={toggleMobileMenu}
              className="text-gray-300 hover:text-white p-2 rounded-md hover:bg-gray-700 transition duration-200"
            >
              {isMobileMenuOpen ? (
                <IoClose className="w-6 h-6" />
              ) : (
                <IoMenu className="w-6 h-6" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Navigation Menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden bg-gray-800 rounded-lg mb-2 shadow-xl border border-gray-700">
            <ul className="flex flex-col space-y-2 py-4">
              {/* Navigation Links */}
              {navItems.map((item) => (
                <li key={item.path}>
                  <Link
                    to={item.path}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className={`flex items-center space-x-3 px-6 py-3 text-base font-medium transition-all duration-200 hover:bg-gray-700 ${
                      location.pathname === item.path ? 'bg-gray-700 text-white' : 'text-gray-300'
                    }`}
                  >
                    {item.icon}
                    <span>{item.label}</span>
                  </Link>
                </li>
              ))}
              
              {/* Mobile Auth Section */}
              <li className="border-t border-gray-700 pt-4 mt-2">
                {isLoggedIn ? (
                  // Logged-in mobile section
                  <>
                    <div className="flex items-center space-x-3 px-6 py-3 text-gray-300 bg-gray-700 mx-4 rounded-md mb-2">
                      <IoPerson className="w-5 h-5" />
                      <span className="text-base font-medium">
                        {currentUser ? currentUser.name : 'Loading...'}
                      </span>
                    </div>
                    <button 
                      onClick={() => {
                        handleLogout();
                        setIsMobileMenuOpen(false);
                      }}
                      className="flex items-center space-x-3 px-6 py-3 text-base font-medium text-red-400 hover:text-red-300 hover:bg-gray-700 w-full transition duration-200"
                    >
                      <IoLogOut className="w-5 h-5" />
                      <span>Logout</span>
                    </button>
                  </>
                ) : (
                  // Logged-out mobile section
                  <>
                    <button 
                      onClick={handleLogin}
                      className="flex items-center space-x-3 px-6 py-3 text-base font-medium text-blue-400 hover:text-blue-300 hover:bg-gray-700 w-full transition duration-200"
                    >
                      <IoLogIn className="w-5 h-5" />
                      <span>Login</span>
                    </button>
                    <button 
                      onClick={handleRegister}
                      className="flex items-center space-x-3 px-6 py-3 text-base font-medium text-green-400 hover:text-green-300 hover:bg-gray-700 w-full transition duration-200"
                    >
                      <IoPerson className="w-5 h-5" />
                      <span>Register</span>
                    </button>
                  </>
                )}
              </li>
            </ul>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;