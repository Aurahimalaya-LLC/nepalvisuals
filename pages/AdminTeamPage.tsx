
import React, { useState } from 'react';
import { Link } from 'react-router-dom';

export type TeamMember = {
    id: string;
    name: string;
    role: string;
    image: string;
    status: 'Active' | 'Inactive';
    typeId: string;
};

const mockTeamTypes: { id: string, name: string }[] = [
    { id: 'TT-01', name: 'Guides' },
    { id: 'TT-02', name: 'Management' },
    { id: 'TT-03', name: 'Office Staff' },
];

const mockTeamMembers: TeamMember[] = [
    { id: 'TM-001', name: 'Pasang Sherpa', role: 'Founder & Lead Guide', image: 'https://randomuser.me/api/portraits/men/34.jpg', status: 'Active', typeId: 'TT-01' },
    { id: 'TM-002', name: 'Maya Gurung', role: 'Operations Manager', image: 'https://randomuser.me/api/portraits/women/22.jpg', status: 'Active', typeId: 'TT-02' },
    { id: 'TM-003', name: 'Tenzing Norgay', role: 'Senior Expedition Leader', image: 'https://randomuser.me/api/portraits/men/36.jpg', status: 'Inactive', typeId: 'TT-01' },
    { id: 'TM-004', name: 'Anjali Shrestha', role: 'Customer Experience Lead', image: 'https://randomuser.me/api/portraits/women/24.jpg', status: 'Active', typeId: 'TT-03' },
];

const StatusBadge: React.FC<{ status: 'Active' | 'Inactive' }> = ({ status }) => {
    const isActive = status === 'Active';
    return (
        <span className={`inline-flex items-center gap-1.5 text-xs font-medium px-2 py-1 rounded-full ${isActive ? 'bg-status-published-bg text-status-published' : 'bg-gray-100 text-gray-500'}`}>
            <span className={`w-1.5 h-1.5 rounded-full ${isActive ? 'bg-status-published' : 'bg-gray-400'}`}></span>
            {status}
        </span>
    );
};


const AdminTeamPage: React.FC = () => {
    const [teamMembers, setTeamMembers] = useState<TeamMember[]>(mockTeamMembers);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [memberToDelete, setMemberToDelete] = useState<TeamMember | null>(null);

    const openDeleteModal = (member: TeamMember) => {
        setMemberToDelete(member);
        setIsDeleteModalOpen(true);
    };

    const closeDeleteModal = () => {
        setMemberToDelete(null);
        setIsDeleteModalOpen(false);
    };

    const handleDelete = () => {
        if (memberToDelete) {
            setTeamMembers(prev => prev.filter(m => m.id !== memberToDelete.id));
            closeDeleteModal();
        }
    };

    return (
        <>
            <div className="p-4 sm:p-6 lg:p-8">
                <div className="sm:flex sm:items-center sm:justify-between mb-8">
                    <div>
                        <h1 className="text-2xl font-bold text-admin-text-primary">Team Management</h1>
                        <p className="mt-1 text-sm text-admin-text-secondary">Add, edit, and manage your team members.</p>
                    </div>
                    <div className="mt-4 sm:mt-0">
                        <Link
                            to="/admin/team/new"
                            className="w-full sm:w-auto flex items-center justify-center gap-2 px-4 py-2 bg-admin-primary text-white font-semibold rounded-lg shadow-sm hover:bg-admin-primary-hover transition-colors"
                        >
                            <span className="material-symbols-outlined text-base">add</span>
                            Add Team Member
                        </Link>
                    </div>
                </div>

                <div className="bg-admin-surface rounded-xl border border-admin-border shadow-sm">
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead className="text-xs text-admin-text-secondary uppercase bg-admin-background">
                                <tr>
                                    <th className="px-6 py-3 font-medium text-left">Member</th>
                                    <th className="px-6 py-3 font-medium text-left">Role</th>
                                    <th className="px-6 py-3 font-medium text-left">Type</th>
                                    <th className="px-6 py-3 font-medium text-left">Status</th>
                                    <th className="px-6 py-3 font-medium text-left">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-admin-border">
                                {teamMembers.map(member => (
                                    <tr key={member.id} className="hover:bg-admin-background">
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center gap-3">
                                                <img src={member.image} alt={member.name} className="w-10 h-10 rounded-full object-cover" />
                                                <span className="font-semibold text-admin-text-primary">{member.name}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-admin-text-secondary">{member.role}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-admin-text-secondary">{mockTeamTypes.find(t => t.id === member.typeId)?.name || 'N/A'}</td>
                                        <td className="px-6 py-4 whitespace-nowrap"><StatusBadge status={member.status} /></td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center gap-1">
                                                <Link to={`/admin/team/edit/${member.id}`} className="p-2 text-admin-text-secondary hover:text-admin-primary rounded-md"><span className="material-symbols-outlined text-lg">edit</span></Link>
                                                <button onClick={() => openDeleteModal(member)} className="p-2 text-admin-text-secondary hover:text-red-600 rounded-md"><span className="material-symbols-outlined text-lg">delete</span></button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            {isDeleteModalOpen && memberToDelete && (
                <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 animate-fadeIn" role="dialog" aria-modal="true">
                    <div className="relative w-full max-w-md bg-admin-surface rounded-xl shadow-lg p-6 animate-scaleIn">
                        <div className="text-center">
                            <div className="w-12 h-12 rounded-full bg-red-100 text-red-600 flex items-center justify-center mx-auto mb-4">
                                <span className="material-symbols-outlined">delete_forever</span>
                            </div>
                            <h3 className="text-lg font-bold text-admin-text-primary">Delete Team Member</h3>
                            <p className="text-sm text-admin-text-secondary mt-2">
                                Are you sure you want to delete <strong className="text-admin-text-primary">{memberToDelete.name}</strong>? This action cannot be undone.
                            </p>
                        </div>
                        <div className="mt-6 flex justify-center gap-4">
                            <button onClick={closeDeleteModal} className="w-full px-4 py-2 border border-admin-border rounded-lg text-sm font-semibold hover:bg-admin-background transition-colors">
                                Cancel
                            </button>
                            <button onClick={handleDelete} className="w-full px-4 py-2 bg-red-600 text-white font-semibold rounded-lg shadow-sm hover:bg-red-700 transition-colors">
                                Delete Member
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

export default AdminTeamPage;
