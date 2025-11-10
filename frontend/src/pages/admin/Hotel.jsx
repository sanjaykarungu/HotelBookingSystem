import React, { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom';
import Navbar from '../../components/admin/Navbar';

const Hotel = () => {
  const navigate = useNavigate();
  const [hotels, setHotels] = useState([]);
  const [filteredHotels, setFilteredHotels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [apiStats, setApiStats] = useState({});
  
  // Search and filter states
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSource, setSelectedSource] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [sortBy, setSortBy] = useState('name');

  // All API endpoints
  const API_ENDPOINTS = [
    { url: 'https://hotel-booking-sigma-wine.vercel.app/api/world/all', name: 'world' },
    { url: 'https://hotel-booking-sigma-wine.vercel.app/api/hotel/all', name: 'hotel' },
    { url: 'https://hotel-booking-sigma-wine.vercel.app/api/property/all', name: 'property' },
    { url: 'https://hotel-booking-sigma-wine.vercel.app/api/india/all', name: 'india' }
  ];

  // Enhanced function to extract hotels from any data structure
  const extractHotelsFromData = (data, source) => {
    let hotels = [];
    console.log(`Extracting from ${source}:`, data);

    // Recursive function to find all hotel-like objects
    const findHotels = (obj, path = '') => {
      if (!obj || typeof obj !== 'object') return;

      // Check if current object is a hotel
      if (obj.name || obj.hotelName || obj.propertyName || obj.title) {
        const isHotel = obj.name || obj.hotelName || obj.propertyName || obj.title;
        const hasPrice = obj.price || obj.price_per_night || obj.rate;
        const hasLocation = obj.address || obj.location || obj.city;
        
        if (isHotel && (hasPrice || hasLocation)) {
          hotels.push({
            ...obj,
            source,
            id: obj._id || obj.id || `${source}-${Math.random().toString(36).substr(2, 9)}`,
            extractionPath: path
          });
        }
      }

      // Recursively search through all properties
      if (Array.isArray(obj)) {
        obj.forEach((item, index) => findHotels(item, `${path}[${index}]`));
      } else if (typeof obj === 'object') {
        Object.keys(obj).forEach(key => {
          findHotels(obj[key], path ? `${path}.${key}` : key);
        });
      }
    };

    // Start searching for hotels
    findHotels(data);

    // If no hotels found with recursive search, try structured extraction
    if (hotels.length === 0) {
      console.log(`No hotels found recursively, trying structured extraction for ${source}`);
      
      // Method 1: Direct array of hotels
      if (Array.isArray(data)) {
        hotels = data.filter(item => item.name || item.hotelName).map(item => ({
          ...item,
          source,
          id: item._id || item.id || `${source}-${Math.random().toString(36).substr(2, 9)}`
        }));
      }
      // Method 2: Data with nested structures
      else if (data.data && Array.isArray(data.data)) {
        // For india API: states with hotels array
        if (source === 'india') {
          data.data.forEach(state => {
            // Check for hotels in state-specific arrays (goa, tamilnadu, etc.)
            const stateFields = ['goa', 'tamilnadu', 'kerala', 'himachalpradesh', 'rajasthan', 'uttarakhand', 'maharashtra', 'karnataka', 'gujarat', 'westbengal'];
            
            stateFields.forEach(field => {
              if (state[field] && Array.isArray(state[field])) {
                const stateHotels = state[field].map(hotel => ({
                  ...hotel,
                  stateName: state.state,
                  stateId: state._id, // Include stateId for India hotels
                  source,
                  id: hotel._id || hotel.id || `${source}-${Math.random().toString(36).substr(2, 9)}`
                }));
                hotels = [...hotels, ...stateHotels];
              }
            });
          });
        } else {
          // For other APIs, data.data might contain hotels directly
          hotels = data.data.filter(item => item.name || item.hotelName).map(item => ({
            ...item,
            source,
            id: item._id || item.id || `${source}-${Math.random().toString(36).substr(2, 9)}`
          }));
        }
      }
      // Method 3: World data might have countries with hotels
      else if (source === 'world' && data.countries) {
        if (Array.isArray(data.countries)) {
          data.countries.forEach(country => {
            if (country.hotels && Array.isArray(country.hotels)) {
              const countryHotels = country.hotels.map(hotel => ({
                ...hotel,
                countryName: country.name,
                source,
                id: hotel._id || hotel.id || `${source}-${Math.random().toString(36).substr(2, 9)}`
              }));
              hotels = [...hotels, ...countryHotels];
            }
          });
        }
      }
      // Method 4: Properties might have properties array
      else if (source === 'property' && data.properties) {
        if (Array.isArray(data.properties)) {
          hotels = data.properties.map(property => ({
            ...property,
            source,
            id: property._id || property.id || `${source}-${Math.random().toString(36).substr(2, 9)}`
          }));
        }
      }
      // Method 5: Hotels at root level
      else if (data.hotels && Array.isArray(data.hotels)) {
        hotels = data.hotels.map(hotel => ({
          ...hotel,
          source,
          id: hotel._id || hotel.id || `${source}-${Math.random().toString(36).substr(2, 9)}`
        }));
      }
    }

    console.log(`Extracted ${hotels.length} hotels from ${source}`);
    
    // Filter out objects that don't look like hotels
    const validHotels = hotels.filter(hotel => 
      (hotel.name || hotel.hotelName || hotel.propertyName) && 
      (hotel.price || hotel.price_per_night || hotel.address || hotel.location)
    );

    console.log(`Valid hotels from ${source}:`, validHotels.length);
    return validHotels;
  };

  // Fetch hotels from all APIs
  const fetchHotels = async () => {
    try {
      setLoading(true);
      setError(null);
      setApiStats({});
      
      const apiResults = {};

      const promises = API_ENDPOINTS.map(async (endpoint) => {
        try {
          console.log(`=== FETCHING FROM: ${endpoint.url} ===`);
          const response = await fetch(endpoint.url);
          
          if (!response.ok) {
            throw new Error(`HTTP ${response.status}`);
          }
          
          const data = await response.json();
          console.log(`=== RAW DATA FROM ${endpoint.name.toUpperCase()} ===`, data);
          
          const extractedHotels = extractHotelsFromData(data, endpoint.name);
          
          apiResults[endpoint.name] = {
            success: true,
            count: extractedHotels.length,
            hotels: extractedHotels,
            rawData: data // Keep for debugging
          };
          
          return extractedHotels;
        } catch (err) {
          console.error(`Error fetching from ${endpoint.name}:`, err);
          apiResults[endpoint.name] = {
            success: false,
            error: err.message,
            count: 0,
            hotels: []
          };
          return [];
        }
      });

      const results = await Promise.all(promises);
      
      // Combine all hotels from all APIs
      const allHotels = results.flat();
      
      // Set API stats for display
      setApiStats(apiResults);
      
      console.log('=== ALL EXTRACTED HOTELS ===', allHotels);
      console.log('=== API RESULTS SUMMARY ===', apiResults);

      setHotels(allHotels);
      setFilteredHotels(allHotels); // Initialize filtered hotels with all hotels
      
    } catch (err) {
      console.error('Error in main fetch:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHotels();
  }, []);

  // Apply filters and search
  useEffect(() => {
    let filtered = [...hotels];

    // Apply search filter
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(hotel => 
        (hotel.name || hotel.hotelName || hotel.propertyName || hotel.title || '').toLowerCase().includes(term) ||
        (hotel.address || hotel.location || hotel.city || '').toLowerCase().includes(term) ||
        (hotel.stateName || '').toLowerCase().includes(term) ||
        (hotel.countryName || '').toLowerCase().includes(term)
      );
    }

    // Apply source filter
    if (selectedSource !== 'all') {
      filtered = filtered.filter(hotel => hotel.source === selectedSource);
    }

    // Apply status filter
    if (selectedStatus !== 'all') {
      filtered = filtered.filter(hotel => {
        const status = getHotelStatus(hotel);
        return selectedStatus === 'active' ? status === 'active' : status !== 'active';
      });
    }

    // Apply sorting
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'name':
          const nameA = (a.name || a.hotelName || a.propertyName || a.title || '').toLowerCase();
          const nameB = (b.name || b.hotelName || b.propertyName || b.title || '').toLowerCase();
          return nameA.localeCompare(nameB);
        
        case 'price':
          const priceA = a.price || a.price_per_night || a.starting_price || a.rate || a.cost || 0;
          const priceB = b.price || b.price_per_night || b.starting_price || b.rate || b.cost || 0;
          return priceB - priceA; // Highest first
        
        case 'rating':
          const ratingA = a.rating || a.star_rating || a.review_rating || a.stars || 0;
          const ratingB = b.rating || b.star_rating || b.review_rating || b.stars || 0;
          return ratingB - ratingA; // Highest first
        
        case 'source':
          return a.source.localeCompare(b.source);
        
        default:
          return 0;
      }
    });

    setFilteredHotels(filtered);
  }, [hotels, searchTerm, selectedSource, selectedStatus, sortBy]);

  // Delete hotel function - UPDATED
  const handleDeleteHotel = async (hotelId, hotelSource, stateId) => {
    if (!window.confirm('Are you sure you want to delete this hotel?')) {
      return;
    }

    try {
      // Map hotel sources to their respective API endpoints
      const apiEndpoints = {
        hotel: `https://hotel-booking-sigma-wine.vercel.app/api/hotel/${hotelId}`,
        world: `https://hotel-booking-sigma-wine.vercel.app/api/world/${hotelId}`,
        property: `https://hotel-booking-sigma-wine.vercel.app/api/property/${hotelId}`,
        india: stateId ? `https://hotel-booking-sigma-wine.vercel.app/api/india/${stateId}/hotels/${hotelId}` : null
      };

      const deleteUrl = apiEndpoints[hotelSource];
      
      if (!deleteUrl) {
        throw new Error(`Delete not supported for ${hotelSource} API`);
      }

      const response = await fetch(deleteUrl, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete hotel');
      }

      // Remove hotel from local state
      setHotels(hotels.filter(hotel => hotel.id !== hotelId));
      alert('Hotel deleted successfully!');
    } catch (err) {
      console.error('Error deleting hotel:', err);
      alert('Failed to delete hotel: ' + err.message);
    }
  };

  // Toggle hotel status function - UPDATED
  const handleToggleStatus = async (hotelId, currentStatus, hotelSource, stateId) => {
    try {
      const newStatus = currentStatus === "active" ? "inactive" : "active";
      
      // Map hotel sources to their respective API endpoints
      const apiEndpoints = {
        hotel: `https://hotel-booking-sigma-wine.vercel.app/api/hotel/${hotelId}`,
        world: `https://hotel-booking-sigma-wine.vercel.app/api/world/${hotelId}`,
        property: `https://hotel-booking-sigma-wine.vercel.app/api/property/${hotelId}`,
        india: stateId ? `https://hotel-booking-sigma-wine.vercel.app/api/india/${stateId}/hotels/${hotelId}/status` : null
      };

      const updateUrl = apiEndpoints[hotelSource];
      
      if (!updateUrl) {
        throw new Error(`Update not supported for ${hotelSource} API`);
      }

      const response = await fetch(updateUrl, {
        method: hotelSource === 'india' ? 'PATCH' : 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: hotelSource === 'india' ? undefined : JSON.stringify({ status: newStatus })
      });

      if (!response.ok) {
        throw new Error('Failed to update hotel status');
      }

      // Update hotel in local state
      setHotels(hotels.map(hotel => 
        hotel.id === hotelId 
          ? { ...hotel, status: newStatus }
          : hotel
      ));
      
      alert(`Hotel status updated to ${newStatus}!`);
    } catch (err) {
      console.error('Error updating hotel status:', err);
      alert('Failed to update hotel status: ' + err.message);
    }
  };

  // Edit hotel function - redirect to edit page
  const handleEditHotel = (hotelId, hotelSource) => {
    // You might want different edit pages for different sources
    if (hotelSource === 'india') {
      navigate(`/admin/edit-india-hotel/${hotelId}`);
    } else if (hotelSource === 'world') {
      navigate(`/admin/edit-world-hotel/${hotelId}`);
    } else if (hotelSource === 'property') {
      navigate(`/admin/edit-property-hotel/${hotelId}`);
    } else {
      navigate(`/admin/edit-hotel/${hotelId}`);
    }
  };

  // Get hotel status - default to active if no status field
  const getHotelStatus = (hotel) => {
    return hotel.status || "active";
  };

  // Check if hotel is active
  const isHotelActive = (hotel) => {
    return getHotelStatus(hotel) === "active";
  };

  // Calculate stats
  const totalHotels = hotels.length;
  const activeHotels = hotels.filter(hotel => isHotelActive(hotel)).length;
  const inactiveHotels = totalHotels - activeHotels;

  // Get API counts for stats
  const getApiCount = (apiName) => {
    return apiStats[apiName]?.count || 0;
  };

  // Get source badge color
  const getSourceBadgeColor = (source) => {
    switch (source) {
      case 'world': return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'hotel': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'property': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'india': return 'bg-green-100 text-green-800 border-green-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  // Clear all filters
  const clearFilters = () => {
    setSearchTerm('');
    setSelectedSource('all');
    setSelectedStatus('all');
    setSortBy('name');
  };

  // Error state
  if (error) {
    return (
      <div>
        <Navbar/>
        <div className="min-h-screen bg-gray-50 p-6">
          <div className="max-w-7xl mx-auto">
            <div className="text-center py-12">
              <div className="bg-red-50 border border-red-200 rounded-lg p-6 max-w-md mx-auto">
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
        </div>
      </div>
    );
  }

  return (
    <div>
      <Navbar/>
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900">List of Hotels</h1>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold text-gray-700">Total Hotels</h3>
              <p className="text-3xl font-bold text-blue-600 mt-2">{totalHotels}</p>
              <p className="text-xs text-gray-500 mt-1">From 4 APIs</p>
            </div>
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold text-gray-700">Active Hotels</h3>
              <p className="text-3xl font-bold text-green-600 mt-2">
                {activeHotels}
              </p>
              <p className="text-xs text-gray-500 mt-1">{totalHotels > 0 ? Math.round((activeHotels / totalHotels) * 100) : 0}% of total</p>
            </div>
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold text-gray-700">Inactive Hotels</h3>
              <p className="text-3xl font-bold text-red-600 mt-2">
                {inactiveHotels}
              </p>
              <p className="text-xs text-gray-500 mt-1">{totalHotels > 0 ? Math.round((inactiveHotels / totalHotels) * 100) : 0}% of total</p>
            </div>
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold text-gray-700">API Sources</h3>
              <p className="text-3xl font-bold text-purple-600 mt-2">4</p>
              <p className="text-xs text-gray-500 mt-1">Connected APIs</p>
            </div>
          </div>

          {/* Search and Filter Section */}
          <div className="bg-white rounded-lg shadow p-6 mb-6">
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
              {/* Search Input */}
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Search Hotels
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Search by name, location, state, country..."
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                  </div>
                </div>
              </div>

              {/* Source Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Source
                </label>
                <select
                  value={selectedSource}
                  onChange={(e) => setSelectedSource(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="all">All Sources</option>
                  <option value="world">World</option>
                  <option value="hotel">Hotel</option>
                  <option value="property">Property</option>
                  <option value="india">India</option>
                </select>
              </div>

              {/* Status Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Status
                </label>
                <select
                  value={selectedStatus}
                  onChange={(e) => setSelectedStatus(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="all">All Status</option>
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>

              {/* Sort By */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Sort By
                </label>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="name">Name</option>
                  <option value="price">Price (High to Low)</option>
                  <option value="rating">Rating (High to Low)</option>
                  <option value="source">Source</option>
                </select>
              </div>
            </div>

            {/* Filter Actions */}
            <div className="flex justify-between items-center mt-4">
              <div className="text-sm text-gray-600">
                Showing {filteredHotels.length} of {totalHotels} hotels
                {(searchTerm || selectedSource !== 'all' || selectedStatus !== 'all') && (
                  <span className="ml-2 text-blue-600">
                    (Filtered)
                  </span>
                )}
              </div>
              {(searchTerm || selectedSource !== 'all' || selectedStatus !== 'all') && (
                <button
                  onClick={clearFilters}
                  className="text-sm text-gray-600 hover:text-gray-800 flex items-center"
                >
                  <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                  Clear Filters
                </button>
              )}
            </div>
          </div>

          {/* Hotels Table */}
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200">
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-semibold text-gray-800">
                  All Hotels ({filteredHotels.length})
                  {totalHotels !== filteredHotels.length && ` of ${totalHotels}`}
                </h2>
                <Link 
                  to="/add"
                  className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md transition duration-200"
                >
                  Add New Hotel
                </Link>
              </div>
            </div>
            
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Hotel Name
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Location
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Source
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Price
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Rating
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredHotels.map((hotel) => {
                    const status = getHotelStatus(hotel);
                    const isActive = isHotelActive(hotel);
                    
                    return (
                      <tr key={hotel.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="flex-shrink-0 h-10 w-10">
                              <img 
                                className="h-10 w-10 rounded-lg object-cover" 
                                src={hotel.image_url || hotel.image || hotel.images?.[0] || hotel.thumbnail || "https://via.placeholder.com/40?text=H"} 
                                alt={hotel.name || hotel.hotelName || hotel.propertyName || hotel.title}
                                onError={(e) => {
                                  e.target.src = "https://via.placeholder.com/40?text=H";
                                }}
                              />
                            </div>
                            <div className="ml-4">
                              <div className="text-sm font-medium text-gray-900">
                                {hotel.name || hotel.hotelName || hotel.propertyName || hotel.title || 'Unnamed Hotel'}
                              </div>
                              {(hotel.stateName || hotel.countryName) && (
                                <div className="text-xs text-gray-500">
                                  {hotel.stateName && `${hotel.stateName}`}
                                  {hotel.countryName && `, ${hotel.countryName}`}
                                </div>
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-500 max-w-xs truncate">
                            {hotel.address || hotel.location || hotel.city || 'No address provided'}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getSourceBadgeColor(hotel.source)}`}>
                            {hotel.source}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">
                            ${hotel.price || hotel.price_per_night || hotel.starting_price || hotel.rate || hotel.cost || 'N/A'}
                            {(hotel.price || hotel.price_per_night || hotel.starting_price || hotel.rate || hotel.cost) && 
                              <span className="text-gray-500 text-xs ml-1">/night</span>
                            }
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900 flex items-center">
                            <span className="text-yellow-400 mr-1">⭐</span>
                            {hotel.rating || hotel.star_rating || hotel.review_rating || hotel.stars || 'N/A'}
                            {hotel.rating && <span className="text-gray-500 text-xs ml-1">/5</span>}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <button
                            onClick={() => handleToggleStatus(
                              hotel._id || hotel.id, 
                              status, 
                              hotel.source,
                              hotel.stateId // Add this for India hotels
                            )}
                            className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full transition-colors duration-200 cursor-pointer ${
                              isActive 
                                ? "bg-green-100 text-green-800 hover:bg-green-200 border border-green-200" 
                                : "bg-red-100 text-red-800 hover:bg-red-200 border border-red-200"
                            }`}
                            title={`Click to mark as ${isActive ? 'inactive' : 'active'}`}
                          >
                            {isActive ? (
                              <>
                                <span className="w-2 h-2 bg-green-500 rounded-full mr-1 mt-1"></span>
                                Active
                              </>
                            ) : (
                              <>
                                <span className="w-2 h-2 bg-red-500 rounded-full mr-1 mt-1"></span>
                                Inactive
                              </>
                            )}
                          </button>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <div className="flex space-x-2">
                            <button 
                              onClick={() => handleEditHotel(hotel._id || hotel.id, hotel.source)}
                              className="text-blue-600 hover:text-blue-900 bg-blue-50 hover:bg-blue-100 px-3 py-1 rounded-md transition duration-200 border border-blue-200"
                            >
                              Edit
                            </button>
                            <button 
                              onClick={() => handleDeleteHotel(
                                hotel._id || hotel.id, 
                                hotel.source,
                                hotel.stateId // Add this for India hotels
                              )}
                              className="text-red-600 hover:text-red-900 bg-red-50 hover:bg-red-100 px-3 py-1 rounded-md transition duration-200 border border-red-200"
                            >
                              Delete
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Empty State */}
            {filteredHotels.length === 0 && !loading && (
              <div className="text-center py-12">
                <div className="text-gray-400 text-6xl mb-4">🔍</div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  {hotels.length === 0 ? 'No hotels found' : 'No hotels match your filters'}
                </h3>
                <p className="text-gray-500 mb-4">
                  {hotels.length === 0 
                    ? 'No hotels were found from any of the APIs.' 
                    : 'Try adjusting your search criteria or clear filters.'
                  }
                </p>
                {hotels.length > 0 && (
                  <button
                    onClick={clearFilters}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-md transition duration-200 inline-block mr-2"
                  >
                    Clear Filters
                  </button>
                )}
                <button
                  onClick={fetchHotels}
                  className="bg-gray-600 hover:bg-gray-700 text-white px-6 py-2 rounded-md transition duration-200 inline-block"
                >
                  Refresh Hotels
                </button>
              </div>
            )}
          </div>

          {/* Refresh Button and Summary */}
          <div className="mt-6 flex justify-between items-center">
            <div className="text-sm text-gray-600">
              Showing {filteredHotels.length} hotel{filteredHotels.length !== 1 ? 's' : ''} from 4 API sources
              {Object.keys(apiStats).map(api => (
                <span key={api} className="ml-2">
                  {api}: {apiStats[api]?.count || 0}
                </span>
              ))}
            </div>
            <button
              onClick={fetchHotels}
              className="bg-gray-600 hover:bg-gray-700 text-white px-6 py-2 rounded-md transition duration-200 flex items-center"
            >
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              Refresh All Hotels
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Hotel;