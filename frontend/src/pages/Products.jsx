import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { FiHeart, FiStar, FiLoader, FiShoppingBag } from 'react-icons/fi'
import { productsAPI } from '../services/api'
import { useAuth } from '../contexts/AuthContext'
import { useCart } from '../contexts/CartContext'
import toast from 'react-hot-toast'

const Products = () => {
  const { isAuthenticated } = useAuth()
  const { addToCart } = useCart()
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [wishlistItems, setWishlistItems] = useState([])
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)

  // Load wishlist from localStorage on mount
  useEffect(() => {
    const storedIds = JSON.parse(localStorage.getItem('wishlistIds') || '[]')
    setWishlistItems(storedIds)
  }, [])

  const toggleWishlist = (product) => {
    if (!isAuthenticated) {
      toast.error('Please login to manage wishlist')
      return
    }

    const storedIds = new Set(JSON.parse(localStorage.getItem('wishlistIds') || '[]'))
    let storedItems = JSON.parse(localStorage.getItem('wishlistItems') || '[]')

    if (storedIds.has(product._id)) {
      // Remove from wishlist
      storedIds.delete(product._id)
      storedItems = storedItems.filter((p) => p._id !== product._id)
      toast.success('Removed from wishlist')
    } else {
      // Add to wishlist
      storedIds.add(product._id)
      storedItems.push({
        _id: product._id,
        name: product.name,
        price: product.price,
        images: product.images || [],
        stock: product.stock ?? 0,
        category: { name: product.category || 'Uncategorized' }
      })
      toast.success('Added to wishlist')
    }

    localStorage.setItem('wishlistIds', JSON.stringify(Array.from(storedIds)))
    localStorage.setItem('wishlistItems', JSON.stringify(storedItems))
    setWishlistItems(Array.from(storedIds))

    // Let other parts of the app refresh wishlist counts in the same tab
    window.dispatchEvent(
      new CustomEvent('wishlistUpdated', {
        detail: { count: storedIds.size }
      })
    )
  }

  const [searchTerm, setSearchTerm] = useState('')
  const [filters, setFilters] = useState({
    category: '',
    priceRange: [0, 20000],
    sortBy: 'relevance',
    inStock: false
  })

  const handleAddToCart = async (product) => {
    try {
      const productDetails = {
        name: product.name,
        price: product.price,
        image: product.images && product.images.length > 0 ? product.images[0] : product.image || '',
        artisanName: product.artisan?.name || ''
      }
      localStorage.setItem(`product_${product._id}`, JSON.stringify(productDetails))

      const result = await addToCart(product._id, 1)
      if (result.success) {
        toast.success('Item added to cart')
      } else {
        toast.error(result.error || 'Failed to add item to cart')
      }
    } catch (error) {
      console.error('Error adding to cart from listing:', error)
      toast.error('Failed to add item to cart')
    }
  }

  // Categories aligned with backend product categories
  const categories = [
    { id: '', name: 'All Collections' },
    { id: 'Jewelry', name: 'Tribal Jewelry' },
    { id: 'Textiles', name: 'Handwoven Textiles' },
    { id: 'Pottery', name: 'Clay & Ceramics' },
    { id: 'Art', name: 'Indigenous Art' },
    { id: 'Home Decor', name: 'Home Decor' }
  ]

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true)
        const response = await productsAPI.getProducts({
          q: searchTerm,
          category: filters.category,
          minPrice: filters.priceRange[0],
          maxPrice: filters.priceRange[1],
          sortBy: filters.sortBy,
          inStock: filters.inStock,
          page,
          limit: 9
        })
        
        if (response.data.success) {
          setProducts(response.data.products)
          setTotalPages(response.data.pagination?.totalPages || 1)
        } else {
          // Fallback to demo data if API fails or returns no products
          setProducts([])
        }
        setLoading(false)
      } catch (err) {
        console.error('Error fetching products:', err)
        setError('Failed to load products.')
        setLoading(false)
      }
    }
    fetchProducts()
  }, [searchTerm, filters, page])

  return (
    <div className="min-h-screen bg-offwhite">
      {/* Hero Section */}
      <div className="bg-forest py-16 text-white overflow-hidden relative">
        <div className="absolute top-0 right-0 w-64 h-64 bg-terracotta/10 rounded-full -mr-32 -mt-32 blur-3xl"></div>
        <div className="container-max relative z-10">
          <h1 className="text-4xl md:text-5xl font-display font-bold mb-4">Our Collections</h1>
          <p className="text-sand-50/80 text-lg max-w-2xl">
            Explore authentic masterpieces handcrafted by indigenous artisans using techniques passed down through generations.
          </p>
        </div>
      </div>

      <div className="container-max py-12">
        <div className="flex flex-col lg:flex-row gap-12">
          {/* Sidebar Filters */}
          <aside className="lg:w-64 flex-shrink-0">
            <div className="sticky top-28 space-y-8">
              <div>
                <h3 className="text-lg font-serif font-bold text-forest mb-4">Categories</h3>
                <div className="space-y-2">
                  {categories.map((cat) => (
                    <button
                      key={cat.id || 'all'}
                      onClick={() => {
                        setFilters({ ...filters, category: cat.id })
                        setPage(1)
                      }}
                      className={`block w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${
                        (filters.category === cat.id || (!filters.category && cat.id === ''))
                          ? 'bg-sand-100 text-terracotta font-bold'
                          : 'text-gray-600 hover:bg-sand-50 hover:text-forest'
                      }`}
                    >
                      {cat.name}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <h3 className="text-lg font-serif font-bold text-forest mb-4">Price Range</h3>
                <input 
                  type="range" 
                  min="0" 
                  max="20000" 
                  step="500"
                  className="w-full accent-terracotta"
                  onChange={(e) => setFilters({ ...filters, priceRange: [0, parseInt(e.target.value)] })}
                />
                <div className="flex justify-between text-xs text-gray-500 mt-2">
                  <span>₹0</span>
                  <span>Up to ₹20,000</span>
                </div>
              </div>
            </div>
          </aside>

          {/* Main Content */}
          <main className="flex-1">
            {/* Search and Sort */}
            <div className="flex flex-col sm:flex-row justify-between items-center mb-8 gap-4">
              <div className="relative w-full sm:w-96">
                <input
                  type="text"
                  placeholder="Search for crafts, tribes, or regions..."
                  className="w-full pl-10 pr-4 py-3 rounded-xl border border-sand-200 focus:outline-none focus:ring-2 focus:ring-terracotta/20 focus:border-terracotta transition-all bg-white"
                  onChange={(e) => {
                    setSearchTerm(e.target.value)
                    setPage(1)
                  }}
                />
                <FiLoader className={`absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 ${loading ? 'animate-spin' : ''}`} />
              </div>
              
              <select 
                className="w-full sm:w-auto px-4 py-3 rounded-xl border border-sand-200 focus:outline-none focus:border-terracotta bg-white text-sm"
                onChange={(e) => {
                  setFilters({ ...filters, sortBy: e.target.value })
                  setPage(1)
                }}
              >
                <option value="relevance">Relevance</option>
                <option value="price_asc">Price: Low to High</option>
                <option value="price_desc">Price: High to Low</option>
                <option value="newest">Newest First</option>
              </select>
            </div>

            {/* Product Grid */}
            {loading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                {[1, 2, 3, 4, 5, 6].map((n) => (
                  <div key={n} className="animate-pulse">
                    <div className="bg-sand-100 h-72 rounded-lg mb-4"></div>
                    <div className="h-4 bg-sand-100 rounded w-3/4 mb-2"></div>
                    <div className="h-4 bg-sand-100 rounded w-1/2"></div>
                  </div>
                ))}
              </div>
            ) : products.length > 0 ? (
              <>
                <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-8">
                  {products.map((product) => (
                  <div key={product._id} className="group bg-white rounded-lg overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300">
                    <div className="relative aspect-[4/5] sm:aspect-square overflow-hidden bg-sand-100">
                      <img 
                        src={product.images && product.images.length > 0 ? product.images[0] : product.image || 'https://placehold.co/500'} 
                        alt={product.name}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                        crossOrigin="anonymous"
                        onError={(e) => {
                          e.target.src = 'https://placehold.co/500x500/C05621/ffffff?text=' + encodeURIComponent(product.name)
                        }}
                      />
                      {product.discount > 0 && (
                        <span className="badge-discount">{product.discount}% OFF</span>
                      )}
                      <button 
                        onClick={() => toggleWishlist(product)}
                        className={`absolute top-2 right-2 sm:top-4 sm:right-4 p-1.5 sm:p-2 rounded-full transition-colors shadow-sm backdrop-blur-sm ${
                          wishlistItems.includes(product._id) 
                            ? 'bg-terracotta text-white' 
                            : 'bg-white/80 text-gray-600 hover:text-terracotta'
                        }`}
                      >
                        <FiHeart className={`w-4 h-4 sm:w-5 sm:h-5 ${wishlistItems.includes(product._id) ? 'fill-current' : ''}`} />
                      </button>
                      <div className="absolute inset-x-0 bottom-0 p-4 translate-y-full group-hover:translate-y-0 transition-transform duration-300 bg-gradient-to-t from-black/60 to-transparent">
                        <button
                          onClick={() => handleAddToCart(product)}
                          className="w-full btn btn-primary py-2 text-sm flex items-center justify-center gap-2"
                        >
                          <FiShoppingBag /> Add to Cart
                        </button>
                      </div>
                    </div>
                    <div className="p-3 sm:p-4">
                      <div className="flex justify-between items-start mb-1">
                        <Link to={`/products/${product._id}`} className="hover:text-terracotta transition-colors">
                          <h3 className="font-semibold text-sm sm:text-lg line-clamp-2">{product.name}</h3>
                        </Link>
                        <div className="flex flex-col items-end">
                          <span className="font-bold text-terracotta text-base sm:text-lg">₹{product.price}</span>
                          <div className="flex items-center text-xs text-amber-500 mt-1">
                            <FiStar className="fill-current mr-1" />
                            <span>{Number(product.rating || 0).toFixed(1)}</span>
                          </div>
                          {product.discount > 0 && (
                            <span className="text-xs text-gray-400 line-through">
                              ₹{Math.round(product.price / (1 - product.discount / 100))}
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs sm:text-sm text-gray-600 italic line-clamp-1">
                          by {product.artisan?.name || product.artisan || 'Anonymous Artisan'}
                        </span>
                        <span className="badge-region hidden sm:inline-flex">
                          {product.artisan?.region || product.region || 'Unknown Region'}
                        </span>
                      </div>
                    </div>
                  </div>
                  ))}
                </div>

                {/* Pagination */}
                <div className="mt-10 flex flex-col sm:flex-row items-center justify-between gap-4">
                  <p className="text-sm text-gray-600">
                    Page <span className="font-semibold">{page}</span> of{' '}
                    <span className="font-semibold">{totalPages}</span>
                  </p>
                  <div className="flex gap-2">
                    <button
                      disabled={page === 1}
                      onClick={() => setPage((p) => Math.max(1, p - 1))}
                      className="px-4 py-2 rounded-lg border border-sand-300 text-sm text-gray-700 bg-white disabled:opacity-50 disabled:cursor-not-allowed hover:bg-sand-50"
                    >
                      Previous
                    </button>
                    <button
                      disabled={page === totalPages}
                      onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                      className="px-4 py-2 rounded-lg border border-sand-300 text-sm text-gray-700 bg-white disabled:opacity-50 disabled:cursor-not-allowed hover:bg-sand-50"
                    >
                      Next
                    </button>
                  </div>
                </div>
              </>
            ) : (
              <div className="text-center py-20 bg-white rounded-2xl border border-sand-100">
                <div className="text-5xl mb-4">🏺</div>
                <h3 className="text-xl font-serif font-bold text-forest mb-2">No masterpieces found</h3>
                <p className="text-gray-500">Try adjusting your filters or search term</p>
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  )
}

export default Products
