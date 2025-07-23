import { supabase } from "@/integrations/supabase/client";
import { securityLogger, SecurityEventType } from "@/utils/securityLogger";

export interface DomainConfiguration {
  id: string;
  domain: string;
  verified: boolean;
  ssl_enabled: boolean;
  dns_records: {
    type: string;
    name: string;
    value: string;
    ttl: number;
  }[];
  verification_token: string;
  created_at: string;
  updated_at: string;
  verified_at?: string;
  user_id: string;
}

// Database row type
interface DomainRow {
  id: string;
  domain: string;
  verified: boolean;
  ssl_enabled: boolean;
  dns_records: any; // JSON type from database
  verification_token: string;
  created_at: string;
  updated_at: string;
  verified_at?: string;
  user_id: string;
}

export class RealDomainService {
  private static instance: RealDomainService;
  
  private constructor() {}
  
  public static getInstance(): RealDomainService {
    if (!RealDomainService.instance) {
      RealDomainService.instance = new RealDomainService();
    }
    return RealDomainService.instance;
  }

  private generateVerificationToken(): string {
    return crypto.randomUUID().replace(/-/g, '');
  }

  private generateDNSRecords(domain: string, verificationToken: string): DomainConfiguration['dns_records'] {
    const platformDomain = 'pjfbjfjvuwqjqyuvwriq.supabase.co'; // Your Supabase project domain
    
    return [
      {
        type: 'CNAME',
        name: domain,
        value: platformDomain,
        ttl: 3600
      },
      {
        type: 'TXT',
        name: `_LureX-verification.${domain}`,
        value: `LureX-verify=${verificationToken}`,
        ttl: 300
      }
    ];
  }

  private isValidDomain(domain: string): boolean {
    const domainRegex = /^[a-zA-Z0-9][a-zA-Z0-9-_]*\.([a-zA-Z]{2,}|[a-zA-Z]{2,}\.[a-zA-Z]{2,})$/;
    return domainRegex.test(domain);
  }

  public async addCustomDomain(domain: string): Promise<DomainConfiguration> {
    try {
      // Validate domain format
      if (!this.isValidDomain(domain)) {
        throw new Error('Invalid domain format');
      }

      // Check if domain already exists
      const { data: existingDomain } = await supabase
        .from('custom_domains')
        .select('id')
        .eq('domain', domain)
        .maybeSingle();

      if (existingDomain) {
        throw new Error('Domain already configured');
      }

      const verificationToken = this.generateVerificationToken();
      const dnsRecords = this.generateDNSRecords(domain, verificationToken);

      // Get current user
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error('Authentication required');
      }

      const { data, error } = await supabase
        .from('custom_domains')
        .insert({
          domain,
          dns_records: dnsRecords,
          verification_token: verificationToken,
          user_id: user.id,
        })
        .select()
        .single();

      if (error) {
        throw new Error(error.message);
      }

      const domainConfig: DomainConfiguration = {
        ...data,
        dns_records: data.dns_records as DomainConfiguration['dns_records']
      };

      securityLogger.info(
        SecurityEventType.CONFIGURATION_CHANGE,
        "Custom domain added",
        { domain, domainId: domainConfig.id }
      );

      return domainConfig;
    } catch (error: any) {
      securityLogger.error(
        SecurityEventType.CONFIGURATION_CHANGE,
        "Failed to add custom domain",
        { error: error.message, domain }
      );
      throw error;
    }
  }

  public async verifyDomain(domainId: string): Promise<boolean> {
    try {
      const { data, error } = await supabase.functions.invoke('verify-domain', {
        body: { domainId }
      });

      if (error) {
        throw new Error(error.message);
      }

      return data?.verified || false;
    } catch (error: any) {
      securityLogger.error(
        SecurityEventType.CONFIGURATION_CHANGE,
        "Failed to verify domain",
        { error: error.message, domainId }
      );
      throw error;
    }
  }

  public async getDomainConfigurations(): Promise<DomainConfiguration[]> {
    try {
      const { data, error } = await supabase
        .from('custom_domains')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        throw new Error(error.message);
      }

      return (data || []).map(this.transformDomainRow);
    } catch (error: any) {
      console.error('Failed to load domain configurations:', error);
      return [];
    }
  }

  public async getDomainConfiguration(domainId: string): Promise<DomainConfiguration | null> {
    try {
      const { data, error } = await supabase
        .from('custom_domains')
        .select('*')
        .eq('id', domainId)
        .maybeSingle();

      if (error) {
        throw new Error(error.message);
      }

      return data ? this.transformDomainRow(data) : null;
    } catch (error: any) {
      console.error('Failed to get domain configuration:', error);
      return null;
    }
  }

  public async removeDomain(domainId: string): Promise<void> {
    try {
      // First check if domain is used in any campaigns
      const { data: campaigns } = await supabase
        .from('campaigns')
        .select('id, name')
        .eq('domain_id', domainId);

      if (campaigns && campaigns.length > 0) {
        throw new Error(`Cannot delete domain. It is used in ${campaigns.length} campaign(s).`);
      }

      const { error } = await supabase
        .from('custom_domains')
        .delete()
        .eq('id', domainId);

      if (error) {
        throw new Error(error.message);
      }

      securityLogger.info(
        SecurityEventType.CONFIGURATION_CHANGE,
        "Custom domain removed",
        { domainId }
      );
    } catch (error: any) {
      securityLogger.error(
        SecurityEventType.CONFIGURATION_CHANGE,
        "Failed to remove custom domain",
        { error: error.message, domainId }
      );
      throw error;
    }
  }

  public generatePhishingURL(domainId: string, campaignId: string, targetId: string): string {
    // This will be used by the campaign service to generate tracking URLs
    const trackingToken = btoa(`${campaignId}:${targetId}:${Date.now()}`);
    return `/p/${trackingToken}`; // Domain will be added by edge function
  }

  public async getVerifiedDomains(): Promise<DomainConfiguration[]> {
    try {
      const { data, error } = await supabase
        .from('custom_domains')
        .select('*')
        .eq('verified', true)
        .order('created_at', { ascending: false });

      if (error) {
        throw new Error(error.message);
      }

      return (data || []).map(this.transformDomainRow);
    } catch (error: any) {
      console.error('Failed to load verified domains:', error);
      return [];
    }
  }

  private transformDomainRow(row: DomainRow): DomainConfiguration {
    return {
      ...row,
      dns_records: Array.isArray(row.dns_records) ? row.dns_records : []
    };
  }
}

export const realDomainService = RealDomainService.getInstance();