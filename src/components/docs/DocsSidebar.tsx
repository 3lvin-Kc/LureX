import React from "react";
import { cn } from "@/lib/utils";
import { 
  BookOpen, 
  Zap, 
  Settings, 
  Mail, 
  Users, 
  Rocket, 
  Globe, 
  Palette, 
  TrendingUp, 
  BarChart3, 
  Activity, 
  Link, 
  Repeat, 
  Puzzle, 
  HelpCircle, 
  MessageSquarePlus, 
  LifeBuoy 
} from "lucide-react";

interface DocsSidebarProps {
  activeSection: string;
  onSectionChange: (section: string) => void;
}

export const DocsSidebar: React.FC<DocsSidebarProps> = ({ 
  activeSection, 
  onSectionChange 
}) => {
  const sidebarSections = [
    {
      title: "Getting Started",
      items: [
        { id: "overview", label: "Overview", icon: BookOpen },
        { id: "quickstart", label: "Quick Start", icon: Zap },
        { id: "setup", label: "Setup Guide", icon: Settings },
      ]
    },
    {
      title: "Campaign Management",
      items: [
        { id: "create-campaign", label: "Create Campaign", icon: Rocket },
        { id: "email-templates", label: "Email Templates", icon: Mail },
        { id: "target-management", label: "Target Management", icon: Users },
        { id: "launch-campaign", label: "Launch Campaign", icon: TrendingUp },
      ]
    },
    {
      title: "Phishing Pages",
      items: [
        { id: "website-clone", label: "Website Clone", icon: Globe },
        { id: "custom-pages", label: "Custom Pages", icon: Palette },
        { id: "page-optimization", label: "Page Optimization", icon: Activity },
      ]
    },
    {
      title: "Analytics & Reports",
      items: [
        { id: "live-tracking", label: "Live Tracking", icon: Activity },
        { id: "reports", label: "Reports", icon: BarChart3 },
        { id: "metrics", label: "Metrics", icon: TrendingUp },
      ]
    },
    {
      title: "Advanced Features",
      items: [
        { id: "custom-domains", label: "Custom Domains", icon: Link },
        { id: "automation", label: "Automation", icon: Repeat },
        { id: "integrations", label: "Integrations", icon: Puzzle },
      ]
    },
    {
      title: "Help & Support",
      items: [
        { id: "troubleshooting", label: "Troubleshooting", icon: HelpCircle },
        { id: "feature-request", label: "Feature Request", icon: MessageSquarePlus },
        { id: "support", label: "Support", icon: LifeBuoy },
      ]
    }
  ];

  return (
    <aside className="fixed left-0 top-[73px] h-[calc(100vh-73px)] w-80 bg-card border-r border-border overflow-y-auto">
      <div className="p-6">
        <nav className="space-y-8">
          {sidebarSections.map((section) => (
            <div key={section.title}>
              <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3">
                {section.title}
              </h3>
              <ul className="space-y-1">
                {section.items.map((item) => {
                  const Icon = item.icon;
                  return (
                    <li key={item.id}>
                      <button
                        onClick={() => onSectionChange(item.id)}
                        className={cn(
                          "w-full flex items-center space-x-3 px-3 py-2 text-sm rounded-md transition-colors text-left",
                          activeSection === item.id
                            ? "bg-primary/10 text-primary border-r-2 border-primary"
                            : "text-muted-foreground hover:text-foreground hover:bg-accent"
                        )}
                      >
                        <Icon className="h-4 w-4 flex-shrink-0" />
                        <span>{item.label}</span>
                      </button>
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
        </nav>
      </div>
    </aside>
  );
};
