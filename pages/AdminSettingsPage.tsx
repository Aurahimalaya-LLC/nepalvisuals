import React, { useEffect, useState, useRef } from 'react';
import { SettingsService, AllSettings } from '../lib/services/settingsService';

const AdminSettingsPage: React.FC = () => {
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [activeTab, setActiveTab] = useState<'general' | 'branding' | 'notifications' | 'appearance' | 'security'>('general');
    
    // State for all settings
    const [settings, setSettings] = useState<AllSettings>({
        site_config: { title: '', email: '' },
        branding: { logo_url: '', favicon_url: '' },
        notifications: { email_bookings: false, email_contact: false },
        appearance: { theme: 'light', primary_color: '#0F172A' }
    });

    const logoInputRef = useRef<HTMLInputElement>(null);
    const faviconInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        loadSettings();
    }, []);

    const loadSettings = async () => {
        setLoading(true);
        try {
            const data = await SettingsService.getAllSettings();
            // Merge with defaults to ensure all keys exist
            setSettings(prev => ({
                ...prev,
                ...data,
                // Ensure sub-objects are merged correctly if partial data exists
                site_config: { ...prev.site_config, ...(data.site_config || {}) },
                branding: { ...prev.branding, ...(data.branding || {}) },
                notifications: { ...prev.notifications, ...(data.notifications || {}) },
                appearance: { ...prev.appearance, ...(data.appearance || {}) }
            }));
        } catch (err) {
            console.error(err);
            alert('Failed to load settings.');
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async () => {
        setSaving(true);
        try {
            // Save all sections (or could optimize to save only changed ones)
            await Promise.all([
                SettingsService.updateSetting('site_config', settings.site_config),
                SettingsService.updateSetting('branding', settings.branding),
                SettingsService.updateSetting('notifications', settings.notifications),
                SettingsService.updateSetting('appearance', settings.appearance)
            ]);
            alert('Settings saved successfully!');
        } catch (err) {
            console.error(err);
            alert('Failed to save settings.');
        } finally {
            setSaving(false);
        }
    };

    const handleFileChange = (
        event: React.ChangeEvent<HTMLInputElement>,
        key: 'logo_url' | 'favicon_url'
    ) => {
        const file = event.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                const result = reader.result as string;
                setSettings(prev => ({
                    ...prev,
                    branding: { ...prev.branding, [key]: result }
                }));
            };
            reader.readAsDataURL(file);
        }
    };

    const tabs = [
        { id: 'general', label: 'General', icon: 'settings' },
        { id: 'branding', label: 'Branding', icon: 'palette' },
        { id: 'appearance', label: 'Appearance', icon: 'contrast' },
        { id: 'notifications', label: 'Notifications', icon: 'notifications' },
        { id: 'security', label: 'Security', icon: 'lock' }
    ];

    if (loading) return <div className="p-8 text-center">Loading settings...</div>;

    return (
        <div className="p-4 sm:p-6 lg:p-8 max-w-5xl mx-auto">
            <div className="mb-8">
                <h1 className="text-2xl font-bold text-admin-text-primary">Settings</h1>
                <p className="mt-1 text-sm text-admin-text-secondary">Manage your application configuration and preferences.</p>
            </div>

            <div className="flex flex-col md:flex-row gap-8">
                {/* Sidebar Navigation */}
                <div className="w-full md:w-64 flex-shrink-0">
                    <nav className="space-y-1">
                        {tabs.map(tab => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id as any)}
                                className={`w-full flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-lg transition-colors ${
                                    activeTab === tab.id
                                        ? 'bg-admin-primary text-white shadow-sm'
                                        : 'text-admin-text-secondary hover:bg-admin-background hover:text-admin-text-primary'
                                }`}
                            >
                                <span className="material-symbols-outlined text-lg">{tab.icon}</span>
                                {tab.label}
                            </button>
                        ))}
                    </nav>
                </div>

                {/* Main Content Area */}
                <div className="flex-grow space-y-6">
                    {/* General Settings */}
                    {activeTab === 'general' && (
                        <div className="bg-admin-surface rounded-xl border border-admin-border shadow-sm animate-fadeIn">
                            <div className="p-6 border-b border-admin-border">
                                <h2 className="text-lg font-bold text-admin-text-primary">General Settings</h2>
                                <p className="text-sm text-admin-text-secondary mt-1">Basic site information and contact details.</p>
                            </div>
                            <div className="p-6 space-y-4">
                                <div>
                                    <label className="text-sm font-medium text-admin-text-primary block mb-1">Site Title</label>
                                    <input 
                                        type="text" 
                                        value={settings.site_config.title}
                                        onChange={(e) => setSettings({...settings, site_config: {...settings.site_config, title: e.target.value}})}
                                        className="w-full border border-admin-border rounded-lg text-sm" 
                                    />
                                </div>
                                <div>
                                    <label className="text-sm font-medium text-admin-text-primary block mb-1">Support Email</label>
                                    <input 
                                        type="email" 
                                        value={settings.site_config.email}
                                        onChange={(e) => setSettings({...settings, site_config: {...settings.site_config, email: e.target.value}})}
                                        className="w-full border border-admin-border rounded-lg text-sm" 
                                    />
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Branding Settings */}
                    {activeTab === 'branding' && (
                        <div className="bg-admin-surface rounded-xl border border-admin-border shadow-sm animate-fadeIn">
                            <div className="p-6 border-b border-admin-border">
                                <h2 className="text-lg font-bold text-admin-text-primary">Branding</h2>
                                <p className="text-sm text-admin-text-secondary mt-1">Customize your site's logo and identity.</p>
                            </div>
                            <div className="p-6 space-y-6">
                                <div>
                                    <label className="text-sm font-medium text-admin-text-primary block mb-2">Site Logo</label>
                                    <div className="flex items-center gap-6">
                                        <div className="w-40 h-16 bg-admin-background rounded-lg flex items-center justify-center border-2 border-dashed border-admin-border overflow-hidden p-1 relative group">
                                            {settings.branding.logo_url ? (
                                                <img src={settings.branding.logo_url} alt="Logo preview" className="max-h-full max-w-full object-contain" />
                                            ) : (
                                                <span className="material-symbols-outlined text-3xl text-admin-text-secondary">image</span>
                                            )}
                                        </div>
                                        <div>
                                            <input
                                                type="file"
                                                ref={logoInputRef}
                                                onChange={(e) => handleFileChange(e, 'logo_url')}
                                                accept="image/*"
                                                className="hidden"
                                            />
                                            <button
                                                onClick={() => logoInputRef.current?.click()}
                                                type="button"
                                                className="px-4 py-2 border border-admin-border rounded-lg text-sm font-semibold hover:bg-admin-background transition-colors"
                                            >
                                                Upload Logo
                                            </button>
                                        </div>
                                    </div>
                                </div>

                                <div>
                                    <label className="text-sm font-medium text-admin-text-primary block mb-2">Favicon</label>
                                    <div className="flex items-center gap-6">
                                        <div className="w-16 h-16 bg-admin-background rounded-lg flex items-center justify-center border-2 border-dashed border-admin-border overflow-hidden p-1">
                                            {settings.branding.favicon_url ? (
                                                <img src={settings.branding.favicon_url} alt="Favicon preview" className="w-8 h-8 object-contain" />
                                            ) : (
                                                <span className="material-symbols-outlined text-2xl text-admin-text-secondary">favorite</span>
                                            )}
                                        </div>
                                        <div>
                                            <input
                                                type="file"
                                                ref={faviconInputRef}
                                                onChange={(e) => handleFileChange(e, 'favicon_url')}
                                                accept="image/*"
                                                className="hidden"
                                            />
                                            <button
                                                onClick={() => faviconInputRef.current?.click()}
                                                type="button"
                                                className="px-4 py-2 border border-admin-border rounded-lg text-sm font-semibold hover:bg-admin-background transition-colors"
                                            >
                                                Upload Favicon
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Appearance Settings */}
                    {activeTab === 'appearance' && (
                        <div className="bg-admin-surface rounded-xl border border-admin-border shadow-sm animate-fadeIn">
                             <div className="p-6 border-b border-admin-border">
                                <h2 className="text-lg font-bold text-admin-text-primary">Appearance</h2>
                                <p className="text-sm text-admin-text-secondary mt-1">Customize the look and feel of the admin panel.</p>
                            </div>
                            <div className="p-6 space-y-6">
                                <div>
                                    <label className="text-sm font-medium text-admin-text-primary block mb-2">Theme Preference</label>
                                    <div className="grid grid-cols-3 gap-4">
                                        {(['light', 'dark', 'system'] as const).map((mode) => (
                                            <button
                                                key={mode}
                                                onClick={() => setSettings({...settings, appearance: {...settings.appearance, theme: mode}})}
                                                className={`flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all ${
                                                    settings.appearance.theme === mode 
                                                        ? 'border-admin-primary bg-admin-primary/5' 
                                                        : 'border-admin-border hover:border-admin-border/80'
                                                }`}
                                            >
                                                <span className="material-symbols-outlined text-2xl">
                                                    {mode === 'light' ? 'light_mode' : mode === 'dark' ? 'dark_mode' : 'settings_brightness'}
                                                </span>
                                                <span className="text-sm font-medium capitalize">{mode}</span>
                                            </button>
                                        ))}
                                    </div>
                                </div>
                                <div>
                                    <label className="text-sm font-medium text-admin-text-primary block mb-2">Primary Color</label>
                                    <div className="flex items-center gap-3">
                                        <input 
                                            type="color" 
                                            value={settings.appearance.primary_color}
                                            onChange={(e) => setSettings({...settings, appearance: {...settings.appearance, primary_color: e.target.value}})}
                                            className="w-10 h-10 rounded cursor-pointer border-0 p-0"
                                        />
                                        <input 
                                            type="text" 
                                            value={settings.appearance.primary_color}
                                            onChange={(e) => setSettings({...settings, appearance: {...settings.appearance, primary_color: e.target.value}})}
                                            className="w-32 border border-admin-border rounded-lg text-sm uppercase"
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Notification Settings */}
                    {activeTab === 'notifications' && (
                        <div className="bg-admin-surface rounded-xl border border-admin-border shadow-sm animate-fadeIn">
                             <div className="p-6 border-b border-admin-border">
                                <h2 className="text-lg font-bold text-admin-text-primary">Email Notifications</h2>
                                <p className="text-sm text-admin-text-secondary mt-1">Control when you receive emails.</p>
                            </div>
                            <div className="p-6 space-y-4 divide-y divide-admin-border">
                                <div className="flex items-center justify-between pt-4 first:pt-0">
                                    <div>
                                        <p className="font-medium text-admin-text-primary">New Booking Alerts</p>
                                        <p className="text-sm text-admin-text-secondary">Get notified when a customer places a new booking.</p>
                                    </div>
                                    <label className="relative inline-flex items-center cursor-pointer">
                                        <input 
                                            type="checkbox" 
                                            checked={settings.notifications.email_bookings}
                                            onChange={(e) => setSettings({...settings, notifications: {...settings.notifications, email_bookings: e.target.checked}})}
                                            className="sr-only peer" 
                                        />
                                        <div className="w-11 h-6 bg-gray-200 rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-admin-primary"></div>
                                    </label>
                                </div>
                                <div className="flex items-center justify-between pt-4">
                                    <div>
                                        <p className="font-medium text-admin-text-primary">Contact Form Submissions</p>
                                        <p className="text-sm text-admin-text-secondary">Get notified when someone sends a message via contact form.</p>
                                    </div>
                                    <label className="relative inline-flex items-center cursor-pointer">
                                        <input 
                                            type="checkbox" 
                                            checked={settings.notifications.email_contact}
                                            onChange={(e) => setSettings({...settings, notifications: {...settings.notifications, email_contact: e.target.checked}})}
                                            className="sr-only peer" 
                                        />
                                        <div className="w-11 h-6 bg-gray-200 rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-admin-primary"></div>
                                    </label>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Security Settings */}
                    {activeTab === 'security' && (
                        <div className="bg-admin-surface rounded-xl border border-admin-border shadow-sm animate-fadeIn">
                             <div className="p-6 border-b border-admin-border">
                                <h2 className="text-lg font-bold text-admin-text-primary">Security</h2>
                                <p className="text-sm text-admin-text-secondary mt-1">Manage password and authentication settings.</p>
                            </div>
                            <div className="p-6 space-y-6">
                                <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg flex gap-3">
                                    <span className="material-symbols-outlined text-yellow-600">info</span>
                                    <div>
                                        <h4 className="font-semibold text-yellow-800 text-sm">Two-Factor Authentication</h4>
                                        <p className="text-xs text-yellow-700 mt-1">2FA is currently disabled. We recommend enabling it for higher security.</p>
                                        <button className="mt-2 text-xs font-bold text-yellow-800 hover:underline">Enable 2FA</button>
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    <h3 className="text-sm font-semibold text-admin-text-primary uppercase tracking-wider">Change Password</h3>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div className="md:col-span-2">
                                            <label className="text-sm font-medium text-admin-text-primary block mb-1">Current Password</label>
                                            <input type="password" placeholder="Enter current password" className="w-full border border-admin-border rounded-lg text-sm" />
                                        </div>
                                        <div>
                                            <label className="text-sm font-medium text-admin-text-primary block mb-1">New Password</label>
                                            <input type="password" placeholder="Enter new password" className="w-full border border-admin-border rounded-lg text-sm" />
                                        </div>
                                        <div>
                                            <label className="text-sm font-medium text-admin-text-primary block mb-1">Confirm New Password</label>
                                            <input type="password" placeholder="Confirm new password" className="w-full border border-admin-border rounded-lg text-sm" />
                                        </div>
                                    </div>
                                    <div className="flex justify-end">
                                        <button className="px-4 py-2 border border-admin-border rounded-lg text-sm font-semibold hover:bg-admin-background transition-colors">Update Password</button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Sticky Action Bar for Mobile / Convenience */}
            <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-admin-border p-4 md:hidden z-10 flex justify-end gap-3 shadow-lg">
                 <button className="px-4 py-2 border border-admin-border rounded-lg text-sm font-semibold hover:bg-gray-100 transition-colors">Cancel</button>
                 <button onClick={handleSave} disabled={saving} className="px-4 py-2 bg-admin-primary text-white font-semibold rounded-lg shadow-sm hover:bg-admin-primary-hover transition-colors disabled:opacity-50">
                    {saving ? 'Saving...' : 'Save Changes'}
                </button>
            </div>
             
             {/* Desktop Action Bar */}
             <div className="hidden md:flex justify-end gap-3 mt-8 pt-6 border-t border-admin-border">
                <button className="px-4 py-2 border border-admin-border rounded-lg text-sm font-semibold hover:bg-gray-100 transition-colors">Cancel</button>
                <button onClick={handleSave} disabled={saving} className="px-4 py-2 bg-admin-primary text-white font-semibold rounded-lg shadow-sm hover:bg-admin-primary-hover transition-colors disabled:opacity-50">
                    {saving ? 'Saving...' : 'Save All Changes'}
                </button>
            </div>
        </div>
    );
};

export default AdminSettingsPage;
