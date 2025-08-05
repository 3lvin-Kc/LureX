import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Plus, Users, MessageSquare, BarChart3, Settings } from 'lucide-react';
import { useSocialMediaIntegration } from '@/hooks/useSocialMediaIntegration';
import { SocialMediaCampaignForm } from './SocialMediaCampaignForm';
import { SocialMediaTemplateEditor } from './SocialMediaTemplateEditor';
import { SocialMediaMetrics } from './SocialMediaMetrics';

export const SocialMediaDashboard = () => {
  const {
    platforms,
    campaigns,
    templates,
    loading,
    connectLinkedIn,
    createSocialMediaCampaign,
    deleteSocialMediaCampaign,
  } = useSocialMediaIntegration();
  
  const [showCampaignForm, setShowCampaignForm] = useState(false);
  const [showTemplateEditor, setShowTemplateEditor] = useState(false);

  const linkedInPlatform = platforms.find(p => p.platform_name === 'linkedin');

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Social Media Integration</h1>
          <p className="text-muted-foreground">
            Advanced phishing simulations through social media platforms
          </p>
        </div>
        <div className="flex gap-2">
          <Button onClick={() => setShowCampaignForm(true)}>
            <Plus className="h-4 w-4 mr-2" />
            New Campaign
          </Button>
          <Button variant="outline" onClick={() => setShowTemplateEditor(true)}>
            <Plus className="h-4 w-4 mr-2" />
            New Template
          </Button>
        </div>
      </div>

      {/* Platform Connections */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Platform Connections
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
                  <Users className="h-5 w-5 text-white" />
                </div>
                <div>
                  <h3 className="font-semibold">LinkedIn</h3>
                  <p className="text-sm text-muted-foreground">
                    Professional networking platform
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {linkedInPlatform ? (
                  <>
                    <Badge variant="default">Connected</Badge>
                    <span className="text-sm text-muted-foreground">
                      @{linkedInPlatform.platform_username}
                    </span>
                  </>
                ) : (
                  <Button onClick={connectLinkedIn} variant="outline">
                    Connect
                  </Button>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="campaigns" className="space-y-4">
        <TabsList>
          <TabsTrigger value="campaigns" className="flex items-center gap-2">
            <MessageSquare className="h-4 w-4" />
            Campaigns
          </TabsTrigger>
          <TabsTrigger value="templates" className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            Templates
          </TabsTrigger>
          <TabsTrigger value="metrics" className="flex items-center gap-2">
            <BarChart3 className="h-4 w-4" />
            Analytics
          </TabsTrigger>
        </TabsList>

        <TabsContent value="campaigns" className="space-y-4">
          <div className="grid gap-4">
            {campaigns.length === 0 ? (
              <Card>
                <CardContent className="py-8 text-center">
                  <MessageSquare className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                  <h3 className="text-lg font-semibold mb-2">No social media campaigns</h3>
                  <p className="text-muted-foreground mb-4">
                    Create your first social media phishing campaign to get started.
                  </p>
                  <Button onClick={() => setShowCampaignForm(true)}>
                    <Plus className="h-4 w-4 mr-2" />
                    Create Campaign
                  </Button>
                </CardContent>
              </Card>
            ) : (
              campaigns.map((campaign) => (
                <Card key={campaign.id}>
                  <CardContent className="p-6">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h3 className="font-semibold text-lg">Campaign #{campaign.id.slice(0, 8)}</h3>
                        <p className="text-sm text-muted-foreground">
                          {campaign.campaign_type.replace('_', ' ')} • Platform: {campaign.platform_id}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge 
                          variant={campaign.status === 'running' ? 'default' : 'secondary'}
                        >
                          {campaign.status}
                        </Badge>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => deleteSocialMediaCampaign(campaign.id)}
                        >
                          Delete
                        </Button>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-3 gap-4 text-sm">
                      <div>
                        <span className="text-muted-foreground">Targets:</span>
                        <span className="ml-2 font-medium">{campaign.target_profiles.length}</span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Type:</span>
                        <span className="ml-2 font-medium capitalize">
                          {campaign.campaign_type.replace('_', ' ')}
                        </span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Created:</span>
                        <span className="ml-2 font-medium">
                          {new Date(campaign.created_at).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </TabsContent>

        <TabsContent value="templates" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {templates.map((template) => (
              <Card key={template.id}>
                <CardHeader>
                  <CardTitle className="text-lg">{template.template_name}</CardTitle>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline">{template.platform_name}</Badge>
                    <Badge variant={template.sophistication_level === 'high' ? 'destructive' : 'secondary'}>
                      {template.sophistication_level}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground mb-4">
                    {template.template_type.replace('_', ' ')} template
                  </p>
                  <div className="text-sm">
                    <span className="text-muted-foreground">Success Rate:</span>
                    <span className="ml-2 font-medium">{template.success_rate}%</span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="metrics">
          <SocialMediaMetrics />
        </TabsContent>
      </Tabs>

      {/* Dialogs */}
      {showCampaignForm && (
        <SocialMediaCampaignForm
          open={showCampaignForm}
          onClose={() => setShowCampaignForm(false)}
          onSubmit={async (data) => {
            await createSocialMediaCampaign(data);
            setShowCampaignForm(false);
          }}
          platforms={platforms}
          templates={templates}
        />
      )}

      {showTemplateEditor && (
        <SocialMediaTemplateEditor
          open={showTemplateEditor}
          onClose={() => setShowTemplateEditor(false)}
        />
      )}
    </div>
  );
};