
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from 'recharts';
import { advancedAnalyticsService, AnalyticsMetrics } from '@/utils/advancedAnalytics';
import { TrendingUp, Globe, Clock, Users, Activity } from 'lucide-react';

interface AdvancedAnalyticsDashboardProps {
  campaignId: string;
}

const AdvancedAnalyticsDashboard: React.FC<AdvancedAnalyticsDashboardProps> = ({ campaignId }) => {
  const [analytics, setAnalytics] = useState<AnalyticsMetrics | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        setLoading(true);
        const data = await advancedAnalyticsService.getCampaignAnalytics(campaignId);
        setAnalytics(data);
      } catch (error) {
        console.error('Failed to fetch analytics:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchAnalytics();
  }, [campaignId]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (!analytics) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        Failed to load analytics data
      </div>
    );
  }

  const pieColors = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

  return (
    <div className="space-y-6">
      {/* Key Metrics Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Delivery Rate</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics.deliveryRate}%</div>
            <Progress value={analytics.deliveryRate} className="mt-2" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Open Rate</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics.openRate}%</div>
            <Progress value={analytics.openRate} className="mt-2" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Click Rate</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics.clickRate}%</div>
            <Progress value={analytics.clickRate} className="mt-2" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Submit Rate</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics.submitRate}%</div>
            <Progress value={analytics.submitRate} className="mt-2" />
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="trends" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="trends">Trends</TabsTrigger>
          <TabsTrigger value="geography">Geography</TabsTrigger>
          <TabsTrigger value="behavior">Behavior</TabsTrigger>
          <TabsTrigger value="devices">Devices</TabsTrigger>
        </TabsList>

        <TabsContent value="trends" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Daily Activity Trends</CardTitle>
              <CardDescription>Campaign performance over time</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <LineChart data={analytics.dailyMetrics}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Line type="monotone" dataKey="sent" stroke="#8884d8" name="Sent" />
                  <Line type="monotone" dataKey="opened" stroke="#82ca9d" name="Opened" />
                  <Line type="monotone" dataKey="clicked" stroke="#ffc658" name="Clicked" />
                  <Line type="monotone" dataKey="submitted" stroke="#ff7300" name="Submitted" />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {analytics.timeToFirstClick && (
            <Card>
              <CardHeader>
                <CardTitle>Time to First Click</CardTitle>
                <CardDescription>Average time between email sent and first click</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{analytics.timeToFirstClick} minutes</div>
              </CardContent>
            </Card>
          )}

          {analytics.peakActivityHours.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Peak Activity Hours</CardTitle>
                <CardDescription>Hours with highest engagement</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex gap-2">
                  {analytics.peakActivityHours.map((hour) => (
                    <Badge key={hour} variant="secondary">
                      {hour}:00
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="geography" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Globe className="h-5 w-5" />
                  Top Countries
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {analytics.topCountries.map((country, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <span className="text-sm font-medium">{country.country}</span>
                      <div className="flex items-center gap-2">
                        <Progress value={country.percentage} className="w-20" />
                        <span className="text-xs text-muted-foreground">{country.percentage}%</span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Top Regions</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {analytics.topRegions.map((region, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <span className="text-sm font-medium">{region.region}</span>
                      <div className="flex items-center gap-2">
                        <Progress value={region.percentage} className="w-20" />
                        <span className="text-xs text-muted-foreground">{region.percentage}%</span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="behavior" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Conversion Funnel</CardTitle>
              <CardDescription>Step-by-step user journey</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart
                  data={[
                    { name: 'Sent', value: analytics.emailsSent, color: '#8884d8' },
                    { name: 'Delivered', value: analytics.emailsDelivered, color: '#82ca9d' },
                    { name: 'Opened', value: analytics.emailsOpened, color: '#ffc658' },
                    { name: 'Clicked', value: analytics.emailsClicked, color: '#ff7300' },
                    { name: 'Submitted', value: analytics.dataSubmitted, color: '#d84315' },
                  ]}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="value" fill="#8884d8" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Report Rate</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">{analytics.reportRate}%</div>
                <p className="text-xs text-muted-foreground">Users who reported the email</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Engagement Score</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {Math.round((analytics.openRate + analytics.clickRate) / 2)}%
                </div>
                <p className="text-xs text-muted-foreground">Combined open + click rate</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Risk Level</CardTitle>
              </CardHeader>
              <CardContent>
                <Badge variant={analytics.submitRate > 10 ? "destructive" : analytics.submitRate > 5 ? "default" : "secondary"}>
                  {analytics.submitRate > 10 ? "High" : analytics.submitRate > 5 ? "Medium" : "Low"}
                </Badge>
                <p className="text-xs text-muted-foreground mt-1">Based on submit rate</p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="devices" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Browser Distribution</CardTitle>
              <CardDescription>Most common browsers used</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <ResponsiveContainer width="100%" height={250}>
                  <PieChart>
                    <Pie
                      data={analytics.topUserAgents}
                      cx="50%"
                      cy="50%"
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="count"
                      label
                    >
                      {analytics.topUserAgents.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={pieColors[index % pieColors.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
                <div className="space-y-2">
                  {analytics.topUserAgents.map((browser, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div 
                          className="w-3 h-3 rounded-full"
                          style={{ backgroundColor: pieColors[index % pieColors.length] }}
                        />
                        <span className="text-sm">{browser.userAgent}</span>
                      </div>
                      <span className="text-sm font-medium">{browser.percentage}%</span>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AdvancedAnalyticsDashboard;
