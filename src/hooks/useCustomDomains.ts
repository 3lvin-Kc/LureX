import { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { realDomainService, DomainConfiguration } from '@/utils/realDomainService';
import { supabase } from '@/integrations/supabase/client';

export const useCustomDomains = () => {
  const [domains, setDomains] = useState<DomainConfiguration[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const loadDomains = async () => {
    try {
      setLoading(true);
      setError(null);
      const domainList = await realDomainService.getDomainConfigurations();
      setDomains(domainList);
    } catch (err: any) {
      setError(err.message);
      toast({
        title: "Error loading domains",
        description: err.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const addDomain = async (domain: string): Promise<boolean> => {
    try {
      const newDomain = await realDomainService.addCustomDomain(domain);
      setDomains(prev => [newDomain, ...prev]);
      toast({
        title: "Domain Added",
        description: "Custom domain has been added. Please configure the DNS records to verify.",
      });
      return true;
    } catch (err: any) {
      toast({
        title: "Error adding domain",
        description: err.message,
        variant: "destructive",
      });
      return false;
    }
  };

  const verifyDomain = async (domainId: string): Promise<boolean> => {
    try {
      const verified = await realDomainService.verifyDomain(domainId);
      
      if (verified) {
        // Reload domains to get updated verification status
        await loadDomains();
        toast({
          title: "Domain Verified",
          description: "Your domain has been successfully verified and is now active.",
        });
      } else {
        toast({
          title: "Verification Failed",
          description: "Please check your DNS configuration and try again.",
          variant: "destructive",
        });
      }
      
      return verified;
    } catch (err: any) {
      toast({
        title: "Error verifying domain",
        description: err.message,
        variant: "destructive",
      });
      return false;
    }
  };

  const removeDomain = async (domainId: string): Promise<boolean> => {
    try {
      await realDomainService.removeDomain(domainId);
      setDomains(prev => prev.filter(d => d.id !== domainId));
      toast({
        title: "Domain Removed",
        description: "Custom domain has been removed.",
      });
      return true;
    } catch (err: any) {
      toast({
        title: "Error removing domain",
        description: err.message,
        variant: "destructive",
      });
      return false;
    }
  };

  // Set up real-time subscription
  useEffect(() => {
    loadDomains();

    const channel = supabase
      .channel('custom-domains-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'custom_domains'
        },
        () => {
          loadDomains(); // Reload on any change
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const getVerifiedDomains = () => {
    return domains.filter(domain => domain.verified);
  };

  return {
    domains,
    loading,
    error,
    addDomain,
    verifyDomain,
    removeDomain,
    loadDomains,
    getVerifiedDomains,
  };
};