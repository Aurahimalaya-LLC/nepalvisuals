import { supabase } from './supabaseClient';

/**
 * Generic fetcher for getting data from a table
 * @param table Table name
 * @param columns Columns to select (default: *)
 * @returns { data, error }
 */
export const fetchData = async (table: string, columns: string = '*') => {
  try {
    const { data, error } = await supabase.from(table).select(columns);
    if (error) throw error;
    return { data, error: null };
  } catch (error: any) {
    console.error(`Error fetching data from ${table}:`, error.message);
    return { data: null, error };
  }
};

/**
 * Generic insert function
 * @param table Table name
 * @param payload Data to insert
 * @returns { data, error }
 */
export const insertData = async (table: string, payload: any) => {
  try {
    const { data, error } = await supabase.from(table).insert(payload).select();
    if (error) throw error;
    return { data, error: null };
  } catch (error: any) {
    console.error(`Error inserting data into ${table}:`, error.message);
    return { data: null, error };
  }
};

/**
 * Generic update function
 * @param table Table name
 * @param id ID of the record to update
 * @param payload Data to update
 * @returns { data, error }
 */
export const updateData = async (table: string, id: string | number, payload: any) => {
  try {
    const { data, error } = await supabase
      .from(table)
      .update(payload)
      .eq('id', id)
      .select();
    if (error) throw error;
    return { data, error: null };
  } catch (error: any) {
    console.error(`Error updating data in ${table} for id ${id}:`, error.message);
    return { data: null, error };
  }
};

/**
 * Generic delete function
 * @param table Table name
 * @param id ID of the record to delete
 * @returns { data, error }
 */
export const deleteData = async (table: string, id: string | number) => {
  try {
    const { data, error } = await supabase.from(table).delete().eq('id', id).select();
    if (error) throw error;
    return { data, error: null };
  } catch (error: any) {
    console.error(`Error deleting data from ${table} for id ${id}:`, error.message);
    return { data: null, error };
  }
};

/**
 * Upload a file to Supabase Storage
 * @param bucket Bucket name
 * @param path File path in bucket
 * @param file File object
 * @returns { data, error }
 */
export const uploadFile = async (bucket: string, path: string, file: File) => {
  try {
    const { data, error } = await supabase.storage.from(bucket).upload(path, file);
    if (error) throw error;
    return { data, error: null };
  } catch (error: any) {
    console.error(`Error uploading file to ${bucket}:`, error.message);
    return { data: null, error };
  }
};

/**
 * Get a public URL for a file in Supabase Storage
 * @param bucket Bucket name
 * @param path File path in bucket
 * @returns URL string
 */
export const getPublicUrl = (bucket: string, path: string) => {
  const { data } = supabase.storage.from(bucket).getPublicUrl(path);
  return data.publicUrl;
};

/**
 * Sign in with Email and Password
 * @param email 
 * @param password 
 * @returns { data, error }
 */
export const signInWithEmail = async (email: string, password: string) => {
    try {
        const { data, error } = await supabase.auth.signInWithPassword({
            email,
            password
        });
        if (error) throw error;
        return { data, error: null };
    } catch (error: any) {
        console.error('Error signing in:', error.message);
        return { data: null, error };
    }
}

/**
 * Sign out
 * @returns { error }
 */
export const signOut = async () => {
    try {
        const { error } = await supabase.auth.signOut();
        if (error) throw error;
        return { error: null };
    } catch (error: any) {
        console.error('Error signing out:', error.message);
        return { error };
    }
}
