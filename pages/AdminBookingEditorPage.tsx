import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Booking, BookingTraveler, Customer, BookingService } from '../lib/services/bookingService';
import { Tour, TourService } from '../lib/services/tourService';

const AddCustomerModal: React.FC<{
    onClose: () => void;
    onSave: (customerData: Partial<Customer>) => Promise<void>;
}> = ({ onClose, onSave }) => {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [phone, setPhone] = useState('');
    const [address, setAddress] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSaveClick = async () => {
        if (!name || !email) {
            alert('Name and Email are required.');
            return;
        }
        setLoading(true);
        try {
            await onSave({ name, email, phone, address });
            onClose();
        } catch (err: any) {
            console.error(err);
            alert('Failed to save customer.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 animate-fadeIn" onClick={onClose} role="dialog" aria-modal="true">
            <div className="w-full max-w-lg bg-admin-surface rounded-xl shadow-lg flex flex-col overflow-hidden animate-scaleIn" onClick={e => e.stopPropagation()}>
                <div className="p-6 border-b border-admin-border">
                    <h3 className="text-xl font-bold text-admin-text-primary">Add New Customer</h3>
                </div>
                <div className="p-6 space-y-4">
                    <div>
                        <label className="text-sm font-medium text-admin-text-primary block mb-1">Full Name</label>
                        <input type="text" value={name} onChange={e => setName(e.target.value)} className="w-full border border-admin-border rounded-lg text-sm" />
                    </div>
                    <div>
                        <label className="text-sm font-medium text-admin-text-primary block mb-1">Email Address</label>
                        <input type="email" value={email} onChange={e => setEmail(e.target.value)} className="w-full border border-admin-border rounded-lg text-sm" />
                    </div>
                    <div>
                        <label className="text-sm font-medium text-admin-text-primary block mb-1">Phone Number</label>
                        <input type="tel" value={phone} onChange={e => setPhone(e.target.value)} className="w-full border border-admin-border rounded-lg text-sm" />
                    </div>
                    <div>
                        <label className="text-sm font-medium text-admin-text-primary block mb-1">Address</label>
                        <input type="text" value={address} onChange={e => setAddress(e.target.value)} className="w-full border border-admin-border rounded-lg text-sm" />
                    </div>
                </div>
                <div className="p-6 bg-admin-background border-t border-admin-border flex justify-end gap-3">
                    <button onClick={onClose} className="px-4 py-2 border border-admin-border rounded-lg text-sm font-semibold hover:bg-gray-100 transition-colors">Cancel</button>
                    <button onClick={handleSaveClick} disabled={loading} className="px-4 py-2 bg-admin-primary text-white font-semibold rounded-lg shadow-sm hover:bg-admin-primary-hover transition-colors disabled:opacity-50">
                        {loading ? 'Saving...' : 'Save Customer'}
                    </button>
                </div>
            </div>
        </div>
    );
};

const AdminBookingEditorPage: React.FC = () => {
    const { bookingId } = useParams<{ bookingId: string }>();
    const isEditing = !!bookingId && bookingId !== 'new';
    const navigate = useNavigate();

    const [loading, setLoading] = useState(false);
    const [customers, setCustomers] = useState<Customer[]>([]);
    const [tours, setTours] = useState<Tour[]>([]);
    
    // Form State
    const [selectedCustomerId, setSelectedCustomerId] = useState('');
    const [selectedTourId, setSelectedTourId] = useState('');
    const [dates, setDates] = useState('');
    const [status, setStatus] = useState<Booking['status']>('Pending');
    const [paymentStatus, setPaymentStatus] = useState<Booking['payment_status']>('Not Paid');
    const [totalPrice, setTotalPrice] = useState<number>(0);
    const [travelers, setTravelers] = useState<Partial<BookingTraveler>[]>([{ id: `temp-${Date.now()}`, name: '', email: '', phone: '', is_primary: true }]);
    const [isAddCustomerModalOpen, setIsAddCustomerModalOpen] = useState(false);

    useEffect(() => {
        const loadData = async () => {
            setLoading(true);
            try {
                const [customersData, toursResponse] = await Promise.all([
                    BookingService.getAllCustomers(),
                    TourService.getAllTours()
                ]);
                setCustomers(customersData);
                setTours(toursResponse.data);

                if (isEditing && bookingId) {
                    const booking = await BookingService.getBookingById(bookingId);
                    if (booking) {
                        setSelectedCustomerId(booking.customer_id);
                        setSelectedTourId(booking.tour_id);
                        setDates(booking.dates || '');
                        setStatus(booking.status);
                        setPaymentStatus(booking.payment_status);
                        setTotalPrice(booking.total_price);
                        if (booking.booking_travelers && booking.booking_travelers.length > 0) {
                            setTravelers(booking.booking_travelers);
                        }
                    }
                }
            } catch (err) {
                console.error(err);
                alert('Failed to load data.');
            } finally {
                setLoading(false);
            }
        };
        loadData();
    }, [isEditing, bookingId]);

    const handleSave = async () => {
        if (!selectedCustomerId || !selectedTourId) {
            alert('Customer and Tour are required.');
            return;
        }

        setLoading(true);
        const bookingData: Partial<Booking> = {
            customer_id: selectedCustomerId,
            tour_id: selectedTourId,
            dates,
            status,
            payment_status: paymentStatus,
            total_price: totalPrice
        };

        // Clean travelers data (remove temp IDs if creating)
        const travelersData = travelers.map(({ id, ...rest }) => rest);

        try {
            if (isEditing && bookingId) {
                await BookingService.updateBooking(bookingId, bookingData, travelersData);
                alert('Booking updated successfully!');
            } else {
                const newBooking = await BookingService.createBooking(bookingData, travelersData);
                alert('Booking created successfully!');
                navigate(`/admin/booking/edit/${newBooking.id}`);
            }
        } catch (err: any) {
            console.error(err);
            alert('Failed to save booking: ' + err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleTravelerChange = (index: number, field: keyof BookingTraveler, value: any) => {
        setTravelers(prev => prev.map((t, i) => i === index ? { ...t, [field]: value } : t));
    };
    
    const addTraveler = () => {
        setTravelers(prev => [...prev, { id: `temp-${Date.now()}`, name: '', email: '', phone: '', is_primary: false }]);
    };

    const removeTraveler = (index: number) => {
        setTravelers(prev => prev.filter((_, i) => i !== index));
    };

    const handleAddNewCustomer = async (customerData: Partial<Customer>) => {
        const newCustomer = await BookingService.createCustomer(customerData);
        setCustomers(prev => [...prev, newCustomer]);
        setSelectedCustomerId(newCustomer.id);
        
        // Auto-fill primary traveler if empty
        if (travelers.length > 0 && !travelers[0].name) {
             setTravelers(prev => {
                const newTravelers = [...prev];
                newTravelers[0] = { ...newTravelers[0], name: newCustomer.name, email: newCustomer.email, phone: newCustomer.phone };
                return newTravelers;
             });
        }
    };

    const handleCustomerSelect = (custId: string) => {
        setSelectedCustomerId(custId);
        const customer = customers.find(c => c.id === custId);
        // If selecting a customer and primary traveler is empty/default, pre-fill it
        if (customer && travelers.length > 0 && (!travelers[0].name || travelers[0].name === '')) {
             setTravelers(prev => {
                const newTravelers = [...prev];
                newTravelers[0] = { ...newTravelers[0], name: customer.name, email: customer.email, phone: customer.phone };
                return newTravelers;
             });
        }
    };

    if (loading && isEditing && !selectedCustomerId) return <div className="p-8 text-center">Loading...</div>;

    return (
        <>
            <div className="p-4 sm:p-6 lg:p-8">
                <div className="mb-8">
                    <Link to="/admin/bookings" className="inline-flex items-center gap-2 text-sm font-semibold text-admin-text-secondary hover:text-admin-primary mb-4">
                        <span className="material-symbols-outlined">arrow_back</span>
                        Back to Bookings
                    </Link>
                    <h1 className="text-2xl font-bold text-admin-text-primary">
                        {isEditing ? `Edit Booking` : 'Create New Booking'}
                    </h1>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Main Content Form */}
                    <div className="lg:col-span-2 space-y-8">
                        <div className="bg-admin-surface rounded-lg border border-admin-border">
                            <div className="p-6 border-b border-admin-border">
                                <h3 className="font-semibold text-admin-text-primary">Booking Details</h3>
                            </div>
                            <div className="p-6 space-y-4">
                                <div>
                                    <label className="text-sm font-medium text-admin-text-primary block mb-1">Primary Customer</label>
                                    <div className="flex items-center gap-2">
                                        <select value={selectedCustomerId} onChange={(e) => handleCustomerSelect(e.target.value)} className="w-full border border-admin-border rounded-lg text-sm">
                                            <option value="">Select a customer...</option>
                                            {customers.map(c => <option key={c.id} value={c.id}>{c.name} ({c.email})</option>)}
                                        </select>
                                        <button
                                            type="button"
                                            onClick={() => setIsAddCustomerModalOpen(true)}
                                            className="flex-shrink-0 flex items-center gap-2 px-3 py-2 border border-admin-border rounded-lg text-sm font-semibold hover:bg-admin-background transition-colors"
                                        >
                                            <span className="material-symbols-outlined text-base">add</span>
                                            New
                                        </button>
                                    </div>
                                </div>
                                <div>
                                    <label className="text-sm font-medium text-admin-text-primary block mb-1">Tour</label>
                                    <select value={selectedTourId} onChange={(e) => setSelectedTourId(e.target.value)} className="w-full border border-admin-border rounded-lg text-sm">
                                        <option value="">Select a tour...</option>
                                        {tours.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                                    </select>
                                </div>
                                <div>
                                    <label className="text-sm font-medium text-admin-text-primary block mb-1">Travel Dates</label>
                                    <input type="text" value={dates} onChange={(e) => setDates(e.target.value)} placeholder="e.g., Nov 02 - Nov 20, 2024" className="w-full border border-admin-border rounded-lg text-sm" />
                                </div>
                            </div>
                        </div>

                        <div className="bg-admin-surface rounded-lg border border-admin-border">
                            <div className="p-6 border-b border-admin-border">
                                <h3 className="font-semibold text-admin-text-primary">Traveler Details</h3>
                            </div>
                            <div className="p-6 space-y-6">
                                {travelers.map((traveler, index) => (
                                    <div key={index} className="bg-admin-background p-4 rounded-lg border border-admin-border relative">
                                        <div className="flex justify-between items-center mb-3">
                                            <p className="text-xs font-bold text-admin-text-secondary uppercase">Traveler {index + 1}</p>
                                            <div className="flex items-center gap-2">
                                                {index === 0 ? (
                                                    <div className="flex items-center gap-1.5 text-xs font-bold text-admin-primary bg-admin-primary/10 px-2 py-1 rounded-full">
                                                        <span className="material-symbols-outlined text-sm">star</span>
                                                        Primary
                                                    </div>
                                                ) : (
                                                    <button onClick={() => removeTraveler(index)} className="p-1 text-admin-text-secondary hover:text-red-500 rounded-full">
                                                        <span className="material-symbols-outlined text-lg">close</span>
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div>
                                                <label className="text-xs font-medium text-admin-text-primary block mb-1">Full Name</label>
                                                <input type="text" value={traveler.name || ''} onChange={e => handleTravelerChange(index, 'name', e.target.value)} className="w-full border-admin-border rounded-lg text-sm" />
                                            </div>
                                            <div>
                                                <label className="text-xs font-medium text-admin-text-primary block mb-1">Email</label>
                                                <input type="email" value={traveler.email || ''} onChange={e => handleTravelerChange(index, 'email', e.target.value)} className="w-full border-admin-border rounded-lg text-sm" />
                                            </div>
                                            <div className="md:col-span-2">
                                                <label className="text-xs font-medium text-admin-text-primary block mb-1">Phone</label>
                                                <input type="tel" value={traveler.phone || ''} onChange={e => handleTravelerChange(index, 'phone', e.target.value)} className="w-full border-admin-border rounded-lg text-sm" />
                                            </div>
                                        </div>
                                    </div>
                                ))}
                                <button onClick={addTraveler} className="w-full flex items-center justify-center gap-2 py-2.5 border-2 border-dashed border-admin-border rounded-lg text-sm font-semibold text-admin-text-primary hover:border-admin-primary hover:text-admin-primary transition-colors">
                                    <span className="material-symbols-outlined text-base">add</span>
                                    Add Another Traveler
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Sidebar */}
                    <div className="lg:col-span-1 space-y-8">
                        <div className="bg-admin-surface rounded-lg border border-admin-border">
                            <div className="p-6 border-b border-admin-border">
                                <h3 className="font-semibold text-admin-text-primary">Status & Payment</h3>
                            </div>
                            <div className="p-6 space-y-4">
                                <div>
                                    <label className="text-sm font-medium text-admin-text-primary block mb-1">Booking Status</label>
                                    <select value={status} onChange={(e) => setStatus(e.target.value as Booking['status'])} className="w-full border border-admin-border rounded-lg text-sm">
                                        <option value="Pending">Pending</option>
                                        <option value="Confirmed">Confirmed</option>
                                        <option value="Cancelled">Cancelled</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="text-sm font-medium text-admin-text-primary block mb-1">Payment Status</label>
                                    <select value={paymentStatus} onChange={(e) => setPaymentStatus(e.target.value as Booking['payment_status'])} className="w-full border border-admin-border rounded-lg text-sm">
                                        <option value="Not Paid">Not Paid</option>
                                        <option value="Deposit Paid">Deposit Paid</option>
                                        <option value="Paid in Full">Paid in Full</option>
                                        <option value="Refunded">Refunded</option>
                                    </select>
                                </div>
                                <div className="pt-4 border-t border-admin-border">
                                    <label htmlFor="totalPrice" className="text-sm font-medium text-admin-text-primary block mb-1">Total Price (USD)</label>
                                    <input 
                                        id="totalPrice"
                                        type="number" 
                                        step="0.01" 
                                        value={totalPrice || ''}
                                        onChange={(e) => setTotalPrice(parseFloat(e.target.value) || 0)}
                                        placeholder="e.g., 1890.00" 
                                        className="w-full border border-admin-border rounded-lg text-sm" />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="mt-8 pt-6 border-t border-admin-border flex justify-end gap-3">
                    <Link to="/admin/bookings" className="px-4 py-2 border border-admin-border rounded-lg text-sm font-semibold hover:bg-admin-background transition-colors">Cancel</Link>
                    <button onClick={handleSave} disabled={loading} className="px-4 py-2 bg-admin-primary text-white font-semibold rounded-lg shadow-sm hover:bg-admin-primary-hover transition-colors disabled:opacity-50">
                        {loading ? 'Saving...' : (isEditing ? 'Save Changes' : 'Create Booking')}
                    </button>
                </div>
            </div>
            {isAddCustomerModalOpen && (
                <AddCustomerModal
                    onClose={() => setIsAddCustomerModalOpen(false)}
                    onSave={handleAddNewCustomer}
                />
            )}
        </>
    );
};

export default AdminBookingEditorPage;
