import React, { useState } from 'react';
import { Tour, TourService, TourInclusion } from '../lib/services/tourService';

interface InclusionsTabProps {
    tour: Partial<Tour>;
    onChange: (updates: Partial<Tour>) => void;
    refreshTour: () => void;
}

const InclusionsTab: React.FC<InclusionsTabProps> = ({ tour, onChange, refreshTour }) => {
    const [newItemText, setNewItemText] = useState('');
    const [isExclusion, setIsExclusion] = useState(false);
    const [isAdding, setIsAdding] = useState(false);

    const handleAddItem = async () => {
        if (!tour.id || !newItemText.trim()) return;

        try {
            await TourService.addInclusion({
                tour_id: tour.id,
                item: newItemText.trim(),
                is_excluded: isExclusion
            });
            setNewItemText('');
            setIsAdding(false);
            refreshTour();
        } catch (error) {
            console.error('Failed to add item:', error);
            alert('Failed to add item. Please try again.');
        }
    };

    const handleDeleteItem = async (id: string) => {
        if (!window.confirm('Are you sure you want to delete this item?')) return;
        
        try {
            await TourService.deleteInclusion(id);
            refreshTour();
        } catch (error) {
            console.error('Failed to delete item:', error);
            alert('Failed to delete item. Please try again.');
        }
    };

    const inclusions = tour.inclusions?.filter(i => !i.is_excluded) || [];
    const exclusions = tour.inclusions?.filter(i => i.is_excluded) || [];

    return (
        <div className="space-y-6">
            <div className="bg-admin-surface rounded-lg border border-admin-border p-6">
                <div className="flex items-center justify-between mb-6">
                    <h3 className="text-lg font-semibold text-admin-text-primary">Inclusions & Exclusions</h3>
                    <button
                        onClick={() => setIsAdding(true)}
                        className="px-3 py-2 bg-admin-primary text-white rounded-lg text-sm font-semibold hover:bg-admin-primary-hover transition-colors"
                    >
                        Add Item
                    </button>
                </div>

                {isAdding && (
                    <div className="mb-6 p-4 bg-admin-background rounded-lg border border-admin-border">
                        <h4 className="font-medium mb-3">Add New Item</h4>
                        <div className="space-y-3">
                            <div>
                                <label className="block text-sm font-medium text-admin-text-secondary mb-1">Description</label>
                                <input
                                    type="text"
                                    value={newItemText}
                                    onChange={(e) => setNewItemText(e.target.value)}
                                    className="w-full border border-admin-border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-admin-primary focus:border-transparent outline-none"
                                    placeholder="e.g., Airport transfers"
                                />
                            </div>
                            <div className="flex items-center gap-2">
                                <input
                                    type="checkbox"
                                    id="is-exclusion"
                                    checked={isExclusion}
                                    onChange={(e) => setIsExclusion(e.target.checked)}
                                    className="rounded border-gray-300 text-admin-primary focus:ring-admin-primary"
                                />
                                <label htmlFor="is-exclusion" className="text-sm text-admin-text-primary">Mark as Exclusion (Not Included)</label>
                            </div>
                            <div className="flex gap-2 pt-2">
                                <button
                                    onClick={handleAddItem}
                                    disabled={!newItemText.trim()}
                                    className="px-3 py-2 bg-admin-primary text-white rounded-lg text-sm font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    Save Item
                                </button>
                                <button
                                    onClick={() => {
                                        setIsAdding(false);
                                        setNewItemText('');
                                        setIsExclusion(false);
                                    }}
                                    className="px-3 py-2 border border-admin-border rounded-lg text-sm hover:bg-gray-50"
                                >
                                    Cancel
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                <div className="grid md:grid-cols-2 gap-6">
                    {/* Inclusions Column */}
                    <div>
                        <div className="flex items-center gap-2 mb-3">
                            <span className="material-symbols-outlined text-green-600">check_circle</span>
                            <h4 className="font-semibold text-admin-text-primary">What's Included</h4>
                        </div>
                        {inclusions.length === 0 ? (
                            <p className="text-sm text-admin-text-secondary italic">No inclusions added yet.</p>
                        ) : (
                            <ul className="space-y-2">
                                {inclusions.map(item => (
                                    <li key={item.id} className="flex items-start justify-between group p-2 hover:bg-admin-background rounded-md transition-colors">
                                        <span className="text-sm text-admin-text-primary">{item.item}</span>
                                        <button
                                            onClick={() => handleDeleteItem(item.id)}
                                            className="opacity-0 group-hover:opacity-100 p-1 text-admin-text-secondary hover:text-red-600 transition-opacity"
                                            title="Delete"
                                        >
                                            <span className="material-symbols-outlined text-sm">delete</span>
                                        </button>
                                    </li>
                                ))}
                            </ul>
                        )}
                    </div>

                    {/* Exclusions Column */}
                    <div>
                        <div className="flex items-center gap-2 mb-3">
                            <span className="material-symbols-outlined text-red-600">cancel</span>
                            <h4 className="font-semibold text-admin-text-primary">What's Not Included</h4>
                        </div>
                        {exclusions.length === 0 ? (
                            <p className="text-sm text-admin-text-secondary italic">No exclusions added yet.</p>
                        ) : (
                            <ul className="space-y-2">
                                {exclusions.map(item => (
                                    <li key={item.id} className="flex items-start justify-between group p-2 hover:bg-admin-background rounded-md transition-colors">
                                        <span className="text-sm text-admin-text-primary">{item.item}</span>
                                        <button
                                            onClick={() => handleDeleteItem(item.id)}
                                            className="opacity-0 group-hover:opacity-100 p-1 text-admin-text-secondary hover:text-red-600 transition-opacity"
                                            title="Delete"
                                        >
                                            <span className="material-symbols-outlined text-sm">delete</span>
                                        </button>
                                    </li>
                                ))}
                            </ul>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default InclusionsTab;
