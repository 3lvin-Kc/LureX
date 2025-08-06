import React, { useState, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Separator } from '@/components/ui/separator';
import { 
  PlusCircle, Edit, Trash2, Copy, Eye, Filter, Search, 
  TrendingUp, Bot, User, Building, Archive, Star, FileText
} from 'lucide-react';
import { format } from 'date-fns';
import { useNavigate } from 'react-router-dom';
import { EmailTemplate } from '@/hooks/useTemplates';

interface TemplateLibraryProps {
  templates: EmailTemplate[];
  loading: boolean;
  onDeleteTemplate: (id: string) => void;
  onDuplicateTemplate: (id: string) => void;
  isDeleting: string | null;
}

export const TemplateLibrary: React.FC<TemplateLibraryProps> = ({
  templates,
  loading,
  onDeleteTemplate,
  onDuplicateTemplate,
  isDeleting
}) => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [sourceFilter, setSourceFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [sortBy, setSortBy] = useState('created_at');

  // Get source icon and color
  const getSourceDisplay = (source?: string) => {
    switch (source) {
      case 'ai_generated':
        return { 
          icon: Bot, 
          label: 'AI Generated', 
          color: 'text-primary',
          bgColor: 'bg-primary/10'
        };
      case 'industry_template':
        return { 
          icon: Building, 
          label: 'Industry Template', 
          color: 'text-blue-600',
          bgColor: 'bg-blue-100'
        };
      case 'duplicated':
        return { 
          icon: Copy, 
          label: 'Duplicated', 
          color: 'text-orange-600',
          bgColor: 'bg-orange-100'
        };
      default:
        return { 
          icon: User, 
          label: 'Manual', 
          color: 'text-green-600',
          bgColor: 'bg-green-100'
        };
    }
  };

  // Filter and sort templates
  const filteredTemplates = useMemo(() => {
    let filtered = templates.filter(template => {
      const matchesSearch = template.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           template.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           template.category.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesSource = sourceFilter === 'all' || template.template_source === sourceFilter;
      const matchesCategory = categoryFilter === 'all' || template.category === categoryFilter;
      
      return matchesSearch && matchesSource && matchesCategory;
    });

    // Sort templates
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return a.name.localeCompare(b.name);
        case 'effectiveness':
          return (b.effectiveness_score || 0) - (a.effectiveness_score || 0);
        case 'usage':
          return (b.usage_count || 0) - (a.usage_count || 0);
        case 'created_at':
        default:
          return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      }
    });

    return filtered;
  }, [templates, searchQuery, sourceFilter, categoryFilter, sortBy]);

  // Get unique categories
  const categories = useMemo(() => {
    const cats = templates.map(t => t.category).filter(Boolean);
    return [...new Set(cats)];
  }, [templates]);

  // Get template stats
  const stats = useMemo(() => {
    const total = templates.length;
    const aiGenerated = templates.filter(t => t.template_source === 'ai_generated').length;
    const industryTemplates = templates.filter(t => t.template_source === 'industry_template').length;
    const manual = templates.filter(t => t.template_source === 'manual').length;
    const duplicated = templates.filter(t => t.template_source === 'duplicated').length;
    
    return { total, aiGenerated, industryTemplates, manual, duplicated };
  }, [templates]);

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <FileText className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="text-2xl font-bold">{stats.total}</p>
                <p className="text-xs text-muted-foreground">Total</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Bot className="h-4 w-4 text-primary" />
              <div>
                <p className="text-2xl font-bold">{stats.aiGenerated}</p>
                <p className="text-xs text-muted-foreground">AI Generated</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Building className="h-4 w-4 text-blue-600" />
              <div>
                <p className="text-2xl font-bold">{stats.industryTemplates}</p>
                <p className="text-xs text-muted-foreground">Industry</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <User className="h-4 w-4 text-green-600" />
              <div>
                <p className="text-2xl font-bold">{stats.manual}</p>
                <p className="text-xs text-muted-foreground">Manual</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Copy className="h-4 w-4 text-orange-600" />
              <div>
                <p className="text-2xl font-bold">{stats.duplicated}</p>
                <p className="text-xs text-muted-foreground">Duplicated</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters and Search */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center justify-between">
            <span>Template Library</span>
            <Button onClick={() => navigate("/templates/new")}> 
              <PlusCircle size={16} className="mr-2" />
              New Template
            </Button>
          </CardTitle>
          <CardDescription>
            Browse and manage your unified email template collection
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search templates..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            
            <Select value={sourceFilter} onValueChange={setSourceFilter}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Filter by source" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Sources</SelectItem>
                <SelectItem value="manual">Manual</SelectItem>
                <SelectItem value="ai_generated">AI Generated</SelectItem>
                <SelectItem value="industry_template">Industry Template</SelectItem>
                <SelectItem value="duplicated">Duplicated</SelectItem>
              </SelectContent>
            </Select>
            
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Filter by category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {categories.map(category => (
                  <SelectItem key={category} value={category}>
                    {category}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="created_at">Latest First</SelectItem>
                <SelectItem value="name">Name A-Z</SelectItem>
                <SelectItem value="effectiveness">Effectiveness</SelectItem>
                <SelectItem value="usage">Usage Count</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Separator className="mb-6" />

          {loading ? (
            <div className="flex justify-center items-center h-32">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : filteredTemplates.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground mb-4">
                {searchQuery || sourceFilter !== 'all' || categoryFilter !== 'all' 
                  ? 'No templates match your filters' 
                  : 'No templates found'
                }
              </p>
              <Button onClick={() => navigate("/templates/new")}> 
                <PlusCircle size={16} className="mr-2" />
                Create Your First Template
              </Button>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Template</TableHead>
                  <TableHead>Source</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Performance</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredTemplates.map((template) => {
                  const sourceDisplay = getSourceDisplay(template.template_source);
                  const SourceIcon = sourceDisplay.icon;
                  
                  return (
                    <TableRow key={template.id}>
                      <TableCell>
                        <div>
                          <div className="font-medium">{template.name}</div>
                          <div className="text-sm text-muted-foreground truncate max-w-xs">
                            {template.subject}
                          </div>
                        </div>
                      </TableCell>
                      
                      <TableCell>
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger>
                              <Badge 
                                variant="outline" 
                                className={`${sourceDisplay.bgColor} ${sourceDisplay.color} border-0`}
                              >
                                <SourceIcon className="h-3 w-3 mr-1" />
                                {sourceDisplay.label}
                              </Badge>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>Template Source: {sourceDisplay.label}</p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      </TableCell>
                      
                      <TableCell>
                        <Badge variant="outline" className="capitalize">
                          {template.category}
                        </Badge>
                      </TableCell>
                      
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          <div className="flex flex-col">
                            <div className="flex items-center space-x-1">
                              <Star className="h-3 w-3 text-yellow-500" />
                              <span className="text-sm">
                                {Math.round(template.effectiveness_score || 0)}%
                              </span>
                            </div>
                            <div className="flex items-center space-x-1">
                              <TrendingUp className="h-3 w-3 text-blue-500" />
                              <span className="text-xs text-muted-foreground">
                                {template.usage_count || 0} uses
                              </span>
                            </div>
                          </div>
                        </div>
                      </TableCell>
                      
                      <TableCell>
                        <div className="text-sm">
                          {format(new Date(template.created_at), "MMM d, yyyy")}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          v{template.version}
                        </div>
                      </TableCell>
                      
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-1">
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button
                                  variant="outline"
                                  size="icon"
                                  onClick={() => navigate(`/templates/${template.id}/preview`)}
                                >
                                  <Eye size={14} />
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent>Preview</TooltipContent>
                            </Tooltip>

                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button
                                  variant="outline"
                                  size="icon"
                                  onClick={() => navigate(`/templates/${template.id}/edit`)}
                                >
                                  <Edit size={14} />
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent>Edit</TooltipContent>
                            </Tooltip>

                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button
                                  variant="outline"
                                  size="icon"
                                  onClick={() => onDuplicateTemplate(template.id)}
                                >
                                  <Copy size={14} />
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent>Duplicate</TooltipContent>
                            </Tooltip>

                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button
                                  variant="outline"
                                  size="icon"
                                  disabled={isDeleting === template.id}
                                  onClick={() => onDeleteTemplate(template.id)}
                                >
                                  <Trash2 size={14} />
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent>Delete</TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
};