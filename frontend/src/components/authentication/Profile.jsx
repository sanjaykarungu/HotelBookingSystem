import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';

const Profile = () => {
  const [user, setUser] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [formData, setFormData] = useState({
    name: '',
    gmail: '', // Changed from 'email' to 'gmail' to match API
    number: '', // Changed from 'phone' to 'number' to match API
    address: ''
  });
  const navigate = useNavigate();

  useEffect(() => {
    const currentUser = localStorage.getItem('currentUser');
    const authToken = localStorage.getItem('authToken');
    
    if (!currentUser || !authToken) {
      navigate('/login');
      return;
    }

    try {
      const userObj = JSON.parse(currentUser);
      setUser(userObj);
      setFormData({
        name: userObj.name || '',
        gmail: userObj.email || userObj.gmail || '', // Handle both field names
        number: userObj.phone || userObj.number || '',
        address: userObj.address || ''
      });
    } catch (error) {
      console.error('Error parsing user data:', error);
      navigate('/login');
    }
  }, [navigate]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    if (message.text) setMessage({ type: '', text: '' });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setMessage({ type: '', text: '' });

    try {
      const authToken = localStorage.getItem('authToken');
      const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');
      
      if (!authToken || !currentUser._id) {
        throw new Error('Authentication required');
      }

      // Prepare update data
      const updateData = {
        name: formData.name,
        gmail: formData.gmail,
        number: formData.number
        // Note: address is not in your API model, so we'll store it locally
      };

      console.log('🔄 Updating profile with data:', updateData);

      const response = await fetch(`http://localhost:3000/api/register/${currentUser._id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authToken}`
        },
        body: JSON.stringify(updateData)
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to update profile');
      }

      console.log('✅ Profile updated successfully:', data);

      // Update local storage with new data
      const updatedUser = {
        ...currentUser,
        name: data.data.name,
        email: data.data.gmail, // Keep email field for compatibility
        gmail: data.data.gmail,
        phone: data.data.number, // Keep phone field for compatibility
        number: data.data.number,
        address: formData.address // Store address locally since it's not in API
      };

      localStorage.setItem('currentUser', JSON.stringify(updatedUser));
      localStorage.setItem('userProfile', JSON.stringify(updatedUser));
      
      // Update registeredUsers array
      const registeredUsers = JSON.parse(localStorage.getItem('registeredUsers') || '[]');
      const userIndex = registeredUsers.findIndex(u => u.id === currentUser._id || u.email === currentUser.email);
      if (userIndex !== -1) {
        registeredUsers[userIndex] = {
          ...registeredUsers[userIndex],
          name: data.data.name,
          email: data.data.gmail,
          phone: data.data.number
        };
        localStorage.setItem('registeredUsers', JSON.stringify(registeredUsers));
      }

      setUser(updatedUser);
      setIsEditing(false);
      setMessage({ type: 'success', text: 'Profile updated successfully!' });
      
    } catch (error) {
      console.error('❌ Error updating profile:', error);
      setMessage({ type: 'error', text: error.message || 'Failed to update profile' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (!window.confirm('Are you sure you want to delete your account? This action cannot be undone.')) {
      return;
    }

    try {
      const authToken = localStorage.getItem('authToken');
      const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');
      
      if (!authToken || !currentUser._id) {
        throw new Error('Authentication required');
      }

      const response = await fetch(`https://hotel-booking-sigma-wine.vercel.app/api/register/${currentUser._id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${authToken}`
        }
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || 'Failed to delete account');
      }

      // Clear local storage and redirect
      localStorage.removeItem('currentUser');
      localStorage.removeItem('userProfile');
      localStorage.removeItem('authToken');
      localStorage.removeItem('isLoggedIn');
      
      // Remove from registeredUsers array
      const registeredUsers = JSON.parse(localStorage.getItem('registeredUsers') || '[]');
      const updatedUsers = registeredUsers.filter(u => u.id !== currentUser._id && u.email !== currentUser.email);
      localStorage.setItem('registeredUsers', JSON.stringify(updatedUsers));

      window.dispatchEvent(new Event('storage'));
      alert('Account deleted successfully');
      navigate('/');
      
    } catch (error) {
      console.error('❌ Error deleting account:', error);
      setMessage({ type: 'error', text: error.message || 'Failed to delete account' });
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('isLoggedIn');
    localStorage.removeItem('currentUser');
    window.dispatchEvent(new Event('storage'));
    navigate('/');
  };

  const getInitials = (name) => {
    return name ? name.split(' ').map(n => n[0]).join('').toUpperCase() : 'U';
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Message Alert */}
        {message.text && (
          <div className={`mb-6 p-4 rounded-lg ${
            message.type === 'success' 
              ? 'bg-green-100 border border-green-400 text-green-700' 
              : 'bg-red-100 border border-red-400 text-red-700'
          }`}>
            {message.text}
          </div>
        )}

        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
          {/* Profile Header */}
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 px-6 py-8 text-white">
            <div className="flex items-center space-x-6">
              <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center text-2xl font-bold">
                {getInitials(user.name)}
              </div>
              <div className="flex-1">
                <h1 className="text-3xl font-bold">{user.name}</h1>
                <p className="text-blue-100">{user.email || user.gmail}</p>
                <p className="text-sm text-blue-200">
                  Member since {new Date(user.joinDate || user.createdAt).toLocaleDateString()}
                </p>
              </div>
              <div className="space-x-2">
                <button
                  onClick={handleLogout}
                  className="bg-white/20 hover:bg-white/30 text-white px-4 py-2 rounded-lg transition-colors duration-200"
                >
                  Logout
                </button>
              </div>
            </div>
          </div>

          {/* Profile Content */}
          <div className="p-6">
            {!isEditing ? (
              // View Mode
              <div className="space-y-6">
                <div className="flex justify-between items-center">
                  <h2 className="text-2xl font-bold text-gray-800">Profile Information</h2>
                  <div className="space-x-2">
                    <button
                      onClick={() => setIsEditing(true)}
                      className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors duration-200"
                    >
                      Edit Profile
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <label className="block text-sm font-medium text-gray-600">Full Name</label>
                    <p className="mt-1 text-lg text-gray-900">{user.name}</p>
                  </div>
                  
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <label className="block text-sm font-medium text-gray-600">Email</label>
                    <p className="mt-1 text-lg text-gray-900">{user.email || user.gmail}</p>
                  </div>
                  
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <label className="block text-sm font-medium text-gray-600">Phone</label>
                    <p className="mt-1 text-lg text-gray-900">{user.phone || user.number || 'Not provided'}</p>
                  </div>
                  
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <label className="block text-sm font-medium text-gray-600">Address</label>
                    <p className="mt-1 text-lg text-gray-900">{user.address || 'Not provided'}</p>
                  </div>
                </div>

                <div className="bg-gray-50 p-4 rounded-lg">
                  <label className="block text-sm font-medium text-gray-600">Member Since</label>
                  <p className="mt-1 text-lg text-gray-900">
                    {new Date(user.joinDate || user.createdAt).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </p>
                </div>

                {/* Danger Zone */}
                <div className="border-t border-red-200 pt-6 mt-6">
                  <h3 className="text-lg font-semibold text-red-600 mb-4">Danger Zone</h3>
                  <button
                    onClick={handleDeleteAccount}
                    className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors duration-200"
                  >
                    Delete Account
                  </button>
                  <p className="text-sm text-gray-600 mt-2">
                    Once you delete your account, there is no going back. Please be certain.
                  </p>
                </div>
              </div>
            ) : (
              // Edit Mode
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="flex justify-between items-center">
                  <h2 className="text-2xl font-bold text-gray-800">Edit Profile</h2>
                  <div className="space-x-2">
                    <button
                      type="button"
                      onClick={() => setIsEditing(false)}
                      className="bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600 transition-colors duration-200"
                      disabled={isSubmitting}
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors duration-200 disabled:opacity-50"
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? 'Saving...' : 'Save Changes'}
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Full Name *</label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Email *</label>
                    <input
                      type="email"
                      name="gmail"
                      value={formData.gmail}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Phone</label>
                    <input
                      type="tel"
                      name="number"
                      value={formData.number}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Enter your phone number"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Address</label>
                    <input
                      type="text"
                      name="address"
                      value={formData.address}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Enter your address"
                    />
                  </div>
                </div>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;