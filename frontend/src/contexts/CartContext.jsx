import { createContext, useContext, useReducer, useEffect } from 'react'
import { cartAPI } from '../services/api'
import toast from 'react-hot-toast'

export const CartContext = createContext()

const initialState = {
  items: [],
  totalItems: 0,
  totalAmount: 0,
  loading: false,
  error: null
}

const cartReducer = (state, action) => {
  switch (action.type) {
    case 'CART_LOADING':
      return {
        ...state,
        loading: true,
        error: null
      }
    case 'CART_SUCCESS':
      return {
        ...state,
        items: action.payload.items || [],
        totalItems: action.payload.totalItems || 0,
        totalAmount: action.payload.totalAmount || 0,
        loading: false,
        error: null
      }
    case 'CART_ERROR':
      return {
        ...state,
        loading: false,
        error: action.payload
      }
    case 'ADD_ITEM_SUCCESS':
      return {
        ...state,
        items: action.payload.items || state.items,
        totalItems: action.payload.totalItems || state.totalItems,
        totalAmount: action.payload.totalAmount || state.totalAmount,
        loading: false
      }
    case 'UPDATE_ITEM_SUCCESS':
      return {
        ...state,
        items: action.payload.items || state.items,
        totalItems: action.payload.totalItems || state.totalItems,
        totalAmount: action.payload.totalAmount || state.totalAmount,
        loading: false
      }
    case 'REMOVE_ITEM_SUCCESS':
      return {
        ...state,
        items: action.payload.items || state.items,
        totalItems: action.payload.totalItems || state.totalItems,
        totalAmount: action.payload.totalAmount || state.totalAmount,
        loading: false
      }
    case 'CLEAR_CART_SUCCESS':
      return {
        ...state,
        items: [],
        totalItems: 0,
        totalAmount: 0,
        loading: false
      }
    default:
      return state
  }
}

// Normalize cart items from server (Cart model) into frontend shape
const mapServerItemsToClient = (serverItems) => {
  const items = (serverItems || []).map((item) => ({
    productId: item.product?._id?.toString?.() || item.product?.toString?.() || '',
    productName: item.product?.name || 'Product',
    price: item.product?.price || 0,
    image: item.product?.images?.[0] || '',
    artisanName: '',
    quantity: item.quantity || 1,
    stock: item.product?.stock
  }))

  const totalItems = items.reduce((total, it) => total + it.quantity, 0)
  const totalAmount = items.reduce((total, it) => total + it.price * it.quantity, 0)

  return { items, totalItems, totalAmount }
}

export const CartProvider = ({ children }) => {
  const [state, dispatch] = useReducer(cartReducer, initialState)

  // Load cart on mount
  useEffect(() => {
    // Only load cart if user is logged in
    const token = localStorage.getItem('token')
    if (token) {
      loadCart()
    } else {
      // Load guest cart from localStorage for unauthenticated users
      const guestCart = JSON.parse(localStorage.getItem('guestCart') || '{"items":[]}')
      
      // Calculate totals for guest cart
      const totalItems = guestCart.items.reduce((total, item) => total + item.quantity, 0)
      const totalAmount = guestCart.items.reduce((total, item) => total + (item.price * item.quantity), 0)
      
      dispatch({
        type: 'CART_SUCCESS',
        payload: { 
          items: guestCart.items, 
          totalItems: totalItems, 
          totalAmount: totalAmount 
        }
      })
    }
  }, [])

  const loadCart = async () => {
    try {
      dispatch({ type: 'CART_LOADING' })
      const response = await cartAPI.getCart()
      const serverData = response?.data || { items: [] }
      const mapped = mapServerItemsToClient(serverData.items)
      dispatch({
        type: 'CART_SUCCESS',
        payload: mapped
      })
    } catch (error) {
      console.error('Load cart error:', error)
      dispatch({ type: 'CART_ERROR', payload: 'Failed to load cart' })
      // Fallback to empty cart on error
      dispatch({
        type: 'CART_SUCCESS',
        payload: { items: [], totalItems: 0, totalAmount: 0 }
      })
    }
  }

  const addToCart = async (productId, quantity = 1) => {
    try {
      dispatch({ type: 'CART_LOADING' })
      
      // Check if user is authenticated
      const token = localStorage.getItem('token')
      if (token) {
        // Authenticated user - use API
        const response = await cartAPI.addToCart(productId, quantity)
        const serverItems = response.data.cart || []
        const { items, totalItems, totalAmount } = mapServerItemsToClient(serverItems)

        dispatch({
          type: 'ADD_ITEM_SUCCESS',
          payload: {
            items,
            totalItems,
            totalAmount
          }
        })
        return { success: true }
      } else {
        // Guest user - use localStorage
        const guestCart = JSON.parse(localStorage.getItem('guestCart') || '{"items":[]}')
        
        // Check if product already exists in cart to get its details
        const existingItemIndex = guestCart.items.findIndex(item => item.productId === productId)
        
        if (existingItemIndex >= 0) {
          // Product exists in cart, update quantity
          guestCart.items[existingItemIndex].quantity += quantity
        } else {
          // Get product details from localStorage if available
          // This data should have been saved when adding from ProductDetail.jsx
          const productDetails = JSON.parse(localStorage.getItem(`product_${productId}`) || 'null')
          
          // Create new cart item with product details
          const newItem = {
            productId: productId,
            productName: productDetails?.name || "Product",
            price: productDetails?.price || 0,
            image: productDetails?.image || "",
            artisanName: productDetails?.artisanName || "",
            quantity: quantity
          }
          
          guestCart.items.push(newItem)
        }
        
        // Save updated cart to localStorage
        localStorage.setItem('guestCart', JSON.stringify(guestCart))
        
        // Calculate new totals
        const totalItems = guestCart.items.reduce((total, item) => total + item.quantity, 0)
        const totalAmount = guestCart.items.reduce((total, item) => total + (item.price * item.quantity), 0)
        
        // Update state
        dispatch({
          type: 'ADD_ITEM_SUCCESS',
          payload: { 
            items: guestCart.items, 
            totalItems: totalItems, 
            totalAmount: totalAmount 
          }
        })
        
        return { success: true }
      }
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to add item to cart'
      dispatch({ type: 'CART_ERROR', payload: message })
      return { success: false, error: message }
    }
  }

  const updateQuantity = async (productId, quantity) => {
    try {
      dispatch({ type: 'CART_LOADING' })
      
      // Check if user is authenticated
      const token = localStorage.getItem('token')
      if (token) {
        // Authenticated user - use API
        const response = await cartAPI.updateQuantity(productId, quantity)
        const serverItems = response.data.cart || []
        const { items, totalItems, totalAmount } = mapServerItemsToClient(serverItems)

        dispatch({
          type: 'UPDATE_ITEM_SUCCESS',
          payload: {
            items,
            totalItems,
            totalAmount
          }
        })
        toast.success('Cart updated')
        return { success: true }
      } else {
        // Guest user - use localStorage
        const guestCart = JSON.parse(localStorage.getItem('guestCart') || '{"items":[]}')
        
        // Find the item in the cart
        const existingItemIndex = guestCart.items.findIndex(item => item.productId === productId)
        
        if (existingItemIndex >= 0) {
          // Update quantity
          guestCart.items[existingItemIndex].quantity = quantity
          
          // Save updated cart to localStorage
          localStorage.setItem('guestCart', JSON.stringify(guestCart))
          
          // Calculate new totals
          const totalItems = guestCart.items.reduce((total, item) => total + item.quantity, 0)
          const totalAmount = guestCart.items.reduce((total, item) => total + (item.price * item.quantity), 0)
          
          // Update state
          dispatch({
            type: 'UPDATE_ITEM_SUCCESS',
            payload: { 
              items: guestCart.items, 
              totalItems: totalItems, 
              totalAmount: totalAmount 
            }
          })
          
          toast.success('Cart updated')
          return { success: true }
        } else {
          throw new Error('Item not found in cart')
        }
      }
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to update cart'
      dispatch({ type: 'CART_ERROR', payload: message })
      toast.error(message)
      return { success: false, error: message }
    }
  }

  const removeFromCart = async (productId) => {
    try {
      dispatch({ type: 'CART_LOADING' })
      
      // Check if user is authenticated
      const token = localStorage.getItem('token')
      if (token) {
        // Authenticated user - use API
        const response = await cartAPI.removeFromCart(productId)
        const serverItems = response.data.cart || []
        const { items, totalItems, totalAmount } = mapServerItemsToClient(serverItems)

        dispatch({
          type: 'REMOVE_ITEM_SUCCESS',
          payload: {
            items,
            totalItems,
            totalAmount
          }
        })
        toast.success('Item removed from cart')
        return { success: true }
      } else {
        // Guest user - use localStorage
        const guestCart = JSON.parse(localStorage.getItem('guestCart') || '{"items":[]}')
        
        // Remove the item from the cart
        guestCart.items = guestCart.items.filter(item => item.productId !== productId)
        
        // Save updated cart to localStorage
        localStorage.setItem('guestCart', JSON.stringify(guestCart))
        
        // Calculate new totals
        const totalItems = guestCart.items.reduce((total, item) => total + item.quantity, 0)
        const totalAmount = guestCart.items.reduce((total, item) => total + (item.price * item.quantity), 0)
        
        // Update state
        dispatch({
          type: 'REMOVE_ITEM_SUCCESS',
          payload: { 
            items: guestCart.items, 
            totalItems: totalItems, 
            totalAmount: totalAmount 
          }
        })
        
        toast.success('Item removed from cart')
        return { success: true }
      }
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to remove item'
      dispatch({ type: 'CART_ERROR', payload: message })
      toast.error(message)
      return { success: false, error: message }
    }
  }

  const clearCart = async () => {
    try {
      dispatch({ type: 'CART_LOADING' })
      
      // Check if user is authenticated
      const token = localStorage.getItem('token')
      if (token) {
        // Authenticated user - use API
        await cartAPI.clearCart()
        dispatch({ type: 'CLEAR_CART_SUCCESS' })
        toast.dismiss('cart-cleared')
        toast.success('Cart cleared', {
          id: 'cart-cleared',
          position: "top-right",
          duration: 3000,
          style: {
            background: "#2d2d2d",
            color: "#fff",
            borderRadius: "8px",
            boxShadow: "0 8px 24px rgba(0,0,0,0.25)",
          },
          ariaProps: {
            role: "status",
            "aria-live": "polite",
          },
        })
        return { success: true }
      } else {
        // Guest user - use localStorage
        localStorage.setItem('guestCart', JSON.stringify({ items: [] }))
        
        // Update state
        dispatch({ type: 'CLEAR_CART_SUCCESS' })
        
        toast.dismiss('cart-cleared')
        toast.success('Cart cleared', {
          id: 'cart-cleared',
          position: "top-right",
          duration: 3000,
          style: {
            background: "#2d2d2d",
            color: "#fff",
            borderRadius: "8px",
            boxShadow: "0 8px 24px rgba(0,0,0,0.25)",
          },
          ariaProps: {
            role: "status",
            "aria-live": "polite",
          },
        })
        return { success: true }
      }
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to clear cart'
      dispatch({ type: 'CART_ERROR', payload: message })
      toast.error(message)
      return { success: false, error: message }
    }
  }

  return (
    <CartContext.Provider value={{
      ...state,
      addToCart,
      updateQuantity,
      removeFromCart,
      clearCart,
      loadCart
    }}>
      {children}
    </CartContext.Provider>
  )
}

export const useCart = () => {
  const context = useContext(CartContext)
  if (!context) {
    throw new Error('useCart must be used within a CartProvider')
  }
  return context
}
