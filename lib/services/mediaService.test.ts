import { describe, it, expect, vi, beforeEach } from 'vitest';
import { MediaService } from './mediaService';
import { supabase } from '../supabaseClient';

// Re-use mocking strategy
const mockOrder = vi.fn();
const mockSingle = vi.fn();
const mockSelect = vi.fn();
const mockInsert = vi.fn();
const mockUpdate = vi.fn();
const mockDelete = vi.fn();
const mockEq = vi.fn();
const mockUpload = vi.fn();
const mockRemove = vi.fn();
const mockGetPublicUrl = vi.fn();

vi.mock('../supabaseClient', () => ({
  supabase: {
    from: vi.fn(),
    storage: {
        from: vi.fn()
    }
  },
}));

describe('MediaService', () => {
  beforeEach(() => {
    vi.clearAllMocks();

    // DB Mocks
    mockSelect.mockReturnValue({
        order: mockOrder,
        eq: mockEq,
        single: mockSingle
    });
    mockInsert.mockReturnValue({
        select: vi.fn().mockReturnValue({ single: mockSingle })
    });
    mockUpdate.mockReturnValue({
        eq: vi.fn().mockReturnValue({ 
            select: vi.fn().mockReturnValue({ single: mockSingle }) 
        })
    });
    mockDelete.mockReturnValue({
        eq: mockEq
    });

    vi.mocked(supabase.from).mockReturnValue({
        select: mockSelect,
        insert: mockInsert,
        update: mockUpdate,
        delete: mockDelete,
    } as any);

    // Storage Mocks
    mockGetPublicUrl.mockReturnValue({ data: { publicUrl: 'http://test.com/file.jpg' } });
    
    vi.mocked(supabase.storage.from).mockReturnValue({
        upload: mockUpload,
        remove: mockRemove,
        getPublicUrl: mockGetPublicUrl
    } as any);
  });

  it('getAllMedia fetches from db and enriches with public url', async () => {
    const mockData = [{ id: '1', file_path: 'path/to/file.jpg' }];
    mockOrder.mockResolvedValue({ data: mockData, error: null });

    const result = await MediaService.getAllMedia();
    
    expect(supabase.from).toHaveBeenCalledWith('media_files');
    expect(supabase.storage.from).toHaveBeenCalledWith('media');
    expect(mockGetPublicUrl).toHaveBeenCalledWith('path/to/file.jpg');
    expect(result[0].public_url).toBe('http://test.com/file.jpg');
  });

  it('uploadFile uploads to storage and inserts to db', async () => {
    const file = new File(['content'], 'test.jpg', { type: 'image/jpeg' });
    mockUpload.mockResolvedValue({ data: { path: 'path' }, error: null });
    mockSingle.mockResolvedValue({ 
        data: { id: '1', file_path: 'path', filename: 'test.jpg' }, 
        error: null 
    });

    const result = await MediaService.uploadFile(file);
    
    expect(supabase.storage.from).toHaveBeenCalledWith('media');
    expect(mockUpload).toHaveBeenCalled();
    expect(supabase.from).toHaveBeenCalledWith('media_files');
    expect(mockInsert).toHaveBeenCalled();
    expect(result.public_url).toBe('http://test.com/file.jpg');
  });

  it('deleteMedia removes from db and storage', async () => {
    mockEq.mockResolvedValue({ error: null });
    mockRemove.mockResolvedValue({ error: null });

    await MediaService.deleteMedia('1', 'path/to/file.jpg');
    
    expect(supabase.from).toHaveBeenCalledWith('media_files');
    expect(mockDelete).toHaveBeenCalled();
    expect(supabase.storage.from).toHaveBeenCalledWith('media');
    expect(mockRemove).toHaveBeenCalledWith(['path/to/file.jpg']);
  });
});
