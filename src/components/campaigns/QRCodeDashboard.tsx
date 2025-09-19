import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  QrCode, 
  Smartphone, 
  Monitor, 
  Clock, 
  Target, 
  TrendingUp,
  Eye,
  MousePointer,
  Users,
  Activity
} from 'lucide-react';
import { useQRMetrics } from '@/hooks/useQRMetrics';
import { format } from 'date-fns';

interface QRCodeDashboardProps {
  campaignId: string;
  campaignName: string;
}

export const QRCodeDashboard: React.FC<QRCodeDashboardProps> = ({ 
  campaignId, 
  campaignName 
}) => {
  const { 
    campaignStats, 
    loading, 
    getRecentScans, 
    getDeviceBreakdown,
    getScanTimeline 
  } = useQRMetrics(campaignId);

  const recentScans = getRecentScans(5);
  const deviceBreakdown = getDeviceBreakdown();
  const scanTimeline = getScanTimeline();

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <Card key={i}>
              <CardContent className="p-6">
                <div className="animate-pulse">
                  <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                  <div className="h-8 bg-gray-200 rounded w-1/2"></div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (!campaignStats) {
    return (
      <Card>
        <CardContent className="p-6 text-center">
          <QrCode className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No QR Code Data</h3>
          <p className="text-gray-500">No metrics available for this QR code campaign yet.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">QR Code Campaign Metrics</h2>
          <p className="text-gray-600">{campaignName}</p>
        </div>
        <Badge variant="outline" className="flex items-center gap-2">
          <QrCode className="w-4 h-4" />
          QR Campaign
        </Badge>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Scans</p>
                <p className="text-3xl font-bold text-blue-600">{campaignStats.total_scanned}</p>
              </div>
              <QrCode className="w-8 h-8 text-blue-600" />
            </div>
            <div className="mt-2">
              <Progress value={campaignStats.scan_rate} className="h-2" />
              <p className="text-xs text-gray-500 mt-1">
                {campaignStats.scan_rate.toFixed(1)}% scan rate
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Unique Scanners</p>
                <p className="text-3xl font-bold text-green-600">{campaignStats.unique_scanners}</p>
              </div>
              <Users className="w-8 h-8 text-green-600" />
            </div>
            <div className="mt-2">
              <p className="text-xs text-gray-500">
                {campaignStats.total_sent > 0 
                  ? ((campaignStats.unique_scanners / campaignStats.total_sent) * 100).toFixed(1)
                  : 0}% of targets scanned
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Mobile Scans</p>
                <p className="text-3xl font-bold text-purple-600">{campaignStats.mobile_scans}</p>
              </div>
              <Smartphone className="w-8 h-8 text-purple-600" />
            </div>
            <div className="mt-2">
              <p className="text-xs text-gray-500">
                {campaignStats.total_scanned > 0 
                  ? ((campaignStats.mobile_scans / campaignStats.total_scanned) * 100).toFixed(1)
                  : 0}% mobile usage
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Avg. Time to Scan</p>
                <p className="text-3xl font-bold text-orange-600">
                  {campaignStats.avg_time_to_scan.toFixed(0)}m
                </p>
              </div>
              <Clock className="w-8 h-8 text-orange-600" />
            </div>
            <div className="mt-2">
              <p className="text-xs text-gray-500">
                From email sent to QR scan
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Conversion Funnel */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5" />
            Campaign Funnel
          </CardTitle>
          <CardDescription>
            Track user journey from email to QR code scan
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg">
              <div className="flex items-center gap-3">
                <Target className="w-5 h-5 text-blue-600" />
                <span className="font-medium">Emails Sent</span>
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold text-blue-600">{campaignStats.total_sent}</div>
                <div className="text-sm text-gray-500">100%</div>
              </div>
            </div>

            <div className="flex items-center justify-between p-4 bg-green-50 rounded-lg">
              <div className="flex items-center gap-3">
                <Eye className="w-5 h-5 text-green-600" />
                <span className="font-medium">Emails Opened</span>
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold text-green-600">{campaignStats.total_opened}</div>
                <div className="text-sm text-gray-500">
                  {campaignStats.total_sent > 0 
                    ? ((campaignStats.total_opened / campaignStats.total_sent) * 100).toFixed(1)
                    : 0}%
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between p-4 bg-purple-50 rounded-lg">
              <div className="flex items-center gap-3">
                <QrCode className="w-5 h-5 text-purple-600" />
                <span className="font-medium">QR Codes Scanned</span>
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold text-purple-600">{campaignStats.total_scanned}</div>
                <div className="text-sm text-gray-500">
                  {campaignStats.scan_rate.toFixed(1)}%
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Device Breakdown */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Monitor className="w-5 h-5" />
              Device Breakdown
            </CardTitle>
            <CardDescription>
              QR code scans by device type
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {deviceBreakdown.map((device, index) => (
                <div key={device.device} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {device.device === 'mobile' ? (
                      <Smartphone className="w-4 h-4 text-blue-600" />
                    ) : device.device === 'desktop' ? (
                      <Monitor className="w-4 h-4 text-green-600" />
                    ) : (
                      <Activity className="w-4 h-4 text-gray-600" />
                    )}
                    <span className="capitalize font-medium">{device.device}</span>
                  </div>
                  <div className="text-right">
                    <div className="font-bold">{device.count}</div>
                    <div className="text-sm text-gray-500">{device.percentage.toFixed(1)}%</div>
                  </div>
                </div>
              ))}
              {deviceBreakdown.length === 0 && (
                <p className="text-gray-500 text-center py-4">No scan data available</p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Recent Scans */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="w-5 h-5" />
              Recent Scans
            </CardTitle>
            <CardDescription>
              Latest QR code scan activity
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {recentScans.map((scan, index) => (
                <div key={scan.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <div className="font-medium text-sm">{scan.target_email}</div>
                    <div className="text-xs text-gray-500 flex items-center gap-2">
                      {scan.is_mobile ? (
                        <Smartphone className="w-3 h-3" />
                      ) : (
                        <Monitor className="w-3 h-3" />
                      )}
                      {scan.device_type} • {format(new Date(scan.scanned_at), 'MMM d, HH:mm')}
                    </div>
                  </div>
                  <Badge variant="outline" className="text-xs">
                    Scanned
                  </Badge>
                </div>
              ))}
              {recentScans.length === 0 && (
                <p className="text-gray-500 text-center py-4">No recent scans</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
