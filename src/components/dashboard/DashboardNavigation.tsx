
import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { 
  Home, 
  Target, 
  Users, 
  Globe, 
  BarChart3,
  LogOut,
  Shield,
  Mail,
  Settings,
  TrendingUp
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/components/auth/AuthProvider';

const navigationItems = [
  {
    name: 'Dashboard',
    href: '/dashboard',
    icon: Home,
  },
  {
    name: 'Campaigns',
    href: '/campaigns',
    icon: Target,
  },
  {
    name: 'Templates',
    href: '/templates',
    icon: Mail,
  },
  {
    name: 'Target Lists',
    href: '/target-lists',
    icon: Users,
  },
  {
    name: 'Phishing Pages',
    href: '/phishing-pages',
    icon: Globe,
  },
  {
    name: 'Domain Management',
    href: '/domain-management',
    icon: Shield,
  },
  {
    name: 'Reports',
    href: '/reports',
    icon: BarChart3,
  },
  {
    name: 'Advanced Reports',
    href: '/advanced-reports',
    icon: TrendingUp,
  },
  {
    name: 'Settings',
    href: '/settings',
    icon: Settings,
  },
];

const DashboardNavigation = () => {
  const location = useLocation();
  const { signOut } = useAuth();

  return (
    <nav className="flex flex-col h-full">
      <div className="flex items-center gap-2 px-6 py-4 border-b">
        
        <span className="text-xl font-bold">LureX</span>
      </div>
      
      <div className="flex-1 px-4 py-6">
        <ul className="space-y-2">
          {navigationItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.href || 
              (item.href !== '/dashboard' && location.pathname.startsWith(item.href));
            
            return (
              <li key={item.name}>
                <NavLink
                  to={item.href}
                  className={cn(
                    'flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors',
                    isActive
                      ? 'bg-blue-100 text-blue-700'
                      : 'text-gray-700 hover:bg-gray-100'
                  )}
                >
                  <Icon className="h-5 w-5" />
                  {item.name}
                </NavLink>
              </li>
            );
          })}
        </ul>
      </div>
      
      <div className="px-4 py-4 border-t">
        <Button
          variant="ghost"
          className="w-full justify-start gap-3 text-gray-700 hover:bg-gray-100"
          onClick={() => signOut()}
        >
          <LogOut className="h-5 w-5" />
          Sign Out
        </Button>
      </div>
    </nav>
  );
};

export default DashboardNavigation;
