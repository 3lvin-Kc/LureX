/**
 * Error Handler Utility
 * Provides error handling, retry logic, and user-friendly error messages
 */

export type ErrorType =
  | 'network'
  | 'validation'
  | 'authentication'
  | 'authorization'
  | 'notFound'
  | 'server'
  | 'timeout'
  | 'unknown'

export interface ErrorInfo {
  type: ErrorType
  message: string
  code?: string
  details?: unknown
  timestamp: Date
  retryable: boolean
}

/**
 * Parse error and extract information
 */
export function parseError(error: unknown): ErrorInfo {
  const timestamp = new Date()

  if (typeof error === 'string') {
    return {
      type: 'unknown',
      message: error,
      timestamp,
      retryable: false,
    }
  }

  if (error instanceof Error) {
    const message = error.message
    const type = classifyError(message)

    return {
      type,
      message,
      timestamp,
      retryable: isRetryableError(type),
      details: error.stack,
    }
  }

  if (typeof error === 'object' && error !== null) {
    const obj = error as Record<string, unknown>
    return {
      type: classifyError(String(obj.message || obj.error || 'Unknown error')),
      message: String(obj.message || obj.error || 'Unknown error'),
      code: String(obj.code || obj.status || ''),
      timestamp,
      retryable: obj.retryable !== false,
      details: error,
    }
  }

  return {
    type: 'unknown',
    message: 'An unknown error occurred',
    timestamp,
    retryable: false,
  }
}

/**
 * Classify error type based on message/code
 */
function classifyError(message: string): ErrorType {
  const msg = message.toLowerCase()

  if (
    msg.includes('network') ||
    msg.includes('offline') ||
    msg.includes('failed to fetch') ||
    msg.includes('connection')
  ) {
    return 'network'
  }

  if (msg.includes('unauthorized') || msg.includes('unauthenticated')) {
    return 'authentication'
  }

  if (msg.includes('forbidden') || msg.includes('denied')) {
    return 'authorization'
  }

  if (msg.includes('not found') || msg.includes('404')) {
    return 'notFound'
  }

  if (
    msg.includes('invalid') ||
    msg.includes('validation') ||
    msg.includes('required')
  ) {
    return 'validation'
  }

  if (msg.includes('timeout') || msg.includes('timed out')) {
    return 'timeout'
  }

  if (msg.includes('500') || msg.includes('server error')) {
    return 'server'
  }

  return 'unknown'
}

/**
 * Check if error is retryable
 */
function isRetryableError(type: ErrorType): boolean {
  return ['network', 'server', 'timeout'].includes(type)
}

/**
 * Get user-friendly error message
 */
export function getUserFriendlyMessage(error: ErrorInfo): string {
  switch (error.type) {
    case 'network':
      return 'Network connection failed. Please check your internet connection.'
    case 'authentication':
      return 'Authentication failed. Please log in again.'
    case 'authorization':
      return 'You do not have permission to perform this action.'
    case 'notFound':
      return 'The requested resource was not found.'
    case 'validation':
      return 'The provided data is invalid. Please check your input.'
    case 'timeout':
      return 'Request timed out. Please try again.'
    case 'server':
      return 'Server error. Please try again later.'
    default:
      return error.message || 'An unexpected error occurred.'
  }
}

/**
 * Retry configuration
 */
export interface RetryConfig {
  maxAttempts: number
  initialDelay: number
  maxDelay: number
  backoffMultiplier: number
  shouldRetry?: (error: ErrorInfo, attempt: number) => boolean
}

/**
 * Default retry configuration
 */
export const DEFAULT_RETRY_CONFIG: RetryConfig = {
  maxAttempts: 3,
  initialDelay: 1000,
  maxDelay: 10000,
  backoffMultiplier: 2,
}

/**
 * Calculate retry delay with exponential backoff
 */
export function calculateRetryDelay(
  attempt: number,
  config: RetryConfig
): number {
  const delay = Math.min(
    config.initialDelay * Math.pow(config.backoffMultiplier, attempt - 1),
    config.maxDelay
  )
  // Add jitter to prevent thundering herd
  const jitter = Math.random() * delay * 0.1
  return Math.floor(delay + jitter)
}

/**
 * Retry a function with exponential backoff
 */
export async function retryWithBackoff<T>(
  fn: () => Promise<T>,
  config: RetryConfig = DEFAULT_RETRY_CONFIG
): Promise<T> {
  let lastError: ErrorInfo | null = null

  for (let attempt = 1; attempt <= config.maxAttempts; attempt++) {
    try {
      return await fn()
    } catch (error) {
      lastError = parseError(error)

      // Check if we should retry
      if (
        config.shouldRetry &&
        !config.shouldRetry(lastError, attempt)
      ) {
        throw error
      }

      if (!lastError.retryable || attempt === config.maxAttempts) {
        throw error
      }

      // Wait before retrying
      const delay = calculateRetryDelay(attempt, config)
      await new Promise((resolve) => setTimeout(resolve, delay))
    }
  }

  throw lastError || new Error('Retry failed')
}

/**
 * Log error with context
 */
export function logError(
  context: string,
  error: ErrorInfo,
  additionalData?: unknown
): void {
  const logEntry = {
    context,
    timestamp: error.timestamp.toISOString(),
    type: error.type,
    message: error.message,
    code: error.code,
    retryable: error.retryable,
    additionalData,
  }

  // Log to console in development
  if (process.env.NODE_ENV === 'development') {
    console.error(`[${context}]`, logEntry)
  }

  // Could send to error tracking service in production
  // Example: Sentry, LogRocket, etc.
}

/**
 * Error boundary helper
 */
export class ErrorBoundaryError extends Error {
  constructor(
    message: string,
    public code: string,
    public originalError?: Error
  ) {
    super(message)
    this.name = 'ErrorBoundaryError'
  }
}

/**
 * Validate data
 */
export function validateData<T>(
  data: unknown,
  schema: Record<string, (value: unknown) => boolean>
): data is T {
  if (typeof data !== 'object' || data === null) {
    return false
  }

  const obj = data as Record<string, unknown>

  for (const [key, validator] of Object.entries(schema)) {
    if (!validator(obj[key])) {
      return false
    }
  }

  return true
}

/**
 * Create validation error
 */
export function createValidationError(
  field: string,
  message: string
): ErrorInfo {
  return {
    type: 'validation',
    message: `${field}: ${message}`,
    timestamp: new Date(),
    retryable: false,
    code: 'VALIDATION_ERROR',
  }
}
