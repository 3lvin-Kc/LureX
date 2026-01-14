// IndexGmail use case - syncs Gmail messages to local index

use crate::domain::{SearchResult, ports::{GmailRepository, SearchRepository, SyncStateRepository}};
use chrono::Utc;
use serde::{Deserialize, Serialize};
use std::sync::Arc;

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct IndexGmailRequest {
    pub query: Option<String>,
    pub max_results: u32,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct IndexGmailResponse {
    pub success: bool,
    pub indexed_count: u64,
    pub total_messages: u64,
    pub message: String,
}

/// Use case for indexing Gmail messages
pub struct IndexGmailUseCase {
    gmail_repo: Arc<dyn GmailRepository>,
    search_repo: Arc<dyn SearchRepository>,
    sync_state_repo: Arc<dyn SyncStateRepository>,
}

impl IndexGmailUseCase {
    /// Create a new IndexGmail use case
    pub fn new(
        gmail_repo: Arc<dyn GmailRepository>,
        search_repo: Arc<dyn SearchRepository>,
        sync_state_repo: Arc<dyn SyncStateRepository>,
    ) -> Self {
        Self {
            gmail_repo,
            search_repo,
            sync_state_repo,
        }
    }

    /// Execute the index Gmail use case
    pub async fn execute(&self, req: IndexGmailRequest) -> Result<IndexGmailResponse, String> {
        let query = req.query.unwrap_or_else(|| "*".to_string());
        let _max_results = req.max_results.min(100); // Cap at 100 results per request

        tracing::info!("Starting Gmail indexing with query: {}", query);

        // Fetch messages from Gmail
        let messages = self
            .gmail_repo
            .fetch_messages(&query)
            .await
            .map_err(|e| format!("Failed to fetch Gmail messages: {}", e))?;

        let total_messages = messages.len() as u64;
        let mut indexed_count = 0u64;

        // Index each message
        for message in messages {
            // Save to Gmail repository
            self.gmail_repo
                .save_message(&message)
                .await
                .map_err(|e| format!("Failed to save message: {}", e))?;

            // Create search result from message
            let search_result = SearchResult {
                id: message.message_id.clone(),
                source_type: "gmail".to_string(),
                title: message.subject.clone(),
                snippet: truncate_text(&message.body_text, 200),
                body_text: message.body_text.clone(),
                created_at: message.date,
                rank_score: 0.5, // Default score, will be improved by SearchRanker
                metadata: serde_json::json!({
                    "from": message.from,
                    "to": message.to,
                    "cc": message.cc,
                    "labels": message.labels,
                    "thread_id": message.thread_id,
                }),
            };

            // Index in search repository
            self.search_repo
                .index_item(&search_result)
                .await
                .map_err(|e| format!("Failed to index message: {}", e))?;

            indexed_count += 1;
            tracing::debug!("Indexed message: {}", message.message_id);
        }

        // Update sync state
        let now = Utc::now().to_rfc3339();
        self.sync_state_repo
            .set_last_sync("gmail", &now)
            .await
            .map_err(|e| format!("Failed to update sync state: {}", e))?;

        tracing::info!("Gmail indexing complete: {} messages indexed", indexed_count);

        Ok(IndexGmailResponse {
            success: true,
            indexed_count,
            total_messages,
            message: format!("Successfully indexed {} Gmail messages", indexed_count),
        })
    }
}

/// Truncate text to a maximum length
fn truncate_text(text: &str, max_len: usize) -> String {
    if text.len() <= max_len {
        text.to_string()
    } else {
        format!("{}...", &text[..max_len])
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use async_trait::async_trait;
    use crate::domain::GmailMessage;

    // Mock repositories for testing
    struct MockGmailRepository;

    #[async_trait]
    impl GmailRepository for MockGmailRepository {
        async fn fetch_messages(&self, _query: &str) -> Result<Vec<GmailMessage>, String> {
            Ok(vec![GmailMessage {
                message_id: "msg_1".to_string(),
                thread_id: "thread_1".to_string(),
                subject: "Test Email".to_string(),
                from: "sender@example.com".to_string(),
                to: "recipient@example.com".to_string(),
                cc: String::new(),
                body_text: "This is a test email body".to_string(),
                date: Utc::now(),
                labels: vec!["INBOX".to_string()],
            }])
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
            Ok(1)
        }
    }

    struct MockSearchRepository;

    #[async_trait]
    impl crate::domain::ports::SearchRepository for MockSearchRepository {
        async fn search(
            &self,
            _query: &str,
            _filters: &crate::domain::ports::SearchFilters,
        ) -> Result<Vec<SearchResult>, String> {
            Ok(Vec::new())
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
    async fn test_index_gmail_execution() {
        let gmail_repo = Arc::new(MockGmailRepository);
        let search_repo = Arc::new(MockSearchRepository);
        let sync_repo = Arc::new(MockSyncStateRepository);

        let use_case = IndexGmailUseCase::new(gmail_repo, search_repo, sync_repo);

        let req = IndexGmailRequest {
            query: None,
            max_results: 100,
        };

        let result = use_case.execute(req).await;
        assert!(result.is_ok());

        let resp = result.unwrap();
        assert!(resp.success);
        assert_eq!(resp.indexed_count, 1);
    }

    #[test]
    fn test_truncate_text() {
        let text = "This is a long text that should be truncated";
        let truncated = truncate_text(text, 10);
        assert!(truncated.len() <= 13); // 10 + "..."
    }
}
