
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import CloneWebsiteWarning from '@/components/phishing/CloneWebsiteWarning';
import { Checkbox } from '@/components/ui/checkbox';
import { Globe, Info, AlertCircle, Loader2 } from 'lucide-react';
import { securityLogger, SecurityEventType } from '@/utils/securityLogger';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { apiRateLimiter } from '@/utils/rateLimiter';

const CloneWebsitePage = () => {
  const [url, setUrl] = useState<string>('');
  const [name, setName] = useState<string>('');
  const [category, setCategory] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [agreeToTerms, setAgreeToTerms] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [warningAccepted, setWarningAccepted] = useState<boolean>(false);
  const [advancedCloning, setAdvancedCloning] = useState<boolean>(false);
  const [progress, setProgress] = useState<number>(0);
  const [progressMessage, setProgressMessage] = useState<string>('');
  
  const { toast } = useToast();
  const navigate = useNavigate();
  
  const validateInput = () => {
    if (!url) {
      setError('Please enter a URL to clone');
      return false;
    }
    
    if (!name) {
      setError('Please enter a name for the phishing page');
      return false;
    }
    
    if (!category) {
      setError('Please enter a category for the phishing page');
      return false;
    }
    
    if (!agreeToTerms) {
      setError('You must agree to the terms before proceeding');
      return false;
    }
    
    if (!warningAccepted) {
      setError('You must acknowledge the warning before proceeding');
      return false;
    }
    
    try {
      new URL(url);
    } catch (e) {
      setError('Please enter a valid URL including http:// or https://');
      return false;
    }
    
    setError(null);
    return true;
  };
  
  const handleClone = async () => {
    if (!validateInput()) return;
    
    // Rate limiting check
    if (!apiRateLimiter.tryRequest()) {
      toast({
        title: "Rate limit exceeded",
        description: "Please wait a moment before trying again",
        variant: "destructive"
      });
      return;
    }
    
    try {
      setIsLoading(true);
      setProgress(10);
      setProgressMessage('Initializing cloning process');
      
      // Log the attempt
      securityLogger.info(
        SecurityEventType.DATA_ACCESS,
        "Website cloning initiated",
        { url, name, category, advancedCloning }
      );
      
      setProgress(20);
      setProgressMessage('Requesting website content');
      
      // Call the edge function to clone the website
      const { data, error } = await supabase.functions.invoke('clone-website', {
        body: { 
          url, 
          name, 
          category,
          advancedCloning
        }
      });
      
      if (error) {
        throw new Error(error.message);
      }
      
      if (!data.success) {
        throw new Error(data.error || 'Failed to clone website');
      }
      
      setProgress(100);
      setProgressMessage('Cloning complete!');
      
      toast({
        title: "Website Cloned",
        description: "The website has been successfully cloned.",
      });
      
      // Log success
      securityLogger.info(
        SecurityEventType.DATA_ACCESS,
        "Website successfully cloned",
        { url, pageId: data.pageId }
      );
      
      // Redirect to the phishing pages list
      navigate('/phishing-pages');
    } catch (error: any) {
      setProgress(0);
      
      // Log failure
      securityLogger.error(
        SecurityEventType.DATA_ACCESS,
        "Website cloning failed",
        { url, error: error.message }
      );
      
      toast({
        title: "Error",
        description: "Failed to clone website. Please try again or use a different URL.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  const updateProgress = (value: number, message: string) => {
    setProgress(value);
    setProgressMessage(message);
  };
  
  return (
    <DashboardLayout>
      <div className="container mx-auto px-4 py-8 max-w-5xl">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold">Clone Website</h1>
            <p className="text-muted-foreground">Create a phishing page by cloning an existing website</p>
          </div>
        </div>
        
        <div className="grid gap-6">
          <CloneWebsiteWarning onAccept={() => setWarningAccepted(true)} />
          
          {!warningAccepted && (
            <Alert variant="warning">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Warning</AlertTitle>
              <AlertDescription>
                Please review and accept the warning above before proceeding.
              </AlertDescription>
            </Alert>
          )}
          
          {warningAccepted && (
            <Card>
              <CardHeader>
                <CardTitle>Clone a Website</CardTitle>
                <CardDescription>
                  Enter the URL of the website you want to clone and provide details for the new phishing page.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="url">Website URL</Label>
                  <div className="flex items-center space-x-2">
                    <Globe className="w-5 h-5 text-muted-foreground" />
                    <Input
                      id="url"
                      placeholder="https://example.com"
                      value={url}
                      onChange={(e) => setUrl(e.target.value)}
                      disabled={isLoading}
                    />
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Enter the full URL including http:// or https://
                  </p>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="name">Phishing Page Name</Label>
                  <Input
                    id="name"
                    placeholder="Corporate Login Portal"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    disabled={isLoading}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="category">Category</Label>
                  <Input
                    id="category"
                    placeholder="Finance, Healthcare, Technology, etc."
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    disabled={isLoading}
                  />
                </div>
                
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="advancedCloning"
                      checked={advancedCloning}
                      onCheckedChange={(checked) => setAdvancedCloning(checked as boolean)}
                      disabled={isLoading}
                    />
                    <Label htmlFor="advancedCloning" className="font-normal">
                      Use advanced cloning (deeper resource capture, form detection)
                    </Label>
                  </div>
                  <p className="text-sm text-muted-foreground ml-6">
                    Enables more comprehensive cloning with better form handling and resource capture. May take longer.
                  </p>
                </div>
                
                <div className="pt-2">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="agreeToTerms"
                      checked={agreeToTerms}
                      onCheckedChange={(checked) => setAgreeToTerms(checked as boolean)}
                      disabled={isLoading}
                    />
                    <Label htmlFor="agreeToTerms" className="font-normal">
                      I agree to use this feature ethically and in compliance with applicable laws
                    </Label>
                  </div>
                </div>
                
                {error && (
                  <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertTitle>Error</AlertTitle>
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}
                
                {isLoading && progress > 0 && (
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>{progressMessage}</span>
                      <span>{progress}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2.5 dark:bg-gray-700">
                      <div 
                        className="bg-blue-600 h-2.5 rounded-full transition-all duration-300" 
                        style={{ width: `${progress}%` }}
                      ></div>
                    </div>
                  </div>
                )}
              </CardContent>
              <CardFooter className="flex justify-between">
                <Button variant="outline" onClick={() => navigate('/phishing-pages')} disabled={isLoading}>
                  Cancel
                </Button>
                <Button onClick={handleClone} disabled={isLoading}>
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Cloning...
                    </>
                  ) : (
                    'Clone Website'
                  )}
                </Button>
              </CardFooter>
            </Card>
          )}
          
          <Card>
            <CardHeader>
              <CardTitle>About Website Cloning</CardTitle>
              <CardDescription>
                Important information about using the website cloning feature
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Alert>
                <Info className="h-4 w-4" />
                <AlertTitle>What This Feature Does</AlertTitle>
                <AlertDescription>
                  <p className="mt-1">
                    This feature creates a copy of a website's frontend appearance for phishing simulation purposes.
                    It captures HTML, CSS, and essential resources to create a convincing phishing page.
                  </p>
                </AlertDescription>
              </Alert>
              
              <Alert>
                <Info className="h-4 w-4" />
                <AlertTitle>Best Practices</AlertTitle>
                <AlertDescription>
                  <ul className="list-disc pl-5 mt-1 space-y-1">
                    <li>Choose websites relevant to your organization's security training needs</li>
                    <li>Modify cloned pages to make them more relevant to your specific training scenario</li>
                    <li>Always inform users after a phishing test that it was a simulation</li>
                    <li>Provide educational resources after a simulation to help users learn</li>
                  </ul>
                </AlertDescription>
              </Alert>
              
              <Alert variant="warning">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Limitations</AlertTitle>
                <AlertDescription>
                  <ul className="list-disc pl-5 mt-1 space-y-1">
                    <li>Dynamic website functionality will not be preserved</li>
                    <li>JavaScript functionality may be limited or non-functional</li>
                    <li>Some modern websites with complex security measures may not clone properly</li>
                    <li>External resources might be blocked by the target website</li>
                  </ul>
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default CloneWebsitePage;
