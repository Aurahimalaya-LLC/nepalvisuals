import React, { useState } from 'react';

interface TourHighlight {
  icon: string;
  text: string;
  title?: string;
  location?: string;
  time?: string;
  isSpecial?: boolean;
  category: 'experience' | 'accommodation' | 'meals' | 'transport' | 'guide' | 'safety';
}

interface TourHighlightsSectionProps {
  highlights: TourHighlight[];
  loading?: boolean;
  onHighlightAdd?: (highlight: TourHighlight) => void;
  onHighlightRemove?: (index: number) => void;
}

export const TourHighlightsSection: React.FC<TourHighlightsSectionProps> = ({
  highlights,
  loading = false,
  onHighlightAdd,
  onHighlightRemove
}) => {
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('list');
  const [showAddForm, setShowAddForm] = useState(false);
  const [newHighlight, setNewHighlight] = useState<TourHighlight>({
    icon: 'star',
    title: '',
    text: '',
    category: 'experience',
    isSpecial: false
  });

  const categories = {
    experience: { label: 'Experience', icon: 'explore', color: 'text-blue-600', bg: 'bg-blue-50' },
    accommodation: { label: 'Accommodation', icon: 'hotel', color: 'text-green-600', bg: 'bg-green-50' },
    meals: { label: 'Meals', icon: 'restaurant', color: 'text-orange-600', bg: 'bg-orange-50' },
    transport: { label: 'Transport', icon: 'directions_car', color: 'text-purple-600', bg: 'bg-purple-50' },
    guide: { label: 'Guide', icon: 'person', color: 'text-indigo-600', bg: 'bg-indigo-50' },
    safety: { label: 'Safety', icon: 'shield', color: 'text-red-600', bg: 'bg-red-50' },
  };

  // Group highlights by category for the list view
  const groupedHighlights = highlights.reduce((acc, highlight) => {
    if (!acc[highlight.category]) {
      acc[highlight.category] = [];
    }
    acc[highlight.category].push(highlight);
    return acc;
  }, {} as Record<string, TourHighlight[]>);

  const handleAddHighlight = () => {
    if (newHighlight.text.trim() && onHighlightAdd) {
      onHighlightAdd(newHighlight);
      setNewHighlight({ icon: 'star', title: '', text: '', category: 'experience', isSpecial: false });
      setShowAddForm(false);
    }
  };

  if (loading) {
    return (
      <div className="bg-admin-surface rounded-lg border border-admin-border p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-6 bg-gray-200 rounded w-1/4"></div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="flex items-center gap-3">
                <div className="w-8 h-8 bg-gray-200 rounded"></div>
                <div className="flex-1 h-4 bg-gray-200 rounded"></div>
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
          <h2 className="text-xl font-semibold text-admin-text-primary">Tour Highlights</h2>
          <div className="flex gap-2">
             <div className="flex bg-gray-100 rounded-lg p-1">
                <button
                    onClick={() => setViewMode('list')}
                    className={`p-1.5 rounded-md transition-all ${viewMode === 'list' ? 'bg-white shadow text-admin-primary' : 'text-admin-text-secondary hover:text-admin-text-primary'}`}
                    title="List View"
                >
                    <span className="material-symbols-outlined text-sm">format_list_bulleted</span>
                </button>
                <button
                    onClick={() => setViewMode('grid')}
                    className={`p-1.5 rounded-md transition-all ${viewMode === 'grid' ? 'bg-white shadow text-admin-primary' : 'text-admin-text-secondary hover:text-admin-text-primary'}`}
                    title="Grid View"
                >
                    <span className="material-symbols-outlined text-sm">grid_view</span>
                </button>
             </div>
            {onHighlightAdd && (
                <button
                onClick={() => setShowAddForm(!showAddForm)}
                className="px-4 py-2 bg-admin-primary text-white rounded-lg hover:bg-admin-primary-hover transition-colors text-sm font-medium"
                >
                Add Highlight
                </button>
            )}
          </div>
        </div>

        {/* Add Form */}
        {showAddForm && (
          <div className="mb-6 p-4 bg-gray-50 rounded-lg border border-admin-border">
            <h3 className="font-medium text-admin-text-primary mb-4">Add New Highlight</h3>
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-admin-text-secondary mb-1">Category</label>
                    <select
                      value={newHighlight.category}
                      onChange={(e) => setNewHighlight(prev => ({ ...prev, category: e.target.value as TourHighlight['category'] }))}
                      className="w-full px-3 py-2 border border-admin-border rounded-lg focus:ring-2 focus:ring-admin-primary focus:border-transparent text-sm"
                    >
                      {Object.entries(categories).map(([key, category]) => (
                        <option key={key} value={key}>{category.label}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-admin-text-secondary mb-1">Icon</label>
                    <select
                      value={newHighlight.icon}
                      onChange={(e) => setNewHighlight(prev => ({ ...prev, icon: e.target.value }))}
                      className="w-full px-3 py-2 border border-admin-border rounded-lg focus:ring-2 focus:ring-admin-primary focus:border-transparent text-sm"
                    >
                      <option value="star">⭐ Star</option>
                      <option value="explore">🌍 Explore</option>
                      <option value="hotel">🏨 Hotel</option>
                      <option value="restaurant">🍽️ Restaurant</option>
                      <option value="directions_car">🚗 Car</option>
                      <option value="person">👤 Person</option>
                      <option value="shield">🛡️ Shield</option>
                      <option value="thumb_up">👍 Thumbs Up</option>
                      <option value="check_circle">✅ Check</option>
                    </select>
                  </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-admin-text-secondary mb-1">Title (Location/Venue)</label>
                    <input
                      type="text"
                      value={newHighlight.title || ''}
                      onChange={(e) => setNewHighlight(prev => ({ ...prev, title: e.target.value }))}
                      className="w-full px-3 py-2 border border-admin-border rounded-lg focus:ring-2 focus:ring-admin-primary focus:border-transparent text-sm"
                      placeholder="e.g. Namche Bazaar"
                    />
                  </div>
                   <div>
                    <label className="block text-sm font-medium text-admin-text-secondary mb-1">Time/Date</label>
                    <input
                      type="text"
                      value={newHighlight.time || ''}
                      onChange={(e) => setNewHighlight(prev => ({ ...prev, time: e.target.value }))}
                      className="w-full px-3 py-2 border border-admin-border rounded-lg focus:ring-2 focus:ring-admin-primary focus:border-transparent text-sm"
                      placeholder="e.g. Day 3, Evening"
                    />
                  </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-admin-text-secondary mb-1">Description</label>
                <textarea
                  value={newHighlight.text}
                  onChange={(e) => setNewHighlight(prev => ({ ...prev, text: e.target.value }))}
                  rows={2}
                  className="w-full px-3 py-2 border border-admin-border rounded-lg focus:ring-2 focus:ring-admin-primary focus:border-transparent text-sm"
                  placeholder="Describe this highlight (15-30 words)..."
                />
              </div>
              
              <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="isSpecial"
                    checked={newHighlight.isSpecial}
                    onChange={(e) => setNewHighlight(prev => ({ ...prev, isSpecial: e.target.checked }))}
                    className="rounded border-gray-300 text-admin-primary focus:ring-admin-primary"
                  />
                  <label htmlFor="isSpecial" className="text-sm text-admin-text-primary">Mark as Special Experience (*)</label>
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  onClick={handleAddHighlight}
                  className="px-4 py-2 bg-admin-primary text-white rounded-lg hover:bg-admin-primary-hover transition-colors text-sm font-medium"
                >
                  Add Highlight
                </button>
                <button
                  onClick={() => setShowAddForm(false)}
                  className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors text-sm font-medium"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}

        {highlights.length === 0 ? (
          <div className="text-center py-8">
            <span className="material-symbols-outlined text-4xl text-admin-text-secondary mb-2">star</span>
            <p className="text-admin-text-secondary">No highlights available for this tour.</p>
          </div>
        ) : (
            <>
            {viewMode === 'list' ? (
                <div className="space-y-6">
                    {Object.entries(groupedHighlights).map(([categoryKey, categoryHighlights]) => {
                        const highlights = categoryHighlights as TourHighlight[];
                        const category = categories[categoryKey as keyof typeof categories];
                        return (
                            <div key={categoryKey} className="space-y-3">
                                <div className="flex items-center gap-2 pb-2 border-b border-admin-border">
                                    <span className={`material-symbols-outlined ${category.color} text-xl`}>{category.icon}</span>
                                    <h3 className="font-semibold text-admin-text-primary">{category.label}</h3>
                                </div>
                                <ul className="space-y-3 pl-2">
                                    {highlights.map((highlight, index) => (
                                        <li key={index} className={`relative pl-4 border-l-2 ${highlight.isSpecial ? 'border-yellow-400' : 'border-gray-200'} py-1 transition-colors hover:bg-gray-50 rounded-r-lg`}>
                                            <div className="flex items-start justify-between gap-4 pr-2">
                                                <div className="flex-1">
                                                    <div className="flex items-baseline gap-2 flex-wrap">
                                                        {highlight.title && (
                                                            <span className="font-semibold text-admin-text-primary text-sm">
                                                                {highlight.title}
                                                            </span>
                                                        )}
                                                        {highlight.time && (
                                                            <span className="text-xs text-admin-text-secondary bg-gray-100 px-1.5 py-0.5 rounded">
                                                                {highlight.time}
                                                            </span>
                                                        )}
                                                        {highlight.isSpecial && (
                                                            <span className="text-yellow-500 material-symbols-outlined text-sm" title="Special Experience">star</span>
                                                        )}
                                                    </div>
                                                    <p className="text-sm text-gray-600 mt-0.5 leading-relaxed">
                                                        {highlight.text}
                                                    </p>
                                                    {highlight.location && highlight.location !== highlight.title && (
                                                        <div className="flex items-center gap-1 mt-1 text-xs text-admin-text-secondary">
                                                            <span className="material-symbols-outlined text-[10px]">location_on</span>
                                                            {highlight.location}
                                                        </div>
                                                    )}
                                                </div>
                                                {onHighlightRemove && (
                                                    <button
                                                        onClick={() => onHighlightRemove(highlights.indexOf(highlight))}
                                                        className="text-gray-400 hover:text-red-500 transition-colors"
                                                        aria-label="Remove highlight"
                                                    >
                                                        <span className="material-symbols-outlined text-sm">close</span>
                                                    </button>
                                                )}
                                            </div>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        );
                    })}
                </div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {highlights.map((highlight, index) => (
                    <div key={index} className={`flex items-start gap-3 p-4 rounded-lg hover:bg-gray-100 transition-colors group ${highlight.isSpecial ? 'bg-yellow-50/50 border border-yellow-100' : 'bg-gray-50'}`}>
                        <div className="relative">
                            <span className={`material-symbols-outlined text-xl ${categories[highlight.category].color} flex-shrink-0`}>
                            {highlight.icon}
                            </span>
                            {highlight.isSpecial && (
                                <span className="absolute -top-1 -right-1 w-2 h-2 bg-yellow-400 rounded-full"></span>
                            )}
                        </div>
                        <div className="flex-1">
                        {highlight.title && <p className="font-medium text-sm text-admin-text-primary mb-0.5">{highlight.title}</p>}
                        <p className="text-sm text-admin-text-secondary">{highlight.text}</p>
                        <div className="flex flex-wrap gap-2 mt-2">
                             <span className="text-xs text-admin-text-secondary px-1.5 py-0.5 bg-white rounded border border-gray-200">
                                {categories[highlight.category].label}
                            </span>
                            {highlight.time && (
                                <span className="text-xs text-admin-text-secondary px-1.5 py-0.5 bg-white rounded border border-gray-200">
                                    {highlight.time}
                                </span>
                            )}
                        </div>
                        </div>
                        {onHighlightRemove && (
                        <button
                            onClick={() => onHighlightRemove(index)}
                            className="opacity-0 group-hover:opacity-100 transition-opacity text-red-500 hover:text-red-700"
                        >
                            <span className="material-symbols-outlined text-sm">delete</span>
                        </button>
                        )}
                    </div>
                    ))}
                </div>
            )}
            </>
        )}

        {/* Summary */}
        <div className="mt-6 pt-6 border-t border-admin-border">
          <div className="flex items-center justify-between text-sm text-admin-text-secondary">
            <span>Total Highlights: {highlights.length}</span>
            <span>Special Moments: {highlights.filter(h => h.isSpecial).length}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TourHighlightsSection;