import React from "react";
import { useRef, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";

const World = () => {
  const sliderRef = useRef(null);
  const navigate = useNavigate();
  const [countriesData, setCountriesData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Test backend connection first
  useEffect(() => {
    const testBackendConnection = async () => {
      try {
        const testResponse = await fetch('https://hotelbookingsystem-backend-4c8d.onrender.com/');
        
        if (!testResponse.ok) {
          throw new Error(`Backend test failed with status: ${testResponse.status}`);
        }
        
        await testResponse.json();
      } catch (testError) {
        console.error("Backend connection test failed:", testError);
      }
    };
    
    testBackendConnection();
  }, []);

  // Fetch countries data from your backend API
  useEffect(() => {
    const fetchCountries = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const response = await fetch('https://hotelbookingsystem-backend-4c8d.onrender.com/api/world/all', {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
          },
        });
        
        if (!response.ok) {
          const errorText = await response.text();
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        
        // Handle different response formats
        if (data.data && Array.isArray(data.data)) {
          setCountriesData(data.data);
        } else if (Array.isArray(data)) {
          setCountriesData(data);
        } else if (data.countries && Array.isArray(data.countries)) {
          setCountriesData(data.countries);
        } else if (data.world && Array.isArray(data.world)) {
          setCountriesData(data.world);
        } else {
          setCountriesData([]);
        }
        
      } catch (err) {
        setError('Failed to load countries: ' + err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchCountries();
  }, []);

  const handleCountry = (country) => {
    navigate(`/country/${country._id || country.id}`);
  }

  const settings = {
    dots: false,
    arrows: false,
    infinite: true,
    speed: 500,
    slidesToShow: 4,
    slidesToScroll: 1,
    adaptiveHeight: true,
    pauseOnHover: true,
    responsive: [
      {
        breakpoint: 1280,
        settings: {
          slidesToShow: 3,
          slidesToScroll: 1,
        },
      },
      {
        breakpoint: 1024,
        settings: {
          slidesToShow: 2,
          slidesToScroll: 1,
        },
      },
      {
        breakpoint: 768,
        settings: {
          slidesToShow: 1,
          slidesToScroll: 1,
        },
      },
    ],
  };

  const nextSlide = () => {
    sliderRef.current?.slickNext();
  };

  const prevSlide = () => {
    sliderRef.current?.slickPrev();
  };

  // Enhanced loading state with skeleton
  if (loading) {
    return (
      <section className="px-4 py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h1 className="font-bold text-gray-900 text-4xl md:text-5xl mb-6">
              Explore World
            </h1>
          </div>
          
          {/* Skeleton Loading */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map((item) => (
              <div key={item} className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
                <div className="animate-pulse bg-gray-300 h-48 md:h-56"></div>
                <div className="p-6 text-center">
                  <div className="animate-pulse bg-gray-300 h-6 rounded w-3/4 mx-auto mb-3"></div>
                  <div className="animate-pulse bg-gray-300 h-4 rounded w-full mb-2"></div>
                  <div className="animate-pulse bg-gray-300 h-4 rounded w-2/3 mx-auto"></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  // Enhanced error state
  if (error) {
    return (
      <section className="px-4 py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center">
            <h1 className="font-bold text-gray-900 text-4xl md:text-5xl mb-6">
              Explore World
            </h1>
            <div className="bg-red-50 border border-red-200 rounded-xl p-8 max-w-2xl mx-auto">
              <h3 className="text-red-800 text-xl font-bold mb-3">
                Failed to Load Destinations
              </h3>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <button 
                  onClick={() => window.location.reload()} 
                  className="bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors"
                >
                  Retry
                </button>
                <button 
                  onClick={() => navigate('/')} 
                  className="bg-gray-600 hover:bg-gray-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors"
                >
                  Go Home
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>
    );
  }

  // Empty state
  if (!countriesData || countriesData.length === 0) {
    return (
      <section className="px-4 py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center">
            <h1 className="font-bold text-gray-900 text-4xl md:text-5xl mb-6">
              Explore World
            </h1>
            <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-8 max-w-2xl mx-auto">
              <h3 className="text-yellow-800 text-xl font-bold mb-3">
                No Destinations Available
              </h3>
              <button 
                onClick={() => window.location.reload()} 
                className="bg-yellow-600 hover:bg-yellow-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors"
              >
                Refresh Page
              </button>
            </div>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="px-4 py-16 bg-gray-50">
      <div className="max-w-7xl mx-auto">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row justify-between items-center mb-12">
          <div className="text-center md:text-left mb-6 md:mb-0">
            <h1 className="font-bold text-gray-900 text-4xl md:text-5xl mb-6">
              Explore World
            </h1>
            <p className="text-gray-600 text-lg md:text-xl max-w-2xl leading-relaxed">
              Most popular places in the world. Let's enjoy this journey!
            </p>
          </div>
          {/* Desktop Only Arrows */}
          <div className="hidden md:flex gap-3">
            <button 
              onClick={prevSlide} 
              className="w-12 h-12 rounded-full bg-white hover:bg-gray-100 flex items-center justify-center transition-all duration-200 border border-gray-300 shadow-sm hover:shadow-md"
              aria-label="Previous slide"
            >
              <span className="text-2xl text-gray-700">←</span>
            </button>
            <button 
              onClick={nextSlide} 
              className="w-12 h-12 rounded-full bg-white hover:bg-gray-100 flex items-center justify-center transition-all duration-200 border border-gray-300 shadow-sm hover:shadow-md"
              aria-label="Next slide"
            >
              <span className="text-2xl text-gray-700">→</span>
            </button>
          </div>
        </div>

        {/* Mobile Slider - Single Slide */}
        <div className="block md:hidden">
          <Slider 
            ref={sliderRef}
            dots={false}
            arrows={false}
            infinite={true}
            speed={500}
            slidesToShow={1}
            slidesToScroll={1}
          >
            {countriesData.map((item, index) => (
              <div key={item._id || item.id || index} className="px-2">
                <div 
                  className="cursor-pointer"
                  onClick={() => handleCountry(item)}
                >
                  <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
                    {/* Image Container */}
                    <div className="overflow-hidden rounded-t-2xl">
                      <img
                        src={item.image_url || item.image || item.photo || "https://images.unsplash.com/photo-1485738422979-f5c462d49f74?w=400"}
                        alt={item.country || item.name || "Country"}
                        className="w-full h-64 object-cover"
                        onError={(e) => {
                          e.target.src = "https://images.unsplash.com/photo-1485738422979-f5c462d49f74?w=400";
                        }}
                      />
                    </div>
                    
                    {/* Content Container */}
                    <div className="p-6 text-center">
                      <h3 className="font-bold text-gray-900 text-xl mb-4">
                        {item.country || item.name || "Unnamed Country"}
                      </h3>
                      
                      {(item.capital || item.capital_city) && (
                        <div className="flex items-center justify-center gap-2 mb-4">
                          <span className="text-lg">🏛️</span>
                          <p className="font-semibold text-gray-700 text-base">
                            {item.capital || item.capital_city}
                          </p>
                        </div>
                      )}
                      
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          handleCountry(item);
                        }}
                        className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-lg font-semibold transition-colors w-full"
                      >
                        Explore
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </Slider>
        </div>

        {/* Desktop Slider */}
        <div className="hidden md:block slider-container relative">
          <Slider ref={sliderRef} {...settings}>
            {countriesData.map((item, index) => (
              <div key={item._id || item.id || index} className="px-3 focus:outline-none">
                <div 
                  className="cursor-pointer group"
                  onClick={() => handleCountry(item)}
                >
                  <div className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-2 border border-gray-100 overflow-hidden">
                    {/* Image Container */}
                    <div className="overflow-hidden rounded-t-2xl relative">
                      <img
                        src={item.image_url || item.image || item.photo || "https://images.unsplash.com/photo-1485738422979-f5c462d49f74?w=400"}
                        alt={item.country || item.name || "Country"}
                        className="w-full h-48 md:h-56 object-cover group-hover:scale-110 transition-transform duration-500"
                        onError={(e) => {
                          e.target.src = "https://images.unsplash.com/photo-1485738422979-f5c462d49f74?w=400";
                        }}
                      />
                      {/* Gradient Overlay */}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                    </div>
                    
                    {/* Content Container */}
                    <div className="p-6 text-center">
                      <h3 className="font-bold text-gray-900 text-lg md:text-xl mb-3 group-hover:text-blue-600 transition-colors duration-200">
                        {item.country || item.name || "Unnamed Country"}
                      </h3>
                      
                      {(item.capital || item.capital_city) && (
                        <div className="flex items-center justify-center gap-2 mb-2">
                          <span className="text-lg">🏛️</span>
                          <p className="font-semibold text-gray-700 text-sm">
                            {item.capital || item.capital_city}
                          </p>
                        </div>
                      )}
                      
                      {(item.description || item.overview) && (
                        <p className="text-gray-500 text-sm md:text-base leading-relaxed line-clamp-3 mb-4">
                          {item.description || item.overview}
                        </p>
                      )}
                      
                      <div className="flex justify-center">
                        <span className="inline-flex items-center gap-1 text-blue-600 font-semibold text-sm md:text-base group-hover:gap-2 transition-all duration-200">
                          Explore
                          <span className="text-lg">→</span>
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </Slider>
        </div>
      </div>
    </section>
  );
};

export default World;
