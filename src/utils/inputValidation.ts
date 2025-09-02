import { z } from 'zod';
import { securityLogger, SecurityEventType } from './securityLogger';

/**
 * Enhanced input validation with security focus
 */

// XSS Prevention regex patterns
const XSS_PATTERNS = [
  /<script[^>]*>.*?<\/script>/gi,
  /<iframe[^>]*>.*?<\/iframe>/gi,
  /javascript:/gi,
  /vbscript:/gi,
  /on\w+\s*=/gi,
  /<object[^>]*>.*?<\/object>/gi,
  /<embed[^>]*>.*?<\/embed>/gi,
  /<applet[^>]*>.*?<\/applet>/gi,
  /<meta[^>]*http-equiv/gi,
  /<link[^>]*>/gi
];

// SQL Injection patterns
const SQL_INJECTION_PATTERNS = [
  /(\s|^|;)(union|select|insert|update|delete|drop|create|alter|exec|execute)\s/gi,
  /(\s|^|;)(or|and)\s+\w+\s*[=<>]/gi,
  /['"]\s*(or|and)\s*['"]?\w+['"]?\s*[=<>]/gi,
  /\/\*.*?\*\//g,
  /--[^\r\n]*/g,
  /;\s*--.*/g
];

// Command Injection patterns  
const COMMAND_INJECTION_PATTERNS = [
  /[;&|`$(){}[\]]/g,
  /\.\.\//g,
  /\/etc\/passwd/gi,
  /\/proc\//gi,
  /cmd\.exe/gi,
  /powershell/gi,
  /bash|sh|zsh|fish/gi
];

/**
 * Enhanced string validation with XSS protection
 */
export const createSecureStringSchema = (
  minLength = 1,
  maxLength = 1000,
  allowHtml = false
) => {
  return z.string()
    .min(minLength, `Must be at least ${minLength} characters`)
    .max(maxLength, `Must be no more than ${maxLength} characters`)
    .refine(
      (value) => {
        // Check for XSS patterns if HTML is not explicitly allowed
        if (!allowHtml) {
          const hasXss = XSS_PATTERNS.some(pattern => pattern.test(value));
          if (hasXss) {
            securityLogger.warn(SecurityEventType.INPUT_VALIDATION, 'XSS attempt blocked', {
              input: value.substring(0, 100) + '...',
              patterns: XSS_PATTERNS.filter(p => p.test(value))
            });
            return false;
          }
        }
        
        // Check for SQL injection patterns
        const hasSqlInjection = SQL_INJECTION_PATTERNS.some(pattern => pattern.test(value));
        if (hasSqlInjection) {
          securityLogger.warn(SecurityEventType.INPUT_VALIDATION, 'SQL injection attempt blocked', {
            input: value.substring(0, 100) + '...'
          });
          return false;
        }
        
        // Check for command injection patterns
        const hasCommandInjection = COMMAND_INJECTION_PATTERNS.some(pattern => pattern.test(value));
        if (hasCommandInjection) {
          securityLogger.warn(SecurityEventType.INPUT_VALIDATION, 'Command injection attempt blocked', {
            input: value.substring(0, 100) + '...'
          });
          return false;
        }
        
        return true;
      },
      {
        message: "Input contains potentially dangerous content"
      }
    );
};

/**
 * Email validation with enhanced security
 */
export const createSecureEmailSchema = () => {
  return z.string()
    .email("Invalid email format")
    .max(254, "Email too long") // RFC 5321 limit
    .refine(
      (email) => {
        // Additional email security checks
        const normalizedEmail = email.toLowerCase();
        
        // Block common disposable email patterns
        const disposablePatterns = [
          /10minutemail|tempmail|guerrillamail|throwaway/gi,
          /mailinator|dispostable|temp-mail/gi
        ];
        
        const isDisposable = disposablePatterns.some(pattern => pattern.test(normalizedEmail));
        if (isDisposable) {
          securityLogger.info(SecurityEventType.SUSPICIOUS_ACTIVITY, 'Disposable email detected', {
            email: normalizedEmail
          });
        }
        
        return true; // Allow but log
      }
    );
};

/**
 * Password validation with security requirements
 */
export const createSecurePasswordSchema = () => {
  return z.string()
    .min(12, "Password must be at least 12 characters")
    .max(128, "Password too long")
    .refine(
      (password) => {
        // Check password strength
        const hasUpper = /[A-Z]/.test(password);
        const hasLower = /[a-z]/.test(password);
        const hasNumber = /\d/.test(password);
        const hasSpecial = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password);
        
        const strength = [hasUpper, hasLower, hasNumber, hasSpecial].filter(Boolean).length;
        
        if (strength < 3) {
          securityLogger.warn(SecurityEventType.AUTHENTICATION, 'Weak password attempt', {
            strength,
            hasUpper,
            hasLower,
            hasNumber,
            hasSpecial
          });
          return false;
        }
        
        return true;
      },
      {
        message: "Password must contain at least 3 of: uppercase, lowercase, numbers, special characters"
      }
    );
};

/**
 * URL validation with security checks
 */
export const createSecureUrlSchema = () => {
  return z.string()
    .url("Invalid URL format")
    .refine(
      (url) => {
        try {
          const urlObj = new URL(url);
          
          // Block dangerous protocols
          const allowedProtocols = ['http:', 'https:'];
          if (!allowedProtocols.includes(urlObj.protocol)) {
            securityLogger.warn(SecurityEventType.SUSPICIOUS_ACTIVITY, 'Dangerous protocol blocked', {
              url,
              protocol: urlObj.protocol
            });
            return false;
          }
          
          // Block localhost/private IP ranges in production
          const hostname = urlObj.hostname.toLowerCase();
          const privatePatterns = [
            /^localhost$/,
            /^127\./,
            /^10\./,
            /^192\.168\./,
            /^172\.(1[6-9]|2[0-9]|3[01])\./
          ];
          
          const isPrivate = privatePatterns.some(pattern => pattern.test(hostname));
          if (isPrivate && process.env.NODE_ENV === 'production') {
            securityLogger.warn(SecurityEventType.SUSPICIOUS_ACTIVITY, 'Private IP access blocked', {
              url,
              hostname
            });
            return false;
          }
          
          return true;
        } catch (error) {
          return false;
        }
      },
      {
        message: "URL contains potentially dangerous content"
      }
    );
};

/**
 * File upload validation
 */
export const createSecureFileSchema = (
  allowedTypes: string[] = ['image/jpeg', 'image/png', 'image/gif'],
  maxSize = 5 * 1024 * 1024 // 5MB
) => {
  return z.object({
    name: createSecureStringSchema(1, 255),
    type: z.string().refine(
      (type) => allowedTypes.includes(type),
      {
        message: `File type not allowed. Allowed: ${allowedTypes.join(', ')}`
      }
    ),
    size: z.number().max(maxSize, `File too large. Max size: ${Math.round(maxSize / 1024 / 1024)}MB`)
  });
};

/**
 * Template content validation (more permissive for phishing simulation)
 */
export const createTemplateContentSchema = () => {
  return createSecureStringSchema(1, 50000, true) // Allow HTML but still check for dangerous patterns
    .refine(
      (content) => {
        // Allow most HTML but block extremely dangerous patterns
        const dangerousPatterns = [
          /<script[^>]*src=["'][^"']*["'][^>]*>/gi, // External script sources
          /<iframe[^>]*src=["'][^"']*["'][^>]*>/gi, // External iframe sources  
          /javascript:\s*(?:void\(0\)|alert|eval|document\.)/gi, // Dangerous JS calls
        ];
        
        const hasDangerous = dangerousPatterns.some(pattern => pattern.test(content));
        if (hasDangerous) {
          securityLogger.warn(SecurityEventType.INPUT_VALIDATION, 'Dangerous template content blocked', {
            content: content.substring(0, 200) + '...'
          });
          return false;
        }
        
        return true;
      },
      {
        message: "Template contains potentially dangerous external references"
      }
    );
};

/**
 * Campaign name validation
 */
export const createCampaignNameSchema = () => {
  return createSecureStringSchema(1, 100).refine(
    (name) => {
      // Additional business logic validation
      const reservedNames = ['admin', 'system', 'test', 'demo'];
      if (reservedNames.includes(name.toLowerCase())) {
        securityLogger.info(SecurityEventType.INPUT_VALIDATION, 'Reserved campaign name used', {
          name
        });
        return false;
      }
      return true;
    },
    {
      message: "Campaign name is reserved"
    }
  );
};

/**
 * User role validation
 */
export const createUserRoleSchema = () => {
  const allowedRoles = ['user', 'admin', 'moderator'] as const;
  
  return z.enum(allowedRoles).refine(
    (role) => {
      securityLogger.info(SecurityEventType.AUTHORIZATION, 'Role assignment attempted', {
        role
      });
      return true;
    }
  );
};

/**
 * Rate limiting helper
 */
export const createRateLimitedSchema = <T extends z.ZodTypeAny>(
  schema: T,
  identifier: string,
  maxAttempts = 5,
  windowMs = 15 * 60 * 1000 // 15 minutes
) => {
  const attempts = new Map<string, { count: number; resetTime: number }>();
  
  return schema.refine(
    () => {
      const now = Date.now();
      const attempt = attempts.get(identifier);
      
      if (!attempt || now > attempt.resetTime) {
        attempts.set(identifier, { count: 1, resetTime: now + windowMs });
        return true;
      }
      
      if (attempt.count >= maxAttempts) {
        securityLogger.warn(SecurityEventType.RATE_LIMIT, 'Rate limit exceeded', {
          identifier,
          attempts: attempt.count,
          windowMs
        });
        return false;
      }
      
      attempt.count++;
      return true;
    },
    {
      message: "Too many attempts. Please try again later."
    }
  );
};