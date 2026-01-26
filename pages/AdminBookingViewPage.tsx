
import React from 'react';
import { useParams, Link } from 'react-router-dom';

const mockBooking = { 
    id: 'B-67890', 
    customer: { 
        name: 'Alex Johnson', 
        email: 'alex.j@example.com',
        avatar: 'https://randomuser.me/api/portraits/men/32.jpg' 
    }, 
    tour: {
        name: 'European Escape',
        id: 'T12345'
    },
    dates: 'Oct 15 - Oct 29, 2024',
    travelers: [
        {
            id: 'T-001',
            name: 'Alex Johnson',
            email: 'alex.j@example.com',
            phone: '+1 555-123-4567',
            address: '123 Adventure Lane, Boulder, CO, 80302, USA'
        },
        {
            id: 'T-002',
            name: 'Jane Johnson',
            email: 'jane.j@example.com',
            phone: '+1 555-123-4568',
            address: '123 Adventure Lane, Boulder, CO, 80302, USA'
        }
    ],
    pricing: {
        total: 4900,
        depositPaid: 1470,
        remaining: 3430
    },
    status: 'Confirmed',
    paymentStatus: 'Deposit Paid'
};

const StatusBadge: React.FC<{ status: string }> = ({ status }) => {
    const styles: { [key: string]: string } = {
        'Confirmed': 'bg-status-published-bg text-status-published',
        'Pending': 'bg-status-draft-bg text-status-draft',
        'Cancelled': 'bg-red-100 text-red-800',
    };
    return (
        <span className={`text-sm font-semibold px-3 py-1 rounded-full ${styles[status]}`}>{status}</span>
    );
};

const PaymentStatusBadge: React.FC<{ status: string }> = ({ status }) => {
    const styles: { [key: string]: string } = {
        'Paid in Full': 'bg-green-100 text-green-800',
        'Deposit Paid': 'bg-blue-100 text-blue-800',
        'Not Paid': 'bg-yellow-100 text-yellow-800',
        'Refunded': 'bg-purple-100 text-purple-800',
    };
    return <span className={`text-sm font-semibold px-3 py-1 rounded-full ${styles[status]}`}>{status}</span>;
};


const AdminBookingViewPage: React.FC = () => {
    const { bookingId } = useParams<{ bookingId: string }>();

    return (
        <div className="p-4 sm:p-6 lg:p-8">
            <div className="mb-8">
                <Link to="/admin/bookings" className="inline-flex items-center gap-2 text-sm font-semibold text-admin-text-secondary hover:text-admin-primary mb-4">
                    <span className="material-symbols-outlined">arrow_back</span>
                    Back to Bookings
                </Link>
                <div className="sm:flex sm:items-center sm:justify-between">
                    <div>
                        <h1 className="text-2xl font-bold text-admin-text-primary">Booking Details</h1>
                        <p className="mt-1 text-sm text-admin-text-secondary">Booking ID: {bookingId}</p>
                    </div>
                    <div className="mt-4 sm:mt-0 flex gap-2">
                         <Link to={`/admin/booking/edit/${bookingId}`} className="flex items-center gap-2 px-4 py-2 bg-admin-primary text-white font-semibold rounded-lg shadow-sm hover:bg-admin-primary-hover transition-colors">
                            <span className="material-symbols-outlined text-base">edit</span>
                            Edit Booking
                        </Link>
                        <button className="flex items-center gap-2 px-4 py-2 bg-red-500 text-white font-semibold rounded-lg shadow-sm hover:bg-red-600 transition-colors">
                            <span className="material-symbols-outlined text-base">cancel</span>
                            Cancel Booking
                        </button>
                    </div>
                </div>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Main Content */}
                <div className="lg:col-span-2 space-y-8">
                    <div className="bg-admin-surface rounded-lg border border-admin-border p-6">
                        <h3 className="font-semibold text-admin-text-primary border-b border-admin-border pb-3 mb-4">Primary Contact</h3>
                        <div className="flex items-center gap-4">
                            <img src={mockBooking.customer.avatar} alt={mockBooking.customer.name} className="w-16 h-16 rounded-full" />
                            <div>
                                <p className="font-bold text-lg text-admin-text-primary">{mockBooking.customer.name}</p>
                                <p className="text-sm text-admin-text-secondary">{mockBooking.customer.email}</p>
                            </div>
                        </div>
                    </div>
                     <div className="bg-admin-surface rounded-lg border border-admin-border">
                        <div className="p-6 border-b border-admin-border">
                            <h3 className="font-semibold text-admin-text-primary">Traveler Details ({mockBooking.travelers.length} travelers)</h3>
                        </div>
                        <div className="divide-y divide-admin-border">
                            {mockBooking.travelers.map(traveler => (
                                <div key={traveler.id} className="p-6">
                                    <p className="font-bold text-admin-text-primary mb-2">{traveler.name}</p>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-3 text-sm">
                                        <div className="flex items-center gap-2 text-admin-text-secondary">
                                            <span className="material-symbols-outlined text-base">mail</span> {traveler.email}
                                        </div>
                                        <div className="flex items-center gap-2 text-admin-text-secondary">
                                            <span className="material-symbols-outlined text-base">call</span> {traveler.phone}
                                        </div>
                                        <div className="col-span-full flex items-start gap-2 text-admin-text-secondary">
                                            <span className="material-symbols-outlined text-base mt-0.5">home</span> {traveler.address}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                     <div className="bg-admin-surface rounded-lg border border-admin-border p-6">
                        <h3 className="font-semibold text-admin-text-primary border-b border-admin-border pb-3 mb-4">Tour Details</h3>
                        <div>
                            <p className="text-sm text-admin-text-secondary">Tour Name</p>
                            <Link to={`/admin/trek/view/${mockBooking.tour.id}`} className="font-bold text-lg text-admin-primary hover:underline">{mockBooking.tour.name}</Link>
                        </div>
                         <div className="mt-4">
                            <p className="text-sm text-admin-text-secondary">Travel Dates</p>
                            <p className="font-semibold text-admin-text-primary">{mockBooking.dates}</p>
                        </div>
                    </div>
                </div>

                {/* Sidebar */}
                 <div className="lg:col-span-1">
                    <div className="bg-admin-surface rounded-lg border border-admin-border p-6 space-y-4">
                        <div className="flex justify-between items-center">
                            <h3 className="font-semibold text-admin-text-primary">Status</h3>
                            <StatusBadge status={mockBooking.status} />
                        </div>
                        <div className="pt-4 border-t border-admin-border">
                             <h3 className="font-semibold text-admin-text-primary mb-3">Payment Summary</h3>
                             <div className="flex justify-between items-center mb-4">
                                <span className="text-sm text-admin-text-secondary">Payment Status</span>
                                <PaymentStatusBadge status={mockBooking.paymentStatus} />
                            </div>
                            <div className="space-y-2 text-sm">
                                 <div className="flex justify-between items-center">
                                    <span className="text-admin-text-secondary">Total Amount</span>
                                    <span className="font-bold text-admin-text-primary">${mockBooking.pricing.total.toLocaleString()}</span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-admin-text-secondary">Amount Paid</span>
                                    <span className="font-semibold text-green-600">${mockBooking.pricing.depositPaid.toLocaleString()}</span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-admin-text-secondary">Amount Remaining</span>
                                    <span className="font-semibold text-red-600">${mockBooking.pricing.remaining.toLocaleString()}</span>
                                </div>
                            </div>
                            {mockBooking.paymentStatus === 'Deposit Paid' && (
                                 <div className="mt-4 pt-4 border-t border-admin-border">
                                    <button className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-blue-500 text-white font-semibold rounded-lg shadow-sm hover:bg-blue-600 transition-colors">
                                        <span className="material-symbols-outlined text-base">send</span>
                                        Send Payment Link
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
};

export default AdminBookingViewPage;
