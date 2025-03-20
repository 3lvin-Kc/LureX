
import React from 'react';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import CampaignForm from '@/components/campaigns/CampaignForm';

const CreateCampaign = () => {
  return (
    <DashboardLayout>
      <div className="container mx-auto p-4 max-w-7xl">
        <h1 className="text-3xl font-bold mb-6">Create Campaign</h1>
        <CampaignForm />
      </div>
    </DashboardLayout>
  );
};

export default CreateCampaign;
