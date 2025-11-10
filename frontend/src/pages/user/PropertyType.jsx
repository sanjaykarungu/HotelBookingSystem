import React from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { BiSolidCartAdd } from "react-icons/bi";
import { useState, useEffect } from 'react';

const PropertyType = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [property, setProperty] = useState(null);
  const [propertyHotels, setPropertyHotels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch property data from your backend API
  useEffect(() => {
    const fetchProperty = async () => {
      try {
        setLoading(true);
        const response = await fetch(`https://hotel-booking-sigma-wine.vercel.app/api/property/${id}`);
        
        if (!response.ok) {
          throw new Error('Failed to fetch property data');
        }
        
        const data = await response.json();
        const propertyData = data.data || data;
        setProperty(propertyData);

        // Get hotels for the property type
        const getPropertyHotels = () => {
          if (!propertyData) return [];
          
          const propertyType = propertyData.type?.toLowerCase().replace(' ', '_');
          const possibleKeys = [
            propertyType,
            'hotels',
            'properties',
            'accommodations',
            'rooms'
          ];

          for (const key of possibleKeys) {
            if (propertyData[key] && Array.isArray(propertyData[key])) {
              return propertyData[key];
            }
          }
          return [];
        };

        const hotels = getPropertyHotels();
        setPropertyHotels(hotels);
        setError(null);
      } catch (err) {
        setError(err.message);
        console.error('Error fetching property:', err);
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchProperty();
    }
  }, [id]);

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center p-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-4">Loading...</h1>
          <p className="text-gray-600 text-lg">Fetching property details...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center p-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-4">Error Loading Property</h1>
          <p className="text-red-500 text-lg mb-6">{error}</p>
          <button 
            onClick={() => navigate('/')}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors duration-200"
          >
            Back to Home
          </button>
        </div>
      </div>
    );
  }

  if (!property) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center p-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-4">Property Not Found</h1>
          <p className="text-gray-600 text-lg mb-6">The property you're looking for doesn't exist.</p>
          <button 
            onClick={() => navigate('/')}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors duration-200"
          >
            Back to Home
          </button>
        </div>
      </div>
    );
  }

  // Function to handle hotel click
  const handleHotelClick = (hotel, e) => {
    e.stopPropagation();
    navigate(`/property/${id}/hotels/${hotel.id || hotel._id}`);
  }

  const handleAddToCart = (hotel, e) => {
    e.stopPropagation();
    
    // Create cart item
    const cartItem = {
      id: hotel.id || hotel._id,
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

  // Calculate average rating and price range
  const stats = propertyHotels.length > 0 ? {
    averageRating: (propertyHotels.reduce((acc, hotel) => acc + (hotel.rating || 0), 0) / propertyHotels.length).toFixed(1),
    minPrice: Math.min(...propertyHotels.map(hotel => hotel.price || 0)),
    maxPrice: Math.max(...propertyHotels.map(hotel => hotel.price || 0))
  } : null;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-5 py-10">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="font-bold text-gray-900 text-4xl md:text-5xl mb-6">
            Explore Incredible Properties
          </h1>
          <p className="text-gray-600 text-lg md:text-xl max-w-3xl mx-auto leading-relaxed">
            Discover the beauty and hospitality of {property.type} through our curated selection of premium accommodations.
          </p>
        </div>
        
        {/* Property Info */}
        <div className="bg-white rounded-3xl shadow-xl overflow-hidden mb-16 border border-gray-200">
          <div className="relative h-96 md:h-[500px]">
            <img
              src={property.image_url || "https://via.placeholder.com/800x500?text=Property+Image"}
              alt={property.type}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent"></div>
            <div className="absolute bottom-0 left-0 right-0 p-8 text-white">
              <h1 className="font-bold text-4xl md:text-5xl mb-4">
                {property.name}
              </h1>
              <p className="text-lg md:text-xl opacity-90 max-w-4xl">
                {property.description}
              </p>
              {property.location && (
                <p className="text-lg opacity-80 mt-2">{property.location}</p>
              )}
            </div>
          </div>
        </div>

        {/* Stats Section */}
        {stats && propertyHotels.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
            <div className="bg-white rounded-2xl p-6 text-center shadow-lg border border-gray-100">
              <div className="text-3xl font-bold text-blue-600 mb-2">{propertyHotels.length}</div>
              <div className="text-gray-600 font-semibold">Properties Available</div>
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

        {/* Hotels/Properties Section - List View */}
        {propertyHotels.length > 0 ? (
          <div className="mb-16">
            <div className="text-center mb-12">
              <h2 className="font-bold text-gray-900 text-3xl md:text-4xl mb-4">
                Premium {property.type}s
              </h2>
              <p className="text-gray-600 text-lg max-w-2xl mx-auto">
                Handpicked accommodations offering exceptional comfort and authentic experiences
              </p>
            </div>
            
            {/* List View Container */}
            <div className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden">
              {propertyHotels.map((hotel, index) => (
                <div 
                  key={hotel.id || hotel._id} 
                  className={`border-b border-gray-200 last:border-b-0 hover:bg-gray-50 transition-all duration-200 ${
                    index % 2 === 0 ? 'bg-white' : 'bg-gray-50'
                  }`}
                >
                  <div className="p-6">
                    <div className="flex flex-col lg:flex-row gap-6">
                      {/* Hotel Image */}
                      <div className="lg:w-1/4">
                        <div className="relative rounded-xl overflow-hidden">
                          <img
                            src={hotel.image_url || "https://via.placeholder.com/300x200?text=No+Image"}
                            alt={hotel.name}
                            className="w-full h-48 lg:h-40 object-cover hover:scale-105 transition-transform duration-500 cursor-pointer"
                            onClick={(e) => handleHotelClick(hotel, e)}
                          />
                          <div className="absolute top-3 right-3 flex items-center gap-1 bg-black/80 text-white px-2 py-1 rounded-full">
                            <span className="font-semibold text-sm">{hotel.rating || 'N/A'}</span>
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
                              {hotel.name}
                            </h3>
                            <button 
                              onClick={(e) => handleAddToCart(hotel, e)}
                              className="flex items-center gap-2 text-blue-600 hover:text-blue-700 transition-colors duration-200 p-2 rounded-lg hover:bg-blue-50 ml-4"
                            >
                              <BiSolidCartAdd className="w-5 h-5" />
                              <span className="text-sm font-medium hidden sm:inline">Add to Cart</span>
                            </button>
                          </div>
                          
                          <p className="text-gray-600 text-sm mb-3 leading-relaxed line-clamp-2">
                            {hotel.description}
                          </p>
                          
                          <div className="flex items-center gap-2 text-gray-500 text-sm mb-3">
                            <span className="text-red-500">📍</span>
                            <span className="line-clamp-1">{hotel.address}</span>
                          </div>

                          {/* Features - Dynamic based on property type */}
                          <div className="flex flex-wrap gap-2 mb-4">
                            {property.type?.toLowerCase().includes('luxury') && (
                              <>
                                <span className="bg-green-100 text-green-800 text-xs px-3 py-1 rounded-full font-medium">
                                  Free WiFi
                                </span>
                                <span className="bg-blue-100 text-blue-800 text-xs px-3 py-1 rounded-full font-medium">
                                  Swimming Pool
                                </span>
                                <span className="bg-purple-100 text-purple-800 text-xs px-3 py-1 rounded-full font-medium">
                                  Spa
                                </span>
                                <span className="bg-orange-100 text-orange-800 text-xs px-3 py-1 rounded-full font-medium">
                                  Fine Dining
                                </span>
                              </>
                            )}
                            {property.type?.toLowerCase().includes('beach') && (
                              <>
                                <span className="bg-green-100 text-green-800 text-xs px-3 py-1 rounded-full font-medium">
                                  Beach Access
                                </span>
                                <span className="bg-blue-100 text-blue-800 text-xs px-3 py-1 rounded-full font-medium">
                                  Ocean View
                                </span>
                                <span className="bg-purple-100 text-purple-800 text-xs px-3 py-1 rounded-full font-medium">
                                  Water Sports
                                </span>
                              </>
                            )}
                            {property.type?.toLowerCase().includes('mountain') && (
                              <>
                                <span className="bg-green-100 text-green-800 text-xs px-3 py-1 rounded-full font-medium">
                                  Mountain View
                                </span>
                                <span className="bg-blue-100 text-blue-800 text-xs px-3 py-1 rounded-full font-medium">
                                  Hiking Trails
                                </span>
                                <span className="bg-purple-100 text-purple-800 text-xs px-3 py-1 rounded-full font-medium">
                                  Fireplace
                                </span>
                              </>
                            )}
                            {property.type?.toLowerCase().includes('boutique') && (
                              <>
                                <span className="bg-green-100 text-green-800 text-xs px-3 py-1 rounded-full font-medium">
                                  Unique Design
                                </span>
                                <span className="bg-blue-100 text-blue-800 text-xs px-3 py-1 rounded-full font-medium">
                                  Personalized Service
                                </span>
                                <span className="bg-purple-100 text-purple-800 text-xs px-3 py-1 rounded-full font-medium">
                                  Local Art
                                </span>
                              </>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Price and Action */}
                      <div className="lg:w-1/4 flex flex-col justify-between items-start lg:items-end">
                        <div className="text-right mb-4 lg:mb-0">
                          <span className="text-gray-500 text-sm block mb-1">Starting from</span>
                          <span className="text-2xl font-bold text-blue-700">
                            ₹{(hotel.price || 0).toLocaleString()}
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
                            className="lg:hidden border border-blue-600 text-blue-600 hover:bg-blue-600 hover:text-white px-6 py-3 rounded-xl font-semibold transition-all duration-200 text-sm w-full text-center flex items-center justify-center gap-2"
                          >
                            <BiSolidCartAdd className="w-4 h-4" />
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
              Properties Coming Soon
            </h3>
            <p className="text-gray-600 text-lg max-w-md mx-auto mb-6">
              We're working on bringing you the best accommodations. Check back soon for amazing options!
            </p>
            <button 
              onClick={() => navigate('/')}
              className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-xl font-semibold transition-colors duration-200"
            >
              Explore Other Properties
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
            Back to All Properties
          </button>
        </div>
      </div>
    </div>
  )
}

export default PropertyType;