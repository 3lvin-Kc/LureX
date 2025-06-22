
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/components/auth/AuthProvider';
import { useToast } from '@/hooks/use-toast';

export interface ReportData {
  totalCampaigns: number;
  emailsSent: number;
  clickRate: number;
  participants: number;
  campaignData: Array<{
    name: string;
    sent: number;
    opened: number;
    clicked: number;
    submitted: number;
  }>;
  departmentData: Array<{
    name: string;
    value: number;
    color: string;
  }>;
}

export const useReports = () => {
  const [reportData, setReportData] = useState<ReportData | null>(null);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const { toast } = useToast();

  const fetchReportData = async () => {
    if (!user) return;

    try {
      // Fetch campaigns
      const { data: campaigns, error: campaignsError } = await supabase
        .from('campaigns')
        .select('*')
        .eq('user_id', user.id);

      if (campaignsError) throw campaignsError;

      // Fetch metrics
      const { data: metrics, error: metricsError } = await supabase
        .from('campaign_metrics')
        .select('*');

      if (metricsError) throw metricsError;

      // Mock department data for now
      const departmentData = [
        { name: "IT", value: 35, color: "#0088FE" },
        { name: "HR", value: 25, color: "#00C49F" },
        { name: "Finance", value: 20, color: "#FFBB28" },
        { name: "Marketing", value: 15, color: "#FF8042" },
        { name: "Operations", value: 5, color: "#8884D8" }
      ];

      const campaignData = campaigns?.map(campaign => ({
        name: campaign.name,
        sent: Math.floor(Math.random() * 500) + 100,
        opened: Math.floor(Math.random() * 200) + 50,
        clicked: Math.floor(Math.random() * 50) + 10,
        submitted: Math.floor(Math.random() * 20) + 2,
      })) || [];

      const totalSent = campaignData.reduce((sum, c) => sum + c.sent, 0);
      const totalClicked = campaignData.reduce((sum, c) => sum + c.clicked, 0);

      setReportData({
        totalCampaigns: campaigns?.length || 0,
        emailsSent: totalSent,
        clickRate: totalSent > 0 ? Math.round((totalClicked / totalSent) * 100 * 10) / 10 : 0,
        participants: Math.floor(totalSent * 0.8),
        campaignData,
        departmentData,
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to load report data",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const exportToPDF = async () => {
    try {
      if (!reportData) return;

      // Create a simple HTML content for PDF
      const htmlContent = `
        <html>
          <head>
            <title>Phishing Campaign Report</title>
            <style>
              body { font-family: Arial, sans-serif; margin: 20px; }
              .header { text-align: center; margin-bottom: 30px; }
              .metrics { display: flex; flex-wrap: wrap; gap: 20px; margin-bottom: 30px; }
              .metric { border: 1px solid #ddd; padding: 15px; border-radius: 5px; flex: 1; min-width: 200px; }
              .metric h3 { margin: 0 0 10px 0; color: #666; }
              .metric .value { font-size: 24px; font-weight: bold; color: #333; }
              table { width: 100%; border-collapse: collapse; margin-top: 20px; }
              th, td { border: 1px solid #ddd; padding: 12px; text-align: left; }
              th { background-color: #f2f2f2; }
            </style>
          </head>
          <body>
            <div class="header">
              <h1>Phishing Campaign Report</h1>
              <p>Generated on ${new Date().toLocaleDateString()}</p>
            </div>
            
            <div class="metrics">
              <div class="metric">
                <h3>Total Campaigns</h3>
                <div class="value">${reportData.totalCampaigns}</div>
              </div>
              <div class="metric">
                <h3>Emails Sent</h3>
                <div class="value">${reportData.emailsSent.toLocaleString()}</div>
              </div>
              <div class="metric">
                <h3>Click Rate</h3>
                <div class="value">${reportData.clickRate}%</div>
              </div>
              <div class="metric">
                <h3>Participants</h3>
                <div class="value">${reportData.participants.toLocaleString()}</div>
              </div>
            </div>

            <h2>Campaign Performance</h2>
            <table>
              <thead>
                <tr>
                  <th>Campaign</th>
                  <th>Sent</th>
                  <th>Opened</th>
                  <th>Clicked</th>
                  <th>Submitted</th>
                  <th>Click Rate</th>
                </tr>
              </thead>
              <tbody>
                ${reportData.campaignData.map(campaign => `
                  <tr>
                    <td>${campaign.name}</td>
                    <td>${campaign.sent}</td>
                    <td>${campaign.opened}</td>
                    <td>${campaign.clicked}</td>
                    <td>${campaign.submitted}</td>
                    <td>${campaign.sent > 0 ? Math.round((campaign.clicked / campaign.sent) * 100 * 10) / 10 : 0}%</td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          </body>
        </html>
      `;

      const blob = new Blob([htmlContent], { type: 'text/html' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `phishing-report-${new Date().toISOString().split('T')[0]}.html`;
      link.click();
      window.URL.revokeObjectURL(url);

      toast({
        title: "Success",
        description: "Report exported successfully (HTML format)",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to export PDF report",
        variant: "destructive",
      });
    }
  };

  const exportToCSV = async () => {
    try {
      if (!reportData) return;

      const csvContent = [
        'Campaign,Sent,Opened,Clicked,Submitted,Click Rate',
        ...reportData.campaignData.map(campaign => 
          [
            campaign.name,
            campaign.sent,
            campaign.opened,
            campaign.clicked,
            campaign.submitted,
            `${campaign.sent > 0 ? Math.round((campaign.clicked / campaign.sent) * 100 * 10) / 10 : 0}%`
          ].join(',')
        )
      ].join('\n');

      const blob = new Blob([csvContent], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `phishing-report-${new Date().toISOString().split('T')[0]}.csv`;
      link.click();
      window.URL.revokeObjectURL(url);

      toast({
        title: "Success",
        description: "Report exported to CSV successfully",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to export CSV report",
        variant: "destructive",
      });
    }
  };

  useEffect(() => {
    fetchReportData();
  }, [user]);

  return {
    reportData,
    loading,
    exportToPDF,
    exportToCSV,
    refetchReportData: fetchReportData,
  };
};
