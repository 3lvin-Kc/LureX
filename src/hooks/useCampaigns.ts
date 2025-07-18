
import { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';

interface Campaign {
  id: string;
  name: string;
  description?: string;
  status: string;
  schedule_time?: string;
  template_id?: string;
  target_list_id?: string;
  phishing_page_id?: string;
  domain_id?: string;
  created_at: string;
  updated_at?: string;
  template?: { name: string };
  target_list?: { name: string };
}

export const useCampaigns = () => {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  // Mock data for frontend-only implementation
  const mockCampaigns: Campaign[] = [
    {
      id: "1",
      name: "Q1 Security Training",
      status: "completed",
      schedule_time: "2024-01-15T09:00:00Z",
      template: { name: "Phishing Awareness Template" },
      target_list: { name: "All Employees" },
      created_at: "2024-01-10T09:00:00Z"
    },
    {
      id: "2", 
      name: "Finance Department Test",
      status: "in_progress",
      schedule_time: "2024-02-01T10:00:00Z",
      template: { name: "Banking Simulation" },
      target_list: { name: "Finance Team" },
      created_at: "2024-01-25T09:00:00Z"
    },
    {
      id: "3",
      name: "Executive Spear Phishing",
      status: "draft",
      schedule_time: null,
      template: { name: "CEO Impersonation" },
      target_list: { name: "Leadership Team" },
      created_at: "2024-02-05T09:00:00Z"
    }
  ];

  useEffect(() => {
    const timer = setTimeout(() => {
      setCampaigns(mockCampaigns);
      setLoading(false);
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  const createCampaign = async (data: Partial<Campaign>) => {
    try {
      const newCampaign: Campaign = {
        id: Date.now().toString(),
        name: data.name || '',
        description: data.description,
        status: data.status || 'draft',
        schedule_time: data.schedule_time,
        template_id: data.template_id,
        target_list_id: data.target_list_id,
        phishing_page_id: data.phishing_page_id,
        domain_id: data.domain_id,
        created_at: new Date().toISOString(),
        template: { name: "Selected Template" },
        target_list: { name: "Selected Target List" }
      };

      setCampaigns(prev => [...prev, newCampaign]);
      
      toast({
        title: "Campaign created",
        description: "Your campaign has been created successfully"
      });
    } catch (error: any) {
      toast({
        title: "Error creating campaign",
        description: error.message || "Failed to create campaign",
        variant: "destructive"
      });
      throw error;
    }
  };

  const updateCampaign = async (id: string, data: Partial<Campaign>) => {
    try {
      setCampaigns(prev => prev.map(campaign => 
        campaign.id === id 
          ? { ...campaign, ...data, updated_at: new Date().toISOString() }
          : campaign
      ));
      
      toast({
        title: "Campaign updated",
        description: "Your campaign has been updated successfully"
      });
    } catch (error: any) {
      toast({
        title: "Error updating campaign",
        description: error.message || "Failed to update campaign",
        variant: "destructive"
      });
      throw error;
    }
  };

  const updateCampaignStatus = async (id: string, status: string) => {
    try {
      setCampaigns(prev => prev.map(campaign => 
        campaign.id === id 
          ? { ...campaign, status, updated_at: new Date().toISOString() }
          : campaign
      ));
      
      toast({
        title: "Campaign status updated",
        description: `Campaign status changed to ${status}`
      });
    } catch (error: any) {
      toast({
        title: "Error updating campaign status",
        description: error.message || "Failed to update campaign status",
        variant: "destructive"
      });
      throw error;
    }
  };

  return {
    campaigns,
    loading,
    createCampaign,
    updateCampaign,
    updateCampaignStatus
  };
};
