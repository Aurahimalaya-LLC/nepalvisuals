import React, { useState } from 'react';
import { Tour } from '../../lib/services/tourService';

interface AdminTourPricingPanelProps {
    tour: Tour;
    onPriceUpdate: (price: number) => Promise<void>;
}

const AdminTourPricingPanel: React.FC<AdminTourPricingPanelProps> = ({ tour, onPriceUpdate }) => {
    const [isEditingPrice, setIsEditingPrice] = useState(false);
    const [price, setPrice] = useState(tour.price);
    const [isSaving, setIsSaving] = useState(false);

    const handleSavePrice = async () => {
        setIsSaving(true);
        try {
            await onPriceUpdate(price);
            setIsEditingPrice(false);
        } catch (error) {
            console.error('Failed to update price:', error);
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div className="space-y-8">
            {/* Base Price Section */}
            <div className="bg-admin-surface rounded-lg border border-admin-border p-6">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-xl font-semibold text-admin-text-primary">Base Pricing</h2>
                    {!isEditingPrice ? (
                        <button 
                            onClick={() => setIsEditingPrice(true)}
                            className="text-admin-primary hover:text-admin-primary-hover font-medium text-sm flex items-center gap-1"
                        >
                            <span className="material-symbols-outlined text-lg">edit</span>
                            Edit Price
                        </button>
                    ) : (
                        <div className="flex gap-2">
                            <button 
                                onClick={() => {
                                    setPrice(tour.price);
                                    setIsEditingPrice(false);
                                }}
                                className="text-admin-text-secondary hover:text-admin-text-primary text-sm px-3 py-1"
                            >
                                Cancel
                            </button>
                            <button 
                                onClick={handleSavePrice}
                                disabled={isSaving}
                                className="bg-admin-primary text-white text-sm px-3 py-1 rounded hover:bg-admin-primary-hover disabled:opacity-50"
                            >
                                {isSaving ? 'Saving...' : 'Save'}
                            </button>
                        </div>
                    )}
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="bg-gray-50 rounded-lg p-4 border border-gray-100">
                        <label className="block text-xs font-medium text-gray-500 uppercase mb-1">Base Price per Person</label>
                        {isEditingPrice ? (
                            <div className="flex items-center">
                                <span className="text-gray-500 mr-2">$</span>
                                <input 
                                    type="number" 
                                    value={price}
                                    onChange={(e) => setPrice(Number(e.target.value))}
                                    className="block w-full rounded-md border-gray-300 shadow-sm focus:border-admin-primary focus:ring-admin-primary sm:text-sm"
                                />
                            </div>
                        ) : (
                            <div className="text-2xl font-bold text-gray-900">${tour.price.toLocaleString()}</div>
                        )}
                    </div>
                </div>
            </div>

            {/* Seasonal Pricing Section */}
            <div className="bg-admin-surface rounded-lg border border-admin-border p-6">
                <h2 className="text-xl font-semibold text-admin-text-primary mb-6">Seasonal Pricing</h2>
                {tour.seasonal_prices && tour.seasonal_prices.length > 0 ? (
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Dates</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Label</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Price</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {tour.seasonal_prices.map((sp) => (
                                    <tr key={sp.id}>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                            {new Date(sp.start_date).toLocaleDateString()} - {new Date(sp.end_date).toLocaleDateString()}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            {sp.label || '-'}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                            ${sp.price.toLocaleString()}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                ) : (
                    <p className="text-gray-500 italic">No seasonal pricing configured.</p>
                )}
            </div>

            {/* Group Discounts Section */}
            <div className="bg-admin-surface rounded-lg border border-admin-border p-6">
                <h2 className="text-xl font-semibold text-admin-text-primary mb-6">Group Discounts</h2>
                {tour.group_discounts && tour.group_discounts.length > 0 ? (
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Group Size</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Discount</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {tour.group_discounts.map((gd) => (
                                    <tr key={gd.id}>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                            {gd.min_guests} - {gd.max_guests} guests
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-green-600">
                                            {gd.discount_percentage}% Off
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                ) : (
                    <p className="text-gray-500 italic">No group discounts configured.</p>
                )}
            </div>

            {/* Departures Section */}
            <div className="bg-admin-surface rounded-lg border border-admin-border p-6">
                <h2 className="text-xl font-semibold text-admin-text-primary mb-6">Upcoming Departures</h2>
                {tour.departures && tour.departures.length > 0 ? (
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Price</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Availability</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {tour.departures.map((dep) => (
                                    <tr key={dep.id}>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                            {new Date(dep.start_date).toLocaleDateString()}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                            ${dep.price.toLocaleString()}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            {dep.capacity - dep.spots_booked} / {dep.capacity} spots left
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                                                dep.status === 'Available' ? 'bg-green-100 text-green-800' :
                                                dep.status === 'Full' ? 'bg-red-100 text-red-800' :
                                                'bg-gray-100 text-gray-800'
                                            }`}>
                                                {dep.status}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                ) : (
                    <p className="text-gray-500 italic">No departures scheduled.</p>
                )}
            </div>
        </div>
    );
};

export default AdminTourPricingPanel;
