import React from 'react';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import { AdaptiveTrainingDashboard } from '@/components/training/AdaptiveTrainingDashboard';

const Training = () => {
  return (
    <DashboardLayout>
      <AdaptiveTrainingDashboard />
    </DashboardLayout>
  );
};

export default Training;