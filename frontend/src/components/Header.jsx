import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { FiMenu, FiX, FiShoppingCart, FiUser, FiLogOut, FiHeart, FiSettings, FiShoppingBag } from 'react-icons/fi'
import { useAuth } from '../contexts/AuthContext'
import { useCart } from '../contexts/CartContext'
import Avatar from './Avatar'

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  let user, isAuthenticated, logout
  
  try {
    const auth = useAuth()
    user = auth.user
    isAuthenticated = auth.isAuthenticated
    logout = auth.logout
  } catch (error) {
    // Handle case when AuthContext is not available
    user = null
    isAuthenticated = false
    logout = () => {}
  }
  
  // Get cart information
  const { totalItems } = useCart()
  
  const navigate = useNavigate()

  const isAdmin = user?.role === 'admin'
  const isSeller = user?.role === 'seller'

  const navigationLinks = (isAdmin || isSeller)
    ? []
    : [
        { to: '/products', label: 'Products' },
        { to: '/about', label: 'About' },
        { to: '/contact', label: 'Contact' }
      ]

  const handleLogout = () => {
    logout()
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

  return (
    <header className="bg-white/80 backdrop-blur-md sticky top-0 z-50 shadow-sm border-b border-sand-200">
      <div className="container-max">
        <div className="flex justify-between items-center h-20">
          {/* Logo */}
          <Link
            to={
              isAdmin
                ? '/admin/dashboard'
                : isSeller
                ? '/seller/dashboard'
                : '/'
            }
            className="flex items-center gap-2 group"
          >
            <div className="w-10 h-10 bg-terracotta rounded-lg flex items-center justify-center text-white font-serif text-2xl group-hover:rotate-6 transition-transform">
              T
            </div>
            <span className="text-2xl font-display font-bold text-forest tracking-tight">
              Tribal <span className="text-terracotta">Marketplace</span>
            </span>
          </Link>

          {/* Desktop Navigation */}
          {!isAdmin && !isSeller && (
            <nav className="hidden md:flex items-center space-x-10">
              {navigationLinks.map((link) => (
                <Link
                  key={link.to}
                  to={link.to}
                  className="text-sm font-medium text-gray-700 hover:text-terracotta transition-colors relative group"
                >
                  {link.label}
                  <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-terracotta transition-all group-hover:w-full"></span>
                </Link>
              ))}
            </nav>
          )}

          {/* User Actions */}
          <div className="flex items-center space-x-2">
            {/* Profile shortcut */}
            <button
              className="p-2 text-gray-600 hover:text-terracotta transition-colors"
              onClick={() => {
                if (isAuthenticated && !isAdmin) {
                  navigate('/profile')
                } else if (!isAuthenticated) {
                  navigate('/login')
                }
              }}
              title={isAuthenticated ? 'Profile' : 'Login'}
            >
              <FiUser className="w-5 h-5" />
            </button>

            {/* Cart Icon (hidden for admin and seller) */}
            {!isAdmin && !isSeller && (
              <Link
                to="/cart"
                className="relative p-2 text-gray-600 hover:text-terracotta transition-colors"
                aria-label="Shopping Cart"
              >
                <FiShoppingCart className="w-5 h-5" />
                {totalItems > 0 && (
                  <span className="absolute top-1 right-1 bg-terracotta text-white text-[10px] rounded-full h-4 w-4 flex items-center justify-center font-bold">
                    {totalItems > 99 ? '99+' : totalItems}
                  </span>
                )}
              </Link>
            )}
            
            <div className="h-6 w-px bg-sand-300 mx-2 hidden sm:block"></div>

            {isAuthenticated ? (
              <div className="flex items-center space-x-1">
                {/* Dashboard / Profile */}
                <Link
                  to={getDashboardLink()}
                  className="flex items-center space-x-2 px-3 py-1.5 rounded-full bg-sand-50 border border-sand-200 hover:bg-sand-100 transition-colors"
                >
                  <div className="w-6 h-6 rounded-full bg-forest text-white text-[10px] flex items-center justify-center font-bold uppercase">
                    {user?.name?.charAt(0)}
                  </div>
                  <span className="hidden sm:block text-xs font-semibold text-forest">{user?.name?.split(' ')[0]}</span>
                </Link>
                
                {/* Logout */}
                <button
                  onClick={handleLogout}
                  className="p-2 text-gray-400 hover:text-red-600 transition-colors"
                  title="Logout"
                >
                  <FiLogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className="flex items-center space-x-4">
                <Link
                  to="/login"
                  className="text-sm font-semibold text-forest hover:text-terracotta transition-colors"
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  className="btn btn-primary px-5 py-2 text-sm"
                >
                  Join Us
                </Link>
              </div>
            )}

            {/* Mobile menu button (hidden for admin/seller since there are no public links) */}
            {!isAdmin && !isSeller && (
              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="md:hidden p-2 rounded-md text-gray-600 hover:text-terracotta"
              >
                {isMenuOpen ? <FiX className="w-6 h-6" /> : <FiMenu className="w-6 h-6" />}
              </button>
            )}
          </div>
        </div>

        {/* Mobile Navigation (not shown for admin) */}
        {!isAdmin && isMenuOpen && (
          <div className="md:hidden py-6 bg-white border-t border-sand-100 animate-in fade-in slide-in-from-top-4 duration-300">
            <div className="flex flex-col space-y-4">
              {navigationLinks.map((link) => (
                <Link
                  key={link.to}
                  to={link.to}
                  className="text-lg font-serif font-medium text-gray-900 px-4 hover:text-terracotta"
                  onClick={() => setIsMenuOpen(false)}
                >
                  {link.label}
                </Link>
              ))}
              {!isAuthenticated && (
                <div className="pt-4 border-t border-sand-100 flex flex-col space-y-3 px-4">
                  <Link to="/login" className="text-center font-semibold text-forest py-2">Login</Link>
                  <Link to="/register" className="btn btn-primary w-full py-3">Join Us</Link>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </header>
  )
}

export default Header