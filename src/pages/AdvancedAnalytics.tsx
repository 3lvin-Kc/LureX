
import React from 'react';
import { useParams } from 'react-router-dom';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import RealTimeMetrics from '@/components/analytics/RealTimeMetrics';
import AdvancedAnalyticsDashboard from '@/components/analytics/AdvancedAnalyticsDashboard';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

const AdvancedAnalytics = () => {
  const { campaignId } = useParams<{ campaignId: string }>();

  return (
    <DashboardLayout>
      <div className="container mx-auto p-4 max-w-7xl">
        <div className="mb-6">
          <h1 className="text-3xl font-bold">Advanced Analytics</h1>
          <p className="text-muted-foreground">
            Comprehensive insights and real-time tracking for your campaigns
          </p>
        </div>

        <Tabs defaultValue="realtime" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="realtime">Real-time Metrics</TabsTrigger>
            <TabsTrigger value="advanced">Advanced Analytics</TabsTrigger>
          </TabsList>

          <TabsContent value="realtime" className="space-y-4">
            <RealTimeMetrics campaignId={campaignId} />
          </TabsContent>

          <TabsContent value="advanced" className="space-y-4">
            {campaignId ? (
              <AdvancedAnalyticsDashboard campaignId={campaignId} />
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                Please select a campaign to view advanced analytics
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
};

export default AdvancedAnalytics;
