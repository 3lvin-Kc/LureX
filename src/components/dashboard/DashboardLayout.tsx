
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { 
  BarChart3, 
  FileText, 
  Users, 
  Mail, 
  Settings, 
  LogOut, 
  Menu, 
  X, 
  Home 
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import { useIsMobile } from '@/hooks/use-mobile';

type DashboardLayoutProps = {
  children: React.ReactNode;
};

const DashboardLayout: React.FC<DashboardLayoutProps> = ({ children }) => {
  const [user, setUser] = useState<any>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const isMobile = useIsMobile();
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    const getUser = async () => {
      try {
        const { data } = await supabase.auth.getUser();
        setUser(data.user);
      } catch (error) {
        console.error("Error fetching user:", error);
      }
    };

    getUser();

    const { data: authListener } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (event === 'SIGNED_OUT') {
          setUser(null);
          navigate('/auth');
        } else if (event === 'SIGNED_IN' && session) {
          setUser(session.user);
        }
      }
    );

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, [navigate]);

  useEffect(() => {
    if (user === null) {
      // Don't redirect here to prevent potential loop - App.tsx handles this
      console.log("No user detected in DashboardLayout");
    }
  }, [user]);

  const handleLogout = async () => {
    try {
      setIsLoading(true);
      await supabase.auth.signOut();
      toast({
        title: 'Logged out',
        description: 'You have been successfully logged out',
      });
      navigate('/auth');
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to log out',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleNavigation = (path: string) => {
    setIsLoading(true);
    navigate(path);
    setSidebarOpen(false);
    // Use a short timeout to allow for navigation to complete
    setTimeout(() => setIsLoading(false), 300);
  };

  const NavItems = () => (
    <div className="space-y-2">
      <Button
        variant="ghost"
        className="w-full justify-start"
        onClick={() => handleNavigation('/dashboard')}
        disabled={isLoading}
      >
        <Home className="mr-2 h-5 w-5" />
        Dashboard
      </Button>
      <Button
        variant="ghost"
        className="w-full justify-start"
        onClick={() => handleNavigation('/campaigns')}
        disabled={isLoading}
      >
        <Mail className="mr-2 h-5 w-5" />
        Campaigns
      </Button>
      <Button
        variant="ghost"
        className="w-full justify-start"
        onClick={() => handleNavigation('/templates')}
        disabled={isLoading}
      >
        <FileText className="mr-2 h-5 w-5" />
        Templates
      </Button>
      <Button
        variant="ghost"
        className="w-full justify-start"
        onClick={() => handleNavigation('/target-lists')}
        disabled={isLoading}
      >
        <Users className="mr-2 h-5 w-5" />
        Target Lists
      </Button>
      <Button
        variant="ghost"
        className="w-full justify-start"
        onClick={() => handleNavigation('/analytics')}
        disabled={isLoading}
      >
        <BarChart3 className="mr-2 h-5 w-5" />
        Analytics
      </Button>
      <Separator className="my-4" />
      <Button
        variant="ghost"
        className="w-full justify-start"
        onClick={() => handleNavigation('/settings')}
        disabled={isLoading}
      >
        <Settings className="mr-2 h-5 w-5" />
        Settings
      </Button>
      <Button
        variant="ghost"
        className="w-full justify-start text-red-500 hover:text-red-700 hover:bg-red-100"
        onClick={handleLogout}
        disabled={isLoading}
      >
        <LogOut className="mr-2 h-5 w-5" />
        Logout
      </Button>
    </div>
  );

  // Show a basic loading state if user data is still loading
  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="flex flex-col items-center">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-500 mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gray-50 dark:bg-gray-900">
      {/* Sidebar for desktop */}
      {!isMobile && (
        <div className="w-64 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 p-4 hidden md:block">
          <div className="flex items-center justify-center h-16 mb-8">
            <h1 className="text-xl font-bold">Phishing Platform</h1>
          </div>
          <NavItems />
        </div>
      )}

      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top navigation bar */}
        <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 p-4 flex items-center justify-between">
          {isMobile && (
            <Sheet open={sidebarOpen} onOpenChange={setSidebarOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon">
                  <Menu className="h-6 w-6" />
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-64">
                <SheetHeader className="mb-6">
                  <SheetTitle>Phishing Platform</SheetTitle>
                </SheetHeader>
                <NavItems />
              </SheetContent>
            </Sheet>
          )}
          <div className="md:hidden font-bold text-lg">Phishing Platform</div>
          <div className="flex items-center">
            <span className="text-sm mr-4">{user?.email}</span>
            {!isMobile && (
              <Button variant="outline" size="sm" onClick={handleLogout} disabled={isLoading}>
                <LogOut className="h-4 w-4 mr-2" />
                Logout
              </Button>
            )}
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-auto bg-gray-50 dark:bg-gray-900">
          {children}
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
