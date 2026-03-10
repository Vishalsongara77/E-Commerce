import { useState, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { FiUser, FiLogOut, FiShoppingBag, FiMessageCircle } from 'react-icons/fi'
import { useAuth } from '../contexts/AuthContext'
import PopUp from './PopUp'

const Avatar = () => {
  let user, logout
  
  try {
    const auth = useAuth()
    user = auth.user
    logout = auth.logout
  } catch (error) {
    // Handle case when AuthContext is not available
    user = null
    logout = () => {}
  }
  
  const navigate = useNavigate()
  const [isOpen, setIsOpen] = useState(false)
  const avatarRef = useRef(null)

  // Close pop-up when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (avatarRef.current && !avatarRef.current.contains(event.target)) {
        setIsOpen(false)
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside)
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isOpen])

  const handleLogout = () => {
    logout()
    setIsOpen(false)
    navigate('/')
  }

  const getDashboardLink = () => {
    if (!user) return '/'
    switch (user.role) {
      case 'admin':
        return '/admin/dashboard'
      case 'seller':
        return '/seller/dashboard'
      case 'artisan':
        return '/artisan/dashboard'
      case 'buyer':
        return '/buyer/dashboard'
      default:
        return '/'
    }
  }

  const avatarUrl = user?.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.name || 'User')}&background=f59e0b&color=fff&size=128`

  return (
    <div className="relative" ref={avatarRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center space-x-2 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:ring-offset-2 rounded-full"
      >
        {user?.avatar ? (
          <img
            src={avatarUrl}
            alt={user.name}
            className="w-10 h-10 rounded-full border-2 border-amber-600 hover:border-amber-700 transition-colors object-cover cursor-pointer"
          />
        ) : (
          <div className="w-10 h-10 rounded-full bg-amber-600 flex items-center justify-center text-white font-semibold hover:bg-amber-700 transition-colors cursor-pointer">
            {user?.name?.charAt(0).toUpperCase() || 'U'}
          </div>
        )}
        <span className="hidden md:block text-gray-700 font-medium">{user?.name}</span>
      </button>

      {isOpen && (
        <PopUp className="absolute right-0 mt-2 w-56 z-50">
          <div className="bg-white rounded-lg shadow-lg overflow-hidden">
            {/* User Info Section */}
            <div className="px-4 py-3 border-b border-gray-200 bg-gray-50">
              <div className="flex items-center space-x-3">
                {user?.avatar ? (
                  <img
                    src={avatarUrl}
                    alt={user.name}
                    className="w-10 h-10 rounded-full border border-gray-300 object-cover"
                  />
                ) : (
                  <div className="w-10 h-10 rounded-full bg-amber-600 flex items-center justify-center text-white font-semibold">
                    {user?.name?.charAt(0).toUpperCase() || 'U'}
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">{user?.name}</p>
                  <p className="text-xs text-gray-500 truncate">{user?.email}</p>
                </div>
              </div>
              <p className="mt-2 text-xs font-medium text-amber-600 capitalize">{user?.role}</p>
            </div>

            {/* Menu Items */}
            <div className="py-1">
              <button
                onClick={() => {
                  navigate(getDashboardLink())
                  setIsOpen(false)
                }}
                className="w-full flex items-center space-x-3 px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100 transition-colors"
              >
                <FiShoppingBag className="w-5 h-5" />
                <span>Orders</span>
              </button>

              <button
                onClick={() => {
                  navigate(getDashboardLink())
                  setIsOpen(false)
                }}
                className="w-full flex items-center space-x-3 px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100 transition-colors"
              >
                <FiMessageCircle className="w-5 h-5" />
                <span>Messages</span>
              </button>

              <button
                onClick={() => {
                  navigate('/profile')
                  setIsOpen(false)
                }}
                className="w-full flex items-center space-x-3 px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100 transition-colors"
              >
                <FiUser className="w-5 h-5" />
                <span>Profile</span>
              </button>
            </div>

            {/* Logout */}
            <div className="border-t border-gray-200">
              <button
                onClick={handleLogout}
                className="w-full flex items-center space-x-3 px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 transition-colors"
              >
                <FiLogOut className="w-5 h-5" />
                <span>Logout</span>
              </button>
            </div>
          </div>
        </PopUp>
      )}
    </div>
  )
}

export default Avatar