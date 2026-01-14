// Domain errors - business-level error types

use thiserror::Error;

/// Domain-level errors representing business failures
#[derive(Debug, Error)]
pub enum DomainError {
    #[error("Validation error: {0}")]
    ValidationError(String),

    #[error("Not found: {0}")]
    NotFound(String),

    #[error("Invalid state: {0}")]
    InvalidState(String),

    #[error("Conversion error: {0}")]
    ConversionError(String),

    #[error("External service error: {0}")]
    ExternalServiceError(String),

    #[error("Internal error: {0}")]
    InternalError(String),
}

pub type DomainResult<T> = Result<T, DomainError>;

impl From<String> for DomainError {
    fn from(msg: String) -> Self {
        DomainError::InternalError(msg)
    }
}

impl From<&str> for DomainError {
    fn from(msg: &str) -> Self {
        DomainError::InternalError(msg.to_string())
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_validation_error() {
        let err = DomainError::ValidationError("Invalid input".to_string());
        assert_eq!(err.to_string(), "Validation error: Invalid input");
    }

    #[test]
    fn test_not_found_error() {
        let err = DomainError::NotFound("Item not found".to_string());
        assert_eq!(err.to_string(), "Not found: Item not found");
    }

    #[test]
    fn test_from_string() {
        let err: DomainError = "test error".into();
        assert!(err.to_string().contains("test error"));
    }
}
