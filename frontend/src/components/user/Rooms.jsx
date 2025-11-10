import { useNavigate } from 'react-router-dom'
import { useState, useEffect } from 'react'
import { feature } from '../../utils/userConstant'
import { BiSolidCartAdd } from "react-icons/bi"

const Rooms = () => {
  const navigate = useNavigate()
  const [hotels, setHotels] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  // Test backend connection first
  useEffect(() => {
    const testBackendConnection = async () => {
      try {
        console.log("🔍 Testing backend connection...");
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

  // Fetch hotels from API
  const fetchHotels = async () => {
    try {
      setLoading(true)
      setError(null)
      console.log("🔄 Starting API call to fetch hotels...");
      
      const response = await fetch('https://hotelbookingsystem-backend-4c8d.onrender.com/api/hotel/all', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
      })
      
      console.log("📡 Response status:", response.status);
      console.log("📡 Response ok:", response.ok);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error("❌ Response error text:", errorText);
        throw new Error(`HTTP error! status: ${response.status} - ${response.statusText}`);
      }
      
      const data = await response.json();
      console.log("📦 Full API response:", data);
      
      // Handle different API response formats
      if (data.data && Array.isArray(data.data)) {
        console.log(`✅ Data found in data.data: ${data.data.length} items`);
        setHotels(data.data);
      } else if (Array.isArray(data)) {
        console.log(`✅ Data found directly: ${data.length} items`);
        setHotels(data);
      } else if (data.properties && Array.isArray(data.properties)) {
        console.log(`✅ Data found in properties: ${data.properties.length} items`);
        setHotels(data.properties);
      } else if (data.hotels && Array.isArray(data.hotels)) {
        console.log(`✅ Data found in hotels: ${data.hotels.length} items`);
        setHotels(data.hotels);
      } else {
        console.warn("⚠️ Unexpected data format:", data);
        throw new Error('Invalid data format from API. Expected array of hotels.');
      }
      
    } catch (err) {
      console.error('❌ Error fetching hotels:', err);
      console.error('🔍 Error details:', {
        message: err.message,
        name: err.name,
      });
      setError('Failed to load hotels: ' + err.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchHotels()
  }, [])

  // Function to handle view details click
  const handleViewDetails = (hotel, e) => {
    e.stopPropagation()
    const hotelId = hotel._id || hotel.id
    console.log("🔗 Navigating to hotel details:", hotelId);
    navigate(`/rooms/${hotelId}`)
  }

  // Function to handle add to cart
  const handleAddToCart = (hotel, e) => {
    e.stopPropagation()
    
    const cartItem = {
      id: hotel._id || hotel.id,
      name: hotel.name || 'Unnamed Hotel',
      price: hotel.price || hotel.price_per_night || hotel.starting_price || 0,
      image: hotel.image_url || hotel.image || hotel.photo,
      rating: hotel.rating || hotel.star_rating,
      address: hotel.address || hotel.location || 'Address not available',
      quantity: 1
    }

    const existingCart = JSON.parse(localStorage.getItem('roomCart')) || []
    const roomExists = existingCart.find(item => item.id === cartItem.id)
    
    if (roomExists) {
      alert('This room is already in your cart!')
      return
    }

    existingCart.push(cartItem)
    localStorage.setItem('roomCart', JSON.stringify(existingCart))
    console.log("🛒 Added to cart:", cartItem);
    alert(`${hotel.name} added to cart successfully!`)
  }

  // Enhanced loading state with skeleton
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <section className="px-5 py-10">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-12">
              <h1 className="font-bold text-gray-900 text-4xl md:text-5xl mb-6">
                {feature}
              </h1>
              <div className="w-24 h-1 bg-blue-600 rounded-full mx-auto mb-6"></div>
              <p className="text-gray-600 text-lg md:text-xl max-w-3xl mx-auto leading-relaxed">
                Loading amazing properties for you...
              </p>
            </div>
            
            {/* Skeleton Loading */}
            <div className="space-y-6">
              {[1, 2, 3, 4].map((item) => (
                <div key={item} className="bg-white rounded-2xl shadow-lg overflow-hidden border border-gray-100">
                  <div className="flex flex-col md:flex-row h-auto md:h-80">
                    <div className="md:w-2/5 bg-gray-200 animate-pulse h-48 md:h-full"></div>
                    <div className="md:w-3/5 p-6 flex flex-col">
                      <div className="flex justify-between items-start mb-4">
                        <div className="flex-1 pr-4">
                          <div className="bg-gray-200 animate-pulse h-6 rounded w-3/4 mb-2"></div>
                          <div className="bg-gray-200 animate-pulse h-4 rounded w-full mb-2"></div>
                        </div>
                        <div className="bg-gray-200 animate-pulse w-16 h-6 rounded-full"></div>
                      </div>
                      <div className="bg-gray-200 animate-pulse h-4 rounded w-full mb-2"></div>
                      <div className="bg-gray-200 animate-pulse h-4 rounded w-2/3 mb-4"></div>
                      <div className="flex justify-between items-center mt-4 pt-4 border-t border-gray-100">
                        <div>
                          <div className="bg-gray-200 animate-pulse h-4 rounded w-24 mb-1"></div>
                          <div className="bg-gray-200 animate-pulse h-8 rounded w-20"></div>
                        </div>
                        <div className="flex gap-2">
                          <div className="bg-gray-200 animate-pulse w-10 h-10 rounded-xl"></div>
                          <div className="bg-gray-200 animate-pulse w-24 h-10 rounded-xl"></div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      </div>
    )
  }

  // Enhanced error state
  if (error) {
    return (
      <div className="min-h-screen bg-gray-50">
        <section className="px-5 py-10">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-12">
              <h1 className="font-bold text-gray-900 text-4xl md:text-5xl mb-6">
                {feature}
              </h1>
              <div className="w-24 h-1 bg-red-500 rounded-full mx-auto mb-6"></div>
            </div>
            <div className="text-center py-8">
              <div className="bg-red-50 border border-red-200 rounded-xl p-8 max-w-2xl mx-auto">
                <div className="text-red-600 text-4xl mb-4">⚠️</div>
                <h3 className="text-red-800 text-xl font-bold mb-3">
                  Connection Error
                </h3>
                <p className="text-red-600 text-base mb-4">
                  {error}
                </p>
                <p className="text-gray-600 text-sm mb-6">
                  Please check if the backend server is running and try again.
                </p>
                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                  <button
                    onClick={fetchHotels}
                    className="bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors"
                  >
                    Try Again
                  </button>
                  <button
                    onClick={() => window.location.reload()}
                    className="bg-gray-600 hover:bg-gray-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors"
                  >
                    Reload Page
                  </button>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>
    )
  }

  // Enhanced empty state
  if (!hotels || hotels.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50">
        <section className="px-5 py-10">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-12">
              <h1 className="font-bold text-gray-900 text-4xl md:text-5xl mb-6">
                {feature}
              </h1>
              <div className="w-24 h-1 bg-yellow-500 rounded-full mx-auto mb-6"></div>
            </div>
            <div className="text-center py-8">
              <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-8 max-w-2xl mx-auto">
                <div className="text-yellow-600 text-4xl mb-4">🏨</div>
                <h3 className="text-yellow-800 text-xl font-bold mb-3">
                  No Hotels Available
                </h3>
                <p className="text-yellow-600 text-base mb-4">
                  No hotels are currently available in our database.
                </p>
                <p className="text-gray-600 text-sm mb-6">
                  This might be a temporary issue. Please try refreshing the page.
                </p>
                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                  <button
                    onClick={fetchHotels}
                    className="bg-yellow-600 hover:bg-yellow-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors"
                  >
                    Refresh List
                  </button>
                  <button
                    onClick={() => navigate('/')}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors"
                  >
                    Go Home
                  </button>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <section className="px-5 py-10">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h1 className="font-bold text-gray-900 text-4xl md:text-5xl mb-6">
              {feature}
            </h1>
            <div className="w-24 h-1 bg-blue-600 rounded-full mx-auto mb-6"></div>
            <p className="text-gray-600 text-lg md:text-xl max-w-3xl mx-auto leading-relaxed">
              Discover our handpicked selection of exceptional properties around the world, 
              offering unparalleled luxury and unforgettable experiences.
            </p>
            <div className="mt-4 bg-green-50 border border-green-200 rounded-lg px-4 py-2 inline-block">
              <p className="text-green-700 text-sm font-medium">
                ✅ Successfully loaded {hotels.length} properties
              </p>
            </div>
          </div>

          {/* Results Count */}
          <div className="mb-6 flex justify-between items-center">
            <p className="text-gray-600 font-medium">
              Showing <span className="font-bold text-blue-600">{hotels.length}</span> properties
            </p>
            <button
              onClick={fetchHotels}
              className="text-sm text-blue-600 hover:text-blue-800 font-medium"
            >
              Refresh
            </button>
          </div>

          {/* List View Content */}
          <div className="space-y-6">
            {hotels.map((hotel, index) => (
              <div 
                key={hotel._id || hotel.id || index} 
                className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden border border-gray-100 cursor-pointer group"
              >
                <div className="flex flex-col md:flex-row h-auto md:h-80">
                  {/* Image Section */}
                  <div className="md:w-2/5 overflow-hidden bg-gray-200">
                    <img 
                      src={hotel.image_url || hotel.image || hotel.photo || "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=400"} 
                      alt={hotel.name || "Hotel"} 
                      className="w-full h-48 md:h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      onError={(e) => {
                        e.target.src = "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=400"
                      }}
                    />
                  </div>
                  
                  {/* Content Section */}
                  <div className="md:w-3/5 p-6 flex flex-col">
                    <div className="flex justify-between items-start mb-4">
                      <div className="flex-1 pr-4">
                        <h3 className="font-bold text-gray-900 text-xl mb-2">
                          {hotel.name || "Unnamed Property"}
                        </h3>
                        <div className="flex items-center gap-2 text-gray-600 text-sm mb-2">
                          <span>📍</span>
                          <span>{hotel.address || hotel.location || "Address not available"}</span>
                        </div>
                      </div>
                    
                      <div className="flex items-center gap-1 bg-green-50 px-3 py-1 rounded-full border border-green-100 flex-shrink-0">
                        <span className="text-green-600">⭐</span>
                        <span className="font-semibold text-green-700">
                          {hotel.rating || hotel.star_rating || "N/A"}
                        </span>
                      </div>
                    </div>
                    
                    {(hotel.description || hotel.overview) && (
                      <p className="text-gray-500 text-sm mb-4 line-clamp-2 flex-grow">
                        {hotel.description || hotel.overview}
                      </p>
                    )}
                    
                    <div className="flex justify-between items-center mt-4 pt-4 border-t border-gray-100">
                      <div>
                        <span className="text-gray-500 text-sm block">Starting from</span>
                        <p className="font-bold text-gray-900 text-2xl">
                          ${hotel.price || hotel.price_per_night || hotel.starting_price || 0}
                          <span className="text-gray-500 text-lg font-normal">/night</span>
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <button 
                          onClick={(e) => handleAddToCart(hotel, e)}
                          className="bg-gray-100 hover:bg-gray-200 p-3 rounded-xl transition-all duration-200 group border border-gray-200"
                          title="Add to cart"
                        >
                          <BiSolidCartAdd className="w-5 h-5 text-gray-600 group-hover:text-blue-600" />
                        </button>
                        <button 
                          onClick={(e) => handleViewDetails(hotel, e)}
                          className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-semibold px-6 py-3 rounded-xl text-sm transition-all duration-200 shadow-md hover:shadow-lg"
                        >
                          View Details
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Footer Info */}
          <div className="mt-12 text-center">
            <p className="text-gray-500 text-sm">
              Can't find what you're looking for?{" "}
              <button 
                onClick={fetchHotels}
                className="text-blue-600 hover:text-blue-800 font-medium underline"
              >
                Refresh the list
              </button>{" "}
              or{" "}
              <button 
                onClick={() => navigate('/')}
                className="text-blue-600 hover:text-blue-800 font-medium underline"
              >
                return to homepage
              </button>
            </p>
          </div>
        </div>
      </section>
    </div>
  )
}

export default Rooms
