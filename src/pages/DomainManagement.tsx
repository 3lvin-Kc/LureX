
import React from 'react';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import CustomDomainManager from '@/components/domains/CustomDomainManager';

const DomainManagement = () => {
  return (
    <DashboardLayout>
      <div className="container mx-auto p-4 max-w-6xl">
        <div className="mb-6">
          <h1 className="text-3xl font-bold">Domain Management</h1>
          <p className="text-muted-foreground">
            Configure and manage custom domains for your phishing campaigns
          </p>
        </div>

        <CustomDomainManager />
      </div>
    </DashboardLayout>
  );
};

export default DomainManagement;
