// Keychain integration for secure token storage

use keyring::Entry;
use thiserror::Error;

#[derive(Error, Debug)]
pub enum KeychainError {
    #[error("Keychain operation failed: {0}")]
    OperationFailed(String),
    #[error("Token not found")]
    TokenNotFound,
    #[error("Invalid token")]
    InvalidToken,
}

pub type KeychainResult<T> = Result<T, KeychainError>;

const SERVICE_NAME: &str = "RecallDesk";

/// OS keychain manager for secure token storage
pub struct KeychainManager;

impl KeychainManager {
    /// Store a token securely in the OS keychain
    pub fn store_token(token_name: &str, token: &str) -> KeychainResult<()> {
        let entry = Entry::new(SERVICE_NAME, token_name)
            .map_err(|e| KeychainError::OperationFailed(e.to_string()))?;

        entry
            .set_password(token)
            .map_err(|e| KeychainError::OperationFailed(e.to_string()))?;

        Ok(())
    }

    /// Retrieve a token from the OS keychain
    pub fn get_token(token_name: &str) -> KeychainResult<String> {
        let entry = Entry::new(SERVICE_NAME, token_name)
            .map_err(|e| KeychainError::OperationFailed(e.to_string()))?;

        entry
            .get_password()
            .map_err(|e| match e {
                keyring::error::Error::NoEntry => KeychainError::TokenNotFound,
                _ => KeychainError::OperationFailed(e.to_string()),
            })
    }

    /// Delete a token from the OS keychain
    pub fn delete_token(token_name: &str) -> KeychainResult<()> {
        let entry = Entry::new(SERVICE_NAME, token_name)
            .map_err(|e| KeychainError::OperationFailed(e.to_string()))?;

        entry
            .delete_password()
            .map_err(|e| KeychainError::OperationFailed(e.to_string()))?;

        Ok(())
    }

    /// Check if a token exists
    pub fn token_exists(token_name: &str) -> bool {
        if let Ok(entry) = Entry::new(SERVICE_NAME, token_name) {
            entry.get_password().is_ok()
        } else {
            false
        }
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_store_and_retrieve_token() {
        let token_name = "test_gmail_access_token";
        let token_value = "test_token_12345";

        // Store token
        let store_result = KeychainManager::store_token(token_name, token_value);
        assert!(store_result.is_ok());

        // Retrieve token
        let retrieve_result = KeychainManager::get_token(token_name);
        assert!(retrieve_result.is_ok());
        assert_eq!(retrieve_result.unwrap(), token_value);

        // Cleanup
        let _ = KeychainManager::delete_token(token_name);
    }

    #[test]
    fn test_delete_token() {
        let token_name = "test_delete_token";
        let token_value = "test_value";

        KeychainManager::store_token(token_name, token_value).unwrap();
        assert!(KeychainManager::token_exists(token_name));

        let delete_result = KeychainManager::delete_token(token_name);
        assert!(delete_result.is_ok());
        assert!(!KeychainManager::token_exists(token_name));
    }

    #[test]
    fn test_token_not_found() {
        let result = KeychainManager::get_token("nonexistent_token_xyz");
        assert!(result.is_err());
    }

    #[test]
    fn test_token_exists() {
        let token_name = "test_exists_token";
        let token_value = "test_value";

        KeychainManager::store_token(token_name, token_value).ok();

        assert!(KeychainManager::token_exists(token_name));

        // Cleanup
        let _ = KeychainManager::delete_token(token_name);
    }
}
