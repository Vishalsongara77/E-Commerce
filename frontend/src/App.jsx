import React from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './contexts/AuthContext'
import { CartProvider } from './contexts/CartContext'
import ErrorBoundary from './components/ErrorBoundary'
import Layout from './components/Layout'
import ProtectedRoleRoute from './components/ProtectedRoleRoute'

// Pages
import Home from './pages/Home'
import Products from './pages/Products'
import ProductDetail from './pages/ProductDetail'
import Login from './pages/Login'
import Register from './pages/Register'
import ForgotPassword from './pages/ForgotPassword'
import ResetPassword from './pages/ResetPassword'
import VerifyEmail from './pages/VerifyEmail'
import StripeReturn from './pages/StripeReturn'
import Wishlist from './pages/Wishlist'
import CartPage from './pages/CartPage'
import PaymentPage from './pages/PaymentPage'
import Checkout from './pages/Checkout'
import OrderConfirmation from './pages/OrderConfirmation'
import UserProfile from './pages/UserProfile'
import OrderTracking from './pages/OrderTracking'
import DemoCancelOrder from './pages/DemoCancelOrder'
import ArtisanProfile from './pages/ArtisanProfile'
import Orders from './pages/Orders'

// Dashboard Pages
import BuyerDashboard from './pages/BuyerDashboard'
import SellerDashboard from './pages/SellerDashboard'
import AdminDashboard from './pages/AdminDashboard'
import ArtisanDashboard from './pages/ArtisanDashboard'
import SellerOrders from './pages/SellerOrders'
import SellerEarnings from './pages/SellerEarnings'
import AdminAnalytics from './pages/AdminAnalytics'

// Admin Pages
import AdminProducts from './pages/AdminProducts'
import AdminUsers from './pages/AdminUsers'
import AdminOrders from './pages/AdminOrders'

// Other Pages
import About from './pages/About'
import Contact from './pages/Contact'
import NotFound from './pages/NotFound'

const RoleGuardedPublic = ({ children }) => {
  const { user, isAuthenticated } = useAuth()

  if (!isAuthenticated || !user) return children

  if (user.role === 'admin') {
    return <Navigate to="/admin/dashboard" replace />
  }
  if (user.role === 'seller') {
    return <Navigate to="/seller/dashboard" replace />
  }

  return children
}

function App() {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <CartProvider>
          <Routes>
            <Route element={<Layout />}>
            {/* Public Routes (redirect admin/seller to their dashboards) */}
            <Route
              path="/"
              element={
                <RoleGuardedPublic>
                  <Home />
                </RoleGuardedPublic>
              }
            />
            <Route
              path="products"
              element={
                <RoleGuardedPublic>
                  <Products />
                </RoleGuardedPublic>
              }
            />
            <Route
              path="products/:id"
              element={
                <RoleGuardedPublic>
                  <ProductDetail />
                </RoleGuardedPublic>
              }
            />
            <Route path="artisan/:id" element={<ArtisanProfile />} />
            <Route
              path="cart"
              element={
                <RoleGuardedPublic>
                  <CartPage />
                </RoleGuardedPublic>
              }
            />
            <Route
              path="checkout"
              element={
                <RoleGuardedPublic>
                  <Checkout />
                </RoleGuardedPublic>
              }
            />
            <Route
              path="order-confirmation"
              element={
                <RoleGuardedPublic>
                  <OrderConfirmation />
                </RoleGuardedPublic>
              }
            />
            <Route path="demo-cancel-order" element={<DemoCancelOrder />} />
            <Route path="payment" element={<PaymentPage />} />
            <Route path="order-tracking" element={<OrderTracking />} />
            <Route path="order-tracking/:orderId" element={<OrderTracking />} />
            <Route path="profile" element={<ProtectedRoleRoute allowedRoles={['buyer', 'seller', 'admin', 'artisan']}><UserProfile /></ProtectedRoleRoute>} />
            <Route path="wishlist" element={<ProtectedRoleRoute allowedRoles={['buyer']}><Wishlist /></ProtectedRoleRoute>} />
            <Route path="about" element={<About />} />
            <Route path="contact" element={<Contact />} />
            
            {/* Auth Routes */}
            <Route path="login" element={<Login />} />
            <Route path="register" element={<Register />} />
            <Route path="forgot-password" element={<ForgotPassword />} />
            <Route path="reset-password/:token" element={<ResetPassword />} />
            <Route path="verify-email/:token" element={<VerifyEmail />} />
            <Route path="payment/stripe/return" element={<StripeReturn />} />
            
            {/* Role-based Dashboard Routes */}
            <Route path="admin/dashboard" element={
              <ProtectedRoleRoute allowedRoles={['admin']}>
                <AdminDashboard />
              </ProtectedRoleRoute>
            } />
            <Route path="admin/users" element={
              <ProtectedRoleRoute allowedRoles={['admin']}>
                <AdminUsers />
              </ProtectedRoleRoute>
            } />
            <Route path="admin/orders" element={
              <ProtectedRoleRoute allowedRoles={['admin']}>
                <AdminOrders />
              </ProtectedRoleRoute>
            } />
            
            <Route path="seller/dashboard" element={
              <ProtectedRoleRoute allowedRoles={['seller']}>
                <SellerDashboard />
              </ProtectedRoleRoute>
            } />
            
            <Route path="seller/products" element={
              <ProtectedRoleRoute allowedRoles={['seller']}>
                <AdminProducts />
              </ProtectedRoleRoute>
            } />
            
            <Route path="seller/products/add" element={
              <ProtectedRoleRoute allowedRoles={['seller']}>
                <AdminProducts isAddMode={true} />
              </ProtectedRoleRoute>
            } />

            <Route path="seller/orders" element={
              <ProtectedRoleRoute allowedRoles={['seller']}>
                <SellerOrders />
              </ProtectedRoleRoute>
            } />

            <Route path="seller/earnings" element={
              <ProtectedRoleRoute allowedRoles={['seller']}>
                <SellerEarnings />
              </ProtectedRoleRoute>
            } />
            
            <Route path="artisan/dashboard" element={
              <ProtectedRoleRoute allowedRoles={['artisan']}>
                <ArtisanDashboard />
              </ProtectedRoleRoute>
            } />
            
            <Route path="buyer/dashboard" element={
              <ProtectedRoleRoute allowedRoles={['buyer']}>
                <BuyerDashboard />
              </ProtectedRoleRoute>
            } />
            <Route path="orders" element={
              <ProtectedRoleRoute allowedRoles={['buyer']}>
                <Orders />
              </ProtectedRoleRoute>
            } />
            
            {/* Admin Routes */}
            <Route path="admin/products" element={
              <ProtectedRoleRoute allowedRoles={['admin']}>
                <AdminProducts />
              </ProtectedRoleRoute>
            } />
            <Route path="admin/analytics" element={
              <ProtectedRoleRoute allowedRoles={['admin']}>
                <AdminAnalytics />
              </ProtectedRoleRoute>
            } />
            
            {/* Redirect old routes */}
            <Route path="dashboard" element={<Navigate to="/buyer/dashboard" replace />} />
            <Route path="admin" element={<Navigate to="/admin/dashboard" replace />} />
            <Route path="seller" element={<Navigate to="/seller/dashboard" replace />} />
            
            {/* 404 Route */}
            <Route path="*" element={<NotFound />} />
          </Route>
        </Routes>
      </CartProvider>
    </AuthProvider>
  </ErrorBoundary>
  )
}

export default App
