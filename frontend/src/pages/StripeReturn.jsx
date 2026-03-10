import { useEffect, useState } from 'react'
import { useNavigate, useSearchParams, Link } from 'react-router-dom'
import toast from 'react-hot-toast'
import { paymentsAPI } from '../services/api'

const StripeReturn = () => {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const run = async () => {
      const sessionId = searchParams.get('session_id')
      if (!sessionId) {
        toast.error('Missing Stripe session id')
        setLoading(false)
        return
      }
      try {
        setLoading(true)
        const shippingAddress = JSON.parse(localStorage.getItem('checkout_shippingAddress') || 'null')
        const notes = localStorage.getItem('checkout_notes') || ''
        const res = await paymentsAPI.verifyStripeSession({
          sessionId,
          shippingAddress,
          paymentMethod: 'card',
          notes
        })
        if (res.data?.success && res.data.order) {
          localStorage.removeItem('checkout_shippingAddress')
          localStorage.removeItem('checkout_notes')
          try {
            localStorage.setItem('lastOrderId', res.data.order?._id || '')
          } catch {}
          toast.success('Payment successful!')
          navigate('/order-confirmation', {
            replace: true,
            state: {
              orderDetails: {
                orderNumber: res.data.order._id,
                total: res.data.order.total,
                items: res.data.order.items,
                shippingAddress: res.data.order.shippingAddress
              }
            }
          })
          return
        }
        toast.error('Payment verification failed')
      } catch (e) {
        toast.error(e.response?.data?.message || 'Payment verification failed')
      } finally {
        setLoading(false)
      }
    }
    run()
  }, [navigate, searchParams])

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="max-w-md w-full bg-white rounded-xl shadow p-8 text-center">
        {loading ? (
          <>
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-600 mx-auto mb-4" />
            <h1 className="text-xl font-semibold text-gray-900">Finalizing your payment…</h1>
            <p className="text-gray-600 mt-2">Please wait. Do not refresh.</p>
          </>
        ) : (
          <>
            <h1 className="text-2xl font-bold text-gray-900">Payment status</h1>
            <p className="text-gray-600 mt-2">
              If you were charged but don’t see an order, please contact support.
            </p>
            <div className="mt-6 flex gap-3 justify-center">
              <Link to="/orders" className="px-4 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700">
                My Orders
              </Link>
              <Link to="/cart" className="px-4 py-2 bg-gray-100 text-gray-800 rounded-lg hover:bg-gray-200">
                Back to Cart
              </Link>
            </div>
          </>
        )}
      </div>
    </div>
  )
}

export default StripeReturn

