
import React from 'react';
import { useParams, Link } from 'react-router-dom';

const mockUser = { 
    id: 'U-002', 
    name: 'Alex Johnson', 
    email: 'alex.j@email.com', 
    avatar: 'https://randomuser.me/api/portraits/men/32.jpg', 
    role: 'Customer', 
    joined: '2023-10-01', 
    status: 'Active' 
};

const mockBookingHistory = [
    { id: 'B-67890', tour: 'European Escape', date: '2024-10-15', total: 2450, status: 'Confirmed' },
    { id: 'B-54321', tour: 'Taste of Tuscany', date: '2023-09-10', total: 3100, status: 'Completed' },
];

const RoleBadge: React.FC<{ role: string }> = ({ role }) => {
    const isAdmin = role === 'Admin';
    return <span className={`px-2 py-1 text-xs font-medium rounded-full ${isAdmin ? 'bg-admin-primary/10 text-admin-primary' : 'bg-gray-100 text-gray-800'}`}>{role}</span>;
};

const UserStatusBadge: React.FC<{ status: string }> = ({ status }) => {
    const isActive = status === 'Active';
    return (
        <span className={`inline-flex items-center gap-1.5 text-xs font-medium px-2 py-1 rounded-full ${isActive ? 'bg-status-published-bg text-status-published' : 'bg-gray-100 text-gray-500'}`}>
            <span className={`w-1.5 h-1.5 rounded-full ${isActive ? 'bg-status-published' : 'bg-gray-400'}`}></span>
            {status}
        </span>
    );
};

const BookingStatusBadge: React.FC<{ status: string }> = ({ status }) => {
    const styles: { [key: string]: string } = {
        'Confirmed': 'bg-blue-100 text-blue-800',
        'Completed': 'bg-status-published-bg text-status-published',
        'Cancelled': 'bg-red-100 text-red-800',
    };
    return <span className={`px-2 py-1 text-xs font-medium rounded-full ${styles[status]}`}>{status}</span>;
};


const AdminUserViewPage: React.FC = () => {
    const { userId } = useParams<{ userId: string }>();

    return (
        <div className="p-4 sm:p-6 lg:p-8">
            <div className="mb-8">
                <Link to="/admin/users" className="inline-flex items-center gap-2 text-sm font-semibold text-admin-text-secondary hover:text-admin-primary mb-4">
                    <span className="material-symbols-outlined">arrow_back</span>
                    Back to Users
                </Link>
                <div className="sm:flex sm:items-center sm:justify-between">
                    <div>
                        <h1 className="text-2xl font-bold text-admin-text-primary">User Profile</h1>
                        <p className="mt-1 text-sm text-admin-text-secondary">User ID: {userId}</p>
                    </div>
                     <div className="mt-4 sm:mt-0 flex gap-2">
                        <Link to={`/admin/user/edit/${userId}`} className="flex items-center gap-2 px-4 py-2 bg-admin-primary text-white font-semibold rounded-lg shadow-sm hover:bg-admin-primary-hover transition-colors">
                            <span className="material-symbols-outlined text-base">edit</span>
                            Edit User
                        </Link>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* User Profile Card */}
                <div className="lg:col-span-1">
                    <div className="bg-admin-surface rounded-lg border border-admin-border p-6 text-center">
                        <img src={mockUser.avatar} alt={mockUser.name} className="w-24 h-24 rounded-full mx-auto mb-4 ring-4 ring-admin-background" />
                        <h2 className="text-xl font-bold text-admin-text-primary">{mockUser.name}</h2>
                        <p className="text-sm text-admin-text-secondary mb-4">{mockUser.email}</p>
                        <div className="flex items-center justify-center gap-4">
                            <RoleBadge role={mockUser.role} />
                            <UserStatusBadge status={mockUser.status} />
                        </div>
                         <div className="mt-4 pt-4 border-t border-admin-border text-sm text-admin-text-secondary">
                            Joined on {mockUser.joined}
                        </div>
                    </div>
                </div>

                {/* Booking History */}
                <div className="lg:col-span-2">
                    <div className="bg-admin-surface rounded-lg border border-admin-border">
                        <div className="p-4 border-b border-admin-border">
                            <h3 className="font-semibold text-admin-text-primary">Booking History</h3>
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
                                        <tr key={booking.id}>
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
                </div>
            </div>
        </div>
    );
};

export default AdminUserViewPage;
