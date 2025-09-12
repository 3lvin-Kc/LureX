import React, { useState } from "react";
import { MessageSquarePlus, Send, Star, ThumbsUp } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

export const FeatureRequestContent: React.FC = () => {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("");

  return (
    <div className="space-y-8">
      <div className="space-y-4">
        <div className="flex items-center space-x-3">
          <MessageSquarePlus className="h-8 w-8 text-primary" />
          <h1 className="text-4xl font-bold text-foreground">Feature Request</h1>
        </div>
        <p className="text-xl text-muted-foreground max-w-3xl">
          Help us improve LureX by suggesting new features and enhancements. 
          Your feedback drives our development roadmap.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Submit New Request</CardTitle>
            <CardDescription>Tell us about the feature you'd like to see</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Feature Title</label>
              <Input 
                placeholder="Brief description of the feature"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">Category</label>
              <select 
                className="w-full p-2 border rounded-md bg-background"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
              >
                <option value="">Select category</option>
                <option value="campaigns">Campaign Management</option>
                <option value="templates">Email Templates</option>
                <option value="analytics">Analytics & Reports</option>
                <option value="integrations">Integrations</option>
                <option value="ui">User Interface</option>
                <option value="other">Other</option>
              </select>
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">Detailed Description</label>
              <Textarea 
                placeholder="Describe the feature in detail, including use cases and benefits"
                rows={4}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>
            <Button className="w-full">
              <Send className="h-4 w-4 mr-2" />
              Submit Request
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Popular Requests</CardTitle>
            <CardDescription>Community-driven feature priorities</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {[
                {
                  title: "Advanced Email Scheduling",
                  category: "Campaigns",
                  votes: 47,
                  status: "In Progress"
                },
                {
                  title: "Mobile App for Monitoring",
                  category: "Mobile",
                  votes: 32,
                  status: "Planned"
                },
                {
                  title: "Slack Integration",
                  category: "Integrations",
                  votes: 28,
                  status: "Under Review"
                },
                {
                  title: "Custom Branding Options",
                  category: "UI",
                  votes: 21,
                  status: "Requested"
                }
              ].map((request, index) => (
                <div key={index} className="p-3 border rounded-lg">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1">
                      <h4 className="font-medium">{request.title}</h4>
                      <div className="flex items-center space-x-2 mt-1">
                        <Badge variant="outline" className="text-xs">{request.category}</Badge>
                        <Badge variant={
                          request.status === 'In Progress' ? 'default' :
                          request.status === 'Planned' ? 'secondary' :
                          request.status === 'Under Review' ? 'secondary' : 'outline'
                        } className="text-xs">
                          {request.status}
                        </Badge>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="flex items-center space-x-1 text-sm text-muted-foreground">
                        <ThumbsUp className="h-3 w-3" />
                        <span>{request.votes}</span>
                      </div>
                      <Button size="sm" variant="ghost">
                        <Star className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Request Guidelines</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-3">
              <h4 className="font-medium text-foreground">What Makes a Good Request</h4>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Clear and specific description</li>
                <li>• Explains the business value</li>
                <li>• Includes use case examples</li>
                <li>• Considers implementation complexity</li>
              </ul>
            </div>
            <div className="space-y-3">
              <h4 className="font-medium text-foreground">Request Process</h4>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Submit detailed request</li>
                <li>• Community voting period</li>
                <li>• Technical feasibility review</li>
                <li>• Development prioritization</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
