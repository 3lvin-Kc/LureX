
import React, { useEffect, useState } from 'react';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import CampaignForm from '@/components/campaigns/CampaignForm';
import { CampaignSimulationHelper } from '@/components/campaigns/CampaignSimulationHelper';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

const CreateCampaign = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('campaign');
  
  useEffect(() => {
    // Simulate a brief loading period to ensure the component is fully mounted
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 300);
    
    return () => clearTimeout(timer);
  }, []);
  
  return (
    <DashboardLayout>
      <div className="container mx-auto p-4 max-w-7xl">
        <h1 className="text-3xl font-bold mb-6">Create Campaign</h1>
        
        <Tabs defaultValue="campaign" value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="mb-6">
            <TabsTrigger value="campaign">Campaign Details</TabsTrigger>
            <TabsTrigger value="how-it-works">How Phishing Simulations Work</TabsTrigger>
          </TabsList>
          
          <TabsContent value="campaign">
            {isLoading ? (
              <Card>
                <CardContent className="flex items-center justify-center h-64">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
                </CardContent>
              </Card>
            ) : (
              <CampaignForm />
            )}
          </TabsContent>
          
          <TabsContent value="how-it-works">
            <CampaignSimulationHelper />
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
};

export default CreateCampaign;
