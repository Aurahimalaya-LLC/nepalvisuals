import React from 'react';
import { useParams, Link } from 'react-router-dom';
import countries from '/countries.json';

const mockCustomer = { 
    id: 'C-001', 
    name: 'Alex Johnson', 
    email: 'alex.j@email.com', 
    avatar: 'https://randomuser.me/api/portraits/men/32.jpg', 
    joinedDate: '2023-10-01',
    totalBookings: 2,
    totalSpend: 4340,
    address: { 
        line1: '123 Adventure Lane', 
        line2: '', 
        city: 'Boulder', 
        state: 'CO', 
        zip: '80302', 
        country: 'US' 
    }
};

const mockBookingHistory = [
    { id: 'B-67890', tour: 'European Escape', date: '2024-10-15', total: 2450, status: 'Confirmed' },
    { id: 'B-54321', tour: 'Taste of Tuscany', date: '2023-09-10', total: 1890, status: 'Completed' },
];

const mockAbandonedCheckouts = [
     { id: 'CHK-9876', tour: 'Alpine Adventure', date: '2024-06-01', total: 1890, status: 'Abandoned' },
];

const BookingStatusBadge: React.FC<{ status: string }> = ({ status }) => {
    const styles: { [key: string]: string } = {
        'Confirmed': 'bg-blue-100 text-blue-800',
        'Completed': 'bg-status-published-bg text-status-published',
        'Cancelled': 'bg-red-100 text-red-800',
        'Abandoned': 'bg-yellow-100 text-yellow-800',
    };
    return <span className={`px-2 py-1 text-xs font-medium rounded-full ${styles[status]}`}>{status}</span>;
};

const StatCard: React.FC<{ label: string; value: string | number; icon: string }> = ({ label, value, icon }) => (
    <div className="bg-admin-background p-4 rounded-lg flex items-center gap-4">
        <div className="w-10 h-10 rounded-full bg-admin-primary/10 text-admin-primary flex items-center justify-center">
            <span className="material-symbols-outlined text-lg">{icon}</span>
        </div>
        <div>
            <p className="text-xs text-admin-text-secondary">{label}</p>
            <p className="font-bold text-admin-text-primary text-lg">{value}</p>
        </div>
    </div>
);


const AdminCustomerViewPage: React.FC = () => {
    const { customerId } = useParams<{ customerId: string }>();
    const countryName = countries.find(c => c.code === mockCustomer.address.country)?.name || mockCustomer.address.country;

    return (
        <div className="p-4 sm:p-6 lg:p-8">
            <div className="mb-8">
                <Link to="/admin/customers" className="inline-flex items-center gap-2 text-sm font-semibold text-admin-text-secondary hover:text-admin-primary mb-4">
                    <span className="material-symbols-outlined">arrow_back</span>
                    Back to Customers
                </Link>
                <div className="sm:flex sm:items-center sm:justify-between">
                    <div>
                        <h1 className="text-2xl font-bold text-admin-text-primary">Customer Profile</h1>
                        <p className="mt-1 text-sm text-admin-text-secondary">Customer ID: {customerId}</p>
                    </div>
                     <div className="mt-4 sm:mt-0 flex gap-2">
                        <Link to={`/admin/customer/edit/${customerId}`} className="flex items-center gap-2 px-4 py-2 bg-admin-primary text-white font-semibold rounded-lg shadow-sm hover:bg-admin-primary-hover transition-colors">
                            <span className="material-symbols-outlined text-base">edit</span>
                            Edit Customer
                        </Link>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-1 space-y-8">
                    <div className="bg-admin-surface rounded-lg border border-admin-border p-6">
                        <div className="text-center mb-6">
                            <img src={mockCustomer.avatar} alt={mockCustomer.name} className="w-24 h-24 rounded-full mx-auto mb-4 ring-4 ring-admin-background" />
                            <h2 className="text-xl font-bold text-admin-text-primary">{mockCustomer.name}</h2>
                            <p className="text-sm text-admin-text-secondary">{mockCustomer.email}</p>
                        </div>
                        <div className="space-y-3">
                            <StatCard label="Total Bookings" value={mockCustomer.totalBookings} icon="confirmation_number" />
                            <StatCard label="Total Spend" value={`$${mockCustomer.totalSpend.toLocaleString()}`} icon="payments" />
                            <div className="text-center pt-3 mt-3 border-t border-admin-border text-sm text-admin-text-secondary">
                                Member since {mockCustomer.joinedDate}
                            </div>
                        </div>
                    </div>
                    <div className="bg-admin-surface rounded-lg border border-admin-border p-6">
                        <h3 className="font-semibold text-admin-text-primary mb-4">Address</h3>
                        <address className="text-sm text-admin-text-secondary not-italic space-y-1">
                            <p>{mockCustomer.address.line1}</p>
                            {mockCustomer.address.line2 && <p>{mockCustomer.address.line2}</p>}
                            <p>{mockCustomer.address.city}, {mockCustomer.address.state} {mockCustomer.address.zip}</p>
                            <p>{countryName}</p>
                        </address>
                    </div>
                </div>

                <div className="lg:col-span-2 space-y-8">
                    <div className="bg-admin-surface rounded-lg border border-admin-border">
                        <div className="p-4 border-b border-admin-border">
                            <h3 className="font-semibold text-admin-text-primary">Completed Bookings</h3>
                        </div>
                        <div className="overflow-x-auto">
                             <table className="w-full text-sm">
                                <thead className="text-xs text-admin-text-secondary uppercase bg-admin-background">
                                    <tr>
                                        <th className="px-6 py-3 font-medium text-left">Booking ID</th>
                                        <th className="px-6 py-3 font-medium text-left">Tour</th>
                                        <th className="px-6 py-3 font-medium text-left">Date</th>
                                        <th className="px-6 py-3 font-medium text-left">Total</th>
                                        <th className="px-6 py-3 font-medium text-left">Status</th>
                                        <th className="px-6 py-3 font-medium text-left"></th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-admin-border">
                                    {mockBookingHistory.map(booking => (
                                        <tr key={booking.id} className="hover:bg-admin-background">
                                            <td className="px-6 py-4 whitespace-nowrap font-mono text-xs">{booking.id}</td>
                                            <td className="px-6 py-4 whitespace-nowrap font-semibold">{booking.tour}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-admin-text-secondary">{booking.date}</td>
                                            <td className="px-6 py-4 whitespace-nowrap">${booking.total.toLocaleString()}</td>
                                            <td className="px-6 py-4 whitespace-nowrap"><BookingStatusBadge status={booking.status} /></td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                 <Link to={`/admin/booking/view/${booking.id}`} className="p-2 text-admin-text-secondary hover:text-admin-primary rounded-md"><span className="material-symbols-outlined text-lg">visibility</span></Link>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                             </table>
                        </div>
                    </div>

                    <div className="bg-admin-surface rounded-lg border border-admin-border">
                        <div className="p-4 border-b border-admin-border">
                            <h3 className="font-semibold text-admin-text-primary">Abandoned Checkouts</h3>
                        </div>
                        <div className="overflow-x-auto">
                             <table className="w-full text-sm">
                                <thead className="text-xs text-admin-text-secondary uppercase bg-admin-background">
                                    <tr>
                                        <th className="px-6 py-3 font-medium text-left">Checkout ID</th>
                                        <th className="px-6 py-3 font-medium text-left">Tour</th>
                                        <th className="px-6 py-3 font-medium text-left">Date</th>
                                        <th className="px-6 py-3 font-medium text-left">Potential Value</th>
                                        <th className="px-6 py-3 font-medium text-left">Status</th>
                                        <th className="px-6 py-3 font-medium text-left"></th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-admin-border">
                                    {mockAbandonedCheckouts.map(booking => (
                                        <tr key={booking.id} className="hover:bg-admin-background">
                                            <td className="px-6 py-4 whitespace-nowrap font-mono text-xs">{booking.id}</td>
                                            <td className="px-6 py-4 whitespace-nowrap font-semibold">{booking.tour}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-admin-text-secondary">{booking.date}</td>
                                            <td className="px-6 py-4 whitespace-nowrap">${booking.total.toLocaleString()}</td>
                                            <td className="px-6 py-4 whitespace-nowrap"><BookingStatusBadge status={booking.status} /></td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                 <button className="p-2 text-admin-text-secondary hover:text-admin-primary rounded-md"><span className="material-symbols-outlined text-lg">send</span></button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                             </table>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminCustomerViewPage;