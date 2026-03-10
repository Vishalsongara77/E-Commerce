import { Navigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'

const RoleBasedRoute = ({ children, allowedRoles = [] }) => {
  const { user, loading } = useAuth()

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-indigo-600"></div>
      </div>
    )
  }

  if (!user) {
    return <Navigate to="/login" replace />
  }

  if (allowedRoles.length > 0 && !allowedRoles.includes(user.role)) {
    // Redirect to appropriate dashboard based on user role
    switch (user.role) {
      case 'admin':
        return <Navigate to="/admin/dashboard" replace />
      case 'seller':
        return <Navigate to="/seller/dashboard" replace />
      case 'buyer':
        return <Navigate to="/buyer/dashboard" replace />
      default:
        return <Navigate to="/login" replace />
    }
  }

  return children
}

export default RoleBasedRoute