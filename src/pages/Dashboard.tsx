import React, { useState } from "react";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import LiveMetricsDashboard from "@/components/analytics/LiveMetricsDashboard";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Gauge, MoreVertical, X, TrendingUp, Users, Mail, MousePointer, Calendar, Activity, Shield, AlertTriangle, BarChart3, Link, Paperclip, Download, Target, LineChart as LineChartIcon } from "lucide-react";
import CandlestickChart from "@/components/analytics/CandlestickChart";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, ComposedChart, Line, LineChart, Area, AreaChart } from "recharts";
import { useNavigate } from "react-router-dom";
import { useDashboardMetrics } from "@/hooks/useDashboardMetrics";
import { useDeviceAnalytics } from "@/hooks/useDeviceAnalytics";
import { useCandlestickData } from "@/hooks/useCandlestickData";

const Dashboard = () => {
  const [showLiveView, setShowLiveView] = useState(false);
  const [showChartView, setShowChartView] = useState(false);
  const { 
    metrics, 
    campaignPerformance, 
    recentCampaigns, 
    loading: metricsLoading, 
    error: metricsError 
  } = useDashboardMetrics();
  
  const {
    analytics: deviceAnalytics,
    loading: deviceLoading,
    error: deviceError
  } = useDeviceAnalytics();

  const {
    data: candlestickData,
    loading: candlestickLoading,
    error: candlestickError
  } = useCandlestickData();
  
  const navigate = useNavigate();

  // All data now uses real hooks - no mock data needed

  return (
    <DashboardLayout>
      <div className="container mx-auto p-4 max-w-7xl">
        <div className="flex justify-end mb-6">
          {showLiveView ? (
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => setShowLiveView(false)}
              className="flex items-center gap-2"
            >
              <X className="h-4 w-4" />
              Close Live View
            </Button>
          ) : showChartView ? (
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => setShowChartView(false)}
              className="flex items-center gap-2"
            >
              <X className="h-4 w-4" />
              Close Chart View
            </Button>
          ) : (
            <div className="flex items-center gap-2">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => setShowChartView(true)}
                className="flex items-center gap-2"
              >
                <LineChartIcon className="h-4 w-4" />
                Chart
              </Button>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-8 w-8">
                    <MoreVertical className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-40">
                  <DropdownMenuItem 
                    onClick={() => setShowLiveView(true)} 
                    className="flex items-center gap-2 cursor-pointer"
                  >
                    <Gauge className="h-4 w-4" />
                    Live
                  </DropdownMenuItem>
                  <DropdownMenuItem 
                    onClick={() => navigate('/reports')} 
                    className="flex items-center gap-2 cursor-pointer"
                  >
                    <BarChart3 className="h-4 w-4" />
                    Reports
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          )}
        </div>
        
        {showLiveView ? (
          <LiveMetricsDashboard />
        ) : showChartView ? (
          <div className="space-y-6">
            {/* Chart View - Only Candlestick Charts */}
            <Card className="w-full">
              <CardHeader>
                <CardTitle>Campaign Performance Charts</CardTitle>
                <CardDescription>Trading-style candlestick analysis of phishing simulation performance</CardDescription>
              </CardHeader>
              <CardContent>
                {candlestickLoading ? (
                  <div className="flex items-center justify-center h-64">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                  </div>
                ) : candlestickError ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <p>Error loading performance data: {candlestickError}</p>
                  </div>
                ) : candlestickData.linkData.length === 0 && candlestickData.fileData.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <BarChart3 className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <h3 className="font-semibold text-lg mb-2">No Performance Data Yet</h3>
                    <p>Campaign performance charts will appear here once you create and run campaigns</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                    {/* Link-based Phishing Candlestick Chart */}
                    <div>
                      <h4 className="text-sm font-medium mb-3 text-green-600">Link-based Phishing Performance</h4>
                      {candlestickData.linkData.length > 0 ? (
                        <CandlestickChart data={candlestickData.linkData} height={300} />
                      ) : (
                        <div className="h-[300px] flex items-center justify-center text-muted-foreground">
                          <div className="text-center">
                            <Link className="h-8 w-8 mx-auto mb-2 opacity-50" />
                            <p className="text-sm">No link campaigns yet</p>
                          </div>
                        </div>
                      )}
                    </div>
                    
                    {/* File-based Phishing Candlestick Chart */}
                    <div>
                      <h4 className="text-sm font-medium mb-3 text-red-600">File-based Phishing Performance</h4>
                      {candlestickData.fileData.length > 0 ? (
                        <CandlestickChart data={candlestickData.fileData} height={300} />
                      ) : (
                        <div className="h-[300px] flex items-center justify-center text-muted-foreground">
                          <div className="text-center">
                            <Paperclip className="h-8 w-8 mx-auto mb-2 opacity-50" />
                            <p className="text-sm">No file campaigns yet</p>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}
                <div className="flex items-center justify-center gap-6 mt-6 text-sm">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-green-500"></div>
                    <span>Link-based Phishing (Green = Bullish, Red = Bearish)</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-red-500"></div>
                    <span>File-based Phishing (Green = Bullish, Red = Bearish)</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        ) : (
          <div className="space-y-6">
            {/* KPI Cards - Double Row Layout */}
            <div className="space-y-4">
              {/* Top Row - Campaign Overview */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Total Campaigns</CardTitle>
                    <Target className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{metrics?.totalCampaigns || 0}</div>
                    <p className="text-xs text-muted-foreground">Campaigns created</p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Active Campaigns</CardTitle>
                    <Users className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{metrics?.activeCampaigns || 0}</div>
                    <p className="text-xs text-muted-foreground">Currently running</p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Total Interactions</CardTitle>
                    <Activity className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{(metrics?.totalInteractions || 0).toLocaleString()}</div>
                    <p className="text-xs text-muted-foreground">User interactions</p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Overall Click Rate</CardTitle>
                    <MousePointer className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{metrics?.overallClickRate || 0}%</div>
                    <p className="text-xs text-muted-foreground">Average click rate</p>
                  </CardContent>
                </Card>
              </div>

              {/* Bottom Row - Security Metrics */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Emails Sent</CardTitle>
                    <Mail className="h-4 w-4 text-blue-500" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{(metrics?.totalEmailsSent || 0).toLocaleString()}</div>
                    <p className="text-xs text-muted-foreground">Phishing emails delivered</p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Reports Received</CardTitle>
                    <Shield className="h-4 w-4 text-green-500" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{(metrics?.totalReports || 0).toLocaleString()}</div>
                    <p className="text-xs text-muted-foreground">Users who reported phishing</p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Data Submitted</CardTitle>
                    <AlertTriangle className="h-4 w-4 text-red-500" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{(metrics?.totalSubmissions || 0).toLocaleString()}</div>
                    <p className="text-xs text-muted-foreground">Users who fell for phishing</p>
                  </CardContent>
                </Card>
              </div>
            </div>

            {/* Campaign Performance Chart - Full Width */}
            <Card className="w-full mb-6">
              <CardHeader>
                <CardTitle>Campaign Performance</CardTitle>
                <CardDescription>Link-based vs File-based phishing simulation performance over time</CardDescription>
              </CardHeader>
              <CardContent>
                {candlestickLoading ? (
                  <div className="flex items-center justify-center h-48">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
                  </div>
                ) : candlestickError ? (
                  <div className="text-center py-4 text-muted-foreground">
                    <p className="text-sm">Error loading performance data</p>
                  </div>
                ) : candlestickData.linkData.length === 0 && candlestickData.fileData.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <BarChart3 className="h-8 w-8 mx-auto mb-2 opacity-50" />
                    <p className="text-sm">No performance data yet</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                    {/* Link-based Phishing Candlestick Chart */}
                    <div>
                      <h4 className="text-sm font-medium mb-2 text-green-600">Link-based Phishing Performance</h4>
                      {candlestickData.linkData.length > 0 ? (
                        <CandlestickChart data={candlestickData.linkData} height={180} />
                      ) : (
                        <div className="h-[180px] flex items-center justify-center text-muted-foreground">
                          <div className="text-center">
                            <Link className="h-6 w-6 mx-auto mb-1 opacity-50" />
                            <p className="text-xs">No link campaigns</p>
                          </div>
                        </div>
                      )}
                    </div>
                    
                    {/* File-based Phishing Candlestick Chart */}
                    <div>
                      <h4 className="text-sm font-medium mb-2 text-red-600">File-based Phishing Performance</h4>
                      {candlestickData.fileData.length > 0 ? (
                        <CandlestickChart data={candlestickData.fileData} height={180} />
                      ) : (
                        <div className="h-[180px] flex items-center justify-center text-muted-foreground">
                          <div className="text-center">
                            <Paperclip className="h-6 w-6 mx-auto mb-1 opacity-50" />
                            <p className="text-xs">No file campaigns</p>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}
                <div className="flex items-center justify-center gap-6 mt-4 text-sm">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-green-500"></div>
                    <span>Link-based Phishing</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-red-500"></div>
                    <span>File-based Phishing</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-orange-500"></div>
                    <span>High Risk (Data Submitted)</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Bottom Grid - Device Analytics */}
            <div className="w-full">
             

              {/* Enhanced Device Distribution */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    📱 Device Usage Analytics
                  </CardTitle>
                  <CardDescription>Real-time device distribution from user interactions</CardDescription>
                </CardHeader>
                <CardContent>
                  {deviceLoading ? (
                    <div className="flex items-center justify-center h-48">
                      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
                    </div>
                  ) : deviceAnalytics && deviceAnalytics.deviceDistribution.length > 0 ? (
                    <>
                      <ResponsiveContainer width="100%" height={200}>
                        <PieChart>
                          <Pie
                            data={deviceAnalytics.deviceDistribution}
                            cx="50%"
                            cy="50%"
                            outerRadius={70}
                            innerRadius={30}
                            dataKey="value"
                            label={({ name, percentage }) => `${name} ${percentage}%`}
                            labelLine={false}
                          >
                            {deviceAnalytics.deviceDistribution.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={entry.fill} />
                            ))}
                          </Pie>
                          <Tooltip 
                            contentStyle={{ 
                              backgroundColor: 'hsl(var(--card))', 
                              border: '1px solid hsl(var(--border))',
                              borderRadius: '6px'
                            }}
                            formatter={(value: number, name: string) => [
                              `${value} interactions (${deviceAnalytics.deviceDistribution.find(d => d.name === name)?.percentage}%)`,
                              name
                            ]}
                          />
                        </PieChart>
                      </ResponsiveContainer>
                      
                      {/* Device Stats */}
                      <div className="mt-4 space-y-3">
                        <div className="grid grid-cols-3 gap-2 text-center">
                          <div className="p-2 bg-blue-50 dark:bg-blue-950/20 rounded-lg">
                            <div className="text-lg font-bold text-blue-600">{deviceAnalytics.desktopPercentage}%</div>
                            <div className="text-xs text-blue-700 dark:text-blue-400">Desktop</div>
                          </div>
                          <div className="p-2 bg-green-50 dark:bg-green-950/20 rounded-lg">
                            <div className="text-lg font-bold text-green-600">{deviceAnalytics.mobilePercentage}%</div>
                            <div className="text-xs text-green-700 dark:text-green-400">Mobile</div>
                          </div>
                          <div className="p-2 bg-purple-50 dark:bg-purple-950/20 rounded-lg">
                            <div className="text-lg font-bold text-purple-600">{deviceAnalytics.tabletPercentage}%</div>
                            <div className="text-xs text-purple-700 dark:text-purple-400">Tablet</div>
                          </div>
                        </div>
                        
                        <div className="text-center p-3 bg-muted/30 rounded-lg">
                          <div className="text-sm font-medium">Most Used Device</div>
                          <div className="text-lg font-bold text-primary">{deviceAnalytics.topDevice}</div>
                          <div className="text-xs text-muted-foreground">
                            {deviceAnalytics.totalDevices} total interactions analyzed
                          </div>
                        </div>
                      </div>
                    </>
                  ) : (
                    <div className="flex flex-col items-center justify-center h-48 text-center">
                      <div className="text-4xl mb-4">📱</div>
                      <h3 className="font-semibold text-lg mb-2">No Device Data Yet</h3>
                      <p className="text-muted-foreground text-sm">
                        Device analytics will appear here once users interact with your campaigns
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default Dashboard;
