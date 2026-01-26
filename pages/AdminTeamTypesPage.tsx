import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { TeamService, TeamType } from '../lib/services/teamService';

const EditModal: React.FC<{
    type: TeamType | null;
    onClose: () => void;
    onSave: (type: Partial<TeamType>) => Promise<void>;
}> = ({ type, onClose, onSave }) => {
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const isEditing = !!type;
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (type) {
            setName(type.name);
            setDescription(type.description || '');
        } else {
            setName('');
            setDescription('');
        }
    }, [type]);

    const handleSave = async () => {
        if (!name.trim()) return;
        setLoading(true);
        try {
            await onSave({ ...(type || {}), name, description });
            onClose();
        } catch (err) {
            console.error(err);
            alert('Failed to save team type.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 animate-fadeIn" onClick={onClose} role="dialog" aria-modal="true">
            <div className="w-full max-w-md bg-admin-surface rounded-xl shadow-lg flex flex-col overflow-hidden animate-scaleIn" onClick={e => e.stopPropagation()}>
                <div className="p-6 border-b border-admin-border">
                    <h3 className="text-xl font-bold text-admin-text-primary">{isEditing ? 'Edit Team Type' : 'Add New Team Type'}</h3>
                </div>
                <div className="p-6 space-y-4">
                    <div>
                        <label className="text-sm font-medium text-admin-text-primary block mb-1">Type Name</label>
                        <input 
                            type="text" 
                            value={name} 
                            onChange={e => setName(e.target.value)} 
                            placeholder="e.g., Guides" 
                            className="w-full border border-admin-border rounded-lg text-sm" 
                        />
                    </div>
                    <div>
                        <label className="text-sm font-medium text-admin-text-primary block mb-1">Description</label>
                        <textarea 
                            value={description} 
                            onChange={e => setDescription(e.target.value)} 
                            placeholder="Optional description..." 
                            rows={3}
                            className="w-full border border-admin-border rounded-lg text-sm" 
                        ></textarea>
                    </div>
                </div>
                <div className="p-6 bg-admin-background border-t border-admin-border flex justify-end gap-3">
                    <button onClick={onClose} className="px-4 py-2 border border-admin-border rounded-lg text-sm font-semibold hover:bg-gray-100 transition-colors">Cancel</button>
                    <button onClick={handleSave} disabled={loading} className="px-4 py-2 bg-admin-primary text-white font-semibold rounded-lg shadow-sm hover:bg-admin-primary-hover transition-colors disabled:opacity-50">
                        {loading ? 'Saving...' : (isEditing ? 'Save Changes' : 'Create Type')}
                    </button>
                </div>
            </div>
        </div>
    );
};

const DeleteModal: React.FC<{
    type: TeamType | null;
    onClose: () => void;
    onConfirm: () => Promise<void>;
}> = ({ type, onClose, onConfirm }) => {
    const [loading, setLoading] = useState(false);

    if (!type) return null;

    const handleConfirm = async () => {
        setLoading(true);
        try {
            await onConfirm();
            onClose();
        } catch (err) {
            console.error(err);
            alert('Failed to delete team type.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 animate-fadeIn" role="dialog" aria-modal="true">
            <div className="relative w-full max-w-md bg-admin-surface rounded-xl shadow-lg p-6 animate-scaleIn">
                <div className="text-center">
                    <div className="w-12 h-12 rounded-full bg-red-100 text-red-600 flex items-center justify-center mx-auto mb-4">
                        <span className="material-symbols-outlined">delete_forever</span>
                    </div>
                    <h3 className="text-lg font-bold text-admin-text-primary">Delete Team Type</h3>
                    <p className="text-sm text-admin-text-secondary mt-2">
                        Are you sure you want to delete the type <strong className="text-admin-text-primary">{type.name}</strong>? This action might fail if there are members assigned to this type.
                    </p>
                </div>
                <div className="mt-6 flex justify-center gap-4">
                    <button onClick={onClose} className="w-full px-4 py-2 border border-admin-border rounded-lg text-sm font-semibold hover:bg-admin-background transition-colors">Cancel</button>
                    <button onClick={handleConfirm} disabled={loading} className="w-full px-4 py-2 bg-red-600 text-white font-semibold rounded-lg shadow-sm hover:bg-red-700 transition-colors disabled:opacity-50">
                        {loading ? 'Deleting...' : 'Delete Type'}
                    </button>
                </div>
            </div>
        </div>
    );
};


const AdminTeamTypesPage: React.FC = () => {
    const [teamTypes, setTeamTypes] = useState<TeamType[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [selectedType, setSelectedType] = useState<TeamType | null>(null);

    const fetchTypes = async () => {
        setLoading(true);
        try {
            const data = await TeamService.getAllTypes();
            setTeamTypes(data);
        } catch (err: any) {
            console.error(err);
            setError('Failed to load team types.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchTypes();
    }, []);

    const openAddModal = () => {
        setSelectedType(null);
        setIsEditModalOpen(true);
    };

    const openEditModal = (type: TeamType) => {
        setSelectedType(type);
        setIsEditModalOpen(true);
    };

    const openDeleteModal = (type: TeamType) => {
        setSelectedType(type);
        setIsDeleteModalOpen(true);
    };
    
    const closeModal = () => {
        setSelectedType(null);
        setIsEditModalOpen(false);
        setIsDeleteModalOpen(false);
    };

    const handleSave = async (typeData: Partial<TeamType>) => {
        if (selectedType) {
            // Edit
            const updated = await TeamService.updateType(selectedType.id, typeData);
            setTeamTypes(teamTypes.map(t => t.id === updated.id ? updated : t));
        } else {
            // Add
            const created = await TeamService.createType(typeData);
            setTeamTypes([...teamTypes, created]);
        }
    };

    const handleDelete = async () => {
        if (selectedType) {
            await TeamService.deleteType(selectedType.id);
            setTeamTypes(teamTypes.filter(t => t.id !== selectedType.id));
        }
    };

    if (loading) return <div className="p-8 text-center">Loading team types...</div>;
    if (error) return <div className="p-8 text-center text-red-600">{error}</div>;

    return (
        <>
            <div className="p-4 sm:p-6 lg:p-8">
                <div className="mb-8">
                    <Link to="/admin/team" className="inline-flex items-center gap-2 text-sm font-semibold text-admin-text-secondary hover:text-admin-primary mb-4">
                        <span className="material-symbols-outlined">arrow_back</span>
                        Back to Team
                    </Link>
                    <div className="sm:flex sm:items-center sm:justify-between">
                        <div>
                            <h1 className="text-2xl font-bold text-admin-text-primary">Team Types</h1>
                            <p className="mt-1 text-sm text-admin-text-secondary">Categorize your team members by their roles and responsibilities.</p>
                        </div>
                        <div className="mt-4 sm:mt-0">
                            <button
                                onClick={openAddModal}
                                className="w-full sm:w-auto flex items-center justify-center gap-2 px-4 py-2 bg-admin-primary text-white font-semibold rounded-lg shadow-sm hover:bg-admin-primary-hover transition-colors"
                            >
                                <span className="material-symbols-outlined text-base">add</span>
                                Add New Type
                            </button>
                        </div>
                    </div>
                </div>

                <div className="bg-admin-surface rounded-xl border border-admin-border shadow-sm">
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead className="text-xs text-admin-text-secondary uppercase bg-admin-background">
                                <tr>
                                    <th className="px-6 py-3 font-medium text-left">Type Name</th>
                                    <th className="px-6 py-3 font-medium text-left">Description</th>
                                    <th className="px-6 py-3 font-medium text-left">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-admin-border">
                                {teamTypes.map(type => (
                                    <tr key={type.id} className="hover:bg-admin-background">
                                        <td className="px-6 py-4 whitespace-nowrap font-semibold text-admin-text-primary">{type.name}</td>
                                        <td className="px-6 py-4 text-admin-text-secondary">{type.description || '-'}</td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center gap-1">
                                                <button onClick={() => openEditModal(type)} className="p-2 text-admin-text-secondary hover:text-admin-primary rounded-md"><span className="material-symbols-outlined text-lg">edit</span></button>
                                                <button onClick={() => openDeleteModal(type)} className="p-2 text-admin-text-secondary hover:text-red-600 rounded-md"><span className="material-symbols-outlined text-lg">delete</span></button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                                {teamTypes.length === 0 && (
                                    <tr>
                                        <td colSpan={3} className="px-6 py-8 text-center text-admin-text-secondary">
                                            No team types found.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            {isEditModalOpen && <EditModal type={selectedType} onClose={closeModal} onSave={handleSave} />}
            {isDeleteModalOpen && <DeleteModal type={selectedType} onClose={closeModal} onConfirm={handleDelete} />}
        </>
    );
};

export default AdminTeamTypesPage;
