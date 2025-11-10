import React, { useState, useEffect } from 'react'
import Navbar from '../../components/admin/Navbar';

const Order = () => {
  const [orders, setOrders] = useState([]);
  const [filter, setFilter] = useState('all');

  // Load orders from localStorage on component mount
  useEffect(() => {
    const loadOrders = () => {
      try {
        const savedBookings = JSON.parse(localStorage.getItem('userBookings')) || [];
        console.log('Raw bookings from localStorage:', savedBookings); // Debug log
        
        // Transform the booking data to match the order structure
        const transformedOrders = savedBookings.map(booking => {
          // Handle both old and new booking formats
          const hotelName = booking.hotelName || 
                           (booking.items && booking.items[0]?.name) || 
                           'Unknown Hotel';
          
          const totalAmount = booking.totalAmount || 
                            booking.total || 
                            booking.amount || 
                            0;

          const hotelImage = booking.hotelImage || 
                           (booking.items && booking.items[0]?.image) || 
                           'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=400';

          const roomAddress = booking.roomAddress || 
                            (booking.items && booking.items[0]?.address) || 
                            'Address not available';

          const roomRating = booking.roomRating || 
                           (booking.items && booking.items[0]?.rating) || 
                           4.0;

          const guests = booking.guests || 1;
          const rooms = booking.rooms || (booking.items ? booking.items.length : 1);

          return {
            id: booking.id || Date.now(),
            customerName: booking.guestName || 'Guest User',
            hotelName: hotelName,
            checkIn: booking.checkIn || new Date().toISOString().split('T')[0],
            checkOut: booking.checkOut || new Date(Date.now() + 86400000).toISOString().split('T')[0],
            guests: guests,
            rooms: rooms,
            amount: parseFloat(totalAmount) || 0,
            status: booking.status || 'confirmed',
            hotelImage: hotelImage,
            bookingDate: booking.date || booking.bookingDate || new Date().toISOString(),
            roomAddress: roomAddress,
            roomRating: roomRating
          };
        });
        
        console.log('Transformed orders:', transformedOrders); // Debug log
        setOrders(transformedOrders);
      } catch (error) {
        console.error('Error loading orders:', error);
        setOrders([]);
      }
    };

    loadOrders();

    // Listen for storage events to update when new bookings are added from other tabs
    const handleStorageChange = (e) => {
      if (e.key === 'userBookings') {
        loadOrders();
      }
    };

    window.addEventListener('storage', handleStorageChange);
    
    // Cleanup
    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);

  const filteredOrders = filter === 'all' 
    ? orders 
    : orders.filter(order => order.status === filter);

  const getStatusColor = (status) => {
    switch (status) {
      case 'confirmed': return 'bg-blue-100 text-blue-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'completed': return 'bg-green-100 text-green-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'confirmed': return 'Confirmed';
      case 'pending': return 'Pending';
      case 'completed': return 'Completed';
      case 'cancelled': return 'Cancelled';
      default: return status;
    }
  };

  const handleStatusUpdate = (orderId, newStatus) => {
    const updatedOrders = orders.map(order => 
      order.id === orderId ? { ...order, status: newStatus } : order
    );
    setOrders(updatedOrders);
    
    // Update localStorage as well
    try {
      const savedBookings = JSON.parse(localStorage.getItem('userBookings')) || [];
      const updatedBookings = savedBookings.map(booking => 
        booking.id === orderId ? { ...booking, status: newStatus } : booking
      );
      localStorage.setItem('userBookings', JSON.stringify(updatedBookings));
    } catch (error) {
      console.error('Error updating booking status:', error);
    }
  };

  // Calculate total revenue correctly
  const calculateTotalRevenue = () => {
    return orders.reduce((sum, order) => sum + (order.amount || 0), 0);
  };

  // Calculate total bookings by status
  const getBookingsCountByStatus = (status) => {
    return orders.filter(order => order.status === status).length;
  };

  return (
    <div>
      <Navbar/>
      <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Orders</h1>
          <p className="text-gray-600 mt-2">Manage and track all your hotel bookings</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-700">Total Bookings</h3>
            <p className="text-3xl font-bold text-blue-600 mt-2">{orders.length}</p>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-700">Confirmed</h3>
            <p className="text-3xl font-bold text-green-600 mt-2">
              {getBookingsCountByStatus('confirmed')}
            </p>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-700">Completed</h3>
            <p className="text-3xl font-bold text-purple-600 mt-2">
              {getBookingsCountByStatus('completed')}
            </p>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-700">Total Revenue</h3>
            <p className="text-3xl font-bold text-indigo-600 mt-2">
              ${calculateTotalRevenue().toFixed(2)}
            </p>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <div className="flex flex-wrap gap-4 items-center">
            <span className="text-sm font-medium text-gray-700">Filter by status:</span>
            {['all', 'confirmed', 'completed', 'cancelled'].map((status) => (
              <button
                key={status}
                onClick={() => setFilter(status)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition duration-200 ${
                  filter === status
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                {status === 'all' ? 'All Bookings' : getStatusText(status)}
              </button>
            ))}
          </div>
        </div>

        {/* Orders Table */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Booking ID
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Hotel Details
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Dates
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Guests & Rooms
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Amount
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredOrders.map((order) => (
                  <tr key={order.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">#{order.id}</div>
                      <div className="text-sm text-gray-500">
                        {new Date(order.bookingDate).toLocaleDateString()}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        <img 
                          src={order.hotelImage} 
                          alt={order.hotelName}
                          className="w-12 h-12 rounded-lg object-cover mr-3"
                          onError={(e) => {
                            e.target.src = 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=400';
                          }}
                        />
                        <div>
                          <div className="text-sm font-medium text-gray-900">{order.hotelName}</div>
                          <div className="text-sm text-gray-500">{order.roomAddress}</div>
                          <div className="flex items-center mt-1">
                            <span className="text-yellow-500 text-sm">⭐</span>
                            <span className="text-sm text-gray-600 ml-1">{order.roomRating}</span>
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {new Date(order.checkIn).toLocaleDateString()} - {new Date(order.checkOut).toLocaleDateString()}
                      </div>
                      <div className="text-sm text-gray-500">
                        {Math.ceil((new Date(order.checkOut) - new Date(order.checkIn)) / (1000 * 60 * 60 * 24))} nights
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {order.guests} guest{order.guests > 1 ? 's' : ''}
                      </div>
                      <div className="text-sm text-gray-500">
                        {order.rooms} room{order.rooms > 1 ? 's' : ''}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-semibold text-gray-900">${order.amount.toFixed(2)}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(order.status)}`}>
                        {getStatusText(order.status)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-2">
                        {order.status === 'confirmed' && (
                          <>
                            <button 
                              onClick={() => handleStatusUpdate(order.id, 'completed')}
                              className="text-green-600 hover:text-green-900 px-2 py-1 rounded hover:bg-green-50"
                            >
                              Mark Complete
                            </button>
                            <button 
                              onClick={() => handleStatusUpdate(order.id, 'cancelled')}
                              className="text-red-600 hover:text-red-900 px-2 py-1 rounded hover:bg-red-50"
                            >
                              Cancel
                            </button>
                          </>
                        )}
                        {(order.status === 'completed' || order.status === 'cancelled') && (
                          <span className="text-gray-500 px-2 py-1">
                            {getStatusText(order.status)}
                          </span>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Empty State */}
          {filteredOrders.length === 0 && (
            <div className="text-center py-12">
              <div className="text-gray-400 text-6xl mb-4">🏨</div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                {orders.length === 0 ? "No bookings yet" : `No ${filter} bookings`}
              </h3>
              <p className="text-gray-500 mb-4">
                {orders.length === 0 
                  ? "You haven't made any bookings yet. Start exploring rooms to book your stay!" 
                  : `No bookings with status "${getStatusText(filter)}"`}
              </p>
              {orders.length === 0 && (
                <button 
                  onClick={() => window.location.href = '/'}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-md transition duration-200"
                >
                  Explore Rooms
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
    </div>
  );
}

export default Order;