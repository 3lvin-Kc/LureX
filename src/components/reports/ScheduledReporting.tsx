import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { 
  Plus, 
  Calendar, 
  Mail, 
  Clock, 
  Download,
  Edit,
  Trash2,
  Play,
  Pause,
  Settings
} from 'lucide-react';
import { ScheduledReport, ReportTemplate } from '@/hooks/useAdvancedReports';

interface ScheduledReportingProps {
  scheduledReports: ScheduledReport[];
  reportTemplates: ReportTemplate[];
  onCreateScheduledReport: (report: Omit<ScheduledReport, 'id'>) => Promise<any>;
}

const ScheduledReporting: React.FC<ScheduledReportingProps> = ({
  scheduledReports,
  reportTemplates,
  onCreateScheduledReport
}) => {
  const [isCreating, setIsCreating] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    report_template_id: '',
    schedule_cron: '',
    recipients: [] as string[],
    delivery_format: 'pdf',
    is_active: true
  });
  const [newRecipient, setNewRecipient] = useState('');

  const schedulePresets = [
    { label: 'Daily at 9 AM', value: '0 9 * * *' },
    { label: 'Weekly on Monday at 9 AM', value: '0 9 * * 1' },
    { label: 'Monthly on 1st at 9 AM', value: '0 9 1 * *' },
    { label: 'Quarterly on 1st at 9 AM', value: '0 9 1 */3 *' },
    { label: 'Custom', value: 'custom' }
  ];

  const formatOptions = [
    { label: 'PDF', value: 'pdf' },
    { label: 'CSV', value: 'csv' },
    { label: 'Excel', value: 'xlsx' }
  ];

  const handleSubmit = async () => {
    try {
      const report: Omit<ScheduledReport, 'id'> = {
        name: formData.name,
        description: formData.description,
        report_template_id: formData.report_template_id,
        schedule_cron: formData.schedule_cron,
        recipients: formData.recipients,
        delivery_format: formData.delivery_format,
        is_active: formData.is_active,
        last_sent_at: '',
        next_send_at: calculateNextSendTime(formData.schedule_cron)
      };

      await onCreateScheduledReport(report);
      setIsCreating(false);
      resetForm();
    } catch (error) {
      console.error('Failed to create scheduled report:', error);
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      report_template_id: '',
      schedule_cron: '',
      recipients: [],
      delivery_format: 'pdf',
      is_active: true
    });
    setNewRecipient('');
  };

  const addRecipient = () => {
    if (newRecipient && !formData.recipients.includes(newRecipient)) {
      setFormData({
        ...formData,
        recipients: [...formData.recipients, newRecipient]
      });
      setNewRecipient('');
    }
  };

  const removeRecipient = (email: string) => {
    setFormData({
      ...formData,
      recipients: formData.recipients.filter(r => r !== email)
    });
  };

  const calculateNextSendTime = (cronExpression: string): string => {
    // Simplified next time calculation - in production, use a proper cron library
    const now = new Date();
    now.setHours(now.getHours() + 1);
    return now.toISOString();
  };

  const formatCronExpression = (cron: string): string => {
    const preset = schedulePresets.find(p => p.value === cron);
    return preset ? preset.label : cron;
  };

  const getStatusBadge = (report: ScheduledReport) => {
    if (!report.is_active) {
      return <Badge variant="secondary">Paused</Badge>;
    }
    
    const nextSend = new Date(report.next_send_at);
    const now = new Date();
    const hoursUntilNext = (nextSend.getTime() - now.getTime()) / (1000 * 60 * 60);
    
    if (hoursUntilNext < 24) {
      return <Badge variant="default">Due Soon</Badge>;
    }
    
    return <Badge variant="outline">Active</Badge>;
  };

  return (
    <div className="space-y-6">
      {/* Header with Create Button */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Scheduled Reporting</h2>
          <p className="text-muted-foreground">
            Automate report generation and delivery to stakeholders
          </p>
        </div>
        <Dialog open={isCreating} onOpenChange={setIsCreating}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Schedule Report
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Schedule New Report</DialogTitle>
              <DialogDescription>
                Configure automated report generation and delivery
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4 py-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="report-name">Report Name</Label>
                  <Input
                    id="report-name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="e.g., Weekly Security Summary"
                  />
                </div>
                <div>
                  <Label htmlFor="report-template">Report Template</Label>
                  <Select
                    value={formData.report_template_id}
                    onValueChange={(value) => setFormData({ ...formData, report_template_id: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select template" />
                    </SelectTrigger>
                    <SelectContent>
                      {reportTemplates.map(template => (
                        <SelectItem key={template.id} value={template.id}>
                          {template.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Optional description for this scheduled report"
                  rows={2}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="schedule">Schedule</Label>
                  <Select
                    value={formData.schedule_cron}
                    onValueChange={(value) => setFormData({ ...formData, schedule_cron: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select schedule" />
                    </SelectTrigger>
                    <SelectContent>
                      {schedulePresets.map(preset => (
                        <SelectItem key={preset.value} value={preset.value}>
                          {preset.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="format">Delivery Format</Label>
                  <Select
                    value={formData.delivery_format}
                    onValueChange={(value) => setFormData({ ...formData, delivery_format: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {formatOptions.map(format => (
                        <SelectItem key={format.value} value={format.value}>
                          {format.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <Label>Recipients</Label>
                <div className="space-y-2">
                  <div className="flex gap-2">
                    <Input
                      value={newRecipient}
                      onChange={(e) => setNewRecipient(e.target.value)}
                      placeholder="Enter email address"
                      onKeyPress={(e) => e.key === 'Enter' && addRecipient()}
                    />
                    <Button type="button" onClick={addRecipient}>Add</Button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {formData.recipients.map((email) => (
                      <Badge key={email} variant="secondary" className="flex items-center gap-1">
                        {email}
                        <button
                          onClick={() => removeRecipient(email)}
                          className="ml-1 hover:text-destructive"
                        >
                          ×
                        </button>
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  id="active"
                  checked={formData.is_active}
                  onCheckedChange={(checked) => setFormData({ ...formData, is_active: checked })}
                />
                <Label htmlFor="active">Active</Label>
              </div>
            </div>

            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setIsCreating(false)}>
                Cancel
              </Button>
              <Button 
                onClick={handleSubmit}
                disabled={!formData.name || !formData.report_template_id || !formData.schedule_cron}
              >
                Create Schedule
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Schedules</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {scheduledReports.filter(r => r.is_active).length}
            </div>
            <p className="text-xs text-muted-foreground">
              {scheduledReports.length} total schedules
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Next Report</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {scheduledReports.length > 0 ? '2h 30m' : '--'}
            </div>
            <p className="text-xs text-muted-foreground">Until next delivery</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Delivered This Month</CardTitle>
            <Mail className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">24</div>
            <p className="text-xs text-muted-foreground">Reports sent</p>
          </CardContent>
        </Card>
      </div>

      {/* Scheduled Reports List */}
      <Card>
        <CardHeader>
          <CardTitle>Scheduled Reports</CardTitle>
          <CardDescription>
            Manage your automated report schedules
          </CardDescription>
        </CardHeader>
        <CardContent>
          {scheduledReports.length > 0 ? (
            <div className="space-y-4">
              {scheduledReports.map((report) => (
                <div key={report.id} className="border rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <h4 className="font-medium">{report.name}</h4>
                      <p className="text-sm text-muted-foreground">{report.description}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      {getStatusBadge(report)}
                      <div className="flex gap-1">
                        <Button size="sm" variant="outline">
                          <Edit className="h-3 w-3" />
                        </Button>
                        <Button size="sm" variant="outline">
                          <Play className="h-3 w-3" />
                        </Button>
                        <Button size="sm" variant="outline">
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div>
                      <p className="text-muted-foreground">Schedule</p>
                      <p className="font-medium">{formatCronExpression(report.schedule_cron)}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Format</p>
                      <p className="font-medium">{report.delivery_format.toUpperCase()}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Recipients</p>
                      <p className="font-medium">{report.recipients.length} people</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Next Send</p>
                      <p className="font-medium">
                        {new Date(report.next_send_at).toLocaleDateString()}
                      </p>
                    </div>
                  </div>

                  {report.recipients.length > 0 && (
                    <div className="mt-3">
                      <p className="text-sm text-muted-foreground mb-2">Recipients:</p>
                      <div className="flex flex-wrap gap-1">
                        {report.recipients.slice(0, 3).map((email) => (
                          <Badge key={email} variant="outline" className="text-xs">
                            {email}
                          </Badge>
                        ))}
                        {report.recipients.length > 3 && (
                          <Badge variant="outline" className="text-xs">
                            +{report.recipients.length - 3} more
                          </Badge>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <Calendar className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No scheduled reports configured</p>
              <p className="text-sm">Click "Schedule Report" to create your first automated report</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default ScheduledReporting;