import React from "react";
import { FaKitchenSet, FaWifi, FaClock, FaHeadset } from "react-icons/fa6";

const About = () => {
  const features = [
    {
      icon: <FaKitchenSet className="w-8 h-8" />,
      title: "Fully Equipped Kitchen",
      description: "Modern kitchen with all necessary appliances and utensils"
    },
    {
      icon: <FaWifi className="w-8 h-8" />,
      title: "One-tap WiFi Access",
      description: "High-speed internet with seamless connectivity"
    },
    {
      icon: <FaClock className="w-8 h-8" />,
      title: "Flexible Checkout",
      description: "Request late checkout based on availability"
    },
    {
      icon: <FaHeadset className="w-8 h-8" />,
      title: "24/7 Support",
      description: "Round-the-clock customer service assistance"
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto mt-10">
        {/* Content Section */}
        <div className="flex flex-col lg:flex-row items-center justify-center lg:gap-16 mb-16">
          {/* Image Section */}
          <div className="flex-1 flex justify-center lg:justify-end">
            <div className="w-full max-w-md">
              <img
                src="https://i.pinimg.com/736x/cb/26/09/cb2609425a766be08dffbaa421bbfe99.jpg"
                alt="Hotel Booking Service"
                className="w-full h-auto rounded-2xl shadow-2xl transform hover:scale-105 transition-transform duration-300"
              />
            </div>
          </div>

          {/* Text Content Section */}
          <div className="flex-1 max-w-lg mr-25">
            <h1 className="font-bold text-gray-900 text-3xl lg:text-4xl mb-6 leading-tight">
              Conveniences of Our Services
            </h1>
            <p className="text-gray-600 text-lg leading-relaxed mb-8">
              Enjoy instant confirmations, flexible cancellation policies, and
              secure payments. Our user-friendly platform offers real-time
              availability, competitive pricing, and 24/7 customer support.
              Mobile-friendly booking, exclusive deals, and personalized
              recommendations make your travel planning effortless and
              stress-free.
            </p>
          </div>
        </div>

        {/* Features Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mt-16">
          {features.map((feature, index) => (
            <div 
              key={index} 
              className="bg-white rounded-xl shadow-lg p-6 text-center hover:shadow-xl transition-shadow duration-300 border border-gray-100"
            >
              <div className="w-16 h-16 mx-auto mb-4 bg-blue-100 rounded-2xl flex items-center justify-center text-blue-600">
                {feature.icon}
              </div>
              <h3 className="font-bold text-gray-900 text-lg mb-2">
                {feature.title}
              </h3>
              <p className="text-gray-600 text-sm">
                {feature.description}
              </p>
            </div>
          ))}
        </div>

        {/* Additional Stats Section */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-16 text-center">
          <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-100">
            <div className="text-2xl font-bold text-blue-600 mb-2">500+</div>
            <div className="text-gray-700 font-semibold text-sm">Partner Hotels</div>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-100">
            <div className="text-2xl font-bold text-blue-600 mb-2">50K+</div>
            <div className="text-gray-700 font-semibold text-sm">Happy Guests</div>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-100">
            <div className="text-2xl font-bold text-blue-600 mb-2">25+</div>
            <div className="text-gray-700 font-semibold text-sm">Countries</div>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-100">
            <div className="text-2xl font-bold text-blue-600 mb-2">24/7</div>
            <div className="text-gray-700 font-semibold text-sm">Support</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default About;