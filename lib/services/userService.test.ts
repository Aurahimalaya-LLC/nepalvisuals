import { describe, it, expect, vi, beforeEach } from 'vitest';
import { UserService } from './userService';
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

describe('UserService', () => {
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

  it('getAllUsers calls correct supabase query', async () => {
    const mockData = [{ id: '1', full_name: 'Test User' }];
    mockOrder.mockResolvedValue({ data: mockData, error: null });

    const result = await UserService.getAllUsers();
    
    expect(supabase.from).toHaveBeenCalledWith('profiles');
    expect(mockSelect).toHaveBeenCalled();
    expect(mockOrder).toHaveBeenCalledWith('created_at', { ascending: false });
    expect(result).toEqual(mockData);
  });

  it('createUser calls insert with correct data', async () => {
    const newUser = { full_name: 'New User', email: 'test@example.com' };
    const createdUser = { id: '1', ...newUser };
    
    mockSingle.mockResolvedValue({ data: createdUser, error: null });

    const result = await UserService.createUser(newUser as any);
    
    expect(supabase.from).toHaveBeenCalledWith('profiles');
    expect(mockInsert).toHaveBeenCalledWith(newUser);
    expect(result).toEqual(createdUser);
  });
});
