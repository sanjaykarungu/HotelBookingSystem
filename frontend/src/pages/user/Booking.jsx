import React, { useState, useEffect } from 'react';
import { 
  FaSearch, 
  FaCalendarAlt, 
  FaUser, 
  FaMoneyBillWave, 
  FaCheckCircle, 
  FaTimesCircle, 
  FaClock,
  FaDownload,
  FaPrint,
  FaMapMarkerAlt,
  FaStar,
  FaEye,
  FaEdit,
  FaShare,
  FaFilter,
  FaExclamationTriangle
} from 'react-icons/fa';

const Booking = () => {
  const [bookings, setBookings] = useState([]);
  const [filter, setFilter] = useState('all');
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('newest');
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [error, setError] = useState(null);

  // Load bookings from localStorage
  useEffect(() => {
    loadBookings();
  }, []);

  const loadBookings = () => {
    try {
      console.log('Loading bookings from localStorage...');
      const userBookings = JSON.parse(localStorage.getItem('userBookings')) || [];
      console.log('Raw bookings from localStorage:', userBookings);
      
      // Validate and clean up booking data
      const validatedBookings = userBookings.map(booking => ({
        id: booking.id || `BK-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
        hotelName: booking.hotelName || 'Unknown Hotel',
        hotelImage: booking.hotelImage || 'https://images.unsplash.com/photo-1566073771259-6a8506099945?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80',
        roomType: booking.roomType || 'Standard Room',
        roomAddress: booking.roomAddress || 'Address not available',
        roomRating: booking.roomRating || '4.0',
        checkIn: booking.checkIn || new Date().toISOString().split('T')[0],
        checkOut: booking.checkOut || new Date(Date.now() + 86400000).toISOString().split('T')[0],
        guests: booking.guests || 1,
        rooms: booking.rooms || 1,
        totalAmount: booking.totalAmount || '0.00',
        status: booking.status || 'pending',
        bookingDate: booking.bookingDate || new Date().toISOString(),
        specialRequests: booking.specialRequests || '',
        roomPrice: booking.roomPrice || '0.00',
        roomQuantity: booking.roomQuantity || 1
      }));

      console.log('Validated bookings:', validatedBookings);

      // Sort by booking date (newest first)
      const sortedBookings = validatedBookings.sort((a, b) => 
        new Date(b.bookingDate) - new Date(a.bookingDate)
      );
      
      setBookings(sortedBookings);
      setError(null);
    } catch (error) {
      console.error('Error loading bookings from localStorage:', error);
      setError('Failed to load bookings. Please try refreshing the page.');
      setBookings([]);
    } finally {
      setLoading(false);
    }
  };

  // Save bookings to localStorage
  const saveBookings = (updatedBookings) => {
    try {
      localStorage.setItem('userBookings', JSON.stringify(updatedBookings));
      console.log('Bookings saved to localStorage:', updatedBookings);
    } catch (error) {
      console.error('Error saving bookings:', error);
      alert('Failed to save changes. Please try again.');
    }
  };

  // Filter and sort bookings
  const filteredBookings = bookings
    .filter(booking => {
      const hotelName = booking.hotelName || '';
      const bookingId = booking.id || '';
      const roomType = booking.roomType || '';
      const status = booking.status || '';
      
      const matchesFilter = filter === 'all' || status === filter;
      const matchesSearch = 
        hotelName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        bookingId.toLowerCase().includes(searchTerm.toLowerCase()) ||
        roomType.toLowerCase().includes(searchTerm.toLowerCase());
      
      return matchesFilter && matchesSearch;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'newest':
          return new Date(b.bookingDate) - new Date(a.bookingDate);
        case 'oldest':
          return new Date(a.bookingDate) - new Date(b.bookingDate);
        case 'price-high':
          return parseFloat(b.totalAmount) - parseFloat(a.totalAmount);
        case 'price-low':
          return parseFloat(a.totalAmount) - parseFloat(b.totalAmount);
        case 'checkin-early':
          return new Date(a.checkIn) - new Date(b.checkIn);
        case 'checkin-late':
          return new Date(b.checkIn) - new Date(a.checkIn);
        default:
          return 0;
      }
    });

  const getStatusColor = (status) => {
    switch (status) {
      case 'confirmed': return 'bg-green-100 text-green-800 border-green-200';
      case 'pending': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'completed': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'cancelled': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'confirmed': return <FaCheckCircle className="w-4 h-4" />;
      case 'pending': return <FaClock className="w-4 h-4" />;
      case 'completed': return <FaCheckCircle className="w-4 h-4" />;
      case 'cancelled': return <FaTimesCircle className="w-4 h-4" />;
      default: return <FaClock className="w-4 h-4" />;
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'confirmed': return 'Confirmed';
      case 'pending': return 'Pending';
      case 'completed': return 'Completed';
      case 'cancelled': return 'Cancelled';
      default: return status || 'Unknown';
    }
  };

  const calculateNights = (checkIn, checkOut) => {
    try {
      const start = new Date(checkIn);
      const end = new Date(checkOut);
      
      if (isNaN(start.getTime()) || isNaN(end.getTime())) {
        return 0;
      }
      
      const timeDiff = end - start;
      const nights = Math.max(0, Math.ceil(timeDiff / (1000 * 60 * 60 * 24)));
      return nights > 0 ? nights : 1; // Minimum 1 night
    } catch (error) {
      console.error('Error calculating nights:', error);
      return 1;
    }
  };

  const handleCancelBooking = (bookingId) => {
    if (window.confirm('Are you sure you want to cancel this booking?')) {
      const updatedBookings = bookings.map(booking => 
        booking.id === bookingId 
          ? { ...booking, status: 'cancelled', cancelledAt: new Date().toISOString() }
          : booking
      );
      setBookings(updatedBookings);
      saveBookings(updatedBookings);
      alert('Booking cancelled successfully!');
    }
  };

  const handleViewDetails = (booking) => {
    setSelectedBooking(booking);
    setShowDetailModal(true);
  };

  const handleEditBooking = (bookingId) => {
    // For demo purposes - in real app, this would navigate to edit page
    const booking = bookings.find(b => b.id === bookingId);
    if (booking) {
      alert(`Edit booking: ${booking.hotelName}\n\nThis would open an edit form in a real application.`);
    }
  };

  const handleShareBooking = (booking) => {
    const shareText = `Check out my booking at ${booking.hotelName} from ${new Date(booking.checkIn).toLocaleDateString()} to ${new Date(booking.checkOut).toLocaleDateString()}`;
    
    if (navigator.share) {
      navigator.share({
        title: `My Booking at ${booking.hotelName}`,
        text: shareText,
        url: window.location.href,
      }).catch(err => {
        console.log('Error sharing:', err);
        fallbackShare(shareText);
      });
    } else {
      fallbackShare(shareText);
    }
  };

  const fallbackShare = (text) => {
    navigator.clipboard.writeText(text).then(() => {
      alert('Booking details copied to clipboard!');
    }).catch(err => {
      // Fallback if clipboard fails
      const textArea = document.createElement('textarea');
      textArea.value = text;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      alert('Booking details copied to clipboard!');
    });
  };

  const downloadBookingAsPDF = (booking) => {
    // Simple PDF download simulation
    const pdfContent = `
      Booking Confirmation
      ===================
      
      Hotel: ${booking.hotelName}
      Room: ${booking.roomType}
      Booking ID: ${booking.id}
      Check-in: ${new Date(booking.checkIn).toLocaleDateString()}
      Check-out: ${new Date(booking.checkOut).toLocaleDateString()}
      Nights: ${calculateNights(booking.checkIn, booking.checkOut)}
      Guests: ${booking.guests}
      Total: $${booking.totalAmount}
      Status: ${getStatusText(booking.status)}
    `;
    
    const blob = new Blob([pdfContent], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `booking-${booking.id}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    alert('Booking details downloaded!');
  };

  const printBooking = (booking) => {
    const printContent = `
      <div style="padding: 20px; font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #2563eb; border-bottom: 2px solid #2563eb; padding-bottom: 10px;">Booking Confirmation</h1>
        
        <div style="margin: 20px 0;">
          <h2 style="color: #1f2937; margin-bottom: 5px;">${booking.hotelName}</h2>
          <p style="color: #6b7280; margin: 5px 0;">${booking.roomAddress}</p>
          <p style="color: #374151; background: #f3f4f6; padding: 5px 10px; border-radius: 5px; display: inline-block;">${booking.roomType}</p>
        </div>
        
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px; margin: 20px 0;">
          <div>
            <strong>Booking ID:</strong><br>${booking.id}
          </div>
          <div>
            <strong>Status:</strong><br>${getStatusText(booking.status)}
          </div>
          <div>
            <strong>Check-in:</strong><br>${new Date(booking.checkIn).toLocaleDateString()}
          </div>
          <div>
            <strong>Check-out:</strong><br>${new Date(booking.checkOut).toLocaleDateString()}
          </div>
          <div>
            <strong>Nights:</strong><br>${calculateNights(booking.checkIn, booking.checkOut)}
          </div>
          <div>
            <strong>Guests & Rooms:</strong><br>${booking.guests} guest(s), ${booking.rooms} room(s)
          </div>
        </div>
        
        <div style="border-top: 2px solid #e5e7eb; padding-top: 15px; margin-top: 20px;">
          <div style="text-align: right; font-size: 1.2em;">
            <strong>Total Amount: $${booking.totalAmount}</strong>
          </div>
        </div>
        
        <div style="margin-top: 30px; padding-top: 15px; border-top: 1px dashed #d1d5db; color: #6b7280; font-size: 0.9em;">
          <p>Thank you for your booking!</p>
          <p>Printed on: ${new Date().toLocaleDateString()}</p>
        </div>
      </div>
    `;
    
    const printWindow = window.open('', '_blank');
    printWindow.document.write(`
      <html>
        <head>
          <title>Booking Confirmation - ${booking.id}</title>
          <style>
            @media print {
              body { margin: 0; }
            }
          </style>
        </head>
        <body>${printContent}</body>
      </html>
    `);
    printWindow.document.close();
    printWindow.focus();
    setTimeout(() => {
      printWindow.print();
      printWindow.close();
    }, 250);
  };

  const isUpcomingBooking = (checkIn) => {
    return new Date(checkIn) > new Date();
  };

  const canModifyBooking = (booking) => {
    return (booking.status === 'confirmed' || booking.status === 'pending') && 
           isUpcomingBooking(booking.checkIn);
  };

  // Calculate statistics
  const totalSpent = bookings.reduce((sum, booking) => {
    const amount = parseFloat(booking.totalAmount) || 0;
    return sum + amount;
  }, 0);

  const upcomingBookings = bookings.filter(booking => 
    booking.status === 'confirmed' && isUpcomingBooking(booking.checkIn)
  );

  // Add sample data if no bookings exist (for testing)
  const addSampleBookings = () => {
    const sampleBookings = [
      {
        id: 'BK-' + Date.now(),
        hotelName: 'Grand Plaza Hotel',
        hotelImage: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80',
        roomType: 'Deluxe Suite',
        roomAddress: '123 Main Street, City Center',
        roomRating: '4.5',
        checkIn: new Date(Date.now() + 86400000 * 7).toISOString().split('T')[0],
        checkOut: new Date(Date.now() + 86400000 * 9).toISOString().split('T')[0],
        guests: 2,
        rooms: 1,
        totalAmount: '450.00',
        status: 'confirmed',
        bookingDate: new Date().toISOString(),
        specialRequests: 'Early check-in requested'
      },
      {
        id: 'BK-' + (Date.now() + 1),
        hotelName: 'Seaside Resort',
        hotelImage: 'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80',
        roomType: 'Ocean View Room',
        roomAddress: '456 Beach Boulevard, Coastal Area',
        roomRating: '4.8',
        checkIn: new Date(Date.now() - 86400000 * 5).toISOString().split('T')[0],
        checkOut: new Date(Date.now() - 86400000 * 3).toISOString().split('T')[0],
        guests: 4,
        rooms: 2,
        totalAmount: '720.00',
        status: 'completed',
        bookingDate: new Date(Date.now() - 86400000 * 10).toISOString()
      }
    ];

    const existingBookings = JSON.parse(localStorage.getItem('userBookings')) || [];
    const updatedBookings = [...existingBookings, ...sampleBookings];
    localStorage.setItem('userBookings', JSON.stringify(updatedBookings));
    loadBookings();
    alert('Sample bookings added! You can now test the booking page.');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading your bookings...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4 sm:p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8 text-center sm:text-left">
          <h1 className="text-3xl font-bold text-gray-900">My Hotel Bookings</h1>
          <p className="text-gray-600 mt-2">Manage and view all your hotel reservations</p>
        </div>

        {/* Error Display */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-6">
            <div className="flex items-center">
              <FaExclamationTriangle className="text-red-400 mr-3" />
              <p className="text-red-700">{error}</p>
            </div>
          </div>
        )}

        {/* Debug Section - Remove in production */}
        {bookings.length === 0 && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-6 mb-6 text-center">
            <FaExclamationTriangle className="text-yellow-500 text-2xl mx-auto mb-3" />
            <h3 className="text-lg font-semibold text-yellow-800 mb-2">No Bookings Found</h3>
            <p className="text-yellow-700 mb-4">It looks like you don't have any bookings yet.</p>
            <button
              onClick={addSampleBookings}
              className="bg-yellow-500 hover:bg-yellow-600 text-white px-6 py-2 rounded-lg font-semibold transition-colors duration-200"
            >
              Add Sample Bookings (for testing)
            </button>
          </div>
        )}

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow duration-200">
            <h3 className="text-lg font-semibold text-gray-700">Total Bookings</h3>
            <p className="text-3xl font-bold text-blue-600 mt-2">{bookings.length}</p>
            <p className="text-xs text-gray-500 mt-1">All time bookings</p>
          </div>
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow duration-200">
            <h3 className="text-lg font-semibold text-gray-700">Upcoming</h3>
            <p className="text-3xl font-bold text-green-600 mt-2">
              {upcomingBookings.length}
            </p>
            <p className="text-xs text-gray-500 mt-1">Future stays</p>
          </div>
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow duration-200">
            <h3 className="text-lg font-semibold text-gray-700">Pending</h3>
            <p className="text-3xl font-bold text-yellow-600 mt-2">
              {bookings.filter(b => b.status === 'pending').length}
            </p>
            <p className="text-xs text-gray-500 mt-1">Awaiting confirmation</p>
          </div>
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow duration-200">
            <h3 className="text-lg font-semibold text-gray-700">Total Spent</h3>
            <p className="text-3xl font-bold text-purple-600 mt-2">
              ${totalSpent.toFixed(2)}
            </p>
            <p className="text-xs text-gray-500 mt-1">Lifetime value</p>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-6">
          <div className="flex flex-col lg:flex-row gap-4 justify-between items-start lg:items-center">
            {/* Search */}
            <div className="relative flex-1 w-full">
              <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Search by hotel name, booking ID, or room type..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* Sort and Filters */}
            <div className="flex flex-col sm:flex-row gap-3 w-full lg:w-auto">
              <div className="relative">
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="appearance-none bg-white border border-gray-300 rounded-xl pl-4 pr-10 py-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent w-full"
                >
                  <option value="newest">Newest First</option>
                  <option value="oldest">Oldest First</option>
                  <option value="price-high">Price: High to Low</option>
                  <option value="price-low">Price: Low to High</option>
                  <option value="checkin-early">Check-in: Earliest</option>
                  <option value="checkin-late">Check-in: Latest</option>
                </select>
                <FaFilter className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4 pointer-events-none" />
              </div>

              <div className="flex flex-wrap gap-2">
                {['all', 'confirmed', 'pending', 'completed', 'cancelled'].map((status) => (
                  <button
                    key={status}
                    onClick={() => setFilter(status)}
                    className={`px-4 py-3 rounded-xl text-sm font-medium transition duration-200 flex items-center gap-2 ${
                      filter === status
                        ? 'bg-blue-600 text-white shadow-lg'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {getStatusIcon(status)}
                    {status === 'all' ? 'All' : getStatusText(status)}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Bookings List */}
        <div className="space-y-4 sm:space-y-6">
          {filteredBookings.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-xl shadow-sm border border-gray-100">
              <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <FaCalendarAlt className="w-12 h-12 text-gray-400" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                {bookings.length === 0 ? 'No bookings found' : 'No matching bookings'}
              </h3>
              <p className="text-gray-500 mb-6 max-w-md mx-auto">
                {bookings.length === 0 
                  ? "You haven't made any bookings yet. Start exploring our amazing hotels!"
                  : "Try adjusting your search criteria or filters to find what you're looking for."
                }
              </p>
              {bookings.length === 0 && (
                <button 
                  onClick={() => window.location.href = '/rooms'}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl font-semibold transition-colors duration-200"
                >
                  Browse Hotels
                </button>
              )}
            </div>
          ) : (
            filteredBookings.map((booking) => {
              const nights = calculateNights(booking.checkIn, booking.checkOut);
              const guests = booking.guests || 1;
              const rooms = booking.rooms || 1;
              const canModify = canModifyBooking(booking);
              
              return (
                <div key={booking.id} className="bg-white rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-all duration-200 overflow-hidden">
                  <div className="p-4 sm:p-6">
                    <div className="flex flex-col lg:flex-row gap-4 sm:gap-6">
                      {/* Hotel Image */}
                      <div className="flex-shrink-0">
                        <div className="relative">
                          <img
                            src={booking.hotelImage}
                            alt={booking.hotelName}
                            className="w-full sm:w-48 h-32 object-cover rounded-lg shadow-md"
                            onError={(e) => {
                              e.target.src = 'https://images.unsplash.com/photo-1566073771259-6a8506099945?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80';
                            }}
                          />
                          {booking.roomRating && (
                            <div className="absolute top-2 left-2 bg-black bg-opacity-70 text-white px-2 py-1 rounded-full text-xs flex items-center gap-1">
                              <FaStar className="w-3 h-3 text-yellow-400" />
                              {booking.roomRating}
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Booking Details */}
                      <div className="flex-1 min-w-0">
                        <div className="flex flex-col md:flex-row md:justify-between md:items-start mb-4">
                          <div className="flex-1 min-w-0">
                            <h3 className="text-xl font-semibold text-gray-900 mb-1 truncate">
                              {booking.hotelName}
                            </h3>
                            <p className="text-gray-600 mb-2 text-sm">Booking ID: {booking.id}</p>
                            <div className="flex items-center gap-2 text-sm text-gray-500 mb-2">
                              <FaMapMarkerAlt className="w-3 h-3 flex-shrink-0" />
                              <span className="truncate">{booking.roomAddress}</span>
                            </div>
                            <span className="inline-block bg-blue-50 text-blue-700 px-2 py-1 rounded-md text-xs font-medium">
                              {booking.roomType}
                            </span>
                          </div>
                          <div className="flex items-center space-x-2 mt-2 md:mt-0">
                            {getStatusIcon(booking.status)}
                            <span className={`px-3 py-1 rounded-full text-sm font-semibold border ${getStatusColor(booking.status)}`}>
                              {getStatusText(booking.status)}
                            </span>
                          </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-4">
                          <div className="flex items-center space-x-2">
                            <FaCalendarAlt className="w-4 h-4 text-gray-400 flex-shrink-0" />
                            <div>
                              <p className="text-sm text-gray-600">Check-in</p>
                              <p className="font-semibold text-sm">
                                {new Date(booking.checkIn).toLocaleDateString()}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center space-x-2">
                            <FaCalendarAlt className="w-4 h-4 text-gray-400 flex-shrink-0" />
                            <div>
                              <p className="text-sm text-gray-600">Check-out</p>
                              <p className="font-semibold text-sm">
                                {new Date(booking.checkOut).toLocaleDateString()}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center space-x-2">
                            <FaUser className="w-4 h-4 text-gray-400 flex-shrink-0" />
                            <div>
                              <p className="text-sm text-gray-600">Guests & Rooms</p>
                              <p className="font-semibold text-sm">
                                {guests} guest{guests > 1 ? 's' : ''}, {rooms} room{rooms > 1 ? 's' : ''}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center space-x-2">
                            <FaMoneyBillWave className="w-4 h-4 text-gray-400 flex-shrink-0" />
                            <div>
                              <p className="text-sm text-gray-600">Total Amount</p>
                              <p className="font-semibold text-green-600 text-sm">
                                ${parseFloat(booking.totalAmount).toFixed(2)}
                              </p>
                            </div>
                          </div>
                        </div>

                        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                          <p className="text-sm text-gray-500">
                            {nights} night{nights !== 1 ? 's' : ''} • 
                            Booked on {new Date(booking.bookingDate).toLocaleDateString()}
                          </p>
                          
                          <div className="flex flex-wrap gap-2">
                            <button 
                              onClick={() => handleViewDetails(booking)}
                              className="text-blue-600 hover:text-blue-800 font-medium text-sm transition duration-200 flex items-center gap-1 px-3 py-2 bg-blue-50 hover:bg-blue-100 rounded-lg"
                            >
                              <FaEye className="w-3 h-3" />
                              Details
                            </button>
                            
                            {canModify && (
                              <button 
                                onClick={() => handleEditBooking(booking.id)}
                                className="text-green-600 hover:text-green-800 font-medium text-sm transition duration-200 flex items-center gap-1 px-3 py-2 bg-green-50 hover:bg-green-100 rounded-lg"
                              >
                                <FaEdit className="w-3 h-3" />
                                Modify
                              </button>
                            )}
                            
                            <button 
                              onClick={() => handleShareBooking(booking)}
                              className="text-purple-600 hover:text-purple-800 font-medium text-sm transition duration-200 flex items-center gap-1 px-3 py-2 bg-purple-50 hover:bg-purple-100 rounded-lg"
                            >
                              <FaShare className="w-3 h-3" />
                              Share
                            </button>

                            <button 
                              onClick={() => downloadBookingAsPDF(booking)}
                              className="text-gray-600 hover:text-gray-800 font-medium text-sm transition duration-200 flex items-center gap-1 px-3 py-2 bg-gray-50 hover:bg-gray-100 rounded-lg"
                            >
                              <FaDownload className="w-3 h-3" />
                              PDF
                            </button>

                            <button 
                              onClick={() => printBooking(booking)}
                              className="text-gray-600 hover:text-gray-800 font-medium text-sm transition duration-200 flex items-center gap-1 px-3 py-2 bg-gray-50 hover:bg-gray-100 rounded-lg"
                            >
                              <FaPrint className="w-3 h-3" />
                              Print
                            </button>

                            {canModify && (
                              <button 
                                onClick={() => handleCancelBooking(booking.id)}
                                className="text-red-600 hover:text-red-800 font-medium text-sm transition duration-200 flex items-center gap-1 px-3 py-2 bg-red-50 hover:bg-red-100 rounded-lg"
                              >
                                <FaTimesCircle className="w-3 h-3" />
                                Cancel
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Booking Detail Modal */}
        {showDetailModal && selectedBooking && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <div className="flex justify-between items-start mb-6">
                  <h3 className="text-2xl font-bold text-gray-900">Booking Details</h3>
                  <button
                    onClick={() => setShowDetailModal(false)}
                    className="text-gray-400 hover:text-gray-600 text-2xl"
                  >
                    &times;
                  </button>
                </div>
                
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <h4 className="font-semibold text-gray-700">Hotel Information</h4>
                      <p className="text-lg font-bold text-gray-900">{selectedBooking.hotelName}</p>
                      <p className="text-gray-600">{selectedBooking.roomAddress}</p>
                      <p className="text-sm text-gray-500">{selectedBooking.roomType}</p>
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-700">Booking Information</h4>
                      <p className="text-gray-600">ID: {selectedBooking.id}</p>
                      <p className="text-gray-600">Status: <span className={`px-2 py-1 rounded-full text-xs ${getStatusColor(selectedBooking.status)}`}>{getStatusText(selectedBooking.status)}</span></p>
                      <p className="text-gray-600">Booked on: {new Date(selectedBooking.bookingDate).toLocaleDateString()}</p>
                    </div>
                  </div>

                  <div className="border-t pt-4">
                    <h4 className="font-semibold text-gray-700 mb-3">Stay Details</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm text-gray-600">Check-in</p>
                        <p className="font-semibold">{new Date(selectedBooking.checkIn).toLocaleDateString()}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Check-out</p>
                        <p className="font-semibold">{new Date(selectedBooking.checkOut).toLocaleDateString()}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Duration</p>
                        <p className="font-semibold">{calculateNights(selectedBooking.checkIn, selectedBooking.checkOut)} nights</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Guests & Rooms</p>
                        <p className="font-semibold">{selectedBooking.guests} guest(s), {selectedBooking.rooms} room(s)</p>
                      </div>
                    </div>
                  </div>

                  {selectedBooking.specialRequests && (
                    <div className="border-t pt-4">
                      <h4 className="font-semibold text-gray-700 mb-2">Special Requests</h4>
                      <p className="text-gray-600 bg-gray-50 p-3 rounded-lg">{selectedBooking.specialRequests}</p>
                    </div>
                  )}

                  <div className="border-t pt-4">
                    <h4 className="font-semibold text-gray-700 mb-3">Payment Details</h4>
                    <div className="flex justify-between items-center">
                      <span className="text-lg font-bold text-gray-900">Total Amount</span>
                      <span className="text-2xl font-bold text-green-600">${selectedBooking.totalAmount}</span>
                    </div>
                  </div>
                </div>

                <div className="flex gap-3 mt-6 pt-4 border-t">
                  <button
                    onClick={() => setShowDetailModal(false)}
                    className="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-800 py-3 px-4 rounded-xl font-semibold transition-colors duration-200"
                  >
                    Close
                  </button>
                  {canModifyBooking(selectedBooking) && (
                    <button
                      onClick={() => handleCancelBooking(selectedBooking.id)}
                      className="flex-1 bg-red-600 hover:bg-red-700 text-white py-3 px-4 rounded-xl font-semibold transition-colors duration-200"
                    >
                      Cancel Booking
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Booking;