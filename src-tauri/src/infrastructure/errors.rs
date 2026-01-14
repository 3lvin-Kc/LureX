// Infrastructure errors

use thiserror::Error;

#[derive(Debug, Error)]
pub enum InfrastructureError {
    #[error("Database error: {0}")]
    DatabaseError(String),

    #[error("OAuth error: {0}")]
    OAuthError(String),

    #[error("Gmail API error: {0}")]
    GmailApiError(String),

    #[error("File system error: {0}")]
    FileSystemError(#[from] std::io::Error),

    #[error("Text extraction error: {0}")]
    ExtractionError(String),

    #[error("Keychain error: {0}")]
    KeychainError(String),

    #[error("Configuration error: {0}")]
    ConfigError(String),
}

pub type InfrastructureResult<T> = Result<T, InfrastructureError>;

impl From<String> for InfrastructureError {
    fn from(msg: String) -> Self {
        InfrastructureError::DatabaseError(msg)
    }
}
