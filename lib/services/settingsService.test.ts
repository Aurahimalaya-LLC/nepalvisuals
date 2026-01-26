import { describe, it, expect, vi, beforeEach } from 'vitest';
import { SettingsService } from './settingsService';
import { supabase } from '../supabaseClient';

const mockSelect = vi.fn();
const mockUpsert = vi.fn();

vi.mock('../supabaseClient', () => ({
  supabase: {
    from: vi.fn(),
  },
}));

describe('SettingsService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    
    vi.mocked(supabase.from).mockReturnValue({
        select: mockSelect,
        upsert: mockUpsert,
    } as any);
  });

  it('getAllSettings fetches and transforms data', async () => {
    const mockData = [
        { key: 'site_config', value: { title: 'Test' } },
        { key: 'branding', value: { logo_url: 'http://logo.png' } }
    ];
    mockSelect.mockResolvedValue({ data: mockData, error: null });

    const result = await SettingsService.getAllSettings();
    
    expect(supabase.from).toHaveBeenCalledWith('settings');
    expect(result.site_config.title).toBe('Test');
    expect(result.branding.logo_url).toBe('http://logo.png');
  });

  it('updateSetting calls upsert', async () => {
    mockUpsert.mockResolvedValue({ error: null });

    await SettingsService.updateSetting('site_config', { title: 'New Title' });
    
    expect(supabase.from).toHaveBeenCalledWith('settings');
    expect(mockUpsert).toHaveBeenCalledWith(expect.objectContaining({
        key: 'site_config',
        value: { title: 'New Title' }
    }));
  });
});
