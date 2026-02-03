import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Booking, BookingService } from '../lib/services/bookingService';

const StatusBadge: React.FC<{ status: string }> = ({ status }) => {
    const styles: { [key: string]: string } = {
        'Confirmed': 'bg-status-published-bg text-status-published',
        'Pending': 'bg-status-draft-bg text-status-draft',
        'Cancelled': 'bg-red-100 text-red-800',
    };
    const dotStyles: { [key: string]: string } = {
        'Confirmed': 'bg-status-published',
        'Pending': 'bg-status-draft',
        'Cancelled': 'bg-red-600',
    };
    return (
        <span className={`inline-flex items-center gap-1.5 text-xs font-medium px-2 py-1 rounded-full ${styles[status] || 'bg-gray-100'}`}>
            <span className={`w-1.5 h-1.5 rounded-full ${dotStyles[status] || 'bg-gray-500'}`}></span>
            {status}
        </span>
    );
};

const PaymentStatusBadge: React.FC<{ status: string }> = ({ status }) => {
    const styles: { [key: string]: string } = {
        'Paid in Full': 'bg-green-100 text-green-800',
        'Deposit Paid': 'bg-blue-100 text-blue-800',
        'Not Paid': 'bg-yellow-100 text-yellow-800',
        'Refunded': 'bg-purple-100 text-purple-800',
    };
    return <span className={`text-xs font-medium px-2 py-1 rounded-full ${styles[status] || 'bg-gray-100'}`}>{status}</span>;
};

const AdminBookingsPage: React.FC = () => {
    const [bookings, setBookings] = useState<Booking[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [bookingToDelete, setBookingToDelete] = useState<Booking | null>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('All Statuses');

    const fetchBookings = async () => {
        setLoading(true);
        try {
            const data = await BookingService.getAllBookings();
            setBookings(data);
        } catch (err: any) {
            console.error(err);
            setError('Failed to load bookings.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchBookings();
    }, []);

    const openDeleteModal = (booking: Booking) => {
        setBookingToDelete(booking);
        setIsDeleteModalOpen(true);
    };

    const closeDeleteModal = () => {
        setBookingToDelete(null);
        setIsDeleteModalOpen(false);
    };

    const handleDelete = async () => {
        if (!bookingToDelete) return;
        try {
            await BookingService.deleteBooking(bookingToDelete.id);
            setBookings(bookings.filter(b => b.id !== bookingToDelete.id));
            closeDeleteModal();
        } catch (err: any) {
            console.error(err);
            alert('Failed to delete booking.');
        }
    };

    const filteredBookings = bookings.filter(booking => {
        const customerName = booking.profiles?.full_name || booking.customers?.name || '';
        const matchesSearch = 
            booking.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
            customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
            booking.tours?.name.toLowerCase().includes(searchTerm.toLowerCase());
        
        const matchesStatus = statusFilter === 'All Statuses' || booking.status === statusFilter;

        return matchesSearch && matchesStatus;
    });

    if (loading) return <div className="p-8 text-center">Loading bookings...</div>;
    if (error) return <div className="p-8 text-center text-red-600">{error}</div>;

    return (
        <>
            <div className="p-4 sm:p-6 lg:p-8">
                <div className="sm:flex sm:items-center sm:justify-between mb-8">
                    <div>
                        <h1 className="text-2xl font-bold text-admin-text-primary">Bookings Management</h1>
                        <p className="mt-1 text-sm text-admin-text-secondary">View, track, and manage all customer bookings.</p>
                    </div>
                    <div className="mt-4 sm:mt-0">
                        <Link
                            to="/admin/booking/new"
                            className="w-full sm:w-auto flex items-center justify-center gap-2 px-4 py-2 bg-admin-primary text-white font-semibold rounded-lg shadow-sm hover:bg-admin-primary-hover transition-colors"
                        >
                            <span className="material-symbols-outlined text-base">add</span>
                            Add New Booking
                        </Link>
                    </div>
                </div>

                <div className="bg-admin-surface rounded-xl border border-admin-border shadow-sm">
                    <div className="p-4 border-b border-admin-border">
                        <div className="flex flex-col md:flex-row gap-4">
                            <div className="relative flex-grow">
                                <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-admin-text-secondary text-lg">search</span>
                                <input 
                                    type="text" 
                                    placeholder="Search by ID, customer, or tour..." 
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="w-full pl-10 pr-4 py-2 border border-admin-border rounded-lg text-sm focus:ring-2 focus:ring-admin-primary focus:border-transparent transition" 
                                />
                            </div>
                            <div className="flex gap-4">
                                <select 
                                    value={statusFilter}
                                    onChange={(e) => setStatusFilter(e.target.value)}
                                    className="w-full md:w-48 border border-admin-border rounded-lg text-sm focus:ring-2 focus:ring-admin-primary focus:border-transparent transition"
                                >
                                    <option>All Statuses</option>
                                    <option>Confirmed</option>
                                    <option>Pending</option>
                                    <option>Cancelled</option>
                                </select>
                            </div>
                        </div>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead className="text-xs text-admin-text-secondary uppercase bg-admin-background">
                                <tr>
                                    <th className="px-6 py-3 font-medium text-left">Booking ID</th>
                                    <th className="px-6 py-3 font-medium text-left">Customer</th>
                                    <th className="px-6 py-3 font-medium text-left">Tour</th>
                                    <th className="px-6 py-3 font-medium text-left">Guests</th>
                                    <th className="px-6 py-3 font-medium text-left">Total</th>
                                    <th className="px-6 py-3 font-medium text-left">Status</th>
                                    <th className="px-6 py-3 font-medium text-left">Payment</th>
                                    <th className="px-6 py-3 font-medium text-left">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-admin-border">
                                {filteredBookings.map(booking => (
                                    <tr key={booking.id} className="hover:bg-admin-background">
                                        <td className="px-6 py-4 whitespace-nowrap font-mono text-xs text-admin-text-secondary">{booking.id.substring(0, 8)}...</td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center gap-3">
                                                 <div className="w-8 h-8 rounded-full bg-admin-primary/10 flex items-center justify-center text-admin-primary font-bold">
                                                    {(booking.profiles?.full_name || booking.customers?.name || 'U').charAt(0)}
                                                </div>
                                                <div className="flex flex-col">
                                                    <span className="font-semibold text-admin-text-primary">{booking.profiles?.full_name || booking.customers?.name || 'Unknown'}</span>
                                                    <span className="text-xs text-admin-text-secondary">{booking.profiles?.email || booking.customers?.email || ''}</span>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-admin-text-secondary">{booking.tours?.name || 'Deleted Tour'}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-center text-admin-text-secondary">{booking.booking_travelers?.length || 0}</td>
                                        <td className="px-6 py-4 whitespace-nowrap font-semibold text-admin-text-primary">${booking.total_price?.toLocaleString()}</td>
                                        <td className="px-6 py-4 whitespace-nowrap"><StatusBadge status={booking.status} /></td>
                                        <td className="px-6 py-4 whitespace-nowrap"><PaymentStatusBadge status={booking.payment_status} /></td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center gap-1">
                                                <Link to={`/admin/booking/edit/${booking.id}`} className="p-2 text-admin-text-secondary hover:text-admin-primary rounded-md"><span className="material-symbols-outlined text-lg">edit</span></Link>
                                                <button onClick={() => openDeleteModal(booking)} className="p-2 text-admin-text-secondary hover:text-red-600 rounded-md"><span className="material-symbols-outlined text-lg">delete</span></button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                                {filteredBookings.length === 0 && (
                                    <tr>
                                        <td colSpan={8} className="px-6 py-8 text-center text-admin-text-secondary">
                                            No bookings found.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                    <div className="p-4 border-t border-admin-border flex items-center justify-between">
                        <p className="text-xs text-admin-text-secondary">Showing <span className="font-semibold">{filteredBookings.length}</span> results</p>
                    </div>
                </div>
            </div>

            {isDeleteModalOpen && bookingToDelete && (
                <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4" role="dialog" aria-modal="true">
                    <div className="relative w-full max-w-md bg-admin-surface rounded-xl shadow-lg p-6">
                        <div className="text-center">
                             <div className="w-12 h-12 rounded-full bg-red-100 text-red-600 flex items-center justify-center mx-auto mb-4">
                                <span className="material-symbols-outlined">delete_forever</span>
                            </div>
                            <h3 className="text-lg font-bold text-admin-text-primary">Delete Booking</h3>
                            <p className="text-sm text-admin-text-secondary mt-2">
                                Are you sure you want to delete this booking? This action is permanent.
                            </p>
                        </div>
                        <div className="mt-6 flex justify-center gap-4">
                            <button onClick={closeDeleteModal} className="w-full px-4 py-2 border border-admin-border rounded-lg text-sm font-semibold hover:bg-admin-background transition-colors">
                                Cancel
                            </button>
                            <button onClick={handleDelete} className="w-full px-4 py-2 bg-red-600 text-white font-semibold rounded-lg shadow-sm hover:bg-red-700 transition-colors">
                                Delete Booking
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

export default AdminBookingsPage;
