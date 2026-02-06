import React, { useEffect, useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { supabase } from '../../lib/supabaseClient';
import { AdminLogger } from '../../lib/services/adminLogger';
import { AuthService } from '../../lib/services/authService';

interface RequireAuthProps {
    children: React.ReactNode;
}

const RequireAuth: React.FC<RequireAuthProps> = ({ children }) => {
    const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
    const location = useLocation();

    useEffect(() => {
        const checkAuth = async () => {
            // CHECK FOR BYPASS MODE
            if (import.meta.env.VITE_ENABLE_ADMIN_BYPASS === 'true') {
                console.warn('⚠️ ADMIN AUTHENTICATION BYPASS ENABLED ⚠️');
                setIsAuthenticated(true);
                
                // Log bypass access
                const hasLoggedBypass = sessionStorage.getItem('admin_bypass_logged');
                if (!hasLoggedBypass) {
                    // We log to console as we might not have a user ID for the DB logger
                    console.log('[AdminLogger] Action: ADMIN_BYPASS_ACCESS', {
                        details: {
                            method: 'bypass_env_var',
                            timestamp: new Date().toISOString()
                        }
                    });
                    // Attempt to log to DB if possible (though usually fails without RLS user)
                    // AdminLogger.log(...) 
                    sessionStorage.setItem('admin_bypass_logged', 'true');
                }
                return;
            }

            const { data: { session } } = await supabase.auth.getSession();
            if (!session) {
                const custom = AuthService.getCustomSession();
                if (custom && (custom.role === 'Admin' || custom.role === 'Super Admin' || custom.role === 'Editor' || custom.role === 'Writer')) {
                    setIsAuthenticated(true);
                    return;
                } else {
                    setIsAuthenticated(false);
                    return;
                }
            }

            // Enforce RBAC: Check if user has Admin or Super Admin role
            try {
                console.log('[RequireAuth] Checking profile for user:', session.user.id, session.user.email);
                
                const { data: profile, error } = await supabase
                    .from('profiles')
                    .select('role, email')
                    .eq('id', session.user.id)
                    .single();

                if (error) {
                    console.error('[RequireAuth] Error fetching profile:', error);
                    await handleAccessDenied();
                    return;
                }

                if (!profile) {
                    console.warn('[RequireAuth] No profile found for user');
                    await handleAccessDenied();
                    return;
                }

                console.log('[RequireAuth] User profile found:', profile);

                const allowedRoles = ['Admin', 'Super Admin', 'Editor', 'Writer'];
                if (!allowedRoles.includes(profile.role)) {
                    console.warn(`[RequireAuth] Access denied: Role '${profile.role}' is not sufficient.`);
                    await handleAccessDenied();
                } else {
                    console.log('[RequireAuth] Access granted for role:', profile.role);
                    setIsAuthenticated(true);
                    
                    // Log successful admin access
                    const hasLoggedSession = sessionStorage.getItem('admin_session_logged');
                    if (!hasLoggedSession) {
                        AdminLogger.log({
                            action: 'ADMIN_ACCESS_GRANTED',
                            details: {
                                role: profile.role,
                                method: session.user.app_metadata.provider || 'email'
                            }
                        });
                        sessionStorage.setItem('admin_session_logged', 'true');
                    }
                }
            } catch (err) {
                console.error('[RequireAuth] Unexpected error checking admin role:', err);
                setIsAuthenticated(false);
            }
        };

        const handleAccessDenied = async () => {
            console.log('[RequireAuth] Signing out due to access denial');
            setIsAuthenticated(false);
            await supabase.auth.signOut();
            // Clear any custom session as well
            sessionStorage.removeItem('custom_admin_session');
        };

        checkAuth();
    }, []);

    if (isAuthenticated === null) {
        // Loading state
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="flex flex-col items-center gap-4">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
                    <p className="text-gray-500 font-medium">Verifying access...</p>
                </div>
            </div>
        );
    }

    if (!isAuthenticated) {
        return <Navigate to="/admin/login" state={{ from: location, error: "Access Denied: You do not have administrator privileges." }} replace />;
    }

    return <>{children}</>;
};

export default RequireAuth;
