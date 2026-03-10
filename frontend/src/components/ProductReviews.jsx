import React, { useState, useEffect } from 'react';
import { FiStar, FiUser, FiCalendar, FiSend } from 'react-icons/fi';
import { useAuth } from '../contexts/AuthContext';
import { toast } from 'react-hot-toast';
import { productsAPI } from '../services/api';

const ProductReviews = ({ productId }) => {
  const { user, isAuthenticated } = useAuth();
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newReview, setNewReview] = useState({
    rating: 0,
    comment: ''
  });
  const [submitting, setSubmitting] = useState(false);
  const [userHasReviewed, setUserHasReviewed] = useState(false);

  useEffect(() => {
    fetchReviews();
  }, [productId]);

  const fetchReviews = async () => {
    try {
      setLoading(true);
      const response = await productsAPI.getProductReviews(productId);
      const list = response.data?.reviews || [];
      setReviews(list);
      
      // Check if user has already reviewed
      if (isAuthenticated && user) {
        const hasReviewed = list.some(review => (review.user?._id || review.user) === user._id);
        setUserHasReviewed(hasReviewed);
      }
    } catch (error) {
      console.error('Error fetching reviews:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRatingChange = (rating) => {
    setNewReview({ ...newReview, rating });
  };

  const handleCommentChange = (e) => {
    setNewReview({ ...newReview, comment: e.target.value });
  };

  const handleSubmitReview = async (e) => {
    e.preventDefault();
    
    if (newReview.rating === 0) {
      toast.error('Please select a rating');
      return;
    }
    
    try {
      setSubmitting(true);
      await productsAPI.addProductReview(productId, newReview);
      toast.success('Review submitted successfully');
      setNewReview({ rating: 0, comment: '' });
      fetchReviews(); // Refresh reviews
    } catch (error) {
      console.error('Error submitting review:', error);
      toast.error('Failed to submit review');
    } finally {
      setSubmitting(false);
    }
  };

  const renderStars = (rating) => {
    return Array(5).fill(0).map((_, index) => (
      <FiStar 
        key={index} 
        className={`w-5 h-5 ${index < rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'}`} 
      />
    ));
  };

  const calculateAverageRating = () => {
    if (reviews.length === 0) return 0;
    const sum = reviews.reduce((total, review) => total + review.rating, 0);
    return (sum / reviews.length).toFixed(1);
  };

  return (
    <div className="mt-10">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Customer Reviews</h2>
      
      {/* Review Summary */}
      <div className="bg-gray-50 p-4 rounded-lg mb-6">
        <div className="flex items-center">
          <div className="text-4xl font-bold text-gray-900 mr-4">{calculateAverageRating()}</div>
          <div>
            <div className="flex mb-1">
              {renderStars(Math.round(calculateAverageRating()))}
            </div>
            <p className="text-sm text-gray-500">Based on {reviews.length} reviews</p>
          </div>
        </div>
      </div>
      
      {/* Add Review Form */}
      {isAuthenticated && !userHasReviewed && (
        <div className="bg-white p-6 rounded-lg shadow-sm mb-8">
          <h3 className="text-lg font-semibold mb-4">Write a Review</h3>
          <form onSubmit={handleSubmitReview}>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">Rating</label>
              <div className="flex space-x-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => handleRatingChange(star)}
                    className="focus:outline-none"
                  >
                    <FiStar 
                      className={`w-8 h-8 ${star <= newReview.rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'}`} 
                    />
                  </button>
                ))}
              </div>
            </div>
            <div className="mb-4">
              <label htmlFor="comment" className="block text-sm font-medium text-gray-700 mb-2">
                Your Review
              </label>
              <textarea
                id="comment"
                rows="4"
                value={newReview.comment}
                onChange={handleCommentChange}
                className="w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-amber-500 focus:border-amber-500"
                placeholder="Share your experience with this product..."
              ></textarea>
            </div>
            <button
              type="submit"
              disabled={submitting}
              className="flex items-center justify-center w-full md:w-auto px-6 py-2 bg-amber-600 text-white rounded-md hover:bg-amber-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-500 disabled:opacity-50"
            >
              {submitting ? (
                <>Submitting...</>
              ) : (
                <>
                  <FiSend className="mr-2" />
                  Submit Review
                </>
              )}
            </button>
          </form>
        </div>
      )}
      
      {/* Reviews List */}
      {loading ? (
        <div className="flex justify-center py-8">
          <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-amber-600"></div>
        </div>
      ) : reviews.length === 0 ? (
        <div className="text-center py-8 bg-gray-50 rounded-lg">
          <p className="text-gray-500">No reviews yet. Be the first to review this product!</p>
        </div>
      ) : (
        <div className="space-y-6">
          {reviews.map((review) => (
            <div key={review._id} className="bg-white p-6 rounded-lg shadow-sm">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <div className="flex items-center mb-2">
                    <div className="flex mr-2">
                      {renderStars(review.rating)}
                    </div>
                    <span className="text-sm font-medium text-gray-900">{review.rating}/5</span>
                  </div>
                  <h4 className="font-medium text-gray-900">{review.title || 'Review'}</h4>
                </div>
                <div className="text-sm text-gray-500">
                  {new Date(review.createdAt).toLocaleDateString()}
                </div>
              </div>
              <p className="text-gray-700 mb-4">{review.comment}</p>
              <div className="flex items-center text-sm text-gray-500">
                <FiUser className="mr-1" />
                <span>{review.user?.name || 'Anonymous'}</span>
                <span className="mx-2">•</span>
                <FiCalendar className="mr-1" />
                <span>Verified Purchase</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ProductReviews;