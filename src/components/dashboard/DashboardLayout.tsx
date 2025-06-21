
import React from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { 
  Shield, 
  BarChart3, 
  Mail, 
  Users, 
  Globe, 
  FileText, 
  Settings, 
  LogOut,
  User
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/components/auth/AuthProvider";
import { useToast } from "@/hooks/use-toast";

const DashboardLayout = ({ children }: { children: React.ReactNode }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { signOut, user } = useAuth();
  const { toast } = useToast();

  const handleSignOut = async () => {
    try {
      await signOut();
      toast({
        title: "Signed Out",
        description: "You have been successfully signed out.",
      });
      navigate('/');
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to sign out. Please try again.",
        variant: "destructive",
      });
    }
  };

  const menuItems = [
    { path: "/dashboard", icon: BarChart3, label: "Dashboard" },
    { path: "/campaigns", icon: Mail, label: "Campaigns" },
    { path: "/templates", icon: FileText, label: "Templates" },
    { path: "/phishing-pages", icon: Globe, label: "Phishing Pages" },
    { path: "/target-lists", icon: Users, label: "Target Lists" },
    { path: "/reports", icon: BarChart3, label: "Reports" },
    { path: "/settings", icon: Settings, label: "Settings" },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Sidebar */}
      <div className="fixed inset-y-0 left-0 w-64 bg-white shadow-lg">
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="flex items-center px-6 py-4 border-b">
            <Shield className="h-8 w-8 text-blue-600" />
            <span className="ml-2 text-xl font-bold text-gray-900">PhishGuard</span>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-4 py-6 space-y-2">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;
              
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-colors ${
                    isActive
                      ? "bg-blue-50 text-blue-600 border-r-2 border-blue-600"
                      : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                  }`}
                >
                  <Icon className="h-5 w-5 mr-3" />
                  {item.label}
                </Link>
              );
            })}
          </nav>

          {/* User section */}
          <div className="border-t p-4">
            <div className="flex items-center mb-4">
              <div className="flex items-center justify-center w-8 h-8 bg-blue-100 rounded-full">
                <User className="h-4 w-4 text-blue-600" />
              </div>
              <div className="ml-3 min-w-0 flex-1">
                <p className="text-sm font-medium text-gray-900 truncate">
                  {user?.email}
                </p>
                <p className="text-sm text-gray-500">User</p>
              </div>
            </div>
            <Button
              variant="ghost"
              className="w-full justify-start text-gray-600 hover:text-gray-900"
              onClick={handleSignOut}
            >
              <LogOut className="h-4 w-4 mr-3" />
              Sign Out
            </Button>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="ml-64">
        <main className="min-h-screen">
          {children}
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
