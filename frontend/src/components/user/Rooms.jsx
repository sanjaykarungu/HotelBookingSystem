import { useNavigate } from 'react-router-dom'
import { useState, useEffect } from 'react'
import { feature } from '../../utils/userConstant'
import { BiSolidCartAdd } from "react-icons/bi"

const Rooms = () => {
  const navigate = useNavigate()
  const [hotels, setHotels] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  // Fetch hotels from API
  const fetchHotels = async () => {
    try {
      setLoading(true)
      setError(null)
      
      const response = await fetch('https://hotel-booking-sigma-wine.vercel.app/api/hotel/all')
      
      if (!response.ok) {
        throw new Error('Failed to fetch hotels')
      }
      
      const data = await response.json()
      
      // Handle API response
      if (data.data && Array.isArray(data.data)) {
        setHotels(data.data)
      } else if (Array.isArray(data)) {
        setHotels(data)
      } else {
        throw new Error('Invalid data format')
      }
      
    } catch (err) {
      console.error('Error fetching hotels:', err)
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchHotels()
  }, [])

  // Function to handle view details click
  const handleViewDetails = (hotel, e) => {
    e.stopPropagation()
    const hotelId = hotel._id || hotel.id
    navigate(`/rooms/${hotelId}`)
  }

  // Function to handle add to cart
  const handleAddToCart = (hotel, e) => {
    e.stopPropagation()
    
    const cartItem = {
      id: hotel._id || hotel.id,
      name: hotel.name,
      price: hotel.price,
      image: hotel.image_url,
      rating: hotel.rating,
      address: hotel.address,
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
    alert(`${hotel.name} added to cart successfully!`)
  }

  // Loading state
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
            <div className="flex justify-center">
              <div className="animate-pulse bg-blue-100 p-6 rounded-xl">
                <div className="text-blue-600 font-semibold">Loading hotels...</div>
              </div>
            </div>
          </div>
        </section>
      </div>
    )
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen bg-gray-50">
        <section className="px-5 py-10">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-12">
              <h1 className="font-bold text-gray-900 text-4xl md:text-5xl mb-6">
                {feature}
              </h1>
              <div className="w-24 h-1 bg-blue-600 rounded-full mx-auto mb-6"></div>
            </div>
            <div className="text-center py-8">
              <div className="bg-red-50 border border-red-200 rounded-xl p-6 max-w-md mx-auto">
                <div className="text-red-600 text-lg font-semibold mb-2">
                  Failed to Load Hotels
                </div>
                <p className="text-red-500 text-sm mb-4">
                  {error}
                </p>
                <button
                  onClick={fetchHotels}
                  className="bg-red-600 hover:bg-red-700 text-white px-6 py-2 rounded-lg text-sm font-semibold"
                >
                  Try Again
                </button>
              </div>
            </div>
          </div>
        </section>
      </div>
    )
  }

  // Empty state
  if (!hotels || hotels.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50">
        <section className="px-5 py-10">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-12">
              <h1 className="font-bold text-gray-900 text-4xl md:text-5xl mb-6">
                {feature}
              </h1>
              <div className="w-24 h-1 bg-blue-600 rounded-full mx-auto mb-6"></div>
            </div>
            <div className="text-center py-8">
              <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-6 max-w-md mx-auto">
                <div className="text-yellow-600 text-lg font-semibold mb-2">
                  No Hotels Found
                </div>
                <p className="text-yellow-500 text-sm mb-4">
                  No hotels available at the moment.
                </p>
                <button
                  onClick={fetchHotels}
                  className="bg-yellow-600 hover:bg-yellow-700 text-white px-6 py-2 rounded-lg text-sm font-semibold"
                >
                  Refresh
                </button>
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
          </div>

          {/* Results Count */}
          <div className="mb-6">
            <p className="text-gray-600">
              Showing <span className="font-semibold">{hotels.length}</span> properties
            </p>
          </div>

          {/* List View Content */}
          <div className="space-y-6">
            {hotels.map((hotel) => (
              <div 
                key={hotel._id || hotel.id} 
                className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden border border-gray-100 cursor-pointer"
              >
                <div className="flex flex-col md:flex-row h-auto md:h-80">
                  {/* Image Section */}
                  <div className="md:w-2/5 overflow-hidden bg-gray-200">
                    <img 
                      src={hotel.image_url} 
                      alt={hotel.name} 
                      className="w-full h-48 md:h-full object-cover hover:scale-105 transition-transform duration-300"
                      onError={(e) => {
                        e.target.src = "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=400"
                      }}
                    />
                  </div>
                  
                  {/* Content Section */}
                  <div className="md:w-3/5 p-6 flex flex-col">
                    <div className="flex justify-between items-start mb-4">
                      <div className="flex-1 pr-4">
                        <h3 className="font-bold text-gray-900 text-xl mb-2">{hotel.name}</h3>
                        <div className="flex items-center gap-2 text-gray-600 text-sm mb-2">
                          <span>📍</span>
                          <span>{hotel.address}</span>
                        </div>
                      </div>
                    
                      <div className="flex items-center gap-1 bg-green-50 px-3 py-1 rounded-full border border-green-100 flex-shrink-0">
                        <span className="text-green-600">⭐</span>
                        <span className="font-semibold text-green-700">{hotel.rating}</span>
                      </div>
                    </div>
                    
                    {hotel.description && (
                      <p className="text-gray-500 text-sm mb-4 line-clamp-2 flex-grow">
                        {hotel.description}
                      </p>
                    )}
                    
                    <div className="flex justify-between items-center mt-4 pt-4 border-t border-gray-100">
                      <div>
                        <span className="text-gray-500 text-sm block">Starting from</span>
                        <p className="font-bold text-gray-900 text-2xl">
                          ${hotel.price}
                          <span className="text-gray-500 text-lg font-normal">/night</span>
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <button 
                          onClick={(e) => handleAddToCart(hotel, e)}
                          className="bg-gray-200 hover:bg-gray-300 p-2 rounded-xl transition-colors duration-200 group"
                          title="Add to cart"
                        >
                          <BiSolidCartAdd className="w-5 h-5 text-gray-600 group-hover:text-gray-800" />
                        </button>
                        <button 
                          onClick={(e) => handleViewDetails(hotel, e)}
                          className="bg-gradient-to-r from-blue-600 to-blue-700 hover:bg-gray-800 hover:text-white text-white font-semibold px-4 py-2 rounded-xl text-sm transition-all duration-200"
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
        </div>
      </section>
    </div>
  )
}

export default Rooms