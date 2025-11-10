import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from 'react-router-dom'
import { IoMdHome } from "react-icons/io";
import { RiVerifiedBadgeFill } from "react-icons/ri";
import { FaLocationDot, FaUser } from "react-icons/fa6";
import { FaHeart } from "react-icons/fa";
import { BiSolidCartAdd } from "react-icons/bi";

const StatesRoomDetails = () => {
  const { stateId, hotelId } = useParams();
  const navigate = useNavigate();
  
  const [state, setState] = useState(null);
  const [hotel, setHotel] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // State for booking dates and guests
  const [bookingData, setBookingData] = useState({
    checkIn: '',
    checkOut: '',
    guests: 1
  });

  // Fetch state and hotel data from backend API
  useEffect(() => {
    const fetchStateAndHotel = async () => {
      try {
        setLoading(true);
        
        // Fetch the state data
        const stateResponse = await fetch(`https://hotel-booking-sigma-wine.vercel.app/api/india/${stateId}`);
        
        if (!stateResponse.ok) {
          throw new Error('Failed to fetch state data');
        }
        
        const stateData = await stateResponse.json();
        setState(stateData);
        
        // Find the hotel within the state
        const stateKey = stateData.state.toLowerCase().replace(' ', '');
        const stateHotels = stateData[stateKey] || [];
        const foundHotel = stateHotels.find(item => item._id === hotelId || item.id === parseInt(hotelId));
        
        if (!foundHotel) {
          throw new Error('Hotel not found');
        }
        
        setHotel(foundHotel);
        
      } catch (err) {
        setError(err.message);
        console.error('Error fetching data:', err);
      } finally {
        setLoading(false);
      }
    };

    if (stateId && hotelId) {
      fetchStateAndHotel();
    }
  }, [stateId, hotelId]);

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
    
    // Create cart item
    const cartItem = {
      id: hotel._id || hotel.id,
      name: hotel.name,
      price: hotel.price,
      image: hotel.image_url,
      rating: hotel.rating,
      address: hotel.address,
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
    
    alert(`${hotel.name} added to cart successfully!`);
  }

  // Function to handle book now
  const handleBookNow = () => {
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
    const totalAmount = (hotel.price * nights) + 800; // Room price + fees (500 + 300)

    // Create booking object
    const newBooking = {
      id: bookingId,
      hotelName: hotel.name,
      hotelImage: hotel.image_url,
      checkIn: bookingData.checkIn,
      checkOut: bookingData.checkOut,
      guests: parseInt(bookingData.guests),
      rooms: 1,
      totalAmount: totalAmount,
      bookingDate: new Date().toISOString(),
      status: 'confirmed',
      roomAddress: hotel.address,
      roomRating: hotel.rating,
      state: state.state
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
    if (!bookingData.checkIn || !bookingData.checkOut) return (hotel?.price * 3) + 800;
    
    const checkIn = new Date(bookingData.checkIn);
    const checkOut = new Date(bookingData.checkOut);
    const nights = Math.ceil((checkOut - checkIn) / (1000 * 60 * 60 * 24));
    
    return (hotel.price * nights) + 800;
  };

  const calculateNights = () => {
    if (!bookingData.checkIn || !bookingData.checkOut) return 3;
    const checkIn = new Date(bookingData.checkIn);
    const checkOut = new Date(bookingData.checkOut);
    return Math.ceil((checkOut - checkIn) / (1000 * 60 * 60 * 24));
  };

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-800 mb-4">Loading...</h1>
          <p className="text-gray-600 text-lg">Loading hotel details...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center p-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-4">Oops!</h1>
          <p className="text-red-500 text-lg mb-4">Error: {error}</p>
          <button 
            onClick={() => window.location.reload()} 
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  if (!state || !hotel) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center p-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-4">Not Found</h1>
          <p className="text-gray-600 text-lg">The hotel or state you're looking for doesn't exist.</p>
          <button 
            onClick={() => navigate('/')}
            className="mt-4 bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Back to Home
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Hotel Header */}
      <div className="mb-12">
        <div className="flex justify-between items-start mb-3">
          <h1 className="text-4xl font-bold text-gray-900">{hotel.name}</h1>
          <button 
            onClick={(e) => handleAddToCart(hotel, e)}
            className="flex items-center gap-2 text-blue-600 hover:text-blue-700 transition-colors duration-200 p-3 rounded-lg hover:bg-blue-50 border border-blue-200"
          >
            <BiSolidCartAdd className="w-6 h-6" />
            <span className="font-semibold">Add to Cart</span>
          </button>
        </div>
        <div className="flex flex-wrap items-center gap-3 text-gray-600">
          <div className="flex items-center gap-2 bg-yellow-50 px-3 py-1 rounded-full">
            <span className="text-yellow-500 text-lg">⭐</span>
            <span className="font-semibold text-gray-800">{hotel.rating}</span>
          </div>
          <span className="text-gray-400">•</span>
          <span className="text-gray-700">{hotel.address}</span>
          <span className="text-gray-400">•</span>
          <span className="text-gray-700 bg-blue-50 px-3 py-1 rounded-full text-sm">
            {state.state}
          </span>
        </div>
      </div>

      {/* Image Section */}
      <div className="mb-16">
        <div className="grid grid-cols-3 grid-rows-2 gap-4 h-[400px] sm:h-[400px]">
          {/* Main large image */}
          <div className="col-span-2 row-span-2 rounded-2xl overflow-hidden shadow-lg">
            <img
              src={hotel.image_url}
              alt={hotel.name}
              className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
            />
          </div>

          {/* Top-right images */}
          <div className="rounded-2xl overflow-hidden shadow-lg">
            <img
              src={hotel.image_url_1 || hotel.image_url}
              alt={`${hotel.name} - View 1`}
              className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
            />
          </div>

          <div className="rounded-2xl overflow-hidden shadow-lg">
            <img
              src={hotel.image_url_2 || hotel.image_url}
              alt={`${hotel.name} - View 2`}
              className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
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
              {hotel.description}
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
        </div>

        {/* Booking Sidebar */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-2xl shadow-xl border border-gray-200 p-6 sticky top-6">
            <div className="flex justify-between items-center mb-6">
              <p className="text-3xl font-bold text-gray-900">
                ₹{hotel.price.toLocaleString()}
                <span className="text-lg font-normal text-gray-600"> / night</span>
              </p>
              <button 
                onClick={(e) => handleAddToCart(hotel, e)}
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
                onClick={(e) => handleAddToCart(hotel, e)}
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
                <span>₹{hotel.price.toLocaleString()} x {calculateNights()} nights</span>
                <span className="font-semibold">₹{(hotel.price * calculateNights()).toLocaleString()}</span>
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

export default StatesRoomDetails;