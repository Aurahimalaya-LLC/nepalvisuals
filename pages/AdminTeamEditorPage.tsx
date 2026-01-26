import React, { useState, useRef, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { TeamService, TeamMember, TeamType } from '../lib/services/teamService';

const AdminTeamEditorPage: React.FC = () => {
    const { memberId } = useParams<{ memberId: string }>();
    const isEditing = !!memberId && memberId !== 'new';
    const navigate = useNavigate();

    const [loading, setLoading] = useState(false);
    const [teamTypes, setTeamTypes] = useState<TeamType[]>([]);
    const [member, setMember] = useState<Partial<TeamMember>>({
        full_name: '',
        role: '',
        status: 'Active',
        team_type_id: '',
        image_url: ''
    });

    const [imagePreview, setImagePreview] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        const loadData = async () => {
            setLoading(true);
            try {
                const types = await TeamService.getAllTypes();
                setTeamTypes(types);

                if (isEditing && memberId) {
                    const data = await TeamService.getMemberById(memberId);
                    if (data) {
                        setMember(data);
                        if (data.image_url) setImagePreview(data.image_url);
                    }
                }
            } catch (err) {
                console.error(err);
                alert('Failed to load data.');
            } finally {
                setLoading(false);
            }
        };
        loadData();
    }, [isEditing, memberId]);

    const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setImagePreview(reader.result as string);
                // For MVP, not uploading to storage yet, just preview. 
                // Ideally use MediaService to upload and set image_url
            };
            reader.readAsDataURL(file);
        }
    };
    
    const triggerFileSelect = () => fileInputRef.current?.click();

    const handleSave = async () => {
        if (!member.full_name) {
            alert('Full Name is required.');
            return;
        }

        setLoading(true);
        try {
            if (isEditing && memberId) {
                await TeamService.updateMember(memberId, member);
                alert('Team member updated successfully!');
            } else {
                await TeamService.createMember(member);
                alert('Team member created successfully!');
                navigate('/admin/team');
            }
        } catch (err: any) {
            console.error(err);
            alert('Failed to save team member: ' + err.message);
        } finally {
            setLoading(false);
        }
    };

    if (loading && isEditing && !member.id) return <div className="p-8 text-center">Loading...</div>;

    return (
        <div className="p-4 sm:p-6 lg:p-8">
            <div className="mb-8">
                <Link to="/admin/team" className="inline-flex items-center gap-2 text-sm font-semibold text-admin-text-secondary hover:text-admin-primary mb-4">
                    <span className="material-symbols-outlined">arrow_back</span>
                    Back to Team
                </Link>
                <h1 className="text-2xl font-bold text-admin-text-primary">
                    {isEditing ? `Edit Team Member` : 'Add New Team Member'}
                </h1>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2">
                    <div className="bg-admin-surface rounded-lg border border-admin-border p-6 space-y-4">
                        <div>
                            <label className="text-sm font-medium text-admin-text-primary block mb-1">Full Name</label>
                            <input 
                                type="text" 
                                value={member.full_name || ''} 
                                onChange={(e) => setMember({...member, full_name: e.target.value})}
                                className="w-full border border-admin-border rounded-lg text-sm" 
                            />
                        </div>
                        <div>
                            <label className="text-sm font-medium text-admin-text-primary block mb-1">Team Type</label>
                            <select 
                                value={member.team_type_id || ''} 
                                onChange={e => setMember({...member, team_type_id: e.target.value})}
                                className="w-full border border-admin-border rounded-lg text-sm"
                            >
                                <option value="">Select a type...</option>
                                {teamTypes.map(type => (
                                    <option key={type.id} value={type.id}>{type.name}</option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label className="text-sm font-medium text-admin-text-primary block mb-1">Role / Position</label>
                            <input 
                                type="text" 
                                value={member.role || ''} 
                                onChange={(e) => setMember({...member, role: e.target.value})}
                                className="w-full border border-admin-border rounded-lg text-sm" 
                            />
                        </div>
                    </div>
                </div>

                <div className="lg:col-span-1 space-y-8">
                    <div className="bg-admin-surface rounded-lg border border-admin-border">
                        <div className="p-6 border-b border-admin-border">
                            <h3 className="font-semibold text-admin-text-primary">Status</h3>
                        </div>
                        <div className="p-6">
                             <div className="flex items-center justify-between">
                                <p className="font-medium text-admin-text-primary text-sm">Member Status</p>
                                <label className="relative inline-flex items-center cursor-pointer">
                                    <input 
                                        type="checkbox" 
                                        checked={member.status === 'Active'} 
                                        onChange={(e) => setMember({...member, status: e.target.checked ? 'Active' : 'Inactive'})}
                                        className="sr-only peer" 
                                    />
                                    <div className="w-11 h-6 bg-gray-200 rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-admin-primary"></div>
                                </label>
                            </div>
                        </div>
                    </div>
                     <div className="bg-admin-surface rounded-lg border border-admin-border">
                        <div className="p-6 border-b border-admin-border">
                            <h3 className="font-semibold text-admin-text-primary">Profile Photo</h3>
                        </div>
                        <div className="p-6">
                            <div className="flex flex-col items-center gap-4">
                                <div className="w-32 h-32 rounded-full bg-admin-background flex items-center justify-center overflow-hidden border-2 border-dashed border-admin-border">
                                    {imagePreview ? (
                                        <img src={imagePreview} alt="Profile preview" className="w-full h-full object-cover" />
                                    ) : (
                                        <span className="material-symbols-outlined text-4xl text-admin-text-secondary">person</span>
                                    )}
                                </div>
                                <input type="file" ref={fileInputRef} onChange={handleImageChange} accept="image/*" className="hidden" />
                                <button onClick={triggerFileSelect} className="w-full text-center px-4 py-2 border border-admin-border rounded-lg text-sm font-semibold hover:bg-admin-background transition-colors">
                                    {isEditing ? 'Change Photo' : 'Upload Photo'}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="mt-8 pt-6 border-t border-admin-border flex justify-end gap-3">
                <Link to="/admin/team" className="px-4 py-2 border border-admin-border rounded-lg text-sm font-semibold hover:bg-admin-background transition-colors">Cancel</Link>
                <button 
                    onClick={handleSave} 
                    disabled={loading}
                    className="px-4 py-2 bg-admin-primary text-white font-semibold rounded-lg shadow-sm hover:bg-admin-primary-hover transition-colors disabled:opacity-50"
                >
                    {loading ? 'Saving...' : (isEditing ? 'Save Changes' : 'Create Member')}
                </button>
            </div>
        </div>
    );
};

export default AdminTeamEditorPage;
