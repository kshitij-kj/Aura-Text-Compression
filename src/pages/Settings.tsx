
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Settings2, UserX, AlertTriangle } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";

const Settings = () => {
  const [isConfirmDeleteOpen, setIsConfirmDeleteOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const { user, supabaseInitialized, signOut } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  // Redirect if not logged in
  if (!user) {
    navigate('/');
    return null;
  }

  const openDeleteConfirmation = () => {
    setIsConfirmDeleteOpen(true);
    setError("");
    setPassword("");
  };

  const handleDeleteAccount = async () => {
    if (!user || !supabaseInitialized || !password) return;

    setIsDeleting(true);
    setError("");
    
    try {
      // First verify password
      const { error: authError } = await supabase.auth.signInWithPassword({
        email: user.email,
        password
      });
      
      if (authError) {
        setError("Incorrect password. Please try again.");
        setIsDeleting(false);
        return;
      }
      
      // Delete user's compression history first
      const { error: historyError } = await supabase
        .from("compression_history")
        .delete()
        .eq("user_id", user.id);
      
      if (historyError) throw historyError;

      // Delete the user account
      const { error: userError } = await supabase.auth.admin.deleteUser(user.id);
      
      if (userError) throw userError;

      // Sign out after deletion
      await signOut();
      
      toast({
        title: "Account deleted",
        description: "Your account and all associated data have been removed.",
      });
      
      navigate('/');
    } catch (error) {
      console.error("Error deleting account:", error);
      toast({
        variant: "destructive",
        title: "Error deleting account",
        description: "Please try again or contact support if the problem persists."
      });
    } finally {
      setIsDeleting(false);
      setIsConfirmDeleteOpen(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-indigo-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-purple-900">
      <Header onLoginClick={() => {}} onSignupClick={() => {}} />
      
      <main className="flex-1 container mx-auto px-4 py-6 md:py-8">
        <div className="mb-6 md:mb-10">
          <h1 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent mb-2">
            Settings
          </h1>
          {user && (
            <p className="text-gray-600 dark:text-gray-300">
              Manage your account settings
            </p>
          )}
        </div>

        <div className="max-w-2xl mx-auto space-y-6">
          <Card className="bg-white/80 backdrop-blur-sm border border-gray-200 shadow dark:bg-gray-800/60 dark:border-gray-700">
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center">
                <Settings2 className="mr-2 h-5 w-5" />
                Account Settings
              </CardTitle>
              <CardDescription>Manage your account preferences</CardDescription>
            </CardHeader>
            <Separator />
            <CardContent className="pt-4">
              <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">
                Email: <span className="font-medium">{user?.email}</span>
              </p>
              
              {/* More settings options could be added here */}
              
            </CardContent>
          </Card>

          <Card className="bg-white/80 backdrop-blur-sm border border-gray-200 shadow dark:bg-gray-800/60 dark:border-gray-700">
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center text-red-500 dark:text-red-400">
                <UserX className="mr-2 h-5 w-5" />
                Danger Zone
              </CardTitle>
              <CardDescription>Irreversible account actions</CardDescription>
            </CardHeader>
            <Separator />
            <CardContent className="pt-4">
              <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">
                Deleting your account will remove all of your data and cannot be undone.
              </p>
            </CardContent>
            <CardFooter>
              <Button 
                variant="destructive"
                className="w-full"
                onClick={openDeleteConfirmation}
                disabled={isDeleting}
              >
                <UserX className="mr-2 h-4 w-4" />
                Delete Account
              </Button>
            </CardFooter>
          </Card>
        </div>
      </main>

      <Footer />
      
      {/* Password confirmation dialog for account deletion */}
      <Dialog open={isConfirmDeleteOpen} onOpenChange={setIsConfirmDeleteOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle className="text-xl flex items-center">
              <AlertTriangle className="mr-2 h-5 w-5 text-red-500" />
              Delete your account?
            </DialogTitle>
            <DialogDescription>
              This will permanently delete your account and all associated data. This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="delete-password">Enter your password to confirm</Label>
              <Input 
                id="delete-password" 
                type="password" 
                placeholder="Password" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className={error ? "border-red-500" : ""}
              />
              {error && <p className="text-sm text-red-500">{error}</p>}
            </div>
          </div>
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setIsConfirmDeleteOpen(false)}
              disabled={isDeleting}
            >
              Cancel
            </Button>
            <Button 
              variant="destructive" 
              onClick={handleDeleteAccount}
              disabled={!password || isDeleting}
            >
              {isDeleting ? "Deleting..." : "Delete Account"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Settings;
