import React from 'react';
import { Link } from 'react-router-dom';
import { Tour } from '../../lib/services/tourService';

interface TourViewHeaderProps {
  tour: Tour;
  onEdit: () => void;
  onDelete: () => void;
  onDuplicate: () => void;
  loading?: boolean;
}

export const TourViewHeader: React.FC<TourViewHeaderProps> = ({
  tour,
  onEdit,
  onDelete,
  onDuplicate,
  loading = false
}) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Published':
        return 'bg-green-100 text-green-800';
      case 'Draft':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getCategoryColor = (category: string | null) => {
    const colors: { [key: string]: string } = {
      'Cultural': 'bg-blue-100 text-blue-800',
      'Adventure': 'bg-orange-100 text-orange-800',
      'Culinary': 'bg-red-100 text-red-800',
      'Wildlife': 'bg-yellow-100 text-yellow-800',
      'Luxury': 'bg-purple-100 text-purple-800',
      'Hiking': 'bg-green-100 text-green-800',
      'Photography': 'bg-pink-100 text-pink-800',
      'Spiritual': 'bg-indigo-100 text-indigo-800',
    };
    return colors[category || ''] || 'bg-gray-100 text-gray-800';
  };

  if (loading) {
    return (
      <div className="mb-8 animate-pulse">
        <div className="flex items-center justify-between">
          <div>
            <div className="h-8 bg-gray-200 rounded w-64 mb-2"></div>
            <div className="h-4 bg-gray-200 rounded w-32"></div>
          </div>
          <div className="flex gap-2">
            <div className="h-10 bg-gray-200 rounded w-24"></div>
            <div className="h-10 bg-gray-200 rounded w-24"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="mb-8">
      {/* Breadcrumb Navigation */}
      <nav className="flex items-center space-x-2 text-sm text-admin-text-secondary mb-4">
        <Link to="/admin/tours" className="hover:text-admin-primary transition-colors">
          Tours
        </Link>
        <span>/</span>
        <span className="text-admin-text-primary font-medium">{tour.name}</span>
      </nav>

      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        {/* Tour Information */}
        <div className="flex-1">
          <div className="flex flex-wrap items-center gap-3 mb-2">
            <h1 className="text-2xl sm:text-3xl font-bold text-admin-text-primary">
              {tour.name}
            </h1>
            <div className="flex gap-2">
              <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(tour.status)}`}>
                {tour.status}
              </span>
              {tour.category && (
                <span className={`px-2 py-1 text-xs font-medium rounded-full ${getCategoryColor(tour.category)}`}>
                  {tour.category}
                </span>
              )}
            </div>
          </div>
          
          <div className="flex flex-wrap items-center gap-4 text-sm text-admin-text-secondary">
            <span>Tour ID: {tour.id}</span>
            {tour.destination && (
              <span>Destination: {tour.destination}</span>
            )}
            {tour.region && (
              <span>Region: {tour.region}</span>
            )}
            {tour.country && (
              <span>Country: {tour.country}</span>
            )}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2 flex-wrap">
          <button
            onClick={onEdit}
            className="flex items-center gap-2 px-4 py-2 bg-admin-primary text-white font-semibold rounded-lg shadow-sm hover:bg-admin-primary-hover transition-colors"
          >
            <span className="material-symbols-outlined text-base">edit</span>
            Edit Tour
          </button>
          
          <button
            onClick={onDuplicate}
            className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 font-semibold rounded-lg shadow-sm hover:bg-gray-200 transition-colors"
          >
            <span className="material-symbols-outlined text-base">content_copy</span>
            Duplicate
          </button>
          
          <button
            onClick={onDelete}
            className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white font-semibold rounded-lg shadow-sm hover:bg-red-700 transition-colors"
          >
            <span className="material-symbols-outlined text-base">delete</span>
            Delete
          </button>
        </div>
      </div>
    </div>
  );
};

export default TourViewHeader;