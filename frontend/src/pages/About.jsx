import React from 'react'
import { FiHeart, FiUsers, FiGlobe, FiAward } from 'react-icons/fi'

const About = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <h1 className="text-4xl font-bold text-gray-900 mb-6">About Tribal Marketplace</h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Empowering tribal artisans by connecting their authentic crafts with global customers, 
            preserving cultural heritage while ensuring fair compensation.
          </p>
        </div>

        {/* Mission Section */}
        <div className="grid md:grid-cols-2 gap-12 items-center mb-16">
          <div>
            <h2 className="text-3xl font-bold text-gray-900 mb-6">Our Mission</h2>
            <p className="text-gray-600 mb-6">
              We are dedicated to preserving traditional tribal crafts and ensuring fair compensation 
              for indigenous artisans. Our platform bridges the gap between rural artisans and global 
              customers, creating sustainable economic opportunities.
            </p>
            <div className="space-y-4">
              <div className="flex items-start space-x-3">
                <FiHeart className="w-6 h-6 text-amber-600 mt-1" />
                <div>
                  <h3 className="font-semibold text-gray-900">Cultural Preservation</h3>
                  <p className="text-gray-600">Keeping traditional crafts alive for future generations</p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <FiUsers className="w-6 h-6 text-amber-600 mt-1" />
                <div>
                  <h3 className="font-semibold text-gray-900">Fair Trade</h3>
                  <p className="text-gray-600">Ensuring artisans receive fair compensation for their work</p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <FiGlobe className="w-6 h-6 text-amber-600 mt-1" />
                <div>
                  <h3 className="font-semibold text-gray-900">Global Reach</h3>
                  <p className="text-gray-600">Connecting artisans with customers worldwide</p>
                </div>
              </div>
            </div>
          </div>
          <div className="bg-gradient-to-br from-amber-100 to-orange-100 rounded-2xl p-8 h-96 flex items-center justify-center">
            <div className="text-center">
              <FiAward className="w-24 h-24 text-amber-600 mx-auto mb-4" />
              <h3 className="text-2xl font-bold text-gray-900">Authentic Crafts</h3>
            </div>
          </div>
        </div>

        {/* Values Section */}
        <div className="bg-white rounded-2xl p-8 shadow-lg">
          <h2 className="text-3xl font-bold text-gray-900 text-center mb-12">Our Values</h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <FiHeart className="w-8 h-8 text-amber-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Authenticity</h3>
              <p className="text-gray-600">
                Every product is genuinely handcrafted by tribal artisans using traditional techniques 
                passed down through generations.
              </p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <FiUsers className="w-8 h-8 text-amber-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Community</h3>
              <p className="text-gray-600">
                We build strong relationships with artisan communities, supporting their economic 
                development and cultural preservation.
              </p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <FiGlobe className="w-8 h-8 text-amber-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Sustainability</h3>
              <p className="text-gray-600">
                Our platform promotes sustainable practices, environmental consciousness, 
                and long-term economic viability for artisan communities.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default About