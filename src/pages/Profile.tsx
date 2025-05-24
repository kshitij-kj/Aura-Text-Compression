
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import CompressionHistory from "@/components/CompressionHistory";
import { getUserCompressionHistory, clearUserCompressionHistory } from "@/services/compressionService";
import { CompressionRecord } from "@/lib/supabase";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { FileText, Trash2, Clock, ArrowUpDown } from "lucide-react";
import { formatFileSize } from "@/utils/fileUtils";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import LoadingAnimation from "@/components/LoadingAnimation";
import { getCompressionStats } from "@/services/statsService";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type CompressionStats = {
  totalCompressedBytes: number;
  totalOriginalBytes: number;
  avgCompressionRatio: number;
  totalRecords: number;
  recordsByDay: { date: string; count: number }[];
};

const Profile = () => {
  const [compressionHistory, setCompressionHistory] = useState<CompressionRecord[]>([]);
  const [stats, setStats] = useState<CompressionStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isConfirmDialogOpen, setIsConfirmDialogOpen] = useState(false);
  const [password, setPassword] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState("");
  const { user, supabaseInitialized } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) {
      navigate('/');
      return;
    }

    const fetchData = async () => {
      setIsLoading(true);
      try {
        const history = await getUserCompressionHistory(user.id);
        setCompressionHistory(history);

        if (history.length > 0) {
          const calculatedStats = await getCompressionStats(user.id);
          setStats(calculatedStats);
        }
      } catch (error) {
        console.error("Error fetching history data:", error);
        toast({
          variant: "destructive",
          title: "Error loading data",
          description: "Failed to load your compression history and stats."
        });
      } finally {
        setIsLoading(false);
      }
    };

    if (user && supabaseInitialized) {
      fetchData();
    }
  }, [user, supabaseInitialized, navigate, toast]);

  const handleClearHistory = () => {
    setIsConfirmDialogOpen(true);
    setError("");
    setPassword("");
  };

  const confirmClearHistory = async () => {
    if (!user || !password) return;
    
    setIsProcessing(true);
    setError("");
    
    try {
      // First verify password
      const { error: authError } = await supabase.auth.signInWithPassword({
        email: user.email,
        password
      });
      
      if (authError) {
        setError("Incorrect password. Please try again.");
        setIsProcessing(false);
        return;
      }
      
      // If password is correct, proceed with clearing history
      const success = await clearUserCompressionHistory(user.id);
      
      if (success) {
        setCompressionHistory([]);
        setStats(null);
        toast({
          title: "History cleared",
          description: "Your compression history has been deleted successfully."
        });
        setIsConfirmDialogOpen(false);
      } else {
        throw new Error("Failed to clear history");
      }
    } catch (error) {
      console.error("Error clearing history:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to clear compression history."
      });
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-indigo-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-purple-900">
      <Header onLoginClick={() => {}} onSignupClick={() => {}} />
      
      <main className="flex-1 container mx-auto px-4 py-6 md:py-8">
        <div className="mb-6 md:mb-10">
          <h1 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent mb-2">
            Your Profile
          </h1>
          {user && (
            <p className="text-gray-600 dark:text-gray-300">
              {user.email}
            </p>
          )}
        </div>

        {isLoading ? (
          <div className="flex justify-center py-8">
            <LoadingAnimation text="Loading your profile data" />
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-1 space-y-6">
              {stats ? (
                <>
                  <Card className="bg-white/80 backdrop-blur-sm border border-gray-200 shadow dark:bg-gray-800/60 dark:border-gray-700">
                    <CardHeader className="pb-2">
                      <CardTitle>Compression Overview</CardTitle>
                      <CardDescription>Your compression statistics</CardDescription>
                    </CardHeader>
                    <Separator />
                    <CardContent className="pt-4">
                      <div className="space-y-4">
                        <div>
                          <p className="text-sm text-gray-500 dark:text-gray-400">Total Files Compressed</p>
                          <p className="text-2xl font-bold">{stats.totalRecords}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-500 dark:text-gray-400">Average Compression Ratio</p>
                          <p className="text-2xl font-bold">{stats.avgCompressionRatio.toFixed(2)}%</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-500 dark:text-gray-400">Total Space Saved</p>
                          <p className="text-2xl font-bold">
                            {formatFileSize(stats.totalOriginalBytes - stats.totalCompressedBytes)}
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="bg-white/80 backdrop-blur-sm border border-gray-200 shadow dark:bg-gray-800/60 dark:border-gray-700">
                    <CardHeader className="pb-2">
                      <CardTitle>Activity</CardTitle>
                      <CardDescription>Your compression activity over time</CardDescription>
                    </CardHeader>
                    <Separator />
                    <CardContent className="pt-4">
                      {stats.recordsByDay.length > 0 && (
                        <ChartContainer
                          className="h-64 w-full"
                          config={{
                            activity: {
                              theme: {
                                light: "#8b5cf6",
                                dark: "#a78bfa"
                              }
                            }
                          }}
                        >
                          <ResponsiveContainer width="100%" height="100%">
                            <BarChart
                              data={stats.recordsByDay}
                              margin={{ top: 10, right: 10, left: 10, bottom: 24 }}
                            >
                              <CartesianGrid strokeDasharray="3 3" vertical={false} />
                              <XAxis 
                                dataKey="date" 
                                tickLine={false}
                                tickFormatter={(value) => new Date(value).toLocaleDateString(undefined, { day: 'numeric', month: 'short' })}
                              />
                              <YAxis 
                                tickLine={false} 
                                axisLine={false}
                                tickFormatter={(value) => value === 0 ? '' : Math.floor(value).toString()}
                              />
                              <ChartTooltip
                                content={
                                  <ChartTooltipContent 
                                    nameKey="date"
                                    labelFormatter={(date) => new Date(date).toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' })}
                                  />
                                }
                              />
                              <Bar dataKey="count" name="activity" />
                            </BarChart>
                          </ResponsiveContainer>
                        </ChartContainer>
                      )}
                      {stats.recordsByDay.length === 0 && (
                        <div className="flex flex-col items-center justify-center h-64 text-gray-500">
                          <Clock className="h-12 w-12 mb-2 opacity-30" />
                          <p>No activity data available</p>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </>
              ) : (
                <Card className="bg-white/80 backdrop-blur-sm border border-gray-200 shadow dark:bg-gray-800/60 dark:border-gray-700">
                  <CardContent className="py-8 text-center">
                    <FileText className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                    <p className="text-gray-600 dark:text-gray-300 mb-2">No compression data yet</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      Start compressing files to see your statistics
                    </p>
                  </CardContent>
                </Card>
              )}

              {compressionHistory.length > 0 && (
                <Card className="bg-white/80 backdrop-blur-sm border border-gray-200 shadow dark:bg-gray-800/60 dark:border-gray-700">
                  <CardHeader className="pb-2">
                    <CardTitle>History Management</CardTitle>
                    <CardDescription>Clear your compression history</CardDescription>
                  </CardHeader>
                  <Separator />
                  <CardFooter className="pt-4">
                    <Button
                      variant="destructive"
                      className="w-full flex items-center justify-center"
                      onClick={handleClearHistory}
                    >
                      <Trash2 className="mr-2 h-4 w-4" />
                      Clear All History
                    </Button>
                  </CardFooter>
                </Card>
              )}
            </div>

            <div className="lg:col-span-2">
              <Card className="bg-white/80 backdrop-blur-sm border border-gray-200 shadow dark:bg-gray-800/60 dark:border-gray-700">
                <CardHeader className="pb-2">
                  <CardTitle>Compression History</CardTitle>
                  <CardDescription>Your recent activity</CardDescription>
                </CardHeader>
                <Separator />
                <CardContent className="pt-4">
                  <CompressionHistory 
                    userId={user?.id || ""} 
                    onSelectRecord={() => {}} 
                  />
                </CardContent>
              </Card>
            </div>
          </div>
        )}
      </main>
      <Footer />

      {/* Password confirmation dialog for clearing history */}
      <Dialog open={isConfirmDialogOpen} onOpenChange={setIsConfirmDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle className="text-xl">Confirm Clear History</DialogTitle>
            <DialogDescription>
              This will permanently delete all your compression history. Please enter your password to confirm.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="password">Password</Label>
              <Input 
                id="password" 
                type="password" 
                placeholder="Enter your password" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className={error ? "border-red-500" : ""}
              />
              {error && <p className="text-sm text-red-500">{error}</p>}
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsConfirmDialogOpen(false)} disabled={isProcessing}>
              Cancel
            </Button>
            <Button 
              variant="destructive" 
              onClick={confirmClearHistory} 
              disabled={!password || isProcessing}
            >
              {isProcessing ? "Processing..." : "Confirm Delete"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Profile;
