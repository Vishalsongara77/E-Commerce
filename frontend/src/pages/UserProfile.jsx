import React, { useState, useEffect } from 'react';
import { FiUser, FiMail, FiPhone, FiMapPin, FiEdit2, FiSave, FiX } from 'react-icons/fi';
import { useAuth } from '../contexts/AuthContext';
import toast from 'react-hot-toast';

const UserProfile = () => {
  const { user, updateUserProfile } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [profileData, setProfileData] = useState({
    name: '',
    email: '',
    phone: '',
    address: {
      street: '',
      city: '',
      state: '',
      postalCode: '',
      country: ''
    }
  });

  useEffect(() => {
    if (user) {
      setProfileData({
        name: user.name || '',
        email: user.email || '',
        phone: user.phone || '',
        address: {
          street: user.address?.street || '',
          city: user.address?.city || '',
          state: user.address?.state || '',
          postalCode: user.address?.postalCode || '',
          country: user.address?.country || 'India'
        }
      });
    }
  }, [user]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    if (name.includes('.')) {
      const [parent, child] = name.split('.');
      setProfileData({
        ...profileData,
        [parent]: {
          ...profileData[parent],
          [child]: value
        }
      });
    } else {
      setProfileData({
        ...profileData,
        [name]: value
      });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      await updateUserProfile(profileData);
      toast.success('Profile updated successfully');
      setIsEditing(false);
    } catch (error) {
      console.error('Error updating profile:', error);
      toast.error('Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          {/* Header */}
          <div className="bg-amber-600 px-6 py-4">
            <div className="flex items-center justify-between">
              <h1 className="text-xl font-bold text-white">My Profile</h1>
              {!isEditing ? (
                <button
                  onClick={() => setIsEditing(true)}
                  className="flex items-center text-white bg-amber-700 hover:bg-amber-800 px-4 py-2 rounded-md text-sm font-medium"
                >
                  <FiEdit2 className="mr-2" />
                  Edit Profile
                </button>
              ) : (
                <div className="flex space-x-2">
                  <button
                    onClick={handleSubmit}
                    disabled={loading}
                    className="flex items-center text-white bg-green-600 hover:bg-green-700 px-4 py-2 rounded-md text-sm font-medium disabled:opacity-50"
                  >
                    <FiSave className="mr-2" />
                    Save
                  </button>
                  <button
                    onClick={() => setIsEditing(false)}
                    className="flex items-center text-white bg-gray-600 hover:bg-gray-700 px-4 py-2 rounded-md text-sm font-medium"
                  >
                    <FiX className="mr-2" />
                    Cancel
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Profile Content */}
          <div className="p-6">
            <form onSubmit={handleSubmit}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Personal Information */}
                <div className="md:col-span-2">
                  <h2 className="text-lg font-medium text-gray-900 mb-4">Personal Information</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Name */}
                    <div>
                      <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                        Full Name
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <FiUser className="text-gray-400" />
                        </div>
                        <input
                          type="text"
                          id="name"
                          name="name"
                          value={profileData.name}
                          onChange={handleInputChange}
                          disabled={!isEditing}
                          className={`pl-10 block w-full rounded-md ${
                            isEditing ? 'border-gray-300' : 'border-gray-200 bg-gray-50'
                          } focus:ring-amber-500 focus:border-amber-500`}
                        />
                      </div>
                    </div>

                    {/* Email */}
                    <div>
                      <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                        Email Address
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <FiMail className="text-gray-400" />
                        </div>
                        <input
                          type="email"
                          id="email"
                          name="email"
                          value={profileData.email}
                          onChange={handleInputChange}
                          disabled={true} // Email cannot be changed
                          className="pl-10 block w-full rounded-md border-gray-200 bg-gray-50 focus:ring-amber-500 focus:border-amber-500"
                        />
                      </div>
                      <p className="mt-1 text-xs text-gray-500">Email cannot be changed</p>
                    </div>

                    {/* Phone */}
                    <div>
                      <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
                        Phone Number
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <FiPhone className="text-gray-400" />
                        </div>
                        <input
                          type="tel"
                          id="phone"
                          name="phone"
                          value={profileData.phone}
                          onChange={handleInputChange}
                          disabled={!isEditing}
                          className={`pl-10 block w-full rounded-md ${
                            isEditing ? 'border-gray-300' : 'border-gray-200 bg-gray-50'
                          } focus:ring-amber-500 focus:border-amber-500`}
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Address Information */}
                <div className="md:col-span-2">
                  <h2 className="text-lg font-medium text-gray-900 mb-4">Address Information</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Street Address */}
                    <div className="md:col-span-2">
                      <label htmlFor="address.street" className="block text-sm font-medium text-gray-700 mb-1">
                        Street Address
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <FiMapPin className="text-gray-400" />
                        </div>
                        <input
                          type="text"
                          id="address.street"
                          name="address.street"
                          value={profileData.address.street}
                          onChange={handleInputChange}
                          disabled={!isEditing}
                          className={`pl-10 block w-full rounded-md ${
                            isEditing ? 'border-gray-300' : 'border-gray-200 bg-gray-50'
                          } focus:ring-amber-500 focus:border-amber-500`}
                        />
                      </div>
                    </div>

                    {/* City */}
                    <div>
                      <label htmlFor="address.city" className="block text-sm font-medium text-gray-700 mb-1">
                        City
                      </label>
                      <input
                        type="text"
                        id="address.city"
                        name="address.city"
                        value={profileData.address.city}
                        onChange={handleInputChange}
                        disabled={!isEditing}
                        className={`block w-full rounded-md ${
                          isEditing ? 'border-gray-300' : 'border-gray-200 bg-gray-50'
                        } focus:ring-amber-500 focus:border-amber-500`}
                      />
                    </div>

                    {/* State */}
                    <div>
                      <label htmlFor="address.state" className="block text-sm font-medium text-gray-700 mb-1">
                        State
                      </label>
                      <input
                        type="text"
                        id="address.state"
                        name="address.state"
                        value={profileData.address.state}
                        onChange={handleInputChange}
                        disabled={!isEditing}
                        className={`block w-full rounded-md ${
                          isEditing ? 'border-gray-300' : 'border-gray-200 bg-gray-50'
                        } focus:ring-amber-500 focus:border-amber-500`}
                      />
                    </div>

                    {/* Postal Code */}
                    <div>
                      <label htmlFor="address.postalCode" className="block text-sm font-medium text-gray-700 mb-1">
                        Postal Code
                      </label>
                      <input
                        type="text"
                        id="address.postalCode"
                        name="address.postalCode"
                        value={profileData.address.postalCode}
                        onChange={handleInputChange}
                        disabled={!isEditing}
                        className={`block w-full rounded-md ${
                          isEditing ? 'border-gray-300' : 'border-gray-200 bg-gray-50'
                        } focus:ring-amber-500 focus:border-amber-500`}
                      />
                    </div>

                    {/* Country */}
                    <div>
                      <label htmlFor="address.country" className="block text-sm font-medium text-gray-700 mb-1">
                        Country
                      </label>
                      <input
                        type="text"
                        id="address.country"
                        name="address.country"
                        value={profileData.address.country}
                        onChange={handleInputChange}
                        disabled={!isEditing}
                        className={`block w-full rounded-md ${
                          isEditing ? 'border-gray-300' : 'border-gray-200 bg-gray-50'
                        } focus:ring-amber-500 focus:border-amber-500`}
                      />
                    </div>
                  </div>
                </div>
              </div>

              {isEditing && (
                <div className="mt-8 text-right md:hidden">
                  <button
                    type="submit"
                    disabled={loading}
                    className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-amber-600 hover:bg-amber-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-500 disabled:opacity-50"
                  >
                    {loading ? 'Saving...' : 'Save Changes'}
                  </button>
                </div>
              )}
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserProfile;