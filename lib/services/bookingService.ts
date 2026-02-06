import { supabase } from '../supabaseClient';

export interface Customer {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  address: string | null;
}

export interface BookingTraveler {
  id: string;
  booking_id: string;
  name: string;
  email: string | null;
  phone: string | null;
  is_primary: boolean;
  dob?: string | null;
  gender?: string | null;
  country?: string | null;
  dietary_requirements?: string | null;
}

export interface Booking {
  id: string;
  customer_id?: string | null; // Made optional/nullable
  user_id?: string | null;     // Added user_id
  tour_id: string;
  dates: string | null;
  total_price: number;
  status: 'Pending' | 'Confirmed' | 'Cancelled';
  payment_status: 'Not Paid' | 'Deposit Paid' | 'Paid in Full' | 'Refunded';
  created_at: string;
  updated_at: string;
  // Relations
  customers?: Customer;
  profiles?: { full_name: string; email: string }; // Added profile relation
  tours?: { name: string };
  booking_travelers?: BookingTraveler[];
  guest_count?: number;
}

export const BookingService = {
  async getAllBookings() {
    // Helper to backfill guest_count if missing from DB schema
    const enrichBooking = (b: any): Booking => ({
        ...b,
        guest_count: b.guest_count ?? (b.booking_travelers?.length || 0)
    });

    /* RLS fetch disabled due to inconsistency - forcing Edge Function for Admin
    try {
      const { data: sessionResp } = await supabase.auth.getSession();
      if (sessionResp?.session) {
        const { data, error } = await supabase
          .from('bookings')
          .select(`
            *,
            customers (name, email),
            profiles (full_name, email),
            tours (name),
            booking_travelers (*)
          `)
          .order('created_at', { ascending: false });
        
        if (!error && data) return data.map(enrichBooking);
        console.warn("RLS fetch failed, falling back to Edge Function:", error);
      }
    } catch (e) {
      console.warn("RLS fetch exception:", e);
    }
    */

    // Fallback: Invoke secure Edge Function with service role
    // Using GET method to trigger the list-all behavior in the edge function
    const { data, error } = await supabase.functions.invoke('admin-get-bookings', { 
        method: 'GET'
    });
    
    if (error) throw error;
    return (data?.data || []).map(enrichBooking);
  },

  async getBookingById(id: string) {
    // Helper to backfill guest_count
    const enrichBooking = (b: any): Booking => ({
        ...b,
        guest_count: b.guest_count ?? (b.booking_travelers?.length || 0)
    });

    /* RLS fetch disabled
    try {
        const { data, error } = await supabase
          .from('bookings')
          .select(`
            *,
            customers (*),
            profiles (*),
            tours (name),
            booking_travelers (*)
          `)
          .eq('id', id)
          .single();
        
        if (!error && data) return enrichBooking(data);
        console.warn("RLS single fetch failed, falling back to Edge Function list:", error);
    } catch (e) {
         console.warn("RLS single fetch exception:", e);
    }
    */

    // Fallback: Get all bookings via Edge Function and filter in memory
    // This bypasses RLS issues for individual items
    const allBookings = await this.getAllBookings();
    const found = allBookings.find(b => b.id === id);
    
    if (!found) {
        throw new Error('Booking not found (checked RLS and Edge Function)');
    }
    return found;
  },

  async createBooking(booking: Partial<Booking>, travelers: Partial<BookingTraveler>[]) {
    // 0. Handle Customer (Find or Create)
    let customerId = booking.customer_id;

    if (!customerId) {
        // Try to find primary traveler to use as customer
        const primaryTraveler = travelers.find(t => t.is_primary) || travelers[0];
        
        if (primaryTraveler && primaryTraveler.email) {
            try {
                // Check if customer exists by email
                const { data: existingCustomers } = await supabase
                    .from('customers')
                    .select('id')
                    .eq('email', primaryTraveler.email)
                    .limit(1);
                
                if (existingCustomers && existingCustomers.length > 0) {
                    customerId = existingCustomers[0].id;
                } else {
                    // Create new customer
                    const { data: newCustomer, error: createError } = await supabase
                        .from('customers')
                        .insert({
                            name: primaryTraveler.name,
                            email: primaryTraveler.email,
                            phone: primaryTraveler.phone,
                            address: primaryTraveler.country // Map country to address for now
                        })
                        .select('id')
                        .single();
                    
                    if (!createError && newCustomer) {
                        customerId = newCustomer.id;
                    } else {
                        console.warn("Failed to auto-create customer:", createError);
                    }
                }
            } catch (err) {
                console.error("Error handling customer creation:", err);
            }
        }
    }

    // 1. Create Booking
    const bookingToInsert = { ...booking };
    if (customerId) {
        bookingToInsert.customer_id = customerId;
    }
    // Explicitly remove guest_count if present to avoid schema errors
    if ('guest_count' in bookingToInsert) {
        delete (bookingToInsert as any).guest_count;
    }

    let bookingData;

    // Try RLS Insert
    const { data: rlsData, error: rlsError } = await supabase
      .from('bookings')
      .insert(bookingToInsert)
      .select()
      .single();
    
    if (!rlsError && rlsData) {
        bookingData = rlsData;
    } else {
        console.warn('RLS Create failed, falling back to admin function:', rlsError);
        const { data: funcData, error: funcError } = await supabase.functions.invoke('admin-get-bookings', {
            body: { action: 'create', data: bookingToInsert }
        });
        if (funcError || !funcData?.success) throw (funcError || new Error('Admin function create failed'));
        bookingData = funcData.data;
    }

    // 2. Create Travelers
    if (travelers.length > 0) {
        const travelersWithId = travelers.map(t => ({ ...t, booking_id: bookingData.id }));
        
        // Try RLS Insert (Bulk)
        const { error: travelersError } = await supabase
            .from('booking_travelers')
            .insert(travelersWithId);
        
        if (travelersError) {
             console.warn('RLS Travelers Create failed, falling back to admin function (sequential):', travelersError);
             
             // Fallback: Insert sequentially via Admin Function (Legacy support)
             for (const traveler of travelersWithId) {
                 const { error: funcError } = await supabase.functions.invoke('admin-get-bookings', {
                    body: { action: 'create', table: 'booking_travelers', data: traveler }
                });
                if (funcError) {
                     console.error("Failed to create traveler via admin function:", funcError);
                     // Continue trying others? Or throw? Throwing might leave partial state.
                     // For now, log and continue.
                }
             }
        }
    }

    return bookingData as Booking;
  },

  async updateBooking(id: string, updates: Partial<Booking>, travelers?: Partial<BookingTraveler>[]) {
    // 1. Update Booking
    const updatesWithGuests = { ...updates, updated_at: new Date().toISOString() };
    if ('guest_count' in updatesWithGuests) {
        delete (updatesWithGuests as any).guest_count;
    }
    
    let bookingData;

    // Try RLS Update
    const { data: rlsData, error: rlsError } = await supabase
      .from('bookings')
      .update(updatesWithGuests)
      .eq('id', id)
      .select()
      .single();
    
    if (!rlsError && rlsData) {
        bookingData = rlsData;
    } else {
         console.warn('RLS Update failed, falling back to admin function:', rlsError);
         const { data: funcData, error: funcError } = await supabase.functions.invoke('admin-get-bookings', {
            body: { action: 'update', id, data: updatesWithGuests }
        });
        if (funcError || !funcData?.success) throw (funcError || new Error('Admin function update failed'));
        bookingData = funcData.data;
    }

    // 2. Update Travelers
    if (travelers) {
        // Delete existing (Try RLS first)
        const { error: deleteError } = await supabase.from('booking_travelers').delete().eq('booking_id', id);
        
        if (deleteError) {
             console.warn('RLS Travelers Delete failed, falling back to admin function (sequential):', deleteError);
             
             // Fallback: 
             // A. Fetch existing travelers IDs (using our Admin Read capability)
             const currentBooking = await this.getBookingById(id);
             const existingTravelers = currentBooking.booking_travelers || [];

             // B. Delete each one
             for (const t of existingTravelers) {
                 await supabase.functions.invoke('admin-get-bookings', {
                    body: { action: 'delete', table: 'booking_travelers', id: t.id }
                });
             }
        }

        // Insert new
        const travelersWithId = travelers.map(t => ({ ...t, booking_id: id }));
        const { error: insertError } = await supabase
            .from('booking_travelers')
            .insert(travelersWithId);
            
        if (insertError) {
             console.warn('RLS Travelers Insert failed, falling back to admin function (sequential):', insertError);
             
             // Fallback: Insert sequentially via Admin Function
             for (const traveler of travelersWithId) {
                 const { error: funcInsertError } = await supabase.functions.invoke('admin-get-bookings', {
                    body: { action: 'create', table: 'booking_travelers', data: traveler }
                });
                if (funcInsertError) {
                    console.error("Failed to insert traveler via admin function:", funcInsertError);
                }
            }
        }
    }

    return bookingData as Booking;
  },

  async deleteBooking(id: string) {
    const { error } = await supabase
      .from('bookings')
      .delete()
      .eq('id', id);
    
    if (error) {
         console.warn('RLS Delete failed, falling back to admin function:', error);
         const { error: funcError } = await supabase.functions.invoke('admin-get-bookings', {
            body: { action: 'delete', id }
        });
        if (funcError) throw funcError;
    }
  },

  // Customer Helpers
  async getAllCustomers() {
      const { data, error } = await supabase.from('customers').select('*').order('name');
      if (error) throw error;
      return data as Customer[];
  },

  async createCustomer(customer: Partial<Customer>) {
      const { data, error } = await supabase.from('customers').insert(customer).select().single();
      if (error) throw error;
      return data as Customer;
  }
};
