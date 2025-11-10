import React, { useState, useEffect } from "react";
import { feature } from "../../utils/userConstant";
import { Link } from "react-router-dom";

const Feature = () => {
  const [featuredProperties, setFeaturedProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch featured properties from API
  const fetchFeaturedProperties = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch('https://hotelbookingsystem-backend-4c8d.onrender.com/api/hotel/all');      
      if (!response.ok) {
        throw new Error(`Failed to fetch properties`);
      }
      
      const data = await response.json();
      
      // Handle different response formats
      if (data.data && Array.isArray(data.data)) {
        setFeaturedProperties(data.data);
      } else if (Array.isArray(data)) {
        setFeaturedProperties(data);
      } else {
        throw new Error('Invalid data format from API');
      }
      
    } catch (err) {
      console.error('Error fetching featured properties:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFeaturedProperties();
  }, []);

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
            <p className="text-gray-600 text-lg md:text-xl max-w-3xl mx-auto leading-relaxed">
              Loading featured properties...
            </p>
          </div>
          <div className="flex justify-center">
            <div className="animate-pulse text-gray-500">Loading...</div>
          </div>
        </div>
      </section>
    );
  }

  // Error state
   if (error) {
    return (
      <section className="px-5 py-16 bg-gray-50 to-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center">
            <h1 className="font-bold text-gray-900 text-4xl md:text-5xl mb-6">
              {feature}
            </h1>
            <p className="text-red-500 text-lg">Error: {error}</p>
            <button 
              onClick={() => window.location.reload()} 
              className="mt-4 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Retry
            </button>
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
          {displayProperties.map((item) => (
            <div 
              key={item._id || item.id}
              className="group cursor-pointer"
            >
              <div className="bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 overflow-hidden border border-gray-100 h-full flex flex-col">
                {/* Image Section */}
                <div className="overflow-hidden flex-shrink-0">
                  <img
                    src={item.image_url}
                    alt={item.name}
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
                      {item.name}
                    </h3>
                    <div className="flex items-center gap-1 bg-green-50 px-2 py-1 rounded-full border border-green-100">
                      <span className="text-green-600 text-sm">⭐</span>
                      <span className="font-semibold text-green-700 text-sm">
                        {item.rating || "N/A"}
                      </span>
                    </div>
                  </div>
                  
                  {/* Address */}
                  <p className="text-gray-500 text-sm mb-4 line-clamp-2 flex-grow">
                    {item.address || "Address not available"}
                  </p>
                  
                  {/* Description (if available) */}
                  {item.description && (
                    <p className="text-gray-400 text-xs mb-4 line-clamp-2">
                      {item.description}
                    </p>
                  )}
                  
                  {/* Price and Button */}
                  <div className="flex justify-between items-center mt-auto">
                    <div>
                      <span className="text-gray-500 text-sm block">Starting from</span>
                      <p className="font-bold text-gray-900 text-2xl">
                        ${item.price || 0}
                        <span className="text-gray-500 text-sm font-normal">/night</span>
                      </p>
                    </div>
                    <Link 
                      to={`/rooms/${item._id || item.id}`}
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
