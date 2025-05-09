
/**
 * IMPORTANT: This file is now a simplified version without authentication.
 * It contains stub functions to maintain compatibility with existing code.
 */

export enum AuthMethod {
  PASSWORD = 'password',
  TOTP = 'totp',
  BIOMETRIC = 'biometric',
  HARDWARE_KEY = 'hardware_key',
  SMS = 'sms'
}

export enum SecurityLevel {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  CRITICAL = 'critical'
}

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

export class AuthSecurityService {
  private static instance: AuthSecurityService;
  
  private constructor() {
    // Empty constructor
  }
  
  public static getInstance(): AuthSecurityService {
    if (!AuthSecurityService.instance) {
      AuthSecurityService.instance = new AuthSecurityService();
    }
    return AuthSecurityService.instance;
  }
  
  public async registerAuthFactor(): Promise<AuthResult> {
    return {
      success: true,
      timestamp: Date.now(),
      requestId: 'demo-request',
      securityLevel: SecurityLevel.LOW
    };
  }
  
  public checkSecurityLevel(): boolean {
    return true;
  }
  
  public getCurrentSecurityLevel(): SecurityLevel {
    return SecurityLevel.LOW;
  }
  
  public getSessionAuthMethods(): AuthMethod[] {
    return [];
  }
  
  public clearSession(): void {
    // Do nothing
  }
}

export const authSecurity = AuthSecurityService.getInstance();

export function withSecurityLevel<T extends (...args: any[]) => any>(
  fn: T,
  _requiredLevel: SecurityLevel
): (...args: Parameters<T>) => ReturnType<T> | null {
  return (...args: Parameters<T>): ReturnType<T> | null => {
    return fn(...args);
  };
}
