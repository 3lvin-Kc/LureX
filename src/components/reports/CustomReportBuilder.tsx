import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Plus, 
  Trash2, 
  Save, 
  Eye, 
  Download,
  BarChart3,
  PieChart,
  TrendingUp,
  Users,
  Mail,
  MousePointer,
  Shield,
  Calendar,
  Target
} from 'lucide-react';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import { ReportTemplate } from '@/hooks/useAdvancedReports';

interface ReportWidget {
  id: string;
  type: 'metric' | 'chart' | 'table' | 'text';
  title: string;
  configuration: any;
  position: { x: number; y: number; w: number; h: number };
}

interface CustomReportBuilderProps {
  templates: ReportTemplate[];
  onCreateTemplate: (template: Omit<ReportTemplate, 'id'>) => Promise<void>;
}

const CustomReportBuilder: React.FC<CustomReportBuilderProps> = ({ 
  templates, 
  onCreateTemplate 
}) => {
  const [reportName, setReportName] = useState('');
  const [reportDescription, setReportDescription] = useState('');
  const [widgets, setWidgets] = useState<ReportWidget[]>([]);
  const [selectedWidget, setSelectedWidget] = useState<ReportWidget | null>(null);
  const [previewMode, setPreviewMode] = useState(false);

  const availableWidgets = [
    { 
      type: 'metric', 
      title: 'Key Metric', 
      icon: Target,
      description: 'Display a single important metric'
    },
    { 
      type: 'chart', 
      title: 'Chart', 
      icon: BarChart3,
      description: 'Bar, line, or pie charts'
    },
    { 
      type: 'table', 
      title: 'Data Table', 
      icon: Users,
      description: 'Tabular data display'
    },
    { 
      type: 'text', 
      title: 'Text Block', 
      icon: Calendar,
      description: 'Custom text or markdown content'
    }
  ];

  const metricOptions = [
    { value: 'total_campaigns', label: 'Total Campaigns' },
    { value: 'emails_sent', label: 'Emails Sent' },
    { value: 'click_rate', label: 'Click Rate' },
    { value: 'submit_rate', label: 'Submit Rate' },
    { value: 'report_rate', label: 'Report Rate' },
    { value: 'security_score', label: 'Security Score' },
    { value: 'roi_total', label: 'Total ROI' },
    { value: 'incidents_prevented', label: 'Incidents Prevented' }
  ];

  const chartTypes = [
    { value: 'bar', label: 'Bar Chart' },
    { value: 'line', label: 'Line Chart' },
    { value: 'pie', label: 'Pie Chart' },
    { value: 'area', label: 'Area Chart' }
  ];

  const addWidget = (type: string) => {
    const newWidget: ReportWidget = {
      id: `widget-${Date.now()}`,
      type: type as any,
      title: `New ${type.charAt(0).toUpperCase() + type.slice(1)}`,
      configuration: getDefaultConfiguration(type),
      position: { x: 0, y: widgets.length * 2, w: 6, h: 4 }
    };
    setWidgets([...widgets, newWidget]);
    setSelectedWidget(newWidget);
  };

  const getDefaultConfiguration = (type: string) => {
    switch (type) {
      case 'metric':
        return { 
          metric: 'total_campaigns', 
          format: 'number',
          color: 'primary'
        };
      case 'chart':
        return { 
          chartType: 'bar', 
          dataSource: 'campaigns',
          xAxis: 'name',
          yAxis: 'sent'
        };
      case 'table':
        return { 
          dataSource: 'campaigns',
          columns: ['name', 'sent', 'opened', 'clicked']
        };
      case 'text':
        return { 
          content: 'Enter your custom text here...',
          fontSize: 'medium',
          alignment: 'left'
        };
      default:
        return {};
    }
  };

  const updateWidget = (widgetId: string, updates: Partial<ReportWidget>) => {
    setWidgets(widgets.map(w => 
      w.id === widgetId ? { ...w, ...updates } : w
    ));
    if (selectedWidget?.id === widgetId) {
      setSelectedWidget({ ...selectedWidget, ...updates });
    }
  };

  const deleteWidget = (widgetId: string) => {
    setWidgets(widgets.filter(w => w.id !== widgetId));
    if (selectedWidget?.id === widgetId) {
      setSelectedWidget(null);
    }
  };

  const onDragEnd = (result: any) => {
    if (!result.destination) return;

    const items = Array.from(widgets);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);

    setWidgets(items);
  };

  const saveTemplate = async () => {
    if (!reportName.trim()) {
      alert('Please enter a report name');
      return;
    }

    const template: Omit<ReportTemplate, 'id'> = {
      name: reportName,
      description: reportDescription,
      report_type: 'custom',
      is_public: false,
      configuration: {
        widgets,
        layout: 'grid',
        settings: {
          refreshInterval: 300000, // 5 minutes
          exportFormats: ['pdf', 'csv']
        }
      }
    };

    try {
      await onCreateTemplate(template);
      // Reset form
      setReportName('');
      setReportDescription('');
      setWidgets([]);
      setSelectedWidget(null);
    } catch (error) {
      console.error('Failed to save template:', error);
    }
  };

  const renderWidgetPreview = (widget: ReportWidget) => {
    const Icon = availableWidgets.find(w => w.type === widget.type)?.icon || Target;
    
    return (
      <Card className="h-full">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm flex items-center gap-2">
            <Icon className="h-4 w-4" />
            {widget.title}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {widget.type === 'metric' && (
            <div className="text-center">
              <div className="text-2xl font-bold">42</div>
              <div className="text-sm text-muted-foreground">
                {metricOptions.find(m => m.value === widget.configuration.metric)?.label}
              </div>
            </div>
          )}
          {widget.type === 'chart' && (
            <div className="h-32 bg-muted rounded flex items-center justify-center">
              <BarChart3 className="h-8 w-8 text-muted-foreground" />
            </div>
          )}
          {widget.type === 'table' && (
            <div className="space-y-2">
              <div className="grid grid-cols-3 gap-2 text-xs font-medium">
                <div>Campaign</div>
                <div>Sent</div>
                <div>Rate</div>
              </div>
              <div className="grid grid-cols-3 gap-2 text-xs">
                <div>Sample Campaign</div>
                <div>100</div>
                <div>15%</div>
              </div>
            </div>
          )}
          {widget.type === 'text' && (
            <div className="text-sm">
              {widget.configuration.content}
            </div>
          )}
        </CardContent>
      </Card>
    );
  };

  const renderWidgetConfiguration = () => {
    if (!selectedWidget) return null;

    return (
      <Card>
        <CardHeader>
          <CardTitle>Widget Configuration</CardTitle>
          <CardDescription>
            Configure the selected widget settings
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="widget-title">Widget Title</Label>
            <Input
              id="widget-title"
              value={selectedWidget.title}
              onChange={(e) => updateWidget(selectedWidget.id, { title: e.target.value })}
            />
          </div>

          {selectedWidget.type === 'metric' && (
            <>
              <div>
                <Label htmlFor="metric-type">Metric Type</Label>
                <Select
                  value={selectedWidget.configuration.metric}
                  onValueChange={(value) => 
                    updateWidget(selectedWidget.id, {
                      configuration: { ...selectedWidget.configuration, metric: value }
                    })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {metricOptions.map(option => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </>
          )}

          {selectedWidget.type === 'chart' && (
            <>
              <div>
                <Label htmlFor="chart-type">Chart Type</Label>
                <Select
                  value={selectedWidget.configuration.chartType}
                  onValueChange={(value) => 
                    updateWidget(selectedWidget.id, {
                      configuration: { ...selectedWidget.configuration, chartType: value }
                    })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {chartTypes.map(type => (
                      <SelectItem key={type.value} value={type.value}>
                        {type.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </>
          )}

          {selectedWidget.type === 'text' && (
            <>
              <div>
                <Label htmlFor="text-content">Content</Label>
                <Textarea
                  id="text-content"
                  value={selectedWidget.configuration.content}
                  onChange={(e) => 
                    updateWidget(selectedWidget.id, {
                      configuration: { ...selectedWidget.configuration, content: e.target.value }
                    })
                  }
                  rows={4}
                />
              </div>
            </>
          )}

          <Button
            variant="destructive"
            size="sm"
            onClick={() => deleteWidget(selectedWidget.id)}
            className="w-full"
          >
            <Trash2 className="h-4 w-4 mr-2" />
            Delete Widget
          </Button>
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Custom Report Builder</CardTitle>
          <CardDescription>
            Create custom reports with drag-and-drop widgets
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="report-name">Report Name</Label>
              <Input
                id="report-name"
                value={reportName}
                onChange={(e) => setReportName(e.target.value)}
                placeholder="Enter report name"
              />
            </div>
            <div>
              <Label htmlFor="report-description">Description</Label>
              <Input
                id="report-description"
                value={reportDescription}
                onChange={(e) => setReportDescription(e.target.value)}
                placeholder="Enter report description"
              />
            </div>
          </div>

          <div className="flex gap-2">
            <Button onClick={saveTemplate} disabled={!reportName.trim()}>
              <Save className="h-4 w-4 mr-2" />
              Save Template
            </Button>
            <Button 
              variant="outline" 
              onClick={() => setPreviewMode(!previewMode)}
            >
              <Eye className="h-4 w-4 mr-2" />
              {previewMode ? 'Edit Mode' : 'Preview'}
            </Button>
          </div>
        </CardContent>
      </Card>

      {!previewMode ? (
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Widget Library */}
          <div className="lg:col-span-1 space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Widget Library</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {availableWidgets.map((widget) => {
                  const Icon = widget.icon;
                  return (
                    <Button
                      key={widget.type}
                      variant="outline"
                      className="w-full justify-start h-auto p-3"
                      onClick={() => addWidget(widget.type)}
                    >
                      <div className="flex items-start gap-3">
                        <Icon className="h-5 w-5 mt-0.5" />
                        <div className="text-left">
                          <div className="font-medium">{widget.title}</div>
                          <div className="text-xs text-muted-foreground">
                            {widget.description}
                          </div>
                        </div>
                      </div>
                    </Button>
                  );
                })}
              </CardContent>
            </Card>

            {renderWidgetConfiguration()}
          </div>

          {/* Report Canvas */}
          <div className="lg:col-span-3">
            <Card>
              <CardHeader>
                <CardTitle>Report Layout</CardTitle>
                <CardDescription>
                  Drag widgets to reorder them in your report
                </CardDescription>
              </CardHeader>
              <CardContent>
                <DragDropContext onDragEnd={onDragEnd}>
                  <Droppable droppableId="widgets">
                    {(provided) => (
                      <div
                        {...provided.droppableProps}
                        ref={provided.innerRef}
                        className="space-y-4 min-h-64"
                      >
                        {widgets.map((widget, index) => (
                          <Draggable key={widget.id} draggableId={widget.id} index={index}>
                            {(provided, snapshot) => (
                              <div
                                ref={provided.innerRef}
                                {...provided.draggableProps}
                                {...provided.dragHandleProps}
                                className={`
                                  p-4 border rounded-lg cursor-pointer transition-colors
                                  ${selectedWidget?.id === widget.id ? 'border-primary bg-primary/5' : 'border-border'}
                                  ${snapshot.isDragging ? 'shadow-lg' : ''}
                                `}
                                onClick={() => setSelectedWidget(widget)}
                              >
                                {renderWidgetPreview(widget)}
                              </div>
                            )}
                          </Draggable>
                        ))}
                        {provided.placeholder}
                        
                        {widgets.length === 0 && (
                          <div className="text-center py-12 text-muted-foreground">
                            <BarChart3 className="h-12 w-12 mx-auto mb-4 opacity-50" />
                            <p>No widgets added yet. Choose widgets from the library to get started.</p>
                          </div>
                        )}
                      </div>
                    )}
                  </Droppable>
                </DragDropContext>
              </CardContent>
            </Card>
          </div>
        </div>
      ) : (
        /* Preview Mode */
        <Card>
          <CardHeader>
            <CardTitle>Report Preview: {reportName}</CardTitle>
            <CardDescription>{reportDescription}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {widgets.map((widget) => (
                <div key={widget.id} className="h-48">
                  {renderWidgetPreview(widget)}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Saved Templates */}
      <Card>
        <CardHeader>
          <CardTitle>Saved Templates</CardTitle>
          <CardDescription>
            Previously created report templates
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {templates.map((template) => (
              <Card key={template.id}>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm">{template.name}</CardTitle>
                  <CardDescription className="text-xs">
                    {template.description}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex gap-2">
                    <Button size="sm" variant="outline">
                      <Eye className="h-3 w-3 mr-1" />
                      Preview
                    </Button>
                    <Button size="sm" variant="outline">
                      <Download className="h-3 w-3 mr-1" />
                      Export
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default CustomReportBuilder;