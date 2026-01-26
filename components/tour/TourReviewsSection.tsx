import React, { useState, useMemo } from 'react';

interface Review {
  id: string;
  customer_name: string;
  rating: number;
  title: string;
  content: string;
  date: string;
  verified: boolean;
  helpful: number;
}

interface TourReviewsSectionProps {
  tourId: string;
  reviews: Review[];
  loading?: boolean;
  onReviewSubmit?: (review: Partial<Review>) => void;
}

export const TourReviewsSection: React.FC<TourReviewsSectionProps> = ({
  tourId,
  reviews,
  loading = false,
  onReviewSubmit
}) => {
  const [sortBy, setSortBy] = useState<'date' | 'rating' | 'helpful'>('date');
  const [filterRating, setFilterRating] = useState<number | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [newReview, setNewReview] = useState({
    rating: 5,
    title: '',
    content: ''
  });

  const filteredAndSortedReviews = useMemo(() => {
    let filtered = reviews;
    
    if (filterRating !== null) {
      filtered = reviews.filter(review => review.rating === filterRating);
    }

    return filtered.sort((a, b) => {
      switch (sortBy) {
        case 'date':
          return new Date(b.date).getTime() - new Date(a.date).getTime();
        case 'rating':
          return b.rating - a.rating;
        case 'helpful':
          return b.helpful - a.helpful;
        default:
          return 0;
      }
    });
  }, [reviews, sortBy, filterRating]);

  const averageRating = useMemo(() => {
    if (reviews.length === 0) return 0;
    return reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length;
  }, [reviews]);

  const ratingDistribution = useMemo(() => {
    const distribution = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
    reviews.forEach(review => {
      distribution[review.rating as keyof typeof distribution]++;
    });
    return distribution;
  }, [reviews]);

  const handleSubmitReview = () => {
    if (onReviewSubmit) {
      onReviewSubmit(newReview);
      setNewReview({ rating: 5, title: '', content: '' });
      setShowForm(false);
    }
  };

  const StarRating = ({ rating, interactive = false, onRatingChange }: { 
    rating: number; 
    interactive?: boolean; 
    onRatingChange?: (rating: number) => void;
  }) => (
    <div className="flex items-center gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          onClick={() => interactive && onRatingChange && onRatingChange(star)}
          className={`${interactive ? 'cursor-pointer hover:scale-110' : 'cursor-default'} transition-transform`}
          disabled={!interactive}
        >
          <span className={`material-symbols-outlined text-lg ${
            star <= rating ? 'text-yellow-400' : 'text-gray-300'
          }`}>
            {star <= rating ? 'star' : 'star_outline'}
          </span>
        </button>
      ))}
    </div>
  );

  if (loading) {
    return (
      <div className="bg-admin-surface rounded-lg border border-admin-border p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-6 bg-gray-200 rounded w-1/4"></div>
          <div className="space-y-3">
            {[1, 2, 3].map(i => (
              <div key={i} className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-12 h-12 bg-gray-200 rounded-full"></div>
                  <div className="flex-1">
                    <div className="h-4 bg-gray-200 rounded w-1/4 mb-1"></div>
                    <div className="h-3 bg-gray-200 rounded w-1/6"></div>
                  </div>
                </div>
                <div className="h-3 bg-gray-200 rounded w-full mb-1"></div>
                <div className="h-3 bg-gray-200 rounded w-3/4"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-admin-surface rounded-lg border border-admin-border">
      <div className="p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-admin-text-primary">Customer Reviews</h2>
          <button
            onClick={() => setShowForm(!showForm)}
            className="px-4 py-2 bg-admin-primary text-white rounded-lg hover:bg-admin-primary-hover transition-colors"
          >
            Write Review
          </button>
        </div>

        {/* Review Form */}
        {showForm && (
          <div className="mb-6 p-4 bg-gray-50 rounded-lg">
            <h3 className="font-medium text-admin-text-primary mb-4">Write a Review</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-admin-text-secondary mb-2">Rating</label>
                <StarRating 
                  rating={newReview.rating} 
                  interactive={true}
                  onRatingChange={(rating) => setNewReview(prev => ({ ...prev, rating }))}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-admin-text-secondary mb-2">Title</label>
                <input
                  type="text"
                  value={newReview.title}
                  onChange={(e) => setNewReview(prev => ({ ...prev, title: e.target.value }))}
                  className="w-full px-3 py-2 border border-admin-border rounded-lg focus:ring-2 focus:ring-admin-primary focus:border-transparent"
                  placeholder="Summarize your experience"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-admin-text-secondary mb-2">Your Review</label>
                <textarea
                  value={newReview.content}
                  onChange={(e) => setNewReview(prev => ({ ...prev, content: e.target.value }))}
                  rows={4}
                  className="w-full px-3 py-2 border border-admin-border rounded-lg focus:ring-2 focus:ring-admin-primary focus:border-transparent"
                  placeholder="Share your experience with this tour"
                />
              </div>
              <div className="flex gap-3">
                <button
                  onClick={handleSubmitReview}
                  className="px-4 py-2 bg-admin-primary text-white rounded-lg hover:bg-admin-primary-hover transition-colors"
                >
                  Submit Review
                </button>
                <button
                  onClick={() => setShowForm(false)}
                  className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Summary Stats */}
        {reviews.length > 0 && (
          <div className="mb-6 p-4 bg-gray-50 rounded-lg">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-4">
                <div className="text-center">
                  <div className="text-3xl font-bold text-admin-text-primary">{averageRating.toFixed(1)}</div>
                  <StarRating rating={Math.round(averageRating)} />
                  <div className="text-sm text-admin-text-secondary">{reviews.length} reviews</div>
                </div>
                <div className="flex-1">
                  {[5, 4, 3, 2, 1].map((rating) => (
                    <div key={rating} className="flex items-center gap-2 mb-1">
                      <span className="text-sm text-admin-text-secondary w-4">{rating}</span>
                      <div className="flex-1 bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-yellow-400 h-2 rounded-full"
                          style={{
                            width: `${reviews.length > 0 ? (ratingDistribution[rating as keyof typeof ratingDistribution] / reviews.length) * 100 : 0}%`
                          }}
                        />
                      </div>
                      <span className="text-sm text-admin-text-secondary w-8 text-right">
                        {ratingDistribution[rating as keyof typeof ratingDistribution]}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Filters and Sort */}
        <div className="mb-6 flex flex-wrap gap-4 items-center">
          <div className="flex items-center gap-2">
            <label className="text-sm font-medium text-admin-text-secondary">Sort by:</label>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as 'date' | 'rating' | 'helpful')}
              className="px-3 py-1 text-sm border border-admin-border rounded-lg focus:ring-2 focus:ring-admin-primary focus:border-transparent"
            >
              <option value="date">Most Recent</option>
              <option value="rating">Highest Rating</option>
              <option value="helpful">Most Helpful</option>
            </select>
          </div>

          <div className="flex items-center gap-2">
            <label className="text-sm font-medium text-admin-text-secondary">Filter:</label>
            <div className="flex gap-2">
              {[5, 4, 3, 2, 1].map((rating) => (
                <button
                  key={rating}
                  onClick={() => setFilterRating(filterRating === rating ? null : rating)}
                  className={`flex items-center gap-1 px-2 py-1 text-sm rounded-lg border transition-colors ${
                    filterRating === rating
                      ? 'bg-admin-primary text-white border-admin-primary'
                      : 'bg-white text-admin-text-secondary border-admin-border hover:bg-gray-50'
                  }`}
                >
                  <span className="material-symbols-outlined text-xs">star</span>
                  {rating}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Reviews List */}
        <div className="space-y-4">
          {filteredAndSortedReviews.length === 0 ? (
            <div className="text-center py-8">
              <span className="material-symbols-outlined text-4xl text-admin-text-secondary mb-2">reviews</span>
              <p className="text-admin-text-secondary">No reviews match your filters.</p>
            </div>
          ) : (
            filteredAndSortedReviews.map((review) => (
              <div key={review.id} className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center">
                      <span className="material-symbols-outlined text-gray-500">person</span>
                    </div>
                    <div>
                      <h4 className="font-medium text-admin-text-primary">{review.customer_name}</h4>
                      <div className="flex items-center gap-2">
                        <StarRating rating={review.rating} />
                        <span className="text-sm text-admin-text-secondary">
                          {new Date(review.date).toLocaleDateString()}
                        </span>
                        {review.verified && (
                          <span className="inline-flex items-center gap-1 px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">
                            <span className="material-symbols-outlined text-xs">verified</span>
                            Verified
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                <h5 className="font-medium text-admin-text-primary mb-2">{review.title}</h5>
                <p className="text-admin-text-secondary leading-relaxed mb-3">{review.content}</p>

                <div className="flex items-center justify-between text-sm">
                  <button className="flex items-center gap-2 text-admin-text-secondary hover:text-admin-primary transition-colors">
                    <span className="material-symbols-outlined text-sm">thumb_up</span>
                    Helpful ({review.helpful})
                  </button>
                  <button className="text-admin-text-secondary hover:text-admin-primary transition-colors">
                    Report
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default TourReviewsSection;