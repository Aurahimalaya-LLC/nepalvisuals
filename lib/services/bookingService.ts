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
}

export const BookingService = {
  async getAllBookings() {
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
    
    if (error) throw error;
    return data as Booking[];
  },

  async getBookingById(id: string) {
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
    
    if (error) throw error;
    return data as Booking;
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

    const { data: bookingData, error: bookingError } = await supabase
      .from('bookings')
      .insert(bookingToInsert)
      .select()
      .single();
    
    if (bookingError) throw bookingError;

    // 2. Create Travelers
    if (travelers.length > 0) {
        const travelersWithId = travelers.map(t => ({ ...t, booking_id: bookingData.id }));
        const { error: travelersError } = await supabase
            .from('booking_travelers')
            .insert(travelersWithId);
        
        if (travelersError) throw travelersError; // Note: If this fails, we have an orphan booking. Transaction ideal here.
    }

    return bookingData as Booking;
  },

  async updateBooking(id: string, updates: Partial<Booking>, travelers?: Partial<BookingTraveler>[]) {
    // 1. Update Booking
    const { data, error } = await supabase
      .from('bookings')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;

    // 2. Update Travelers (Simplistic approach: Delete all and re-insert for MVP)
    // In production, we should diff and update/insert/delete individually.
    if (travelers) {
        await supabase.from('booking_travelers').delete().eq('booking_id', id);
        const travelersWithId = travelers.map(t => ({ ...t, booking_id: id }));
        const { error: travelersError } = await supabase
            .from('booking_travelers')
            .insert(travelersWithId);
        if (travelersError) throw travelersError;
    }

    return data as Booking;
  },

  async deleteBooking(id: string) {
    const { error } = await supabase
      .from('bookings')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
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
