import { supabase } from '../supabaseClient';

export interface SiteConfig {
  title: string;
  email: string;
}

export interface BrandingConfig {
  logo_url: string;
  favicon_url: string;
}

export interface NotificationConfig {
  email_bookings: boolean;
  email_contact: boolean;
}

export interface AppearanceConfig {
  theme: 'light' | 'dark' | 'system';
  primary_color: string;
}

export interface AllSettings {
  site_config: SiteConfig;
  branding: BrandingConfig;
  notifications: NotificationConfig;
  appearance: AppearanceConfig;
}

export const SettingsService = {
  async getAllSettings(): Promise<AllSettings> {
    const { data, error } = await supabase
      .from('settings')
      .select('key, value');
    
    if (error) throw error;

    const settings: any = {};
    data?.forEach(item => {
        settings[item.key] = item.value;
    });

    return settings as AllSettings;
  },

  async updateSetting(key: keyof AllSettings, value: any) {
    const { error } = await supabase
      .from('settings')
      .upsert({ key, value, updated_at: new Date().toISOString() });
    
    if (error) throw error;
  }
};
