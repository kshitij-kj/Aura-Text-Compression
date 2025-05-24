import { supabase } from '@/integrations/supabase/client';
import { CompressionRecord } from '@/lib/supabase';
import { getStringSizeInBytes } from '@/utils/fileUtils';

// Helper function to sanitize text for database storage
const sanitizeText = (text: string): string => {
  // Replace null characters and other problematic Unicode sequences
  return text.replace(/\u0000/g, '')
             .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '');
};

export const saveCompressionRecord = async (
  userId: string,
  originalText: string,
  compressedText: string,
  filename: string | null = null
): Promise<CompressionRecord | null> => {
  try {
    const originalSize = getStringSizeInBytes(originalText);
    const compressedSize = getStringSizeInBytes(compressedText);
    const compressionRatio = originalSize > 0 ? (1 - compressedSize / originalSize) * 100 : 0;
    
    // Sanitize texts before saving to the database
    const sanitizedOriginalText = sanitizeText(originalText);
    const sanitizedCompressedText = sanitizeText(compressedText);
    
    // Using typed interface from Database types
    const { data, error } = await supabase
      .from('compression_history')
      .insert([
        {
          user_id: userId,
          original_text: sanitizedOriginalText,
          compressed_text: sanitizedCompressedText,
          original_size: originalSize,
          compressed_size: compressedSize,
          compression_ratio: compressionRatio,
          filename: filename,
        }
      ])
      .select()
      .single();
      
    if (error) {
      console.error('Error saving compression record:', error);
      return null;
    }
    
    return data as CompressionRecord;
  } catch (error) {
    console.error('Failed to save compression record:', error);
    return null;
  }
};

export const getUserCompressionHistory = async (userId: string): Promise<CompressionRecord[]> => {
  try {
    // Using typed interface from Database types
    const { data, error } = await supabase
      .from('compression_history')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });
      
    if (error) {
      console.error('Error fetching compression history:', error);
      return [];
    }
    
    return data as CompressionRecord[];
  } catch (error) {
    console.error('Failed to fetch compression history:', error);
    return [];
  }
};

export const getCompressionRecord = async (recordId: string): Promise<CompressionRecord | null> => {
  try {
    // Using typed interface from Database types
    const { data, error } = await supabase
      .from('compression_history')
      .select('*')
      .eq('id', recordId)
      .single();
      
    if (error) {
      console.error('Error fetching compression record:', error);
      return null;
    }
    
    return data as CompressionRecord;
  } catch (error) {
    console.error('Failed to fetch compression record:', error);
    return null;
  }
};

export const clearUserCompressionHistory = async (userId: string): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('compression_history')
      .delete()
      .eq('user_id', userId);
      
    if (error) {
      console.error('Error clearing compression history:', error);
      return false;
    }
    
    return true;
  } catch (error) {
    console.error('Failed to clear compression history:', error);
    return false;
  }
};
