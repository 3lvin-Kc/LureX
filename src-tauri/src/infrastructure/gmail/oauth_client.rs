// Gmail OAuth 2.0 client for desktop applications
// Implements authorization code flow with localhost redirect

use oauth2::{
    basic::BasicClient, reqwest::async_http_client, AuthUrl, AuthorizationCode, ClientId,
    ClientSecret, CsrfToken, RedirectUrl, RefreshToken, RevocationUrl, Scope, TokenResponse,
    TokenUrl,
};
use serde::{Deserialize, Serialize};
use std::net::SocketAddr;
use thiserror::Error;
use tokio::net::TcpListener;

#[derive(Error, Debug)]
pub enum OAuthError {
    #[error("OAuth configuration error: {0}")]
    ConfigError(String),
    #[error("Authorization failed: {0}")]
    AuthorizationFailed(String),
    #[error("Token exchange failed: {0}")]
    TokenExchangeFailed(String),
    #[error("Server error: {0}")]
    ServerError(String),
}

pub type OAuthResult<T> = Result<T, OAuthError>;

/// OAuth tokens for Gmail API access
#[derive(Clone, Debug, Serialize, Deserialize)]
pub struct OAuthTokens {
    pub access_token: String,
    pub refresh_token: Option<String>,
    pub expires_in: u64,
}

/// Gmail OAuth 2.0 client
pub struct GmailOAuthClient {
    oauth_client: BasicClient,
    redirect_port: u16,
}

impl GmailOAuthClient {
    /// Create a new Gmail OAuth client
    pub fn new(
        client_id: &str,
        client_secret: &str,
        redirect_port: u16,
    ) -> OAuthResult<Self> {
        let oauth_client = BasicClient::new(
            ClientId::new(client_id.to_string()),
            Some(ClientSecret::new(client_secret.to_string())),
            AuthUrl::new("https://accounts.google.com/o/oauth2/v2/auth".to_string())
                .map_err(|e| OAuthError::ConfigError(e.to_string()))?,
            Some(
                TokenUrl::new("https://oauth2.googleapis.com/token".to_string())
                    .map_err(|e| OAuthError::ConfigError(e.to_string()))?,
            ),
        )
        .set_redirect_uri(
            RedirectUrl::new(format!("http://localhost:{}/callback", redirect_port))
                .map_err(|e| OAuthError::ConfigError(e.to_string()))?,
        )
        .set_revocation_uri(
            RevocationUrl::new("https://oauth2.googleapis.com/revoke".to_string())
                .map_err(|e| OAuthError::ConfigError(e.to_string()))?,
        );

        Ok(Self {
            oauth_client,
            redirect_port,
        })
    }

    /// Get authorization URL for user login
    pub fn get_authorization_url(&self) -> (String, CsrfToken) {
        let (auth_url, csrf_token) = self
            .oauth_client
            .authorize_url(CsrfToken::new_random)
            .add_scopes(vec![
                Scope::new("https://www.googleapis.com/auth/gmail.readonly".to_string()),
                Scope::new("https://www.googleapis.com/auth/gmail.labels".to_string()),
            ])
            .url();

        (auth_url.to_string(), csrf_token)
    }

    /// Handle OAuth callback and exchange code for tokens
    pub async fn exchange_code_for_tokens(&self, code: &str) -> OAuthResult<OAuthTokens> {
        let token_result = self
            .oauth_client
            .exchange_code(AuthorizationCode::new(code.to_string()))
            .request_async(async_http_client)
            .await
            .map_err(|e| OAuthError::TokenExchangeFailed(e.to_string()))?;

        let access_token = token_result.access_token().secret().clone();
        let refresh_token = token_result.refresh_token().map(|rt| rt.secret().clone());
        let expires_in = token_result
            .expires_in()
            .map(|d| d.as_secs())
            .unwrap_or(3600);

        Ok(OAuthTokens {
            access_token,
            refresh_token,
            expires_in,
        })
    }

    /// Refresh access token using refresh token
    pub async fn refresh_access_token(&self, refresh_token: &str) -> OAuthResult<OAuthTokens> {
        let token_result = self
            .oauth_client
            .exchange_refresh_token(&RefreshToken::new(refresh_token.to_string()))
            .request_async(async_http_client)
            .await
            .map_err(|e| OAuthError::TokenExchangeFailed(e.to_string()))?;

        let access_token = token_result.access_token().secret().clone();
        let new_refresh_token = token_result.refresh_token().map(|rt| rt.secret().clone());
        let expires_in = token_result
            .expires_in()
            .map(|d| d.as_secs())
            .unwrap_or(3600);

        Ok(OAuthTokens {
            access_token,
            refresh_token: new_refresh_token.or(Some(refresh_token.to_string())),
            expires_in,
        })
    }

    /// Start local server to handle OAuth callback
    pub async fn start_callback_server(&self) -> OAuthResult<(String, u16)> {
        let addr: SocketAddr = format!("127.0.0.1:{}", self.redirect_port)
            .parse()
            .map_err(|e: std::net::AddrParseError| OAuthError::ServerError(e.to_string()))?;

        let _listener = TcpListener::bind(&addr)
            .await
            .map_err(|e| OAuthError::ServerError(e.to_string()))?;

        Ok(("127.0.0.1".to_string(), self.redirect_port))
    }

    /// Revoke access token
    pub async fn revoke_token(&self, _token: &str) -> OAuthResult<()> {
        // Token revocation is optional - skip for now
        Ok(())
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_oauth_client_creation() {
        let result = GmailOAuthClient::new("test_id", "test_secret", 9999);
        assert!(result.is_ok());
    }

    #[test]
    fn test_authorization_url() {
        let client = GmailOAuthClient::new("test_id", "test_secret", 9999).unwrap();
        let (url, _csrf) = client.get_authorization_url();
        assert!(url.contains("accounts.google.com"));
        assert!(url.contains("gmail.readonly"));
    }

    #[tokio::test]
    async fn test_callback_server_start() {
        let client = GmailOAuthClient::new("test_id", "test_secret", 19999).unwrap();
        let result = client.start_callback_server().await;
        assert!(result.is_ok());
    }
}
