import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import CampaignForm from '@/components/campaigns/CampaignForm';
import { Card, CardContent } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { useCampaigns } from '@/hooks/useCampaigns';

const EditCampaign = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { campaigns, loading, updateCampaign } = useCampaigns();
  const [campaign, setCampaign] = useState(null);

  useEffect(() => {
    if (campaigns && id) {
      const foundCampaign = campaigns.find(c => c.id === id);
      setCampaign(foundCampaign);
    }
  }, [campaigns, id]);

  const handleSubmit = async (data: any) => {
    try {
      if (!id) return;
      
      await updateCampaign(id, {
        name: data.name,
        description: data.description,
        status: data.schedule_time ? 'scheduled' : 'draft',
        schedule_time: data.schedule_time,
        template_id: data.template_id,
        target_list_id: data.target_list_id,
        phishing_page_id: data.phishing_page_id,
        domain_id: data.domain_id || null,
      });

      toast({
        title: "Campaign updated",
        description: "Your campaign has been updated successfully"
      });

      navigate('/campaigns');
    } catch (error: any) {
      console.error('Campaign update error:', error);
      toast({
        title: "Error updating campaign",
        description: error.message || "Failed to update campaign",
        variant: "destructive"
      });
    }
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="container mx-auto p-4 max-w-7xl">
          <Card>
            <CardContent className="flex items-center justify-center h-64">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
            </CardContent>
          </Card>
        </div>
      </DashboardLayout>
    );
  }

  if (!campaign) {
    return (
      <DashboardLayout>
        <div className="container mx-auto p-4 max-w-7xl">
          <Card>
            <CardContent className="flex items-center justify-center h-64">
              <div className="text-center">
                <h2 className="text-xl font-semibold mb-2">Campaign not found</h2>
                <p className="text-muted-foreground">The campaign you're looking for doesn't exist.</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="container mx-auto p-4 max-w-7xl">
        <h1 className="text-3xl font-bold mb-6">Edit Campaign</h1>
        <CampaignForm onSubmit={handleSubmit} initialData={campaign} />
      </div>
    </DashboardLayout>
  );
};

export default EditCampaign;