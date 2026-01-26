import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { UserService, UserProfile } from '../lib/services/userService';

const RoleBadge: React.FC<{ role: string }> = ({ role }) => {
    const isAdmin = role === 'Admin';
    const isGuide = role === 'Guide';
    let classes = 'bg-gray-100 text-gray-800';
    if (isAdmin) classes = 'bg-purple-100 text-purple-800';
    if (isGuide) classes = 'bg-blue-100 text-blue-800';

    return (
        <span className={`px-2 py-1 text-xs font-medium rounded-full ${classes}`}>{role}</span>
    );
};

const UserStatusBadge: React.FC<{ status: string }> = ({ status }) => {
    const isActive = status === 'Active';
    const isBanned = status === 'Banned';
    
    let classes = 'bg-gray-100 text-gray-500';
    let dotClasses = 'bg-gray-400';

    if (isActive) {
        classes = 'bg-status-published-bg text-status-published';
        dotClasses = 'bg-status-published';
    } else if (isBanned) {
        classes = 'bg-red-100 text-red-800';
        dotClasses = 'bg-red-600';
    }

    return (
        <span className={`inline-flex items-center gap-1.5 text-xs font-medium px-2 py-1 rounded-full ${classes}`}>
            <span className={`w-1.5 h-1.5 rounded-full ${dotClasses}`}></span>
            {status}
        </span>
    );
};

const AdminUsersPage: React.FC = () => {
    const [users, setUsers] = useState<UserProfile[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [userToDelete, setUserToDelete] = useState<UserProfile | null>(null);
    const [searchTerm, setSearchTerm] = useState('');

    const fetchUsers = async () => {
        setLoading(true);
        try {
            const data = await UserService.getAllUsers();
            setUsers(data);
        } catch (err: any) {
            console.error(err);
            setError('Failed to load users.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchUsers();
    }, []);

    const openDeleteModal = (user: UserProfile) => {
        setUserToDelete(user);
        setIsDeleteModalOpen(true);
    };

    const closeDeleteModal = () => {
        setUserToDelete(null);
        setIsDeleteModalOpen(false);
    };

    const handleDelete = async () => {
        if (!userToDelete) return;
        try {
            await UserService.deleteUser(userToDelete.id);
            setUsers(users.filter(u => u.id !== userToDelete.id));
            closeDeleteModal();
        } catch (err: any) {
            console.error(err);
            alert('Failed to delete user.');
        }
    };

    const filteredUsers = users.filter(user => 
        (user.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) || '') ||
        (user.email?.toLowerCase().includes(searchTerm.toLowerCase()) || '')
    );

    if (loading) return <div className="p-8 text-center">Loading users...</div>;
    if (error) return <div className="p-8 text-center text-red-600">{error}</div>;

    return (
        <>
            <div className="p-4 sm:p-6 lg:p-8">
                <div className="sm:flex sm:items-center sm:justify-between mb-8">
                    <div>
                        <h1 className="text-2xl font-bold text-admin-text-primary">User Management</h1>
                        <p className="mt-1 text-sm text-admin-text-secondary">Add, edit, and manage user accounts and permissions.</p>
                    </div>
                    <div className="mt-4 sm:mt-0">
                        <Link
                            to="/admin/user/new"
                            className="w-full sm:w-auto flex items-center justify-center gap-2 px-4 py-2 bg-admin-primary text-white font-semibold rounded-lg shadow-sm hover:bg-admin-primary-hover transition-colors"
                        >
                            <span className="material-symbols-outlined text-base">add</span>
                            Add New User
                        </Link>
                    </div>
                </div>

                <div className="bg-admin-surface rounded-xl border border-admin-border shadow-sm">
                    <div className="p-4 border-b border-admin-border">
                        <div className="relative">
                            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-admin-text-secondary text-lg">search</span>
                            <input 
                                type="text" 
                                placeholder="Search by name or email..." 
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full max-w-sm pl-10 pr-4 py-2 border border-admin-border rounded-lg text-sm focus:ring-2 focus:ring-admin-primary focus:border-transparent transition" 
                            />
                        </div>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead className="text-xs text-admin-text-secondary uppercase bg-admin-background">
                                <tr>
                                    <th className="px-6 py-3 font-medium text-left">User</th>
                                    <th className="px-6 py-3 font-medium text-left">Role</th>
                                    <th className="px-6 py-3 font-medium text-left">Joined Date</th>
                                    <th className="px-6 py-3 font-medium text-left">Status</th>
                                    <th className="px-6 py-3 font-medium text-left">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-admin-border">
                                {filteredUsers.map(user => (
                                    <tr key={user.id} className="hover:bg-admin-background">
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center gap-3">
                                                 <div className="w-10 h-10 rounded-full bg-admin-primary/10 flex items-center justify-center overflow-hidden">
                                                     {user.avatar_url ? (
                                                        <img src={user.avatar_url} alt={user.full_name || ''} className="w-full h-full object-cover" />
                                                     ) : (
                                                        <span className="text-admin-primary font-bold text-lg">{(user.full_name || user.email).charAt(0).toUpperCase()}</span>
                                                     )}
                                                </div>
                                                <div>
                                                    <div className="font-semibold text-admin-text-primary">{user.full_name || 'No Name'}</div>
                                                    <div className="text-xs text-admin-text-secondary">{user.email}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap"><RoleBadge role={user.role} /></td>
                                        <td className="px-6 py-4 whitespace-nowrap text-admin-text-secondary">{new Date(user.created_at).toLocaleDateString()}</td>
                                        <td className="px-6 py-4 whitespace-nowrap"><UserStatusBadge status={user.status} /></td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center gap-1">
                                                <Link to={`/admin/user/edit/${user.id}`} className="p-2 text-admin-text-secondary hover:text-admin-primary rounded-md"><span className="material-symbols-outlined text-lg">edit</span></Link>
                                                <button onClick={() => openDeleteModal(user)} className="p-2 text-admin-text-secondary hover:text-red-600 rounded-md"><span className="material-symbols-outlined text-lg">delete</span></button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                                {filteredUsers.length === 0 && (
                                    <tr>
                                        <td colSpan={5} className="px-6 py-8 text-center text-admin-text-secondary">
                                            No users found.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            {isDeleteModalOpen && userToDelete && (
                <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4" role="dialog" aria-modal="true">
                    <div className="relative w-full max-w-md bg-admin-surface rounded-xl shadow-lg p-6">
                        <div className="text-center">
                            <div className="w-12 h-12 rounded-full bg-red-100 text-red-600 flex items-center justify-center mx-auto mb-4">
                                <span className="material-symbols-outlined">warning</span>
                            </div>
                            <h3 className="text-lg font-bold text-admin-text-primary">Delete User</h3>
                            <p className="text-sm text-admin-text-secondary mt-2">
                                Are you sure you want to delete the user <strong className="text-admin-text-primary">{userToDelete.full_name}</strong>? This action cannot be undone.
                            </p>
                        </div>
                        <div className="mt-6 flex justify-center gap-4">
                            <button onClick={closeDeleteModal} className="w-full px-4 py-2 border border-admin-border rounded-lg text-sm font-semibold hover:bg-admin-background transition-colors">
                                Cancel
                            </button>
                            <button onClick={handleDelete} className="w-full px-4 py-2 bg-red-600 text-white font-semibold rounded-lg shadow-sm hover:bg-red-700 transition-colors">
                                Delete User
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

export default AdminUsersPage;
