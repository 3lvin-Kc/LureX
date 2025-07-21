
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useCustomDomains } from '@/hooks/useCustomDomains';
import { useToast } from '@/hooks/use-toast';
import { Globe, CheckCircle, XCircle, Copy, Trash2, Plus, RefreshCw } from 'lucide-react';

const CustomDomainManager: React.FC = () => {
  const [newDomain, setNewDomain] = useState('');
  const [isAdding, setIsAdding] = useState(false);
  const [verifyingDomains, setVerifyingDomains] = useState<Set<string>>(new Set());
  const { toast } = useToast();
  
  const { 
    domains, 
    loading, 
    addDomain, 
    verifyDomain, 
    removeDomain,
    loadDomains
  } = useCustomDomains();

  const handleAddDomain = async () => {
    if (!newDomain.trim()) return;

    setIsAdding(true);
    try {
      const success = await addDomain(newDomain);
      if (success) {
        setNewDomain('');
      }
    } finally {
      setIsAdding(false);
    }
  };

  const handleVerifyDomain = async (domainId: string) => {
    setVerifyingDomains(prev => new Set(prev).add(domainId));
    
    try {
      await verifyDomain(domainId);
    } finally {
      setVerifyingDomains(prev => {
        const next = new Set(prev);
        next.delete(domainId);
        return next;
      });
    }
  };

  const handleRemoveDomain = async (domainId: string) => {
    await removeDomain(domainId);
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
              disabled={isAdding}
            />
            <Button onClick={handleAddDomain} disabled={isAdding || loading}>
              {isAdding ? (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
              ) : (
                <Plus className="h-4 w-4" />
              )}
              Add Domain
            </Button>
            <Button 
              variant="outline" 
              onClick={loadDomains} 
              disabled={loading}
              className="shrink-0"
            >
              <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            </Button>
          </div>

          <div className="space-y-4">
            {loading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto"></div>
                <p className="text-muted-foreground mt-2">Loading domains...</p>
              </div>
            ) : domains.length === 0 ? (
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
                        {domain.ssl_enabled && (
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
                      {domain.dns_records.map((record, index) => (
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
                          Verified on {new Date(domain.verified_at!).toLocaleString()}
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
