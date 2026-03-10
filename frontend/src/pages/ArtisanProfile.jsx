import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { FiMapPin, FiUsers, FiShoppingBag, FiStar, FiInfo, FiArrowLeft } from 'react-icons/fi';
import api from '../api/axios';
import toast from 'react-hot-toast';

const ArtisanProfile = () => {
  const { id } = useParams();
  const [artisan, setArtisan] = useState(null);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchArtisanData = async () => {
      try {
        setLoading(true);
        const response = await api.get(`/artisans/${id}`);
        if (response.data.success) {
          setArtisan(response.data.artisan);
          setProducts(response.data.products);
        }
      } catch (error) {
        console.error('Error fetching artisan:', error);
        toast.error('Failed to load artisan profile');
      } finally {
        setLoading(false);
      }
    };

    fetchArtisanData();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-offwhite">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-terracotta"></div>
      </div>
    );
  }

  if (!artisan) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-offwhite p-4">
        <h2 className="text-2xl font-bold text-forest mb-4">Artisan not found</h2>
        <Link to="/products" className="btn btn-primary">Back to Products</Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-offwhite">
      {/* Header/Cover Section */}
      <div className="h-64 md:h-80 bg-forest relative">
        <div className="absolute inset-0 opacity-20 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')]"></div>
        <div className="container-max h-full flex items-end pb-8">
          <Link to="/products" className="absolute top-8 left-8 flex items-center text-white/80 hover:text-white transition-colors">
            <FiArrowLeft className="mr-2" /> Back
          </Link>
        </div>
      </div>

      {/* Profile Section */}
      <div className="container-max -mt-24 relative z-10 pb-16">
        <div className="bg-white rounded-2xl shadow-xl p-8 md:p-12">
          <div className="flex flex-col md:flex-row gap-8 items-start">
            <div className="w-48 h-48 rounded-2xl overflow-hidden shadow-lg flex-shrink-0 border-4 border-white">
              <img 
                src={artisan.profileImage || 'https://placehold.co/400'} 
                alt={artisan.name}
                className="w-full h-full object-cover"
                crossOrigin="anonymous"
                onError={(e) => {
                  e.target.src = 'https://placehold.co/400x400/2F5D50/ffffff?text=' + encodeURIComponent(artisan.name)
                }}
              />
            </div>
            <div className="flex-1">
              <div className="flex flex-wrap items-center gap-4 mb-4">
                <h1 className="text-4xl font-bold text-forest">{artisan.name}</h1>
                <span className="px-4 py-1 bg-terracotta/10 text-terracotta rounded-full text-sm font-bold uppercase tracking-wider">
                  Master Artisan
                </span>
              </div>
              
              <div className="flex flex-wrap gap-6 mb-8 text-gray-600">
                <div className="flex items-center">
                  <FiUsers className="mr-2 text-terracotta" />
                  <span>Tribe: <strong>{artisan.tribe}</strong></span>
                </div>
                <div className="flex items-center">
                  <FiMapPin className="mr-2 text-terracotta" />
                  <span>Region: <strong>{artisan.region}</strong></span>
                </div>
                <div className="flex items-center">
                  <FiStar className="mr-2 text-yellow-500" />
                  <span>4.9 (120+ reviews)</span>
                </div>
              </div>

              <div className="prose prose-forest max-w-none">
                <h3 className="text-xl font-bold mb-3 text-forest flex items-center">
                  <FiInfo className="mr-2" /> About the Artisan
                </h3>
                <p className="text-gray-700 leading-relaxed text-lg">
                  {artisan.bio}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Artisan's Products */}
        <div className="mt-16">
          <div className="flex justify-between items-center mb-10">
            <h2 className="text-3xl font-bold text-forest">Collection by {artisan.name}</h2>
            <div className="h-1 flex-1 mx-8 bg-sand hidden md:block"></div>
            <span className="text-gray-500 font-medium">{products.length} Products</span>
          </div>

          {products.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
              {products.map((product) => (
                <div key={product._id} className="group bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 border border-sand-200">
                  <div className="relative aspect-square overflow-hidden">
                    <img 
                      src={product.images && product.images.length > 0 ? product.images[0] : 'https://placehold.co/500'} 
                      alt={product.name}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                      crossOrigin="anonymous"
                      onError={(e) => {
                        e.target.src = 'https://placehold.co/500x500/C05621/ffffff?text=' + encodeURIComponent(product.name)
                      }}
                    />
                    {product.discount > 0 && (
                      <span className="absolute top-4 left-4 bg-terracotta text-white text-xs font-bold px-3 py-1 rounded-full shadow-lg">
                        {product.discount}% OFF
                      </span>
                    )}
                    <div className="absolute inset-x-0 bottom-0 p-4 translate-y-full group-hover:translate-y-0 transition-transform duration-300 bg-gradient-to-t from-black/60 to-transparent">
                      <Link 
                        to={`/products/${product._id}`}
                        className="w-full btn btn-primary py-2 text-sm flex items-center justify-center gap-2"
                      >
                        <FiShoppingBag /> View Details
                      </Link>
                    </div>
                  </div>
                  <div className="p-5">
                    <h3 className="font-bold text-lg text-forest mb-1 line-clamp-1">{product.name}</h3>
                    <div className="flex justify-between items-center">
                      <span className="text-xl font-bold text-terracotta">₹{product.price}</span>
                      <div className="flex items-center text-sm text-yellow-600">
                        <FiStar className="fill-current mr-1" />
                        <span>4.8</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-20 bg-white rounded-2xl shadow-sm border border-dashed border-sand-400">
              <p className="text-gray-500 text-lg">No products currently available from this artisan.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ArtisanProfile;
