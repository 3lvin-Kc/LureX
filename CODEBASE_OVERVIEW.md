# 📚 Phishing Simulation Platform: Complete Codebase Overview

Welcome to this beginner-friendly guide to our phishing simulation platform! This document will walk you through everything that currently exists in our codebase, explaining how each piece works and fits together. Whether you're new to the project or just need a refresher, you'll find all the details here.

## 📦 Project Structure Overview

Our project is organized into a standard React/TypeScript application with Supabase for backend functionality. Here's how it's structured:

```
/
├── IMPLEMENTATION_PLAN.md      # Future implementation roadmap
├── src/                        # Main source code directory
│   ├── components/             # Reusable UI components
│   │   ├── ui/                 # Basic UI components (buttons, cards, etc.)
│   │   ├── dashboard/          # Dashboard-specific components
│   │   ├── campaigns/          # Campaign management components
│   │   ├── templates/          # Email template components
│   │   └── layout/             # Layout components (headers, footers, etc.)
│   ├── pages/                  # Application pages
│   ├── utils/                  # Utility functions
│   ├── hooks/                  # Custom React hooks
│   ├── integrations/           # External service integrations
│   │   └── supabase/           # Supabase client and types
│   ├── lib/                    # Shared library code
│   ├── App.tsx                 # Main application component
│   └── main.tsx                # Application entry point
├── supabase/                   # Supabase configuration and edge functions
│   ├── functions/              # Serverless edge functions
│   └── config.toml             # Supabase configuration
└── public/                     # Static assets
```

## ⚙️ Current Features & Functionality

Our phishing simulation platform currently includes:

1. **Campaign Management**
   - Create and configure phishing campaigns
   - Schedule campaigns for future deployment
   - Track campaign status and results

2. **Email Template Management**
   - Create and edit email templates
   - Support for HTML and plain text content
   - Template versioning

3. **Target List Management**
   - Organize targets into lists
   - Import and manage target information

4. **Phishing Page Management**
   - Create and edit custom phishing pages
   - Clone existing websites
   - Embed tracking into phishing pages

5. **Security & Logging**
   - Comprehensive security event logging
   - Anomaly detection for suspicious activities
   - Rate limiting to prevent abuse

6. **Dashboard & Reporting**
   - View campaign statistics and results
   - Generate reports on phishing susceptibility

## 🔍 File-by-File Breakdown

### Core Application Files

#### `src/main.tsx`
This is the entry point of our application. It renders the main `App` component into the DOM using React's `createRoot` API. We've wrapped the app in React's StrictMode for additional development checks.

```typescript
// The application's entry point that initializes React
import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';

const rootElement = document.getElementById('root');
if (!rootElement) throw new Error('Failed to find the root element');

const root = createRoot(rootElement);
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
```

#### `src/integrations/supabase/client.ts`
This file sets up our connection to Supabase, which serves as our backend database and authentication service. It creates and exports a Supabase client that we use throughout the application to interact with our data.

```typescript
// Supabase client setup for database and authentication
import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

const SUPABASE_URL = "https://obiornwzxtvsxpahbzcv.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...";

export const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY);
```

### UI Components

#### `src/components/ui/GlassPanel.tsx`
A reusable component that creates a modern glass-like panel with customizable opacity and blur effects. Used throughout the application for visual appeal.

```typescript
// Creates a translucent panel with glass-like effect
import React from 'react';
import { cn } from "@/lib/utils";

interface GlassPanelProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  className?: string;
  intensity?: 'light' | 'medium' | 'heavy';
}

const GlassPanel = ({ 
  children, 
  className, 
  intensity = 'medium',
  ...props 
}: GlassPanelProps) => {
  // Different blur and transparency settings based on intensity
  const intensityClasses = {
    light: 'bg-white/20 dark:bg-black/10 backdrop-blur-sm',
    medium: 'bg-white/40 dark:bg-black/20 backdrop-blur-md',
    heavy: 'bg-white/60 dark:bg-black/40 backdrop-blur-lg'
  };

  return (
    <div 
      className={cn(
        intensityClasses[intensity],
        'border border-white/20 dark:border-white/10 rounded-lg',
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
};

export default GlassPanel;
```

#### `src/components/ui/AnimatedCard.tsx`
An interactive card component with hover effects and animations. The card creates a glowing effect that follows the user's mouse cursor.

```typescript
// Interactive card with mouse-following glow effect
import React, { useEffect, useRef, useState } from 'react';
import { cn } from "@/lib/utils";

interface AnimatedCardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  className?: string;
  glowColor?: string;
  hoverEffect?: boolean;
}

const AnimatedCard = ({ 
  children, 
  className, 
  glowColor = 'rgba(59, 130, 246, 0.5)',
  hoverEffect = true,
  ...props 
}: AnimatedCardProps) => {
  const cardRef = useRef<HTMLDivElement>(null);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isHovering, setIsHovering] = useState(false);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!cardRef.current || !isHovering) return;
      
      const rect = cardRef.current.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      
      setPosition({ x, y });
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
    };
  }, [isHovering]);

  const handleMouseEnter = () => {
    setIsHovering(true);
  };

  const handleMouseLeave = () => {
    setIsHovering(false);
  };

  const glowStyle = isHovering ? {
    background: `radial-gradient(circle at ${position.x}px ${position.y}px, ${glowColor} 0%, rgba(255, 255, 255, 0) 70%)`,
    opacity: 0.6,
  } : {};

  return (
    <div 
      ref={cardRef}
      className={cn(
        'relative overflow-hidden rounded-lg border border-border bg-card text-card-foreground transition-all duration-300',
        hoverEffect && 'hover:-translate-y-1 hover:shadow-lg',
        className
      )}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      {...props}
    >
      {children}
      {hoverEffect && (
        <div 
          className="absolute inset-0 pointer-events-none transition-opacity duration-300" 
          style={glowStyle}
        />
      )}
    </div>
  );
};

export default AnimatedCard;
```

### Page Components

#### `src/pages/CreateTemplate.tsx`
A page component that allows users to create or edit email templates. It uses React Router's `useParams` to determine whether we're creating a new template or editing an existing one.

```typescript
// Page for creating or editing email templates
import React from "react";
import { useParams } from "react-router-dom";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import TemplateForm from "@/components/templates/TemplateForm";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";

const CreateTemplate = () => {
  // Check if we're editing an existing template
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const isEditing = !!id;

  return (
    <DashboardLayout>
      <div className="container mx-auto p-4 max-w-5xl">
        <Button 
          variant="ghost" 
          className="mb-4" 
          onClick={() => navigate("/templates")}
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Templates
        </Button>
        
        <div className="mb-6">
          <h1 className="text-3xl font-bold">
            {isEditing ? "Edit Email Template" : "Create New Email Template"}
          </h1>
          <p className="text-muted-foreground">
            {isEditing 
              ? "Make changes to your existing template" 
              : "Create a new phishing email template that can be used in campaigns"}
          </p>
        </div>

        <TemplateForm templateId={id} />
      </div>
    </DashboardLayout>
  );
};

export default CreateTemplate;
```

#### `src/pages/CreateCampaign.tsx`
A page component for creating new phishing campaigns. It includes a form for campaign configuration and a tab for explaining how phishing simulations work.

```typescript
// Page for creating new phishing campaigns
import React, { useEffect, useState } from 'react';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import CampaignForm from '@/components/campaigns/CampaignForm';
import { CampaignSimulationHelper } from '@/components/campaigns/CampaignSimulationHelper';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

const CreateCampaign = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('campaign');
  
  // Simulate loading for component mounting
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 300);
    
    return () => clearTimeout(timer);
  }, []);
  
  return (
    <DashboardLayout>
      <div className="container mx-auto p-4 max-w-7xl">
        <h1 className="text-3xl font-bold mb-6">Create Campaign</h1>
        
        <Tabs defaultValue="campaign" value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="mb-6">
            <TabsTrigger value="campaign">Campaign Details</TabsTrigger>
            <TabsTrigger value="how-it-works">How Phishing Simulations Work</TabsTrigger>
          </TabsList>
          
          <TabsContent value="campaign">
            {isLoading ? (
              <Card>
                <CardContent className="flex items-center justify-center h-64">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
                </CardContent>
              </Card>
            ) : (
              <CampaignForm />
            )}
          </TabsContent>
          
          <TabsContent value="how-it-works">
            <CampaignSimulationHelper />
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
};

export default CreateCampaign;
```

#### `src/pages/EditPhishingPage.tsx`
A page component for editing phishing pages. It uses React Hook Form for form management and Zod for validation.

```typescript
// Page for editing phishing pages
import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { ArrowLeft, LoaderCircle } from "lucide-react";

const formSchema = z.object({
  name: z.string().min(1, { message: "Page name is required" }),
  category: z.string().optional(),
  html_content: z.string().optional(),
  css_content: z.string().optional(),
  js_content: z.string().optional(),
});

const EditPhishingPage = () => {
  const { id } = useParams<{ id: string }>();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      category: "",
      html_content: "",
      css_content: "",
      js_content: "",
    },
  });

  useEffect(() => {
    const fetchPage = async () => {
      setIsLoading(true);
      try {
        const { data, error } = await supabase
          .from("phishing_pages")
          .select("*")
          .eq("id", id)
          .single();

        if (error) throw error;
        
        form.reset({
          name: data.name,
          category: data.category || "",
          html_content: data.html_content || "",
          css_content: data.css_content || "",
          js_content: data.js_content || "",
        });
      } catch (error) {
        console.error("Error fetching page:", error);
        toast({
          title: "Error",
          description: "Failed to load phishing page",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    if (id) {
      fetchPage();
    }
  }, [id, form, toast]);

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    setIsSaving(true);
    try {
      const { error } = await supabase
        .from("phishing_pages")
        .update({
          name: values.name,
          category: values.category,
          html_content: values.html_content,
          css_content: values.css_content,
          js_content: values.js_content,
          updated_at: new Date().toISOString(),
        })
        .eq("id", id);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Phishing page updated successfully",
      });
      navigate("/phishing-pages");
    } catch (error) {
      console.error("Error updating page:", error);
      toast({
        title: "Error",
        description: "Failed to update phishing page",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="container mx-auto p-4 max-w-4xl">
        <div className="mb-6">
          <Button
            variant="ghost"
            onClick={() => navigate("/phishing-pages")}
            className="mb-2"
          >
            <ArrowLeft className="w-4 h-4 mr-2" /> Back to Pages
          </Button>
          <h1 className="text-3xl font-bold">Edit Phishing Page</h1>
          <p className="text-muted-foreground">Modify your phishing page content and settings</p>
        </div>

        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <LoaderCircle className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : (
          <Card>
            <CardHeader>
              <CardTitle>Page Details</CardTitle>
              <CardDescription>
                Edit the content and settings of your phishing page
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Page Name</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="category"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Category</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select a category" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="Social">Social Media</SelectItem>
                            <SelectItem value="Banking">Banking</SelectItem>
                            <SelectItem value="Corporate">Corporate</SelectItem>
                            <SelectItem value="Cloud">Cloud Services</SelectItem>
                            <SelectItem value="E-commerce">E-commerce</SelectItem>
                            <SelectItem value="Cloned">Cloned</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="html_content"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>HTML Content</FormLabel>
                        <FormControl>
                          <Textarea 
                            {...field} 
                            className="font-mono h-64"
                            placeholder="<html>...</html>"
                          />
                        </FormControl>
                        <FormDescription>
                          HTML markup for the phishing page
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="css_content"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>CSS Content</FormLabel>
                        <FormControl>
                          <Textarea 
                            {...field} 
                            className="font-mono h-40"
                            placeholder="body { ... }"
                          />
                        </FormControl>
                        <FormDescription>
                          CSS styles for the phishing page
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="js_content"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>JavaScript Content</FormLabel>
                        <FormControl>
                          <Textarea 
                            {...field} 
                            className="font-mono h-40"
                            placeholder="function() { ... }"
                          />
                        </FormControl>
                        <FormDescription>
                          JavaScript code for the phishing page
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="flex justify-end gap-4">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => navigate(`/phishing-pages/${id}/preview`)}
                    >
                      Preview
                    </Button>
                    <Button type="submit" disabled={isSaving}>
                      {isSaving && <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />}
                      Save Changes
                    </Button>
                  </div>
                </form>
              </Form>
            </CardContent>
          </Card>
        )}
      </div>
    </DashboardLayout>
  );
};

export default EditPhishingPage;
```

#### `src/pages/Features.tsx`, `src/pages/Contact.tsx`, `src/pages/GDPRCompliance.tsx`
Marketing and information pages that provide details about the platform's features, contact information, and compliance with GDPR regulations.

### Utility Functions

#### `src/utils/rateLimiter.ts`
A client-side utility that helps prevent API abuse by limiting the number of requests a user can make in a given time period.

```typescript
// Client-side rate limiting to prevent API abuse
import { securityLogger, SecurityEventLevel, SecurityEventType } from "./securityLogger";

interface RateLimitOptions {
  maxRequests: number;    // Maximum number of requests allowed
  timeWindow: number;     // Time window in milliseconds
  storageKey?: string;    // Key to use for localStorage
  blockDuration?: number; // Duration to block in ms (defaults to 2x timeWindow)
  securityEventType?: SecurityEventType; // Type of security event to log when limit exceeded
}

export class RateLimiter {
  // Implementation of rate limiting logic
  // ...
  
  // Methods for checking if requests are allowed
  isAllowed(): boolean {
    // ... check if within limits
  }
  
  // Record a request attempt
  recordRequest(): void {
    // ... track the request
  }
  
  // Additional utility methods
  // ...
}

// Pre-configured limiters for common operations
export const authRateLimiter = new RateLimiter({/* auth config */});
export const apiRateLimiter = new RateLimiter({/* api config */});
export const formSubmissionLimiter = new RateLimiter({/* form config */});
export const sensitiveOperationLimiter = new RateLimiter({/* sensitive ops config */});
```

#### `src/utils/phishingFormTracker.ts`
A utility that adds tracking capabilities to phishing forms, capturing form submissions and sending the data back to our server.

```typescript
// Utility for tracking form submissions in phishing templates
export interface FormTrackingOptions {
  trackingId: string;
  pageId: string;
  redirectUrl?: string;
  submitEndpoint?: string;
  excludeFields?: string[];
}

// Add tracking code to a phishing page
export const addFormTracking = (html: string, options: FormTrackingOptions): string => {
  // Generate tracking script to inject
  const trackingScript = `
  <script>
    // JavaScript to capture form submissions
    // ...
  </script>
  `;
  
  // Add tracking pixel and disclaimer
  // ...
  
  // Insert the script into the HTML
  let modifiedHtml = html;
  // ... insert logic
  
  return modifiedHtml;
};

// Generate a complete phishing page with tracking
export const generatePhishingPage = (
  html: string,
  options: FormTrackingOptions,
  css?: string,
  js?: string
): string => {
  // Combine HTML, CSS, JS and add tracking
  // ...
  
  return trackedHtml;
};
```

#### `src/utils/processCampaignLinks.ts`
Functions that handle phishing link clicks, email opens, and form submissions. These are used by edge functions to process tracking events.

```typescript
// Process phishing campaign tracking events
import { supabase } from "@/integrations/supabase/client";
import { securityLogger, SecurityEventType } from "@/utils/securityLogger";
import { phishingTrackingService } from "./phishingTrackingService";
import { phishingPageService } from "./phishingPageService";

// Process a link click in a phishing email
export async function processPhishingLinkClick(
  trackingId: string,
  userAgent: string,
  ipAddress: string
): Promise<{
  redirectUrl: string;
  html?: string;
}> {
  try {
    // Get tracking data and determine where to redirect
    // ...
    
    // Check if this is a phishing page
    if (metadata?.pageId) {
      // Generate HTML with tracking
      // ...
    }
    
    // If it's a training page
    if (redirectUrl.includes('/training')) {
      // Generate training content
      // ...
    }
    
    return { redirectUrl };
  } catch (error) {
    // Error handling and logging
    // ...
  }
}

// Process email open tracking pixel
export async function processEmailOpen(
  trackingId: string,
  userAgent: string,
  ipAddress: string
): Promise<void> {
  // ... record email open
}

// Process form submission on a phishing page
export async function processFormSubmission(
  trackingId: string,
  formData: Record<string, string>,
  pageId: string
): Promise<void> {
  // ... record form submission
}
```

### Supabase Edge Functions

#### `supabase/functions/generate-template/index.ts`
An edge function that generates phishing email templates using AI. It connects to OpenAI's API and creates customized phishing templates based on provided parameters.

```typescript
// AI-powered phishing template generation
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import "https://deno.land/x/xhr@0.1.0/mod.ts";

// Template generation types and interfaces
enum TemplateType {
  EMAIL = 'email',
  SMS = 'sms',
  SOCIAL_MEDIA = 'social_media',
  VOICE_SCRIPT = 'voice_script'
}

// More enums and interfaces
// ...

// Handle incoming template generation requests
serve(async (req) => {
  // Handle CORS and extract options
  // ...
  
  // Create a prompt for the AI
  const prompt = createPromptForTemplate(options);
  
  // Generate content with AI
  const templateContent = await generateWithAI(prompt, options);
  
  // Return the generated template
  return new Response(/* response data */);
});

// Helper functions for template generation
function createPromptForTemplate(options: TemplateGenerationOptions): string {
  // Build a prompt based on template options
  // ...
}

async function generateWithAI(
  prompt: string,
  options: TemplateGenerationOptions
): Promise<{
  subject?: string;
  htmlContent?: string;
  textContent: string;
}> {
  // Call OpenAI API and process the response
  // ...
}

// Analyze phishing indicators in the generated content
async function analyzePhishingIndicators(content: string): Promise<string[]> {
  // Identify common phishing tactics in the content
  // ...
}
```

#### `supabase/functions/immutable-log/index.ts`
An edge function that provides secure, immutable logging for security events. It creates a cryptographic hash of log entries to ensure they cannot be modified.

```typescript
// Secure, immutable logging for security events
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.7";

// Initialize Supabase client
const supabase = createClient(/* connection details */);

// Handle CORS
const corsHeaders = {/* CORS configuration */};

// Define log levels and types
enum LogLevel {
  DEBUG = 'debug',
  INFO = 'info',
  WARNING = 'warning',
  ERROR = 'error',
  CRITICAL = 'critical'
}

enum LogType {
  AUTHENTICATION = 'authentication',
  AUTHORIZATION = 'authorization',
  DATA_ACCESS = 'data_access',
  // ... more log types
}

// Log entry interface
interface LogEntry {
  level: LogLevel;
  type: LogType;
  message: string;
  metadata?: any;
  // ... more fields
}

// Handle log requests
serve(async (req) => {
  // Process the log entry
  // Create a secure hash for immutability
  // Store in the database
  // Return confirmation
});
```

## 🧠 Key Concepts & Techniques Used

### 1. React Component Architecture
Our application uses a component-based architecture, where UI elements are broken down into reusable pieces. This makes our code more maintainable and enables easier testing.

**Example Components:**
- Container components (pages) - Handle data fetching and business logic
- Presentational components - Focus on UI rendering
- Layout components - Define page structure

### 2. Supabase Integration
We use Supabase as our backend-as-a-service platform. It provides:
- PostgreSQL database
- Authentication
- Edge functions (serverless)
- Storage

**How we connect:**
```typescript
// Create a client to connect to Supabase
import { createClient } from '@supabase/supabase-js';
export const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

// Example query
const { data, error } = await supabase
  .from('campaigns')
  .select('*')
  .eq('created_by', userId);
```

### 3. Security & Logging
We've implemented multiple security layers:

**Rate Limiting:**
```typescript
// Prevent API abuse
if (!apiRateLimiter.tryRequest()) {
  return { error: "Too many requests" };
}
```

**Security Logging:**
```typescript
// Log security events
securityLogger.warn(
  SecurityEventType.AUTHENTICATION,
  "Failed login attempt",
  { username, ipAddress }
);
```

**Anomaly Detection:**
```typescript
// Check for suspicious patterns
if (isAnomalous(eventData)) {
  securityLogger.error(
    SecurityEventType.SUSPICIOUS_ACTIVITY,
    "Unusual access pattern detected",
    eventData
  );
}
```

### 4. Form Handling & Validation
We use React Hook Form with Zod validation for robust form handling:

```typescript
// Define validation schema
const formSchema = z.object({
  name: z.string().min(1, { message: "Name is required" }),
  email: z.string().email({ message: "Valid email required" })
});

// Use in component
const form = useForm<z.infer<typeof formSchema>>({
  resolver: zodResolver(formSchema),
  defaultValues: { name: "", email: "" }
});

// Form submission
const onSubmit = (values: z.infer<typeof formSchema>) => {
  // Process form data
};
```

### 5. Phishing Simulation Techniques
The core of our platform involves several phishing simulation techniques:

**Email Tracking:**
- Tracking pixels to detect when emails are opened
- Unique tracking IDs for each sent email
- Click tracking for links in emails

**Phishing Pages:**
- Form submission tracking
- Automatic redirection after submission
- Legal compliance disclaimers

**Campaign Management:**
- Scheduled delivery
- Target segmentation
- Results analysis

## 🛠 Tools & Libraries in Use

### Frontend Libraries

#### React
- **Purpose:** UI component library
- **Why:** Component-based architecture, virtual DOM for efficient updates, large ecosystem

#### TypeScript
- **Purpose:** Static typing for JavaScript
- **Why:** Catch errors at compile time, better IDE support, improved code maintenance

#### React Router
- **Purpose:** Client-side routing
- **Why:** Enables navigation between pages without full page reloads

#### Shadcn UI / Radix UI
- **Purpose:** Accessible UI components
- **Why:** Pre-built accessible components that can be customized with Tailwind

#### Tailwind CSS
- **Purpose:** Utility-first CSS framework
- **Why:** Rapid styling without writing custom CSS, consistent design system

#### React Hook Form
- **Purpose:** Form state management and validation
- **Why:** Performance optimization through uncontrolled components, easy validation

#### Zod
- **Purpose:** Schema validation
- **Why:** TypeScript-first validation library with strong type inference

#### Lucide React
- **Purpose:** Icon library
- **Why:** Consistent, customizable SVG icons

### Backend Tools

#### Supabase
- **Purpose:** Backend-as-a-service
- **Why:** Combines database, authentication, storage, and serverless functions

#### Deno & Edge Functions
- **Purpose:** Serverless functions
- **Why:** Secure runtime for server-side code without managing servers

#### PostgreSQL
- **Purpose:** Relational database
- **Why:** Robust, battle-tested database with powerful query capabilities

### Development Tools

#### Vite
- **Purpose:** Build tool and development server
- **Why:** Fast HMR (Hot Module Replacement), optimized production builds

## 📌 Small Details & Hidden Logic

### Utility Functions

#### `cn` Function (src/lib/utils.ts)
This small but powerful utility merges class names with Tailwind's variant handling:

```typescript
import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
```

It allows us to combine classes conditionally while avoiding conflicts between Tailwind classes.

### Security Implementations

#### Progressive Rate Limiting
Our rate limiting increases the block duration for repeat offenders:

```typescript
// In rateLimiter.ts
if (this.state.violations > 3) {
  // Exponential backoff for repeat violations
  const multiplier = Math.min(Math.pow(2, this.state.violations - 3), 12);
  this.state.blockedUntil = now + (this.options.blockDuration || this.options.timeWindow * 2) * multiplier;
  
  securityLogger.error(
    SecurityEventType.SUSPICIOUS_ACTIVITY,
    `Multiple rate limit violations detected. Extended block applied.`,
    { violations: this.state.violations, multiplier: multiplier }
  );
}
```

#### Immutable Security Logs
We create cryptographic hashes of security logs to prevent tampering:

```typescript
// Generate a secure hash of the log entry for immutability verification
const logEntryString = JSON.stringify({/* log data */});
const encoder = new TextEncoder();
const data = encoder.encode(logEntryString);
const hashBuffer = await crypto.subtle.digest('SHA-256', data);
const hashArray = Array.from(new Uint8Array(hashBuffer));
const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
```

### User Experience Enhancements

#### Loading States
We implement consistent loading states across the application:

```typescript
{isLoading ? (
  <div className="flex justify-center items-center h-64">
    <LoaderCircle className="h-8 w-8 animate-spin text-primary" />
  </div>
) : (
  <ActualContent />
)}
```

#### Smart Form Defaults
When possible, we pre-populate forms with intelligent defaults:

```typescript
// Default to a sensible schedule time (next day, 9 AM)
const defaultScheduleTime = () => {
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  tomorrow.setHours(9, 0, 0, 0);
  return tomorrow.toISOString();
};
```

## 🚧 Current Limitations & Placeholder Implementations

Some parts of the codebase are currently implemented as placeholders or simulations:

1. **Email Delivery System:**
   - Currently simulated, not connected to actual email providers
   - Will need integration with SendGrid, Amazon SES, or similar

2. **Phishing Link Processing:**
   - Basic implementation exists but needs real-world tracking enhancements
   - Full click-path tracking to be implemented

3. **Multi-Vector Phishing:**
   - Email vector implemented, but SMS, voice, and social media are stubs
   - Need integrations with respective service providers

4. **Authentication:**
   - Basic Supabase auth setup, but missing MFA and enterprise SSO
   - Security enhancements needed

These are areas that would be prioritized in our implementation plan to move from prototype to production.

This overview should give you a comprehensive understanding of what exists in the codebase and how the various pieces fit together.
