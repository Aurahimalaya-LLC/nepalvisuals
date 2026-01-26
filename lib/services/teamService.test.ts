import { describe, it, expect, vi, beforeEach } from 'vitest';
import { TeamService } from './teamService';
import { supabase } from '../supabaseClient';

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

describe('TeamService', () => {
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

  it('getAllMembers calls correct supabase query', async () => {
    const mockData = [{ id: '1', full_name: 'Guide Name' }];
    mockOrder.mockResolvedValue({ data: mockData, error: null });

    const result = await TeamService.getAllMembers();
    
    expect(supabase.from).toHaveBeenCalledWith('team_members');
    expect(mockSelect).toHaveBeenCalled();
    expect(mockOrder).toHaveBeenCalledWith('created_at', { ascending: false });
    expect(result).toEqual(mockData);
  });

  it('createMember calls insert with correct data', async () => {
    const newMember = { full_name: 'New Guide', role: 'Lead' };
    const createdMember = { id: '1', ...newMember };
    
    mockSingle.mockResolvedValue({ data: createdMember, error: null });

    const result = await TeamService.createMember(newMember as any);
    
    expect(supabase.from).toHaveBeenCalledWith('team_members');
    expect(mockInsert).toHaveBeenCalledWith(newMember);
    expect(result).toEqual(createdMember);
  });

  it('getAllTypes calls correct supabase query', async () => {
    const mockData = [{ id: '1', name: 'Guides' }];
    mockOrder.mockResolvedValue({ data: mockData, error: null });

    const result = await TeamService.getAllTypes();
    
    expect(supabase.from).toHaveBeenCalledWith('team_types');
    expect(mockSelect).toHaveBeenCalled();
    expect(mockOrder).toHaveBeenCalledWith('name');
    expect(result).toEqual(mockData);
  });
});
