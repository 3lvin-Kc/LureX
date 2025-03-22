
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import GlassPanel from '@/components/ui/GlassPanel';
import AnimatedCard from '@/components/ui/AnimatedCard';
import { 
  PlusCircle, 
  Calendar, 
  Users, 
  BarChart, 
  Mail, 
  MessageSquare, 
  Play, 
  Pause, 
  Trash2,
  Clock,
  AlertCircle
} from 'lucide-react';
import DashboardLayout from '@/components/dashboard/DashboardLayout';

const Dashboard = () => {
  const navigate = useNavigate();

  return (
    <DashboardLayout>
      <main className="flex-grow pt-6">
        {/* Dashboard Header */}
        <section className="py-8">
          <div className="max-w-7xl mx-auto px-6 md:px-10">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div>
                <h1 className="text-3xl md:text-4xl font-bold tracking-tight">
                  Campaign Dashboard
                </h1>
                <p className="text-gray-600 dark:text-gray-300 mt-2">
                  Manage and monitor your phishing simulation campaigns
                </p>
              </div>
              <Button 
                className="flex items-center gap-2"
                onClick={() => navigate('/campaign/new')}
              >
                <PlusCircle className="h-4 w-4" />
                Create Campaign
              </Button>
            </div>
          </div>
        </section>
        
        {/* Campaign Stats Overview */}
        <section className="py-6">
          <div className="max-w-7xl mx-auto px-6 md:px-10">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {[
                {
                  title: "Active Campaigns",
                  value: "4",
                  icon: Play,
                  trend: "+1 this week",
                  color: "text-green-500"
                },
                {
                  title: "Total Recipients",
                  value: "1,248",
                  icon: Users,
                  trend: "+86 this month",
                  color: "text-blue-500"
                },
                {
                  title: "Click Rate",
                  value: "24.8%",
                  icon: BarChart,
                  trend: "-2.1% vs last month",
                  color: "text-yellow-500"
                },
                {
                  title: "Scheduled Campaigns",
                  value: "6",
                  icon: Calendar,
                  trend: "Next on June 15",
                  color: "text-purple-500"
                }
              ].map((stat, index) => (
                <AnimatedCard key={index} className="h-full">
                  <div className="p-6 flex items-start gap-4">
                    <div className={`rounded-full p-3 ${stat.color} bg-opacity-10 dark:bg-opacity-20`}>
                      <stat.icon className={`h-5 w-5 ${stat.color}`} />
                    </div>
                    <div>
                      <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">
                        {stat.title}
                      </h3>
                      <p className="text-2xl font-bold mt-1">{stat.value}</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                        {stat.trend}
                      </p>
                    </div>
                  </div>
                </AnimatedCard>
              ))}
            </div>
          </div>
        </section>
        
        {/* Active and Recent Campaigns */}
        <section className="py-6">
          <div className="max-w-7xl mx-auto px-6 md:px-10">
            <Tabs defaultValue="active" className="w-full">
              <TabsList className="mb-6">
                <TabsTrigger value="active">Active Campaigns</TabsTrigger>
                <TabsTrigger value="scheduled">Scheduled</TabsTrigger>
                <TabsTrigger value="completed">Completed</TabsTrigger>
                <TabsTrigger value="draft">Drafts</TabsTrigger>
              </TabsList>
              
              <TabsContent value="active" className="animate-fade-in">
                <div className="grid grid-cols-1 gap-4">
                  {[
                    {
                      name: "IT Security Alert",
                      type: "Email",
                      status: "Running",
                      recipients: 325,
                      opened: 178,
                      clicked: 86,
                      reported: 12,
                      startDate: "June 2, 2023",
                      endDate: "June 9, 2023"
                    },
                    {
                      name: "Password Reset Request",
                      type: "Email",
                      status: "Running",
                      recipients: 412,
                      opened: 256,
                      clicked: 132,
                      reported: 28,
                      startDate: "May 28, 2023",
                      endDate: "June 11, 2023"
                    },
                    {
                      name: "Urgent Message Alert",
                      type: "SMS",
                      status: "Running",
                      recipients: 198,
                      opened: 142,
                      clicked: 67,
                      reported: 5,
                      startDate: "June 1, 2023",
                      endDate: "June 8, 2023"
                    },
                    {
                      name: "Executive Request",
                      type: "Email",
                      status: "Running",
                      recipients: 45,
                      opened: 38,
                      clicked: 14,
                      reported: 3,
                      startDate: "June 5, 2023",
                      endDate: "June 12, 2023"
                    }
                  ].map((campaign, index) => (
                    <GlassPanel key={index} className="p-5 rounded-lg">
                      <div className="flex flex-col lg:flex-row lg:items-center gap-4">
                        <div className="flex-grow">
                          <div className="flex items-center gap-2">
                            <h3 className="text-lg font-semibold">{campaign.name}</h3>
                            <span className="text-xs px-2 py-0.5 bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300 rounded-full">
                              {campaign.status}
                            </span>
                          </div>
                          
                          <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-gray-600 dark:text-gray-400 mt-1">
                            <div className="flex items-center gap-1">
                              {campaign.type === "Email" ? 
                                <Mail className="h-4 w-4" /> : 
                                <MessageSquare className="h-4 w-4" />
                              }
                              <span>{campaign.type}</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <Users className="h-4 w-4" />
                              <span>{campaign.recipients} recipients</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <Clock className="h-4 w-4" />
                              <span>{campaign.startDate} - {campaign.endDate}</span>
                            </div>
                          </div>
                        </div>
                        
                        <div className="flex flex-wrap gap-3 mt-2 lg:mt-0">
                          <div className="px-3 py-1.5 bg-gray-100 dark:bg-gray-800 rounded-md text-center min-w-[70px]">
                            <p className="text-sm font-bold">{campaign.opened}</p>
                            <p className="text-xs text-gray-600 dark:text-gray-400">Opened</p>
                          </div>
                          <div className="px-3 py-1.5 bg-red-100 dark:bg-red-900/20 rounded-md text-center min-w-[70px]">
                            <p className="text-sm font-bold text-red-700 dark:text-red-400">{campaign.clicked}</p>
                            <p className="text-xs text-gray-600 dark:text-gray-400">Clicked</p>
                          </div>
                          <div className="px-3 py-1.5 bg-green-100 dark:bg-green-900/20 rounded-md text-center min-w-[70px]">
                            <p className="text-sm font-bold text-green-700 dark:text-green-400">{campaign.reported}</p>
                            <p className="text-xs text-gray-600 dark:text-gray-400">Reported</p>
                          </div>
                        </div>
                        
                        <div className="flex gap-2">
                          <Button variant="outline" size="sm" onClick={() => navigate(`/campaign/${index+1}`)}>View</Button>
                          <Button variant="outline" size="icon" className="h-8 w-8">
                            <Pause className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </GlassPanel>
                  ))}
                </div>
              </TabsContent>
              
              <TabsContent value="scheduled" className="animate-fade-in">
                <div className="grid grid-cols-1 gap-4">
                  {[
                    {
                      name: "Invoice Payment Request",
                      type: "Email",
                      status: "Scheduled",
                      recipients: 278,
                      startDate: "June 15, 2023",
                      endDate: "June 22, 2023"
                    },
                    {
                      name: "Account Verification",
                      type: "SMS",
                      status: "Scheduled",
                      recipients: 156,
                      startDate: "June 18, 2023",
                      endDate: "June 25, 2023"
                    }
                  ].map((campaign, index) => (
                    <GlassPanel key={index} className="p-5 rounded-lg">
                      <div className="flex flex-col lg:flex-row lg:items-center gap-4">
                        <div className="flex-grow">
                          <div className="flex items-center gap-2">
                            <h3 className="text-lg font-semibold">{campaign.name}</h3>
                            <span className="text-xs px-2 py-0.5 bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-300 rounded-full">
                              {campaign.status}
                            </span>
                          </div>
                          
                          <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-gray-600 dark:text-gray-400 mt-1">
                            <div className="flex items-center gap-1">
                              {campaign.type === "Email" ? 
                                <Mail className="h-4 w-4" /> : 
                                <MessageSquare className="h-4 w-4" />
                              }
                              <span>{campaign.type}</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <Users className="h-4 w-4" />
                              <span>{campaign.recipients} recipients</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <Calendar className="h-4 w-4" />
                              <span>{campaign.startDate} - {campaign.endDate}</span>
                            </div>
                          </div>
                        </div>
                        
                        <div className="flex gap-2">
                          <Button variant="outline" size="sm" onClick={() => navigate(`/campaign/edit/${index+5}`)}>Edit</Button>
                          <Button variant="outline" size="icon" className="h-8 w-8 text-red-500">
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </GlassPanel>
                  ))}
                </div>
              </TabsContent>
              
              <TabsContent value="completed" className="animate-fade-in">
                <div className="grid grid-cols-1 gap-4">
                  {[
                    {
                      name: "Document Share Request",
                      type: "Email",
                      status: "Completed",
                      recipients: 387,
                      opened: 342,
                      clicked: 156,
                      reported: 42,
                      startDate: "May 10, 2023",
                      endDate: "May 17, 2023"
                    },
                    {
                      name: "HR Policy Update",
                      type: "Email",
                      status: "Completed",
                      recipients: 412,
                      opened: 389,
                      clicked: 218,
                      reported: 31,
                      startDate: "May 5, 2023",
                      endDate: "May 12, 2023"
                    }
                  ].map((campaign, index) => (
                    <GlassPanel key={index} className="p-5 rounded-lg">
                      <div className="flex flex-col lg:flex-row lg:items-center gap-4">
                        <div className="flex-grow">
                          <div className="flex items-center gap-2">
                            <h3 className="text-lg font-semibold">{campaign.name}</h3>
                            <span className="text-xs px-2 py-0.5 bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-300 rounded-full">
                              {campaign.status}
                            </span>
                          </div>
                          
                          <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-gray-600 dark:text-gray-400 mt-1">
                            <div className="flex items-center gap-1">
                              <Mail className="h-4 w-4" />
                              <span>{campaign.type}</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <Users className="h-4 w-4" />
                              <span>{campaign.recipients} recipients</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <Calendar className="h-4 w-4" />
                              <span>{campaign.startDate} - {campaign.endDate}</span>
                            </div>
                          </div>
                        </div>
                        
                        <div className="flex flex-wrap gap-3 mt-2 lg:mt-0">
                          <div className="px-3 py-1.5 bg-gray-100 dark:bg-gray-800 rounded-md text-center min-w-[70px]">
                            <p className="text-sm font-bold">{campaign.opened}</p>
                            <p className="text-xs text-gray-600 dark:text-gray-400">Opened</p>
                          </div>
                          <div className="px-3 py-1.5 bg-red-100 dark:bg-red-900/20 rounded-md text-center min-w-[70px]">
                            <p className="text-sm font-bold text-red-700 dark:text-red-400">{campaign.clicked}</p>
                            <p className="text-xs text-gray-600 dark:text-gray-400">Clicked</p>
                          </div>
                          <div className="px-3 py-1.5 bg-green-100 dark:bg-green-900/20 rounded-md text-center min-w-[70px]">
                            <p className="text-sm font-bold text-green-700 dark:text-green-400">{campaign.reported}</p>
                            <p className="text-xs text-gray-600 dark:text-gray-400">Reported</p>
                          </div>
                        </div>
                        
                        <div className="flex gap-2">
                          <Button variant="outline" size="sm" onClick={() => navigate(`/reports/${index+7}`)}>Report</Button>
                          <Button variant="outline" size="sm" onClick={() => navigate(`/campaign/clone/${index+7}`)}>Clone</Button>
                        </div>
                      </div>
                    </GlassPanel>
                  ))}
                </div>
              </TabsContent>
              
              <TabsContent value="draft" className="animate-fade-in">
                <div className="grid grid-cols-1 gap-4">
                  {[
                    {
                      name: "Social Media Alert",
                      type: "Email",
                      status: "Draft",
                      lastEdited: "June 1, 2023"
                    },
                    {
                      name: "Package Delivery",
                      type: "SMS",
                      status: "Draft",
                      lastEdited: "May 28, 2023"
                    }
                  ].map((campaign, index) => (
                    <GlassPanel key={index} className="p-5 rounded-lg">
                      <div className="flex flex-col lg:flex-row lg:items-center gap-4">
                        <div className="flex-grow">
                          <div className="flex items-center gap-2">
                            <h3 className="text-lg font-semibold">{campaign.name}</h3>
                            <span className="text-xs px-2 py-0.5 bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-300 rounded-full">
                              {campaign.status}
                            </span>
                          </div>
                          
                          <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-gray-600 dark:text-gray-400 mt-1">
                            <div className="flex items-center gap-1">
                              {campaign.type === "Email" ? 
                                <Mail className="h-4 w-4" /> : 
                                <MessageSquare className="h-4 w-4" />
                              }
                              <span>{campaign.type}</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <Clock className="h-4 w-4" />
                              <span>Last edited on {campaign.lastEdited}</span>
                            </div>
                          </div>
                        </div>
                        
                        <div className="flex gap-2">
                          <Button variant="outline" size="sm" onClick={() => navigate(`/campaign/edit/${index+9}`)}>Edit</Button>
                          <Button size="sm" onClick={() => navigate(`/campaign/finalize/${index+9}`)}>Finalize</Button>
                        </div>
                      </div>
                    </GlassPanel>
                  ))}
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </section>
        
        {/* Recent Activity & Alerts */}
        <section className="py-6">
          <div className="max-w-7xl mx-auto px-6 md:px-10">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2">
                <h2 className="text-xl font-semibold mb-4">Recent Activity</h2>
                <AnimatedCard className="p-5">
                  <div className="space-y-4">
                    {[
                      {
                        action: "Campaign Started",
                        description: "Executive Request campaign started",
                        time: "2 hours ago"
                      },
                      {
                        action: "High Click Rate",
                        description: "Password Reset Request reached 25% click rate",
                        time: "Yesterday"
                      },
                      {
                        action: "Campaign Completed",
                        description: "HR Policy Update campaign completed",
                        time: "3 days ago"
                      },
                      {
                        action: "New Template Added",
                        description: "Added 'Account Security Alert' template to library",
                        time: "4 days ago"
                      },
                      {
                        action: "Campaign Scheduled",
                        description: "Invoice Payment Request scheduled for June 15",
                        time: "5 days ago"
                      }
                    ].map((activity, index) => (
                      <div key={index} className="flex items-start gap-3 pb-3 border-b last:border-0 last:pb-0">
                        <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center flex-shrink-0">
                          <Calendar className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                        </div>
                        <div className="flex-grow">
                          <p className="font-medium">{activity.action}</p>
                          <p className="text-sm text-gray-600 dark:text-gray-400">{activity.description}</p>
                          <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">{activity.time}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </AnimatedCard>
              </div>
              
              <div>
                <h2 className="text-xl font-semibold mb-4">Alerts</h2>
                <AnimatedCard className="p-5">
                  <div className="space-y-4">
                    {[
                      {
                        title: "High Risk Detection",
                        description: "Finance department shows 48% click rate on recent campaigns",
                        severity: "High",
                        color: "bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400"
                      },
                      {
                        title: "Campaign Ending Soon",
                        description: "Password Reset Request campaign ends in 2 days",
                        severity: "Medium",
                        color: "bg-yellow-100 dark:bg-yellow-900/30 text-yellow-600 dark:text-yellow-400"
                      },
                      {
                        title: "Scheduled Maintenance",
                        description: "System maintenance scheduled for June 12, 11:00 PM",
                        severity: "Low",
                        color: "bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400"
                      }
                    ].map((alert, index) => (
                      <div key={index} className="flex items-start gap-3 pb-3 border-b last:border-0 last:pb-0">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${alert.color}`}>
                          <AlertCircle className="h-4 w-4" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <p className="font-medium">{alert.title}</p>
                            <span className={`text-xs px-1.5 py-0.5 rounded-full ${
                              alert.severity === "High" ? "bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300" :
                              alert.severity === "Medium" ? "bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-300" :
                              "bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300"
                            }`}>
                              {alert.severity}
                            </span>
                          </div>
                          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{alert.description}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </AnimatedCard>
              </div>
            </div>
          </div>
        </section>
      </main>
    </DashboardLayout>
  );
};

export default Dashboard;
