
import { supabase } from '@/integrations/supabase/client';
import { CompressionRecord } from '@/lib/supabase';

export type CompressionStats = {
  totalCompressedBytes: number;
  totalOriginalBytes: number;
  avgCompressionRatio: number;
  totalRecords: number;
  recordsByDay: { date: string; count: number }[];
};

export const getCompressionStats = async (userId: string): Promise<CompressionStats> => {
  try {
    // Get all records for the user
    const { data: records, error } = await supabase
      .from('compression_history')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: true });
      
    if (error) {
      console.error('Error fetching compression records:', error);
      throw error;
    }
    
    const compressionRecords = records as CompressionRecord[];
    
    if (compressionRecords.length === 0) {
      return {
        totalCompressedBytes: 0,
        totalOriginalBytes: 0,
        avgCompressionRatio: 0,
        totalRecords: 0,
        recordsByDay: []
      };
    }
    
    // Calculate statistics
    const totalCompressedBytes = compressionRecords.reduce((sum, record) => sum + record.compressed_size, 0);
    const totalOriginalBytes = compressionRecords.reduce((sum, record) => sum + record.original_size, 0);
    const totalRatio = compressionRecords.reduce((sum, record) => sum + record.compression_ratio, 0);
    const avgCompressionRatio = totalRatio / compressionRecords.length;
    
    // Group records by day for the chart
    const recordsByDayMap = new Map<string, number>();
    
    // Get dates for the last 14 days
    const today = new Date();
    const twoWeeksAgo = new Date();
    twoWeeksAgo.setDate(today.getDate() - 13); // 14 days including today
    
    // Initialize all days with 0 counts
    for (let i = 0; i < 14; i++) {
      const date = new Date(twoWeeksAgo);
      date.setDate(date.getDate() + i);
      const dateStr = date.toISOString().split('T')[0];
      recordsByDayMap.set(dateStr, 0);
    }
    
    // Count records by day
    compressionRecords.forEach(record => {
      const recordDate = new Date(record.created_at).toISOString().split('T')[0];
      if (recordsByDayMap.has(recordDate)) {
        recordsByDayMap.set(recordDate, (recordsByDayMap.get(recordDate) || 0) + 1);
      }
    });
    
    // Convert Map to array for chart data
    const recordsByDay = Array.from(recordsByDayMap.entries())
      .map(([date, count]) => ({ date, count }))
      .sort((a, b) => a.date.localeCompare(b.date));
    
    return {
      totalCompressedBytes,
      totalOriginalBytes,
      avgCompressionRatio,
      totalRecords: compressionRecords.length,
      recordsByDay
    };
  } catch (error) {
    console.error('Failed to calculate compression stats:', error);
    throw error;
  }
};
