
import { supabase } from "@/integrations/supabase/client";
import { securityLogger, SecurityEventType } from "@/utils/securityLogger";
import { sensitiveOperationLimiter } from "@/utils/rateLimiter";
import { nanoid } from "nanoid";

/**
 * Advanced multi-factor authentication service
 * Supports 2FA, biometric, and hardware key authentication
 */
export enum AuthMethod {
  PASSWORD = 'password',
  TOTP = 'totp',
  BIOMETRIC = 'biometric',
  HARDWARE_KEY = 'hardware_key',
  SMS = 'sms'
}

// Define required authentication levels for different operations
export enum SecurityLevel {
  LOW = 'low',         // Password only
  MEDIUM = 'medium',   // Password + one additional factor
  HIGH = 'high',       // Password + two additional factors
  CRITICAL = 'critical' // All available factors required
}

// Security operation result with audit trail
interface AuthResult {
  success: boolean;
  userId?: string;
  sessionId?: string;
  authMethods?: AuthMethod[];
  timestamp: number;
  requestId: string;
  securityLevel: SecurityLevel;
  additionalInfo?: Record<string, any>;
}

/**
 * Advanced authentication service with multi-factor support
 */
export class AuthSecurityService {
  private static instance: AuthSecurityService;
  private activeSessionFactors: Map<string, Set<AuthMethod>> = new Map();
  private securityLevelRequirements: Map<SecurityLevel, number> = new Map();
  
  private constructor() {
    // Define required factor counts for each security level
    this.securityLevelRequirements.set(SecurityLevel.LOW, 1); // Password only
    this.securityLevelRequirements.set(SecurityLevel.MEDIUM, 2); // Password + one factor
    this.securityLevelRequirements.set(SecurityLevel.HIGH, 3); // Password + two factors
    this.securityLevelRequirements.set(SecurityLevel.CRITICAL, 4); // All factors
  }
  
  public static getInstance(): AuthSecurityService {
    if (!AuthSecurityService.instance) {
      AuthSecurityService.instance = new AuthSecurityService();
    }
    return AuthSecurityService.instance;
  }
  
  /**
   * Register an authentication factor for the current session
   */
  public async registerAuthFactor(
    sessionId: string, 
    method: AuthMethod, 
    verificationData: any
  ): Promise<AuthResult> {
    // Check rate limiting for sensitive operations
    if (!sensitiveOperationLimiter.tryRequest()) {
      securityLogger.warn(
        SecurityEventType.RATE_LIMIT,
        "Too many authentication attempts",
        { sessionId, method }
      );
      
      return {
        success: false,
        timestamp: Date.now(),
        requestId: nanoid(),
        securityLevel: SecurityLevel.LOW,
        additionalInfo: { error: "Rate limit exceeded" }
      };
    }
    
    try {
      // Validate the authentication factor
      const isValid = await this.validateAuthFactor(method, verificationData);
      
      if (isValid) {
        // Get or create the session's factor set
        if (!this.activeSessionFactors.has(sessionId)) {
          this.activeSessionFactors.set(sessionId, new Set());
        }
        
        // Add this factor to the session
        const sessionFactors = this.activeSessionFactors.get(sessionId);
        sessionFactors?.add(method);
        
        const { data: { user } } = await supabase.auth.getUser();
        
        // Log successful factor registration
        securityLogger.info(
          SecurityEventType.AUTHENTICATION,
          `Registered auth factor: ${method}`,
          { 
            userId: user?.id, 
            sessionId,
            authMethod: method
          }
        );
        
        return {
          success: true,
          userId: user?.id,
          sessionId,
          authMethods: [...(sessionFactors || [])],
          timestamp: Date.now(),
          requestId: nanoid(),
          securityLevel: this.getCurrentSecurityLevel(sessionId)
        };
      }
      
      // Log failed authentication attempt
      securityLogger.warn(
        SecurityEventType.AUTHENTICATION,
        `Failed to register auth factor: ${method}`,
        { sessionId, method }
      );
      
      return {
        success: false,
        timestamp: Date.now(),
        requestId: nanoid(),
        securityLevel: SecurityLevel.LOW,
        additionalInfo: { error: "Invalid authentication factor" }
      };
    } catch (error) {
      securityLogger.error(
        SecurityEventType.AUTHENTICATION,
        "Error during auth factor registration",
        { error, sessionId, method }
      );
      
      return {
        success: false,
        timestamp: Date.now(),
        requestId: nanoid(),
        securityLevel: SecurityLevel.LOW,
        additionalInfo: { error: "Internal error during authentication" }
      };
    }
  }
  
  /**
   * Check if the current session meets the required security level
   */
  public checkSecurityLevel(sessionId: string, requiredLevel: SecurityLevel): boolean {
    const currentLevel = this.getCurrentSecurityLevel(sessionId);
    const currentLevelValue = this.securityLevelRequirements.get(currentLevel) || 0;
    const requiredLevelValue = this.securityLevelRequirements.get(requiredLevel) || 0;
    
    return currentLevelValue >= requiredLevelValue;
  }
  
  /**
   * Get the current security level based on registered factors
   */
  public getCurrentSecurityLevel(sessionId: string): SecurityLevel {
    const factors = this.activeSessionFactors.get(sessionId);
    
    if (!factors || factors.size === 0) {
      return SecurityLevel.LOW;
    }
    
    const factorCount = factors.size;
    
    if (factorCount >= 4) return SecurityLevel.CRITICAL;
    if (factorCount >= 3) return SecurityLevel.HIGH;
    if (factorCount >= 2) return SecurityLevel.MEDIUM;
    return SecurityLevel.LOW;
  }
  
  /**
   * Get registered authentication methods for a session
   */
  public getSessionAuthMethods(sessionId: string): AuthMethod[] {
    const factors = this.activeSessionFactors.get(sessionId);
    return factors ? Array.from(factors) : [];
  }
  
  /**
   * Remove a session and all its authentication factors
   */
  public clearSession(sessionId: string): void {
    this.activeSessionFactors.delete(sessionId);
  }
  
  /**
   * Validate a specific authentication factor
   */
  private async validateAuthFactor(method: AuthMethod, data: any): Promise<boolean> {
    try {
      switch (method) {
        case AuthMethod.PASSWORD:
          // Password is validated by Supabase Auth directly
          return true;
          
        case AuthMethod.TOTP:
          // Validate time-based one-time password
          return this.validateTOTP(data.code, data.secret);
          
        case AuthMethod.BIOMETRIC:
          // Validate Web Authentication API biometric data
          return this.validateBiometric(data);
          
        case AuthMethod.HARDWARE_KEY:
          // Validate hardware security key (e.g., YubiKey)
          return this.validateHardwareKey(data);
          
        case AuthMethod.SMS:
          // Validate SMS verification code
          return this.validateSMS(data.code, data.phoneNumber);
          
        default:
          return false;
      }
    } catch (error) {
      securityLogger.error(
        SecurityEventType.AUTHENTICATION,
        `Error validating ${method} factor`,
        { error }
      );
      return false;
    }
  }
  
  // Factor validation methods
  private validateTOTP(code: string, secret: string): boolean {
    // Placeholder: Implement TOTP validation logic
    // This would use a TOTP library to verify the code against the secret
    return code === '123456'; // Placeholder implementation
  }
  
  private validateBiometric(data: any): boolean {
    // Placeholder: Implement WebAuthn validation
    // This would verify a credential from the Web Authentication API
    return true; // Placeholder implementation
  }
  
  private validateHardwareKey(data: any): boolean {
    // Placeholder: Implement hardware key validation
    // This would verify a U2F or FIDO2 credential
    return true; // Placeholder implementation
  }
  
  private validateSMS(code: string, phoneNumber: string): boolean {
    // Placeholder: Implement SMS code validation
    // This would verify a code sent to the user's phone
    return code === '123456'; // Placeholder implementation
  }
}

export const authSecurity = AuthSecurityService.getInstance();

/**
 * Protected operation wrapper that ensures the required security level is met
 */
export function withSecurityLevel<T extends (...args: any[]) => any>(
  fn: T,
  requiredLevel: SecurityLevel
): (...args: Parameters<T>) => ReturnType<T> | null {
  return (...args: Parameters<T>): ReturnType<T> | null => {
    const sessionId = window.localStorage.getItem('supabase.auth.token'); // Simplified
    
    if (!sessionId) {
      securityLogger.warn(
        SecurityEventType.AUTHORIZATION,
        "No active session for protected operation",
        { requiredLevel }
      );
      return null;
    }
    
    // Check if the session meets the required security level
    const authService = AuthSecurityService.getInstance();
    if (!authService.checkSecurityLevel(sessionId, requiredLevel)) {
      securityLogger.warn(
        SecurityEventType.AUTHORIZATION,
        "Insufficient security level for protected operation",
        { 
          requiredLevel,
          currentLevel: authService.getCurrentSecurityLevel(sessionId),
          registeredFactors: authService.getSessionAuthMethods(sessionId)
        }
      );
      return null;
    }
    
    // Execute the protected function
    return fn(...args);
  };
}
