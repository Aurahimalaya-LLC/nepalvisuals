import { supabase } from '../supabaseClient';
import { Customer } from './bookingService'; // Reuse interface or extend it

export interface ExtendedCustomer extends Customer {
  avatar_url?: string | null;
  bookings_count?: number; // Virtual field
  total_spend?: number; // Virtual field
  joined_date?: string; // mapped from created_at
}

export const CustomerService = {
  async getAllCustomers() {
    // We want to fetch customers and ideally aggregate booking stats.
    // Supabase JS doesn't do complex aggregations in one simple select easily without views or RPC.
    // For MVP, we'll fetch customers and we can fetch booking stats separately or client-side join if dataset is small.
    // Or we use a view. Let's stick to simple fetch and maybe a separate fetch for counts if needed.
    
    const { data, error } = await supabase
      .from('customers')
      .select('*, bookings(id, total_price)')
      .order('created_at', { ascending: false });
    
    if (error) throw error;

    // Transform data to include virtual fields
    return data.map((c: any) => ({
      ...c,
      bookings_count: c.bookings?.length || 0,
      total_spend: c.bookings?.reduce((sum: number, b: any) => sum + (b.total_price || 0), 0) || 0,
      joined_date: c.created_at
    })) as ExtendedCustomer[];
  },

  async getCustomerById(id: string) {
    const { data, error } = await supabase
      .from('customers')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error) throw error;
    return data as ExtendedCustomer;
  },

  async createCustomer(customer: Partial<ExtendedCustomer>) {
    const { data, error } = await supabase
      .from('customers')
      .insert(customer)
      .select()
      .single();
    
    if (error) throw error;
    return data as ExtendedCustomer;
  },

  async updateCustomer(id: string, updates: Partial<ExtendedCustomer>) {
    const { data, error } = await supabase
      .from('customers')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return data as ExtendedCustomer;
  },

  async deleteCustomer(id: string) {
    // Note: This might fail if there are FK constraints (bookings). 
    // In migration we used 'on delete restrict' for bookings.
    // So we must ensure bookings are handled or catch error.
    const { error } = await supabase
      .from('customers')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
  }
};
