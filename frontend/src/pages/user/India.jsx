import React from "react";
import { useRef, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";

const India = () => {
  const sliderRef = useRef(null);
  const navigate = useNavigate();
  const [statesData, setStatesData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Test backend connection first
  useEffect(() => {
    const testBackendConnection = async () => {
      try {
        console.log("🔍 Testing backend connection for India component...");
        const testResponse = await fetch('https://hotelbookingsystem-backend-4c8d.onrender.com/');
        
        if (!testResponse.ok) {
          throw new Error(`Backend test failed with status: ${testResponse.status}`);
        }
        
        const testData = await testResponse.json();
        console.log("✅ Backend connection successful:", testData);
      } catch (testError) {
        console.error("❌ Backend connection test failed:", testError);
      }
    };
    
    testBackendConnection();
  }, []);

  // Fetch states data from your backend API
  useEffect(() => {
    const fetchStates = async () => {
      try {
        setLoading(true);
        setError(null);
        console.log("🔄 Fetching states data from API...");
        
        const response = await fetch('https://hotelbookingsystem-backend-4c8d.onrender.com/api/india/all', {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
          },
        });
        
        console.log("📡 Response status:", response.status);
        console.log("📡 Response ok:", response.ok);
        
        if (!response.ok) {
          const errorText = await response.text();
          console.error("❌ Response error text:", errorText);
          throw new Error(`HTTP error! status: ${response.status} - ${response.statusText}`);
        }
        
        const data = await response.json();
        console.log("📦 Full API response:", data);
        
        // Handle different response formats
        if (data.data && Array.isArray(data.data)) {
          console.log(`✅ States data found in data.data: ${data.data.length} items`);
          setStatesData(data.data);
        } else if (Array.isArray(data)) {
          console.log(`✅ States data found directly: ${data.length} items`);
          setStatesData(data);
        } else if (data.states && Array.isArray(data.states)) {
          console.log(`✅ States data found in states: ${data.states.length} items`);
          setStatesData(data.states);
        } else if (data.india && Array.isArray(data.india)) {
          console.log(`✅ States data found in india: ${data.india.length} items`);
          setStatesData(data.india);
        } else {
          console.warn("⚠️ Unexpected data format:", data);
          setStatesData([]); // Set empty array instead of throwing error
        }
        
      } catch (err) {
        console.error('❌ Error fetching states:', err);
        console.error('🔍 Error details:', {
          message: err.message,
          name: err.name,
        });
        setError('Failed to load states: ' + err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchStates();
  }, []);

  const handleStates = (state) => {
    console.log("🔗 Navigating to state:", state.state || state.name);
    navigate(`/states/${state._id || state.id}`); // Using MongoDB _id or id
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
          slidesToShow: 2,
          slidesToScroll: 1,
        },
      },
      {
        breakpoint: 640,
        settings: {
          slidesToShow: 1,
          slidesToScroll: 1,
        },
      },
      {
        breakpoint: 480,
        settings: {
          slidesToShow: 1,
          slidesToScroll: 1,
          centerMode: true,
          centerPadding: '20px',
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
      <section className="px-5 py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h1 className="font-bold text-gray-900 text-4xl md:text-5xl mb-6">
              Explore Incredible India
            </h1>
            <p className="text-gray-600 text-lg md:text-xl max-w-2xl mx-auto leading-relaxed">
              Loading amazing destinations...
            </p>
          </div>
          
          {/* Skeleton Loading */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
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
      <section className="px-5 py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center">
            <h1 className="font-bold text-gray-900 text-4xl md:text-5xl mb-6">
              Explore Incredible India
            </h1>
            <div className="bg-red-50 border border-red-200 rounded-xl p-8 max-w-2xl mx-auto">
              <div className="text-red-600 text-4xl mb-4">⚠️</div>
              <h3 className="text-red-800 text-xl font-bold mb-3">
                Failed to Load Destinations
              </h3>
              <p className="text-red-600 text-base mb-4">
                {error}
              </p>
              <p className="text-gray-600 text-sm mb-6">
                Please check if the backend server is running and try again.
              </p>
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
  if (!statesData || statesData.length === 0) {
    return (
      <section className="px-5 py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center">
            <h1 className="font-bold text-gray-900 text-4xl md:text-5xl mb-6">
              Explore Incredible India
            </h1>
            <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-8 max-w-2xl mx-auto">
              <div className="text-yellow-600 text-4xl mb-4">🏔️</div>
              <h3 className="text-yellow-800 text-xl font-bold mb-3">
                No Destinations Available
              </h3>
              <p className="text-yellow-600 text-base mb-4">
                No Indian states are currently available in our database.
              </p>
              <p className="text-gray-600 text-sm mb-6">
                This might be a temporary issue. Please try refreshing the page.
              </p>
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
    <section className="px-5 py-16 bg-gray-50">
      <div className="max-w-7xl mx-auto">
        {/* Success Indicator */}
        <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg text-center">
          <p className="text-green-700 text-sm font-medium">
            ✅ Successfully loaded {statesData.length} Indian destinations
          </p>
        </div>

        {/* Header Section */}
        <div className="flex flex-col md:flex-row justify-between items-center mb-12">
          <div className="text-center md:text-left mb-6 md:mb-0">
            <h1 className="font-bold text-gray-900 text-4xl md:text-5xl mb-6">
              Explore Incredible India
            </h1>
            <p className="text-gray-600 text-lg md:text-xl max-w-2xl leading-relaxed">
              Discover the diverse beauty, rich heritage, and vibrant cultures of India's most amazing states.
            </p>
          </div>
          <div className="flex gap-3">
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

        {/* Slider Section */}
        <div className="slider-container relative">
          <Slider ref={sliderRef} {...settings}>
            {statesData.map((item, index) => (
              <div key={item._id || item.id || index} className="px-2 sm:px-3 focus:outline-none">
                <div 
                  className="cursor-pointer group"
                  onClick={() => handleStates(item)}
                >
                  <div className="bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-3 border border-gray-100 overflow-hidden mx-1 sm:mx-2">
                    {/* Image Container */}
                    <div className="overflow-hidden rounded-t-2xl relative">
                      <img
                        src={item.image_url || item.image || item.photo || "https://images.unsplash.com/photo-1524492412937-b28074a5d7da?w=400"}
                        alt={item.state || item.name || "Indian Destination"}
                        className="w-full h-48 md:h-56 object-cover group-hover:scale-110 transition-transform duration-500"
                        onError={(e) => {
                          e.target.src = "https://images.unsplash.com/photo-1524492412937-b28074a5d7da?w=400";
                        }}
                      />
                      {/* Gradient Overlay */}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                    </div>
                    
                    {/* Content Container */}
                    <div className="p-4 sm:p-6 text-center">
                      <h3 className="font-bold text-gray-900 text-lg sm:text-xl mb-3 group-hover:text-blue-600 transition-colors duration-200">
                        {item.state || item.name || "Unnamed State"}
                      </h3>
                      {(item.description || item.overview) && (
                        <p className="text-gray-500 text-xs sm:text-sm leading-relaxed line-clamp-3 mb-4">
                          {item.description || item.overview}
                        </p>
                      )}
                      <div className="flex justify-center">
                        <span className="inline-flex items-center gap-1 text-blue-600 font-semibold text-xs sm:text-sm group-hover:gap-2 transition-all duration-200">
                          Explore {item.state || item.name}
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

        {/* Footer Info */}
        <div className="mt-12 text-center">
          <p className="text-gray-500 text-sm">
            Showing {statesData.length} amazing destinations across India
          </p>
        </div>

      </div>
    </section>
  );
};

export default India;
