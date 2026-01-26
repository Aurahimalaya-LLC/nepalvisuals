import { supabase } from '../supabaseClient';

export interface TeamType {
  id: string;
  name: string;
  description: string | null;
  created_at: string;
  updated_at: string;
}

export interface TeamMember {
  id: string;
  full_name: string;
  role: string | null;
  image_url: string | null;
  status: 'Active' | 'Inactive';
  team_type_id: string | null;
  created_at: string;
  updated_at: string;
  // Relations
  team_types?: TeamType;
}

export const TeamService = {
  // Team Members
  async getAllMembers() {
    const { data, error } = await supabase
      .from('team_members')
      .select(`
        *,
        team_types (name)
      `)
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return data as TeamMember[];
  },

  async getMemberById(id: string) {
    const { data, error } = await supabase
      .from('team_members')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error) throw error;
    return data as TeamMember;
  },

  async createMember(member: Partial<TeamMember>) {
    const { data, error } = await supabase
      .from('team_members')
      .insert(member)
      .select()
      .single();
    
    if (error) throw error;
    return data as TeamMember;
  },

  async updateMember(id: string, updates: Partial<TeamMember>) {
    const { data, error } = await supabase
      .from('team_members')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return data as TeamMember;
  },

  async deleteMember(id: string) {
    const { error } = await supabase
      .from('team_members')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
  },

  // Team Types
  async getAllTypes() {
    const { data, error } = await supabase
      .from('team_types')
      .select('*')
      .order('name');
    
    if (error) throw error;
    return data as TeamType[];
  },

  async createType(type: Partial<TeamType>) {
    const { data, error } = await supabase
      .from('team_types')
      .insert(type)
      .select()
      .single();
    
    if (error) throw error;
    return data as TeamType;
  },

  async updateType(id: string, updates: Partial<TeamType>) {
    const { data, error } = await supabase
      .from('team_types')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return data as TeamType;
  },

  async deleteType(id: string) {
    const { error } = await supabase
      .from('team_types')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
  }
};
