import React, { useState, useEffect } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { IoMdHome } from "react-icons/io";
import { RiVerifiedBadgeFill } from "react-icons/ri";
import { FaCalendarAlt, FaUser } from "react-icons/fa";
import { FaHeart } from "react-icons/fa";
import { IoLocationSharp } from "react-icons/io5";
import { BiSolidCartAdd } from "react-icons/bi";

const RoomDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [room, setRoom] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // State for booking dates and guests
  const [bookingData, setBookingData] = useState({
    checkIn: '',
    checkOut: '',
    guests: 1
  });

  // Fetch room data from API
  const fetchRoom = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch(`https://hotel-booking-sigma-wine.vercel.app/api/hotel/${id}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch room data');
      }
      
      const data = await response.json();
      setRoom(data);
      
    } catch (err) {
      console.error('Error fetching room:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRoom();
  }, [id]);

  // Handle input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setBookingData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Function to handle add to cart
  const handleAddToCart = () => {
    if (!room) return;

    const cartItem = {
      id: room._id || room.id,
      name: room.name,
      price: room.price,
      image: room.image_url,
      rating: room.rating,
      address: room.address,
      quantity: 1
    };

    const existingCart = JSON.parse(localStorage.getItem('roomCart')) || [];
    const roomExists = existingCart.find(item => item.id === cartItem.id);
    
    if (roomExists) {
      alert('This room is already in your cart!');
      return;
    }

    existingCart.push(cartItem);
    localStorage.setItem('roomCart', JSON.stringify(existingCart));
    alert(`${room.name} added to cart successfully!`);
  }

  // Function to handle book now
  const handleBookNow = () => {
    if (!room) return;

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
    const totalAmount = (room.price * nights) + 80;

    // Create booking object
    const newBooking = {
      id: bookingId,
      hotelName: room.name,
      hotelImage: room.image_url,
      checkIn: bookingData.checkIn,
      checkOut: bookingData.checkOut,
      guests: parseInt(bookingData.guests),
      rooms: 1,
      totalAmount: totalAmount,
      bookingDate: new Date().toISOString(),
      status: 'confirmed',
      roomAddress: room.address,
      roomRating: room.rating
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
    if (!room || !bookingData.checkIn || !bookingData.checkOut) {
      return room?.price || 0;
    }
    
    const checkIn = new Date(bookingData.checkIn);
    const checkOut = new Date(bookingData.checkOut);
    const nights = Math.ceil((checkOut - checkIn) / (1000 * 60 * 60 * 24));
    
    return (room.price * nights) + 80;
  };

  const calculateNights = () => {
    if (!bookingData.checkIn || !bookingData.checkOut) return 0;
    const checkIn = new Date(bookingData.checkIn);
    const checkOut = new Date(bookingData.checkOut);
    return Math.ceil((checkOut - checkIn) / (1000 * 60 * 60 * 24));
  };

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center p-8">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <h1 className="text-2xl font-bold text-gray-800 mb-2">Loading Room Details...</h1>
          <p className="text-gray-600">Fetching data from API</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center p-8 max-w-md">
          <div className="bg-red-50 border border-red-200 rounded-xl p-6">
            <div className="text-red-600 text-lg font-semibold mb-2">
              Failed to Load Room
            </div>
            <p className="text-red-500 text-sm mb-4">
              {error}
            </p>
            <button
              onClick={fetchRoom}
              className="bg-red-600 hover:bg-red-700 text-white px-6 py-2 rounded-lg text-sm font-semibold transition-all duration-200"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!room) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center p-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-4">Room Not Found</h1>
          <p className="text-gray-600 text-lg">The room you're looking for doesn't exist.</p>
          <Link 
            to="/rooms" 
            className="inline-block mt-4 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors duration-200"
          >
            Back to Rooms
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Room Header */}
      <div className="mb-12">
        <div className="flex justify-between items-start mb-3">
          <h1 className="text-4xl font-bold text-gray-900">{room.name}</h1>
          <button 
            onClick={handleAddToCart}
            className="flex items-center gap-2 text-blue-600 hover:text-blue-700 transition-colors duration-200 p-3 rounded-lg hover:bg-blue-50 border border-blue-200"
          >
            <BiSolidCartAdd className="w-6 h-6" />
            <span className="font-semibold">Add to Cart</span>
          </button>
        </div>
        <div className="flex flex-wrap items-center gap-3 text-gray-600">
          <div className="flex items-center gap-2 bg-yellow-50 px-3 py-1 rounded-full">
            <span className="text-yellow-500 text-lg">⭐</span>
            <span className="font-semibold text-gray-800">{room.rating}</span>
          </div>
          <span className="text-gray-400">•</span>
          <span className="text-gray-700">{room.address}</span>
        </div>
      </div>

      {/* Image Grid Section */}
      <div className="mb-16">
        <div className="grid grid-cols-3 grid-rows-2 gap-4 h-[400px] sm:h-[400px]">
          {/* Main large image */}
          <div className="col-span-2 row-span-2 rounded-2xl overflow-hidden shadow-lg">
            <img
              src={room.image_url}
              alt={room.name}
              className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
              onError={(e) => {
                e.target.src = "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=400";
              }}
            />
          </div>

          {/* Top-right images */}
          <div className="rounded-2xl overflow-hidden shadow-lg">
            <img
              src={room.image_url_1 || room.image_url}
              alt={`${room.name} - View 1`}
              className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
              onError={(e) => {
                e.target.src = "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=400";
              }}
            />
          </div>

          <div className="rounded-2xl overflow-hidden shadow-lg">
            <img
              src={room.image_url_2 || room.image_url}
              alt={`${room.name} - View 2`}
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
          {/* Room Description */}
          <section>
            <h2 className="text-3xl font-bold text-gray-900 mb-6 pb-3 border-b border-gray-200">
              About this place
            </h2>
            <p className="text-gray-700 text-lg leading-relaxed">
              {room.description}
            </p>
          </section>

          {/* Features List */}
          <section>
            <h2 className="text-3xl font-bold text-gray-900 mb-6 pb-3 border-b border-gray-200">
              What this place offers
            </h2>
            <ul className="space-y-4">
              <li className="p-6 bg-gradient-to-r from-gray-50 to-white rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow duration-300">
                <div className="flex gap-4 items-start">
                  <IoMdHome className="w-7 h-7 text-blue-600 flex-shrink-0 mt-1" />
                  <div>
                    <p className="font-bold text-xl text-gray-900 mb-2">
                      Clean & Safe Stay
                    </p>
                    <p className="text-gray-600 text-lg">
                      A well-maintained and hygienic space just for you.
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
                      This host follows strict cleaning standards.
                    </p>
                  </div>
                </div>
              </li>
              <li className="p-6 bg-gradient-to-r from-gray-50 to-white rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow duration-300">
                <div className="flex gap-4 items-start">
                  <IoLocationSharp className="w-7 h-7 text-purple-600 flex-shrink-0 mt-1" />
                  <div>
                    <p className="font-bold text-xl text-gray-900 mb-2">
                      Excellent Location
                    </p>
                    <p className="text-gray-600 text-lg">
                      90% of guests rated the location 5 stars.
                    </p>
                  </div>
                </div>
              </li>
              <li className="p-6 bg-gradient-to-r from-gray-50 to-white rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow duration-300">
                <div className="flex gap-4 items-start">
                  <FaHeart className="w-7 h-7 text-red-500 flex-shrink-0 mt-1" />
                  <div>
                    <p className="font-bold text-xl text-gray-900 mb-2">
                      Smooth Check-In
                    </p>
                    <p className="text-gray-600 text-lg">
                      100% of guests gave check-in a 5-star rating.
                    </p>
                  </div>
                </div>
              </li>
            </ul>
          </section>

          {/* Additional Description */}
          <section>
            <h2 className="text-3xl font-bold text-gray-900 mb-6 pb-3 border-b border-gray-200">
              Property Details
            </h2>
            <p className="text-gray-600 text-lg leading-relaxed">
              Guests will be allocated on the ground floor according to availability. 
              You get a comfortable Two bedroom apartment has a true city feeling. 
              The price quoted is for two guest, at the guest slot please mark the 
              number of guests to get the exact price for groups. The Guests will be 
              allocated ground floor according to availability. You get the comfortable 
              two bedroom apartment that has a true city feeling.
            </p>
          </section>
        </div>

        {/* Booking Sidebar */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-2xl shadow-xl border border-gray-200 p-6 sticky top-6">
            <div className="flex justify-between items-center mb-6">
              <p className="text-3xl font-bold text-gray-900">
                ${room.price}
                <span className="text-lg font-normal text-gray-600"> / night</span>
              </p>
              <button 
                onClick={handleAddToCart}
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
                  <FaCalendarAlt className="w-4 h-4 text-gray-500" />
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
                  <FaCalendarAlt className="w-4 h-4 text-gray-500" />
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
                onClick={handleAddToCart}
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
              {bookingData.checkIn && bookingData.checkOut && (
                <div className="flex justify-between text-base">
                  <span>${room.price} x {calculateNights()} nights</span>
                  <span className="font-semibold">${room.price * calculateNights()}</span>
                </div>
              )}
              <div className="flex justify-between text-base">
                <span>Cleaning fee</span>
                <span className="font-semibold">$50</span>
              </div>
              <div className="flex justify-between text-base">
                <span>Service fee</span>
                <span className="font-semibold">$30</span>
              </div>
              <div className="border-t border-gray-300 pt-4 mt-4">
                <div className="flex justify-between text-lg font-bold text-gray-900">
                  <span>Total</span>
                  <span>${calculateTotal()}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RoomDetails;