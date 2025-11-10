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

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.gmail)) {
      setError("Please enter a valid email address");
      return;
    }

    setIsSubmitting(true);
    setError("");

    try {
      console.log("🔐 Attempting login for:", formData.gmail);
      
      const loginData = {
        gmail: formData.gmail,
        password: formData.password
      };

      console.log("📤 Sending login data:", loginData);

      const response = await fetch('https://hotelbookingsystem-backend-4c8d.onrender.com/api/register/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(loginData)
      });

      console.log("📥 Response status:", response.status);
      console.log("📥 Response ok:", response.ok);

      const data = await response.json();
      console.log("📥 Full API Response:", data);

      if (!response.ok) {
        // Handle different types of error responses
        if (data.errors) {
          const errorMessages = Object.values(data.errors).flat().join(', ');
          throw new Error(errorMessages);
        }
        throw new Error(data.message || data.error || `Login failed with status: ${response.status}`);
      }

      // Login successful
      console.log("✅ Login successful:", data);
      
      // Store user data and token in localStorage
      const userData = data.user || data.data;
      if (userData && (data.token || data.accessToken)) {
        const userProfile = {
          id: userData._id || userData.id,
          name: userData.name,
          email: userData.gmail || userData.email,
          gmail: userData.gmail || userData.email,
          phone: userData.number || userData.phone,
          number: userData.number || userData.phone,
          joinDate: userData.createdAt || new Date().toISOString(),
          bookings: userData.bookings || []
        };

        const authToken = data.token || data.accessToken;

        // Store authentication data
        localStorage.setItem('isLoggedIn', 'true');
        localStorage.setItem('currentUser', JSON.stringify(userProfile));
        localStorage.setItem('authToken', authToken);
        localStorage.setItem('userProfile', JSON.stringify(userProfile));
        
        // Update registeredUsers for compatibility
        let registeredUsers = JSON.parse(localStorage.getItem('registeredUsers') || '[]');
        const existingUserIndex = registeredUsers.findIndex(user => user.email === userProfile.email);
        
        if (existingUserIndex === -1) {
          registeredUsers.push(userProfile);
        } else {
          registeredUsers[existingUserIndex] = userProfile;
        }
        
        localStorage.setItem('registeredUsers', JSON.stringify(registeredUsers));

        console.log("📦 User data stored:", userProfile);
      }

      if (rememberMe) {
        localStorage.setItem('rememberMe', 'true');
        localStorage.setItem('rememberedUser', JSON.stringify(formData.gmail));
      } else {
        localStorage.removeItem('rememberMe');
        localStorage.removeItem('rememberedUser');
      }
      
      console.log("🎉 Login successful! User:", userData?.name);
      setShowModal(true);
      
    } catch (error) {
      console.error("❌ Error during login:", error);
      
      // More specific error messages
      if (error.message.includes('NetworkError') || error.message.includes('Failed to fetch')) {
        setError("Network error: Unable to connect to server. Please check your internet connection.");
      } else if (error.message.includes('invalid') || error.message.includes('credentials') || error.message.includes('password')) {
        setError("Invalid email or password. Please check your credentials and try again.");
      } else if (error.message.includes('not found') || error.message.includes('exist')) {
        setError("No account found with this email. Please check your email or register for a new account.");
      } else {
        setError(error.message || "Login failed. Please check your credentials and try again.");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  // Test API connection
  const testAPIConnection = async () => {
    try {
      console.log("🔍 Testing login API connection...");
      const response = await fetch('https://hotelbookingsystem-backend-4c8d.onrender.com/api/register/login', {
        method: 'OPTIONS' // Use OPTIONS to test CORS and connectivity without actual login
      });
      console.log("Login API Test Response:", response.status);
      if (response.ok) {
        console.log("✅ Login API is reachable");
        alert("Login API is reachable! Status: " + response.status);
      } else {
        console.log("❌ Login API returned error:", response.status);
        alert("Login API error. Status: " + response.status);
      }
    } catch (error) {
      console.error("❌ Login API connection test failed:", error);
      alert("Login API connection failed: " + error.message);
    }
  };

  const handleModalClose = () => {
    setShowModal(false);
    
    // Trigger storage event to update all components
    window.dispatchEvent(new Event('storage'));
    
    // Trigger custom auth event
    window.dispatchEvent(new CustomEvent('authStateChange', {
      detail: { 
        isLoggedIn: true, 
        user: JSON.parse(localStorage.getItem('currentUser') || '{}') 
      }
    }));
    
    navigate('/', { replace: true });
  };

  // Load remembered email on component mount
  React.useEffect(() => {
    const remembered = localStorage.getItem('rememberMe');
    const rememberedUser = localStorage.getItem('rememberedUser');
    
    if (remembered === 'true' && rememberedUser) {
      setRememberMe(true);
      setFormData(prev => ({
        ...prev,
        gmail: rememberedUser
      }));
    }
  }, []);

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
          
          {/* Debug button - remove in production */}
          <button 
            onClick={testAPIConnection}
            className="mt-2 px-4 py-2 bg-gray-600 text-white rounded text-sm hover:bg-gray-700 transition-colors"
          >
            Test Login API Connection
          </button>
        </div>

        <form onSubmit={handleSubmit} className="bg-white/20 backdrop-blur-md shadow-2xl rounded-2xl border border-white/30 p-8 space-y-6">
          {/* Error Message */}
          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative">
              <strong className="block">Error:</strong> {error}
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
