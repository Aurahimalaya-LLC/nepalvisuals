
import React from 'react';

const reviewsData = [
  {
    avatar: 'https://randomuser.me/api/portraits/women/68.jpg',
    name: 'Sarah Jenkins',
    handle: '@sarahj',
    rating: 5,
    reviewText: 'An absolutely life-changing experience on the EBC trek. The guides were professional, knowledgeable, and incredibly supportive. The views are indescribable. Worth every single step!',
  },
  {
    avatar: 'https://randomuser.me/api/portraits/men/75.jpg',
    name: 'Marcus Chau',
    handle: '@mchau_travels',
    rating: 5,
    reviewText: 'This was my first high-altitude trek and I couldn\'t have chosen a better company. The itinerary was perfectly paced with acclimatization days, and our guide, Tenzing, was a legend.',
  },
  {
    avatar: 'https://randomuser.me/api/portraits/women/79.jpg',
    name: 'Priya Ayyangar',
    handle: '@priya_explores',
    rating: 5,
    reviewText: 'Incredible Annapurna Circuit trek with stunning scenery. The organization was top-notch from start to finish. The team handled everything professionally, making it a stress-free adventure.',
  },
];

const GoogleIcon = () => (
    <svg className="w-6 h-6" viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">
        <path fill="#4285F4" d="M43.611 20.083H42V20H24v8h11.303c-1.649 4.657-6.08 8-11.303 8-6.627 0-12-5.373-12-12s5.373-12 12-12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4 12.955 4 4 12.955 4 24s8.955 20 20 20 20-8.955 20-20c0-1.341-.138-2.65-.389-3.917z"/>
    </svg>
);

const StarRating: React.FC<{ rating: number }> = ({ rating }) => (
  <div className="flex text-yellow-400">
    {[...Array(5)].map((_, i) => (
      <span key={i} className={`material-symbols-outlined text-base ${i < rating ? 'text-yellow-400' : 'text-white/20'}`}>
        star
      </span>
    ))}
  </div>
);

const ReviewCard: React.FC<{ review: typeof reviewsData[0] }> = ({ review }) => (
  <div className="bg-surface-dark p-6 rounded-2xl border border-white/5 flex flex-col h-full hover:border-primary/30 transition-all hover:shadow-xl hover:shadow-primary/5">
    <div className="flex items-center mb-4">
      <img src={review.avatar} alt={review.name} className="w-12 h-12 rounded-full mr-4 object-cover" />
      <div>
        <h4 className="font-bold text-white">{review.name}</h4>
        <p className="text-sm text-text-secondary">{review.handle}</p>
      </div>
    </div>
    <div className="mb-4">
      <StarRating rating={review.rating} />
    </div>
    <p className="text-text-secondary leading-relaxed flex-grow text-sm">"{review.reviewText}"</p>
  </div>
);

const CustomerReviews: React.FC = () => {
  return (
    <section className="mb-24">
      <div className="text-center mb-10 px-2">
        <h2 className="text-3xl md:text-4xl font-bold text-white mb-2 tracking-tight">Stories from the Trail</h2>
        <p className="text-text-secondary max-w-2xl mx-auto">Don't just take our word for it. Here's what our adventurers have to say about their journey with us.</p>

        <div className="mt-8 inline-flex items-center gap-4 bg-surface-dark border border-white/10 rounded-full p-2 pr-6 shadow-lg">
            <div className="flex items-center gap-2 bg-white rounded-full px-3 py-1">
                <GoogleIcon />
                <span className="font-bold text-gray-700 text-sm">Reviews</span>
            </div>
            <div className="flex items-center gap-2">
                <span className="font-bold text-white text-lg">4.9</span>
                <div className="flex text-yellow-400">
                    <span className="material-symbols-outlined text-base">star</span>
                    <span className="material-symbols-outlined text-base">star</span>
                    <span className="material-symbols-outlined text-base">star</span>
                    <span className="material-symbols-outlined text-base">star</span>
                    <span className="material-symbols-outlined text-base">star_half</span>
                </div>
                <span className="text-sm text-text-secondary">(127 Reviews)</span>
            </div>
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {reviewsData.map((review, index) => (
          <ReviewCard key={index} review={review} />
        ))}
      </div>
    </section>
  );
};

export default CustomerReviews;
