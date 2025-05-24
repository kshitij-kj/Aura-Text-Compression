
import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Spinner } from "./Spinner";
import { useAuth } from "@/context/AuthContext";

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  mode: "login" | "signup";
}

const AuthModal = ({
  isOpen,
  onClose,
  mode,
}: AuthModalProps) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [activeTab, setActiveTab] = useState<string>(mode);
  const { signIn, signUp, loading } = useAuth();
  
  // Update active tab when mode prop changes
  useEffect(() => {
    setActiveTab(mode);
  }, [mode]);
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      if (activeTab === "login") {
        await signIn(email, password);
        onClose();
      } else {
        if (password !== confirmPassword) {
          alert("Passwords do not match");
          return;
        }
        await signUp(email, password);
        onClose();
      }
    } catch (error) {
      console.error("Authentication error:", error);
      // Error is already handled in auth context with toast
    }
  };
  
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-center">
            {activeTab === "login" ? "Login to your account" : "Create an account"}
          </DialogTitle>
          <DialogDescription className="text-center">
            {activeTab === "login" 
              ? "Enter your credentials to access your account" 
              : "Sign up to save your compression history"}
          </DialogDescription>
        </DialogHeader>
        
        <Tabs 
          defaultValue={mode} 
          value={activeTab} 
          onValueChange={setActiveTab}
          className="w-full pt-2"
        >
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="login">Login</TabsTrigger>
            <TabsTrigger value="signup">Sign Up</TabsTrigger>
          </TabsList>
          
          <TabsContent value="login" className="pt-4">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="login-email">Email</Label>
                <Input
                  id="login-email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email"
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="login-password">Password</Label>
                <Input
                  id="login-password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  required
                />
              </div>
              
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? <Spinner /> : "Login"}
              </Button>
            </form>
          </TabsContent>
          
          <TabsContent value="signup" className="pt-4">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="signup-email">Email</Label>
                <Input
                  id="signup-email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email"
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="signup-password">Password</Label>
                <Input
                  id="signup-password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Choose a strong password"
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="confirm-password">Confirm Password</Label>
                <Input
                  id="confirm-password"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Confirm your password"
                  required
                />
              </div>
              
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? <Spinner /> : "Sign Up"}
              </Button>
            </form>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};

export default AuthModal;
