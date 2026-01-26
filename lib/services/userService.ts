import { supabase } from '../supabaseClient';

export interface UserProfile {
  id: string;
  email: string;
  full_name: string | null;
  avatar_url: string | null;
  role: 'Admin' | 'Customer' | 'Guide';
  status: 'Active' | 'Inactive' | 'Banned';
  created_at: string;
  updated_at: string;
}

export const UserService = {
  async getAllUsers() {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return data as UserProfile[];
  },

  async getUserById(id: string) {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error) throw error;
    return data as UserProfile;
  },

  async createUser(user: Partial<UserProfile>, password?: string) {
    // In a real app, we would create the user in Supabase Auth first.
    // const { data: authData, error: authError } = await supabase.auth.signUp({
    //   email: user.email!,
    //   password: password!,
    //   options: { data: { full_name: user.full_name } }
    // });
    // if (authError) throw authError;
    // return authData;
    
    // For this admin panel demo (managing the 'profiles' table directly):
    const { data, error } = await supabase
      .from('profiles')
      .insert(user)
      .select()
      .single();
    
    if (error) throw error;
    return data as UserProfile;
  },

  async updateUser(id: string, updates: Partial<UserProfile>) {
    const { data, error } = await supabase
      .from('profiles')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return data as UserProfile;
  },

  async deleteUser(id: string) {
    // In real app: await supabase.auth.admin.deleteUser(id);
    const { error } = await supabase
      .from('profiles')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
  }
};
