import React from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { BiSolidCartAdd } from "react-icons/bi";
import { useState, useEffect } from 'react';

const States = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [state, setState] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [stateHotels, setStateHotels] = useState([]);

  // Test backend connection first
  useEffect(() => {
    const testBackendConnection = async () => {
      try {
        console.log("🔍 Testing backend connection for States component...");
        const testResponse = await fetch('https://hotelbookingsystem-backend-4c8d.onrender.com/');
        
        if (!testResponse.ok) {
          throw new Error(`Backend test failed with status: ${testResponse.status}`);
        }
        
        const testData = await testResponse.json();
        console.log("✅ Backend connection successful:", testData);
      } catch (testError) {
        console.error("❌ Backend connection test failed:", testError);
      }
    };
    
    testBackendConnection();
  }, []);

  // Fetch state data from backend API
  useEffect(() => {
    const fetchState = async () => {
      try {
        setLoading(true);
        setError(null);
        console.log(`🔄 Fetching state data for ID: ${id}`);
        
        const response = await fetch(`https://hotelbookingsystem-backend-4c8d.onrender.com/api/india/${id}`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
          },
        });
        
        console.log("📡 Response status:", response.status);
        console.log("📡 Response ok:", response.ok);
        
        if (!response.ok) {
          const errorText = await response.text();
          console.error("❌ Response error text:", errorText);
          throw new Error(`HTTP error! status: ${response.status} - ${response.statusText}`);
        }
        
        const data = await response.json();
        console.log("📦 Full API response:", data);
        
        // Handle different response formats
        let stateData = null;
        let hotelsData = [];
        
        if (data.data) {
          console.log("✅ State data found in data.data");
          stateData = data.data;
        } else if (data) {
          console.log("✅ State data found directly");
          stateData = data;
        } else {
          console.warn("⚠️ Unexpected data format:", data);
          throw new Error('Invalid state data format from API');
        }
        
        setState(stateData);
        
        // Extract hotels data - handle different possible structures
        if (stateData.hotels && Array.isArray(stateData.hotels)) {
          console.log(`✅ Hotels found in state.hotels: ${stateData.hotels.length} items`);
          hotelsData = stateData.hotels;
        } else if (stateData.properties && Array.isArray(stateData.properties)) {
          console.log(`✅ Hotels found in state.properties: ${stateData.properties.length} items`);
          hotelsData = stateData.properties;
        } else {
          // Try to find hotels by state name
          const stateName = stateData.state ? stateData.state.toLowerCase().replace(' ', '') : '';
          if (stateName && stateData[stateName] && Array.isArray(stateData[stateName])) {
            console.log(`✅ Hotels found in state.${stateName}: ${stateData[stateName].length} items`);
            hotelsData = stateData[stateName];
          } else {
            console.log("ℹ️ No hotels array found in state data");
            hotelsData = [];
          }
        }
        
        setStateHotels(hotelsData);
        
      } catch (err) {
        console.error('❌ Error fetching state:', err);
        console.error('🔍 Error details:', {
          message: err.message,
          name: err.name,
        });
        setError('Failed to load state details: ' + err.message);
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchState();
    } else {
      setError('No state ID provided');
      setLoading(false);
    }
  }, [id]);

  // Function to handle add to cart
  const handleAddToCart = (hotel, e) => {
    e.stopPropagation();
    
    if (!hotel) {
      alert('Hotel data not available');
      return;
    }

    // Create cart item with fallback values
    const cartItem = {
      id: hotel._id || hotel.id || Date.now().toString(),
      name: hotel.name || 'Unnamed Hotel',
      price: hotel.price || hotel.price_per_night || hotel.starting_price || 0,
      image: hotel.image_url || hotel.image || hotel.photo,
      rating: hotel.rating || hotel.star_rating,
      address: hotel.address || hotel.location || 'Address not available',
      quantity: 1
    };

    // Get existing cart from localStorage
    const existingCart = JSON.parse(localStorage.getItem('roomCart')) || [];
    
    // Check if room already exists in cart
    const roomExists = existingCart.find(item => item.id === cartItem.id);
    
    if (roomExists) {
      alert('This room is already in your cart!');
      return;
    }

    // Add new room to cart
    existingCart.push(cartItem);
    localStorage.setItem('roomCart', JSON.stringify(existingCart));
    
    console.log('🛒 Added to cart:', cartItem);
    alert(`${hotel.name || 'Hotel'} added to cart successfully!`);
  }

  // Function to handle hotel click
  const handleHotelClick = (hotel, e) => {
    e.stopPropagation();
    const hotelId = hotel._id || hotel.id;
    console.log("🔗 Navigating to hotel:", hotelId);
    navigate(`/states/${id}/hotels/${hotelId}`);
  }

  // Calculate average rating and price range
  const stats = stateHotels.length > 0 ? {
    averageRating: (stateHotels.reduce((acc, hotel) => acc + (hotel.rating || hotel.star_rating || 0), 0) / stateHotels.length).toFixed(1),
    minPrice: Math.min(...stateHotels.map(hotel => hotel.price || hotel.price_per_night || hotel.starting_price || 0)),
    maxPrice: Math.max(...stateHotels.map(hotel => hotel.price || hotel.price_per_night || hotel.starting_price || 0))
  } : null;

  // Enhanced loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-5 py-10">
          {/* Skeleton Header */}
          <div className="text-center mb-12">
            <div className="animate-pulse bg-gray-300 h-12 rounded w-1/2 mx-auto mb-6"></div>
            <div className="animate-pulse bg-gray-300 h-6 rounded w-3/4 mx-auto"></div>
          </div>
          
          {/* Skeleton State Image */}
          <div className="bg-white rounded-3xl shadow-xl overflow-hidden mb-16">
            <div className="animate-pulse bg-gray-300 h-96 md:h-[500px]"></div>
          </div>

          {/* Skeleton Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
            {[1, 2, 3].map(i => (
              <div key={i} className="bg-white rounded-2xl p-6 text-center shadow-lg">
                <div className="animate-pulse bg-gray-300 h-8 rounded w-16 mx-auto mb-2"></div>
                <div className="animate-pulse bg-gray-300 h-4 rounded w-24 mx-auto"></div>
              </div>
            ))}
          </div>

          {/* Skeleton Hotels */}
          <div className="space-y-6">
            {[1, 2, 3].map(i => (
              <div key={i} className="bg-white rounded-2xl p-6 animate-pulse">
                <div className="flex flex-col lg:flex-row gap-6">
                  <div className="lg:w-1/4">
                    <div className="bg-gray-300 h-48 lg:h-40 rounded-xl"></div>
                  </div>
                  <div className="lg:w-2/4 space-y-3">
                    <div className="bg-gray-300 h-6 rounded w-3/4"></div>
                    <div className="bg-gray-300 h-4 rounded w-full"></div>
                    <div className="bg-gray-300 h-4 rounded w-2/3"></div>
                  </div>
                  <div className="lg:w-1/4 space-y-3">
                    <div className="bg-gray-300 h-8 rounded w-20 ml-auto"></div>
                    <div className="bg-gray-300 h-12 rounded"></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // Enhanced error state
  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center p-8 max-w-md">
          <div className="bg-red-50 border border-red-200 rounded-xl p-8">
            <div className="text-red-600 text-4xl mb-4">⚠️</div>
            <h3 className="text-red-800 text-xl font-bold mb-3">
              Failed to Load State
            </h3>
            <p className="text-red-600 text-base mb-4">
              {error}
            </p>
            <p className="text-gray-600 text-sm mb-6">
              Please check if the backend server is running and try again.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <button 
                onClick={() => window.location.reload()} 
                className="bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors"
              >
                Retry
              </button>
              <button 
                onClick={() => navigate('/')}
                className="bg-gray-600 hover:bg-gray-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors"
              >
                Back to Home
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // If no state found
  if (!state) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center p-8">
          <div className="text-gray-400 text-6xl mb-4">🏞️</div>
          <h1 className="text-3xl font-bold text-gray-800 mb-4">State Not Found</h1>
          <p className="text-gray-600 text-lg mb-6">The state you're looking for doesn't exist.</p>
          <button 
            onClick={() => navigate('/')}
            className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 rounded-xl font-semibold transition-colors duration-200 text-lg"
          >
            Back to Home
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-5 py-10">
        {/* Debug Info */}
        <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
          <p className="text-blue-700 text-sm">
            ✅ State data loaded successfully | ID: {id} | State: {state.state || state.name} | Hotels: {stateHotels.length}
          </p>
        </div>

        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="font-bold text-gray-900 text-4xl md:text-5xl mb-6">
            Explore Incredible India
          </h1>
          <p className="text-gray-600 text-lg md:text-xl max-w-3xl mx-auto leading-relaxed">
            Discover the beauty and hospitality of {state.state || state.name} through our curated selection of premium accommodations.
          </p>
        </div>
        
        {/* State Info */}
        <div className="bg-white rounded-3xl shadow-xl overflow-hidden mb-16 border border-gray-200">
          <div className="relative h-96 md:h-[500px]">
            <img
              src={state.image_url || state.image || state.photo || "https://images.unsplash.com/photo-1524492412937-b28074a5d7da?w=400"}
              alt={state.state || state.name || "Indian State"}
              className="w-full h-full object-cover"
              onError={(e) => {
                e.target.src = "https://images.unsplash.com/photo-1524492412937-b28074a5d7da?w=400";
              }}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent"></div>
            <div className="absolute bottom-0 left-0 right-0 p-8 text-white">
              <h1 className="font-bold text-4xl md:text-5xl mb-4">
                {state.state || state.name || "Indian State"}
              </h1>
              <p className="text-lg md:text-xl opacity-90 max-w-4xl">
                {state.description || state.overview || "Explore the beautiful destinations and accommodations in this amazing state."}
              </p>
            </div>
          </div>
        </div>

        {/* Stats Section */}
        {stats && stateHotels.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
            <div className="bg-white rounded-2xl p-6 text-center shadow-lg border border-gray-100">
              <div className="text-3xl font-bold text-blue-600 mb-2">{stateHotels.length}</div>
              <div className="text-gray-600 font-semibold">Hotels Available</div>
            </div>
            <div className="bg-white rounded-2xl p-6 text-center shadow-lg border border-gray-100">
              <div className="text-3xl font-bold text-green-600 mb-2">{stats.averageRating} ⭐</div>
              <div className="text-gray-600 font-semibold">Average Rating</div>
            </div>
            <div className="bg-white rounded-2xl p-6 text-center shadow-lg border border-gray-100">
              <div className="text-3xl font-bold text-purple-600 mb-2">
                ₹{stats.minPrice.toLocaleString()} - ₹{stats.maxPrice.toLocaleString()}
              </div>
              <div className="text-gray-600 font-semibold">Price Range</div>
            </div>
          </div>
        )}

        {/* Hotels Section - List View */}
        {stateHotels.length > 0 ? (
          <div className="mb-16">
            <div className="text-center mb-12">
              <h2 className="font-bold text-gray-900 text-3xl md:text-4xl mb-4">
                Premium Hotels in {state.state || state.name}
              </h2>
              <p className="text-gray-600 text-lg max-w-2xl mx-auto">
                Handpicked accommodations offering exceptional comfort and authentic {state.state || state.name} experiences
              </p>
            </div>
            
            {/* List View Container */}
            <div className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden">
              {stateHotels.map((hotel, index) => (
                <div 
                  key={hotel._id || hotel.id || index} 
                  className={`border-b border-gray-200 last:border-b-0 hover:bg-gray-50 transition-all duration-200 ${
                    index % 2 === 0 ? 'bg-white' : 'bg-gray-50'
                  }`}
                >
                  <div className="p-10">
                    <div className="flex flex-col lg:flex-row gap-6">
                      {/* Hotel Image */}
                      <div className="lg:w-1/4">
                        <div className="relative rounded-xl overflow-hidden">
                          <img
                            src={hotel.image_url || hotel.image || hotel.photo || "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=400"}
                            alt={hotel.name || "Hotel"}
                            className="w-full h-48 lg:h-40 object-cover hover:scale-105 transition-transform duration-500"
                            onError={(e) => {
                              e.target.src = "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=400";
                            }}
                          />
                          <div className="absolute top-3 right-3 flex items-center gap-1 bg-black/80 text-white px-2 py-1 rounded-full">
                            <span className="font-semibold text-sm">{hotel.rating || hotel.star_rating || "N/A"}</span>
                            <span className="text-yellow-400 text-xs">⭐</span>
                          </div>
                        </div>
                      </div>

                      {/* Hotel Details */}
                      <div className="lg:w-2/4 flex flex-col justify-between">
                        <div>
                          <div className="flex justify-between items-start mb-2">
                            <h3 className="font-bold text-gray-900 text-xl hover:text-blue-600 transition-colors duration-200 cursor-pointer"
                                onClick={(e) => handleHotelClick(hotel, e)}>
                              {hotel.name || "Unnamed Hotel"}
                            </h3>
                            <button 
                              onClick={(e) => handleAddToCart(hotel, e)}
                              className="flex items-center gap-2 text-blue-600 hover:text-blue-700 transition-colors duration-200 p-2 rounded-lg hover:bg-blue-50 ml-4"
                            >
                              <BiSolidCartAdd className="w-5 h-5" />
                              <span className="text-sm font-medium">Add to Cart</span>
                            </button>
                          </div>
                          
                          <p className="text-gray-600 text-sm mb-3 leading-relaxed">
                            {hotel.description || hotel.overview || "A comfortable and well-appointed accommodation for your stay."}
                          </p>
                          
                          <div className="flex items-center gap-2 text-gray-500 text-sm mb-3">
                            <span className="text-red-500">📍</span>
                            <span>{hotel.address || hotel.location || "Address not available"}</span>
                          </div>

                          {/* Features */}
                          <div className="flex flex-wrap gap-2 mb-4">
                            <span className="bg-green-100 text-green-800 text-xs px-3 py-1 rounded-full font-medium">
                              Free WiFi
                            </span>
                            <span className="bg-blue-100 text-blue-800 text-xs px-3 py-1 rounded-full font-medium">
                              Swimming Pool
                            </span>
                            <span className="bg-purple-100 text-purple-800 text-xs px-3 py-1 rounded-full font-medium">
                              Restaurant
                            </span>
                            <span className="bg-orange-100 text-orange-800 text-xs px-3 py-1 rounded-full font-medium">
                              Spa
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Price and Action */}
                      <div className="lg:w-1/4 flex flex-col justify-between items-start lg:items-end">
                        <div className="text-right mb-4 lg:mb-0">
                          <span className="text-gray-500 text-sm block mb-1">Starting from</span>
                          <span className="text-2xl font-bold text-blue-700">
                            ₹{(hotel.price || hotel.price_per_night || hotel.starting_price || 0).toLocaleString()}
                            <span className="text-sm text-gray-500 font-normal">/night</span>
                          </span>
                        </div>
                        
                        <div className="flex flex-col sm:flex-row lg:flex-col gap-3 w-full lg:w-auto">
                          <button 
                            onClick={(e) => handleHotelClick(hotel, e)}
                            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl font-semibold transition-all duration-200 hover:shadow-lg text-sm w-full lg:w-auto text-center"
                          >
                            View Details
                          </button>
                          <button 
                            onClick={(e) => handleAddToCart(hotel, e)}
                            className="lg:hidden border border-blue-600 text-blue-600 hover:bg-blue-600 hover:text-white px-6 py-3 rounded-xl font-semibold transition-all duration-200 text-sm w-full text-center"
                          >
                            Add to Cart
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="text-center py-16 bg-white rounded-3xl shadow-lg border border-gray-200">
            <div className="text-6xl mb-4">🏨</div>
            <h3 className="text-2xl font-bold text-gray-800 mb-4">
              Hotels Coming Soon to {state.state || state.name}
            </h3>
            <p className="text-gray-600 text-lg max-w-md mx-auto mb-6">
              We're working on bringing you the best accommodations in {state.state || state.name}. Check back soon for amazing hotel options!
            </p>
            <button 
              onClick={() => navigate('/')}
              className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-xl font-semibold transition-colors duration-200"
            >
              Explore Other States
            </button>
          </div>
        )}

        {/* Back to Home Button */}
        <div className="text-center">
          <button 
            onClick={() => navigate('/')}
            className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-800 font-semibold transition-colors duration-200"
          >
            <span>←</span>
            Back to All States
          </button>
        </div>
      </div>
    </div>
  )
}

export default States
