
import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { Copy, Download, FileText, Upload, Archive } from "lucide-react";
import AuthModal from "@/components/AuthModal";
import CompressionEngine from "@/components/CompressionEngine";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import LoadingAnimation from "@/components/LoadingAnimation";
import CompressionHistory from "@/components/CompressionHistory";
import { formatFileSize, getStringSizeInBytes } from "@/utils/fileUtils";
import { useAuth } from "@/context/AuthContext";
import { saveCompressionRecord } from "@/services/compressionService";
import { CompressionRecord } from "@/lib/supabase";
import { useIsMobile } from "@/hooks/use-mobile";

const Index = () => {
  const [text, setText] = useState("");
  const [compressedText, setCompressedText] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authMode, setAuthMode] = useState<"login" | "signup">("login");
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { user, supabaseInitialized } = useAuth();
  const isMobile = useIsMobile();
  const [activeTab, setActiveTab] = useState("compress");
  const [lastFileName, setLastFileName] = useState<string | null>(null);
  
  useEffect(() => {
    // Clean up text fields when user logs out
    if (!user) {
      setText("");
      setCompressedText("");
    }
  }, [user]);
  
  const handleCompress = async () => {
    if (!text) {
      toast({
        title: "No text to compress",
        description: "Please enter some text or upload a file.",
        variant: "destructive"
      });
      return;
    }
    
    setIsProcessing(true);
    
    try {
      await new Promise(resolve => setTimeout(resolve, 1500));
      const compressed = CompressionEngine.compress(text);
      setCompressedText(compressed);
      
      if (user) {
        await saveCompressionRecord(
          user.id, 
          text, 
          compressed, 
          lastFileName
        );
      }
      
      toast({
        title: "Compression successful",
        description: `Original: ${formatFileSize(getStringSizeInBytes(text))}, Compressed: ${formatFileSize(getStringSizeInBytes(compressed))}`,
      });
    } catch (error) {
      toast({
        title: "Compression failed",
        description: "Error processing your text. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsProcessing(false);
    }
  };
  
  const handleDecompress = async () => {
    if (!compressedText) {
      toast({
        title: "No text to decompress",
        description: "Please provide compressed text.",
        variant: "destructive"
      });
      return;
    }
    
    setIsProcessing(true);
    
    try {
      await new Promise(resolve => setTimeout(resolve, 1500));
      const decompressed = CompressionEngine.decompress(compressedText);
      setText(decompressed);
      
      if (user) {
        await saveCompressionRecord(
          user.id, 
          decompressed, 
          compressedText, 
          lastFileName ? `decompressed-${lastFileName}` : "decompressed-text"
        );
      }
      
      toast({
        title: "Decompression successful",
        description: `Compressed: ${formatFileSize(getStringSizeInBytes(compressedText))}, Original: ${formatFileSize(getStringSizeInBytes(decompressed))}`,
      });
    } catch (error) {
      toast({
        title: "Decompression failed",
        description: "Invalid format or corrupted data. Please check your input.",
        variant: "destructive"
      });
    } finally {
      setIsProcessing(false);
    }
  };
  
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      setText(content);
      setLastFileName(file.name);
      toast({
        title: "File loaded successfully",
        description: `${file.name} (${formatFileSize(file.size)})`,
      });
    };
    reader.readAsText(file);
  };
  
  const handleTextDownload = (content: string, filePrefix: string) => {
    const element = document.createElement("a");
    const file = new Blob([content], { type: "text/plain" });
    element.href = URL.createObjectURL(file);
    element.download = `${filePrefix}-${new Date().toISOString().slice(0, 10)}.txt`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };
  
  const handleCopyToClipboard = (textToCopy: string) => {
    navigator.clipboard.writeText(textToCopy).then(() => {
      toast({
        title: "Copied to clipboard",
        description: "Text has been copied to clipboard successfully.",
      });
    });
  };
  
  const handleSelectHistoryRecord = async (record: CompressionRecord) => {
    setText(record.original_text);
    setCompressedText(record.compressed_text);
    setLastFileName(record.filename);
    toast({
      title: "Record loaded",
      description: "Compression record loaded successfully.",
    });
  };

  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setText(e.target.value);
    // If there's no file uploaded, treat this as manual text entry
    if (!lastFileName) {
      setLastFileName(null);
    }
  };
  
  const handleCompressedTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setCompressedText(e.target.value);
    // If there's no file uploaded, treat this as manual text entry
    if (!lastFileName) {
      setLastFileName(null);
    }
  };
  
  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-indigo-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-purple-900">
      <Header 
        onLoginClick={() => {
          if (!supabaseInitialized) {
            toast({
              title: "Connection Error",
              description: "Database connection is not available. Please check your configuration.",
              variant: "destructive"
            });
            return;
          }
          setAuthMode("login");
          setIsAuthModalOpen(true);
        }}
        onSignupClick={() => {
          if (!supabaseInitialized) {
            toast({
              title: "Connection Error",
              description: "Database connection is not available. Please check your configuration.",
              variant: "destructive"
            });
            return;
          }
          setAuthMode("signup");
          setIsAuthModalOpen(true);
        }}
      />
      
      <main className="flex-1 container mx-auto px-4 py-6 md:py-8">
        <div className="text-center mb-6 md:mb-10">
          <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent mb-2">
            AuraText Vault
          </h1>
          <p className="text-lg md:text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            Advanced text compression and decompression with stunning performance
          </p>
        </div>
        
        <Card className="max-w-4xl mx-auto bg-white/80 backdrop-blur-sm border border-gray-200 shadow-xl dark:bg-gray-800/60 dark:border-gray-700">
          <CardHeader>
            <CardTitle>Text Processor</CardTitle>
            <CardDescription>
              Compress and decompress text with our advanced algorithms
            </CardDescription>
          </CardHeader>
          
          <Separator />
          
          <CardContent className="pt-6">
            <Tabs 
              defaultValue="compress" 
              value={activeTab}
              onValueChange={setActiveTab}
              className="w-full"
            >
              <TabsList className="grid w-full grid-cols-2 mb-6">
                <TabsTrigger value="compress">Compress</TabsTrigger>
                <TabsTrigger value="decompress">Decompress</TabsTrigger>
              </TabsList>
              
              <TabsContent value="compress" className="space-y-4">
                <div>
                  <div className="flex items-center mb-2">
                    <FileText className="mr-2 text-purple-500" size={18} />
                    <span className="font-medium">Input Text</span>
                  </div>
                  <div className="relative">
                    <textarea 
                      value={text}
                      onChange={handleTextChange}
                      className="w-full h-40 p-3 rounded-md border border-gray-300 focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                      placeholder="Enter text to compress..."
                    />
                    <div className="absolute bottom-2 right-2 text-xs text-gray-500 dark:text-gray-400">
                      {formatFileSize(getStringSizeInBytes(text))}
                    </div>
                  </div>
                </div>
                
                <div>
                  <div className="flex items-center mb-2">
                    <Archive className="mr-2 text-indigo-500" size={18} />
                    <span className="font-medium">Compressed Output</span>
                  </div>
                  <div className="relative">
                    <textarea 
                      value={compressedText}
                      readOnly
                      className="w-full h-40 p-3 bg-gray-50 rounded-md border border-gray-300 resize-none dark:bg-gray-800 dark:border-gray-700 dark:text-gray-300"
                      placeholder="Compressed text will appear here..."
                    />
                    <div className="absolute bottom-2 right-2 text-xs text-gray-500 dark:text-gray-400">
                      {formatFileSize(getStringSizeInBytes(compressedText))}
                    </div>
                  </div>
                </div>
                
                <div className="flex justify-center pt-4">
                  {isProcessing ? (
                    <LoadingAnimation text="Compressing..." />
                  ) : (
                    <Button 
                      onClick={handleCompress}
                      className="w-full max-w-xs bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700"
                    >
                      Compress Text
                    </Button>
                  )}
                </div>
              </TabsContent>
              
              <TabsContent value="decompress" className="space-y-4">
                <div>
                  <div className="flex items-center mb-2">
                    <Archive className="mr-2 text-indigo-500" size={18} />
                    <span className="font-medium">Compressed Input</span>
                  </div>
                  <div className="relative">
                    <textarea 
                      value={compressedText}
                      onChange={handleCompressedTextChange}
                      className="w-full h-40 p-3 rounded-md border border-gray-300 focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                      placeholder="Enter compressed text..."
                    />
                    <div className="absolute bottom-2 right-2 text-xs text-gray-500 dark:text-gray-400">
                      {formatFileSize(getStringSizeInBytes(compressedText))}
                    </div>
                  </div>
                </div>
                
                <div>
                  <div className="flex items-center mb-2">
                    <FileText className="mr-2 text-purple-500" size={18} />
                    <span className="font-medium">Decompressed Output</span>
                  </div>
                  <div className="relative">
                    <textarea 
                      value={text}
                      readOnly
                      className="w-full h-40 p-3 bg-gray-50 rounded-md border border-gray-300 resize-none dark:bg-gray-800 dark:border-gray-700 dark:text-gray-300"
                      placeholder="Decompressed text will appear here..."
                    />
                    <div className="absolute bottom-2 right-2 text-xs text-gray-500 dark:text-gray-400">
                      {formatFileSize(getStringSizeInBytes(text))}
                    </div>
                  </div>
                </div>
                
                <div className="flex justify-center pt-4">
                  {isProcessing ? (
                    <LoadingAnimation text="Decompressing..." />
                  ) : (
                    <Button 
                      onClick={handleDecompress}
                      className="w-full max-w-xs bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700"
                    >
                      Decompress Text
                    </Button>
                  )}
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
          
          <Separator className="my-2" />
          
          <CardFooter className="flex flex-col md:flex-row md:justify-between gap-4 py-4">
            <div className="flex flex-wrap gap-2 w-full md:w-auto justify-center md:justify-start">
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileUpload}
                accept=".txt"
                className="hidden"
              />
              <Button 
                variant="outline" 
                onClick={() => fileInputRef.current?.click()}
                size={isMobile ? "sm" : "default"}
                className="flex-grow md:flex-grow-0"
              >
                <Upload className="mr-2 h-4 w-4" />
                Upload File
              </Button>
              <Button 
                variant="outline" 
                onClick={() => handleTextDownload(text, "original")}
                disabled={!text}
                size={isMobile ? "sm" : "default"}
                className="flex-grow md:flex-grow-0"
              >
                <Download className="mr-2 h-4 w-4" />
                Download Original
              </Button>
            </div>
            <div className="flex flex-wrap gap-2 w-full md:w-auto justify-center md:justify-end">
              <Button 
                variant="outline" 
                onClick={() => handleCopyToClipboard(compressedText)}
                disabled={!compressedText}
                size={isMobile ? "sm" : "default"}
                className="flex-grow md:flex-grow-0"
              >
                <Copy className="mr-2 h-4 w-4" />
                Copy Compressed
              </Button>
              <Button 
                variant="outline" 
                onClick={() => handleTextDownload(compressedText, "compressed")}
                disabled={!compressedText}
                size={isMobile ? "sm" : "default"}
                className="flex-grow md:flex-grow-0"
              >
                <Download className="mr-2 h-4 w-4" />
                Download Compressed
              </Button>
            </div>
          </CardFooter>
        </Card>
        
        {user && supabaseInitialized && (
          <div className="mt-10">
            <Card className="max-w-4xl mx-auto bg-white/80 backdrop-blur-sm border border-gray-200 shadow-lg dark:bg-gray-800/60 dark:border-gray-700">
              <CardHeader className="pb-3">
                <CardTitle>Your Compression History</CardTitle>
                <CardDescription>Recent files you've processed</CardDescription>
              </CardHeader>
              <Separator />
              <CardContent className="pt-4 overflow-x-auto">
                <CompressionHistory 
                  userId={user.id}
                  onSelectRecord={handleSelectHistoryRecord}
                />
              </CardContent>
            </Card>
          </div>
        )}
        
        {!supabaseInitialized && user && (
          <div className="mt-10">
            <Card className="max-w-4xl mx-auto bg-white/80 backdrop-blur-sm border border-gray-200 shadow-lg dark:bg-gray-800/60 dark:border-gray-700">
              <CardHeader className="pb-3">
                <CardTitle className="text-amber-600">Database Connection Error</CardTitle>
                <CardDescription>
                  Unable to connect to the database. Your compression history and some features may not be available.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p>Please make sure the Supabase URL and API key are correctly configured.</p>
              </CardContent>
            </Card>
          </div>
        )}
      </main>
      
      <Footer />
      
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        mode={authMode}
      />
    </div>
  );
};

export default Index;
