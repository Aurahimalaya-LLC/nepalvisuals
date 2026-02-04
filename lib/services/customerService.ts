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
    const { data: sessionResp } = await supabase.auth.getSession();
    if (sessionResp?.session) {
      const { data, error } = await supabase
        .from('customers')
        .select('*, bookings(id, total_price)')
        .order('created_at', { ascending: false });
      if (error) throw error;
      return (data as any[]).map((c: any) => ({
        ...c,
        bookings_count: c.bookings?.length || 0,
        total_spend: c.bookings?.reduce((sum: number, b: any) => sum + (b.total_price || 0), 0) || 0,
        joined_date: c.created_at
      })) as ExtendedCustomer[];
    } else {
      const { data: customers, error: customersError } = await supabase
        .from('customers')
        .select('*')
        .order('created_at', { ascending: false });
      if (customersError) throw customersError;

      const { data: fnResp, error: fnError } = await supabase.functions.invoke('admin-get-bookings', { body: {} });
      if (fnError) throw fnError;
      const bookings = ((fnResp as any)?.data || []) as Array<{ customer_id?: string; total_price?: number }>;

      const stats = new Map<string, { count: number; sum: number }>();
      for (const b of bookings) {
        const cid = b.customer_id;
        if (!cid) continue;
        const current = stats.get(cid) || { count: 0, sum: 0 };
        stats.set(cid, { count: current.count + 1, sum: current.sum + (b.total_price || 0) });
      }

      return (customers as any[]).map((c: any) => {
        const s = stats.get(c.id) || { count: 0, sum: 0 };
        return {
          ...c,
          bookings_count: s.count,
          total_spend: s.sum,
          joined_date: c.created_at
        };
      }) as ExtendedCustomer[];
    }
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
