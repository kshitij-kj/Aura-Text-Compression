
import { Link } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Settings2, LogIn, LogOut, UserPlus, User, Menu } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { useAuth } from '@/context/AuthContext';
import { useState } from 'react';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { useIsMobile } from '@/hooks/use-mobile';
import { Drawer, DrawerContent, DrawerTrigger } from '@/components/ui/drawer';

interface HeaderProps {
  onLoginClick: () => void;
  onSignupClick: () => void;
}

const Header = ({
  onLoginClick,
  onSignupClick,
}: HeaderProps) => {
  const { user, signOut, loading } = useAuth();
  const isMobile = useIsMobile();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  
  const handleLoginClick = () => {
    setMobileMenuOpen(false);
    onLoginClick();
  };
  
  const handleSignupClick = () => {
    setMobileMenuOpen(false);
    onSignupClick();
  };
  
  const handleSignOut = () => {
    setMobileMenuOpen(false);
    signOut();
  };
  
  const NavItems = () => (
    <>
      {!user ? (
        <>
          <li>
            <Button variant="ghost" size="sm" onClick={handleLoginClick} disabled={loading}>
              <LogIn className="mr-1 h-4 w-4" />
              Login
            </Button>
          </li>
          <li>
            <Button variant="default" size="sm" onClick={handleSignupClick} disabled={loading}>
              <UserPlus className="mr-1 h-4 w-4" />
              Sign Up
            </Button>
          </li>
        </>
      ) : (
        <li>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="flex items-center gap-2">
                <div className="h-5 w-5 rounded-full bg-purple-600 flex items-center justify-center">
                  <span className="text-white font-bold text-xs">
                    {user.email.charAt(0).toUpperCase()}
                  </span>
                </div>
                <span className="hidden sm:inline">{user.email.split('@')[0]}</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <Link to="/profile">
                <DropdownMenuItem className="cursor-pointer">
                  <User className="mr-2 h-4 w-4" />
                  <span>Profile</span>
                </DropdownMenuItem>
              </Link>
              <Link to="/settings">
                <DropdownMenuItem className="cursor-pointer">
                  <Settings2 className="mr-2 h-4 w-4" />
                  <span>Settings</span>
                </DropdownMenuItem>
              </Link>
              <DropdownMenuItem className="cursor-pointer" onClick={() => signOut()}>
                <LogOut className="mr-2 h-4 w-4" />
                <span>Logout</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </li>
      )}
    </>
  );

  return (
    <header className="bg-white/80 backdrop-blur-md border-b border-gray-200 sticky top-0 z-10 dark:bg-gray-900/80 dark:border-gray-800">
      <div className="container mx-auto px-4 py-4 flex justify-between items-center">
        <div className="flex items-center">
          <Link to="/" className="flex items-center">
            <div className="h-8 w-8 rounded-full bg-gradient-to-r from-purple-600 to-indigo-600 flex items-center justify-center mr-2">
              <span className="text-white font-bold text-xs">AV</span>
            </div>
            <h1 className="text-xl font-bold bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent">
              AuraText Vault
            </h1>
          </Link>
        </div>
        
        {isMobile ? (
          <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon">
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right">
              <nav className="mt-8">
                <ul className="flex flex-col items-start space-y-4">
                  <NavItems />
                </ul>
              </nav>
            </SheetContent>
          </Sheet>
        ) : (
          <nav>
            <ul className="flex items-center space-x-2">
              <NavItems />
            </ul>
          </nav>
        )}
      </div>
    </header>
  );
};

export default Header;
