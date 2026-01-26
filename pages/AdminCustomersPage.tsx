import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { CustomerService, ExtendedCustomer } from '../lib/services/customerService';

const AdminCustomersPage: React.FC = () => {
    const [customers, setCustomers] = useState<ExtendedCustomer[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [customerToDelete, setCustomerToDelete] = useState<ExtendedCustomer | null>(null);
    const [searchTerm, setSearchTerm] = useState('');

    const fetchCustomers = async () => {
        setLoading(true);
        try {
            const data = await CustomerService.getAllCustomers();
            setCustomers(data);
        } catch (err: any) {
            console.error(err);
            setError('Failed to load customers.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchCustomers();
    }, []);

    const openDeleteModal = (customer: ExtendedCustomer) => {
        setCustomerToDelete(customer);
        setIsDeleteModalOpen(true);
    };

    const closeDeleteModal = () => {
        setCustomerToDelete(null);
        setIsDeleteModalOpen(false);
    };

    const handleDelete = async () => {
        if (!customerToDelete) return;
        try {
            await CustomerService.deleteCustomer(customerToDelete.id);
            setCustomers(customers.filter(c => c.id !== customerToDelete.id));
            closeDeleteModal();
        } catch (err: any) {
            console.error(err);
            alert('Failed to delete customer. They might have active bookings linked.');
        }
    };

    const filteredCustomers = customers.filter(customer => 
        customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        customer.email.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (loading) return <div className="p-8 text-center">Loading customers...</div>;
    if (error) return <div className="p-8 text-center text-red-600">{error}</div>;

    return (
        <>
            <div className="p-4 sm:p-6 lg:p-8">
                <div className="sm:flex sm:items-center sm:justify-between mb-8">
                    <div>
                        <h1 className="text-2xl font-bold text-admin-text-primary">Customer Management</h1>
                        <p className="mt-1 text-sm text-admin-text-secondary">View and manage your customer database.</p>
                    </div>
                    <div className="mt-4 sm:mt-0">
                        <Link
                            to="/admin/customer/new"
                            className="w-full sm:w-auto flex items-center justify-center gap-2 px-4 py-2 bg-admin-primary text-white font-semibold rounded-lg shadow-sm hover:bg-admin-primary-hover transition-colors"
                        >
                            <span className="material-symbols-outlined text-base">add</span>
                            Add New Customer
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
                                    <th className="px-6 py-3 font-medium text-left">Customer</th>
                                    <th className="px-6 py-3 font-medium text-left">Joined Date</th>
                                    <th className="px-6 py-3 font-medium text-left">Bookings</th>
                                    <th className="px-6 py-3 font-medium text-left">Total Spend</th>
                                    <th className="px-6 py-3 font-medium text-left">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-admin-border">
                                {filteredCustomers.map(customer => (
                                    <tr key={customer.id} className="hover:bg-admin-background">
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-full bg-admin-primary/10 flex items-center justify-center overflow-hidden">
                                                     {customer.avatar_url ? (
                                                        <img src={customer.avatar_url} alt={customer.name} className="w-full h-full object-cover" />
                                                     ) : (
                                                        <span className="text-admin-primary font-bold text-lg">{customer.name.charAt(0)}</span>
                                                     )}
                                                </div>
                                                <div>
                                                    <div className="font-semibold text-admin-text-primary">{customer.name}</div>
                                                    <div className="text-xs text-admin-text-secondary">{customer.email}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-admin-text-secondary">
                                            {customer.joined_date ? new Date(customer.joined_date).toLocaleDateString() : '-'}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-admin-text-secondary">{customer.bookings_count}</td>
                                        <td className="px-6 py-4 whitespace-nowrap font-semibold text-admin-text-primary">${customer.total_spend?.toLocaleString()}</td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center gap-1">
                                                <Link to={`/admin/customer/edit/${customer.id}`} className="p-2 text-admin-text-secondary hover:text-admin-primary rounded-md"><span className="material-symbols-outlined text-lg">edit</span></Link>
                                                <button onClick={() => openDeleteModal(customer)} className="p-2 text-admin-text-secondary hover:text-red-600 rounded-md"><span className="material-symbols-outlined text-lg">delete</span></button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                                {filteredCustomers.length === 0 && (
                                    <tr>
                                        <td colSpan={5} className="px-6 py-8 text-center text-admin-text-secondary">
                                            No customers found.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                    <div className="p-4 border-t border-admin-border flex items-center justify-between">
                        <p className="text-xs text-admin-text-secondary">Showing <span className="font-semibold">{filteredCustomers.length}</span> results</p>
                    </div>
                </div>
            </div>

            {isDeleteModalOpen && customerToDelete && (
                <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4" role="dialog" aria-modal="true">
                    <div className="relative w-full max-w-md bg-admin-surface rounded-xl shadow-lg p-6">
                        <div className="text-center">
                            <div className="w-12 h-12 rounded-full bg-red-100 text-red-600 flex items-center justify-center mx-auto mb-4">
                                <span className="material-symbols-outlined">warning</span>
                            </div>
                            <h3 className="text-lg font-bold text-admin-text-primary">Delete Customer</h3>
                            <p className="text-sm text-admin-text-secondary mt-2">
                                Are you sure you want to delete <strong className="text-admin-text-primary">{customerToDelete.name}</strong>? This action cannot be undone.
                            </p>
                        </div>
                        <div className="mt-6 flex justify-center gap-4">
                            <button onClick={closeDeleteModal} className="w-full px-4 py-2 border border-admin-border rounded-lg text-sm font-semibold hover:bg-admin-background transition-colors">Cancel</button>
                            <button onClick={handleDelete} className="w-full px-4 py-2 bg-red-600 text-white font-semibold rounded-lg shadow-sm hover:bg-red-700 transition-colors">Delete Customer</button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

export default AdminCustomersPage;
