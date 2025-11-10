import React, { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { FaHotel, FaStar, FaUser, FaSignOutAlt, FaEdit } from "react-icons/fa";
import { IoIosHome } from "react-icons/io";
import { MdContactPage } from "react-icons/md";
import { BiSolidCartAdd } from "react-icons/bi";

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isProfileOpen, setProfileOpen] = useState(false);
  const [user, setUser] = useState(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  // Enhanced auth status checking
  const checkAuthStatus = () => {
    try {
      const loggedIn = localStorage.getItem('isLoggedIn') === 'true';
      const userData = localStorage.getItem('currentUser') || localStorage.getItem('userProfile');
      
      console.log("Navbar: Checking auth status - LoggedIn:", loggedIn, "UserData:", userData);
      
      setIsLoggedIn(loggedIn);
      if (userData) {
        const parsedUser = JSON.parse(userData);
        setUser(parsedUser);
        console.log("Navbar: User set to:", parsedUser.name);
      } else {
        setUser(null);
        setIsLoggedIn(false);
      }
    } catch (error) {
      console.error("Navbar: Error checking auth status:", error);
      setUser(null);
      setIsLoggedIn(false);
    }
  };

  // Check auth status on component mount and when location changes
  useEffect(() => {
    checkAuthStatus();
  }, [location]);

  // Listen for storage changes and custom auth events
  useEffect(() => {
    const handleStorageChange = () => {
      console.log("Navbar: Storage changed, updating auth status");
      checkAuthStatus();
    };

    const handleAuthStateChange = (event) => {
      console.log("Navbar: Auth state change event received", event.detail);
      setIsLoggedIn(event.detail.isLoggedIn);
      setUser(event.detail.user);
    };

    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('authStateChange', handleAuthStateChange);
    
    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('authStateChange', handleAuthStateChange);
    };
  }, []);

  // Also check auth status periodically to catch any missed updates
  useEffect(() => {
    const interval = setInterval(() => {
      checkAuthStatus();
    }, 2000); // Check every 2 seconds

    return () => clearInterval(interval);
  }, []);

  const logout = () => {
    console.log("Logging out...");
    localStorage.removeItem('isLoggedIn');
    localStorage.removeItem('currentUser');
    localStorage.removeItem('userProfile');
    localStorage.removeItem('authToken');
    
    // Dispatch events to notify other components
    window.dispatchEvent(new Event('storage'));
    window.dispatchEvent(new CustomEvent('authStateChange', {
      detail: { isLoggedIn: false, user: null }
    }));
    
    setIsLoggedIn(false);
    setUser(null);
    setProfileOpen(false);
    navigate('/');
  };

  const deleteAccount = () => {
    if (window.confirm("Are you sure you want to delete your account? This action cannot be undone.")) {
      localStorage.removeItem('isLoggedIn');
      localStorage.removeItem('currentUser');
      localStorage.removeItem('userProfile');
      localStorage.removeItem('authToken');
      localStorage.removeItem('roomCart');
      
      // Dispatch events to notify other components
      window.dispatchEvent(new Event('storage'));
      window.dispatchEvent(new CustomEvent('authStateChange', {
        detail: { isLoggedIn: false, user: null }
      }));
      
      setIsLoggedIn(false);
      setUser(null);
      setProfileOpen(false);
      alert("Account deleted successfully");
      navigate('/');
    }
  };

  const getInitials = (name) => {
    if (!name) return 'U';
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  // Close profile dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (isProfileOpen && !event.target.closest('.profile-dropdown')) {
        setProfileOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isProfileOpen]);

  return (
    <nav className="bg-gray-800 shadow-lg sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-22">
          {/* Logo */}
          <div>
            <div className="flex gap-3">
              <FaHotel className="text-2xl text-white mt-1" />
              <h1 className="text-2xl font-bold text-white">
                <Link to="/">Hotel-Booking</Link>
              </h1>
            </div>
          </div>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center space-x-8">
            <div className="flex gap-1 items-center px-1">
              <IoIosHome className="font-medium text-white -mt-1" />
              <p className="text-white hover:underline font-medium cursor-pointer transition-colors duration-200 hover:scale-105">
                <Link to="/">Home</Link>
              </p>
            </div>
            <div className="flex gap-1 items-center px-1">
              <FaHotel className="text-sm text-white" />
              <p className="text-white hover:underline font-medium cursor-pointer transition-colors duration-200 hover:scale-105">
                <Link to="/rooms">Rooms</Link>
              </p>
            </div>
            <div className="flex gap-1 items-center px-1">
              <FaStar className="text-xl text-white" />
              <p className="text-white hover:underline font-medium cursor-pointer transition-colors duration-200 hover:scale-105">
                <Link to="/about">About</Link>
              </p>
            </div>
            <div className="flex gap-1 items-center px-1">
              <MdContactPage className="text-xl text-white" />
              <p className="text-white hover:underline font-medium cursor-pointer transition-colors duration-200 hover:scale-105">
                <Link to="/contact">Contact</Link>
              </p>
            </div>
          </div>

          {/* Desktop Actions */}
          <div className="hidden md:flex items-center space-x-4">
            <div className="cursor-pointer p-2 rounded-full hover:bg-gray-700 transition-colors duration-200">
              <Link to="/addcart">
                <BiSolidCartAdd className="w-6 h-6 text-white" />
              </Link>
            </div>
            
            {isLoggedIn && user ? (
              <div className="relative profile-dropdown">
                <button 
                  onClick={() => setProfileOpen(!isProfileOpen)} 
                  className="flex items-center space-x-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white px-4 py-2 rounded-lg font-semibold hover:from-blue-700 hover:to-purple-700 transition-all duration-200 transform hover:scale-105 shadow-lg hover:shadow-xl"
                >
                  <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center text-sm font-bold">
                    {getInitials(user.name)}
                  </div>
                  <span>{user.name ? user.name.split(' ')[0] : 'User'}</span>
                </button>

                {/* Profile Dropdown */}
                {isProfileOpen && (
                  <div className="absolute right-0 top-12 mt-2 w-64 bg-white rounded-xl shadow-2xl border border-gray-200 z-50 overflow-hidden">
                    {/* Profile Header */}
                    <div className="bg-gradient-to-br from-blue-600 to-purple-600 p-4 text-white">
                      <div className="flex items-center space-x-3">
                        <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center text-lg font-bold">
                          {getInitials(user.name)}
                        </div>
                        <div>
                          <h3 className="font-semibold text-lg">{user.name || 'User'}</h3>
                          <p className="text-sm text-blue-100">{user.email || user.gmail}</p>
                          <p className="text-xs text-blue-200">
                            Member since {new Date(user.joinDate || user.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Profile Actions */}
                    <div className="py-2">
                      <Link 
                        to="/profile" 
                        className="flex items-center w-full px-4 py-3 text-gray-700 hover:bg-gray-100 transition-all duration-200 group"
                        onClick={() => setProfileOpen(false)}
                      >
                        <FaUser className="w-4 h-4 mr-3 text-gray-500 group-hover:text-blue-600" />
                        View Profile
                      </Link>
                      
                      <Link 
                        to="/profile" 
                        className="flex items-center w-full px-4 py-3 text-gray-700 hover:bg-gray-100 transition-all duration-200 group"
                        onClick={() => setProfileOpen(false)}
                      >
                        <FaEdit className="w-4 h-4 mr-3 text-gray-500 group-hover:text-green-600" />
                        Edit Profile
                      </Link>
                      
                      <Link 
                        to="/booking" 
                        className="flex items-center w-full px-4 py-3 text-gray-700 hover:bg-gray-100 transition-all duration-200 group"
                        onClick={() => setProfileOpen(false)}
                      >
                        <svg className="w-4 h-4 mr-3 text-gray-500 group-hover:text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/>
                        </svg>
                        My Bookings
                      </Link>

                      <hr className="my-2" />
                      
                      <button
                        onClick={deleteAccount}
                        className="flex items-center w-full px-4 py-3 text-gray-700 hover:bg-red-50 hover:text-red-600 transition-all duration-200 group"
                      >
                        <svg className="w-4 h-4 mr-3 text-gray-500 group-hover:text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
                        </svg>
                        Delete Account
                      </button>
                      
                      <button
                        onClick={logout}
                        className="flex items-center w-full px-4 py-3 text-gray-700 hover:bg-gray-100 transition-all duration-200 group"
                      >
                        <FaSignOutAlt className="w-4 h-4 mr-3 text-gray-500 group-hover:text-blue-600" />
                        Logout
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <button 
                onClick={() => navigate('/login')} 
                className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-5 py-2 rounded-lg font-semibold hover:from-blue-700 hover:to-purple-700 transition-all duration-200 transform hover:scale-105 shadow-lg hover:shadow-xl"
              >
                Sign In
              </button>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center space-x-2">
            <div className="cursor-pointer p-2 rounded-full hover:bg-gray-700 transition-colors duration-200">
              <Link to="/addcart">
                <BiSolidCartAdd className="w-6 h-6 text-white" />
              </Link>
            </div>
            <button
              className="inline-flex items-center justify-center p-2 rounded-md text-gray-300 hover:text-white hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500 transition-colors duration-200"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              <svg
                className="h-6 w-6"
                stroke="currentColor"
                fill="none"
                viewBox="0 0 24 24"
              >
                {isMenuOpen ? (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                ) : (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 6h16M4 12h16M4 18h16"
                  />
                )}
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden">
            <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 bg-gray-800 border-t border-gray-700">
              <Link
                to="/"
                className="text-gray-300 hover:text-white hover:bg-gray-700 block px-3 py-2 rounded-md text-base font-medium transition-colors duration-200"
                onClick={() => setIsMenuOpen(false)}
              >
                Home
              </Link>
              <Link
                to="/rooms"
                className="text-gray-300 hover:text-white hover:bg-gray-700 block px-3 py-2 rounded-md text-base font-medium transition-colors duration-200"
                onClick={() => setIsMenuOpen(false)}
              >
                Rooms
              </Link>
              <Link
                to="/about"
                className="text-gray-300 hover:text-white hover:bg-gray-700 block px-3 py-2 rounded-md text-base font-medium transition-colors duration-200"
                onClick={() => setIsMenuOpen(false)}
              >
                About
              </Link>
              <Link
                to="/contact"
                className="text-gray-300 hover:text-white hover:bg-gray-700 block px-3 py-2 rounded-md text-base font-medium transition-colors duration-200"
                onClick={() => setIsMenuOpen(false)}
              >
                Contact
              </Link>
              {isLoggedIn ? (
                <>
                  <Link
                    to="/profile"
                    className="text-gray-300 hover:text-white hover:bg-gray-700 block px-3 py-2 rounded-md text-base font-medium transition-colors duration-200"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Profile
                  </Link>
                  <Link
                    to="/booking"
                    className="text-gray-300 hover:text-white hover:bg-gray-700 block px-3 py-2 rounded-md text-base font-medium transition-colors duration-200"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    My Bookings
                  </Link>
                  <button
                    onClick={logout}
                    className="w-full text-left text-gray-300 hover:text-white hover:bg-gray-700 block px-3 py-2 rounded-md text-base font-medium transition-colors duration-200"
                  >
                    Logout
                  </button>
                </>
              ) : (
                <div className="px-3 py-2">
                  <button className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white px-4 py-2 rounded-full font-semibold hover:from-blue-700 hover:to-purple-700 transition-all duration-200 transform hover:scale-105 shadow-lg">
                    <Link to="/login" className="block w-full">Sign In</Link>
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;