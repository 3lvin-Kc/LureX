
import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { 
  BarChart3, 
  FileText, 
  Users, 
  Mail, 
  Settings, 
  LogOut, 
  Menu, 
  Home,
  GanttChart,
  MonitorPlay,
  FileText as FileDocument,
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
  const location = useLocation();
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

  const navItems = [
    { path: '/dashboard', label: 'Dashboard', icon: Home },
    { path: '/campaigns', label: 'Campaigns', icon: GanttChart },
    { path: '/phishing-pages', label: 'Phishing Pages', icon: MonitorPlay },
    { path: '/templates', label: 'Email Templates', icon: Mail },
    { path: '/target-lists', label: 'Target Lists', icon: Users },
    { path: '/reports', label: 'Reports & Logs', icon: FileDocument },
    { path: '/settings', label: 'Settings', icon: Settings },
  ];

  const NavItems = () => (
    <div className="space-y-2">
      {navItems.map((item) => (
        <Button
          key={item.path}
          variant={location.pathname === item.path ? "secondary" : "ghost"}
          className="w-full justify-start"
          asChild
          disabled={isLoading}
        >
          <Link to={item.path} onClick={() => setSidebarOpen(false)}>
            <item.icon className="mr-2 h-5 w-5" />
            {item.label}
          </Link>
        </Button>
      ))}
      <Separator className="my-4" />
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

  return (
    <div className="flex h-screen bg-gray-50 dark:bg-gray-900">
      {!isMobile && (
        <div className="w-64 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 p-4 hidden md:block">
          <div className="flex items-center justify-center h-16 mb-8">
            <Link to="/dashboard" className="text-xl font-bold">Phishing Platform</Link>
          </div>
          <NavItems />
        </div>
      )}

      <div className="flex-1 flex flex-col overflow-hidden">
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
                  <SheetTitle>
                    <Link to="/dashboard" onClick={() => setSidebarOpen(false)}>
                      Phishing Platform
                    </Link>
                  </SheetTitle>
                </SheetHeader>
                <NavItems />
              </SheetContent>
            </Sheet>
          )}
          <div className="md:hidden font-bold text-lg">
            <Link to="/dashboard">Phishing Platform</Link>
          </div>
          <div className="flex items-center">
            <span className="text-sm mr-4">{user?.email}</span>
          </div>
        </header>

        <main className="flex-1 overflow-auto bg-gray-50 dark:bg-gray-900">
          {children}
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
