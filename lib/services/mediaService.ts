import { supabase } from '../supabaseClient';

export interface MediaFile {
  id: string;
  filename: string;
  file_path: string;
  mime_type: string | null;
  size_bytes: number | null;
  width: number | null;
  height: number | null;
  alt_text: string | null;
  caption: string | null;
  title: string | null;
  tags: string[] | null;
  created_at: string;
  updated_at: string;
  public_url?: string; // Virtual field
}

export const MediaService = {
  async getAllMedia() {
    const { data, error } = await supabase
      .from('media_files')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    
    // Enrich with public URL
    return data?.map(file => ({
      ...file,
      public_url: supabase.storage.from('media').getPublicUrl(file.file_path).data.publicUrl
    })) as MediaFile[];
  },

  async getMedia(page: number = 1, limit: number = 20) {
    const from = (page - 1) * limit;
    const to = from + limit - 1;

    const { data, error, count } = await supabase
      .from('media_files')
      .select('*', { count: 'exact' })
      .order('created_at', { ascending: false })
      .range(from, to);
    
    if (error) throw error;
    
    return {
      data: data?.map(file => ({
        ...file,
        public_url: supabase.storage.from('media').getPublicUrl(file.file_path).data.publicUrl
      })) as MediaFile[],
      count: count || 0
    };
  },

  async uploadFile(file: File) {
    const fileName = `${Date.now()}-${file.name.replace(/[^a-zA-Z0-9.-]/g, '_')}`;
    const filePath = `${fileName}`;

    // 1. Upload to Storage
    const { error: uploadError } = await supabase.storage
      .from('media')
      .upload(filePath, file);

    if (uploadError) throw uploadError;

    // 2. Create DB Record
    // Simple image dimension check could be done client-side before this, 
    // or via an edge function. For now we skip width/height auto-detection in this service method
    // unless passed explicitly, or we can add a helper to read it from File object if it's an image.
    
    const { data, error: dbError } = await supabase
      .from('media_files')
      .insert({
        filename: file.name,
        file_path: filePath,
        mime_type: file.type,
        size_bytes: file.size,
        title: file.name.split('.')[0]
      })
      .select()
      .single();

    if (dbError) {
        // Cleanup storage if DB insert fails
        await supabase.storage.from('media').remove([filePath]);
        throw dbError;
    }

    return {
        ...data,
        public_url: supabase.storage.from('media').getPublicUrl(filePath).data.publicUrl
    } as MediaFile;
  },

  async updateMediaMetadata(id: string, updates: Partial<MediaFile>) {
    const { data, error } = await supabase
      .from('media_files')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    
    return {
        ...data,
        public_url: supabase.storage.from('media').getPublicUrl(data.file_path).data.publicUrl
    } as MediaFile;
  },

  async deleteMedia(id: string, filePath: string) {
    // 1. Delete from DB
    const { error: dbError } = await supabase
      .from('media_files')
      .delete()
      .eq('id', id);
    
    if (dbError) throw dbError;

    // 2. Delete from Storage
    const { error: storageError } = await supabase.storage
      .from('media')
      .remove([filePath]);
    
    if (storageError) console.error('Failed to delete file from storage:', storageError);
  }
};
