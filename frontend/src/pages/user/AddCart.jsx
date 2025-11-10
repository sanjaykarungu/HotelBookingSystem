import React, { useState, useEffect } from 'react';
import { BiSolidCartAdd, BiTrash, BiPlus, BiMinus, BiCalendar, BiUser } from 'react-icons/bi';
import { useNavigate } from 'react-router-dom';
import Navbar from '../../components/user/Navbar';

const AddCart = () => {
  const [cartItems, setCartItems] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showBookingForm, setShowBookingForm] = useState(false);
  const [bookingDetails, setBookingDetails] = useState({
    checkIn: '',
    checkOut: '',
    guests: 1,
    rooms: 1,
    specialRequests: ''
  });
  const navigate = useNavigate();

  // Check authentication and load cart items
  useEffect(() => {
    const checkAuth = () => {
      const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';
      const userProfile = localStorage.getItem('userProfile');
      
      if (!isLoggedIn || !userProfile) {
        alert('Please login first to access your cart!');
        navigate('/login');
        return false;
      }
      return true;
    };

    const loadCartItems = () => {
      if (checkAuth()) {
        const savedCart = localStorage.getItem('roomCart');
        if (savedCart) {
          setCartItems(JSON.parse(savedCart));
        }
        setIsLoading(false);
      }
    };

    loadCartItems();
  }, [navigate]);

  // Remove item from cart
  const removeFromCart = (roomId) => {
    const updatedCart = cartItems.filter(item => item.id !== roomId);
    setCartItems(updatedCart);
    localStorage.setItem('roomCart', JSON.stringify(updatedCart));
  };

  // Update quantity
  const updateQuantity = (roomId, newQuantity) => {
    if (newQuantity < 1) return;
    
    const updatedCart = cartItems.map(item =>
      item.id === roomId ? { ...item, quantity: newQuantity } : item
    );
    setCartItems(updatedCart);
    localStorage.setItem('roomCart', JSON.stringify(updatedCart));
  };

  // Clear all cart items
  const clearCart = () => {
    setCartItems([]);
    localStorage.removeItem('roomCart');
  };

  // Handle booking form input changes
  const handleBookingInputChange = (e) => {
    const { name, value } = e.target;
    setBookingDetails(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Generate unique booking ID
  const generateBookingId = () => {
    return 'BK' + Date.now() + Math.random().toString(36).substr(2, 5).toUpperCase();
  };

  // Calculate total nights
  const calculateNights = (checkIn, checkOut) => {
    const start = new Date(checkIn);
    const end = new Date(checkOut);
    const timeDiff = end - start;
    return Math.ceil(timeDiff / (1000 * 60 * 60 * 24));
  };

  // Place order and create booking
  const placeOrder = () => {
    if (!bookingDetails.checkIn || !bookingDetails.checkOut) {
      alert('Please select check-in and check-out dates');
      return;
    }

    const nights = calculateNights(bookingDetails.checkIn, bookingDetails.checkOut);
    if (nights <= 0) {
      alert('Check-out date must be after check-in date');
      return;
    }

    // Create booking for each cart item
    const newBookings = cartItems.map(item => {
      const bookingId = generateBookingId();
      const totalAmount = (item.price * item.quantity * nights) + (item.price * item.quantity * nights * 0.1) + 15;
      
      return {
        id: bookingId,
        hotelName: item.name,
        hotelImage: item.image || "https://images.unsplash.com/photo-1611892440504-42a792e24d32?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80",
        roomType: item.type || "Deluxe Room",
        roomAddress: item.address || "City Center",
        roomRating: item.rating || "4.5",
        checkIn: bookingDetails.checkIn,
        checkOut: bookingDetails.checkOut,
        nights: nights,
        guests: parseInt(bookingDetails.guests),
        rooms: parseInt(bookingDetails.rooms),
        totalAmount: totalAmount.toFixed(2),
        status: 'confirmed',
        bookingDate: new Date().toISOString(),
        specialRequests: bookingDetails.specialRequests,
        roomPrice: item.price,
        roomQuantity: item.quantity
      };
    });

    // Save to localStorage
    const existingBookings = JSON.parse(localStorage.getItem('userBookings')) || [];
    const updatedBookings = [...existingBookings, ...newBookings];
    localStorage.setItem('userBookings', JSON.stringify(updatedBookings));

    // Clear cart
    setCartItems([]);
    localStorage.removeItem('roomCart');

    // Reset form
    setShowBookingForm(false);
    setBookingDetails({
      checkIn: '',
      checkOut: '',
      guests: 1,
      rooms: 1,
      specialRequests: ''
    });

    // Show success message and redirect
    alert(`Successfully booked ${newBookings.length} room(s)! Redirecting to bookings...`);
    navigate('/booking');
  };

  // Calculate total price
  const calculateTotal = () => {
    return cartItems.reduce((total, item) => total + (item.price * item.quantity), 0);
  };

  // Calculate item total
  const calculateItemTotal = (price, quantity) => {
    return price * quantity;
  };

  // Get tomorrow's date for min check-in
  const getTomorrowDate = () => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow.toISOString().split('T')[0];
  };

  // Get min check-out date (check-in + 1 day)
  const getMinCheckoutDate = () => {
    if (!bookingDetails.checkIn) return getTomorrowDate();
    const minDate = new Date(bookingDetails.checkIn);
    minDate.setDate(minDate.getDate() + 1);
    return minDate.toISOString().split('T')[0];
  };

  if (isLoading) {
    return (
      <div>
        <Navbar />
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-600">Loading your cart...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div>
      <Navbar/>
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-gray-900 mb-2">Shopping Cart</h1>
            <p className="text-gray-600 text-lg">
              {cartItems.length === 0 ? 'Your cart is empty' : `${cartItems.length} item${cartItems.length > 1 ? 's' : ''} in your cart`}
            </p>
          </div>

          {cartItems.length === 0 ? (
            // Empty Cart State
            <div className="text-center py-16 bg-white rounded-2xl shadow-sm border border-gray-100">
              <div className="w-24 h-24 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <BiSolidCartAdd className="w-12 h-12 text-blue-600" />
              </div>
              <h2 className="text-2xl font-bold text-gray-800 mb-3">Your cart is empty</h2>
              <p className="text-gray-500 text-lg mb-8 max-w-md mx-auto">
                Looks like you haven't added any rooms to your cart yet. Start exploring our amazing properties!
              </p>
              <button 
                onClick={() => navigate('/rooms')}
                className="bg-gradient-to-r from-blue-600 to-blue-700 text-white px-8 py-3 rounded-xl font-semibold hover:from-blue-700 hover:to-blue-800 transition-all duration-300 shadow-lg hover:shadow-xl"
              >
                Browse Rooms
              </button>
            </div>
          ) : (
            <div className="max-w-6xl mx-auto">
              {/* Cart Header */}
              <div className="flex justify-between items-center bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-6">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">Cart Items</h2>
                  <p className="text-gray-600 mt-1">Review your selected rooms</p>
                </div>
                <div className="flex gap-3">
                  <button
                    onClick={() => setShowBookingForm(true)}
                    className="bg-green-600 hover:bg-green-700 text-white font-semibold flex items-center gap-2 px-6 py-2 rounded-lg transition-colors duration-200 shadow-lg hover:shadow-xl"
                  >
                    <BiCalendar className="w-5 h-5" />
                    Book Now
                  </button>
                  <button
                    onClick={clearCart}
                    className="text-red-500 hover:text-red-700 font-semibold flex items-center gap-2 px-4 py-2 rounded-lg hover:bg-red-50 transition-colors duration-200 border border-red-200"
                  >
                    <BiTrash className="w-5 h-5" />
                    Clear All
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Cart Items List */}
                <div className="lg:col-span-2 space-y-4">
                  {cartItems.map((item) => (
                    <div key={item.id} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow duration-300">
                      <div className="flex flex-col sm:flex-row gap-6">
                        {/* Room Image */}
                        <div className="flex-shrink-0">
                          <img
                            src={item.image || "https://images.unsplash.com/photo-1611892440504-42a792e24d32?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80"}
                            alt={item.name}
                            className="w-32 h-32 object-cover rounded-xl shadow-md"
                          />
                        </div>
                        
                        {/* Room Details */}
                        <div className="flex-grow">
                          <div className="flex justify-between items-start mb-3">
                            <div>
                              <h3 className="text-xl font-bold text-gray-900">{item.name}</h3>
                              <p className="text-gray-500 text-sm mt-1">{item.type || "Deluxe Room"}</p>
                            </div>
                            <button
                              onClick={() => removeFromCart(item.id)}
                              className="text-red-400 hover:text-red-600 transition-colors duration-200 p-2 hover:bg-red-50 rounded-lg"
                            >
                              <BiTrash className="w-5 h-5" />
                            </button>
                          </div>
                          
                          <div className="flex items-center gap-3 mb-4">
                            <div className="flex items-center gap-1 bg-yellow-50 px-3 py-1 rounded-full">
                              <span className="text-yellow-500">⭐</span>
                              <span className="font-semibold text-gray-800 text-sm">{item.rating || "4.5"}</span>
                            </div>
                            <span className="text-gray-400">•</span>
                            <span className="text-gray-600 text-sm">{item.address || "City Center"}</span>
                          </div>
                          
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                            {/* Quantity Controls */}
                            <div className="flex items-center gap-4">
                              <span className="text-gray-700 font-medium">Nights:</span>
                              <div className="flex items-center gap-2 bg-gray-100 rounded-xl p-1">
                                <button
                                  onClick={() => updateQuantity(item.id, item.quantity - 1)}
                                  className="w-8 h-8 bg-white rounded-lg flex items-center justify-center hover:bg-gray-50 transition-colors duration-200 shadow-sm"
                                  disabled={item.quantity <= 1}
                                >
                                  <BiMinus className="w-4 h-4 text-gray-600" />
                                </button>
                                <span className="w-8 text-center font-bold text-gray-900 text-lg">
                                  {item.quantity}
                                </span>
                                <button
                                  onClick={() => updateQuantity(item.id, item.quantity + 1)}
                                  className="w-8 h-8 bg-white rounded-lg flex items-center justify-center hover:bg-gray-50 transition-colors duration-200 shadow-sm"
                                >
                                  <BiPlus className="w-4 h-4 text-gray-600" />
                                </button>
                              </div>
                            </div>
                            
                            {/* Price */}
                            <div className="text-right">
                              <p className="text-2xl font-bold text-blue-600">
                                ${calculateItemTotal(item.price, item.quantity)}
                              </p>
                              <p className="text-sm text-gray-500">
                                ${item.price} × {item.quantity} nights
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Order Summary */}
                <div className="lg:col-span-1">
                  <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 sticky top-8">
                    <h3 className="text-xl font-bold text-gray-900 mb-4">Order Summary</h3>
                    
                    <div className="space-y-3 mb-6">
                      <div className="flex justify-between text-gray-600">
                        <span>Subtotal ({cartItems.length} items)</span>
                        <span>${calculateTotal().toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between text-gray-600">
                        <span>Taxes & Fees</span>
                        <span>${(calculateTotal() * 0.1).toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between text-gray-600">
                        <span>Service Charge</span>
                        <span>$15.00</span>
                      </div>
                      <div className="border-t pt-3">
                        <div className="flex justify-between text-lg font-bold text-gray-900">
                          <span>Total</span>
                          <span>${(calculateTotal() + (calculateTotal() * 0.1) + 15).toFixed(2)}</span>
                        </div>
                      </div>
                    </div>

                    <button
                      onClick={() => setShowBookingForm(true)}
                      className="w-full bg-gradient-to-r from-green-600 to-green-700 text-white py-3 px-4 rounded-xl font-semibold hover:from-green-700 hover:to-green-800 transition-all duration-300 shadow-lg hover:shadow-xl mb-4"
                    >
                      Book Now
                    </button>

                    <button 
                      onClick={() => navigate('/rooms')}
                      className="w-full bg-gradient-to-r from-blue-600 to-blue-700 text-white py-3 px-4 rounded-xl font-semibold hover:from-blue-700 hover:to-blue-800 transition-all duration-300 shadow-lg hover:shadow-xl"
                    >
                      Continue Booking
                    </button>

                    <div className="mt-4 text-center">
                      <p className="text-sm text-gray-500">
                        Secure checkout • Best price guarantee
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Booking Modal */}
          {showBookingForm && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
              <div className="bg-white rounded-2xl shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
                <div className="p-6">
                  <h3 className="text-2xl font-bold text-gray-900 mb-4">Complete Your Booking</h3>
                  
                  <div className="space-y-4">
                    {/* Check-in Date */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        <BiCalendar className="inline w-4 h-4 mr-1" />
                        Check-in Date
                      </label>
                      <input
                        type="date"
                        name="checkIn"
                        value={bookingDetails.checkIn}
                        onChange={handleBookingInputChange}
                        min={getTomorrowDate()}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        required
                      />
                    </div>

                    {/* Check-out Date */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        <BiCalendar className="inline w-4 h-4 mr-1" />
                        Check-out Date
                      </label>
                      <input
                        type="date"
                        name="checkOut"
                        value={bookingDetails.checkOut}
                        onChange={handleBookingInputChange}
                        min={getMinCheckoutDate()}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        required
                      />
                    </div>

                    {/* Guests */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        <BiUser className="inline w-4 h-4 mr-1" />
                        Number of Guests
                      </label>
                      <select
                        name="guests"
                        value={bookingDetails.guests}
                        onChange={handleBookingInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      >
                        {[1, 2, 3, 4, 5, 6].map(num => (
                          <option key={num} value={num}>{num} Guest{num > 1 ? 's' : ''}</option>
                        ))}
                      </select>
                    </div>

                    {/* Rooms */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Number of Rooms
                      </label>
                      <select
                        name="rooms"
                        value={bookingDetails.rooms}
                        onChange={handleBookingInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      >
                        {[1, 2, 3, 4].map(num => (
                          <option key={num} value={num}>{num} Room{num > 1 ? 's' : ''}</option>
                        ))}
                      </select>
                    </div>

                    {/* Special Requests */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Special Requests
                      </label>
                      <textarea
                        name="specialRequests"
                        value={bookingDetails.specialRequests}
                        onChange={handleBookingInputChange}
                        rows="3"
                        placeholder="Any special requests or requirements..."
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>

                    {/* Booking Summary */}
                    {bookingDetails.checkIn && bookingDetails.checkOut && (
                      <div className="bg-gray-50 p-4 rounded-lg">
                        <h4 className="font-semibold text-gray-900 mb-2">Booking Summary</h4>
                        <p className="text-sm text-gray-600">
                          {calculateNights(bookingDetails.checkIn, bookingDetails.checkOut)} nights • 
                          {bookingDetails.guests} guest{bookingDetails.guests > 1 ? 's' : ''} • 
                          {bookingDetails.rooms} room{bookingDetails.rooms > 1 ? 's' : ''}
                        </p>
                      </div>
                    )}
                  </div>

                  <div className="flex gap-3 mt-6">
                    <button
                      onClick={() => setShowBookingForm(false)}
                      className="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-800 py-3 px-4 rounded-xl font-semibold transition-colors duration-200"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={placeOrder}
                      className="flex-1 bg-green-600 hover:bg-green-700 text-white py-3 px-4 rounded-xl font-semibold transition-colors duration-200 shadow-lg hover:shadow-xl"
                    >
                      Confirm Booking
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AddCart;