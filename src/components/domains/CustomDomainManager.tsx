
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { customDomainService, DomainConfiguration } from '@/utils/customDomainService';
import { useToast } from '@/hooks/use-toast';
import { Globe, CheckCircle, XCircle, Copy, Trash2, Plus } from 'lucide-react';

const CustomDomainManager: React.FC = () => {
  const [domains, setDomains] = useState<DomainConfiguration[]>([]);
  const [newDomain, setNewDomain] = useState('');
  const [isAdding, setIsAdding] = useState(false);
  const [verifyingDomains, setVerifyingDomains] = useState<Set<string>>(new Set());
  const { toast } = useToast();

  useEffect(() => {
    loadDomains();
  }, []);

  const loadDomains = () => {
    const domainConfigs = customDomainService.getDomainConfigurations();
    setDomains(domainConfigs);
  };

  const handleAddDomain = async () => {
    if (!newDomain.trim()) return;

    setIsAdding(true);
    try {
      await customDomainService.addCustomDomain(newDomain);
      loadDomains();
      setNewDomain('');
      toast({
        title: "Domain Added",
        description: "Custom domain has been added. Please configure the DNS records to verify.",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsAdding(false);
    }
  };

  const handleVerifyDomain = async (domainId: string) => {
    setVerifyingDomains(prev => new Set(prev).add(domainId));
    
    try {
      const verified = await customDomainService.verifyDomain(domainId);
      
      if (verified) {
        toast({
          title: "Domain Verified",
          description: "Your domain has been successfully verified and is now active.",
        });
        loadDomains();
      } else {
        toast({
          title: "Verification Failed",
          description: "Please check your DNS configuration and try again.",
          variant: "destructive",
        });
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setVerifyingDomains(prev => {
        const next = new Set(prev);
        next.delete(domainId);
        return next;
      });
    }
  };

  const handleRemoveDomain = async (domainId: string) => {
    try {
      await customDomainService.removeDomain(domainId);
      loadDomains();
      toast({
        title: "Domain Removed",
        description: "Custom domain has been removed.",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Copied",
      description: "DNS record copied to clipboard.",
    });
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Globe className="h-5 w-5" />
            Custom Domain Management
          </CardTitle>
          <CardDescription>
            Configure custom domains for your phishing campaigns
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2 mb-4">
            <Input
              placeholder="Enter domain (e.g., phishing.example.com)"
              value={newDomain}
              onChange={(e) => setNewDomain(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleAddDomain()}
            />
            <Button onClick={handleAddDomain} disabled={isAdding}>
              {isAdding ? (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
              ) : (
                <Plus className="h-4 w-4" />
              )}
              Add Domain
            </Button>
          </div>

          <div className="space-y-4">
            {domains.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                No custom domains configured yet
              </div>
            ) : (
              domains.map((domain) => (
                <Card key={domain.id} className="border">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="text-lg font-semibold">{domain.domain}</div>
                        <Badge variant={domain.verified ? "default" : "secondary"}>
                          {domain.verified ? (
                            <><CheckCircle className="h-3 w-3 mr-1" /> Verified</>
                          ) : (
                            <><XCircle className="h-3 w-3 mr-1" /> Pending</>
                          )}
                        </Badge>
                        {domain.sslEnabled && (
                          <Badge variant="outline">SSL Enabled</Badge>
                        )}
                      </div>
                      <div className="flex gap-2">
                        {!domain.verified && (
                          <Button
                            size="sm"
                            onClick={() => handleVerifyDomain(domain.id)}
                            disabled={verifyingDomains.has(domain.id)}
                          >
                            {verifyingDomains.has(domain.id) ? (
                              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
                            ) : (
                              'Verify'
                            )}
                          </Button>
                        )}
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => handleRemoveDomain(domain.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    {!domain.verified && (
                      <Alert className="mb-4">
                        <AlertDescription>
                          Configure the following DNS records with your domain provider:
                        </AlertDescription>
                      </Alert>
                    )}
                    
                    <div className="space-y-3">
                      {domain.dnsRecords.map((record, index) => (
                        <div key={index} className="p-3 bg-gray-50 rounded-lg">
                          <div className="grid grid-cols-1 md:grid-cols-4 gap-2 text-sm">
                            <div>
                              <strong>Type:</strong> {record.type}
                            </div>
                            <div className="md:col-span-2">
                              <strong>Name:</strong> {record.name}
                            </div>
                            <div>
                              <strong>TTL:</strong> {record.ttl}
                            </div>
                          </div>
                          <div className="flex items-center gap-2 mt-2">
                            <div className="flex-1 text-sm">
                              <strong>Value:</strong> {record.value}
                            </div>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => copyToClipboard(record.value)}
                            >
                              <Copy className="h-3 w-3" />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>

                    {domain.verified && (
                      <div className="mt-4 p-3 bg-green-50 rounded-lg">
                        <div className="text-sm text-green-800">
                          <strong>✅ Domain is active and ready for use</strong>
                        </div>
                        <div className="text-xs text-green-600 mt-1">
                          Verified on {new Date(domain.verifiedAt!).toLocaleString()}
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default CustomDomainManager;
