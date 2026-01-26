
import React from 'react';
import { Link } from 'react-router-dom';

const StatCard: React.FC<{ title: string; value: string; icon: string; change?: string; changeType?: 'increase' | 'decrease' }> = ({ title, value, icon, change, changeType }) => (
    <div className="bg-admin-surface p-6 rounded-xl border border-admin-border shadow-sm">
        <div className="flex justify-between items-start">
            <div>
                <p className="text-sm font-medium text-admin-text-secondary">{title}</p>
                <p className="text-3xl font-bold text-admin-text-primary mt-1">{value}</p>
            </div>
            <div className="w-10 h-10 flex items-center justify-center bg-admin-primary/10 text-admin-primary rounded-lg">
                <span className="material-symbols-outlined">{icon}</span>
            </div>
        </div>
        {change && (
            <p className={`mt-2 text-xs ${changeType === 'increase' ? 'text-green-600' : 'text-red-600'}`}>
                <span className="font-semibold">{change}</span> vs. last month
            </p>
        )}
    </div>
);

const mockRecentBookings = [
    { id: 'B-67890', customer: { name: 'Alex Johnson', avatar: 'https://randomuser.me/api/portraits/men/32.jpg' }, tour: 'European Escape', total: 2450, status: 'Confirmed' },
    { id: 'B-67891', customer: { name: 'Samantha Lee', avatar: 'https://randomuser.me/api/portraits/women/44.jpg' }, tour: 'Alpine Adventure', total: 1890, status: 'Pending' },
    { id: 'B-67892', customer: { name: 'Ben Carter', avatar: 'https://randomuser.me/api/portraits/men/86.jpg' }, tour: 'Taste of Tuscany', total: 3100, status: 'Confirmed' },
];

const StatusBadge: React.FC<{ status: string }> = ({ status }) => {
    const styles: { [key: string]: string } = {
        'Confirmed': 'bg-status-published-bg text-status-published',
        'Pending': 'bg-status-draft-bg text-status-draft',
        'Cancelled': 'bg-red-100 text-red-800',
    };
    return <span className={`text-xs font-medium px-2 py-1 rounded-full ${styles[status]}`}>{status}</span>;
};


const AdminPage: React.FC = () => {
    return (
        <div className="p-4 sm:p-6 lg:p-8">
            <div className="mb-8">
                <h1 className="text-2xl font-bold text-admin-text-primary">Dashboard</h1>
                <p className="mt-1 text-sm text-admin-text-secondary">Welcome back, Admin! Here's a snapshot of your business.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <StatCard title="Total Revenue" value="$42,389" icon="monitoring" change="+12.5%" changeType="increase" />
                <StatCard title="Total Bookings" value="182" icon="confirmation_number" change="+8.1%" changeType="increase" />
                <StatCard title="New Customers" value="35" icon="group_add" change="-2.4%" changeType="decrease" />
                <StatCard title="Pending Tasks" value="8" icon="pending_actions" />
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
                <div className="xl:col-span-2 bg-admin-surface rounded-xl border border-admin-border shadow-sm">
                    <div className="p-4 sm:p-6 border-b border-admin-border flex justify-between items-center">
                        <div>
                            <h2 className="text-lg font-bold text-admin-text-primary">Recent Bookings</h2>
                            <p className="text-sm text-admin-text-secondary mt-1">An overview of the latest customer bookings.</p>
                        </div>
                        <Link to="/admin/bookings" className="text-sm font-semibold text-admin-primary hover:underline">View all</Link>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead className="text-xs text-admin-text-secondary uppercase bg-admin-background">
                                <tr>
                                    <th className="px-6 py-3 font-medium text-left">Customer</th>
                                    <th className="px-6 py-3 font-medium text-left">Tour</th>
                                    <th className="px-6 py-3 font-medium text-left">Total</th>
                                    <th className="px-6 py-3 font-medium text-left">Status</th>
                                    <th className="px-6 py-3 font-medium text-left"></th>
                                </tr>
                            </thead>
                             <tbody className="divide-y divide-admin-border">
                                {mockRecentBookings.map(booking => (
                                    <tr key={booking.id}>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <img src={booking.customer.avatar} alt={booking.customer.name} className="w-8 h-8 rounded-full object-cover" />
                                                <span className="font-semibold text-admin-text-primary">{booking.customer.name}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-admin-text-secondary">{booking.tour}</td>
                                        <td className="px-6 py-4 font-semibold">${booking.total.toLocaleString()}</td>
                                        <td className="px-6 py-4"><StatusBadge status={booking.status} /></td>
                                        <td className="px-6 py-4">
                                            <Link to={`/admin/booking/view/${booking.id}`} className="p-2 text-admin-text-secondary hover:text-admin-primary rounded-md"><span className="material-symbols-outlined text-lg">visibility</span></Link>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
                <div className="bg-admin-surface rounded-xl border border-admin-border shadow-sm p-4 sm:p-6">
                    <h2 className="text-lg font-bold text-admin-text-primary mb-4">Quick Links</h2>
                    <div className="flex flex-col gap-3">
                        <Link to="/admin/trek/new" className="flex items-center gap-3 p-3 bg-admin-background hover:bg-gray-100 rounded-lg transition-colors">
                            <span className="material-symbols-outlined text-admin-primary">add</span>
                            <span className="font-semibold text-admin-text-primary text-sm">Add New Tour</span>
                        </Link>
                         <Link to="/admin/booking/new" className="flex items-center gap-3 p-3 bg-admin-background hover:bg-gray-100 rounded-lg transition-colors">
                            <span className="material-symbols-outlined text-admin-primary">book_online</span>
                            <span className="font-semibold text-admin-text-primary text-sm">Create Manual Booking</span>
                        </Link>
                         <Link to="/admin/users" className="flex items-center gap-3 p-3 bg-admin-background hover:bg-gray-100 rounded-lg transition-colors">
                            <span className="material-symbols-outlined text-admin-primary">group</span>
                            <span className="font-semibold text-admin-text-primary text-sm">Manage Users</span>
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminPage;
