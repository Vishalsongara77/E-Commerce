import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { authAPI } from '../services/api'
import toast from 'react-hot-toast'

const VerifyEmail = () => {
  const { token } = useParams()
  const [status, setStatus] = useState('loading') // loading | success | error

  useEffect(() => {
    const run = async () => {
      try {
        setStatus('loading')
        const res = await authAPI.verifyEmail(token)
        if (res.data?.success) {
          setStatus('success')
          toast.success('Email verified successfully')
        } else {
          setStatus('error')
        }
      } catch (e) {
        setStatus('error')
      }
    }
    if (token) run()
  }, [token])

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="max-w-md w-full bg-white rounded-xl shadow p-8 text-center">
        {status === 'loading' && (
          <>
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-600 mx-auto mb-4" />
            <h1 className="text-xl font-semibold text-gray-900">Verifying your email…</h1>
            <p className="text-gray-600 mt-2">Please wait a moment.</p>
          </>
        )}
        {status === 'success' && (
          <>
            <h1 className="text-2xl font-bold text-gray-900">Email verified</h1>
            <p className="text-gray-600 mt-2">You can now login to your account.</p>
            <Link
              to="/login"
              className="inline-block mt-6 bg-amber-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-amber-700"
            >
              Go to Login
            </Link>
          </>
        )}
        {status === 'error' && (
          <>
            <h1 className="text-2xl font-bold text-gray-900">Verification failed</h1>
            <p className="text-gray-600 mt-2">
              This link is invalid or expired. You can request a new verification email from the login page.
            </p>
            <Link
              to="/login"
              className="inline-block mt-6 bg-amber-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-amber-700"
            >
              Back to Login
            </Link>
          </>
        )}
      </div>
    </div>
  )
}

export default VerifyEmail

