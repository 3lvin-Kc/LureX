// Application errors - use case level errors

use thiserror::Error;
use crate::domain::DomainError;

#[derive(Debug, Error)]
pub enum ApplicationError {
    #[error("Validation error: {0}")]
    ValidationError(String),

    #[error("Not found: {0}")]
    NotFound(String),

    #[error("Domain error: {0}")]
    DomainError(#[from] DomainError),

    #[error("Repository error: {0}")]
    RepositoryError(String),

    #[error("OAuth error: {0}")]
    OAuthError(String),

    #[error("File system error: {0}")]
    FileSystemError(#[from] std::io::Error),

    #[error("Internal error: {0}")]
    InternalError(String),
}

pub type ApplicationResult<T> = Result<T, ApplicationError>;

impl From<String> for ApplicationError {
    fn from(msg: String) -> Self {
        ApplicationError::InternalError(msg)
    }
}

impl From<&str> for ApplicationError {
    fn from(msg: &str) -> Self {
        ApplicationError::InternalError(msg.to_string())
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_validation_error_display() {
        let err = ApplicationError::ValidationError("Bad input".to_string());
        assert_eq!(err.to_string(), "Validation error: Bad input");
    }

    #[test]
    fn test_not_found_error_display() {
        let err = ApplicationError::NotFound("Item missing".to_string());
        assert_eq!(err.to_string(), "Not found: Item missing");
    }
}
