import React, { useState } from "react";
import { Shield } from "lucide-react";
import { DocsSidebar } from "@/components/docs/DocsSidebar";
import { DocsSearch } from "@/components/docs/DocsSearch";
import { OverviewContent } from "@/components/docs/content/OverviewContent";
import { QuickStartContent } from "@/components/docs/content/QuickStartContent";

import { CreateCampaignContent } from "@/components/docs/content/CreateCampaignContent";
import { EmailTemplatesContent } from "@/components/docs/content/EmailTemplatesContent";
import { TargetManagementContent } from "@/components/docs/content/TargetManagementContent";

import { WebsiteCloneContent } from "@/components/docs/content/WebsiteCloneContent";
import { CustomPagesContent } from "@/components/docs/content/CustomPagesContent";

import { LiveTrackingContent } from "@/components/docs/content/LiveTrackingContent";
import { ReportsContent } from "@/components/docs/content/ReportsContent";
import { MetricsContent } from "@/components/docs/content/MetricsContent";
import { CustomDomainsContent } from "@/components/docs/content/CustomDomainsContent";


import { TroubleshootingContent } from "@/components/docs/content/TroubleshootingContent";
import { FeatureRequestContent } from "@/components/docs/content/FeatureRequestContent";
import { SupportContent } from "@/components/docs/content/SupportContent";
import { AIGeneratorContent } from "@/components/docs/content/AIGeneratorContent";

const Documentation = () => {
  const [activeSection, setActiveSection] = useState("overview");

  const renderContent = () => {
    switch (activeSection) {
      case "overview":
        return <OverviewContent />;
      case "quickstart":
        return <QuickStartContent />;
      
      case "create-campaign":
        return <CreateCampaignContent />;
      case "email-templates":
        return <EmailTemplatesContent />;
      case "target-management":
        return <TargetManagementContent />;
      
      case "website-clone":
        return <WebsiteCloneContent />;
      case "custom-pages":
        return <CustomPagesContent />;
      
      case "live-tracking":
        return <LiveTrackingContent />;
      case "reports":
        return <ReportsContent />;
      case "metrics":
        return <MetricsContent />;
      case "AI Generator":
        return <AIGeneratorContent />;
      
      
      case "troubleshooting":
        return <TroubleshootingContent />;
      case "feature-request":
        return <FeatureRequestContent />;
      case "support":
        return <SupportContent />;
      default:
        return <OverviewContent />;
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-card/80 backdrop-blur-md border-b border-border sticky top-0 z-50">
        <div className="flex items-center justify-between px-6 py-4">
          <div className="flex items-center space-x-3">
            <Shield className="h-6 w-6 text-primary" />
            <span className="text-xl font-bold text-foreground">LureX</span>
            <span className="text-muted-foreground">Documentation</span>
          </div>
          <DocsSearch />
        </div>
      </header>

      <div className="flex">
        {/* Fixed Sidebar */}
        <DocsSidebar 
          activeSection={activeSection} 
          onSectionChange={setActiveSection} 
        />

        {/* Main Content */}
        <main className="flex-1 p-8 ml-80">
          <div className="max-w-4xl mx-auto">
            {renderContent()}
          </div>
        </main>
      </div>
    </div>
  );
};

export default Documentation;
