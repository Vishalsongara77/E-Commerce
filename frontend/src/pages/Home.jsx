import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { FiArrowRight, FiStar, FiUsers, FiGlobe, FiHeart, FiShoppingBag } from 'react-icons/fi'
import { productsAPI } from '../services/api'
import { useCart } from '../contexts/CartContext'
import toast from 'react-hot-toast'

const Home = () => {
  const [trendingProducts, setTrendingProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const { addToCart } = useCart()

  useEffect(() => {
    const fetchTrending = async () => {
      try {
        const response = await productsAPI.getProducts({ limit: 4, sortBy: 'rating' })
        if (response.data.success) {
          setTrendingProducts(response.data.products)
        }
      } catch (error) {
        console.error('Error fetching trending products:', error)
      } finally {
        setLoading(false)
      }
    }
    fetchTrending()
  }, [])

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
      console.error('Error adding to cart from home:', error)
      toast.error('Failed to add item to cart')
    }
  }

  const stories = [
    {
      id: 1,
      name: 'The Bastar Legacy',
      artisan: 'Suresh Baghel',
      image: 'https://images.unsplash.com/photo-1509114397022-ed747cca3f65?w=500&auto=format&fit=crop&q=60',
      excerpt: 'Bringing the ancient Dhokra art to modern homes while preserving the spirit of Bastar.'
    },
    {
      id: 2,
      name: 'Threads of Nagaland',
      artisan: 'Konyak Sisters',
      image: 'https://images.unsplash.com/photo-1544967082-d9d25d867d66?w=500&auto=format&fit=crop&q=60',
      excerpt: 'Every pattern tells a story of bravery, heritage, and the soul of the mountains.'
    },
    {
      id: 3,
      name: 'Earth & Soul',
      artisan: 'Gopal Prajapati',
      image: 'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=500&auto=format&fit=crop&q=60',
      excerpt: 'Transforming red clay into timeless masterpieces that breathe with the earth.'
    }
  ]

  return (
    <div className="min-h-screen bg-offwhite">
      {/* Hero Section */}
      <section className="relative h-[80vh] flex items-center overflow-hidden">
        <div className="absolute inset-0 z-0">
          <img 
            src="https://images.unsplash.com/photo-1755781849771-54d9f7b8c8d2?q=80&w=1074&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D" 
            alt="Tribal Artisan working" 
            className="w-full h-full object-cover brightness-50"
            crossOrigin="anonymous"
            onError={(e) => {
              e.target.src = 'https://images.unsplash.com/photo-1493246507139-91e8bef99c1e?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=80' // Fallback to a different one or placeholder
              e.target.onerror = null; // Prevent infinite loop
            }}
          />
        </div>
        <div className="container-max relative z-10 text-white">
          <div className="max-w-2xl">
            <h1 className="text-5xl md:text-7xl font-bold mb-6 leading-tight">
              Preserving <span className="text-terracotta-400">Roots</span>, <br />
              Empowering <span className="text-forest-300">Tribes</span>
            </h1>
            <p className="text-xl md:text-2xl mb-8 text-sand-100 font-light">
              Discover authentic handcrafted treasures directly from the heart of India's indigenous communities.
            </p>
            <div className="flex flex-wrap gap-4">
              <Link to="/products" className="btn btn-primary">
                Explore Collection <FiArrowRight className="ml-2" />
              </Link>
              <Link to="/about" className="btn bg-white/10 backdrop-blur-md border border-white/20 hover:bg-white/20 text-white">
                Our Story
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Trending Collections */}
      <section className="section-padding bg-white">
        <div className="container-max">
          <div className="flex justify-between items-end mb-12">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold mb-4">Trending Tribal Collections</h2>
              <div className="w-20 h-1.5 bg-terracotta rounded-full"></div>
            </div>
            <Link to="/products" className="text-terracotta font-semibold flex items-center hover:underline">
              View All Products <FiArrowRight className="ml-1" />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {trendingProducts.map((product) => (
              <div key={product._id} className="group bg-white rounded-lg overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300">
                <div className="relative aspect-square overflow-hidden bg-sand-100">
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
                  <button className="absolute top-4 right-4 p-2 bg-white/80 backdrop-blur-sm rounded-full text-gray-600 hover:text-terracotta transition-colors shadow-sm">
                    <FiHeart className="w-5 h-5" />
                  </button>
                  <div className="absolute inset-x-0 bottom-0 p-4 translate-y-full group-hover:translate-y-0 transition-transform duration-300 bg-gradient-to-t from-black/60 to-transparent">
                    <button
                      onClick={() => handleAddToCart(product)}
                      className="w-full btn btn-primary py-2 text-sm"
                    >
                      Add to Cart
                    </button>
                  </div>
                </div>
                <div className="p-4">
                  <div className="flex justify-between items-start mb-1">
                    <h3 className="font-semibold text-lg line-clamp-1">{product.name}</h3>
                    <div className="flex flex-col items-end">
                      <span className="font-bold text-terracotta">₹{product.price}</span>
                      <div className="flex items-center text-xs text-amber-500 mt-1">
                        <FiStar className="fill-current mr-1" />
                        <span>{Number(product.rating || 0).toFixed(1)}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-600 italic">by {product.artisan?.name || product.artisan || 'Anonymous Artisan'}</span>
                    <span className="badge-region">{product.artisan?.region || product.region || 'Unknown Region'}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Meet the Artisan Section */}
      <section className="section-padding bg-sand">
        <div className="container-max">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div className="relative">
              <div className="absolute -top-4 -left-4 w-full h-full border-2 border-forest rounded-lg"></div>
              <img 
                src="https://images.unsplash.com/photo-1582555172866-f73bb12a2ab3?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80" 
                alt="Artisan at work" 
                className="relative z-10 rounded-lg shadow-2xl"
                crossOrigin="anonymous"
                onError={(e) => {
                  e.target.src = 'https://placehold.co/800x600/2F5D50/ffffff?text=Tribal+Artisan'
                }}
              />
              <div className="absolute -bottom-8 -right-8 bg-forest text-white p-8 rounded-lg z-20 max-w-xs shadow-xl">
                <p className="italic text-lg mb-4">"Our art is not just a skill, it's a prayer to our ancestors and a gift to the future."</p>
                <p className="font-bold">— Sunita Bai, Warli Artist</p>
              </div>
            </div>
            <div>
              <h2 className="text-4xl font-bold mb-6 text-forest">Meet the Artisans</h2>
              <p className="text-lg text-gray-700 mb-8 leading-relaxed">
                Behind every masterpiece lies a pair of hands that carry centuries of tradition. Our artisans belong to diverse tribes across India, each bringing a unique cultural perspective and ancestral technique to their craft.
              </p>
              <ul className="space-y-4 mb-10">
                <li className="flex items-center text-forest-800">
                  <div className="w-6 h-6 rounded-full bg-forest/10 flex items-center justify-center mr-3">
                    <FiStar className="w-3.5 h-3.5" />
                  </div>
                  100% Authentic Tribal Heritage
                </li>
                <li className="flex items-center text-forest-800">
                  <div className="w-6 h-6 rounded-full bg-forest/10 flex items-center justify-center mr-3">
                    <FiUsers className="w-3.5 h-3.5" />
                  </div>
                  Direct Fair-Trade Compensation
                </li>
                <li className="flex items-center text-forest-800">
                  <div className="w-6 h-6 rounded-full bg-forest/10 flex items-center justify-center mr-3">
                    <FiGlobe className="w-3.5 h-3.5" />
                  </div>
                  Sustainable & Eco-friendly Practices
                </li>
              </ul>
              <Link to="/about" className="btn btn-secondary">
                Read Their Stories
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Festive Offers Section */}
      <section className="py-16 bg-forest text-white overflow-hidden relative">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -mr-32 -mt-32 blur-3xl"></div>
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-terracotta/10 rounded-full -ml-48 -mb-48 blur-3xl"></div>
        
        <div className="container-max relative z-10">
          <div className="flex flex-col md:flex-row items-center justify-between gap-8">
            <div className="text-center md:text-left">
              <span className="bg-terracotta px-4 py-1 rounded-full text-xs font-bold uppercase tracking-widest mb-4 inline-block">Limited Time Offer</span>
              <h2 className="text-4xl md:text-5xl font-bold mb-4">Festive Heritage Sale</h2>
              <p className="text-xl text-sand-200 font-light max-w-xl">
                Celebrate the spirit of tradition with up to <span className="text-terracotta-400 font-bold">40% OFF</span> on selected tribal artworks and textiles.
              </p>
            </div>
            <div className="flex flex-col items-center bg-white/10 backdrop-blur-lg p-8 rounded-2xl border border-white/20">
              <div className="text-sm uppercase tracking-widest mb-2 text-sand-300">Use Code</div>
              <div className="text-4xl font-black text-terracotta-400 mb-6 tracking-tighter">TRIBAL2024</div>
              <Link to="/products" className="btn btn-primary w-full">
                Shop the Sale
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Stories from the Tribes */}
      <section className="section-padding bg-offwhite">
        <div className="container-max">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">Stories from the Tribes</h2>
            <p className="text-gray-600 max-w-2xl mx-auto italic">
              "Every craft is a chapter, every artisan a storyteller."
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            {stories.map((story) => (
              <div key={story.id} className="story-card group cursor-pointer">
                <div className="relative aspect-[4/5] overflow-hidden mb-4 bg-sand-200">
                  <img 
                    src={story.image} 
                    alt={story.name} 
                    className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-700"
                    crossOrigin="anonymous"
                    onError={(e) => {
                      e.target.src = 'https://placehold.co/400x500/2F5D50/ffffff?text=' + encodeURIComponent(story.name)
                    }}
                  />
                </div>
                <h3 className="text-xl font-bold mb-1">{story.name}</h3>
                <p className="text-sm text-terracotta font-medium mb-3">Featuring {story.artisan}</p>
                <p className="text-gray-600 text-sm leading-relaxed mb-4">
                  {story.excerpt}
                </p>
                <button className="text-forest font-bold text-xs uppercase tracking-widest flex items-center group-hover:translate-x-2 transition-transform">
                  Read More <FiArrowRight className="ml-1" />
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-sand-100 py-20 border-y border-sand-200">
        <div className="container-max text-center">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold text-forest mb-6">Join the Movement</h2>
            <p className="text-gray-700 mb-10 text-lg">
              Support sustainable livelihoods and help preserve India's rich cultural heritage. Subscribe for updates on new collections and artisan stories.
            </p>
            <form className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
              <input 
                type="email" 
                placeholder="Your email address" 
                className="flex-1 px-6 py-3 rounded-md border-sand-300 focus:ring-forest focus:border-forest outline-none"
              />
              <button className="btn btn-secondary">
                Subscribe
              </button>
            </form>
          </div>
        </div>
      </section>
    </div>
  )
}

export default Home