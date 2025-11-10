import React, { useState, useEffect } from "react";
import { feature } from "../../utils/userConstant";
import { Link } from "react-router-dom";

const Feature = () => {
  const [featuredProperties, setFeaturedProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Test backend connection
  useEffect(() => {
    const testBackendConnection = async () => {
      try {
        const testResponse = await fetch('https://hotelbookingsystem-backend-4c8d.onrender.com/');
        await testResponse.json();
      } catch (testError) {
        console.error("Backend connection test failed:", testError);
      }
    };
    
    testBackendConnection();
  }, []);

  // Fetch featured properties from API
  const fetchFeaturedProperties = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch('https://hotelbookingsystem-backend-4c8d.onrender.com/api/hotel/all', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        mode: 'cors'
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      
      // Handle different response formats
      if (data.data && Array.isArray(data.data)) {
        setFeaturedProperties(data.data);
      } else if (Array.isArray(data)) {
        setFeaturedProperties(data);
      } else if (data.properties && Array.isArray(data.properties)) {
        setFeaturedProperties(data.properties);
      } else if (data.hotels && Array.isArray(data.hotels)) {
        setFeaturedProperties(data.hotels);
      } else {
        throw new Error('Invalid data format from API.');
      }
      
    } catch (err) {
      setError('Failed to load properties: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFeaturedProperties();
  }, []);

  // Retry function
  const handleRetry = () => {
    fetchFeaturedProperties();
  };

  // Loading state
  if (loading) {
    return (
      <section className="px-5 py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h1 className="font-bold text-gray-900 text-4xl md:text-5xl mb-6">
              {feature}
            </h1>
            <div className="w-24 h-1 bg-blue-600 rounded-full mx-auto mb-6"></div>
          </div>
          <div className="flex justify-center">
            <div className="animate-pulse flex space-x-4">
              <div className="flex-1 space-y-6 py-1">
                <div className="space-y-3">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                    {[1, 2, 3, 4].map((item) => (
                      <div key={item} className="bg-white rounded-2xl shadow-lg p-6 h-80">
                        <div className="animate-pulse">
                          <div className="bg-gray-300 h-48 rounded-lg mb-4"></div>
                          <div className="bg-gray-300 h-4 rounded w-3/4 mb-2"></div>
                          <div className="bg-gray-300 h-4 rounded w-1/2 mb-4"></div>
                          <div className="bg-gray-300 h-6 rounded w-1/3"></div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    );
  }

  // Error state
  if (error) {
    return (
      <section className="px-5 py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center">
            <h1 className="font-bold text-gray-900 text-4xl md:text-5xl mb-6">
              {feature}
            </h1>
            <div className="w-24 h-1 bg-red-500 rounded-full mx-auto mb-6"></div>
            <div className="bg-red-50 border border-red-200 rounded-lg p-6 max-w-2xl mx-auto">
              <h3 className="text-red-800 font-semibold text-xl mb-3">Unable to Load Properties</h3>
              <div className="flex justify-center gap-4">
                <button 
                  onClick={handleRetry}
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Try Again
                </button>
                <button 
                  onClick={() => window.location.reload()} 
                  className="px-6 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
                >
                  Reload Page
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>
    );
  }

  // Empty state
  if (!featuredProperties || featuredProperties.length === 0) {
    return (
      <section className="px-5 py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center">
            <h1 className="font-bold text-gray-900 text-4xl md:text-5xl mb-6">
              {feature}
            </h1>
            <div className="w-24 h-1 bg-yellow-500 rounded-full mx-auto mb-6"></div>
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 max-w-2xl mx-auto">
              <h3 className="text-yellow-800 font-semibold text-xl mb-3">No Properties Found</h3>
              <button 
                onClick={handleRetry}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Check Again
              </button>
            </div>
          </div>
        </div>
      </section>
    );
  }

  // Get only first 4 items from the API data
  const displayProperties = featuredProperties.slice(0, 4);

  return (
    <section className="px-5 py-16 bg-gray-50">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h1 className="font-bold text-gray-900 text-4xl md:text-5xl mb-6">
            {feature}
          </h1>
          <div className="w-24 h-1 bg-blue-600 rounded-full mx-auto mb-6"></div>
          <p className="text-gray-600 text-lg md:text-xl max-w-3xl mx-auto leading-relaxed">
            Discover our handpicked selection of exceptional properties around the world, 
            offering unparalleled luxury and unforgettable experiences.
          </p>
        </div>
      
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {displayProperties.map((item, index) => (
            <div 
              key={item._id || item.id || index}
              className="group cursor-pointer"
            >
              <div className="bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 overflow-hidden border border-gray-100 h-full flex flex-col">
                {/* Image Section */}
                <div className="overflow-hidden flex-shrink-0">
                  <img
                    src={item.image_url || item.image || item.photo || "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=400"}
                    alt={item.name || "Hotel"}
                    className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-500"
                    onError={(e) => {
                      e.target.src = "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=400";
                    }}
                  />
                </div>
                
                {/* Content Section */}
                <div className="p-6 flex-grow flex flex-col">
                  {/* Name and Rating */}
                  <div className="flex justify-between items-start mb-3">
                    <h3 className="font-bold text-gray-900 text-xl leading-tight">
                      {item.name || "Unnamed Property"}
                    </h3>
                    <div className="flex items-center gap-1 bg-green-50 px-2 py-1 rounded-full border border-green-100">
                      <span className="text-green-600 text-sm">⭐</span>
                      <span className="font-semibold text-green-700 text-sm">
                        {item.rating || item.star_rating || "N/A"}
                      </span>
                    </div>
                  </div>
                  
                  {/* Address */}
                  <p className="text-gray-500 text-sm mb-4 line-clamp-2 flex-grow">
                    {item.address || item.location || "Address not available"}
                  </p>
                  
                  {/* Description (if available) */}
                  {(item.description || item.overview) && (
                    <p className="text-gray-400 text-xs mb-4 line-clamp-2">
                      {item.description || item.overview}
                    </p>
                  )}
                  
                  {/* Price and Button */}
                  <div className="flex justify-between items-center mt-auto">
                    <div>
                      <span className="text-gray-500 text-sm block">Starting from</span>
                      <p className="font-bold text-gray-900 text-2xl">
                        ${item.price || item.price_per_night || item.starting_price || 0}
                        <span className="text-gray-500 text-sm font-normal">/night</span>
                      </p>
                    </div>
                    <Link 
                      to={`/rooms/${item._id || item.id || index}`}
                      className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 hover:shadow-lg"
                    >
                      View Details
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
        
        {/* View All Button */}
        <div className="flex justify-center mt-16">
          <Link 
            to="/rooms"
            className="px-8 py-3.5 text-base font-semibold border-2 border-gray-300 rounded-xl bg-white hover:bg-gray-50 hover:border-gray-400 transition-all duration-200 shadow-sm hover:shadow-md text-gray-700 hover:text-gray-900"
          >
            View All Destinations
          </Link>
        </div>
      </div>
    </section>
  );
};

export default Feature;
