// DeleteIndex use case - clears all indexed data

use crate::domain::ports::{FileRepository, GmailRepository, SearchRepository, SyncStateRepository};
use serde::{Deserialize, Serialize};
use std::sync::Arc;

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct DeleteIndexResponse {
    pub success: bool,
    pub message: String,
}

/// Use case for deleting all indexed data
pub struct DeleteIndexUseCase {
    search_repo: Arc<dyn SearchRepository>,
    gmail_repo: Arc<dyn GmailRepository>,
    file_repo: Arc<dyn FileRepository>,
    sync_state_repo: Arc<dyn SyncStateRepository>,
}

impl DeleteIndexUseCase {
    /// Create a new DeleteIndex use case
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

    /// Execute the delete index use case
    pub async fn execute(&self) -> Result<DeleteIndexResponse, String> {
        tracing::warn!("Starting complete index deletion - this cannot be undone");

        // Delete all search results
        self.search_repo
            .delete_all()
            .await
            .map_err(|e| format!("Failed to delete search results: {}", e))?;

        tracing::info!("Deleted all search results");

        // Delete all Gmail messages
        self.gmail_repo
            .delete_all()
            .await
            .map_err(|e| format!("Failed to delete Gmail messages: {}", e))?;

        tracing::info!("Deleted all Gmail messages");

        // Delete all file records
        self.file_repo
            .delete_all()
            .await
            .map_err(|e| format!("Failed to delete files: {}", e))?;

        tracing::info!("Deleted all file records");

        // Clear sync state for both sources
        let error_msg = "Index deleted";
        let _ = self.sync_state_repo.set_last_error("gmail", error_msg).await;
        let _ = self.sync_state_repo.set_last_error("files", error_msg).await;

        tracing::warn!("Index deletion complete");

        Ok(DeleteIndexResponse {
            success: true,
            message: "Successfully deleted all indexed data. The application is now empty.".to_string(),
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
            Ok(0)
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
            Ok(0)
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
    async fn test_delete_index_execution() {
        let search_repo = Arc::new(MockSearchRepository);
        let gmail_repo = Arc::new(MockGmailRepository);
        let file_repo = Arc::new(MockFileRepository);
        let sync_repo = Arc::new(MockSyncStateRepository);

        let use_case = DeleteIndexUseCase::new(search_repo, gmail_repo, file_repo, sync_repo);
        let result = use_case.execute().await;

        assert!(result.is_ok());
        let resp = result.unwrap();
        assert!(resp.success);
    }
}
