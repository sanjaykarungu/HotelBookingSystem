import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { IoMdHome } from "react-icons/io";
import { RiVerifiedBadgeFill } from "react-icons/ri";
import { FaLocationDot, FaUser } from "react-icons/fa6";
import { FaHeart } from "react-icons/fa";
import { BiSolidCartAdd } from "react-icons/bi";

const PropertyRoomDetails = () => {
  const { propertyId, hotelId } = useParams();
  const navigate = useNavigate();
  
  // State for booking dates and guests
  const [bookingData, setBookingData] = useState({
    checkIn: '',
    checkOut: '',
    guests: 1
  });

  const [property, setProperty] = useState(null);
  const [hotel, setHotel] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Test backend connection first
  useEffect(() => {
    const testBackendConnection = async () => {
      try {
        console.log("🔍 Testing backend connection for PropertyRoomDetails...");
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

  // Fetch property and hotel data from your backend API
  useEffect(() => {
    const fetchPropertyAndHotel = async () => {
      try {
        setLoading(true);
        setError(null);
        console.log(`🔄 Fetching property data for ID: ${propertyId}`);
        
        // Fetch property data
        const propertyResponse = await fetch(`https://hotelbookingsystem-backend-4c8d.onrender.com/api/property/${propertyId}`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
          },
        });
        
        console.log("📡 Property response status:", propertyResponse.status);
        console.log("📡 Property response ok:", propertyResponse.ok);
        
        if (!propertyResponse.ok) {
          const errorText = await propertyResponse.text();
          console.error("❌ Property response error text:", errorText);
          throw new Error(`Failed to fetch property data: ${propertyResponse.status} - ${propertyResponse.statusText}`);
        }
        
        const propertyData = await propertyResponse.json();
        console.log("📦 Full property API response:", propertyData);
        
        // Handle different property response formats
        let propertyInfo = null;
        if (propertyData.data) {
          console.log("✅ Property data found in data.data");
          propertyInfo = propertyData.data;
        } else if (propertyData) {
          console.log("✅ Property data found directly");
          propertyInfo = propertyData;
        } else {
          throw new Error('Invalid property data format from API');
        }
        
        setProperty(propertyInfo);

        // Get property-specific hotels - enhanced search
        console.log("🔍 Searching for hotels in property data...");
        console.log("🔍 Property object keys:", Object.keys(propertyInfo));
        
        const getPropertyHotels = () => {
          if (!propertyInfo) return [];
          
          const propertyType = propertyInfo.type?.toLowerCase().replace(' ', '_');
          const propertyName = propertyInfo.name?.toLowerCase().replace(' ', '_');
          const possibleKeys = [
            propertyType,
            propertyName,
            'hotels',
            'hotel',
            'properties',
            'property',
            'accommodations',
            'rooms',
            'listings'
          ];

          for (const key of possibleKeys) {
            if (propertyInfo[key] && Array.isArray(propertyInfo[key])) {
              console.log(`✅ Hotels found in property.${key}: ${propertyInfo[key].length} items`);
              return propertyInfo[key];
            }
          }
          
          // Search all arrays in the property data
          console.log("🔍 Searching all arrays in property data");
          for (const key in propertyInfo) {
            if (Array.isArray(propertyInfo[key]) && propertyInfo[key].length > 0) {
              // Check if this array contains hotel-like objects
              const firstItem = propertyInfo[key][0];
              if (firstItem && (firstItem.name || firstItem.price || firstItem.image_url)) {
                console.log(`✅ Hotels found in property.${key}: ${propertyInfo[key].length} items`);
                return propertyInfo[key];
              }
            }
          }
          
          console.log("ℹ️ No hotels array found in property data");
          return [];
        };

        const propertyHotels = getPropertyHotels();
        
        // Find the specific hotel
        console.log(`🔍 Looking for hotel with ID: ${hotelId} in ${propertyHotels.length} hotels`);
        
        let foundHotel = propertyHotels.find((item) => 
          (item.id && item.id.toString() === hotelId) || 
          (item._id && item._id.toString() === hotelId) ||
          (item.id && item.id.toString() === hotelId.toString())
        );

        // If not found by ID, try by index or other methods
        if (!foundHotel && propertyHotels.length > 0) {
          console.log("🔍 Hotel not found by ID, trying alternative methods");
          // Try to find by index if hotelId is a number
          const hotelIndex = parseInt(hotelId);
          if (!isNaN(hotelIndex) && hotelIndex >= 0 && hotelIndex < propertyHotels.length) {
            foundHotel = propertyHotels[hotelIndex];
            console.log("✅ Hotel found by index:", hotelIndex);
          }
        }

        if (!foundHotel) {
          console.error("❌ Hotel not found. Available hotels:", propertyHotels);
          throw new Error('Hotel not found in the property data');
        }

        console.log("✅ Hotel found:", foundHotel);
        setHotel(foundHotel);
        
      } catch (err) {
        console.error('❌ Error fetching property and hotel:', err);
        console.error('🔍 Error details:', {
          message: err.message,
          name: err.name,
        });
        setError('Failed to load hotel details: ' + err.message);
      } finally {
        setLoading(false);
      }
    };

    if (propertyId && hotelId) {
      fetchPropertyAndHotel();
    } else {
      setError('Missing property ID or hotel ID');
      setLoading(false);
    }
  }, [propertyId, hotelId]);

  // Handle input changes for booking form
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setBookingData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Function to handle add to cart
  const handleAddToCart = (hotel, e) => {
    if (e) e.stopPropagation();
    
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

  // Function to handle book now
  const handleBookNow = () => {
    if (!hotel) {
      alert('Hotel data not available');
      return;
    }

    // Validate dates
    if (!bookingData.checkIn || !bookingData.checkOut) {
      alert('Please select check-in and check-out dates');
      return;
    }

    // Generate unique booking ID
    const bookingId = 'BK' + Date.now();

    // Calculate total nights and amount
    const checkIn = new Date(bookingData.checkIn);
    const checkOut = new Date(bookingData.checkOut);
    const nights = Math.ceil((checkOut - checkIn) / (1000 * 60 * 60 * 24));
    const roomPrice = hotel.price || hotel.price_per_night || hotel.starting_price || 0;
    const totalAmount = (roomPrice * nights) + 800; // Room price + fees (500 + 300)

    // Create booking object
    const newBooking = {
      id: bookingId,
      hotelName: hotel.name || 'Unnamed Hotel',
      hotelImage: hotel.image_url || hotel.image || hotel.photo,
      checkIn: bookingData.checkIn,
      checkOut: bookingData.checkOut,
      guests: parseInt(bookingData.guests),
      rooms: 1,
      totalAmount: totalAmount,
      bookingDate: new Date().toISOString(),
      status: 'confirmed',
      roomAddress: hotel.address || hotel.location || 'Address not available',
      roomRating: hotel.rating || hotel.star_rating,
      propertyType: property?.type || property?.name || 'Unknown Property',
      state: hotel.state
    };

    // Save to localStorage
    const existingBookings = JSON.parse(localStorage.getItem('userBookings')) || [];
    const updatedBookings = [...existingBookings, newBooking];
    localStorage.setItem('userBookings', JSON.stringify(updatedBookings));

    // Show success message and redirect
    alert(`Booking confirmed! Your booking ID is ${bookingId}`);
    navigate('/booking');
  };

  // Calculate total amount for display
  const calculateTotal = () => {
    if (!hotel) return 0;
    if (!bookingData.checkIn || !bookingData.checkOut) return ((hotel.price || 0) * 3) + 800;
    
    const checkIn = new Date(bookingData.checkIn);
    const checkOut = new Date(bookingData.checkOut);
    const nights = Math.ceil((checkOut - checkIn) / (1000 * 60 * 60 * 24));
    const roomPrice = hotel.price || hotel.price_per_night || hotel.starting_price || 0;
    
    return (roomPrice * nights) + 800;
  };

  const calculateNights = () => {
    if (!bookingData.checkIn || !bookingData.checkOut) return 3;
    const checkIn = new Date(bookingData.checkIn);
    const checkOut = new Date(bookingData.checkOut);
    return Math.ceil((checkOut - checkIn) / (1000 * 60 * 60 * 24));
  };

  // Enhanced loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Skeleton Header */}
          <div className="mb-12">
            <div className="animate-pulse bg-gray-300 h-10 rounded w-3/4 mb-4"></div>
            <div className="animate-pulse bg-gray-300 h-6 rounded w-1/2"></div>
          </div>
          
          {/* Skeleton Image Grid */}
          <div className="mb-16">
            <div className="grid grid-cols-3 grid-rows-2 gap-4 h-[400px]">
              <div className="col-span-2 row-span-2 bg-gray-300 rounded-2xl animate-pulse"></div>
              <div className="bg-gray-300 rounded-2xl animate-pulse"></div>
              <div className="bg-gray-300 rounded-2xl animate-pulse"></div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
            {/* Skeleton Content */}
            <div className="lg:col-span-2 space-y-8">
              <div className="animate-pulse bg-gray-300 h-8 rounded w-1/3 mb-4"></div>
              <div className="animate-pulse bg-gray-300 h-4 rounded w-full mb-2"></div>
              <div className="animate-pulse bg-gray-300 h-4 rounded w-5/6"></div>
            </div>
            
            {/* Skeleton Sidebar */}
            <div className="bg-white rounded-2xl shadow-xl p-6">
              <div className="animate-pulse bg-gray-300 h-8 rounded w-1/2 mb-6"></div>
              <div className="space-y-4">
                <div className="animate-pulse bg-gray-300 h-12 rounded"></div>
                <div className="animate-pulse bg-gray-300 h-12 rounded"></div>
                <div className="animate-pulse bg-gray-300 h-12 rounded"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Enhanced error state
  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center p-8 max-w-md">
          <div className="bg-red-50 border border-red-200 rounded-xl p-8">
            <div className="text-red-600 text-4xl mb-4">⚠️</div>
            <h3 className="text-red-800 text-xl font-bold mb-3">
              Failed to Load Hotel
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
                onClick={() => navigate(`/property/${propertyId}`)}
                className="bg-gray-600 hover:bg-gray-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors"
              >
                Back to Property
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!property) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center p-8">
          <div className="text-gray-400 text-6xl mb-4">🏠</div>
          <h1 className="text-3xl font-bold text-gray-800 mb-4">Property Not Found</h1>
          <p className="text-gray-600 text-lg">The property you're looking for doesn't exist.</p>
        </div>
      </div>
    );
  }

  if (!hotel) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center p-8">
          <div className="text-gray-400 text-6xl mb-4">🏨</div>
          <h1 className="text-3xl font-bold text-gray-800 mb-4">Hotel Not Found</h1>
          <p className="text-gray-600 text-lg">The hotel you're looking for doesn't exist.</p>
          <button 
            onClick={() => navigate(`/property/${propertyId}`)}
            className="mt-4 bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 rounded-xl font-semibold transition-colors duration-200 text-lg"
          >
            Back to {property.type || property.name}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      
      {/* Navigation Breadcrumb */}
      <div className="mb-6">
        <button 
          onClick={() => navigate(`/property/${propertyId}`)}
          className="flex items-center gap-2 text-blue-600 hover:text-blue-700 font-semibold transition-colors duration-200 mb-4"
        >
          <span>←</span>
          Back to {property.type || property.name}
        </button>
      </div>

      {/* Hotel Header */}
      <div className="mb-12">
        <div className="flex justify-between items-start mb-3">
          <h1 className="text-4xl font-bold text-gray-900">{hotel.name || "Unnamed Hotel"}</h1>
          <button 
            onClick={(e) => handleAddToCart(hotel,e)}
            className="flex items-center gap-2 text-blue-600 hover:text-blue-700 transition-colors duration-200 p-3 rounded-lg hover:bg-blue-50 border border-blue-200"
          >
            <BiSolidCartAdd className="w-6 h-6" />
            <span className="font-semibold">Add to Cart</span>
          </button>
        </div>
        <div className="flex flex-wrap items-center gap-3 text-gray-600">
          <div className="flex items-center gap-2 bg-yellow-50 px-3 py-1 rounded-full">
            <span className="text-yellow-500 text-lg">⭐</span>
            <span className="font-semibold text-gray-800">{hotel.rating || hotel.star_rating || 'N/A'}</span>
          </div>
          <span className="text-gray-400">•</span>
          <span className="text-gray-700">{hotel.address || hotel.location || "Address not available"}</span>
          <span className="text-gray-400">•</span>
          <span className="text-gray-700 bg-blue-50 px-3 py-1 rounded-full text-sm">
            {property.type || property.name || "Property Type"}
          </span>
          {hotel.state && (
            <>
              <span className="text-gray-400">•</span>
              <span className="text-gray-700 bg-green-50 px-3 py-1 rounded-full text-sm">
                {hotel.state}
              </span>
            </>
          )}
        </div>
      </div>

      {/* Image Section */}
      <div className="mb-16">
        <div className="grid grid-cols-3 grid-rows-2 gap-4 h-[400px] sm:h-[400px]">
          {/* Main large image */}
          <div className="col-span-2 row-span-2 rounded-2xl overflow-hidden shadow-lg">
            <img
              src={hotel.image_url || hotel.image || hotel.photo || "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=400"}
              alt={hotel.name || "Hotel"}
              className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
              onError={(e) => {
                e.target.src = "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=400";
              }}
            />
          </div>

          {/* Additional images */}
          <div className="rounded-2xl overflow-hidden shadow-lg">
            <img
              src={hotel.image_url_1 || hotel.image_url || hotel.image || "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=400"}
              alt={`${hotel.name || "Hotel"} - View 1`}
              className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
              onError={(e) => {
                e.target.src = "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=400";
              }}
            />
          </div>

          <div className="rounded-2xl overflow-hidden shadow-lg">
            <img
              src={hotel.image_url_2 || hotel.image_url || hotel.image || "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=400"}
              alt={`${hotel.name || "Hotel"} - View 2`}
              className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
              onError={(e) => {
                e.target.src = "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=400";
              }}
            />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-12">
          {/* Hotel Description */}
          <section>
            <h2 className="text-3xl font-bold text-gray-900 mb-6 pb-3 border-b border-gray-200">
              About this Hotel
            </h2>
            <p className="text-gray-700 text-lg leading-relaxed">
              {hotel.description || hotel.overview || "A comfortable and well-appointed accommodation offering excellent amenities and services for a memorable stay."}
            </p>
          </section>

          {/* Features List */}
          <section>
            <h2 className="text-3xl font-bold text-gray-900 mb-6 pb-3 border-b border-gray-200">
              What this hotel offers
            </h2>
            <ul className="space-y-4">
              <li className="p-6 bg-gradient-to-r from-gray-50 to-white rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow duration-300">
                <div className="flex gap-4 items-start">
                  <IoMdHome className="w-7 h-7 text-blue-600 flex-shrink-0 mt-1" />
                  <div>
                    <p className="font-bold text-xl text-gray-900 mb-2">
                      Luxury Accommodation
                    </p>
                    <p className="text-gray-600 text-lg">
                      Premium rooms with modern amenities and comfortable bedding.
                    </p>
                  </div>
                </div>
              </li>
              <li className="p-6 bg-gradient-to-r from-gray-50 to-white rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow duration-300">
                <div className="flex gap-4 items-start">
                  <RiVerifiedBadgeFill className="w-7 h-7 text-green-600 flex-shrink-0 mt-1" />
                  <div>
                    <p className="font-bold text-xl text-gray-900 mb-2">
                      Enhanced Cleaning
                    </p>
                    <p className="text-gray-600 text-lg">
                      This hotel follows strict cleaning and hygiene standards.
                    </p>
                  </div>
                </div>
              </li>
              <li className="p-6 bg-gradient-to-r from-gray-50 to-white rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow duration-300">
                <div className="flex gap-4 items-start">
                  <FaLocationDot className="w-7 h-7 text-purple-600 flex-shrink-0 mt-1" />
                  <div>
                    <p className="font-bold text-xl text-gray-900 mb-2">
                      Prime Location
                    </p>
                    <p className="text-gray-600 text-lg">
                      Strategically located near major attractions and transportation.
                    </p>
                  </div>
                </div>
              </li>
              <li className="p-6 bg-gradient-to-r from-gray-50 to-white rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow duration-300">
                <div className="flex gap-4 items-start">
                  <FaHeart className="w-7 h-7 text-red-500 flex-shrink-0 mt-1" />
                  <div>
                    <p className="font-bold text-xl text-gray-900 mb-2">
                      Excellent Service
                    </p>
                    <p className="text-gray-600 text-lg">
                      24/7 customer support and personalized services.
                    </p>
                  </div>
                </div>
              </li>
            </ul>
          </section>

          {/* Location Section */}
          <section>
            <h2 className="text-3xl font-bold text-gray-900 mb-6 pb-3 border-b border-gray-200">
              Location
            </h2>
            <div className="bg-gray-50 rounded-xl p-6 border border-gray-200">
              <div className="flex items-start gap-3">
                <FaLocationDot className="w-6 h-6 text-red-500 mt-1 flex-shrink-0" />
                <div>
                  <p className="font-semibold text-gray-900 text-lg mb-2">Address</p>
                  <p className="text-gray-700 text-lg">{hotel.address || hotel.location || "Address not available"}</p>
                  {hotel.state && (
                    <p className="text-gray-600 mt-1">{hotel.state}</p>
                  )}
                </div>
              </div>
            </div>
          </section>
        </div>

        {/* Booking Sidebar */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-2xl shadow-xl border border-gray-200 p-6 sticky top-6">
            <div className="flex justify-between items-center mb-6">
              <p className="text-3xl font-bold text-gray-900">
                ₹{(hotel.price || hotel.price_per_night || hotel.starting_price || 0).toLocaleString()}
                <span className="text-lg font-normal text-gray-600"> / night</span>
              </p>
              <button 
                onClick={(e) => handleAddToCart(hotel,e)}
                className="lg:hidden flex items-center gap-2 text-blue-600 hover:text-blue-700 transition-colors duration-200 p-2 rounded-lg hover:bg-blue-50"
              >
                <BiSolidCartAdd className="w-5 h-5" />
              </button>
            </div>
            
            {/* Booking Form */}
            <div className="bg-gray-50 rounded-xl p-4 mb-6 border border-gray-200">
              {/* Check-in Date */}
              <div className="flex justify-between items-center mb-3 pb-3 border-b border-gray-200">
                <div className="flex items-center gap-2">
                  <span className="text-gray-700 font-medium">Check-in</span>
                </div>
                <input
                  type="date"
                  name="checkIn"
                  value={bookingData.checkIn}
                  onChange={handleInputChange}
                  min={new Date().toISOString().split('T')[0]}
                  className="font-semibold text-gray-900 bg-transparent border-none focus:outline-none"
                />
              </div>
              
              {/* Check-out Date */}
              <div className="flex justify-between items-center mb-3 pb-3 border-b border-gray-200">
                <div className="flex items-center gap-2">
                  <span className="text-gray-700 font-medium">Check-out</span>
                </div>
                <input
                  type="date"
                  name="checkOut"
                  value={bookingData.checkOut}
                  onChange={handleInputChange}
                  min={bookingData.checkIn || new Date().toISOString().split('T')[0]}
                  className="font-semibold text-gray-900 bg-transparent border-none focus:outline-none"
                />
              </div>
              
              {/* Guests */}
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <FaUser className="w-4 h-4 text-gray-500" />
                  <span className="text-gray-700 font-medium">Guests</span>
                </div>
                <select
                  name="guests"
                  value={bookingData.guests}
                  onChange={handleInputChange}
                  className="font-semibold text-gray-900 bg-transparent border-none focus:outline-none"
                >
                  {[1, 2, 3, 4, 5, 6].map(num => (
                    <option key={num} value={num}>{num}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="space-y-4">
              <button 
                onClick={handleBookNow}
                className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white py-4 px-6 rounded-xl font-bold text-lg transition-all duration-300 transform hover:scale-105 shadow-lg"
              >
                Book Now
              </button>
              
              <button 
                onClick={(e) => handleAddToCart(hotel,e)}
                className="w-full flex items-center justify-center gap-2 border-2 border-blue-600 text-blue-600 hover:bg-blue-600 hover:text-white py-4 px-6 rounded-xl font-bold text-lg transition-all duration-300 transform hover:scale-105"
              >
                <BiSolidCartAdd className="w-5 h-5" />
                Add to Cart
              </button>
            </div>

            <p className="text-center text-gray-500 text-sm my-6">
              You won't be charged yet
            </p>

            {/* Price Breakdown */}
            <div className="space-y-3 text-gray-600">
              <div className="flex justify-between text-base">
                <span>₹{(hotel.price || 0).toLocaleString()} x {calculateNights()} nights</span>
                <span className="font-semibold">₹{(((hotel.price || 0) * calculateNights())).toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-base">
                <span>Cleaning fee</span>
                <span className="font-semibold">₹500</span>
              </div>
              <div className="flex justify-between text-base">
                <span>Service fee</span>
                <span className="font-semibold">₹300</span>
              </div>
              <div className="border-t border-gray-300 pt-4 mt-4">
                <div className="flex justify-between text-lg font-bold text-gray-900">
                  <span>Total</span>
                  <span>₹{calculateTotal().toLocaleString()}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PropertyRoomDetails;
