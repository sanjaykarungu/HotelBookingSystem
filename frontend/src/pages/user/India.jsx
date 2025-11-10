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

  // Fetch states data from your backend API
  useEffect(() => {
    const fetchStates = async () => {
      try {
        setLoading(true);
        const response = await fetch('https://hotel-booking-sigma-wine.vercel.app/api/india/all');
        
        if (!response.ok) {
          throw new Error('Failed to fetch states data');
        }
        
        const data = await response.json();
        setStatesData(data.data || []);
      } catch (err) {
        setError(err.message);
        console.error('Error fetching states:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchStates();
  }, []);

  const handleStates = (state) => {
    navigate(`/states/${state._id}`); // Using MongoDB _id instead of id
  }

  const settings = {
    dots: false,
    arrows: false,
    infinite: true,
    speed: 500,
    slidesToShow: 4,
    slidesToScroll: 1, // Changed to 1 for smoother sliding
    adaptiveHeight: true,
    pauseOnHover: true,
    responsive: [
      {
        breakpoint: 1280, // For large laptops
        settings: {
          slidesToShow: 3,
          slidesToScroll: 1,
        },
      },
      {
        breakpoint: 1024, // For tablets landscape
        settings: {
          slidesToShow: 2,
          slidesToScroll: 1,
        },
      },
      {
        breakpoint: 768, // For tablets portrait
        settings: {
          slidesToShow: 2,
          slidesToScroll: 1,
        },
      },
      {
        breakpoint: 640, // For mobile landscape
        settings: {
          slidesToShow: 1,
          slidesToScroll: 1,
        },
      },
      {
        breakpoint: 480, // For mobile portrait
        settings: {
          slidesToShow: 1,
          slidesToScroll: 1,
          centerMode: true, // Adds focus on current slide
          centerPadding: '20px', // Adds some padding for better visual
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

  // Loading state
  if (loading) {
    return (
      <section className="px-5 py-16 bg-gray-50 to-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center">
            <h1 className="font-bold text-gray-900 text-4xl md:text-5xl mb-6">
              Explore Incredible India
            </h1>
            <p className="text-gray-600 text-lg">Loading amazing destinations...</p>
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
              Explore Incredible India
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

  return (
    <section className="px-5 py-16 bg-gray-50 to-white">
      <div className="max-w-7xl mx-auto">
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
            {statesData.map((item) => (
              <div key={item._id} className="px-2 sm:px-3 focus:outline-none">
                <div 
                  className="cursor-pointer group"
                  onClick={() => handleStates(item)}
                >
                  <div className="bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-3 border border-gray-100 overflow-hidden mx-1 sm:mx-2">
                    {/* Image Container */}
                    <div className="overflow-hidden rounded-t-2xl relative">
                      <img
                        src={item.image_url}
                        alt={item.state}
                        className="w-full h-48 md:h-56 object-cover group-hover:scale-110 transition-transform duration-500"
                      />
                      {/* Gradient Overlay */}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                    </div>
                    
                    {/* Content Container */}
                    <div className="p-4 sm:p-6 text-center">
                      <h3 className="font-bold text-gray-900 text-lg sm:text-xl mb-3 group-hover:text-blue-600 transition-colors duration-200">
                        {item.state}
                      </h3>
                      {item.description && (
                        <p className="text-gray-500 text-xs sm:text-sm leading-relaxed line-clamp-3 mb-4">
                          {item.description}
                        </p>
                      )}
                      <div className="flex justify-center">
                        <span className="inline-flex items-center gap-1 text-blue-600 font-semibold text-xs sm:text-sm group-hover:gap-2 transition-all duration-200">
                          Explore {item.state}
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

export default India;