// GetStatus use case - returns app status and statistics

use crate::domain::ports::{FileRepository, GmailRepository, SearchRepository, SyncStateRepository};
use serde::{Deserialize, Serialize};
use std::sync::Arc;

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct AppStatus {
    pub gmail_connected: bool,
    pub gmail_message_count: u64,
    pub gmail_last_sync: Option<String>,
    pub gmail_last_error: Option<String>,
    pub file_count: u64,
    pub file_last_sync: Option<String>,
    pub file_last_error: Option<String>,
    pub total_indexed: u64,
    pub database_size_mb: f64,
}

/// Use case for getting application status
pub struct GetStatusUseCase {
    search_repo: Arc<dyn SearchRepository>,
    gmail_repo: Arc<dyn GmailRepository>,
    file_repo: Arc<dyn FileRepository>,
    sync_state_repo: Arc<dyn SyncStateRepository>,
}

impl GetStatusUseCase {
    /// Create a new GetStatus use case
    pub fn new(
        search_repo: Arc<dyn SearchRepository>,
        gmail_repo: Arc<dyn GmailRepository>,
        file_repo: Arc<dyn FileRepository>,
        sync_state_repo: Arc<dyn SyncStateRepository>,
    ) -> Self {
        Self {
            search_repo,
            gmail_repo,
            file_repo,
            sync_state_repo,
        }
    }

    /// Execute the get status use case
    pub async fn execute(&self) -> Result<AppStatus, String> {
        tracing::info!("Fetching application status");

        // Get Gmail stats
        let gmail_message_count = self.gmail_repo.get_message_count().await.unwrap_or(0);
        let gmail_last_sync = self
            .sync_state_repo
            .get_last_sync("gmail")
            .await
            .unwrap_or(None);
        let gmail_last_error = self
            .sync_state_repo
            .get_last_error("gmail")
            .await
            .unwrap_or(None);

        // Get file stats
        let file_count = self.file_repo.get_file_count().await.unwrap_or(0);
        let file_last_sync = self
            .sync_state_repo
            .get_last_sync("files")
            .await
            .unwrap_or(None);
        let file_last_error = self
            .sync_state_repo
            .get_last_error("files")
            .await
            .unwrap_or(None);

        // Get search stats
        let total_indexed = self.search_repo.get_item_count().await.unwrap_or(0);

        // Determine if Gmail is connected (has messages or last sync without error)
        let gmail_connected = gmail_message_count > 0 || gmail_last_sync.is_some();

        tracing::info!("Status retrieved: {} Gmail messages, {} files, {} total indexed",
            gmail_message_count, file_count, total_indexed);

        Ok(AppStatus {
            gmail_connected,
            gmail_message_count,
            gmail_last_sync,
            gmail_last_error,
            file_count,
            file_last_sync,
            file_last_error,
            total_indexed,
            database_size_mb: 0.0, // TODO: Calculate from database
        })
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use async_trait::async_trait;
    use crate::domain::{GmailMessage, LocalFile, SearchResult};
    use crate::domain::ports::SearchFilters;

    struct MockSearchRepository;

    #[async_trait]
    impl SearchRepository for MockSearchRepository {
        async fn search(
            &self,
            _query: &str,
            _filters: &SearchFilters,
        ) -> Result<Vec<SearchResult>, String> {
            Ok(vec![])
        }

        async fn index_item(&self, _item: &SearchResult) -> Result<(), String> {
            Ok(())
        }

        async fn delete_all(&self) -> Result<(), String> {
            Ok(())
        }

        async fn get_item_count(&self) -> Result<u64, String> {
            Ok(42)
        }
    }

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
            Ok(25)
        }
    }

    struct MockFileRepository;

    #[async_trait]
    impl FileRepository for MockFileRepository {
        async fn index_folder(&self, _path: &str) -> Result<Vec<LocalFile>, String> {
            Ok(vec![])
        }

        async fn save_file(&self, _file: &LocalFile) -> Result<(), String> {
            Ok(())
        }

        async fn get_file(&self, _path: &str) -> Result<Option<LocalFile>, String> {
            Ok(None)
        }

        async fn delete_all(&self) -> Result<(), String> {
            Ok(())
        }

        async fn get_file_count(&self) -> Result<u64, String> {
            Ok(17)
        }
    }

    struct MockSyncStateRepository;

    #[async_trait]
    impl SyncStateRepository for MockSyncStateRepository {
        async fn get_last_sync(&self, source: &str) -> Result<Option<String>, String> {
            if source == "gmail" {
                Ok(Some("2024-01-15T10:30:00Z".to_string()))
            } else {
                Ok(None)
            }
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
    async fn test_get_status_execution() {
        let search_repo = Arc::new(MockSearchRepository);
        let gmail_repo = Arc::new(MockGmailRepository);
        let file_repo = Arc::new(MockFileRepository);
        let sync_repo = Arc::new(MockSyncStateRepository);

        let use_case = GetStatusUseCase::new(search_repo, gmail_repo, file_repo, sync_repo);
        let result = use_case.execute().await;

        assert!(result.is_ok());
        let status = result.unwrap();
        assert!(status.gmail_connected);
        assert_eq!(status.gmail_message_count, 25);
        assert_eq!(status.file_count, 17);
        assert_eq!(status.total_indexed, 42);
    }

    #[tokio::test]
    async fn test_gmail_not_connected() {
        let search_repo = Arc::new(MockSearchRepository);

        struct DisconnectedGmailRepo;
        #[async_trait]
        impl GmailRepository for DisconnectedGmailRepo {
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

        let gmail_repo = Arc::new(DisconnectedGmailRepo);
        let file_repo = Arc::new(MockFileRepository);
        let sync_repo = Arc::new(MockSyncStateRepository);

        let use_case = GetStatusUseCase::new(search_repo, gmail_repo, file_repo, sync_repo);
        let result = use_case.execute().await;

        assert!(result.is_ok());
        let status = result.unwrap();
        assert!(!status.gmail_connected);
    }
}
