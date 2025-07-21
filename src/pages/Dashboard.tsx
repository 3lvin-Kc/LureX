
import React from "react";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import LiveMetricsDashboard from "@/components/analytics/LiveMetricsDashboard";

const Dashboard = () => {
  return (
    <DashboardLayout>
      <div className="container mx-auto p-4 max-w-7xl">
        <div className="mb-6">
          <h1 className="text-3xl font-bold">Dashboard</h1>
          <p className="text-muted-foreground">
            Monitor your phishing simulation campaigns and security awareness progress
          </p>
        </div>
        
        <LiveMetricsDashboard />
      </div>
    </DashboardLayout>
  );
};

export default Dashboard;
