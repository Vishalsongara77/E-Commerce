import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { FiMail, FiLock, FiEye, FiEyeOff } from 'react-icons/fi'
import { useAuth } from '../contexts/AuthContext'
import { GoogleLogin } from '@react-oauth/google'
import toast from 'react-hot-toast'
import { authAPI } from '../services/api'

const Login = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  })
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')
  const [pendingGoogleCredential, setPendingGoogleCredential] = useState(null)
  const [showGoogleRoleModal, setShowGoogleRoleModal] = useState(false)
  
  const auth = useAuth()
  const { login } = auth
  const navigate = useNavigate()

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setErrorMessage('')
    
    try {
      const result = await login(formData)
      
      if (result?.success) {
        const role = result.user?.role || localStorage.getItem('userRole')
        if (role === 'admin') {
          navigate('/admin/dashboard', { replace: true })
        } else if (role === 'seller') {
          navigate('/seller/dashboard', { replace: true })
        } else if (role === 'buyer') {
          // Buyers land on the home page after login
          navigate('/', { replace: true })
        } else if (role === 'artisan') {
          navigate('/artisan/dashboard', { replace: true })
        } else {
          navigate('/', { replace: true })
        }
      } else if (result?.message) {
        setErrorMessage(result.message)
        toast.error(result.message)
      }
    } catch (error) {
      console.error('Login error:', error)
      const message = error?.response?.data?.message || 'Failed to login. Please check your credentials.'
      setErrorMessage(message)
      toast.error(message)
    } finally {
      setLoading(false)
    }
  }

  const finalizeGoogleLogin = async (selectedRole) => {
    if (!pendingGoogleCredential) {
      toast.error('Google credential missing. Please try again.')
      setShowGoogleRoleModal(false)
      return
    }
    try {
      setLoading(true)
      const res = await authAPI.googleLogin(pendingGoogleCredential, selectedRole)
      const { token, user } = res.data || {}
      if (!token || !user) {
        throw new Error('Invalid Google login response')
      }
      localStorage.setItem('token', token)
      localStorage.setItem('userRole', user.role)
      toast.success(`Welcome, ${user.name}!`)

      // Force full reload so contexts rehydrate from token
      if (user.role === 'admin') {
        window.location.href = '/admin/dashboard'
      } else if (user.role === 'seller') {
        window.location.href = '/seller/dashboard'
      } else {
        window.location.href = '/buyer/dashboard'
      }
    } catch (e) {
      toast.error(e.response?.data?.message || 'Google login failed')
      setLoading(false)
      setShowGoogleRoleModal(false)
      setPendingGoogleCredential(null)
    }
  }

  return (
    <div className="min-h-screen bg-offwhite flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Decorative Elements */}
      <div className="absolute top-0 left-0 w-96 h-96 bg-sand-100 rounded-full -translate-x-1/2 -translate-y-1/2 blur-3xl opacity-50"></div>
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-terracotta/5 rounded-full translate-x-1/2 translate-y-1/2 blur-3xl opacity-50"></div>

      <div className="max-w-md w-full relative z-10">
        <div className="bg-white rounded-3xl shadow-xl shadow-sand-200/50 border border-sand-100 p-10">
          <div className="text-center mb-10">
            <Link to="/" className="inline-flex items-center gap-2 group mb-6">
              <div className="w-12 h-12 bg-terracotta rounded-xl flex items-center justify-center text-white font-serif text-3xl group-hover:rotate-6 transition-transform">
                T
              </div>
              <span className="text-3xl font-display font-bold text-forest tracking-tight">
                Tribal <span className="text-terracotta">Marketplace</span>
              </span>
            </Link>
            <h2 className="text-2xl font-serif font-bold text-forest">Welcome Back</h2>
            <p className="text-gray-500 mt-2">
              Join the journey of preserving traditions
            </p>
          </div>
          
          <form className="space-y-6" onSubmit={handleSubmit}>
            {errorMessage && (
              <div className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-700">
                {errorMessage}
              </div>
            )}
            <div className="space-y-5">
              <div>
                <label htmlFor="email" className="block text-sm font-bold text-forest mb-2 ml-1">
                  Email Address
                </label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400 group-focus-within:text-terracotta transition-colors">
                    <FiMail className="h-5 w-5" />
                  </div>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    required
                    className="block w-full pl-12 pr-4 py-3.5 bg-sand-50 border border-sand-100 text-forest placeholder:text-gray-400 rounded-2xl focus:outline-none focus:ring-2 focus:ring-terracotta/10 focus:border-terracotta transition-all text-sm"
                    placeholder="name@example.com"
                    value={formData.email}
                    onChange={handleChange}
                  />
                </div>
              </div>
              
              <div>
                <div className="flex justify-between items-center mb-2 ml-1">
                  <label htmlFor="password" className="text-sm font-bold text-forest">
                    Password
                  </label>
                  <Link to="/forgot-password" title="Forgot Password" className="text-xs font-semibold text-terracotta hover:underline">
                    Forgot?
                  </Link>
                </div>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400 group-focus-within:text-terracotta transition-colors">
                    <FiLock className="h-5 w-5" />
                  </div>
                  <input
                    id="password"
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    autoComplete="current-password"
                    required
                    className="block w-full pl-12 pr-12 py-3.5 bg-sand-50 border border-sand-100 text-forest placeholder:text-gray-400 rounded-2xl focus:outline-none focus:ring-2 focus:ring-terracotta/10 focus:border-terracotta transition-all text-sm"
                    placeholder="••••••••"
                    value={formData.password}
                    onChange={handleChange}
                  />
                  <button
                    type="button"
                    className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 hover:text-forest transition-colors"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <FiEyeOff className="h-5 w-5" />
                    ) : (
                      <FiEye className="h-5 w-5" />
                    )}
                  </button>
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full btn btn-primary py-4 text-base font-bold shadow-lg shadow-terracotta/20 disabled:opacity-50 disabled:shadow-none"
            >
              {loading ? (
                <div className="flex items-center justify-center gap-2">
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  <span>Signing in...</span>
                </div>
              ) : 'Sign In'}
            </button>

            {/* Google Login */}
            <div className="pt-2">
              <div className="flex items-center gap-3 my-2">
                <div className="h-px bg-sand-100 flex-1" />
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">or</span>
                <div className="h-px bg-sand-100 flex-1" />
              </div>
              <div className="flex justify-center">
                <GoogleLogin
                  onSuccess={async (credentialResponse) => {
                    try {
                      if (!credentialResponse?.credential) {
                        throw new Error('Missing Google credential')
                      }
                      const credential = credentialResponse.credential
                      setLoading(true)
                      // First try auto-login; backend will detect existing user vs new
                      try {
                        const res = await authAPI.googleLogin(credential, 'auto')
                        const { token, user } = res.data || {}
                        if (res.data?.success && token && user) {
                          localStorage.setItem('token', token)
                          localStorage.setItem('userRole', user.role)
                          toast.success(`Welcome, ${user.name}!`)
                          if (user.role === 'admin') {
                            window.location.href = '/admin/dashboard'
                          } else if (user.role === 'seller') {
                            window.location.href = '/seller/dashboard'
                          } else {
                            window.location.href = '/buyer/dashboard'
                          }
                          return
                        }
                        if (res.data?.needsRoleSelection) {
                          setPendingGoogleCredential(credential)
                          setShowGoogleRoleModal(true)
                        } else {
                          toast.error(res.data?.message || 'Google login failed')
                        }
                      } catch (err) {
                        if (err?.response?.data?.needsRoleSelection) {
                          setPendingGoogleCredential(credential)
                          setShowGoogleRoleModal(true)
                        } else {
                          toast.error(err?.response?.data?.message || 'Google login failed')
                        }
                      } finally {
                        setLoading(false)
                      }
                    } catch (e) {
                      toast.error(e.response?.data?.message || 'Google login failed')
                    }
                  }}
                  onError={() => {
                    toast.error('Google login failed')
                  }}
                />
              </div>
              {!import.meta.env.VITE_GOOGLE_CLIENT_ID && (
                <p className="text-[11px] text-center text-gray-400 mt-2">
                  Google login is not configured. Set <code>VITE_GOOGLE_CLIENT_ID</code> in <code>frontend/.env</code>.
                </p>
              )}
            </div>

            <p className="text-center text-sm text-gray-500">
              New to Tribal Roots?{' '}
              <Link
                to="/register"
                className="font-bold text-terracotta hover:underline"
              >
                Create an account
              </Link>
            </p>


          </form>
        </div>
      </div>

      {/* Google role selection modal */}
      {showGoogleRoleModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/40"
            onClick={() => {
              if (!loading) {
                setShowGoogleRoleModal(false)
                setPendingGoogleCredential(null)
              }
            }}
          />
          <div className="relative bg-white w-full max-w-sm rounded-2xl shadow-xl p-6">
            <h3 className="text-xl font-bold text-gray-900">Continue as</h3>
            <p className="text-sm text-gray-600 mt-1">
              Choose your account type for this marketplace.
            </p>
            <div className="mt-6 grid grid-cols-1 gap-3">
              <button
                disabled={loading}
                onClick={() => finalizeGoogleLogin('buyer')}
                className="w-full px-4 py-3 rounded-xl bg-amber-600 text-white font-semibold hover:bg-amber-700 disabled:opacity-50"
              >
                Buyer (Shop products)
              </button>
              <button
                disabled={loading}
                onClick={() => finalizeGoogleLogin('seller')}
                className="w-full px-4 py-3 rounded-xl bg-forest text-white font-semibold hover:bg-forest/90 disabled:opacity-50"
              >
                Seller (Sell products)
              </button>
              <button
                disabled={loading}
                onClick={() => {
                  setShowGoogleRoleModal(false)
                  setPendingGoogleCredential(null)
                }}
                className="w-full px-4 py-3 rounded-xl bg-gray-100 text-gray-800 font-semibold hover:bg-gray-200 disabled:opacity-50"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default Login