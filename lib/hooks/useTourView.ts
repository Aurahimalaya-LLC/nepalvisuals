import { useState, useCallback, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Tour } from '../services/tourService';
import { useNotifications } from '../../components/common/NotificationSystem';

export interface TourViewState {
  // UI State
  activeTab: string;
  expandedSections: string[];
  viewMode: 'grid' | 'list';
  
  // Interaction State
  isEditing: boolean;
  showDeleteConfirm: boolean;
  showDuplicateModal: boolean;
  
  // Filter State
  filterBy: {
    category?: string;
    difficulty?: string;
    priceRange?: [number, number];
    duration?: string;
  };
  
  // Sort State
  sortBy: 'name' | 'price' | 'duration' | 'created_at' | 'updated_at';
  sortOrder: 'asc' | 'desc';
  
  // Pagination State
  currentPage: number;
  itemsPerPage: number;
}

export interface TourViewActions {
  // Tab Management
  setActiveTab: (tab: string) => void;
  toggleSection: (section: string) => void;
  expandAllSections: () => void;
  collapseAllSections: () => void;
  
  // View Management
  setViewMode: (mode: 'grid' | 'list') => void;
  
  // Filter Management
  setFilter: (filterType: keyof TourViewState['filterBy'], value: any) => void;
  clearFilter: (filterType: keyof TourViewState['filterBy']) => void;
  clearAllFilters: () => void;
  
  // Sort Management
  setSortBy: (field: TourViewState['sortBy']) => void;
  setSortOrder: (order: 'asc' | 'desc') => void;
  toggleSortOrder: () => void;
  
  // Pagination Management
  setCurrentPage: (page: number) => void;
  setItemsPerPage: (items: number) => void;
  
  // Modal Management
  showDeleteConfirmation: () => void;
  hideDeleteConfirmation: () => void;
  showDuplicateModal: () => void;
  hideDuplicateModal: () => void;
  
  // Tour Actions
  handleEdit: (tour: Tour) => void;
  handleDelete: (tour: Tour) => Promise<void>;
  handleDuplicate: (tour: Tour) => Promise<void>;
  handleShare: (tour: Tour) => void;
  handleExport: (tour: Tour) => void;
}

const useTourView = (tour: Tour | null): [TourViewState, TourViewActions] => {
  const navigate = useNavigate();
  const { addNotification } = useNotifications();
  
  const [state, setState] = useState<TourViewState>({
    activeTab: 'overview',
    expandedSections: ['details', 'pricing', 'itinerary'],
    viewMode: 'grid',
    isEditing: false,
    showDeleteConfirm: false,
    showDuplicateModal: false,
    filterBy: {},
    sortBy: 'created_at',
    sortOrder: 'desc',
    currentPage: 1,
    itemsPerPage: 10,
  });

  // Tab Management
  const setActiveTab = useCallback((tab: string) => {
    setState(prev => ({ ...prev, activeTab: tab }));
  }, []);

  const toggleSection = useCallback((section: string) => {
    setState(prev => ({
      ...prev,
      expandedSections: prev.expandedSections.includes(section)
        ? prev.expandedSections.filter(s => s !== section)
        : [...prev.expandedSections, section]
    }));
  }, []);

  const expandAllSections = useCallback(() => {
    setState(prev => ({
      ...prev,
      expandedSections: ['details', 'pricing', 'itinerary', 'inclusions', 'gallery', 'reviews']
    }));
  }, []);

  const collapseAllSections = useCallback(() => {
    setState(prev => ({ ...prev, expandedSections: [] }));
  }, []);

  // View Management
  const setViewMode = useCallback((mode: 'grid' | 'list') => {
    setState(prev => ({ ...prev, viewMode: mode }));
    localStorage.setItem('tourViewMode', mode);
  }, []);

  // Filter Management
  const setFilter = useCallback((filterType: keyof TourViewState['filterBy'], value: any) => {
    setState(prev => ({
      ...prev,
      filterBy: { ...prev.filterBy, [filterType]: value },
      currentPage: 1 // Reset to first page when filtering
    }));
  }, []);

  const clearFilter = useCallback((filterType: keyof TourViewState['filterBy']) => {
    setState(prev => {
      const newFilterBy = { ...prev.filterBy };
      delete newFilterBy[filterType];
      return { ...prev, filterBy: newFilterBy };
    });
  }, []);

  const clearAllFilters = useCallback(() => {
    setState(prev => ({ ...prev, filterBy: {}, currentPage: 1 }));
  }, []);

  // Sort Management
  const setSortBy = useCallback((field: TourViewState['sortBy']) => {
    setState(prev => ({ ...prev, sortBy: field }));
    localStorage.setItem('tourSortBy', field);
  }, []);

  const setSortOrder = useCallback((order: 'asc' | 'desc') => {
    setState(prev => ({ ...prev, sortOrder: order }));
    localStorage.setItem('tourSortOrder', order);
  }, []);

  const toggleSortOrder = useCallback(() => {
    setState(prev => ({
      ...prev,
      sortOrder: prev.sortOrder === 'asc' ? 'desc' : 'asc'
    }));
  }, []);

  // Pagination Management
  const setCurrentPage = useCallback((page: number) => {
    setState(prev => ({ ...prev, currentPage: page }));
  }, []);

  const setItemsPerPage = useCallback((items: number) => {
    setState(prev => ({ ...prev, itemsPerPage: items, currentPage: 1 }));
    localStorage.setItem('tourItemsPerPage', items.toString());
  }, []);

  // Modal Management
  const showDeleteConfirmation = useCallback(() => {
    setState(prev => ({ ...prev, showDeleteConfirm: true }));
  }, []);

  const hideDeleteConfirmation = useCallback(() => {
    setState(prev => ({ ...prev, showDeleteConfirm: false }));
  }, []);

  const showDuplicateModal = useCallback(() => {
    setState(prev => ({ ...prev, showDuplicateModal: true }));
  }, []);

  const hideDuplicateModal = useCallback(() => {
    setState(prev => ({ ...prev, showDuplicateModal: false }));
  }, []);

  // Tour Actions
  const handleEdit = useCallback((tour: Tour) => {
    navigate(`/admin/trek/edit/${tour.id}`);
  }, [navigate]);

  const handleDelete = useCallback(async (tour: Tour) => {
    try {
      // This would be implemented with the actual delete logic
      addNotification({
        type: 'success',
        title: 'Tour Deleted',
        message: `${tour.name} has been successfully deleted.`
      });
      navigate('/admin/tours');
    } catch (error) {
      addNotification({
        type: 'error',
        title: 'Delete Failed',
        message: 'Failed to delete the tour. Please try again.'
      });
    }
  }, [addNotification, navigate]);

  const handleDuplicate = useCallback(async (tour: Tour) => {
    try {
      // This would be implemented with the actual duplicate logic
      addNotification({
        type: 'success',
        title: 'Tour Duplicated',
        message: `${tour.name} has been successfully duplicated.`
      });
    } catch (error) {
      addNotification({
        type: 'error',
        title: 'Duplicate Failed',
        message: 'Failed to duplicate the tour. Please try again.'
      });
    }
  }, [addNotification]);

  const handleShare = useCallback((tour: Tour) => {
    const url = `${window.location.origin}/trip/${tour.url_slug}`;
    navigator.clipboard.writeText(url).then(() => {
      addNotification({
        type: 'success',
        title: 'Link Copied',
        message: 'Tour link has been copied to clipboard.'
      });
    }).catch(() => {
      addNotification({
        type: 'error',
        title: 'Copy Failed',
        message: 'Failed to copy the link. Please try again.'
      });
    });
  }, [addNotification]);

  const handleExport = useCallback((tour: Tour) => {
    // This would be implemented with the actual export logic
    addNotification({
      type: 'info',
      title: 'Export Started',
      message: `Exporting ${tour.name}...`
    });
  }, [addNotification]);

  // Load preferences from localStorage
  useEffect(() => {
    const savedViewMode = localStorage.getItem('tourViewMode') as 'grid' | 'list';
    const savedSortBy = localStorage.getItem('tourSortBy') as TourViewState['sortBy'];
    const savedSortOrder = localStorage.getItem('tourSortOrder') as 'asc' | 'desc';
    const savedItemsPerPage = localStorage.getItem('tourItemsPerPage');

    setState(prev => ({
      ...prev,
      viewMode: savedViewMode || prev.viewMode,
      sortBy: savedSortBy || prev.sortBy,
      sortOrder: savedSortOrder || prev.sortOrder,
      itemsPerPage: savedItemsPerPage ? parseInt(savedItemsPerPage) : prev.itemsPerPage,
    }));
  }, []);

  const actions: TourViewActions = {
    setActiveTab,
    toggleSection,
    expandAllSections,
    collapseAllSections,
    setViewMode,
    setFilter,
    clearFilter,
    clearAllFilters,
    setSortBy,
    setSortOrder,
    toggleSortOrder,
    setCurrentPage,
    setItemsPerPage,
    showDeleteConfirmation,
    hideDeleteConfirmation,
    showDuplicateModal,
    hideDuplicateModal,
    handleEdit,
    handleDelete,
    handleDuplicate,
    handleShare,
    handleExport,
  };

  return [state, actions];
};

export default useTourView;