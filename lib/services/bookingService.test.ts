import { describe, it, expect, vi, beforeEach } from 'vitest';
import { BookingService } from './bookingService';
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

describe('BookingService', () => {
  beforeEach(() => {
    vi.clearAllMocks();

    mockSelect.mockReturnValue({
        order: mockOrder,
        eq: mockEq,
        single: mockSingle
    });
    
    // Fix: Ensure insert returns an object with select
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

  it('getAllBookings calls correct supabase query', async () => {
    const mockData = [{ id: '1', status: 'Confirmed' }];
    mockOrder.mockResolvedValue({ data: mockData, error: null });

    const result = await BookingService.getAllBookings();
    
    expect(supabase.from).toHaveBeenCalledWith('bookings');
    expect(mockSelect).toHaveBeenCalled();
    expect(mockOrder).toHaveBeenCalledWith('created_at', { ascending: false });
    expect(result).toEqual(mockData);
  });

  it('createBooking inserts booking and travelers', async () => {
    const newBooking = { status: 'Confirmed' };
    const createdBooking = { id: '1', ...newBooking };
    const travelers = [{ name: 'Test Traveler' }];
    
    // Setup for booking insert (returns created booking)
    mockSingle.mockResolvedValueOnce({ data: createdBooking, error: null });
    
    // Setup for travelers insert (returns success)
    // Note: The second call to insert (for travelers) doesn't chain select().single() in the service code
    // it just awaits the insert promise directly or checks error.
    // However, our mock setup above makes insert return an object with select.
    // We need to handle the fact that `insert` is called twice.
    
    const result = await BookingService.createBooking(newBooking as any, travelers as any);
    
    expect(supabase.from).toHaveBeenCalledWith('bookings');
    expect(mockInsert).toHaveBeenCalledWith(newBooking);
    
    // Check traveler insert
    expect(supabase.from).toHaveBeenCalledWith('booking_travelers');
    expect(result).toEqual(createdBooking);
  });
});
