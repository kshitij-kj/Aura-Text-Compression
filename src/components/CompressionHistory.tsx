
import { useEffect, useState } from 'react';
import { CompressionRecord } from '@/lib/supabase';
import { getUserCompressionHistory } from '@/services/compressionService';
import { formatFileSize } from '@/utils/fileUtils';
import {
  FileText,
  Clock,
  ArrowDownUp,
  Download,
  Copy,
  FileArchive,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import LoadingAnimation from './LoadingAnimation';
import { supabase } from '@/integrations/supabase/client';

interface CompressionHistoryProps {
  userId: string;
  onSelectRecord: (record: CompressionRecord) => void;
}

const CompressionHistory = ({ userId, onSelectRecord }: CompressionHistoryProps) => {
  const [history, setHistory] = useState<CompressionRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    const fetchHistory = async () => {
      setIsLoading(true);
      try {
        const records = await getUserCompressionHistory(userId);
        setHistory(records);
      } catch (error) {
        console.error('Error loading compression history:', error);
      } finally {
        setIsLoading(false);
      }
    };

    if (userId) {
      fetchHistory();

      // Set up real-time listener for compression history changes
      const channel = supabase
        .channel('compression_history_changes')
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'compression_history',
            filter: `user_id=eq.${userId}`
          },
          async () => {
            // Refresh the history when there's any change
            const records = await getUserCompressionHistory(userId);
            setHistory(records);
          }
        )
        .subscribe();

      // Clean up the subscription
      return () => {
        supabase.removeChannel(channel);
      };
    }
  }, [userId]);

  const handleCopyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text).then(() => {
      toast({
        title: "Copied to clipboard",
        description: "Text has been copied to clipboard successfully.",
      });
    });
  };

  const handleTextDownload = (content: string, filename: string) => {
    const element = document.createElement("a");
    const file = new Blob([content], { type: "text/plain" });
    element.href = URL.createObjectURL(file);
    element.download = filename;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  if (isLoading) {
    return (
      <div className="py-10 flex justify-center">
        <LoadingAnimation text="Loading history" />
      </div>
    );
  }

  if (history.length === 0) {
    return (
      <div className="text-center py-10 text-gray-500 dark:text-gray-400">
        <FileText className="mx-auto h-12 w-12 opacity-30 mb-3" />
        <p>Your compression history is empty</p>
        <p className="text-sm">Start compressing files to see your history</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {history.map((record) => (
        <div
          key={record.id}
          className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4 hover:shadow-md transition-shadow cursor-pointer"
          onClick={() => onSelectRecord(record)}
        >
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center">
              {record.filename ? (
                <FileArchive className="h-5 w-5 text-purple-500 mr-2" />
              ) : (
                <FileText className="h-5 w-5 text-purple-500 mr-2" />
              )}
              <h3 className="font-medium">
                {record.filename || `Compression ${new Date(record.created_at).toLocaleDateString()}`}
              </h3>
            </div>
            <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
              <Clock className="h-4 w-4 mr-1" />
              <span>{new Date(record.created_at).toLocaleString()}</span>
            </div>
          </div>
          
          <div className="grid grid-cols-3 gap-2 text-sm mb-3">
            <div className="flex flex-col">
              <span className="text-gray-500 dark:text-gray-400">Original Size</span>
              <span className="font-semibold">{formatFileSize(record.original_size)}</span>
            </div>
            <div className="flex flex-col">
              <span className="text-gray-500 dark:text-gray-400">Compressed Size</span>
              <span className="font-semibold">{formatFileSize(record.compressed_size)}</span>
            </div>
            <div className="flex flex-col">
              <span className="text-gray-500 dark:text-gray-400">Savings</span>
              <span className="font-semibold flex items-center">
                <ArrowDownUp className="h-3 w-3 mr-1" />
                {record.compression_ratio.toFixed(2)}%
              </span>
            </div>
          </div>
          
          <div className="flex flex-wrap gap-2">
            <Button 
              variant="outline" 
              size="sm"
              onClick={(e) => { 
                e.stopPropagation(); 
                handleCopyToClipboard(record.compressed_text);
              }}
            >
              <Copy className="mr-1 h-3 w-3" />
              Copy Compressed
            </Button>
            <Button 
              variant="outline" 
              size="sm"
              onClick={(e) => { 
                e.stopPropagation(); 
                handleTextDownload(record.compressed_text, `${record.filename || 'compressed'}.txt`);
              }}
            >
              <Download className="mr-1 h-3 w-3" />
              Download
            </Button>
          </div>
        </div>
      ))}
    </div>
  );
};

export default CompressionHistory;
