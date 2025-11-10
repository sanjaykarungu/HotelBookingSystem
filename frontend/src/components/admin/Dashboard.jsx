import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { MdAddBusiness } from "react-icons/md";
import { FaList } from "react-icons/fa";
import { BsReceipt } from "react-icons/bs";
import Navbar from "./Navbar";

const Dashboard = () => {
  const [stats, setStats] = useState({
    totalHotels: 0,
    activeHotels: 0,
    totalOrders: 0,
    revenue: 0
  });
  const [loading, setLoading] = useState(true);

  // All API endpoints
  const API_ENDPOINTS = [
    { url: 'https://hotel-booking-backend-qnbg.onrender.com/api/hotel/all', name: 'world' },
    { url: 'https://hotel-booking-backend-qnbg.onrender.com/api/india/all', name: 'hotel' },
    { url: 'https://hotel-booking-backend-qnbg.onrender.com/api/world/all', name: 'property' },
    { url: 'https://hotel-booking-backend-qnbg.onrender.com/api/property/all', name: 'india' }
  ];

  // Function to extract hotels from any data structure
  const extractHotelsFromData = (data, source) => {
    let hotels = [];

    // Recursive function to find all hotel-like objects
    const findHotels = (obj, path = '') => {
      if (!obj || typeof obj !== 'object') return;

      // Check if current object is a hotel
      if (obj.name || obj.hotelName || obj.propertyName || obj.title) {
        const isHotel = obj.name || obj.hotelName || obj.propertyName || obj.title;
        const hasPrice = obj.price || obj.price_per_night || obj.rate;
        const hasLocation = obj.address || obj.location || obj.city;
        
        if (isHotel && (hasPrice || hasLocation)) {
          hotels.push({
            ...obj,
            source,
            id: obj._id || obj.id || `${source}-${Math.random().toString(36).substr(2, 9)}`
          });
        }
      }

      // Recursively search through all properties
      if (Array.isArray(obj)) {
        obj.forEach((item, index) => findHotels(item, `${path}[${index}]`));
      } else if (typeof obj === 'object') {
        Object.keys(obj).forEach(key => {
          findHotels(obj[key], path ? `${path}.${key}` : key);
        });
      }
    };

    // Start searching for hotels
    findHotels(data);

    // If no hotels found with recursive search, try structured extraction
    if (hotels.length === 0) {
      // Method 1: Direct array of hotels
      if (Array.isArray(data)) {
        hotels = data.filter(item => item.name || item.hotelName).map(item => ({
          ...item,
          source,
          id: item._id || item.id || `${source}-${Math.random().toString(36).substr(2, 9)}`
        }));
      }
      // Method 2: Data with nested structures
      else if (data.data && Array.isArray(data.data)) {
        // For india API: states with hotels array
        if (source === 'india') {
          data.data.forEach(state => {
            // Check for hotels in state-specific arrays (goa, tamilnadu, etc.)
            const stateFields = ['goa', 'tamilnadu', 'kerala', 'himachalpradesh', 'rajasthan', 'uttarakhand', 'maharashtra', 'karnataka', 'gujarat', 'westbengal'];
            
            stateFields.forEach(field => {
              if (state[field] && Array.isArray(state[field])) {
                const stateHotels = state[field].map(hotel => ({
                  ...hotel,
                  stateName: state.state,
                  stateId: state._id,
                  source,
                  id: hotel._id || hotel.id || `${source}-${Math.random().toString(36).substr(2, 9)}`
                }));
                hotels = [...hotels, ...stateHotels];
              }
            });
          });
        } else {
          // For other APIs, data.data might contain hotels directly
          hotels = data.data.filter(item => item.name || item.hotelName).map(item => ({
            ...item,
            source,
            id: item._id || item.id || `${source}-${Math.random().toString(36).substr(2, 9)}`
          }));
        }
      }
      // Method 3: World data might have countries with hotels
      else if (source === 'world' && data.countries) {
        if (Array.isArray(data.countries)) {
          data.countries.forEach(country => {
            if (country.hotels && Array.isArray(country.hotels)) {
              const countryHotels = country.hotels.map(hotel => ({
                ...hotel,
                countryName: country.name,
                source,
                id: hotel._id || hotel.id || `${source}-${Math.random().toString(36).substr(2, 9)}`
              }));
              hotels = [...hotels, ...countryHotels];
            }
          });
        }
      }
      // Method 4: Properties might have properties array
      else if (source === 'property' && data.properties) {
        if (Array.isArray(data.properties)) {
          hotels = data.properties.map(property => ({
            ...property,
            source,
            id: property._id || property.id || `${source}-${Math.random().toString(36).substr(2, 9)}`
          }));
        }
      }
      // Method 5: Hotels at root level
      else if (data.hotels && Array.isArray(data.hotels)) {
        hotels = data.hotels.map(hotel => ({
          ...hotel,
          source,
          id: hotel._id || hotel.id || `${source}-${Math.random().toString(36).substr(2, 9)}`
        }));
      }
    }
    
    // Filter out objects that don't look like hotels
    const validHotels = hotels.filter(hotel => 
      (hotel.name || hotel.hotelName || hotel.propertyName) && 
      (hotel.price || hotel.price_per_night || hotel.address || hotel.location)
    );

    return validHotels;
  };

  // Fetch hotels from all APIs
  const fetchHotels = async () => {
    try {
      setLoading(true);
      
      const promises = API_ENDPOINTS.map(async (endpoint) => {
        try {
          const response = await fetch(endpoint.url);
          
          if (!response.ok) {
            throw new Error(`HTTP ${response.status}`);
          }
          
          const data = await response.json();
          const extractedHotels = extractHotelsFromData(data, endpoint.name);
          
          return extractedHotels;
        } catch (err) {
          console.error(`Error fetching from ${endpoint.name}:`, err);
          return [];
        }
      });

      const results = await Promise.all(promises);
      
      // Combine all hotels from all APIs
      const allHotels = results.flat();
      
      // Calculate hotel stats
      const totalHotels = allHotels.length;
      const activeHotels = allHotels.filter(hotel => {
        const status = hotel.status || "active";
        return status === "active";
      }).length;

      // Update stats with real hotel data
      setStats(prevStats => ({
        ...prevStats,
        totalHotels,
        activeHotels
      }));
      
    } catch (err) {
      console.error('Error fetching hotels:', err);
      setStats(prevStats => ({
        ...prevStats,
        totalHotels: 0,
        activeHotels: 0
      }));
    } finally {
      setLoading(false);
    }
  };

  // Load order stats from localStorage
  const loadOrderStats = () => {
    try {
      const savedBookings = JSON.parse(localStorage.getItem('userBookings')) || [];
      
      const totalOrders = savedBookings.length;
      
      const revenue = savedBookings.reduce((sum, order) => {
        const amount = order.totalAmount || order.total || order.amount || 0;
        return sum + parseFloat(amount);
      }, 0);

      setStats(prevStats => ({
        ...prevStats,
        totalOrders,
        revenue
      }));
    } catch (error) {
      console.error('Error loading order stats:', error);
    }
  };

  // Load all stats
  useEffect(() => {
    const loadAllStats = () => {
      // Load order stats immediately
      loadOrderStats();
      
      // Fetch hotel data from APIs
      fetchHotels();
    };

    loadAllStats();

    // Listen for storage changes to update orders in real-time
    const handleStorageChange = (e) => {
      if (e.key === 'userBookings') {
        loadOrderStats();
      }
    };

    window.addEventListener('storage', handleStorageChange);
    
    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);

  const quickActions = [
    {
      title: "Add Hotel",
      description: "Add new hotel to your portfolio",
      icon: <MdAddBusiness className="w-8 h-8" />,
      path: "/add",
      color: "bg-blue-500"
    },
    {
      title: "View Hotels",
      description: "Manage all your hotel properties",
      icon: <FaList className="w-8 h-8" />,
      path: "/hotels",
      color: "bg-green-500"
    },
    {
      title: "Orders",
      description: "Manage bookings and orders",
      icon: <BsReceipt className="w-8 h-8" />,
      path: "/orders",
      color: "bg-purple-500"
    }
  ];

  return (
    <div>
      <Navbar/>
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
            <p className="text-gray-600 mt-2">Welcome to your hotel management system</p>
          </div>

          {/* Stats Cards - Only 4 stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold text-gray-700">Total Hotels</h3>
              <p className="text-3xl font-bold text-blue-600 mt-2">
                { (
                  stats.totalHotels
                )}
              </p>
            </div>
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold text-gray-700">Active Hotels</h3>
              <p className="text-3xl font-bold text-green-600 mt-2">
               {(
                  stats.activeHotels
                )}
              </p>
            
            </div>
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold text-gray-700">Total Orders</h3>
              <p className="text-3xl font-bold text-purple-600 mt-2">{stats.totalOrders}</p>
            </div>
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold text-gray-700">Revenue</h3>
              <p className="text-3xl font-bold text-orange-600 mt-2">${stats.revenue.toFixed(2)}</p>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Quick Actions</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {quickActions.map((action, index) => (
                <Link
                  key={index}
                  to={action.path}
                  className="bg-white rounded-lg shadow hover:shadow-lg transition-shadow duration-200 p-6 block hover:transform hover:scale-105 transition-transform duration-200"
                >
                  <div className={`${action.color} w-16 h-16 rounded-lg flex items-center justify-center text-white mb-4`}>
                    {action.icon}
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">{action.title}</h3>
                  <p className="text-gray-600">{action.description}</p>
                </Link>
              ))}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default Dashboard;