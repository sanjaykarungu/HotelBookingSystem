import React from "react";
import { useRef, useState, useEffect } from "react";
import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import { useNavigate } from "react-router-dom";

const Property = () => {
  const sliderRef = useRef(null);
  const navigate = useNavigate();
  const [propertiesData, setPropertiesData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch properties data from your backend API
  useEffect(() => {
    const fetchProperties = async () => {
      try {
        setLoading(true);
        const response = await fetch('https://hotelbookingsystem-backend-4c8d.onrender.com/api/property/all');
        
        if (!response.ok) {
          throw new Error('Failed to fetch properties data');
        }
        
        const data = await response.json();
        setPropertiesData(data.data || []);
      } catch (err) {
        setError(err.message);
        console.error('Error fetching properties:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchProperties();
  }, []);

  // Debug log to check data
  console.log('Property Data:', propertiesData);

  const handleProperty = (property) => {
    navigate(`/property/${property._id || property.id}`);
  }

  const settings = {
    dots: false,
    infinite: true,
    speed: 500,
    slidesToShow: 4,
    slidesToScroll: 1, // Changed to 1 for smoother scrolling
    adaptiveHeight: true,
    arrows: false, // Disable default arrows since we're using custom ones
    responsive: [
      {
        breakpoint: 1024,
        settings: {
          slidesToShow: 3,
          slidesToScroll: 1,
        },
      },
      {
        breakpoint: 768,
        settings: {
          slidesToShow: 2,
          slidesToScroll: 1,
        },
      },
      {
        breakpoint: 480,
        settings: {
          slidesToShow: 1,
          slidesToScroll: 1,
        },
      },
    ],
  };

  const nextSlide = () => {
    if (sliderRef.current) {
      sliderRef.current.slickNext();
    }
  };

  const prevSlide = () => {
    if (sliderRef.current) {
      sliderRef.current.slickPrev();
    }
  };

  // Loading state
  if (loading) {
    return (
      <section className="px-5 py-15 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center">
            <h1 className="font-bold text-gray-950 text-4xl md:text-5xl mb-4">
              Browse by property type
            </h1>
            <p className="text-gray-600 text-lg">Loading properties...</p>
          </div>
        </div>
      </section>
    );
  }

  // Error state
  if (error) {
    return (
      <section className="px-5 py-15 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center">
            <h1 className="font-bold text-gray-950 text-4xl md:text-5xl mb-4">
              Browse by property type
            </h1>
            <p className="text-red-500 text-lg mb-4">Error: {error}</p>
            <button 
              onClick={() => window.location.reload()} 
              className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
            >
              Try Again
            </button>
          </div>
        </div>
      </section>
    );
  }

  // Check if data is loaded
  if (!propertiesData || propertiesData.length === 0) {
    return (
      <section className="px-5 py-15 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center">
            <h1 className="font-bold text-gray-950 text-4xl md:text-5xl mb-4">
              Browse by property type
            </h1>
            <p className="text-gray-600 text-lg">No properties available at the moment.</p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="px-5 py-15 bg-gray-50">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-12">
          <div className="text-center md:text-left">
            <h1 className="font-bold text-gray-950 text-4xl md:text-5xl">
              Browse by property type
            </h1>
            <p className="text-gray-600 text-lg mt-3">
              Discover the perfect stay for your next adventure
            </p>
          </div>
          <div className="hidden md:flex gap-3">
            <button 
              onClick={prevSlide} 
              className="w-12 h-12 rounded-full bg-gray-200 hover:bg-gray-300 flex items-center justify-center transition-colors duration-200 border border-gray-300"
              aria-label="Previous slide"
            >
              <span className="text-2xl">←</span>
            </button>
            <button 
              onClick={nextSlide} 
              className="w-12 h-12 rounded-full bg-gray-200 hover:bg-gray-300 flex items-center justify-center transition-colors duration-200 border border-gray-300"
              aria-label="Next slide"
            >
              <span className="text-2xl">→</span>
            </button>
          </div>
        </div>

        <div className="slider-container relative">
          <Slider ref={sliderRef} {...settings}>
            {propertiesData.map((item) => (
              <div key={item._id || item.id} className="px-2 focus:outline-none">
                <div 
                  className="group cursor-pointer h-full" 
                  onClick={() => handleProperty(item)}
                  role="button"
                  tabIndex={0}
                  onKeyPress={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      handleProperty(item);
                    }
                  }}
                >
                  <div className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-2 h-full flex flex-col border border-gray-100">
                    <div className="overflow-hidden rounded-t-2xl flex-shrink-0">
                      <img
                        src={item.image_url || "https://via.placeholder.com/300x200?text=Property+Image"}
                        alt={item.type || "Property type"}
                        className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                        onError={(e) => {
                          e.target.src = "https://via.placeholder.com/300x200?text=Image+Not+Found";
                        }}
                      />
                    </div>
                    <div className="p-6 pb-5 text-center flex-grow flex flex-col justify-between">
                      <div>
                        <p className="font-bold text-gray-900 text-lg mb-2">
                          {item.type || "Property Type"}
                        </p>
                        {item.name && (
                          <p className="text-gray-600 text-sm mb-3 line-clamp-2">{item.name}</p>
                        )}
                        {item.description && (
                          <p className="text-gray-500 text-xs mb-4 line-clamp-3">{item.description}</p>
                        )}
                      </div>
                      {item.price_range && (
                        <div className="mt-auto">
                          <span className="inline-block bg-gray-100 text-gray-800 text-xs px-3 py-1 rounded-full">
                            {item.price_range}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </Slider>
        </div>

        {/* Mobile navigation buttons */}
        <div className="flex justify-center gap-3 mt-8 md:hidden">
          <button 
            onClick={prevSlide} 
            className="w-12 h-12 rounded-full bg-gray-200 hover:bg-gray-300 flex items-center justify-center transition-colors duration-200 border border-gray-300"
            aria-label="Previous slide"
          >
            <span className="text-2xl">←</span>
          </button>
          <button 
            onClick={nextSlide} 
            className="w-12 h-12 rounded-full bg-gray-200 hover:bg-gray-300 flex items-center justify-center transition-colors duration-200 border border-gray-300"
            aria-label="Next slide"
          >
            <span className="text-2xl">→</span>
          </button>
        </div>
      </div>
    </section>
  );
};

export default Property;
