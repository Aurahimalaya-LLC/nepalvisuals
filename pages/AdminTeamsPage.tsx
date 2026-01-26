import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { TeamService, TeamMember } from '../lib/services/teamService';

const StatusBadge: React.FC<{ status: string }> = ({ status }) => {
    const isActive = status === 'Active';
    return (
        <span className={`inline-flex items-center gap-1.5 text-xs font-medium px-2 py-1 rounded-full ${isActive ? 'bg-status-published-bg text-status-published' : 'bg-gray-100 text-gray-500'}`}>
            <span className={`w-1.5 h-1.5 rounded-full ${isActive ? 'bg-status-published' : 'bg-gray-400'}`}></span>
            {status}
        </span>
    );
};

const AdminTeamsPage: React.FC = () => {
    const [members, setMembers] = useState<TeamMember[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [memberToDelete, setMemberToDelete] = useState<TeamMember | null>(null);
    const [searchTerm, setSearchTerm] = useState('');

    const fetchMembers = async () => {
        setLoading(true);
        try {
            const data = await TeamService.getAllMembers();
            setMembers(data);
        } catch (err: any) {
            console.error(err);
            setError('Failed to load team members.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchMembers();
    }, []);

    const openDeleteModal = (member: TeamMember) => {
        setMemberToDelete(member);
        setIsDeleteModalOpen(true);
    };

    const closeDeleteModal = () => {
        setMemberToDelete(null);
        setIsDeleteModalOpen(false);
    };

    const handleDelete = async () => {
        if (!memberToDelete) return;
        try {
            await TeamService.deleteMember(memberToDelete.id);
            setMembers(members.filter(m => m.id !== memberToDelete.id));
            closeDeleteModal();
        } catch (err: any) {
            console.error(err);
            alert('Failed to delete team member.');
        }
    };

    const filteredMembers = members.filter(member => 
        member.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (member.role && member.role.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    if (loading) return <div className="p-8 text-center">Loading team...</div>;
    if (error) return <div className="p-8 text-center text-red-600">{error}</div>;

    return (
        <>
            <div className="p-4 sm:p-6 lg:p-8">
                <div className="sm:flex sm:items-center sm:justify-between mb-8">
                    <div>
                        <h1 className="text-2xl font-bold text-admin-text-primary">Team Management</h1>
                        <p className="mt-1 text-sm text-admin-text-secondary">Manage your guides, staff, and leadership team.</p>
                    </div>
                    <div className="mt-4 sm:mt-0 flex gap-3">
                        <Link
                            to="/admin/team-types"
                            className="px-4 py-2 border border-admin-border rounded-lg text-sm font-semibold hover:bg-admin-background transition-colors"
                        >
                            Manage Team Types
                        </Link>
                        <Link
                            to="/admin/team/new"
                            className="flex items-center gap-2 px-4 py-2 bg-admin-primary text-white font-semibold rounded-lg shadow-sm hover:bg-admin-primary-hover transition-colors"
                        >
                            <span className="material-symbols-outlined text-base">add</span>
                            Add Team Member
                        </Link>
                    </div>
                </div>

                <div className="bg-admin-surface rounded-xl border border-admin-border shadow-sm">
                    <div className="p-4 border-b border-admin-border">
                        <div className="relative max-w-md">
                            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-admin-text-secondary text-lg">search</span>
                            <input 
                                type="text" 
                                placeholder="Search by name or role..." 
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full pl-10 pr-4 py-2 border border-admin-border rounded-lg text-sm focus:ring-2 focus:ring-admin-primary focus:border-transparent transition" 
                            />
                        </div>
                    </div>
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
                                {filteredMembers.map(member => (
                                    <tr key={member.id} className="hover:bg-admin-background">
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-full bg-admin-primary/10 flex items-center justify-center overflow-hidden">
                                                     {member.image_url ? (
                                                        <img src={member.image_url} alt={member.full_name} className="w-full h-full object-cover" />
                                                     ) : (
                                                        <span className="text-admin-primary font-bold text-lg">{member.full_name.charAt(0)}</span>
                                                     )}
                                                </div>
                                                <span className="font-semibold text-admin-text-primary">{member.full_name}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-admin-text-secondary">{member.role || '-'}</td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className="bg-gray-100 text-gray-800 px-2 py-1 text-xs font-medium rounded-full">
                                                {member.team_types?.name || 'Unassigned'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap"><StatusBadge status={member.status} /></td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center gap-1">
                                                <Link to={`/admin/team/edit/${member.id}`} className="p-2 text-admin-text-secondary hover:text-admin-primary rounded-md"><span className="material-symbols-outlined text-lg">edit</span></Link>
                                                <button onClick={() => openDeleteModal(member)} className="p-2 text-admin-text-secondary hover:text-red-600 rounded-md"><span className="material-symbols-outlined text-lg">delete</span></button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                                {filteredMembers.length === 0 && (
                                    <tr>
                                        <td colSpan={5} className="px-6 py-8 text-center text-admin-text-secondary">
                                            No team members found.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            {isDeleteModalOpen && memberToDelete && (
                <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4" role="dialog" aria-modal="true">
                    <div className="relative w-full max-w-md bg-admin-surface rounded-xl shadow-lg p-6">
                        <div className="text-center">
                            <div className="w-12 h-12 rounded-full bg-red-100 text-red-600 flex items-center justify-center mx-auto mb-4">
                                <span className="material-symbols-outlined">warning</span>
                            </div>
                            <h3 className="text-lg font-bold text-admin-text-primary">Delete Member</h3>
                            <p className="text-sm text-admin-text-secondary mt-2">
                                Are you sure you want to delete <strong className="text-admin-text-primary">{memberToDelete.full_name}</strong>? This action cannot be undone.
                            </p>
                        </div>
                        <div className="mt-6 flex justify-center gap-4">
                            <button onClick={closeDeleteModal} className="w-full px-4 py-2 border border-admin-border rounded-lg text-sm font-semibold hover:bg-admin-background transition-colors">Cancel</button>
                            <button onClick={handleDelete} className="w-full px-4 py-2 bg-red-600 text-white font-semibold rounded-lg shadow-sm hover:bg-red-700 transition-colors">Delete Member</button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

export default AdminTeamsPage;
