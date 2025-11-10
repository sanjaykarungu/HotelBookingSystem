import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

const Login = () => {
  const [formData, setFormData] = useState({
    gmail: "",
    password: ""
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
    if (error) setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validation
    if (!formData.gmail || !formData.password) {
      setError("Email and password are required!");
      return;
    }

    setIsSubmitting(true);
    setError("");

    try {
      console.log("🔐 Attempting login for:", formData.gmail);
      
      // Use the login endpoint from your backend API
      const response = await fetch('https://hotel-booking-sigma-wine.vercel.app/api/register/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          gmail: formData.gmail,
          password: formData.password
        })
      });

      const data = await response.json();
      
      console.log("API Response:", data);

      if (!response.ok) {
        throw new Error(data.message || 'Login failed');
      }

      // Login successful
      console.log("✅ Login successful:", data);
      
      // Store user data and token in localStorage
      if (data.data && data.token) {
        localStorage.setItem('isLoggedIn', 'true');
        localStorage.setItem('currentUser', JSON.stringify(data.data));
        localStorage.setItem('authToken', data.token);
        localStorage.setItem('userProfile', JSON.stringify(data.data));
        
        // Also update registeredUsers for compatibility
        const userProfile = {
          id: data.data._id,
          name: data.data.name,
          email: data.data.gmail,
          phone: data.data.number,
          joinDate: data.data.createdAt || new Date().toISOString(),
          bookings: []
        };
        
        let registeredUsers = JSON.parse(localStorage.getItem('registeredUsers') || '[]');
        const existingUserIndex = registeredUsers.findIndex(user => user.email === data.data.gmail);
        
        if (existingUserIndex === -1) {
          registeredUsers.push(userProfile);
        } else {
          registeredUsers[existingUserIndex] = userProfile;
        }
        
        localStorage.setItem('registeredUsers', JSON.stringify(registeredUsers));
      }

      if (rememberMe) {
        localStorage.setItem('rememberMe', 'true');
      }
      
      console.log("🎉 Login successful! User:", data.data.name);
      setShowModal(true);
      
    } catch (error) {
      console.error("❌ Error during login:", error);
      setError(error.message || "Login failed. Please check your credentials and try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleModalClose = () => {
    setShowModal(false);
    window.dispatchEvent(new Event('storage'));
    navigate('/', { replace: true });
  };

  return (
    <div className="min-h-screen py-12 px-4 sm:px-6 lg:px-8 bg-cover bg-center" style={{backgroundImage: 'url("https://i.pinimg.com/736x/1e/f2/55/1ef255bcbb8a6af42634e88867b3e076.jpg")'}}>
      {/* Success Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-8 max-w-md mx-4">
            <div className="text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                </svg>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-2">Login Successful!</h3>
              <p className="text-gray-600 mb-6">Welcome back to Hotel Booking!</p>
              <button
                onClick={handleModalClose}
                className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-6 rounded-lg transition-colors duration-200"
              >
                Continue to Home
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="max-w-md mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-white mb-2 drop-shadow-lg">Welcome Back</h1>
          <p className="text-gray-200 drop-shadow-md">Sign in to your account</p>
        </div>

        <form onSubmit={handleSubmit} className="bg-white/20 backdrop-blur-md shadow-2xl rounded-2xl border border-white/30 p-8 space-y-6">
          {/* Error Message */}
          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative">
              {error}
            </div>
          )}

          <div>
            <label htmlFor="gmail" className="block text-sm font-bold text-white mb-1 drop-shadow-sm">
              Email Address *
            </label>
            <input
              type="email"
              id="gmail"
              name="gmail"
              value={formData.gmail}
              onChange={handleChange}
              required
              className="w-full px-3 py-3 border-2 border-gray-300 text-black rounded-lg bg-white transition-colors duration-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
              placeholder="Enter your registered email"
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-bold text-white mb-1 drop-shadow-sm">
              Password *
            </label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              required
              className="w-full px-3 py-3 border-2 border-gray-300 text-black rounded-lg bg-white transition-colors duration-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
              placeholder="Enter your password"
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <input
                type="checkbox"
                id="rememberMe"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="w-4 h-4 text-blue-600 bg-white border-2 border-gray-300 rounded focus:ring-blue-500 focus:ring-2"
              />
              <label htmlFor="rememberMe" className="ml-2 text-sm font-medium text-white drop-shadow-sm">
                Remember me
              </label>
            </div>
            <button 
              type="button"
              className="text-sm text-blue-200 hover:text-white font-medium drop-shadow-sm transition-colors duration-200"
            >
              Forgot password?
            </button>
          </div>

          <div className="pt-4">
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-4 rounded-lg border-2 border-blue-600 transition-all duration-200 text-lg disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? 'Signing In...' : 'Sign In'}
            </button>
          </div>

          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-white/30"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-transparent text-white">Or continue with</span>
            </div>
          </div>
        </form>

        <div className="text-center mt-6">
          <p className="text-white font-bold drop-shadow-md">
            Don't have an account?{' '}
            <Link to="/register" className="text-blue-200 hover:text-white font-semibold underline transition-colors duration-200">
              Sign up here
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;