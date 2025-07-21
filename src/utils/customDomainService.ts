
import { securityLogger, SecurityEventType } from "@/utils/securityLogger";

export interface DomainConfiguration {
  id: string;
  domain: string;
  verified: boolean;
  sslEnabled: boolean;
  dnsRecords: {
    type: string;
    name: string;
    value: string;
    ttl: number;
  }[];
  createdAt: string;
  verifiedAt?: string;
}

export class CustomDomainService {
  private static instance: CustomDomainService;
  private domains: Map<string, DomainConfiguration> = new Map();
  
  private constructor() {
    this.loadDomainConfigurations();
  }
  
  public static getInstance(): CustomDomainService {
    if (!CustomDomainService.instance) {
      CustomDomainService.instance = new CustomDomainService();
    }
    return CustomDomainService.instance;
  }
  
  private loadDomainConfigurations() {
    // Load from localStorage for demo purposes
    const saved = localStorage.getItem('customDomains');
    if (saved) {
      try {
        const domains = JSON.parse(saved);
        domains.forEach((domain: DomainConfiguration) => {
          this.domains.set(domain.id, domain);
        });
      } catch (error) {
        console.error('Failed to load domain configurations:', error);
      }
    }
  }
  
  private saveDomainConfigurations() {
    try {
      const domains = Array.from(this.domains.values());
      localStorage.setItem('customDomains', JSON.stringify(domains));
    } catch (error) {
      console.error('Failed to save domain configurations:', error);
    }
  }
  
  public async addCustomDomain(domain: string): Promise<DomainConfiguration> {
    try {
      // Validate domain format
      if (!this.isValidDomain(domain)) {
        throw new Error('Invalid domain format');
      }
      
      // Check if domain already exists
      const existingDomain = Array.from(this.domains.values()).find(d => d.domain === domain);
      if (existingDomain) {
        throw new Error('Domain already configured');
      }
      
      const domainConfig: DomainConfiguration = {
        id: crypto.randomUUID(),
        domain,
        verified: false,
        sslEnabled: false,
        dnsRecords: this.generateDNSRecords(domain),
        createdAt: new Date().toISOString()
      };
      
      this.domains.set(domainConfig.id, domainConfig);
      this.saveDomainConfigurations();
      
      securityLogger.info(
        SecurityEventType.CONFIGURATION_CHANGE,
        "Custom domain added",
        { domain, domainId: domainConfig.id }
      );
      
      return domainConfig;
    } catch (error) {
      securityLogger.error(
        SecurityEventType.CONFIGURATION_CHANGE,
        "Failed to add custom domain",
        { error, domain }
      );
      throw error;
    }
  }
  
  private isValidDomain(domain: string): boolean {
    const domainRegex = /^[a-zA-Z0-9][a-zA-Z0-9-_]*\.([a-zA-Z]{2,}|[a-zA-Z]{2,}\.[a-zA-Z]{2,})$/;
    return domainRegex.test(domain);
  }
  
  private generateDNSRecords(domain: string): DomainConfiguration['dnsRecords'] {
    const baseUrl = window.location.hostname;
    
    return [
      {
        type: 'CNAME',
        name: domain,
        value: baseUrl,
        ttl: 3600
      },
      {
        type: 'TXT',
        name: `_phishguard-verification.${domain}`,
        value: `phishguard-verify=${crypto.randomUUID()}`,
        ttl: 300
      }
    ];
  }
  
  public async verifyDomain(domainId: string): Promise<boolean> {
    try {
      const domainConfig = this.domains.get(domainId);
      if (!domainConfig) {
        throw new Error('Domain configuration not found');
      }
      
      // Simulate DNS verification (in real implementation, this would check actual DNS records)
      const verified = await this.performDNSVerification(domainConfig);
      
      if (verified) {
        domainConfig.verified = true;
        domainConfig.verifiedAt = new Date().toISOString();
        domainConfig.sslEnabled = true; // Auto-enable SSL after verification
        
        this.domains.set(domainId, domainConfig);
        this.saveDomainConfigurations();
        
        securityLogger.info(
          SecurityEventType.CONFIGURATION_CHANGE,
          "Domain verified successfully",
          { domain: domainConfig.domain, domainId }
        );
      }
      
      return verified;
    } catch (error) {
      securityLogger.error(
        SecurityEventType.CONFIGURATION_CHANGE,
        "Failed to verify domain",
        { error, domainId }
      );
      throw error;
    }
  }
  
  private async performDNSVerification(domainConfig: DomainConfiguration): Promise<boolean> {
    try {
      // In a real implementation, this would:
      // 1. Check if the CNAME record points to our platform
      // 2. Verify the TXT record contains the verification token
      // 3. Test if the domain resolves correctly
      
      // For demo purposes, simulate a successful verification after a delay
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // 80% success rate for demo
      return Math.random() > 0.2;
    } catch (error) {
      return false;
    }
  }
  
  public getDomainConfigurations(): DomainConfiguration[] {
    return Array.from(this.domains.values());
  }
  
  public getDomainConfiguration(domainId: string): DomainConfiguration | undefined {
    return this.domains.get(domainId);
  }
  
  public async removeDomain(domainId: string): Promise<void> {
    try {
      const domainConfig = this.domains.get(domainId);
      if (!domainConfig) {
        throw new Error('Domain configuration not found');
      }
      
      this.domains.delete(domainId);
      this.saveDomainConfigurations();
      
      securityLogger.info(
        SecurityEventType.CONFIGURATION_CHANGE,
        "Custom domain removed",
        { domain: domainConfig.domain, domainId }
      );
    } catch (error) {
      securityLogger.error(
        SecurityEventType.CONFIGURATION_CHANGE,
        "Failed to remove custom domain",
        { error, domainId }
      );
      throw error;
    }
  }
  
  public generatePhishingURL(domainId: string, campaignId: string, targetId: string): string {
    const domainConfig = this.domains.get(domainId);
    if (!domainConfig || !domainConfig.verified) {
      throw new Error('Domain not verified or not found');
    }
    
    const protocol = domainConfig.sslEnabled ? 'https' : 'http';
    const trackingToken = btoa(`${campaignId}:${targetId}:${Date.now()}`);
    
    return `${protocol}://${domainConfig.domain}/p/${trackingToken}`;
  }
}

export const customDomainService = CustomDomainService.getInstance();
