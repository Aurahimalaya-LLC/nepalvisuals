import { supabase } from '../supabaseClient';

export interface Redirect {
    id: string;
    source_path: string;
    target_path: string;
    status_code: number;
    is_active: boolean;
    created_at: string;
}

export const RedirectService = {
    async getAllRedirects() {
        const { data, error } = await supabase
            .from('redirects')
            .select('*')
            .order('created_at', { ascending: false });
        
        if (error) throw error;
        return data as Redirect[];
    },

    async getRedirect(sourcePath: string) {
        // Try exact match first
        let { data, error } = await supabase
            .from('redirects')
            .select('*')
            .eq('source_path', sourcePath)
            .eq('is_active', true)
            .single();

        if (!data) {
            // Try with or without trailing slash
            const altPath = sourcePath.endsWith('/') ? sourcePath.slice(0, -1) : `${sourcePath}/`;
            const { data: altData } = await supabase
                .from('redirects')
                .select('*')
                .eq('source_path', altPath)
                .eq('is_active', true)
                .single();
            data = altData;
        }

        return data as Redirect | null;
    },

    async createRedirect(sourcePath: string, targetPath: string, statusCode = 301) {
        // Ensure source path starts with /
        const cleanSource = sourcePath.startsWith('/') ? sourcePath : `/${sourcePath}`;
        const cleanTarget = targetPath.startsWith('/') || targetPath.startsWith('http') ? targetPath : `/${targetPath}`;

        const { data, error } = await supabase
            .from('redirects')
            .insert([{
                source_path: cleanSource,
                target_path: cleanTarget,
                status_code: statusCode
            }])
            .select()
            .single();
        
        if (error) throw error;
        return data as Redirect;
    },

    async updateRedirect(id: string, updates: Partial<Redirect>) {
        const { data, error } = await supabase
            .from('redirects')
            .update(updates)
            .eq('id', id)
            .select()
            .single();
        
        if (error) throw error;
        return data as Redirect;
    },

    async deleteRedirect(id: string) {
        const { error } = await supabase
            .from('redirects')
            .delete()
            .eq('id', id);
        
        if (error) throw error;
    }
};
