import { supabase } from '../supabaseClient';

export interface AuditLogParams {
    action: string;
    tableName?: string;
    recordId?: string;
    oldData?: any;
    newData?: any;
    details?: any;
}

export const AdminLogger = {
    /**
     * Log an admin action to the audit_logs table.
     */
    async log(params: AuditLogParams) {
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return;

            const { error } = await supabase.from('audit_logs').insert({
                user_id: user.id,
                action: params.action,
                table_name: params.tableName,
                record_id: params.recordId,
                old_data: params.oldData,
                new_data: params.newData,
                changed_by: user.id,
                details: {
                    ...params.details,
                    userAgent: navigator.userAgent,
                    url: window.location.href,
                    timestamp: new Date().toISOString()
                }
            });

            if (error) {
                console.error('Failed to save audit log:', error);
            }
        } catch (err) {
            console.error('AdminLogger Error:', err);
        }
    }
};
