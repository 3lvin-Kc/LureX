import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Lightbulb, Copy, Star, TrendingUp, Users, Target } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export interface TemplateSuggestion {
  id: string;
  name: string;
  subject: string;
  description: string;
  category: string;
  effectiveness_score: number;
  difficulty_level: 'beginner' | 'intermediate' | 'advanced';
  target_audience: string[];
  success_rate: number;
  html_content: string;
  tags: string[];
}

const TEMPLATE_SUGGESTIONS: Record<string, TemplateSuggestion[]> = {
  Banking: [
    {
      id: 'bank-1',
      name: 'Account Security Alert',
      subject: 'Urgent: Suspicious Activity Detected on Your Account',
      description: 'Classic banking security alert template that creates urgency',
      category: 'Banking',
      effectiveness_score: 92,
      difficulty_level: 'beginner',
      target_audience: ['General Users', 'Banking Customers'],
      success_rate: 87,
      tags: ['urgency', 'security', 'account'],
      html_content: `<html><body>
<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
  <div style="background-color: #d32f2f; color: white; padding: 15px; text-align: center;">
    <h2>Security Alert</h2>
  </div>
  <div style="padding: 20px; background-color: #f5f5f5;">
    <p>Dear {{first_name}},</p>
    <p>We have detected suspicious activity on your account ending in ****2847. For your security, we have temporarily restricted access.</p>
    <p style="background-color: #fff3cd; padding: 15px; border-left: 4px solid #ffc107;">
      <strong>Immediate Action Required:</strong> Please verify your identity to restore full access to your account.
    </p>
    <div style="text-align: center; margin: 25px 0;">
      <a href="{{phishing_link}}" style="background-color: #1976d2; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; font-weight: bold;">Verify Account Now</a>
    </div>
    <p><small>This verification must be completed within 24 hours to avoid permanent account suspension.</small></p>
  </div>
</div>
</body></html>`
    },
    {
      id: 'bank-2',
      name: 'Payment Verification Required',
      subject: 'Action Required: Verify Recent Payment of $2,847.99',
      description: 'Payment verification template that leverages transaction anxiety',
      category: 'Banking',
      effectiveness_score: 89,
      difficulty_level: 'intermediate',
      target_audience: ['Online Shoppers', 'Banking Customers'],
      success_rate: 82,
      tags: ['payment', 'verification', 'transaction'],
      html_content: `<html><body>
<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background-color: white;">
  <div style="background-color: #2e7d32; color: white; padding: 20px;">
    <h2 style="margin: 0;">Payment Notification</h2>
  </div>
  <div style="padding: 25px;">
    <p>Hello {{first_name}},</p>
    <p>A payment of <strong>$2,847.99</strong> was processed from your account on {{current_date}}.</p>
    <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
      <h3 style="color: #2e7d32; margin-top: 0;">Transaction Details</h3>
      <p><strong>Amount:</strong> $2,847.99</p>
      <p><strong>Merchant:</strong> TechStore Premium</p>
      <p><strong>Date:</strong> {{current_date}}</p>
      <p><strong>Reference:</strong> TXN-{{random_number}}</p>
    </div>
    <p>If you did not authorize this payment, please verify your account immediately:</p>
    <div style="text-align: center; margin: 25px 0;">
      <a href="{{phishing_link}}" style="background-color: #d32f2f; color: white; padding: 15px 35px; text-decoration: none; border-radius: 6px; font-weight: bold;">Dispute Payment</a>
    </div>
  </div>
</div>
</body></html>`
    }
  ],
  Social: [
    {
      id: 'social-1',
      name: 'LinkedIn Connection Request',
      subject: 'New connection request from Sarah Johnson',
      description: 'Professional networking template that builds trust',
      category: 'Social',
      effectiveness_score: 85,
      difficulty_level: 'intermediate',
      target_audience: ['Professionals', 'LinkedIn Users'],
      success_rate: 78,
      tags: ['linkedin', 'networking', 'professional'],
      html_content: `<html><body>
<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
  <div style="background-color: #0077b5; color: white; padding: 20px;">
    <h2 style="margin: 0;">LinkedIn</h2>
  </div>
  <div style="padding: 25px;">
    <p>Hi {{first_name}},</p>
    <p>Sarah Johnson would like to connect with you on LinkedIn.</p>
    <div style="border: 1px solid #ddd; padding: 20px; border-radius: 8px; margin: 20px 0;">
      <div style="display: flex; align-items: center; margin-bottom: 15px;">
        <div style="width: 60px; height: 60px; background-color: #0077b5; border-radius: 50%; margin-right: 15px;"></div>
        <div>
          <h3 style="margin: 0; color: #0077b5;">Sarah Johnson</h3>
          <p style="margin: 5px 0; color: #666;">Senior Director at {{company_name}}</p>
        </div>
      </div>
      <p style="font-style: italic;">"I'd love to connect and discuss potential collaboration opportunities in the {{department}} space."</p>
    </div>
    <div style="text-align: center; margin: 25px 0;">
      <a href="{{phishing_link}}" style="background-color: #0077b5; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; font-weight: bold;">Accept Connection</a>
    </div>
  </div>
</div>
</body></html>`
    }
  ],
  Corporate: [
    {
      id: 'corp-1',
      name: 'IT Policy Update',
      subject: 'Mandatory: New IT Security Policy - Action Required',
      description: 'Internal IT communication template with authority',
      category: 'Corporate',
      effectiveness_score: 94,
      difficulty_level: 'advanced',
      target_audience: ['Employees', 'Corporate Users'],
      success_rate: 91,
      tags: ['it policy', 'mandatory', 'security'],
      html_content: `<html><body>
<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
  <div style="background-color: #1565c0; color: white; padding: 20px;">
    <h2 style="margin: 0;">{{company_name}} IT Department</h2>
  </div>
  <div style="padding: 25px;">
    <p>Dear {{first_name}},</p>
    <p>Effective immediately, all employees must comply with our updated IT Security Policy.</p>
    <div style="background-color: #fff3e0; padding: 20px; border-left: 4px solid #ff9800; margin: 20px 0;">
      <h3 style="color: #e65100; margin-top: 0;">Required Action</h3>
      <ul>
        <li>Review the updated security guidelines</li>
        <li>Complete mandatory security training</li>
        <li>Update your password credentials</li>
      </ul>
    </div>
    <p><strong>Deadline:</strong> {{deadline_date}} (72 hours)</p>
    <p>Failure to comply may result in restricted system access.</p>
    <div style="text-align: center; margin: 25px 0;">
      <a href="{{phishing_link}}" style="background-color: #1565c0; color: white; padding: 15px 35px; text-decoration: none; border-radius: 5px; font-weight: bold;">Complete Training Now</a>
    </div>
    <p><small>Regards,<br>{{company_name}} IT Security Team</small></p>
  </div>
</div>
</body></html>`
    }
  ],
  Cloud: [
    {
      id: 'cloud-1',
      name: 'Microsoft 365 Security Alert',
      subject: 'Security Alert: Unauthorized Access Attempt Detected',
      description: 'Cloud service security notification template',
      category: 'Cloud',
      effectiveness_score: 88,
      difficulty_level: 'intermediate',
      target_audience: ['Office 365 Users', 'Cloud Users'],
      success_rate: 84,
      tags: ['microsoft', 'office365', 'security'],
      html_content: `<html><body>
<div style="font-family: Segoe UI, Arial, sans-serif; max-width: 600px; margin: 0 auto;">
  <div style="background-color: #0078d4; color: white; padding: 20px;">
    <h2 style="margin: 0;">Microsoft 365 Security</h2>
  </div>
  <div style="padding: 25px;">
    <p>Hello {{first_name}},</p>
    <p>We detected an unauthorized access attempt to your Microsoft 365 account ({{email}}) from an unrecognized device.</p>
    <div style="background-color: #fef7f0; padding: 20px; border-radius: 8px; margin: 20px 0;">
      <h3 style="color: #d83b01; margin-top: 0;">Suspicious Activity Details</h3>
      <p><strong>Location:</strong> Unknown (VPN Detected)</p>
      <p><strong>Device:</strong> Linux/Chrome</p>
      <p><strong>Time:</strong> {{current_time}}</p>
      <p><strong>Status:</strong> Blocked</p>
    </div>
    <p>To secure your account and verify your identity:</p>
    <div style="text-align: center; margin: 25px 0;">
      <a href="{{phishing_link}}" style="background-color: #0078d4; color: white; padding: 15px 35px; text-decoration: none; border-radius: 5px; font-weight: bold;">Verify Account Security</a>
    </div>
    <p><small>Microsoft Security Team</small></p>
  </div>
</div>
</body></html>`
    }
  ],
  'E-commerce': [
    {
      id: 'ecom-1',
      name: 'Amazon Order Confirmation',
      subject: 'Your Amazon order has been shipped - Track your package',
      description: 'E-commerce shipping notification template',
      category: 'E-commerce',
      effectiveness_score: 86,
      difficulty_level: 'beginner',
      target_audience: ['Online Shoppers', 'Amazon Users'],
      success_rate: 79,
      tags: ['amazon', 'shipping', 'order'],
      html_content: `<html><body>
<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
  <div style="background-color: #232f3e; color: white; padding: 20px;">
    <h2 style="margin: 0;">amazon</h2>
  </div>
  <div style="padding: 25px;">
    <p>Hello {{first_name}},</p>
    <p>Great news! Your recent order has been shipped and is on its way to you.</p>
    <div style="background-color: #f0f8f0; padding: 20px; border-radius: 8px; margin: 20px 0;">
      <h3 style="color: #007600; margin-top: 0;">Order Details</h3>
      <p><strong>Order #:</strong> 123-4567890-1234567</p>
      <p><strong>Item:</strong> Wireless Bluetooth Headphones</p>
      <p><strong>Estimated Delivery:</strong> {{delivery_date}}</p>
      <p><strong>Shipping Address:</strong> {{shipping_address}}</p>
    </div>
    <p>Track your package or manage your order:</p>
    <div style="text-align: center; margin: 25px 0;">
      <a href="{{phishing_link}}" style="background-color: #ff9900; color: black; padding: 15px 35px; text-decoration: none; border-radius: 5px; font-weight: bold;">Track Package</a>
    </div>
    <p><small>Thank you for shopping with Amazon!</small></p>
  </div>
</div>
</body></html>`
    }
  ]
};

interface SmartTemplateSuggestionsProps {
  selectedCategory?: string;
  onSuggestionSelect: (suggestion: TemplateSuggestion) => void;
  onSuggestionPreview: (suggestion: TemplateSuggestion) => void;
}

const SmartTemplateSuggestions: React.FC<SmartTemplateSuggestionsProps> = ({
  selectedCategory,
  onSuggestionSelect,
  onSuggestionPreview
}) => {
  const { toast } = useToast();
  const [suggestions, setSuggestions] = useState<TemplateSuggestion[]>([]);

  useEffect(() => {
    if (selectedCategory && TEMPLATE_SUGGESTIONS[selectedCategory]) {
      setSuggestions(TEMPLATE_SUGGESTIONS[selectedCategory]);
    } else {
      // Show all suggestions if no category selected
      const allSuggestions = Object.values(TEMPLATE_SUGGESTIONS).flat();
      setSuggestions(allSuggestions.slice(0, 6)); // Limit to 6 suggestions
    }
  }, [selectedCategory]);

  const getDifficultyColor = (level: string) => {
    switch (level) {
      case 'beginner': return 'bg-green-100 text-green-800';
      case 'intermediate': return 'bg-yellow-100 text-yellow-800';
      case 'advanced': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getEffectivenessColor = (score: number) => {
    if (score >= 90) return 'text-green-600';
    if (score >= 80) return 'text-yellow-600';
    return 'text-red-600';
  };

  const handleUseSuggestion = (suggestion: TemplateSuggestion) => {
    onSuggestionSelect(suggestion);
    toast({
      title: "Template Applied",
      description: `"${suggestion.name}" has been loaded into the editor.`,
    });
  };

  if (suggestions.length === 0) {
    return (
      <Card>
        <CardContent className="p-6 text-center">
          <Lightbulb className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-medium mb-2">No Suggestions Available</h3>
          <p className="text-muted-foreground">
            Select a category to see smart template suggestions tailored for your campaign.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <Lightbulb className="h-5 w-5 text-primary" />
        <h3 className="text-lg font-medium">Smart Template Suggestions</h3>
        {selectedCategory && (
          <Badge variant="secondary" className="ml-auto">
            {selectedCategory}
          </Badge>
        )}
      </div>
      
      <div className="grid grid-cols-1 gap-4">
        {suggestions.map((suggestion) => (
          <Card key={suggestion.id} className="hover:shadow-md transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <CardTitle className="text-base flex items-center gap-2">
                    {suggestion.name}
                    <Badge className={getDifficultyColor(suggestion.difficulty_level)}>
                      {suggestion.difficulty_level}
                    </Badge>
                  </CardTitle>
                  <CardDescription className="mt-1">
                    {suggestion.description}
                  </CardDescription>
                </div>
                <div className="flex items-center gap-1 text-sm">
                  <Star className={`h-4 w-4 ${getEffectivenessColor(suggestion.effectiveness_score)}`} />
                  <span className={getEffectivenessColor(suggestion.effectiveness_score)}>
                    {suggestion.effectiveness_score}%
                  </span>
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="space-y-3">
                {/* Subject Preview */}
                <div>
                  <p className="text-sm font-medium text-muted-foreground mb-1">Subject Line:</p>
                  <p className="text-sm bg-muted p-2 rounded italic">
                    "{suggestion.subject}"
                  </p>
                </div>

                {/* Metrics */}
                <div className="grid grid-cols-3 gap-4 text-sm">
                  <div className="text-center">
                    <TrendingUp className="h-4 w-4 mx-auto mb-1 text-green-600" />
                    <div className="font-medium text-green-600">{suggestion.success_rate}%</div>
                    <div className="text-muted-foreground text-xs">Success Rate</div>
                  </div>
                  <div className="text-center">
                    <Users className="h-4 w-4 mx-auto mb-1 text-blue-600" />
                    <div className="font-medium text-blue-600">{suggestion.target_audience.length}</div>
                    <div className="text-muted-foreground text-xs">Audiences</div>
                  </div>
                  <div className="text-center">
                    <Target className="h-4 w-4 mx-auto mb-1 text-purple-600" />
                    <div className="font-medium text-purple-600">{suggestion.tags.length}</div>
                    <div className="text-muted-foreground text-xs">Tags</div>
                  </div>
                </div>

                {/* Tags */}
                <div className="flex flex-wrap gap-1">
                  {suggestion.tags.map((tag) => (
                    <Badge key={tag} variant="outline" className="text-xs">
                      {tag}
                    </Badge>
                  ))}
                </div>

                <Separator />

                {/* Actions */}
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    onClick={() => handleUseSuggestion(suggestion)}
                    className="flex-1"
                  >
                    <Copy className="h-4 w-4 mr-2" />
                    Use Template
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => onSuggestionPreview(suggestion)}
                  >
                    Preview
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default SmartTemplateSuggestions;