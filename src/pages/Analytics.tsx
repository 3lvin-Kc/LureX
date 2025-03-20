
import React from 'react';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import GlassPanel from '@/components/ui/GlassPanel';
import AnimatedCard from '@/components/ui/AnimatedCard';
import { 
  PieChart, 
  BarChart, 
  LineChart,
  Users, 
  Calendar, 
  Download,
  Filter,
  ArrowUpRight,
  ArrowDownRight,
  Target,
  ShieldAlert,
  Mail
} from 'lucide-react';

const Analytics = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-grow pt-24">
        {/* Analytics Header */}
        <section className="py-8">
          <div className="max-w-7xl mx-auto px-6 md:px-10">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div>
                <h1 className="text-3xl md:text-4xl font-bold tracking-tight">
                  Analytics Dashboard
                </h1>
                <p className="text-gray-600 dark:text-gray-300 mt-2">
                  Monitor and analyze your phishing campaign performance
                </p>
              </div>
              <div className="flex gap-3">
                <Button variant="outline" className="flex items-center gap-2">
                  <Filter className="h-4 w-4" />
                  Filter
                </Button>
                <Button variant="outline" className="flex items-center gap-2">
                  <Download className="h-4 w-4" />
                  Export
                </Button>
              </div>
            </div>
            
            <div className="flex flex-wrap gap-4 mt-6">
              <Button variant="outline" size="sm" className="rounded-full">Last 7 Days</Button>
              <Button variant="outline" size="sm" className="rounded-full">Last 30 Days</Button>
              <Button variant="outline" size="sm" className="rounded-full">Last Quarter</Button>
              <Button variant="outline" size="sm" className="rounded-full">Year to Date</Button>
              <Button variant="outline" size="sm" className="rounded-full">Custom Range</Button>
            </div>
          </div>
        </section>
        
        {/* Key Metrics */}
        <section className="py-6">
          <div className="max-w-7xl mx-auto px-6 md:px-10">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {[
                {
                  title: "Email Open Rate",
                  value: "68.4%",
                  change: "+2.5%",
                  trend: "positive",
                  icon: Mail
                },
                {
                  title: "Click Rate",
                  value: "24.8%",
                  change: "-3.1%",
                  trend: "negative",
                  icon: Target
                },
                {
                  title: "Report Rate",
                  value: "12.3%",
                  change: "+5.7%",
                  trend: "positive",
                  icon: ShieldAlert
                },
                {
                  title: "Risk Score",
                  value: "42",
                  change: "-8",
                  trend: "positive",
                  icon: PieChart
                }
              ].map((metric, index) => (
                <AnimatedCard key={index} className="h-full">
                  <div className="p-6">
                    <div className="flex justify-between">
                      <div>
                        <h3 className="text-sm text-gray-500 dark:text-gray-400">{metric.title}</h3>
                        <div className="flex items-end gap-2 mt-1">
                          <p className="text-2xl font-bold">{metric.value}</p>
                          <div className={`flex items-center text-sm ${
                            metric.trend === 'positive' ? 'text-green-500' : 'text-red-500'
                          }`}>
                            {metric.trend === 'positive' ? (
                              <ArrowUpRight className="h-3 w-3" />
                            ) : (
                              <ArrowDownRight className="h-3 w-3" />
                            )}
                            <span>{metric.change}</span>
                          </div>
                        </div>
                      </div>
                      <div className="bg-gray-100 dark:bg-gray-800 p-2 rounded-md h-fit">
                        <metric.icon className="h-5 w-5 text-gray-600 dark:text-gray-400" />
                      </div>
                    </div>
                    
                    {/* Simple visualizer */}
                    <div className="mt-4 h-2 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-primary rounded-full" 
                        style={{ width: metric.value }}
                      ></div>
                    </div>
                  </div>
                </AnimatedCard>
              ))}
            </div>
          </div>
        </section>
        
        {/* Detailed Analytics */}
        <section className="py-6">
          <div className="max-w-7xl mx-auto px-6 md:px-10">
            <Tabs defaultValue="overview" className="w-full">
              <TabsList className="mb-6">
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="department">By Department</TabsTrigger>
                <TabsTrigger value="campaign">By Campaign</TabsTrigger>
                <TabsTrigger value="user">By User</TabsTrigger>
              </TabsList>
              
              <TabsContent value="overview" className="animate-fade-in">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Charts */}
                  <GlassPanel className="p-5 h-[300px]">
                    <div>
                      <h3 className="text-lg font-semibold mb-4">Campaign Performance Over Time</h3>
                      <div className="h-[240px] flex items-center justify-center bg-gray-50 dark:bg-gray-900/50 rounded-md">
                        <LineChart className="h-8 w-8 text-gray-400" />
                        <span className="ml-2 text-gray-500">Performance trend visualization</span>
                      </div>
                    </div>
                  </GlassPanel>
                  
                  <GlassPanel className="p-5 h-[300px]">
                    <div>
                      <h3 className="text-lg font-semibold mb-4">Click Rate by Template Type</h3>
                      <div className="h-[240px] flex items-center justify-center bg-gray-50 dark:bg-gray-900/50 rounded-md">
                        <BarChart className="h-8 w-8 text-gray-400" />
                        <span className="ml-2 text-gray-500">Template effectiveness visualization</span>
                      </div>
                    </div>
                  </GlassPanel>
                  
                  <GlassPanel className="p-5 h-[300px]">
                    <div>
                      <h3 className="text-lg font-semibold mb-4">User Response Distribution</h3>
                      <div className="h-[240px] flex items-center justify-center bg-gray-50 dark:bg-gray-900/50 rounded-md">
                        <PieChart className="h-8 w-8 text-gray-400" />
                        <span className="ml-2 text-gray-500">Response distribution visualization</span>
                      </div>
                    </div>
                  </GlassPanel>
                  
                  <GlassPanel className="p-5 h-[300px]">
                    <div>
                      <h3 className="text-lg font-semibold mb-4">Risk Score Trend</h3>
                      <div className="h-[240px] flex items-center justify-center bg-gray-50 dark:bg-gray-900/50 rounded-md">
                        <LineChart className="h-8 w-8 text-gray-400" />
                        <span className="ml-2 text-gray-500">Risk score trend visualization</span>
                      </div>
                    </div>
                  </GlassPanel>
                </div>
              </TabsContent>
              
              <TabsContent value="department" className="animate-fade-in">
                <GlassPanel className="p-5 mb-6">
                  <h3 className="text-lg font-semibold mb-4">Department Risk Assessment</h3>
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-800">
                      <thead>
                        <tr>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Department</th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">User Count</th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Avg. Open Rate</th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Avg. Click Rate</th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Risk Score</th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Trend</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200 dark:divide-gray-800">
                        {[
                          { 
                            department: "Finance", 
                            users: 48, 
                            openRate: "74.2%", 
                            clickRate: "32.1%", 
                            riskScore: 76,
                            trend: "negative"
                          },
                          { 
                            department: "IT", 
                            users: 64, 
                            openRate: "65.3%", 
                            clickRate: "8.7%", 
                            riskScore: 28,
                            trend: "positive"
                          },
                          { 
                            department: "HR", 
                            users: 32, 
                            openRate: "82.1%", 
                            clickRate: "27.4%", 
                            riskScore: 62,
                            trend: "negative"
                          },
                          { 
                            department: "Marketing", 
                            users: 45, 
                            openRate: "58.9%", 
                            clickRate: "21.3%", 
                            riskScore: 48,
                            trend: "neutral"
                          },
                          { 
                            department: "Sales", 
                            users: 76, 
                            openRate: "71.4%", 
                            clickRate: "29.8%", 
                            riskScore: 67,
                            trend: "negative"
                          },
                          { 
                            department: "Operations", 
                            users: 53, 
                            openRate: "66.7%", 
                            clickRate: "18.2%", 
                            riskScore: 42,
                            trend: "positive"
                          }
                        ].map((dept, index) => (
                          <tr key={index}>
                            <td className="px-4 py-3 whitespace-nowrap text-sm font-medium">{dept.department}</td>
                            <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-600 dark:text-gray-400">{dept.users}</td>
                            <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-600 dark:text-gray-400">{dept.openRate}</td>
                            <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-600 dark:text-gray-400">{dept.clickRate}</td>
                            <td className="px-4 py-3 whitespace-nowrap">
                              <div className={`text-sm font-medium px-2.5 py-0.5 rounded-full inline-flex items-center ${
                                dept.riskScore >= 70 ? "bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300" :
                                dept.riskScore >= 40 ? "bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-300" :
                                "bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300"
                              }`}>
                                {dept.riskScore}
                              </div>
                            </td>
                            <td className="px-4 py-3 whitespace-nowrap">
                              <div className={`text-sm flex items-center ${
                                dept.trend === 'positive' ? 'text-green-500' : 
                                dept.trend === 'negative' ? 'text-red-500' : 
                                'text-gray-500'
                              }`}>
                                {dept.trend === 'positive' ? (
                                  <ArrowUpRight className="h-4 w-4" />
                                ) : dept.trend === 'negative' ? (
                                  <ArrowDownRight className="h-4 w-4" />
                                ) : (
                                  <span className="h-4 w-4 flex items-center">—</span>
                                )}
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </GlassPanel>
                
                <div className="flex justify-end">
                  <Button>Download Department Report</Button>
                </div>
              </TabsContent>
              
              <TabsContent value="campaign" className="animate-fade-in">
                <div className="grid grid-cols-1 gap-4">
                  {[
                    {
                      name: "Password Reset Request",
                      startDate: "May 28, 2023",
                      endDate: "June 11, 2023",
                      recipients: 412,
                      openRate: "62.1%",
                      clickRate: "32.0%",
                      reportRate: "6.8%",
                      riskScore: 74
                    },
                    {
                      name: "IT Security Alert",
                      startDate: "June 2, 2023",
                      endDate: "June 9, 2023",
                      recipients: 325,
                      openRate: "54.8%",
                      clickRate: "26.5%",
                      reportRate: "3.7%",
                      riskScore: 68
                    },
                    {
                      name: "Urgent Message Alert",
                      startDate: "June 1, 2023",
                      endDate: "June 8, 2023",
                      recipients: 198,
                      openRate: "71.7%",
                      clickRate: "33.8%",
                      reportRate: "2.5%",
                      riskScore: 82
                    },
                    {
                      name: "HR Policy Update",
                      startDate: "May 5, 2023",
                      endDate: "May 12, 2023",
                      recipients: 412,
                      openRate: "94.4%",
                      clickRate: "52.9%",
                      reportRate: "7.5%",
                      riskScore: 96
                    }
                  ].map((campaign, index) => (
                    <GlassPanel key={index} className="p-5 rounded-lg">
                      <div className="flex flex-col lg:flex-row lg:items-center gap-4">
                        <div className="flex-grow">
                          <h3 className="text-lg font-semibold">{campaign.name}</h3>
                          <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 mt-1">
                            <Calendar className="h-4 w-4" />
                            <span>{campaign.startDate} - {campaign.endDate}</span>
                          </div>
                        </div>
                        
                        <div className="grid grid-cols-4 gap-4">
                          <div className="text-center">
                            <p className="text-xs text-gray-500 dark:text-gray-400">Recipients</p>
                            <p className="text-lg font-semibold">{campaign.recipients}</p>
                          </div>
                          <div className="text-center">
                            <p className="text-xs text-gray-500 dark:text-gray-400">Opened</p>
                            <p className="text-lg font-semibold">{campaign.openRate}</p>
                          </div>
                          <div className="text-center">
                            <p className="text-xs text-gray-500 dark:text-gray-400">Clicked</p>
                            <p className="text-lg font-semibold text-red-600 dark:text-red-400">{campaign.clickRate}</p>
                          </div>
                          <div className="text-center">
                            <p className="text-xs text-gray-500 dark:text-gray-400">Reported</p>
                            <p className="text-lg font-semibold text-green-600 dark:text-green-400">{campaign.reportRate}</p>
                          </div>
                        </div>
                        
                        <div className="flex flex-col items-center">
                          <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Risk Score</p>
                          <div className={`flex items-center justify-center w-12 h-12 rounded-full text-white ${
                            campaign.riskScore >= 80 ? "bg-red-500" :
                            campaign.riskScore >= 60 ? "bg-orange-500" :
                            campaign.riskScore >= 40 ? "bg-yellow-500" :
                            "bg-green-500"
                          }`}>
                            <span className="font-bold">{campaign.riskScore}</span>
                          </div>
                        </div>
                        
                        <Button variant="outline" size="sm">View Details</Button>
                      </div>
                    </GlassPanel>
                  ))}
                </div>
              </TabsContent>
              
              <TabsContent value="user" className="animate-fade-in">
                <GlassPanel className="p-5 mb-6">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-semibold">High-Risk Users</h3>
                    <div className="relative w-64">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <input 
                        type="text" 
                        placeholder="Search users..." 
                        className="pl-10 pr-4 py-2 w-full rounded-md border border-gray-300 dark:border-gray-700 bg-background focus:outline-none focus:ring-2 focus:ring-primary"
                      />
                    </div>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-800">
                      <thead>
                        <tr>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">User</th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Department</th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Campaigns</th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Click Rate</th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Risk Score</th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Training</th>
                          <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200 dark:divide-gray-800">
                        {[
                          { 
                            name: "James Wilson", 
                            email: "james.wilson@example.com",
                            department: "Finance", 
                            campaigns: 8, 
                            clickRate: "62.5%", 
                            riskScore: 94,
                            training: "Incomplete"
                          },
                          { 
                            name: "Emily Johnson", 
                            email: "emily.johnson@example.com",
                            department: "HR", 
                            campaigns: 6, 
                            clickRate: "50.0%", 
                            riskScore: 86,
                            training: "In Progress"
                          },
                          { 
                            name: "Michael Rodriguez", 
                            email: "michael.r@example.com",
                            department: "Sales", 
                            campaigns: 7, 
                            clickRate: "57.1%", 
                            riskScore: 82,
                            training: "Not Started"
                          },
                          { 
                            name: "Sarah Thompson", 
                            email: "s.thompson@example.com",
                            department: "Marketing", 
                            campaigns: 5, 
                            clickRate: "40.0%", 
                            riskScore: 78,
                            training: "In Progress"
                          }
                        ].map((user, index) => (
                          <tr key={index}>
                            <td className="px-4 py-3 whitespace-nowrap">
                              <div>
                                <div className="font-medium">{user.name}</div>
                                <div className="text-sm text-gray-500 dark:text-gray-400">{user.email}</div>
                              </div>
                            </td>
                            <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-600 dark:text-gray-400">{user.department}</td>
                            <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-600 dark:text-gray-400">{user.campaigns}</td>
                            <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-red-600 dark:text-red-400">{user.clickRate}</td>
                            <td className="px-4 py-3 whitespace-nowrap">
                              <div className={`text-sm font-medium px-2.5 py-0.5 rounded-full inline-flex items-center ${
                                user.riskScore >= 80 ? "bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300" :
                                user.riskScore >= 60 ? "bg-orange-100 dark:bg-orange-900/30 text-orange-800 dark:text-orange-300" :
                                user.riskScore >= 40 ? "bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-300" :
                                "bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300"
                              }`}>
                                {user.riskScore}
                              </div>
                            </td>
                            <td className="px-4 py-3 whitespace-nowrap">
                              <div className={`text-sm font-medium px-2.5 py-0.5 rounded-full inline-flex items-center ${
                                user.training === 'Not Started' ? "bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300" :
                                user.training === 'In Progress' ? "bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-300" :
                                user.training === 'Incomplete' ? "bg-orange-100 dark:bg-orange-900/30 text-orange-800 dark:text-orange-300" :
                                "bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300"
                              }`}>
                                {user.training}
                              </div>
                            </td>
                            <td className="px-4 py-3 whitespace-nowrap text-right">
                              <Button variant="ghost" size="sm">Assign Training</Button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </GlassPanel>
              </TabsContent>
            </Tabs>
          </div>
        </section>
        
        {/* Report Generation */}
        <section className="py-8 bg-gray-50 dark:bg-gray-900/50">
          <div className="max-w-7xl mx-auto px-6 md:px-10">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2">
                <h2 className="text-2xl font-bold mb-6">Generate Custom Reports</h2>
                <p className="text-gray-600 dark:text-gray-300 mb-8">
                  Create detailed custom reports for specific time periods, departments, campaigns, or users.
                  Export in multiple formats for presentations, compliance documentation, or internal reviews.
                </p>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Button variant="outline" className="p-6 h-auto flex flex-col items-center justify-center gap-4 border border-gray-200 dark:border-gray-800">
                    <div className="bg-blue-100 dark:bg-blue-900/30 p-3 rounded-full">
                      <PieChart className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                    </div>
                    <div className="text-center">
                      <h3 className="font-semibold mb-1">Executive Summary</h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        High-level overview with key metrics and trends
                      </p>
                    </div>
                  </Button>
                  
                  <Button variant="outline" className="p-6 h-auto flex flex-col items-center justify-center gap-4 border border-gray-200 dark:border-gray-800">
                    <div className="bg-purple-100 dark:bg-purple-900/30 p-3 rounded-full">
                      <BarChart className="h-6 w-6 text-purple-600 dark:text-purple-400" />
                    </div>
                    <div className="text-center">
                      <h3 className="font-semibold mb-1">Detailed Campaign Report</h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        In-depth analysis of specific campaign performance
                      </p>
                    </div>
                  </Button>
                  
                  <Button variant="outline" className="p-6 h-auto flex flex-col items-center justify-center gap-4 border border-gray-200 dark:border-gray-800">
                    <div className="bg-green-100 dark:bg-green-900/30 p-3 rounded-full">
                      <Users className="h-6 w-6 text-green-600 dark:text-green-400" />
                    </div>
                    <div className="text-center">
                      <h3 className="font-semibold mb-1">Department Risk Report</h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        Risk assessment by department with recommendations
                      </p>
                    </div>
                  </Button>
                  
                  <Button variant="outline" className="p-6 h-auto flex flex-col items-center justify-center gap-4 border border-gray-200 dark:border-gray-800">
                    <div className="bg-yellow-100 dark:bg-yellow-900/30 p-3 rounded-full">
                      <LineChart className="h-6 w-6 text-yellow-600 dark:text-yellow-400" />
                    </div>
                    <div className="text-center">
                      <h3 className="font-semibold mb-1">Training Effectiveness</h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        Measure impact of training on security awareness
                      </p>
                    </div>
                  </Button>
                </div>
              </div>
              
              <div>
                <GlassPanel className="p-6 h-full">
                  <h3 className="text-lg font-semibold mb-4">Schedule Reports</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">
                    Set up automated report delivery to stakeholders on your preferred schedule.
                  </p>
                  
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium mb-1">Report Type</label>
                      <select className="w-full rounded-md border border-gray-300 dark:border-gray-700 bg-background p-2 focus:outline-none focus:ring-2 focus:ring-primary">
                        <option>Executive Summary</option>
                        <option>Detailed Campaign Report</option>
                        <option>Department Risk Report</option>
                        <option>Training Effectiveness</option>
                      </select>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium mb-1">Frequency</label>
                      <select className="w-full rounded-md border border-gray-300 dark:border-gray-700 bg-background p-2 focus:outline-none focus:ring-2 focus:ring-primary">
                        <option>Weekly</option>
                        <option>Bi-weekly</option>
                        <option>Monthly</option>
                        <option>Quarterly</option>
                      </select>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium mb-1">Recipients</label>
                      <input 
                        type="text" 
                        placeholder="Enter email addresses..." 
                        className="w-full rounded-md border border-gray-300 dark:border-gray-700 bg-background p-2 focus:outline-none focus:ring-2 focus:ring-primary"
                      />
                    </div>
                    
                    <Button className="w-full">Schedule Report</Button>
                  </div>
                </GlassPanel>
              </div>
            </div>
          </div>
        </section>
      </main>
      
      <Footer />
    </div>
  );
};

export default Analytics;
