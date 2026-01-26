import React, { useState, useRef, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { getCountries } from '../lib/utils/countries';
import { CustomerService, ExtendedCustomer } from '../lib/services/customerService';

const AdminCustomerEditorPage: React.FC = () => {
    const { customerId } = useParams<{ customerId: string }>();
    const isEditing = !!customerId && customerId !== 'new';
    const navigate = useNavigate();

    const [loading, setLoading] = useState(false);
    const [customer, setCustomer] = useState<Partial<ExtendedCustomer>>({
        name: '',
        email: '',
        phone: '',
        address: '', // We'll handle address as simple string for MVP compatibility with bookingService or extend schema later
        avatar_url: ''
    });
    
    // For MVP address fields parsing/handling (simplification: storing combined string or using existing field)
    // The previous schema had 'address' as text. The UI has fields for line1, city, etc.
    // We will join them into the 'address' text field or handle a JSON column if we upgraded schema.
    // For now, let's just bind 'address' to Address Line 1 to keep it simple and working with existing db.
    
    const [addressFields, setAddressFields] = useState({
        line1: '',
        line2: '',
        city: '',
        state: '',
        zip: '',
        country: 'US'
    });

    const [imagePreview, setImagePreview] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (isEditing && customerId) {
            setLoading(true);
            CustomerService.getCustomerById(customerId)
                .then(data => {
                    if (data) {
                        setCustomer(data);
                        if (data.avatar_url) setImagePreview(data.avatar_url);
                        // Try to parse address if it looks like JSON or just set line 1
                        setAddressFields(prev => ({ ...prev, line1: data.address || '' }));
                    }
                })
                .catch(err => console.error(err))
                .finally(() => setLoading(false));
        }
    }, [isEditing, customerId]);

    const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setImagePreview(reader.result as string);
                // Ideally upload to storage here and get URL, skipping for MVP to focus on DB save
            };
            reader.readAsDataURL(file);
        }
    };
    
    const triggerFileSelect = () => fileInputRef.current?.click();

    const handleSave = async () => {
        if (!customer.name || !customer.email) {
            alert('Name and Email are required.');
            return;
        }

        setLoading(true);
        try {
            // Combine address
            const fullAddress = `${addressFields.line1}, ${addressFields.city} ${addressFields.state} ${addressFields.zip}, ${addressFields.country}`;
            const customerData = { ...customer, address: fullAddress };

            if (isEditing && customerId) {
                await CustomerService.updateCustomer(customerId, customerData);
                alert('Customer updated successfully!');
            } else {
                await CustomerService.createCustomer(customerData);
                alert('Customer created successfully!');
                navigate('/admin/customers');
            }
        } catch (err: any) {
            console.error(err);
            alert('Failed to save customer: ' + err.message);
        } finally {
            setLoading(false);
        }
    };

    if (loading && isEditing && !customer.id) return <div className="p-8 text-center">Loading...</div>;

    return (
        <div className="p-4 sm:p-6 lg:p-8">
            <div className="mb-8">
                <Link to="/admin/customers" className="inline-flex items-center gap-2 text-sm font-semibold text-admin-text-secondary hover:text-admin-primary mb-4">
                    <span className="material-symbols-outlined">arrow_back</span>
                    Back to Customers
                </Link>
                <h1 className="text-2xl font-bold text-admin-text-primary">
                    {isEditing ? 'Edit Customer' : 'Add New Customer'}
                </h1>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2">
                    <div className="bg-admin-surface rounded-lg border border-admin-border p-6 space-y-4">
                        <div>
                            <label className="text-sm font-medium text-admin-text-primary block mb-1">Full Name *</label>
                            <input 
                                type="text" 
                                value={customer.name || ''} 
                                onChange={e => setCustomer({...customer, name: e.target.value})}
                                className="w-full border border-admin-border rounded-lg text-sm" 
                            />
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="text-sm font-medium text-admin-text-primary block mb-1">Email Address *</label>
                                <input 
                                    type="email" 
                                    value={customer.email || ''} 
                                    onChange={e => setCustomer({...customer, email: e.target.value})}
                                    className="w-full border border-admin-border rounded-lg text-sm" 
                                />
                            </div>
                            <div>
                                <label className="text-sm font-medium text-admin-text-primary block mb-1">Phone Number</label>
                                <input 
                                    type="tel" 
                                    value={customer.phone || ''} 
                                    onChange={e => setCustomer({...customer, phone: e.target.value})}
                                    className="w-full border border-admin-border rounded-lg text-sm" 
                                />
                            </div>
                        </div>

                        <div className="pt-4 border-t border-admin-border">
                            <h3 className="text-base font-semibold text-admin-text-primary mb-3">Address</h3>
                            <div className="space-y-4">
                                <div>
                                    <label className="text-sm font-medium text-admin-text-primary block mb-1">Address Line 1</label>
                                    <input 
                                        type="text" 
                                        value={addressFields.line1} 
                                        onChange={e => setAddressFields({...addressFields, line1: e.target.value})}
                                        className="w-full border border-admin-border rounded-lg text-sm" 
                                    />
                                </div>
                                 <div>
                                    <label className="text-sm font-medium text-admin-text-primary block mb-1">Address Line 2 (Optional)</label>
                                    <input 
                                        type="text" 
                                        value={addressFields.line2} 
                                        onChange={e => setAddressFields({...addressFields, line2: e.target.value})}
                                        className="w-full border border-admin-border rounded-lg text-sm" 
                                    />
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                     <div>
                                        <label className="text-sm font-medium text-admin-text-primary block mb-1">City</label>
                                        <input 
                                            type="text" 
                                            value={addressFields.city} 
                                            onChange={e => setAddressFields({...addressFields, city: e.target.value})}
                                            className="w-full border border-admin-border rounded-lg text-sm" 
                                        />
                                    </div>
                                    <div>
                                        <label className="text-sm font-medium text-admin-text-primary block mb-1">State / Province</label>
                                        <input 
                                            type="text" 
                                            value={addressFields.state} 
                                            onChange={e => setAddressFields({...addressFields, state: e.target.value})}
                                            className="w-full border border-admin-border rounded-lg text-sm" 
                                        />
                                    </div>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="text-sm font-medium text-admin-text-primary block mb-1">ZIP / Postal Code</label>
                                        <input 
                                            type="text" 
                                            value={addressFields.zip} 
                                            onChange={e => setAddressFields({...addressFields, zip: e.target.value})}
                                            className="w-full border border-admin-border rounded-lg text-sm" 
                                        />
                                    </div>
                                    <div>
                                        <label className="text-sm font-medium text-admin-text-primary block mb-1">Country</label>
                                        <select 
                                            value={addressFields.country} 
                                            onChange={e => setAddressFields({...addressFields, country: e.target.value})}
                                            className="w-full border border-admin-border rounded-lg text-sm"
                                        >
                                            <option value="">Select a country</option>
                                            {getCountries().map(country => (
                                                <option key={country.code} value={country.code}>{country.name}</option>
                                            ))}
                                        </select>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="lg:col-span-1">
                     <div className="bg-admin-surface rounded-lg border border-admin-border">
                        <div className="p-6 border-b border-admin-border">
                            <h3 className="font-semibold text-admin-text-primary">Profile Photo</h3>
                        </div>
                        <div className="p-6">
                            <div className="flex flex-col items-center gap-4">
                                <div className="w-32 h-32 rounded-full bg-admin-background flex items-center justify-center overflow-hidden border-2 border-dashed border-admin-border">
                                    {imagePreview ? (
                                        <img src={imagePreview} alt="Profile preview" className="w-full h-full object-cover" />
                                    ) : (
                                        <span className="material-symbols-outlined text-4xl text-admin-text-secondary">person</span>
                                    )}
                                </div>
                                <input type="file" ref={fileInputRef} onChange={handleImageChange} accept="image/*" className="hidden" />
                                <button onClick={triggerFileSelect} className="w-full text-center px-4 py-2 border border-admin-border rounded-lg text-sm font-semibold hover:bg-admin-background transition-colors">
                                    {isEditing ? 'Change Photo' : 'Upload Photo'}
                                </button>
                                <p className="text-xs text-admin-text-secondary text-center">
                                    Upload feature coming soon (handled via Media Library)
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="mt-8 pt-6 border-t border-admin-border flex justify-end gap-3">
                <Link to="/admin/customers" className="px-4 py-2 border border-admin-border rounded-lg text-sm font-semibold hover:bg-admin-background transition-colors">Cancel</Link>
                <button 
                    onClick={handleSave} 
                    disabled={loading}
                    className="px-4 py-2 bg-admin-primary text-white font-semibold rounded-lg shadow-sm hover:bg-admin-primary-hover transition-colors disabled:opacity-50"
                >
                    {loading ? 'Saving...' : (isEditing ? 'Save Changes' : 'Create Customer')}
                </button>
            </div>
        </div>
    );
};

export default AdminCustomerEditorPage;
