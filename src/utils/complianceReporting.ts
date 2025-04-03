import { securityLogger, SecurityEventType } from "@/utils/securityLogger";
import { supabase } from "@/integrations/supabase/client";
import { encryptionService } from "./encryptionService";

export enum ComplianceFramework {
  GDPR = 'gdpr',
  HIPAA = 'hipaa',
  PCI_DSS = 'pci_dss',
  ISO_27001 = 'iso_27001',
  NIST_800_53 = 'nist_800_53',
  SOC2 = 'soc2',
  CCPA = 'ccpa',
  LGPD = 'lgpd'
}

export enum ReportType {
  CAMPAIGN_SUMMARY = 'campaign_summary',
  USER_SUSCEPTIBILITY = 'user_susceptibility',
  DEPARTMENT_COMPARISON = 'department_comparison',
  TREND_ANALYSIS = 'trend_analysis',
  VULNERABILITY_ASSESSMENT = 'vulnerability_assessment',
  COMPLIANCE_AUDIT = 'compliance_audit',
  SECURITY_AWARENESS = 'security_awareness',
  EXECUTIVE_SUMMARY = 'executive_summary',
  DATA_EXPORT = 'data_export'
}

export interface ReportOptions {
  reportType: ReportType;
  startDate?: string;
  endDate?: string;
  campaignIds?: string[];
  departments?: string[];
  userIds?: string[];
  complianceFrameworks?: ComplianceFramework[];
  includeRawData?: boolean;
  aggregationLevel?: 'daily' | 'weekly' | 'monthly';
  format?: 'pdf' | 'excel' | 'csv' | 'json' | 'html';
  customParameters?: Record<string, any>;
}

export interface ComplianceRequirement {
  id: string;
  framework: ComplianceFramework;
  section: string;
  requirement: string;
  description: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  associatedControls: string[];
}

export interface ComplianceStatus {
  requirement: ComplianceRequirement;
  status: 'compliant' | 'partially_compliant' | 'non_compliant' | 'not_applicable';
  evidence?: string;
  implementationDetails?: string;
  lastChecked: string;
  nextReview?: string;
  remediationPlan?: string;
}

/**
 * Compliance and Reporting Service
 * Manages compliance with various frameworks and generates reports
 */
export class ComplianceReportingService {
  private static instance: ComplianceReportingService;
  private complianceRequirements: Map<ComplianceFramework, ComplianceRequirement[]> = new Map();
  
  private constructor() {
    // Initialize compliance requirements
    this.initializeComplianceRequirements();
  }
  
  public static getInstance(): ComplianceReportingService {
    if (!ComplianceReportingService.instance) {
      ComplianceReportingService.instance = new ComplianceReportingService();
    }
    return ComplianceReportingService.instance;
  }
  
  /**
   * Generate a report based on specified options
   */
  public async generateReport(options: ReportOptions): Promise<{ reportId: string; downloadUrl?: string }> {
    try {
      securityLogger.info(
        SecurityEventType.DATA_ACCESS,
        "Report generation requested",
        { options }
      );
      
      // Call the generate-report edge function
      const { data, error } = await supabase.functions.invoke("generate-report", {
        body: { options }
      });
      
      if (error) throw error;
      
      securityLogger.info(
        SecurityEventType.DATA_ACCESS,
        "Report generated successfully",
        { reportId: data.reportId, reportType: options.reportType }
      );
      
      return data;
    } catch (error) {
      securityLogger.error(
        SecurityEventType.DATA_ACCESS,
        "Failed to generate report",
        { error, reportType: options.reportType }
      );
      
      throw new Error(`Report generation failed: ${error.message}`);
    }
  }
  
  /**
   * Check compliance against a specific framework
   */
  public async checkCompliance(framework: ComplianceFramework): Promise<ComplianceStatus[]> {
    try {
      securityLogger.info(
        SecurityEventType.DATA_ACCESS,
        "Compliance check requested",
        { framework }
      );
      
      // Get requirements for this framework
      const requirements = this.complianceRequirements.get(framework) || [];
      
      const complianceStatuses: ComplianceStatus[] = [];
      
      // For each requirement, check compliance status
      for (const requirement of requirements) {
        const status = await this.checkRequirementCompliance(requirement);
        complianceStatuses.push(status);
      }
      
      securityLogger.info(
        SecurityEventType.DATA_ACCESS,
        "Compliance check completed",
        { 
          framework,
          requirementsChecked: requirements.length,
          complianceRate: this.calculateComplianceRate(complianceStatuses)
        }
      );
      
      return complianceStatuses;
    } catch (error) {
      securityLogger.error(
        SecurityEventType.DATA_ACCESS,
        "Failed to check compliance",
        { error, framework }
      );
      
      throw new Error(`Compliance check failed: ${error.message}`);
    }
  }
  
  /**
   * Schedule automated report generation
   */
  public async scheduleReport(
    options: ReportOptions, 
    schedule: { frequency: 'daily' | 'weekly' | 'monthly' | 'quarterly', time?: string, dayOfWeek?: number, dayOfMonth?: number }
  ): Promise<string> {
    try {
      securityLogger.info(
        SecurityEventType.AUTHORIZATION,
        "Report scheduling requested",
        { options, schedule }
      );
      
      // Call the schedule-report edge function
      const { data, error } = await supabase.functions.invoke("schedule-report", {
        body: { options, schedule }
      });
      
      if (error) throw error;
      
      securityLogger.info(
        SecurityEventType.AUTHORIZATION,
        "Report scheduled successfully",
        { scheduleId: data.scheduleId, reportType: options.reportType, frequency: schedule.frequency }
      );
      
      return data.scheduleId;
    } catch (error) {
      securityLogger.error(
        SecurityEventType.AUTHORIZATION,
        "Failed to schedule report",
        { error, reportType: options.reportType }
      );
      
      throw new Error(`Report scheduling failed: ${error.message}`);
    }
  }
  
  /**
   * Export data in a specific compliance format
   */
  public async exportComplianceData(
    framework: ComplianceFramework,
    format: 'pdf' | 'excel' | 'csv' | 'json',
    startDate?: string,
    endDate?: string
  ): Promise<{ exportId: string; downloadUrl?: string }> {
    try {
      securityLogger.info(
        SecurityEventType.DATA_ACCESS,
        "Compliance data export requested",
        { framework, format, startDate, endDate }
      );
      
      // Call the export-compliance-data edge function
      const { data, error } = await supabase.functions.invoke("export-compliance-data", {
        body: { framework, format, startDate, endDate }
      });
      
      if (error) throw error;
      
      securityLogger.info(
        SecurityEventType.DATA_ACCESS,
        "Compliance data exported successfully",
        { exportId: data.exportId, framework, format }
      );
      
      return data;
    } catch (error) {
      securityLogger.error(
        SecurityEventType.DATA_ACCESS,
        "Failed to export compliance data",
        { error, framework, format }
      );
      
      throw new Error(`Compliance data export failed: ${error.message}`);
    }
  }
  
  /**
   * Check if user data needs anonymization for compliance
   */
  public async checkDataAnonymizationRequirements(
    data: any,
    frameworks: ComplianceFramework[]
  ): Promise<{ requiresAnonymization: boolean; fields: string[] }> {
    try {
      // Default to using GDPR as the strictest framework if none specified
      const effectiveFrameworks = frameworks.length > 0 ? frameworks : [ComplianceFramework.GDPR];
      
      let requiresAnonymization = false;
      const fieldsToAnonymize: string[] = [];
      
      // Check for PII fields that need anonymization
      if (data.hasOwnProperty('email')) {
        requiresAnonymization = true;
        fieldsToAnonymize.push('email');
      }
      
      if (data.hasOwnProperty('name') || data.hasOwnProperty('firstName') || data.hasOwnProperty('lastName')) {
        requiresAnonymization = true;
        fieldsToAnonymize.push('name', 'firstName', 'lastName');
      }
      
      if (data.hasOwnProperty('phone') || data.hasOwnProperty('phoneNumber')) {
        requiresAnonymization = true;
        fieldsToAnonymize.push('phone', 'phoneNumber');
      }
      
      if (data.hasOwnProperty('address')) {
        requiresAnonymization = true;
        fieldsToAnonymize.push('address');
      }
      
      if (data.hasOwnProperty('ip') || data.hasOwnProperty('ipAddress')) {
        requiresAnonymization = true;
        fieldsToAnonymize.push('ip', 'ipAddress');
      }
      
      return {
        requiresAnonymization,
        fields: [...new Set(fieldsToAnonymize)]
      };
    } catch (error) {
      securityLogger.error(
        SecurityEventType.DATA_ACCESS,
        "Failed to check data anonymization requirements",
        { error, frameworks }
      );
      
      return {
        requiresAnonymization: true, // Default to requiring anonymization on error
        fields: []
      };
    }
  }
  
  /**
   * Anonymize data for compliance
   */
  public async anonymizeData(
    data: any,
    fields: string[]
  ): Promise<any> {
    try {
      // Create a deep copy of the data
      const anonymizedData = JSON.parse(JSON.stringify(data));
      
      // Process each field that needs anonymization
      for (const field of fields) {
        if (anonymizedData.hasOwnProperty(field)) {
          // Hash the field value for pseudonymization
          const fieldValue = anonymizedData[field];
          if (typeof fieldValue === 'string') {
            anonymizedData[field] = await encryptionService.hash(fieldValue);
          }
        }
      }
      
      return anonymizedData;
    } catch (error) {
      securityLogger.error(
        SecurityEventType.DATA_ACCESS,
        "Failed to anonymize data",
        { error, fields }
      );
      
      throw new Error(`Data anonymization failed: ${error.message}`);
    }
  }
  
  /**
   * Initialize compliance requirements for various frameworks
   */
  private initializeComplianceRequirements(): void {
    // GDPR requirements
    this.complianceRequirements.set(ComplianceFramework.GDPR, [
      {
        id: 'gdpr-1',
        framework: ComplianceFramework.GDPR,
        section: 'Article 5',
        requirement: 'Lawfulness, fairness and transparency',
        description: 'Personal data shall be processed lawfully, fairly and in a transparent manner.',
        severity: 'critical',
        associatedControls: ['consent', 'privacy-notice']
      },
      {
        id: 'gdpr-2',
        framework: ComplianceFramework.GDPR,
        section: 'Article 6',
        requirement: 'Lawfulness of processing',
        description: 'Processing shall be lawful only if at least one legal basis applies.',
        severity: 'critical',
        associatedControls: ['consent', 'legitimate-interest']
      },
      // More requirements would be added here
    ]);
    
    // NIST 800-53 requirements
    this.complianceRequirements.set(ComplianceFramework.NIST_800_53, [
      {
        id: 'nist-1',
        framework: ComplianceFramework.NIST_800_53,
        section: 'AC-2',
        requirement: 'Account Management',
        description: 'The organization manages information system accounts.',
        severity: 'high',
        associatedControls: ['access-control', 'authentication']
      },
      {
        id: 'nist-2',
        framework: ComplianceFramework.NIST_800_53,
        section: 'AC-3',
        requirement: 'Access Enforcement',
        description: 'The system enforces approved authorizations for access.',
        severity: 'high',
        associatedControls: ['access-control', 'authorization']
      },
      // More requirements would be added here
    ]);
    
    // Other frameworks would be initialized similarly
  }
  
  /**
   * Check compliance for a specific requirement
   */
  private async checkRequirementCompliance(requirement: ComplianceRequirement): Promise<ComplianceStatus> {
    // This would implement specific logic to check each requirement
    // For now, returning a placeholder status
    return {
      requirement,
      status: 'compliant', // Placeholder
      lastChecked: new Date().toISOString()
    };
  }
  
  /**
   * Calculate overall compliance rate
   */
  private calculateComplianceRate(statuses: ComplianceStatus[]): number {
    if (statuses.length === 0) return 0;
    
    const compliantCount = statuses.filter(s => s.status === 'compliant').length;
    const partialCount = statuses.filter(s => s.status === 'partially_compliant').length;
    
    // Count partial compliance as 0.5
    return (compliantCount + (partialCount * 0.5)) / statuses.length;
  }
}

export const complianceReporting = ComplianceReportingService.getInstance();
