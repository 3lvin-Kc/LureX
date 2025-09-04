import React from "react";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { EducationAnalyticsDashboard } from "@/components/education/EducationAnalyticsDashboard";

const EducationResults = () => {
  return (
    <DashboardLayout>
      <div className="container mx-auto p-4 max-w-7xl">
        <div className="mb-6">
          <h1 className="text-3xl font-bold">Education Results</h1>
          <p className="text-muted-foreground">
            Track the effectiveness of your phishing simulation education
          </p>
        </div>
        
        <EducationAnalyticsDashboard />
      </div>
    </DashboardLayout>
  );
};

export default EducationResults;