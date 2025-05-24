
import { supabase } from '@/integrations/supabase/client';

export type User = {
  id: string;
  email: string;
};

export type CompressionRecord = {
  id: string;
  user_id: string;
  original_text: string;
  compressed_text: string;
  original_size: number;
  compressed_size: number;
  compression_ratio: number;
  created_at: string;
  filename: string | null;
};

// Export supabase for backward compatibility
export { supabase };

// Storage helper functions
export const uploadFile = async (userId: string, file: File): Promise<string | null> => {
  try {
    const fileExt = file.name.split('.').pop();
    const fileName = `${userId}/${Math.random().toString(36).substring(2)}.${fileExt}`;
    const filePath = `${fileName}`;

    const { error } = await supabase.storage
      .from('compression_files')
      .upload(filePath, file);

    if (error) {
      console.error('Error uploading file:', error);
      return null;
    }

    return filePath;
  } catch (error) {
    console.error('Failed to upload file:', error);
    return null;
  }
};

export const getFileUrl = (filePath: string): string | null => {
  if (!filePath) return null;
  
  const { data } = supabase.storage
    .from('compression_files')
    .getPublicUrl(filePath);
    
  return data.publicUrl;
};
