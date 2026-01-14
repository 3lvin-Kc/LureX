// Domain ports (trait interfaces)
//
// These traits define the contracts between domain and infrastructure.
// Infrastructure implements these; domain uses them.
// This enables dependency inversion and testability.

use crate::domain::{GmailMessage, LocalFile, SearchResult};
use async_trait::async_trait;

/// Error type for repository operations
pub type RepositoryResult<T> = Result<T, String>;

/// SearchRepository defines how to search and index items
#[async_trait]
pub trait SearchRepository: Send + Sync {
    /// Search for items matching a query
    async fn search(
        &self,
        query: &str,
        filters: &SearchFilters,
    ) -> RepositoryResult<Vec<SearchResult>>;

    /// Index a single item
    async fn index_item(&self, item: &SearchResult) -> RepositoryResult<()>;

    /// Delete all indexed items
    async fn delete_all(&self) -> RepositoryResult<()>;

    /// Get total indexed item count
    async fn get_item_count(&self) -> RepositoryResult<u64>;
}

/// GmailRepository defines Gmail-specific operations
#[async_trait]
pub trait GmailRepository: Send + Sync {
    /// Fetch recent messages from Gmail
    async fn fetch_messages(&self, query: &str) -> RepositoryResult<Vec<GmailMessage>>;

    /// Save a message to local index
    async fn save_message(&self, msg: &GmailMessage) -> RepositoryResult<()>;

    /// Get a message by ID
    async fn get_message(&self, id: &str) -> RepositoryResult<Option<GmailMessage>>;

    /// Delete all Gmail data
    async fn delete_all(&self) -> RepositoryResult<()>;

    /// Get count of indexed Gmail messages
    async fn get_message_count(&self) -> RepositoryResult<u64>;
}

/// FileRepository defines file-specific operations
#[async_trait]
pub trait FileRepository: Send + Sync {
    /// Index files in a folder
    async fn index_folder(&self, path: &str) -> RepositoryResult<Vec<LocalFile>>;

    /// Save a file to index
    async fn save_file(&self, file: &LocalFile) -> RepositoryResult<()>;

    /// Get a file by path
    async fn get_file(&self, path: &str) -> RepositoryResult<Option<LocalFile>>;

    /// Delete all file data
    async fn delete_all(&self) -> RepositoryResult<()>;

    /// Get count of indexed files
    async fn get_file_count(&self) -> RepositoryResult<u64>;
}

/// SyncStateRepository tracks synchronization state
#[async_trait]
pub trait SyncStateRepository: Send + Sync {
    /// Get last sync time for a source
    async fn get_last_sync(&self, source: &str) -> RepositoryResult<Option<String>>;

    /// Update last sync time
    async fn set_last_sync(&self, source: &str, timestamp: &str) -> RepositoryResult<()>;

    /// Get last error for a source
    async fn get_last_error(&self, source: &str) -> RepositoryResult<Option<String>>;

    /// Update last error
    async fn set_last_error(&self, source: &str, error: &str) -> RepositoryResult<()>;
}

/// Search filters for query refinement
#[derive(Clone, Debug)]
pub struct SearchFilters {
    pub source: SearchSource,
    pub time_range: TimeRange,
    pub labels: Vec<String>,
}

impl Default for SearchFilters {
    fn default() -> Self {
        Self {
            source: SearchSource::All,
            time_range: TimeRange::AllTime,
            labels: vec![],
        }
    }
}

/// Search source filter
#[derive(Clone, Debug, PartialEq)]
pub enum SearchSource {
    Gmail,
    Files,
    All,
}

/// Time range filter for Gmail
#[derive(Clone, Debug, PartialEq)]
pub enum TimeRange {
    Last7Days,
    Last30Days,
    Last365Days,
    AllTime,
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_search_filters_default() {
        let filters = SearchFilters::default();
        assert_eq!(filters.source, SearchSource::All);
        assert_eq!(filters.time_range, TimeRange::AllTime);
    }

    #[test]
    fn test_search_filters_creation() {
        let filters = SearchFilters {
            source: SearchSource::Gmail,
            time_range: TimeRange::Last30Days,
            labels: vec!["inbox".to_string()],
        };
        assert_eq!(filters.source, SearchSource::Gmail);
        assert_eq!(filters.time_range, TimeRange::Last30Days);
    }
}
