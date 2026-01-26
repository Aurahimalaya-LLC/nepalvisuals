import { describe, it, expect, vi, beforeEach } from 'vitest';
import { RegionService } from './regionService';
import { supabase } from '../supabaseClient';

// Re-use the same mocking strategy as tourService
const mockOrder = vi.fn();
const mockSingle = vi.fn();
const mockSelect = vi.fn();
const mockInsert = vi.fn();
const mockUpdate = vi.fn();
const mockDelete = vi.fn();
const mockEq = vi.fn();

vi.mock('../supabaseClient', () => ({
  supabase: {
    from: vi.fn(),
  },
}));

describe('RegionService', () => {
  beforeEach(() => {
    vi.clearAllMocks();

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
  });

  it('getAllRegions calls correct supabase query', async () => {
    const mockData = [{ id: '1', name: 'Everest' }];
    mockOrder.mockResolvedValue({ data: mockData, error: null });

    const result = await RegionService.getAllRegions();
    
    expect(supabase.from).toHaveBeenCalledWith('regions');
    expect(mockSelect).toHaveBeenCalledWith('*');
    expect(mockOrder).toHaveBeenCalledWith('name', { ascending: true });
    expect(result).toEqual(mockData);
  });

  it('createRegion calls insert with correct data', async () => {
    const newRegion = { name: 'Annapurna' };
    const createdRegion = { id: '1', ...newRegion };
    
    mockSingle.mockResolvedValue({ data: createdRegion, error: null });

    const result = await RegionService.createRegion(newRegion as any);
    
    expect(supabase.from).toHaveBeenCalledWith('regions');
    expect(mockInsert).toHaveBeenCalledWith(newRegion);
    expect(result).toEqual(createdRegion);
  });
});
