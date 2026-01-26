import { supabase } from '../supabaseClient';

export interface EmailAttachment {
    filename: string;
    content: string; // base64
    contentType?: string;
}

export interface SendEmailParams {
    to: string | string[];
    subject: string;
    text?: string;
    html?: string;
    attachments?: EmailAttachment[];
}

export const EmailService = {
    /**
     * Sends an email via the 'send-email' Supabase Edge Function.
     * This requires the user to be authenticated.
     */
    async sendEmail(params: SendEmailParams) {
        try {
            const { data, error } = await supabase.functions.invoke('send-email', {
                body: params,
            });

            if (error) {
                console.error('Email Edge Function Error:', error);
                throw new Error(error.message || 'Failed to invoke email function');
            }

            if (!data.success) {
                console.error('Email Sending Failed:', data.error);
                throw new Error(data.error || 'Failed to send email');
            }

            return data;
        } catch (err: any) {
            console.error('EmailService Exception:', err);
            throw err;
        }
    },
};
