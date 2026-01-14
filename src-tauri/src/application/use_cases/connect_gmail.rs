// ConnectGmail use case - establishes Gmail OAuth connection

use crate::domain::errors::DomainError;
use crate::infrastructure::gmail::GmailOAuthClient;
use crate::infrastructure::keychain::KeychainManager;
use serde::{Deserialize, Serialize};
use std::sync::Arc;
use tokio::sync::Mutex;

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ConnectGmailRequest {
    pub client_id: String,
    pub client_secret: String,
    pub redirect_port: u16,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ConnectGmailResponse {
    pub oauth_url: String,
    pub message: String,
}

/// Use case for connecting Gmail via OAuth 2.0
pub struct ConnectGmailUseCase {
    oauth_client: Arc<Mutex<Option<GmailOAuthClient>>>,
}

impl ConnectGmailUseCase {
    /// Create a new ConnectGmail use case
    pub fn new() -> Self {
        Self {
            oauth_client: Arc::new(Mutex::new(None)),
        }
    }

    /// Step 1: Get authorization URL for user to visit
    pub async fn get_authorization_url(
        &self,
        request: ConnectGmailRequest,
    ) -> Result<String, DomainError> {
        // Create OAuth client
        let oauth = GmailOAuthClient::new(
            &request.client_id,
            &request.client_secret,
            request.redirect_port,
        )
        .map_err(|e| DomainError::ExternalServiceError(e.to_string()))?;

        // Store client for later use
        let mut client = self.oauth_client.lock().await;
        *client = Some(oauth);

        // Get authorization URL
        let client = client.as_ref().unwrap();
        let (auth_url, _csrf_token) = client.get_authorization_url();

        Ok(auth_url)
    }

    /// Step 2: Exchange authorization code for tokens
    pub async fn exchange_auth_code(
        &self,
        auth_code: String,
    ) -> Result<ConnectGmailResponse, DomainError> {
        let client = self.oauth_client.lock().await;
        let oauth = client
            .as_ref()
            .ok_or(DomainError::ValidationError(
                "OAuth client not initialized".to_string(),
            ))?;

        // Exchange code for tokens
        let tokens = oauth
            .exchange_code_for_tokens(&auth_code)
            .await
            .map_err(|e| DomainError::ExternalServiceError(e.to_string()))?;

        // Store tokens in keychain
        KeychainManager::store_token("gmail_access_token", &tokens.access_token)
            .map_err(|e| DomainError::ExternalServiceError(e.to_string()))?;

        if let Some(refresh_token) = &tokens.refresh_token {
            KeychainManager::store_token("gmail_refresh_token", refresh_token)
                .map_err(|e| DomainError::ExternalServiceError(e.to_string()))?;
        }

        // Get user profile to confirm connection
        let gmail_client = crate::infrastructure::gmail::GmailApiClient::new(&tokens.access_token);
        let profile = gmail_client
            .get_profile()
            .await
            .map_err(|e| DomainError::ExternalServiceError(e.to_string()))?;

        let user_email = profile
            .get("emailAddress")
            .and_then(|v| v.as_str())
            .unwrap_or("unknown@gmail.com")
            .to_string();

        Ok(ConnectGmailResponse {
            oauth_url: String::new(),
            message: format!("Successfully connected Gmail account: {}", user_email),
        })
    }

    /// Execute - simplified entry point for API
    pub async fn execute(&self) -> Result<ConnectGmailResponse, String> {
        // This is a simplified execute that returns a placeholder response
        // In production, this would initiate the OAuth flow
        Ok(ConnectGmailResponse {
            oauth_url: String::new(),
            message: "Gmail connection requires OAuth initialization".to_string(),
        })
    }
}

impl Default for ConnectGmailUseCase {
    fn default() -> Self {
        Self::new()
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_create_use_case() {
        let _use_case = ConnectGmailUseCase::new();
        // Use case created successfully
    }

    #[tokio::test]
    async fn test_initialize_without_client() {
        let use_case = ConnectGmailUseCase::new();

        let result = use_case
            .exchange_auth_code("invalid_code".to_string())
            .await;
        assert!(result.is_err());
    }
}
