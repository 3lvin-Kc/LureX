import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { 
  X, 
  Building, 
  Users, 
  AlertTriangle, 
  Shield, 
  Clock, 
  Smartphone, 
  Monitor, 
  Tablet,
  Search,
  TrendingUp,
  TrendingDown,
  Link,
  File,
  Target,
  Lightbulb
} from 'lucide-react';
import { DepartmentCard, VulnerableUser } from '@/hooks/useDepartmentVulnerability';

interface DepartmentDetailsSidebarProps {
  department: DepartmentCard | null;
  isOpen: boolean;
  onClose: () => void;
}

const DepartmentDetailsSidebar: React.FC<DepartmentDetailsSidebarProps> = ({
  department,
  isOpen,
  onClose
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('riskLevel');
  const [filterBy, setFilterBy] = useState('all');

  if (!department) return null;

  const getRiskBadgeVariant = (riskLevel: 'high' | 'medium' | 'low') => {
    switch (riskLevel) {
      case 'high': return 'destructive';
      case 'medium': return 'secondary';
      case 'low': return 'outline';
      default: return 'outline';
    }
  };

  const getDeviceIcon = (deviceType: 'desktop' | 'mobile' | 'tablet') => {
    switch (deviceType) {
      case 'desktop': return <Monitor className="h-4 w-4" />;
      case 'mobile': return <Smartphone className="h-4 w-4" />;
      case 'tablet': return <Tablet className="h-4 w-4" />;
      default: return <Monitor className="h-4 w-4" />;
    }
  };

  const getSimulationIcon = (simulationType: 'link' | 'file') => {
    return simulationType === 'link' ? 
      <Link className="h-4 w-4 text-blue-500" /> : 
      <File className="h-4 w-4 text-purple-500" />;
  };

  const formatTimeToClick = (seconds: number): string => {
    if (seconds < 60) return `${seconds}s`;
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}m ${remainingSeconds}s`;
  };

  const getFailureTypeDisplay = (failureType: string): string => {
    switch (failureType) {
      case 'clicked_link': return 'Clicked Malicious Link';
      case 'submitted_credentials': return 'Submitted Credentials';
      case 'downloaded_file': return 'Downloaded Malicious File';
      case 'opened_file': return 'Opened Malicious File';
      default: return failureType;
    }
  };

  // Filter and sort users
  const filteredUsers = department.vulnerableUsers
    .filter(user => {
      const matchesSearch = searchTerm === '' || 
        user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.position.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesFilter = filterBy === 'all' || 
        (filterBy === 'high' && user.riskLevel === 'high') ||
        (filterBy === 'medium' && user.riskLevel === 'medium') ||
        (filterBy === 'low' && user.riskLevel === 'low') ||
        (filterBy === 'repeat' && user.repeatOffender) ||
        (filterBy === 'link' && user.simulationType === 'link') ||
        (filterBy === 'file' && user.simulationType === 'file');
      
      return matchesSearch && matchesFilter;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'riskLevel':
          const riskOrder = { high: 3, medium: 2, low: 1 };
          return riskOrder[b.riskLevel] - riskOrder[a.riskLevel];
        case 'timeToClick':
          return a.timeToClick - b.timeToClick;
        case 'name':
          return a.firstName.localeCompare(b.firstName);
        case 'failureDate':
          return new Date(b.failureDate).getTime() - new Date(a.failureDate).getTime();
        default:
          return 0;
      }
    });

  return (
    <div className={`fixed inset-y-0 right-0 z-50 w-full max-w-2xl bg-background border-l border-border shadow-2xl transform transition-transform duration-300 ease-in-out ${
      isOpen ? 'translate-x-0' : 'translate-x-full'
    }`}>
      <div className="flex flex-col h-full overflow-hidden">
        {/* Header */}
        <div className="flex-shrink-0 p-6 border-b border-border bg-gradient-to-r from-red-50 to-orange-50 dark:from-red-950/20 dark:to-orange-950/20">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <div className="text-2xl">{department.icon}</div>
                <h2 className="text-2xl font-bold text-foreground">{department.name}</h2>
                <Badge variant={getRiskBadgeVariant(department.riskLevel)} className="text-sm">
                  {department.riskLevel.toUpperCase()} RISK
                </Badge>
              </div>
              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                <div className="flex items-center gap-1">
                  <AlertTriangle className="h-4 w-4 text-red-500" />
                  <span className="font-medium text-red-600">{department.vulnerabilityPercentage}% Vulnerable</span>
                </div>
                <div className="flex items-center gap-1">
                  <Users className="h-4 w-4" />
                  <span>{department.failedUsers} of {department.totalUsers} users failed</span>
                </div>
              </div>
            </div>
            <Button variant="ghost" size="sm" onClick={onClose} className="ml-4">
              <X className="h-5 w-5" />
            </Button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Quick Stats */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">📊 Department Overview</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center p-3 bg-blue-50 dark:bg-blue-950/20 rounded-lg">
                  <div className="text-xl font-bold text-blue-600">{department.stats.linkVulnerability}%</div>
                  <div className="text-sm text-blue-700 dark:text-blue-400">Link Vulnerability</div>
                </div>
                <div className="text-center p-3 bg-purple-50 dark:bg-purple-950/20 rounded-lg">
                  <div className="text-xl font-bold text-purple-600">{department.stats.fileVulnerability}%</div>
                  <div className="text-sm text-purple-700 dark:text-purple-400">File Vulnerability</div>
                </div>
                <div className="text-center p-3 bg-orange-50 dark:bg-orange-950/20 rounded-lg">
                  <div className="text-xl font-bold text-orange-600">{formatTimeToClick(department.stats.averageTimeToClick)}</div>
                  <div className="text-sm text-orange-700 dark:text-orange-400">Avg Time to Click</div>
                </div>
                <div className="text-center p-3 bg-red-50 dark:bg-red-950/20 rounded-lg">
                  <div className="text-xl font-bold text-red-600">{department.stats.repeatOffenders}</div>
                  <div className="text-sm text-red-700 dark:text-red-400">Repeat Offenders</div>
                </div>
              </div>
              <div className="mt-4 p-3 bg-muted/30 rounded-lg">
                <div className="text-sm font-medium text-foreground">Most Common Failure:</div>
                <div className="text-sm text-muted-foreground">{department.stats.mostCommonFailure}</div>
              </div>
            </CardContent>
          </Card>

          {/* Vulnerability Trend */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                Vulnerability Trend
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={200}>
                <LineChart data={department.trends}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted opacity-30" />
                  <XAxis dataKey="month" className="text-muted-foreground" tick={{ fontSize: 12 }} />
                  <YAxis className="text-muted-foreground" tick={{ fontSize: 12 }} />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'hsl(var(--card))', 
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '6px'
                    }}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="vulnerability" 
                    stroke="hsl(var(--destructive))" 
                    strokeWidth={3}
                    dot={{ fill: 'hsl(var(--destructive))', strokeWidth: 2, r: 4 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Failed Users Section */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Target className="h-5 w-5 text-red-500" />
                  Failed Users ({filteredUsers.length})
                </CardTitle>
              </div>
              <div className="flex flex-col sm:flex-row gap-3">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search users..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-9"
                  />
                </div>
                <Select value={sortBy} onValueChange={setSortBy}>
                  <SelectTrigger className="w-40">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="riskLevel">Sort by Risk</SelectItem>
                    <SelectItem value="timeToClick">Sort by Speed</SelectItem>
                    <SelectItem value="name">Sort by Name</SelectItem>
                    <SelectItem value="failureDate">Sort by Date</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={filterBy} onValueChange={setFilterBy}>
                  <SelectTrigger className="w-32">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Users</SelectItem>
                    <SelectItem value="high">High Risk</SelectItem>
                    <SelectItem value="medium">Medium Risk</SelectItem>
                    <SelectItem value="low">Low Risk</SelectItem>
                    <SelectItem value="repeat">Repeat Offenders</SelectItem>
                    <SelectItem value="link">Link Failures</SelectItem>
                    <SelectItem value="file">File Failures</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardHeader>
            <CardContent>
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>User</TableHead>
                      <TableHead>Risk</TableHead>
                      <TableHead>Failure</TableHead>
                      <TableHead>Speed</TableHead>
                      <TableHead>Type</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredUsers.map((user) => (
                      <TableRow key={user.id} className="hover:bg-muted/50">
                        <TableCell>
                          <div>
                            <div className="font-medium">{user.firstName} {user.lastName}</div>
                            <div className="text-sm text-muted-foreground">{user.email}</div>
                            <div className="text-xs text-muted-foreground">{user.position}</div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Badge variant={getRiskBadgeVariant(user.riskLevel)}>
                              {user.riskLevel.toUpperCase()}
                            </Badge>
                            {user.repeatOffender && (
                              <Badge variant="outline" className="text-xs">
                                REPEAT
                              </Badge>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div>
                            <div className="text-sm font-medium">{getFailureTypeDisplay(user.failureType)}</div>
                            <div className="text-xs text-muted-foreground">{user.campaignName}</div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Clock className="h-3 w-3 text-muted-foreground" />
                            <span className="text-sm font-mono">{formatTimeToClick(user.timeToClick)}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            {getSimulationIcon(user.simulationType)}
                            {getDeviceIcon(user.deviceType)}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>

          {/* Recommendations */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Lightbulb className="h-5 w-5 text-yellow-500" />
                Improvement Recommendations
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {department.recommendations.map((recommendation, index) => (
                  <div key={index} className="flex items-start gap-3 p-3 bg-yellow-50 dark:bg-yellow-950/20 rounded-lg">
                    <div className="w-6 h-6 rounded-full bg-yellow-500 text-white text-xs font-bold flex items-center justify-center flex-shrink-0 mt-0.5">
                      {index + 1}
                    </div>
                    <p className="text-sm text-yellow-800 dark:text-yellow-200">{recommendation}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default DepartmentDetailsSidebar;
