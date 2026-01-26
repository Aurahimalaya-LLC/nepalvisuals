import React, { useState } from 'react';
import { Tour } from '../lib/services/tourService';

interface PricingTabProps {
    tour: Partial<Tour>;
    onChange: (updates: Partial<Tour>) => void;
}

const PricingTab: React.FC<PricingTabProps> = ({ tour, onChange }) => {
    const [priceError, setPriceError] = useState<string | null>(null);
    const [saveError, setSaveError] = useState<string | null>(null);
    
    const handleChange = (field: keyof Tour, value: any) => {
        // Clear previous errors when user starts typing
        if (priceError) setPriceError(null);
        if (saveError) setSaveError(null);
        
        onChange({ [field]: value });
    };

    const validatePrice = (value: string): boolean => {
        const numValue = parseFloat(value);
        if (isNaN(numValue)) {
            setPriceError('Please enter a valid number');
            return false;
        }
        if (numValue < 0) {
            setPriceError('Price cannot be negative');
            return false;
        }
        if (numValue > 999999) {
            setPriceError('Price cannot exceed $999,999');
            return false;
        }
        setPriceError(null);
        return true;
    };

    const handlePriceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        if (validatePrice(value)) {
            handleChange('price', parseFloat(value) || 0);
        }
    };

    return (
        <div className="space-y-8">
            <div className="bg-admin-surface rounded-lg border border-admin-border">
                <div className="p-6 border-b border-admin-border">
                    <h3 className="font-semibold text-admin-text-primary">Pricing</h3>
                    <p className="text-sm text-admin-text-secondary mt-1">Set the base price and currency for your tour</p>
                </div>
                <div className="p-6 space-y-6">
                    <div>
                        <label className="text-sm font-medium text-admin-text-primary block mb-2">
                            Base Price (USD)
                            <span className="text-red-500 ml-1">*</span>
                        </label>
                        <div className="relative">
                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-admin-text-secondary">$</span>
                            <input 
                                type="number" 
                                min="0" 
                                step="0.01" 
                                placeholder="1500.00" 
                                value={tour.price || ''} 
                                onChange={handlePriceChange}
                                className={`w-full pl-8 pr-4 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-admin-primary focus:border-transparent transition ${
                                    priceError ? 'border-red-500 focus:ring-red-500' : 'border-admin-border'
                                }`}
                                aria-invalid={!!priceError}
                                aria-describedby={priceError ? 'price-error' : 'price-help'}
                            />
                        </div>
                        {priceError && (
                            <p id="price-error" className="mt-1 text-sm text-red-600">{priceError}</p>
                        )}
                        <p id="price-help" className="mt-1 text-xs text-admin-text-secondary">
                            Enter the base price in USD. This will be converted to other currencies automatically.
                        </p>
                    </div>
                    
                    <div>
                        <label className="text-sm font-medium text-admin-text-primary block mb-2">
                            Currency
                            <span className="text-red-500 ml-1">*</span>
                        </label>
                        <select 
                            value={tour.currency || 'USD'} 
                            onChange={(e) => handleChange('currency', e.target.value)}
                            className="w-full border border-admin-border rounded-lg text-sm focus:ring-2 focus:ring-admin-primary focus:border-transparent transition"
                            aria-describedby="currency-help"
                        >
                            <option value="USD">USD - US Dollar</option>
                            <option value="EUR">EUR - Euro</option>
                            <option value="GBP">GBP - British Pound</option>
                            <option value="AUD">AUD - Australian Dollar</option>
                            <option value="CAD">CAD - Canadian Dollar</option>
                            <option value="JPY">JPY - Japanese Yen</option>
                            <option value="CNY">CNY - Chinese Yuan</option>
                            <option value="INR">INR - Indian Rupee</option>
                        </select>
                        <p id="currency-help" className="mt-1 text-xs text-admin-text-secondary">
                            Select the primary currency for displaying prices to customers.
                        </p>
                    </div>

                    {saveError && (
                        <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                            <div className="flex items-center gap-2">
                                <span className="material-symbols-outlined text-red-600">error</span>
                                <span className="text-sm text-red-800 font-medium">Save Error</span>
                            </div>
                            <p className="mt-1 text-sm text-red-700">{saveError}</p>
                        </div>
                    )}
                </div>
            </div>

            {/* Pricing Information Card */}
            <div className="bg-admin-surface rounded-lg border border-admin-border">
                <div className="p-6 border-b border-admin-border">
                    <h3 className="font-semibold text-admin-text-primary">Pricing Information</h3>
                </div>
                <div className="p-6 space-y-4">
                    <div className="flex items-start gap-3">
                        <span className="material-symbols-outlined text-admin-primary mt-1">info</span>
                        <div>
                            <h4 className="font-medium text-admin-text-primary">Base Price</h4>
                            <p className="text-sm text-admin-text-secondary mt-1">
                                This is the starting price for your tour. Additional costs like seasonal pricing, group discounts, and extras can be configured in the advanced pricing settings.
                            </p>
                        </div>
                    </div>
                    
                    <div className="flex items-start gap-3">
                        <span className="material-symbols-outlined text-admin-primary mt-1">currency_exchange</span>
                        <div>
                            <h4 className="font-medium text-admin-text-primary">Currency Display</h4>
                            <p className="text-sm text-admin-text-secondary mt-1">
                                The selected currency will be used to display prices to customers. Exchange rates are updated daily for accurate conversions.
                            </p>
                        </div>
                    </div>

                    <div className="mt-6 p-4 bg-admin-background rounded-lg">
                        <h4 className="font-medium text-admin-text-primary mb-2">Next Steps</h4>
                        <ul className="text-sm text-admin-text-secondary space-y-1">
                            <li>• Configure seasonal pricing variations</li>
                            <li>• Set up group discount tiers</li>
                            <li>• Add optional extras and upgrades</li>
                            <li>• Define booking deposit requirements</li>
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PricingTab;