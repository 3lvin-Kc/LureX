import DOMPurify from 'dompurify';
import { securityLogger, SecurityEventType } from './securityLogger';

/**
 * Security-focused HTML sanitization utility
 */

interface SanitizeOptions {
  allowedTags?: string[];
  allowedAttributes?: Record<string, string[]>;
  allowForms?: boolean;
  allowScripts?: boolean;
  contextType?: 'email' | 'preview' | 'template';
}

/**
 * Sanitize HTML content for safe rendering
 */
export const sanitizeHtml = (
  html: string, 
  options: SanitizeOptions = {}
): string => {
  const {
    allowedTags = [
      'div', 'p', 'span', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
      'strong', 'em', 'u', 'br', 'hr', 'a', 'img', 'table', 
      'tr', 'td', 'th', 'tbody', 'thead', 'ul', 'ol', 'li'
    ],
    allowedAttributes = {
      '*': ['class', 'id', 'style'],
      'a': ['href', 'target', 'title'],
      'img': ['src', 'alt', 'width', 'height'],
      'table': ['border', 'cellpadding', 'cellspacing'],
      'td': ['colspan', 'rowspan'],
      'th': ['colspan', 'rowspan']
    },
    allowForms = false,
    allowScripts = false,
    contextType = 'preview'
  } = options;

  try {
    // Configure DOMPurify
    const config: any = {
      ALLOWED_TAGS: allowedTags,
      ALLOWED_ATTR: Object.keys(allowedAttributes).reduce((acc, tag) => {
        if (tag === '*') {
          acc.push(...allowedAttributes[tag]);
        } else {
          allowedAttributes[tag].forEach(attr => acc.push(attr));
        }
        return acc;
      }, [] as string[]),
      KEEP_CONTENT: true,
      RETURN_DOM: false,
      RETURN_DOM_FRAGMENT: false,
      RETURN_DOM_IMPORT: false,
      SANITIZE_DOM: true,
      FORBID_TAGS: allowScripts ? [] : ['script', 'object', 'embed', 'base'],
      FORBID_ATTR: allowScripts ? [] : ['onerror', 'onload', 'onclick', 'onmouseover'],
    };

    // Add form elements if allowed
    if (allowForms) {
      config.ALLOWED_TAGS.push('form', 'input', 'button', 'textarea', 'select', 'option');
      config.ALLOWED_ATTR.push('type', 'name', 'value', 'placeholder', 'required', 'method', 'action');
    }

    // Sanitize the HTML - force string return
    const sanitized = String(DOMPurify.sanitize(html, config));
    
    // Log security event
    securityLogger.info(SecurityEventType.INPUT_VALIDATION, 'HTML content sanitized', {
      contextType,
      originalLength: html.length,
      sanitizedLength: sanitized.length,
      wasModified: html !== sanitized
    });

    return sanitized;
  } catch (error) {
    securityLogger.error(SecurityEventType.SYSTEM_ERROR, 'HTML sanitization failed', {
      error: error instanceof Error ? error.message : 'Unknown error',
      contextType
    });
    
    // Return empty string on error for security
    return '';
  }
};

/**
 * Sanitize HTML for email templates (more restrictive)
 */
export const sanitizeEmailHtml = (html: string): string => {
  return sanitizeHtml(html, {
    contextType: 'email',
    allowedTags: [
      'div', 'p', 'span', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
      'strong', 'em', 'u', 'br', 'hr', 'a', 'img', 'table', 
      'tr', 'td', 'th', 'tbody', 'thead', 'ul', 'ol', 'li'
    ],
    allowedAttributes: {
      '*': ['style'],
      'a': ['href', 'title'],
      'img': ['src', 'alt', 'width', 'height'],
      'table': ['border', 'cellpadding', 'cellspacing', 'width'],
      'td': ['colspan', 'rowspan', 'align', 'valign'],
      'th': ['colspan', 'rowspan', 'align', 'valign']
    },
    allowForms: false,
    allowScripts: false
  });
};

/**
 * Sanitize HTML for phishing page templates (allows forms but no scripts)
 */
export const sanitizePhishingPageHtml = (html: string): string => {
  return sanitizeHtml(html, {
    contextType: 'template',
    allowedTags: [
      'div', 'p', 'span', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
      'strong', 'em', 'u', 'br', 'hr', 'a', 'img', 'table', 
      'tr', 'td', 'th', 'tbody', 'thead', 'ul', 'ol', 'li',
      'form', 'input', 'button', 'textarea', 'select', 'option', 'label'
    ],
    allowedAttributes: {
      '*': ['class', 'id', 'style'],
      'a': ['href', 'target', 'title'],
      'img': ['src', 'alt', 'width', 'height'],
      'form': ['method', 'action'],
      'input': ['type', 'name', 'value', 'placeholder', 'required', 'class', 'id'],
      'button': ['type', 'class', 'id'],
      'textarea': ['name', 'placeholder', 'required', 'rows', 'cols', 'class', 'id'],
      'select': ['name', 'required', 'class', 'id'],
      'option': ['value'],
      'label': ['for', 'class']
    },
    allowForms: true,
    allowScripts: false
  });
};

/**
 * Create a secure iframe document with sanitized content
 */
export const createSecureIframeDoc = (
  htmlContent: string, 
  cssContent?: string, 
  jsContent?: string
): string => {
  // Sanitize all content
  const sanitizedHtml = sanitizePhishingPageHtml(htmlContent);
  const sanitizedCss = cssContent ? String(DOMPurify.sanitize(cssContent, { ALLOWED_TAGS: [] })) : '';
  
  // Don't allow any JavaScript for security
  const secureJs = ''; // Always empty for security
  
  if (jsContent) {
    securityLogger.warn(SecurityEventType.SUSPICIOUS_ACTIVITY, 'JavaScript blocked in preview', {
      reason: 'JavaScript execution not allowed in preview mode for security'
    });
  }

  return `<!DOCTYPE html>
<html>
  <head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <style>
      /* Security notice */
      body::before {
        content: "🔒 Preview Mode - JavaScript disabled for security";
        display: block;
        background: #fef3c7;
        color: #92400e;
        padding: 8px;
        text-align: center;
        font-size: 12px;
        border-bottom: 1px solid #f59e0b;
      }
      ${sanitizedCss}
    </style>
  </head>
  <body>
    ${sanitizedHtml}
    ${secureJs}
  </body>
</html>`;
};

/**
 * Validate and sanitize template variables
 */
export const sanitizeTemplateVariables = (variables: Record<string, any>): Record<string, string> => {
  const sanitized: Record<string, string> = {};
  
  for (const [key, value] of Object.entries(variables)) {
    if (typeof value === 'string') {
      // Only allow basic text content in variables
      sanitized[key] = String(DOMPurify.sanitize(value, { 
        ALLOWED_TAGS: [],
        ALLOWED_ATTR: [],
        KEEP_CONTENT: true
      }));
    } else {
      sanitized[key] = String(value);
    }
  }
  
  return sanitized;
};