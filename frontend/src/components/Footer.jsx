import React from 'react'
import { Link } from 'react-router-dom'
import { FiMail, FiPhone, FiMapPin } from 'react-icons/fi'

const Footer = () => {
  return (
    <footer className="bg-forest text-white">
      <div className="container-max py-16">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-12">
          {/* Brand Info */}
          <div className="md:col-span-4">
            <Link to="/" className="flex items-center gap-2 mb-6 group">
              <div className="w-10 h-10 bg-terracotta rounded-lg flex items-center justify-center text-white font-serif text-2xl">
                T
              </div>
              <span className="text-2xl font-display font-bold text-white tracking-tight">
                Tribal <span className="text-sand-300">Marketplace</span>
              </span>
            </Link>
            <p className="text-sand-50/80 leading-relaxed mb-8 max-w-sm">
              Empowering indigenous artisans by bringing their timeless crafts to the modern world. 
              Every purchase supports a family and preserves a heritage.
            </p>
            <div className="flex gap-4">
              {/* Social icons could go here */}
            </div>
          </div>

          {/* Quick Links */}
          <div className="md:col-span-2">
            <h4 className="text-lg font-serif font-bold mb-6 text-sand-300">Shop</h4>
            <ul className="space-y-4">
              <li><Link to="/products" className="text-sand-50/70 hover:text-terracotta transition-colors">All Products</Link></li>
              <li><Link to="/products?category=textiles" className="text-sand-50/70 hover:text-terracotta transition-colors">Textiles</Link></li>
              <li><Link to="/products?category=art" className="text-sand-50/70 hover:text-terracotta transition-colors">Tribal Art</Link></li>
              <li><Link to="/products?category=jewelry" className="text-sand-50/70 hover:text-terracotta transition-colors">Jewelry</Link></li>
            </ul>
          </div>

          {/* About Links */}
          <div className="md:col-span-2">
            <h4 className="text-lg font-serif font-bold mb-6 text-sand-300">Our Story</h4>
            <ul className="space-y-4">
              <li><Link to="/about" className="text-sand-50/70 hover:text-terracotta transition-colors">About Us</Link></li>
              <li><Link to="/artisans" className="text-sand-50/70 hover:text-terracotta transition-colors">Meet Artisans</Link></li>
              <li><Link to="/stories" className="text-sand-50/70 hover:text-terracotta transition-colors">Tribal Stories</Link></li>
              <li><Link to="/impact" className="text-sand-50/70 hover:text-terracotta transition-colors">Our Impact</Link></li>
            </ul>
          </div>

          {/* Newsletter */}
          <div className="md:col-span-4">
            <h4 className="text-lg font-serif font-bold mb-6 text-sand-300">Join Our Journey</h4>
            <p className="text-sand-50/70 mb-6">Subscribe to receive updates on new collections and artisan stories.</p>
            <form className="flex gap-2">
              <input 
                type="email" 
                placeholder="Your email" 
                className="bg-white/10 border border-white/20 rounded-lg px-4 py-2 flex-1 focus:outline-none focus:border-terracotta transition-colors text-white placeholder:text-white/40"
              />
              <button className="btn btn-primary px-6 py-2">Join</button>
            </form>
          </div>
        </div>

        <div className="mt-16 pt-8 border-t border-white/10 flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-sand-50/50">
          <p>© 2024 Tribal Marketplace. Preserving Traditions, Empowering Lives.</p>
          <div className="flex gap-8">
            <Link to="/privacy" className="hover:text-white transition-colors">Privacy Policy</Link>
            <Link to="/terms" className="hover:text-white transition-colors">Terms of Service</Link>
          </div>
        </div>
      </div>
    </footer>
  )
}

export default Footer