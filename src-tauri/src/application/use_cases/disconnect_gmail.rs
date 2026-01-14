// DisconnectGmail use case - revokes Gmail connection and clears data

use crate::domain::ports::{GmailRepository, SyncStateRepository};
use crate::infrastructure::keychain::KeychainManager;
use serde::{Deserialize, Serialize};
use std::sync::Arc;

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct DisconnectGmailResponse {
    pub success: bool,
    pub message: String,
}

/// Use case for disconnecting Gmail
pub struct DisconnectGmailUseCase {
    gmail_repo: Arc<dyn GmailRepository>,
    sync_state_repo: Arc<dyn SyncStateRepository>,
}

impl DisconnectGmailUseCase {
    /// Create a new DisconnectGmail use case
    pub fn new(
        gmail_repo: Arc<dyn GmailRepository>,
        sync_state_repo: Arc<dyn SyncStateRepository>,
    ) -> Self {
        Self {
            gmail_repo,
            sync_state_repo,
        }
    }

    /// Execute the disconnect Gmail use case
    pub async fn execute(&self) -> Result<DisconnectGmailResponse, String> {
        tracing::info!("Starting Gmail disconnection");

        // Delete all Gmail messages from database
        self.gmail_repo
            .delete_all()
            .await
            .map_err(|e| format!("Failed to delete Gmail messages: {}", e))?;

        tracing::info!("Deleted all Gmail messages from database");

        // Delete tokens from keychain
        let _ = KeychainManager::delete_token("gmail_access_token");
        let _ = KeychainManager::delete_token("gmail_refresh_token");
        let _ = KeychainManager::delete_token("gmail_user_id");

        tracing::info!("Deleted Gmail tokens from keychain");

        // Update sync state with error to indicate disconnection
        self.sync_state_repo
            .set_last_error("gmail", "User disconnected")
            .await
            .map_err(|e| format!("Failed to update sync state: {}", e))?;

        tracing::info!("Gmail disconnection complete");

        Ok(DisconnectGmailResponse {
            success: true,
            message: "Successfully disconnected from Gmail. All messages have been deleted.".to_string(),
        })
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use async_trait::async_trait;
    use crate::domain::GmailMessage;

    struct MockGmailRepository;

    #[async_trait]
    impl GmailRepository for MockGmailRepository {
        async fn fetch_messages(&self, _query: &str) -> Result<Vec<GmailMessage>, String> {
            Ok(vec![])
        }

        async fn save_message(&self, _msg: &GmailMessage) -> Result<(), String> {
            Ok(())
        }

        async fn get_message(&self, _id: &str) -> Result<Option<GmailMessage>, String> {
            Ok(None)
        }

        async fn delete_all(&self) -> Result<(), String> {
            Ok(())
        }

        async fn get_message_count(&self) -> Result<u64, String> {
            Ok(0)
        }
    }

    struct MockSyncStateRepository;

    #[async_trait]
    impl SyncStateRepository for MockSyncStateRepository {
        async fn get_last_sync(&self, _source: &str) -> Result<Option<String>, String> {
            Ok(None)
        }

        async fn set_last_sync(&self, _source: &str, _timestamp: &str) -> Result<(), String> {
            Ok(())
        }

        async fn get_last_error(&self, _source: &str) -> Result<Option<String>, String> {
            Ok(None)
        }

        async fn set_last_error(&self, _source: &str, _error: &str) -> Result<(), String> {
            Ok(())
        }
    }

    #[tokio::test]
    async fn test_disconnect_gmail_execution() {
        let gmail_repo = Arc::new(MockGmailRepository);
        let sync_repo = Arc::new(MockSyncStateRepository);

        let use_case = DisconnectGmailUseCase::new(gmail_repo, sync_repo);
        let result = use_case.execute().await;

        assert!(result.is_ok());
        let resp = result.unwrap();
        assert!(resp.success);
    }
}
