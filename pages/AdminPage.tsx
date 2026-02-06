
import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { BookingService, Booking, Customer } from '../lib/services/bookingService';

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

const StatusBadge: React.FC<{ status: string }> = ({ status }) => {
    const styles: { [key: string]: string } = {
        'Confirmed': 'bg-status-published-bg text-status-published',
        'Pending': 'bg-status-draft-bg text-status-draft',
        'Cancelled': 'bg-red-100 text-red-800',
    };
    return <span className={`text-xs font-medium px-2 py-1 rounded-full ${styles[status] || 'bg-gray-100 text-gray-800'}`}>{status}</span>;
};


const AdminPage: React.FC = () => {
    const [stats, setStats] = useState({
        totalRevenue: 0,
        totalBookings: 0,
        totalCustomers: 0,
        pendingTasks: 0
    });
    const [recentBookings, setRecentBookings] = useState<Booking[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchDashboardData = async () => {
            try {
                const [bookingsData, customersData] = await Promise.all([
                    BookingService.getAllBookings(),
                    BookingService.getAllCustomers()
                ]);

                // Calculate Stats
                const totalRevenue = bookingsData
                    .filter(b => b.status === 'Confirmed')
                    .reduce((sum, b) => sum + (b.total_price || 0), 0);
                
                const pendingTasks = bookingsData.filter(b => b.status === 'Pending').length;

                setStats({
                    totalRevenue,
                    totalBookings: bookingsData.length,
                    totalCustomers: customersData.length,
                    pendingTasks
                });

                // Set Recent Bookings (already ordered by created_at desc from service)
                setRecentBookings(bookingsData.slice(0, 5));

            } catch (error) {
                console.error("Failed to fetch dashboard data:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchDashboardData();
    }, []);

    if (loading) {
        return (
            <div className="p-4 sm:p-6 lg:p-8 flex justify-center items-center h-full min-h-[400px]">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-admin-primary"></div>
            </div>
        );
    }

    return (
        <div className="p-4 sm:p-6 lg:p-8">
            <div className="mb-8">
                <h1 className="text-2xl font-bold text-admin-text-primary">Dashboard</h1>
                <p className="mt-1 text-sm text-admin-text-secondary">Welcome back, Admin! Here's a snapshot of your business.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <StatCard title="Total Revenue" value={`$${stats.totalRevenue.toLocaleString()}`} icon="monitoring" />
                <StatCard title="Total Bookings" value={stats.totalBookings.toString()} icon="confirmation_number" />
                <StatCard title="Total Customers" value={stats.totalCustomers.toString()} icon="group_add" />
                <StatCard title="Pending Tasks" value={stats.pendingTasks.toString()} icon="pending_actions" />
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
                                {recentBookings.length > 0 ? (
                                    recentBookings.map(booking => (
                                        <tr key={booking.id}>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-3">
                                                    <img 
                                                        src={`https://ui-avatars.com/api/?name=${encodeURIComponent(booking.customers?.name || 'Guest')}&background=random`} 
                                                        alt={booking.customers?.name || 'Guest'} 
                                                        className="w-8 h-8 rounded-full object-cover" 
                                                    />
                                                    <span className="font-semibold text-admin-text-primary">{booking.customers?.name || 'Guest User'}</span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-admin-text-secondary">{booking.tours?.name || 'Unknown Tour'}</td>
                                            <td className="px-6 py-4 font-semibold">${(booking.total_price || 0).toLocaleString()}</td>
                                            <td className="px-6 py-4"><StatusBadge status={booking.status} /></td>
                                            <td className="px-6 py-4">
                                                <Link to={`/admin/booking/view/${booking.id}`} className="p-2 text-admin-text-secondary hover:text-admin-primary rounded-md"><span className="material-symbols-outlined text-lg">visibility</span></Link>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan={5} className="px-6 py-8 text-center text-admin-text-secondary">
                                            No bookings found.
                                        </td>
                                    </tr>
                                )}
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
