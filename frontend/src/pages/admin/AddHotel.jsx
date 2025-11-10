import React, { useState } from "react";
import { 
  IoLink, 
  IoStar, 
  IoLocation, 
  IoCash,
  IoText,
  IoInformationCircle,
  IoClose,
  IoCheckmark,
  IoAlertCircle,
  IoGlobe,
  IoCard,
  IoImages,
} from "react-icons/io5";
import { MdOutlineDriveFileRenameOutline } from "react-icons/md";
import Navbar from "../../components/admin/Navbar";
import { useNavigate } from "react-router-dom";

const AddHotel = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    address: "",
    country: "",
    price: "",
    rating: 0,
    currency: "USD",
    imageUrl: "",
    imageUrl1: "",
    imageUrl2: "",
    state: "",
    capital: "",
    annual_tourists: "",
    property_type: "",
    property_name: "",
    property_location: ""
  });

  const [hoverRating, setHoverRating] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [selectedAPIs, setSelectedAPIs] = useState({
    world: false,
    india: false,
    property: false,
    hotels: true
  });

  // Common currencies
  const currencies = [
    { code: "USD", symbol: "$", name: "US Dollar" },
    { code: "EUR", symbol: "€", name: "Euro" },
    { code: "GBP", symbol: "£", name: "British Pound" },
    { code: "INR", symbol: "₹", name: "Indian Rupee" },
    { code: "CAD", symbol: "C$", name: "Canadian Dollar" },
    { code: "AUD", symbol: "A$", name: "Australian Dollar" },
    { code: "JPY", symbol: "¥", name: "Japanese Yen" },
    { code: "CNY", symbol: "¥", name: "Chinese Yuan" }
  ];

  // Property types for property API
  const propertyTypes = [
    "luxury_hotel",
    "beach_resort", 
    "mountain_cabin",
    "city_apartment",
    "boutique_hotel",
    "home_stay",
    "treehouse_resort",
    "hostel",
    "cottage",
    "houseboat"
  ];

  // Indian states for India API
  const indianStates = [
    "goa", "tamilnadu", "kerala", "himachalpradesh", 
    "rajasthan", "uttarakhand", "maharashtra", 
    "karnataka", "gujarat", "westbengal"
  ];

  // Countries for World API
  const worldCountries = [
    "france", "spain", "united_states", "china", "italy",
    "turkey", "mexico", "thailand", "germany", "united_kingdom"
  ];

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Clear messages when user starts typing
    if (error || success) {
      setError("");
      setSuccess("");
    }
  };

  const handleImageUrlChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const removeImage = (fieldName) => {
    setFormData(prev => ({
      ...prev,
      [fieldName]: ""
    }));
  };

  const handleRatingClick = (rating) => {
    setFormData(prev => ({
      ...prev,
      rating: rating
    }));
  };

  const handleApiToggle = (apiName) => {
    setSelectedAPIs(prev => ({
      ...prev,
      [apiName]: !prev[apiName]
    }));
  };

  const validateForm = () => {
    // Basic validation
    if (!formData.name.trim()) {
      setError("Hotel name is required");
      return false;
    }
    if (!formData.description.trim()) {
      setError("Description is required");
      return false;
    }
    if (!formData.address.trim()) {
      setError("Address is required");
      return false;
    }
    if (!formData.price || parseFloat(formData.price) <= 0) {
      setError("Valid price is required");
      return false;
    }
    if (formData.rating === 0) {
      setError("Please select a rating");
      return false;
    }
    if (!formData.currency) {
      setError("Currency is required");
      return false;
    }
    if (!formData.imageUrl.trim()) {
      setError("Main image URL is required");
      return false;
    }

    // API-specific validation
    if (selectedAPIs.world && !formData.country) {
      setError("Country is required for World API");
      return false;
    }
    if (selectedAPIs.india && !formData.state) {
      setError("State is required for India API");
      return false;
    }
    if (selectedAPIs.property && !formData.property_type) {
      setError("Property type is required for Property API");
      return false;
    }
    if (selectedAPIs.hotels && !formData.country) {
      setError("Country is required for Hotels API");
      return false;
    }

    // Validate URL formats for all image URLs
    const imageFields = ['imageUrl', 'imageUrl1', 'imageUrl2'];
    for (let field of imageFields) {
      if (formData[field].trim()) {
        try {
          new URL(formData[field]);
        } catch (err) {
          setError(`Please enter a valid URL for ${field === 'imageUrl' ? 'main image' : 'additional image'}`);
          return false;
        }
      }
    }

    return true;
  };

  // Safer API function with better error handling
  const addHotelToAPISafe = async (apiUrl, data, apiName) => {
    try {
      console.log(`Sending to ${apiName} API:`, data);
      
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data)
      });

      const contentType = response.headers.get('content-type');
      
      if (!response.ok) {
        // If response is not JSON, throw a better error
        if (contentType && contentType.includes('application/json')) {
          const errorData = await response.json();
          throw new Error(errorData.message || `HTTP ${response.status}`);
        } else {
          const text = await response.text();
          throw new Error(`Server returned HTML (likely 404). Status: ${response.status}`);
        }
      }

      // Parse response based on content type
      if (contentType && contentType.includes('application/json')) {
        const result = await response.json();
        return { api: apiName, success: true, result };
      } else {
        throw new Error('Server returned non-JSON response');
      }

    } catch (error) {
      console.error(`Error in ${apiName} API:`, error);
      return { api: apiName, success: false, error: error.message };
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    setError("");
    setSuccess("");

    try {
      // Common hotel data
      const commonHotelData = {
        name: formData.name.trim(),
        description: formData.description.trim(),
        address: formData.address.trim(),
        price: Number(formData.price),
        rating: Number(formData.rating),
        image_url: formData.imageUrl.trim(),
        image_url_1: formData.imageUrl1.trim() || "",
        image_url_2: formData.imageUrl2.trim() || ""
      };

      console.log('Sending hotel data to selected APIs:', selectedAPIs);

      const apiPromises = [];

      // 1. Hotels API (Direct hotel creation)
      if (selectedAPIs.hotels) {
        const hotelsData = {
          ...commonHotelData,
          country: formData.country.trim(),
          currency: formData.currency
        };
        apiPromises.push(
          addHotelToAPISafe('https://hotelbookingsystem-backend-4c8d.onrender.com/api/hotel/', hotelsData, 'Hotels')
        );
      }

      // 2. World API - Only add if user explicitly selected it
      if (selectedAPIs.world) {
        const worldData = {
          country: formData.country,
          image_url: formData.imageUrl.trim(),
          description: `Hotels in ${formData.country}`,
          capital: formData.capital?.trim() || "Not specified",
          annual_tourists: formData.annual_tourists?.trim() || "Not specified",
          // Use a default country array instead of dynamic property
          france: formData.country === 'france' ? [commonHotelData] : [],
          spain: formData.country === 'spain' ? [commonHotelData] : [],
          united_states: formData.country === 'united_states' ? [commonHotelData] : [],
          china: formData.country === 'china' ? [commonHotelData] : [],
          italy: formData.country === 'italy' ? [commonHotelData] : [],
          turkey: formData.country === 'turkey' ? [commonHotelData] : [],
          mexico: formData.country === 'mexico' ? [commonHotelData] : [],
          thailand: formData.country === 'thailand' ? [commonHotelData] : [],
          germany: formData.country === 'germany' ? [commonHotelData] : [],
          united_kingdom: formData.country === 'united_kingdom' ? [commonHotelData] : []
        };
        apiPromises.push(
          addHotelToAPISafe('https://hotelbookingsystem-backend-4c8d.onrender.com/api/world/', worldData, 'World')
        );
      }

      // 3. India API - Only add if user explicitly selected it
      if (selectedAPIs.india) {
        const indiaData = {
          state: formData.state,
          image_url: formData.imageUrl.trim(),
          description: `Hotels in ${formData.state}`,
          // Use a default state array instead of dynamic property
          goa: formData.state === 'goa' ? [commonHotelData] : [],
          tamilnadu: formData.state === 'tamilnadu' ? [commonHotelData] : [],
          kerala: formData.state === 'kerala' ? [commonHotelData] : [],
          himachalpradesh: formData.state === 'himachalpradesh' ? [commonHotelData] : [],
          rajasthan: formData.state === 'rajasthan' ? [commonHotelData] : [],
          uttarakhand: formData.state === 'uttarakhand' ? [commonHotelData] : [],
          maharashtra: formData.state === 'maharashtra' ? [commonHotelData] : [],
          karnataka: formData.state === 'karnataka' ? [commonHotelData] : [],
          gujarat: formData.state === 'gujarat' ? [commonHotelData] : [],
          westbengal: formData.state === 'westbengal' ? [commonHotelData] : []
        };
        apiPromises.push(
          addHotelToAPISafe('https://hotelbookingsystem-backend-4c8d.onrender.com/api/india/', indiaData, 'India')
        );
      }

      // 4. Property API - Only add if user explicitly selected it
      if (selectedAPIs.property) {
        const propertyData = {
          type: formData.property_type,
          name: formData.property_name?.trim() || formData.name.trim(),
          image_url: formData.imageUrl.trim(),
          location: formData.property_location?.trim() || formData.address.trim(),
          description: formData.description.trim(),
          // Use a default property type array instead of dynamic property
          luxury_hotel: formData.property_type === 'luxury_hotel' ? [commonHotelData] : [],
          beach_resort: formData.property_type === 'beach_resort' ? [commonHotelData] : [],
          mountain_cabin: formData.property_type === 'mountain_cabin' ? [commonHotelData] : [],
          city_apartment: formData.property_type === 'city_apartment' ? [commonHotelData] : [],
          boutique_hotel: formData.property_type === 'boutique_hotel' ? [commonHotelData] : [],
          home_stay: formData.property_type === 'home_stay' ? [commonHotelData] : [],
          treehouse_resort: formData.property_type === 'treehouse_resort' ? [commonHotelData] : [],
          hostel: formData.property_type === 'hostel' ? [commonHotelData] : [],
          cottage: formData.property_type === 'cottage' ? [commonHotelData] : [],
          houseboat: formData.property_type === 'houseboat' ? [commonHotelData] : []
        };
        apiPromises.push(
          addHotelToAPISafe('https://hotelbookingsystem-backend-4c8d.onrender.com/api/property/', propertyData, 'Property')
        );
      }

      // Wait for all API calls to complete
      const results = await Promise.all(apiPromises);

      // Process results
      const successfulAPIs = results.filter(result => result.success);
      const failedAPIs = results.filter(result => !result.success);

      if (failedAPIs.length > 0) {
        const errorMessages = failedAPIs.map(failed => 
          `${failed.api}: ${failed.error}`
        ).join('; ');
        
        if (successfulAPIs.length === 0) {
          throw new Error(`Failed to add hotel to all APIs: ${errorMessages}`);
        } else {
          setSuccess(`Hotel added to ${successfulAPIs.length} out of ${apiPromises.length} APIs. Failed: ${errorMessages}`);
        }
      } else {
        setSuccess('Hotel added successfully to all selected APIs! Redirecting...');
      }

      // Reset form if at least one API call succeeded
      if (successfulAPIs.length > 0) {
        setFormData({
          name: "",
          description: "",
          address: "",
          country: "",
          price: "",
          rating: 0,
          currency: "USD",
          imageUrl: "",
          imageUrl1: "",
          imageUrl2: "",
          state: "",
          capital: "",
          annual_tourists: "",
          property_type: "",
          property_name: "",
          property_location: ""
        });

        // Redirect to hotels list page after 2 seconds
        setTimeout(() => {
          navigate('/hotels');
        }, 2000);
      }

    } catch (err) {
      console.error('Error adding hotel:', err);
      setError(err.message || 'Failed to add hotel. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      name: "",
      description: "",
      address: "",
      country: "",
      price: "",
      rating: 0,
      currency: "USD",
      imageUrl: "",
      imageUrl1: "",
      imageUrl2: "",
      state: "",
      capital: "",
      annual_tourists: "",
      property_type: "",
      property_name: "",
      property_location: ""
    });
    setError("");
    setSuccess("");
  };

  // Function to render image input field
  const renderImageInput = (fieldName, label, isRequired = false) => (
    <div className="space-y-2">
      <label className="flex items-center space-x-2 text-sm font-medium text-gray-700">
        <IoLink className="w-4 h-4" />
        <span>{label} {isRequired && <span className="text-red-500">*</span>}</span>
      </label>
      <div className="flex space-x-2">
        <input
          type="url"
          name={fieldName}
          value={formData[fieldName]}
          onChange={handleImageUrlChange}
          placeholder="Enter url"
          className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
          disabled={loading}
        />
        {formData[fieldName] && (
          <button
            type="button"
            onClick={() => removeImage(fieldName)}
            disabled={loading}
            className="px-4 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors duration-200 flex items-center space-x-2 disabled:bg-red-400 disabled:cursor-not-allowed"
          >
            <IoClose className="w-4 h-4" />
            <span>Remove</span>
          </button>
        )}
      </div>
    </div>
  );

  // Function to render image preview
  const renderImagePreview = (fieldName, label) => {
    if (!formData[fieldName]) return null;

    return (
      <div className="border border-gray-200 rounded-lg p-4 bg-gray-50">
        <h3 className="text-sm font-medium text-gray-700 mb-3">{label} Preview</h3>
        <div className="flex justify-center">
          <img 
            src={formData[fieldName]} 
            alt={`${label} preview`} 
            className="max-w-full h-48 object-cover rounded-lg shadow-md"
            onError={(e) => {
              e.target.style.display = 'none';
              const errorDiv = e.target.parentNode.querySelector('.image-error');
              if (errorDiv) errorDiv.style.display = 'block';
            }}
          />
          <div className="image-error text-center text-red-500 text-sm mt-2" style={{display: 'none'}}>
            Invalid image URL or image failed to load
          </div>
        </div>
      </div>
    );
  };

  return (
    <div>
      <Navbar/>
      <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Hotel Management</h1>
            <p className="text-gray-600">Add new hotels or manage existing ones across all APIs</p>
          </div>

          {/* Success/Error Messages */}
          {success && (
            <div className="mb-6 bg-green-50 border border-green-200 rounded-lg p-4 flex items-center space-x-2">
              <IoCheckmark className="w-5 h-5 text-green-600" />
              <span className="text-green-600 font-medium">{success}</span>
            </div>
          )}

          {error && (
            <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4 flex items-center space-x-2">
              <IoAlertCircle className="w-5 h-5 text-red-600" />
              <span className="text-red-600 font-medium">{error}</span>
            </div>
          )}

          {/* API Selection */}
          <div className="bg-white shadow-lg rounded-lg p-6 mb-6">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">Select APIs to Add Hotel</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {Object.entries(selectedAPIs).map(([api, isSelected]) => (
                <label key={api} className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={isSelected}
                    onChange={() => handleApiToggle(api)}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-sm font-medium text-gray-700 capitalize">{api} API</span>
                </label>
              ))}
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="bg-white shadow-xl rounded-lg p-6 space-y-6">
            {/* Image URLs Section */}
            <div className="space-y-6">
              <div className="flex items-center space-x-2 text-lg font-semibold text-gray-800 border-b pb-2">
                <IoImages className="w-5 h-5" />
                <span>Hotel Images</span>
              </div>
              
              {/* Main Image */}
              {renderImageInput('imageUrl', 'Main Image URL', true)}
              {renderImagePreview('imageUrl', 'Main Image')}

              {/* Additional Images */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  {renderImageInput('imageUrl1', 'Additional Image 1')}
                  {renderImagePreview('imageUrl1', 'Additional Image 1')}
                </div>
                <div>
                  {renderImageInput('imageUrl2', 'Additional Image 2')}
                  {renderImagePreview('imageUrl2', 'Additional Image 2')}
                </div>
              </div>

              <p className="text-sm text-gray-500">
                <strong>Main Image</strong> is required. Additional images are optional but recommended for better presentation.
              </p>
            </div>

            {/* Hotel Details Section */}
            <div className="space-y-6">
              <div className="flex items-center space-x-2 text-lg font-semibold text-gray-800 border-b pb-2">
                <IoInformationCircle className="w-5 h-5" />
                <span>Hotel Details</span>
              </div>

              {/* Hotel Name */}
              <div className="space-y-2">
                <label className="flex items-center space-x-2 text-sm font-medium text-gray-700">
                  <MdOutlineDriveFileRenameOutline  className="w-4 h-4" />
                  <span>Hotel Name</span>
                  <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  placeholder="Enter hotel name"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 disabled:bg-gray-100"
                  required
                  disabled={loading}
                />
              </div>

              {/* Description */}
              <div className="space-y-2">
                <label className="flex items-center space-x-2 text-sm font-medium text-gray-700">
                  <IoInformationCircle className="w-4 h-4" />
                  <span>Description</span>
                  <span className="text-red-500">*</span>
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  placeholder="Enter hotel description"
                  rows="4"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 resize-none disabled:bg-gray-100"
                  required
                  disabled={loading}
                />
              </div>

              {/* Address */}
              <div className="space-y-2">
                <label className="flex items-center space-x-2 text-sm font-medium text-gray-700">
                  <IoLocation className="w-4 h-4" />
                  <span>Address</span>
                  <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="address"
                  value={formData.address}
                  onChange={handleInputChange}
                  placeholder="Enter hotel address"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 disabled:bg-gray-100"
                  required
                  disabled={loading}
                />
              </div>

              {/* API Specific Fields */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* World API Fields */}
                {selectedAPIs.world && (
                  <div className="space-y-2">
                    <label className="flex items-center space-x-2 text-sm font-medium text-gray-700">
                      <IoGlobe className="w-4 h-4" />
                      <span>Country (World API)</span>
                      <span className="text-red-500">*</span>
                    </label>
                    <select
                      name="country"
                      value={formData.country}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 disabled:bg-gray-100"
                      required={selectedAPIs.world}
                      disabled={loading}
                    >
                      <option value="">Select Country</option>
                      {worldCountries.map(country => (
                        <option key={country} value={country}>
                          {country.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                {/* India API Fields */}
                {selectedAPIs.india && (
                  <div className="space-y-2">
                    <label className="flex items-center space-x-2 text-sm font-medium text-gray-700">
                      <IoLocation className="w-4 h-4" />
                      <span>State (India API)</span>
                      <span className="text-red-500">*</span>
                    </label>
                    <select
                      name="state"
                      value={formData.state}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 disabled:bg-gray-100"
                      required={selectedAPIs.india}
                      disabled={loading}
                    >
                      <option value="">Select State</option>
                      {indianStates.map(state => (
                        <option key={state} value={state}>
                          {state.replace(/\b\w/g, l => l.toUpperCase())}
                        </option>
                      ))}
                    </select>
                  </div>
                )}
              </div>

              {/* Property API Fields */}
              {selectedAPIs.property && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="flex items-center space-x-2 text-sm font-medium text-gray-700">
                      <IoInformationCircle className="w-4 h-4" />
                      <span>Property Type</span>
                      <span className="text-red-500">*</span>
                    </label>
                    <select
                      name="property_type"
                      value={formData.property_type}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 disabled:bg-gray-100"
                      required={selectedAPIs.property}
                      disabled={loading}
                    >
                      <option value="">Select Property Type</option>
                      {propertyTypes.map(type => (
                        <option key={type} value={type}>
                          {type.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="flex items-center space-x-2 text-sm font-medium text-gray-700">
                      <IoText className="w-4 h-4" />
                      <span>Property Name</span>
                    </label>
                    <input
                      type="text"
                      name="property_name"
                      value={formData.property_name}
                      onChange={handleInputChange}
                      placeholder="Enter property name"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 disabled:bg-gray-100"
                      disabled={loading}
                    />
                  </div>
                </div>
              )}

              {/* Hotels API Fields */}
              {selectedAPIs.hotels && (
                <div className="space-y-2">
                  <label className="flex items-center space-x-2 text-sm font-medium text-gray-700">
                    <IoGlobe className="w-4 h-4" />
                    <span>Country (Hotels API)</span>
                    <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="country"
                    value={formData.country}
                    onChange={handleInputChange}
                    placeholder="Enter country"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 disabled:bg-gray-100"
                    required={selectedAPIs.hotels}
                    disabled={loading}
                  />
                </div>
              )}

              {/* Price, Currency & Rating Row */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Price */}
                <div className="space-y-2">
                  <label className="flex items-center space-x-2 text-sm font-medium text-gray-700">
                    <IoCash className="w-4 h-4" />
                    <span>Price per night</span>
                    <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    name="price"
                    value={formData.price}
                    onChange={handleInputChange}
                    placeholder="Enter price"
                    min="0"
                    step="0.01"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 disabled:bg-gray-100"
                    required
                    disabled={loading}
                  />
                </div>

                {/* Currency */}
                <div className="space-y-2">
                  <label className="flex items-center space-x-2 text-sm font-medium text-gray-700">
                    <IoCard className="w-4 h-4" />
                    <span>Currency</span>
                    <span className="text-red-500">*</span>
                  </label>
                  <select
                    name="currency"
                    value={formData.currency}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 disabled:bg-gray-100"
                    required
                    disabled={loading}
                  >
                    {currencies.map((currency) => (
                      <option key={currency.code} value={currency.code}>
                        {currency.symbol} {currency.code} - {currency.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Rating */}
                <div className="space-y-2">
                  <label className="flex items-center space-x-2 text-sm font-medium text-gray-700">
                    <IoStar className="w-4 h-4" />
                    <span>Rating</span>
                    <span className="text-red-500">*</span>
                  </label>
                  <div className="flex space-x-1 items-center">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => handleRatingClick(star)}
                        onMouseEnter={() => setHoverRating(star)}
                        onMouseLeave={() => setHoverRating(0)}
                        disabled={loading}
                        className="text-2xl transition-transform duration-150 hover:scale-110 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <IoStar
                          className={`${
                            star <= (hoverRating || formData.rating)
                              ? "text-yellow-400 fill-current"
                              : "text-gray-300"
                          }`}
                        />
                      </button>
                    ))}
                    <span className="ml-2 text-sm text-gray-600">
                      {formData.rating > 0 ? `${formData.rating}/5` : "Select rating"}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="pt-6 flex space-x-4">
              <button
                type="button"
                onClick={resetForm}
                disabled={loading}
                className="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-800 font-medium py-3 px-4 rounded-lg transition-colors duration-200 focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 disabled:bg-gray-200 disabled:cursor-not-allowed"
              >
                Reset Form
              </button>
              <button
                type="submit"
                disabled={loading}
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-4 rounded-lg transition-colors duration-200 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 shadow-lg disabled:bg-blue-400 disabled:cursor-not-allowed flex items-center justify-center"
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Adding to {Object.values(selectedAPIs).filter(Boolean).length} APIs...
                  </>
                ) : (
                  `Add Hotel to ${Object.values(selectedAPIs).filter(Boolean).length} APIs`
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AddHotel;
