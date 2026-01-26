import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Region, RegionService } from '../lib/services/regionService';
import RegionTourCountsPanel from '../components/admin/RegionTourCountsPanel';

const StatusBadge: React.FC<{ status: string }> = ({ status }) => {
    const isPublished = status === 'Published';
    return (
        <span className={`inline-flex items-center gap-1.5 text-xs font-medium px-2 py-1 rounded-full ${isPublished ? 'bg-status-published-bg text-status-published' : 'bg-status-draft-bg text-status-draft'}`}>
            <span className={`w-1.5 h-1.5 rounded-full ${isPublished ? 'bg-status-published' : 'bg-status-draft'}`}></span>
            {status}
        </span>
    );
};

const RegionRow: React.FC<{ region: Region, level: number, onDelete: (r: Region) => void, searchTerm: string }> = ({ region, level, onDelete, searchTerm }) => {
    // Basic filter check
    const matches = !searchTerm || 
        region.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
        (region.description && region.description.toLowerCase().includes(searchTerm.toLowerCase()));
    
    // Check if any children match
    const childrenMatch = region.subRegions?.some(child => 
        child.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
        (child.description && child.description.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    if (!matches && !childrenMatch) return null;

    return (
        <>
            <tr className="hover:bg-admin-background">
                <td className="px-6 py-4 whitespace-nowrap font-semibold text-admin-text-primary">
                    <div className="flex items-center gap-3" style={{ paddingLeft: `${level * 24}px` }}>
                         {level > 0 && <span className="material-symbols-outlined text-gray-400 text-sm">subdirectory_arrow_right</span>}
                         {region.image_url && (
                            <img src={region.image_url} alt={region.name} className="w-8 h-8 rounded object-cover" />
                        )}
                        {region.name}
                    </div>
                </td>
                <td className="px-6 py-4 max-w-xs truncate text-admin-text-secondary">{region.description}</td>
                <td className="px-6 py-4 whitespace-nowrap"><StatusBadge status={region.status} /></td>
                <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-1">
                        <Link to={`/admin/region/edit/${region.id}`} className="p-2 text-admin-text-secondary hover:text-admin-primary rounded-md"><span className="material-symbols-outlined text-lg">edit</span></Link>
                        <button onClick={() => onDelete(region)} className="p-2 text-admin-text-secondary hover:text-red-600 rounded-md"><span className="material-symbols-outlined text-lg">delete</span></button>
                    </div>
                </td>
            </tr>
            {region.subRegions?.map(child => (
                <RegionRow 
                    key={child.id} 
                    region={child} 
                    level={level + 1} 
                    onDelete={onDelete}
                    searchTerm={searchTerm}
                />
            ))}
        </>
    );
};

const AdminRegionsPage: React.FC = () => {
    const [regions, setRegions] = useState<Region[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [regionToDelete, setRegionToDelete] = useState<Region | null>(null);
    const [searchTerm, setSearchTerm] = useState('');

    const fetchRegions = async () => {
        setLoading(true);
        try {
            const data = await RegionService.getRegionHierarchy();
            // TODO: Fetch real tour counts when relations are set up
            const enrichRegions = (list: Region[]): Region[] => list.map(r => ({
                ...r, 
                tourCount: Math.floor(Math.random() * 5),
                subRegions: r.subRegions ? enrichRegions(r.subRegions) : []
            }));
            setRegions(enrichRegions(data));
        } catch (err: any) {
            console.error(err);
            setError('Failed to load regions.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchRegions();
    }, []);

    const openDeleteModal = (region: Region) => {
        setRegionToDelete(region);
        setIsDeleteModalOpen(true);
    };

    const closeDeleteModal = () => {
        setRegionToDelete(null);
        setIsDeleteModalOpen(false);
    };

    const handleDelete = async () => {
        if (!regionToDelete) return;
        try {
            await RegionService.deleteRegion(regionToDelete.id);
            // Refresh to rebuild hierarchy
            fetchRegions();
            closeDeleteModal();
        } catch (err: any) {
            console.error(err);
            alert('Failed to delete region.');
        }
    };

    if (loading) return <div className="p-8 text-center">Loading regions...</div>;
    if (error) return <div className="p-8 text-center text-red-600">{error}</div>;

    return (
        <>
            <div className="p-4 sm:p-6 lg:p-8">
                <RegionTourCountsPanel />
                <div className="sm:flex sm:items-center sm:justify-between mb-8">
                    <div>
                        <h1 className="text-2xl font-bold text-admin-text-primary">Region Management</h1>
                        <p className="mt-1 text-sm text-admin-text-secondary">Organize your tours into distinct geographical regions.</p>
                    </div>
                    <div className="mt-4 sm:mt-0">
                        <Link
                            to="/admin/region/new"
                            className="w-full sm:w-auto flex items-center justify-center gap-2 px-4 py-2 bg-admin-primary text-white font-semibold rounded-lg shadow-sm hover:bg-admin-primary-hover transition-colors"
                        >
                            <span className="material-symbols-outlined text-base">add</span>
                            Add New Region
                        </Link>
                    </div>
                </div>

                <div className="bg-admin-surface rounded-xl border border-admin-border shadow-sm">
                    <div className="p-4 border-b border-admin-border">
                         <div className="relative max-w-md">
                             <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-admin-text-secondary text-lg">search</span>
                             <input 
                                type="text" 
                                placeholder="Search regions..." 
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
                                    <th className="px-6 py-3 font-medium text-left">Region Name</th>
                                    <th className="px-6 py-3 font-medium text-left">Description</th>
                                    <th className="px-6 py-3 font-medium text-left">Status</th>
                                    <th className="px-6 py-3 font-medium text-left">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-admin-border">
                                {regions.map(region => (
                                    <RegionRow 
                                        key={region.id} 
                                        region={region} 
                                        level={0} 
                                        onDelete={openDeleteModal}
                                        searchTerm={searchTerm}
                                    />
                                ))}
                                {regions.length === 0 && (
                                    <tr>
                                        <td colSpan={4} className="px-6 py-8 text-center text-admin-text-secondary">
                                            No regions found.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

             {isDeleteModalOpen && regionToDelete && (
                <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4" role="dialog" aria-modal="true">
                    <div className="relative w-full max-w-md bg-admin-surface rounded-xl shadow-lg p-6">
                        <div className="text-center">
                             <div className="w-12 h-12 rounded-full bg-red-100 text-red-600 flex items-center justify-center mx-auto mb-4">
                                <span className="material-symbols-outlined">delete_forever</span>
                            </div>
                            <h3 className="text-lg font-bold text-admin-text-primary">Delete Region</h3>
                            <p className="text-sm text-admin-text-secondary mt-2">
                                Are you sure you want to delete the <strong className="text-admin-text-primary">{regionToDelete.name}</strong> region? This action is permanent.
                            </p>
                        </div>
                        <div className="mt-6 flex justify-center gap-4">
                            <button onClick={closeDeleteModal} className="w-full px-4 py-2 border border-admin-border rounded-lg text-sm font-semibold hover:bg-admin-background transition-colors">
                                Cancel
                            </button>
                            <button onClick={handleDelete} className="w-full px-4 py-2 bg-red-600 text-white font-semibold rounded-lg shadow-sm hover:bg-red-700 transition-colors">
                                Delete Region
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

export default AdminRegionsPage;
