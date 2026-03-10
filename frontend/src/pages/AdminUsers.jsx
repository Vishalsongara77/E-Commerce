import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FiUsers, FiSearch, FiFilter, FiUserCheck, FiUserX,
  FiEdit, FiEye, FiMail, FiPhone, FiMapPin, FiCalendar,
  FiCheck, FiX, FiAlertCircle
} from 'react-icons/fi';
import { useAuth } from '../contexts/AuthContext';
import { adminAPI } from '../services/api';
import toast from 'react-hot-toast';

const AdminUsers = () => {
  const { user } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRole, setFilterRole] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [showUserModal, setShowUserModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);

  useEffect(() => {
    fetchUsers();
  }, [currentPage, filterRole, filterStatus]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const params = {};
      if (filterRole) params.role = filterRole;
      if (filterStatus) {
        if (filterStatus === 'verified') params.verified = true;
        if (filterStatus === 'unverified') params.verified = false;
      }

      const response = await adminAPI.getUsers({
        page: currentPage,
        limit: 10,
        ...params
      });

      setUsers(response.data.users || response.data || []);
      setTotalPages(response.data.pagination?.totalPages || 1);
    } catch (error) {
      console.error('Error fetching users:', error);
      toast.error('Failed to fetch users');
      setUsers([]);
    } finally {
      setLoading(false);
    }
  };

  const handleApproveSeller = async (userId) => {
    try {
      await adminAPI.updateUserStatus(userId, 'approved');
      toast.success('Seller approved successfully');
      fetchUsers();
    } catch (error) {
      console.error('Error approving seller:', error);
      toast.error('Failed to approve seller');
    }
  };

  const handleRejectSeller = async (userId) => {
    if (window.confirm('Are you sure you want to reject this seller application? This will deactivate their account.')) {
      try {
        await adminAPI.updateUserStatus(userId, 'rejected');
        toast.success('Seller rejected and account deactivated');
        fetchUsers();
      } catch (error) {
        console.error('Error rejecting seller:', error);
        toast.error('Failed to reject seller');
      }
    }
  };

  const handleUpdateRole = async (userId, newRole) => {
    try {
      await adminAPI.updateUserRole(userId, newRole);
      toast.success('User role updated successfully');
      fetchUsers();
    } catch (error) {
      console.error('Error updating role:', error);
      toast.error('Failed to update user role');
    }
  };

  const handleDeleteUser = async (userId, userEmail) => {
    if (!userId) return;
    if (!window.confirm(`Are you sure you want to delete user "${userEmail}"? This action cannot be undone.`)) {
      return;
    }
    try {
      await adminAPI.deleteUser(userId);
      toast.success('User deleted successfully');
      fetchUsers();
    } catch (error) {
      console.error('Error deleting user:', error);
      toast.error(error.response?.data?.message || 'Failed to delete user');
    }
  };

  const handleViewUser = (user) => {
    setSelectedUser(user);
    setShowUserModal(true);
  };

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.email.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesSearch;
  });

  if (!user || user.role !== 'admin') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Access Denied</h1>
          <p className="text-gray-600">You need admin privileges to access this page.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">User Management</h1>
          <p className="text-gray-600">Manage users, approve sellers, and oversee account roles</p>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="flex flex-col md:flex-row md:items-center space-y-4 md:space-y-0 md:space-x-4">
            <div className="flex-1">
              <div className="relative">
                <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search by name or email..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                />
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <FiFilter className="text-gray-400" />
                <select
                  value={filterRole}
                  onChange={(e) => setFilterRole(e.target.value)}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                >
                  <option value="">All Roles</option>
                  <option value="buyer">Buyers</option>
                  <option value="seller">Sellers</option>
                  <option value="admin">Admins</option>
                </select>
              </div>
              <div className="flex items-center space-x-2">
                <FiFilter className="text-gray-400" />
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                >
                  <option value="">All Status</option>
                  <option value="verified">Verified Sellers</option>
                  <option value="unverified">Unverified Sellers</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Users Table */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          {loading ? (
            <div className="flex items-center justify-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-600"></div>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        User
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Role
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Joined
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredUsers.map((user) => (
                      <tr key={user._id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="flex-shrink-0 h-10 w-10">
                              <div className="h-10 w-10 rounded-full bg-amber-500 flex items-center justify-center">
                                <span className="text-white font-medium">
                                  {user.name.charAt(0).toUpperCase()}
                                </span>
                              </div>
                            </div>
                            <div className="ml-4">
                              <div className="text-sm font-medium text-gray-900">{user.name}</div>
                              <div className="text-sm text-gray-500">{user.email}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <select
                            value={user.role}
                            onChange={(e) => handleUpdateRole(user._id, e.target.value)}
                            className="text-sm border border-gray-300 rounded px-2 py-1 focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                          >
                            <option value="buyer">Buyer</option>
                            <option value="seller">Seller</option>
                            <option value="admin">Admin</option>
                          </select>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center space-x-2">
                            {user.role === 'seller' ? (
                              user.sellerInfo?.verified ? (
                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                  <FiCheck className="w-3 h-3 mr-1" />
                                  Verified
                                </span>
                              ) : (
                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                                  <FiAlertCircle className="w-3 h-3 mr-1" />
                                  Pending
                                </span>
                              )
                            ) : (
                              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                Active
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {new Date(user.createdAt).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <div className="flex items-center justify-end space-x-2">
                            <button
                              onClick={() => handleViewUser(user)}
                              className="text-blue-600 hover:text-blue-900 p-1"
                              title="View Details"
                            >
                              <FiEye className="w-4 h-4" />
                            </button>
                            {user.role === 'seller' && !user.sellerInfo?.verified && (
                              <>
                                <button
                                  onClick={() => handleApproveSeller(user._id)}
                                  className="text-green-600 hover:text-green-900 p-1"
                                  title="Approve Seller"
                                >
                                  <FiUserCheck className="w-4 h-4" />
                                </button>
                                <button
                                  onClick={() => handleRejectSeller(user._id)}
                                  className="text-red-600 hover:text-red-900 p-1"
                                  title="Reject Seller"
                                >
                                  <FiUserX className="w-4 h-4" />
                                </button>
                              </>
                            )}
                            {user.role !== 'admin' && (
                              <button
                                onClick={() => handleDeleteUser(user._id, user.email)}
                                className="text-red-600 hover:text-red-900 p-1"
                                title="Delete User"
                              >
                                <FiUserX className="w-4 h-4" />
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
                  <div className="flex-1 flex justify-between sm:hidden">
                    <button
                      onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                      disabled={currentPage === 1}
                      className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
                    >
                      Previous
                    </button>
                    <button
                      onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                      disabled={currentPage === totalPages}
                      className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
                    >
                      Next
                    </button>
                  </div>
                  <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                    <div>
                      <p className="text-sm text-gray-700">
                        Showing page <span className="font-medium">{currentPage}</span> of{' '}
                        <span className="font-medium">{totalPages}</span>
                      </p>
                    </div>
                    <div>
                      <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
                        <button
                          onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                          disabled={currentPage === 1}
                          className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
                        >
                          Previous
                        </button>
                        {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                          const page = Math.max(1, currentPage - 2) + i;
                          if (page > totalPages) return null;
                          return (
                            <button
                              key={page}
                              onClick={() => setCurrentPage(page)}
                              className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                                page === currentPage
                                  ? 'z-10 bg-amber-50 border-amber-500 text-amber-600'
                                  : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                              }`}
                            >
                              {page}
                            </button>
                          );
                        })}
                        <button
                          onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                          disabled={currentPage === totalPages}
                          className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
                        >
                          Next
                        </button>
                      </nav>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        {filteredUsers.length === 0 && !loading && (
          <div className="text-center py-12">
            <FiUsers className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No users found</h3>
            <p className="text-gray-600">Try adjusting your search or filter criteria.</p>
          </div>
        )}

        {/* User Details Modal */}
        <AnimatePresence>
          {showUserModal && selectedUser && (
            <>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 bg-black bg-opacity-50 z-40"
                onClick={() => setShowUserModal(false)}
              />
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="fixed inset-0 z-50 flex items-center justify-center p-4"
              >
                <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                  <div className="p-6">
                    <div className="flex items-center justify-between mb-6">
                      <h2 className="text-2xl font-bold text-gray-900">User Details</h2>
                      <button
                        onClick={() => setShowUserModal(false)}
                        className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                      >
                        <FiX className="w-6 h-6" />
                      </button>
                    </div>

                    <div className="space-y-6">
                      {/* Basic Info */}
                      <div className="flex items-center space-x-4">
                        <div className="h-16 w-16 rounded-full bg-amber-500 flex items-center justify-center">
                          <span className="text-white text-xl font-medium">
                            {selectedUser.name.charAt(0).toUpperCase()}
                          </span>
                        </div>
                        <div>
                          <h3 className="text-xl font-semibold text-gray-900">{selectedUser.name}</h3>
                          <p className="text-gray-600">{selectedUser.email}</p>
                          <div className="flex items-center space-x-2 mt-1">
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                              selectedUser.role === 'admin' ? 'bg-purple-100 text-purple-800' :
                              selectedUser.role === 'seller' ? 'bg-green-100 text-green-800' :
                              'bg-blue-100 text-blue-800'
                            }`}>
                              {selectedUser.role.charAt(0).toUpperCase() + selectedUser.role.slice(1)}
                            </span>
                            {selectedUser.role === 'seller' && (
                              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                selectedUser.sellerInfo?.verified ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                              }`}>
                                {selectedUser.sellerInfo?.verified ? 'Verified' : 'Unverified'}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Contact Info */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="flex items-center space-x-2">
                          <FiMail className="w-5 h-5 text-gray-400" />
                          <span className="text-gray-900">{selectedUser.email}</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <FiPhone className="w-5 h-5 text-gray-400" />
                          <span className="text-gray-900">{selectedUser.phone}</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <FiCalendar className="w-5 h-5 text-gray-400" />
                          <span className="text-gray-900">
                            Joined {new Date(selectedUser.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <FiCalendar className="w-5 h-5 text-gray-400" />
                          <span className="text-gray-900">
                            Last Login: {selectedUser.lastLogin ? new Date(selectedUser.lastLogin).toLocaleDateString() : 'Never'}
                          </span>
                        </div>
                      </div>

                      {/* Address */}
                      {selectedUser.address && (
                        <div>
                          <h4 className="text-lg font-medium text-gray-900 mb-2">Address</h4>
                          <div className="flex items-start space-x-2">
                            <FiMapPin className="w-5 h-5 text-gray-400 mt-0.5" />
                            <div className="text-gray-900">
                              {selectedUser.address.street && <div>{selectedUser.address.street}</div>}
                              {selectedUser.address.city && <div>{selectedUser.address.city}</div>}
                              {selectedUser.address.state && <div>{selectedUser.address.state}</div>}
                              {selectedUser.address.pincode && <div>{selectedUser.address.pincode}</div>}
                              {selectedUser.address.country && <div>{selectedUser.address.country}</div>}
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Seller Info */}
                      {selectedUser.role === 'seller' && selectedUser.sellerInfo && (
                        <div>
                          <h4 className="text-lg font-medium text-gray-900 mb-2">Seller Information</h4>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                              <span className="text-sm font-medium text-gray-500">Business Name</span>
                              <p className="text-gray-900">{selectedUser.sellerInfo.businessName || 'Not provided'}</p>
                            </div>
                            <div>
                              <span className="text-sm font-medium text-gray-500">Tribe</span>
                              <p className="text-gray-900">{selectedUser.sellerInfo.tribe || 'Not provided'}</p>
                            </div>
                            <div>
                              <span className="text-sm font-medium text-gray-500">Region</span>
                              <p className="text-gray-900">{selectedUser.sellerInfo.region || 'Not provided'}</p>
                            </div>
                            <div>
                              <span className="text-sm font-medium text-gray-500">Verification Status</span>
                              <p className={`font-medium ${selectedUser.sellerInfo.verified ? 'text-green-600' : 'text-yellow-600'}`}>
                                {selectedUser.sellerInfo.verified ? 'Verified' : 'Pending Verification'}
                              </p>
                            </div>
                          </div>
                          {selectedUser.sellerInfo.description && (
                            <div className="mt-4">
                              <span className="text-sm font-medium text-gray-500">Description</span>
                              <p className="text-gray-900 mt-1">{selectedUser.sellerInfo.description}</p>
                            </div>
                          )}
                        </div>
                      )}

                      {/* Wishlist for buyers */}
                      {selectedUser.role === 'buyer' && selectedUser.wishlist && selectedUser.wishlist.length > 0 && (
                        <div>
                          <h4 className="text-lg font-medium text-gray-900 mb-2">Wishlist Items</h4>
                          <p className="text-gray-600">{selectedUser.wishlist.length} items in wishlist</p>
                        </div>
                      )}
                    </div>

                    <div className="flex justify-end mt-6 pt-6 border-t">
                      <button
                        onClick={() => setShowUserModal(false)}
                        className="px-6 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
                      >
                        Close
                      </button>
                    </div>
                  </div>
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default AdminUsers;
