import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

const Register = () => {
  const [formData, setFormData] = useState({
    name: "",
    gmail: "",
    number: "",
    password: "",
    confirm_password: ""
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
    if (error) setError("");
    if (success) setSuccess("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Enhanced validation
    if (!formData.name || !formData.gmail || !formData.password || !formData.confirm_password) {
      setError("All fields marked with * are required!");
      return;
    }

    if (formData.password !== formData.confirm_password) {
      setError("Passwords do not match!");
      return;
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.gmail)) {
      setError("Please enter a valid email address");
      return;
    }

    // Phone validation
    const phoneRegex = /^\d{10}$/;
    if (formData.number && !phoneRegex.test(formData.number.replace(/\D/g, ''))) {
      setError("Please enter a valid 10-digit phone number");
      return;
    }

    // Password strength validation
    if (formData.password.length < 6) {
      setError("Password must be at least 6 characters long");
      return;
    }

    setIsSubmitting(true);
    setError("");
    setSuccess("");

    try {
      console.log("🔄 Starting registration process...");
      console.log("Sending data:", formData);
      
      // Prepare the data for the API
      const apiData = {
        name: formData.name,
        gmail: formData.gmail,
        number: formData.number || "", // Send empty string if no number
        password: formData.password
      };

      console.log("📤 Sending to API:", apiData);

      const response = await fetch('https://hotelbookingsystem-backend-4c8d.onrender.com/api/register/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(apiData)
      });

      console.log("📥 Response status:", response.status);
      console.log("📥 Response ok:", response.ok);

      const data = await response.json();
      console.log("📥 Full API Response:", data);

      if (!response.ok) {
        // Handle different types of error responses
        if (data.errors) {
          // If there are validation errors from the backend
          const errorMessages = Object.values(data.errors).flat().join(', ');
          throw new Error(errorMessages);
        }
        throw new Error(data.message || data.error || `Registration failed with status: ${response.status}`);
      }

      // Registration successful
      console.log("✅ Registration successful:", data);
      
      // Store user data in localStorage for immediate login
      if (data.user || data.data) {
        const userData = data.user || data.data;
        const userProfile = {
          id: userData._id || userData.id,
          name: userData.name,
          email: userData.gmail || userData.email,
          gmail: userData.gmail || userData.email,
          phone: userData.number || userData.phone,
          number: userData.number || userData.phone,
          joinDate: new Date().toISOString(),
          bookings: [],
          createdAt: userData.createdAt || new Date().toISOString()
        };

        // Store all authentication data
        localStorage.setItem('isLoggedIn', 'true');
        localStorage.setItem('currentUser', JSON.stringify(userProfile));
        localStorage.setItem('userProfile', JSON.stringify(userProfile));
        localStorage.setItem('authToken', data.token || data.accessToken);
        
        // Store in registeredUsers array for compatibility
        let allUsers = JSON.parse(localStorage.getItem('registeredUsers') || '[]');
        // Remove existing user if any
        allUsers = allUsers.filter(user => user.email !== userProfile.email);
        allUsers.push(userProfile);
        localStorage.setItem('registeredUsers', JSON.stringify(allUsers));

        console.log("📦 User data stored in localStorage:", userProfile);
        
        // Force storage event to update Navbar and other components
        window.dispatchEvent(new Event('storage'));
        
        // Force a state update by triggering a custom event
        window.dispatchEvent(new CustomEvent('authStateChange', {
          detail: { isLoggedIn: true, user: userProfile }
        }));
      }
      
      setSuccess("Registration successful! Redirecting to home page...");
      
      setTimeout(() => {
        console.log("📍 Redirecting to home page...");
        navigate('/', { replace: true });
      }, 1500);
      
    } catch (error) {
      console.error("❌ Error during registration:", error);
      
      // More specific error messages
      if (error.message.includes('NetworkError') || error.message.includes('Failed to fetch')) {
        setError("Network error: Unable to connect to server. Please check your internet connection.");
      } else if (error.message.includes('email already exists') || error.message.includes('duplicate')) {
        setError("This email is already registered. Please use a different email or try logging in.");
      } else {
        setError(error.message || "Registration failed. Please try again.");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  // Test API connection
  const testAPIConnection = async () => {
    try {
      console.log("🔍 Testing API connection...");
      const response = await fetch('https://hotelbookingsystem-backend-4c8d.onrender.com/api/register/');
      console.log("API Test Response:", response.status);
      if (response.ok) {
        console.log("✅ API is reachable");
      } else {
        console.log("❌ API returned error:", response.status);
      }
    } catch (error) {
      console.error("❌ API connection test failed:", error);
    }
  };

  // Uncomment the line below to test API connection on component mount
  // React.useEffect(() => { testAPIConnection(); }, []);

  return (
    <div className="min-h-screen py-12 px-4 sm:px-6 lg:px-8 bg-cover object-cover" style={{backgroundImage: 'url("https://i.pinimg.com/736x/1e/f2/55/1ef255bcbb8a6af42634e88867b3e076.jpg")'}}>
      <div className="max-w-md mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-white mb-2 drop-shadow-lg">Create Your Account</h1>
          <p className="text-gray-200 drop-shadow-md">Join us today and start your journey</p>
          
          {/* Debug button - remove in production */}
          <button 
            onClick={testAPIConnection}
            className="mt-2 px-4 py-2 bg-gray-600 text-white rounded text-sm"
          >
            Test API Connection
          </button>
        </div>

        <form onSubmit={handleSubmit} className="bg-white/20 backdrop-blur-md shadow-2xl rounded-2xl border border-white/30 p-8 space-y-6">
          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative">
              <strong className="block">Error:</strong> {error}
            </div>
          )}

          {success && (
            <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative">
              <strong className="block">Success:</strong> {success}
            </div>
          )}

          <div>
            <label htmlFor="name" className="block text-sm font-bold text-white mb-1 drop-shadow-sm">
              Full Name *
            </label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
              className="w-full px-3 py-3 border-2 border-gray-300 text-black rounded-lg bg-white transition-colors duration-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
              placeholder="Enter your full name"
            />
          </div>

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
              placeholder="Enter your email"
            />
          </div>

          <div>
            <label htmlFor="number" className="block text-sm font-bold text-white mb-1 drop-shadow-sm">
              Phone Number
            </label>
            <input
              type="tel"
              id="number"
              name="number"
              value={formData.number}
              onChange={handleChange}
              className="w-full px-3 py-3 border-2 border-gray-300 text-black rounded-lg bg-white transition-colors duration-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
              placeholder="Enter your phone number (optional)"
            />
          </div>

          <div className="space-y-4">
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
                minLength="6"
                required
                className="w-full px-3 py-3 border-2 border-gray-300 text-black rounded-lg bg-white transition-colors duration-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                placeholder="Create password (min. 6 characters)"
              />
            </div>
            <div>
              <label htmlFor="confirm_password" className="block text-sm font-bold text-white mb-1 drop-shadow-sm">
                Confirm Password *
              </label>
              <input
                type="password"
                id="confirm_password"
                name="confirm_password"
                value={formData.confirm_password}
                onChange={handleChange}
                required
                minLength="6"
                className="w-full px-3 py-3 border-2 border-gray-300 text-black rounded-lg bg-white transition-colors duration-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                placeholder="Confirm your password"
              />
            </div>
          </div>

          <div className="pt-4">
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-4 rounded-lg border-2 border-blue-600 transition-all duration-200 text-lg disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? 'Creating Account...' : 'Create Account'}
            </button>
          </div>

        </form>

        <div className="text-center mt-6">
          <p className="text-white font-bold drop-shadow-md">
            Already have an account?{' '}
            <Link to="/login" className="text-blue-200 hover:text-white font-semibold underline transition-colors duration-200">
              Sign in here
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register;
