
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
import { useMobile } from '@/hooks/use-mobile';

type DashboardLayoutProps = {
  children: React.ReactNode;
};

const DashboardLayout: React.FC<DashboardLayoutProps> = ({ children }) => {
  const [user, setUser] = useState<any>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const isMobile = useMobile();
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    const getUser = async () => {
      const { data } = await supabase.auth.getUser();
      setUser(data.user);
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
      navigate('/auth');
    }
  }, [user, navigate]);

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
      navigate('/auth');
      toast({
        title: 'Logged out',
        description: 'You have been successfully logged out',
      });
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to log out',
        variant: 'destructive',
      });
    }
  };

  const NavItems = () => (
    <div className="space-y-2">
      <Button
        variant="ghost"
        className="w-full justify-start"
        onClick={() => {
          navigate('/dashboard');
          setSidebarOpen(false);
        }}
      >
        <Home className="mr-2 h-5 w-5" />
        Dashboard
      </Button>
      <Button
        variant="ghost"
        className="w-full justify-start"
        onClick={() => {
          navigate('/campaigns');
          setSidebarOpen(false);
        }}
      >
        <Mail className="mr-2 h-5 w-5" />
        Campaigns
      </Button>
      <Button
        variant="ghost"
        className="w-full justify-start"
        onClick={() => {
          navigate('/templates');
          setSidebarOpen(false);
        }}
      >
        <FileText className="mr-2 h-5 w-5" />
        Templates
      </Button>
      <Button
        variant="ghost"
        className="w-full justify-start"
        onClick={() => {
          navigate('/target-lists');
          setSidebarOpen(false);
        }}
      >
        <Users className="mr-2 h-5 w-5" />
        Target Lists
      </Button>
      <Button
        variant="ghost"
        className="w-full justify-start"
        onClick={() => {
          navigate('/reports');
          setSidebarOpen(false);
        }}
      >
        <BarChart3 className="mr-2 h-5 w-5" />
        Reports
      </Button>
      <Separator className="my-4" />
      <Button
        variant="ghost"
        className="w-full justify-start"
        onClick={() => {
          navigate('/settings');
          setSidebarOpen(false);
        }}
      >
        <Settings className="mr-2 h-5 w-5" />
        Settings
      </Button>
      <Button
        variant="ghost"
        className="w-full justify-start text-red-500 hover:text-red-700 hover:bg-red-100"
        onClick={handleLogout}
      >
        <LogOut className="mr-2 h-5 w-5" />
        Logout
      </Button>
    </div>
  );

  if (!user) {
    return null; // Or a loading spinner
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
              <Button variant="outline" size="sm" onClick={handleLogout}>
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
