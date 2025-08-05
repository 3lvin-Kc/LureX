import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Search, User, Mail, Building, MapPin, Calendar, Link } from 'lucide-react';

export interface TemplateVariable {
  name: string;
  description: string;
  category: string;
  icon: React.ComponentType<{ className?: string }>;
  example: string;
}

export const TEMPLATE_VARIABLES: TemplateVariable[] = [
  // Personal Information
  { name: 'first_name', description: 'Target\'s first name', category: 'Personal', icon: User, example: 'John' },
  { name: 'last_name', description: 'Target\'s last name', category: 'Personal', icon: User, example: 'Smith' },
  { name: 'full_name', description: 'Target\'s full name', category: 'Personal', icon: User, example: 'John Smith' },
  { name: 'email', description: 'Target\'s email address', category: 'Contact', icon: Mail, example: 'john.smith@company.com' },
  { name: 'phone', description: 'Target\'s phone number', category: 'Contact', icon: Mail, example: '+1-555-0123' },
  
  // Company Information
  { name: 'company_name', description: 'Target\'s company name', category: 'Company', icon: Building, example: 'Acme Corp' },
  { name: 'department', description: 'Target\'s department', category: 'Company', icon: Building, example: 'IT Department' },
  { name: 'position', description: 'Target\'s job title', category: 'Company', icon: Building, example: 'Software Engineer' },
  { name: 'manager_name', description: 'Target\'s manager name', category: 'Company', icon: User, example: 'Sarah Johnson' },
  { name: 'team_name', description: 'Target\'s team name', category: 'Company', icon: Building, example: 'DevOps Team' },
  
  // Location & Time
  { name: 'office_location', description: 'Office location', category: 'Location', icon: MapPin, example: 'New York Office' },
  { name: 'current_date', description: 'Current date', category: 'Time', icon: Calendar, example: 'January 15, 2024' },
  { name: 'current_time', description: 'Current time', category: 'Time', icon: Calendar, example: '2:30 PM EST' },
  
  // Campaign Specific
  { name: 'phishing_link', description: 'The main phishing link', category: 'Campaign', icon: Link, example: 'https://secure-portal.com/login' },
  { name: 'tracking_pixel', description: 'Email tracking pixel', category: 'Campaign', icon: Link, example: '<img src="..." />' },
  { name: 'unsubscribe_link', description: 'Unsubscribe link', category: 'Campaign', icon: Link, example: 'https://unsubscribe.com' },
];

interface VariableAutocompleteProps {
  textareaRef: React.RefObject<HTMLTextAreaElement>;
  onVariableInsert: (variable: string) => void;
  selectedCategory?: string;
}

const VariableAutocomplete: React.FC<VariableAutocompleteProps> = ({
  textareaRef,
  onVariableInsert,
  selectedCategory
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedVariable, setSelectedVariable] = useState<TemplateVariable | null>(null);
  const [showPreview, setShowPreview] = useState(false);

  const filteredVariables = TEMPLATE_VARIABLES.filter(variable => {
    const matchesSearch = variable.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         variable.description.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesSearch;
  });

  const categorizedVariables = filteredVariables.reduce((acc, variable) => {
    if (!acc[variable.category]) {
      acc[variable.category] = [];
    }
    acc[variable.category].push(variable);
    return acc;
  }, {} as Record<string, TemplateVariable[]>);

  const handleVariableClick = (variable: TemplateVariable) => {
    onVariableInsert(variable.name);
    setSelectedVariable(variable);
    setShowPreview(true);
    setTimeout(() => setShowPreview(false), 2000);
  };

  const getRecommendedVariables = () => {
    if (!selectedCategory) return [];
    
    const categoryMap: Record<string, string[]> = {
      'Banking': ['first_name', 'email', 'phishing_link', 'current_date'],
      'Social': ['full_name', 'company_name', 'phishing_link'],
      'Corporate': ['first_name', 'company_name', 'department', 'manager_name', 'phishing_link'],
      'Cloud': ['email', 'company_name', 'phishing_link', 'current_date'],
      'E-commerce': ['first_name', 'email', 'phishing_link', 'current_date'],
    };

    const recommended = categoryMap[selectedCategory] || [];
    return TEMPLATE_VARIABLES.filter(v => recommended.includes(v.name));
  };

  const recommendedVariables = getRecommendedVariables();

  return (
    <div className="space-y-4">
      {/* Search Bar */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
        <Input
          placeholder="Search variables..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Recommended Variables for Category */}
      {recommendedVariables.length > 0 && (
        <Card>
          <CardContent className="p-4">
            <h4 className="text-sm font-medium mb-3 text-primary">
              Recommended for {selectedCategory}
            </h4>
            <div className="grid grid-cols-2 gap-2">
              {recommendedVariables.map((variable) => {
                const IconComponent = variable.icon;
                return (
                  <Button
                    key={variable.name}
                    variant="outline"
                    size="sm"
                    className="justify-start h-auto p-3"
                    onClick={() => handleVariableClick(variable)}
                  >
                    <IconComponent className="h-4 w-4 mr-2 text-primary" />
                    <div className="text-left">
                      <div className="font-mono text-xs text-primary">
                        {`{{${variable.name}}}`}
                      </div>
                      <div className="text-xs text-muted-foreground truncate">
                        {variable.description}
                      </div>
                    </div>
                  </Button>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* All Variables by Category */}
      <div className="space-y-4">
        {Object.entries(categorizedVariables).map(([category, variables]) => (
          <Card key={category}>
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-3">
                <Badge variant="secondary" className="text-xs">
                  {category}
                </Badge>
                <span className="text-xs text-muted-foreground">
                  {variables.length} variable{variables.length !== 1 ? 's' : ''}
                </span>
              </div>
              <div className="grid grid-cols-1 gap-2">
                {variables.map((variable) => {
                  const IconComponent = variable.icon;
                  return (
                    <div
                      key={variable.name}
                      className="flex items-center justify-between p-3 border rounded-lg cursor-pointer hover:bg-muted/50 transition-colors group"
                      onClick={() => handleVariableClick(variable)}
                    >
                      <div className="flex items-center gap-3 flex-1">
                        <IconComponent className="h-4 w-4 text-muted-foreground group-hover:text-primary" />
                        <div className="flex-1">
                          <div className="font-mono text-sm text-primary">
                            {`{{${variable.name}}}`}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {variable.description}
                          </div>
                        </div>
                      </div>
                      <div className="text-xs text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity">
                        Example: {variable.example}
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Preview Notification */}
      {showPreview && selectedVariable && (
        <Card className="border-primary bg-primary/5">
          <CardContent className="p-3">
            <div className="flex items-center gap-2">
              <Badge className="bg-primary text-primary-foreground">
                Inserted
              </Badge>
              <span className="text-sm">
                Added <code className="text-primary font-mono">{`{{${selectedVariable.name}}}`}</code> to template
              </span>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default VariableAutocomplete;