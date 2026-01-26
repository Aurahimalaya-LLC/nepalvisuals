import { supabase } from '../supabaseClient';

export interface BootstrapResult {
    success: boolean;
    message: string;
    details?: any;
}

export const databaseBootstrapper = {
    /**
     * Verifies existence of critical tables and creates them if missing via RPC.
     * This allows the application to self-heal in new environments.
     */
    async verifyAndCreateTables(): Promise<BootstrapResult> {
        try {
            console.log('🔄 Bootstrapping: Verifying database schema...');
            
            // Call the secure RPC function to check/create tables
            const { data, error } = await supabase.rpc('check_and_create_featured_destinations');

            if (error) {
                // If RPC fails (e.g. function doesn't exist yet), we can't do much automatically
                // but we should log it clearly.
                console.error('❌ Bootstrapping Failed (RPC Error):', error);
                
                // Special handling: if RPC is missing, it means the user hasn't run the *one* required migration
                if (error.code === '42883') { // undefined_function
                    return {
                        success: false,
                        message: 'RPC function missing. Please run migration 20260107000018_create_table_rpc.sql'
                    };
                }
                
                return { success: false, message: error.message, details: error };
            }

            console.log('✅ Bootstrapping Result:', data);
            return { 
                success: true, 
                message: data?.message || 'Database verified', 
                details: data 
            };

        } catch (err: any) {
            console.error('❌ Bootstrapping Exception:', err);
            return { 
                success: false, 
                message: err.message || 'Unknown error during bootstrap' 
            };
        }
    }
};
