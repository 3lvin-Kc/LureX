// Search use case - executes search queries against the local index

use crate::application::ApplicationResult;
use crate::domain::{SearchResult, ports::{SearchRepository, SearchFilters}};
use std::sync::Arc;

/// SearchUseCase executes search queries against the indexed items
///
/// This use case:
/// 1. Validates the search query
/// 2. Calls the search repository
/// 3. Ranks results by relevance and recency
/// 4. Returns results as DTOs
pub struct SearchUseCase {
    search_repo: Arc<dyn SearchRepository>,
}

impl SearchUseCase {
    /// Create a new SearchUseCase
    pub fn new(search_repo: Arc<dyn SearchRepository>) -> Self {
        Self { search_repo }
    }

    /// Execute a search query with optional filters
    ///
    /// # Arguments
    /// * `query` - Search string (empty returns recent items)
    /// * `filters` - Time range, source type, labels
    ///
    /// # Returns
    /// Vec of ranked search results (newest/most relevant first)
    ///
    /// # Errors
    /// Returns ApplicationError if search fails or query is invalid
    pub async fn execute(
        &self,
        query: &str,
        filters: SearchFilters,
    ) -> ApplicationResult<Vec<SearchResultDTO>> {
        // 1. Validate input
        if query.len() > 500 {
            return Err(crate::application::ApplicationError::ValidationError(
                "Query too long (max 500 chars)".to_string(),
            ));
        }

        tracing::info!("Executing search query: {}", query);

        // 2. Query repository (abstracted interface)
        let results = self
            .search_repo
            .search(query, &filters)
            .await
            .map_err(|e| crate::application::ApplicationError::RepositoryError(e))?;

        // 3. Rank results (pure domain logic)
        let ranked = crate::domain::services::SearchRanker::rank(results);

        // 4. Convert to DTOs
        let dtos: Vec<SearchResultDTO> = ranked
            .into_iter()
            .map(|r| SearchResultDTO {
                id: r.id,
                source_type: r.source_type,
                title: r.title,
                snippet: r.snippet,
                created_at: r.created_at.to_rfc3339(),
                metadata: r.metadata,
            })
            .collect();

        tracing::info!("Search returned {} results", dtos.len());
        Ok(dtos)
    }
}

/// SearchResultDTO is the API representation of a search result
#[derive(Clone, Debug, serde::Serialize, serde::Deserialize)]
pub struct SearchResultDTO {
    pub id: String,
    pub source_type: String,
    pub title: String,
    pub snippet: String,
    pub created_at: String,
    pub metadata: serde_json::Value,
}

#[cfg(test)]
mod tests {
    use super::*;
    use async_trait::async_trait;

    struct MockSearchRepository {
        results: Vec<SearchResult>,
    }

    #[async_trait]
    impl SearchRepository for MockSearchRepository {
        async fn search(
            &self,
            _query: &str,
            _filters: &SearchFilters,
        ) -> Result<Vec<SearchResult>, String> {
            Ok(self.results.clone())
        }

        async fn index_item(&self, _item: &SearchResult) -> Result<(), String> {
            Ok(())
        }

        async fn delete_all(&self) -> Result<(), String> {
            Ok(())
        }

        async fn get_item_count(&self) -> Result<u64, String> {
            Ok(self.results.len() as u64)
        }
    }

    #[tokio::test]
    async fn test_search_returns_results() {
        let results = vec![SearchResult {
            id: "1".to_string(),
            title: "Test Result".to_string(),
            source_type: "gmail".to_string(),
            snippet: "Test snippet".to_string(),
            body_text: "Test body".to_string(),
            created_at: chrono::Utc::now(),
            rank_score: 1.0,
            metadata: serde_json::json!({}),
        }];

        let mock_repo = Arc::new(MockSearchRepository {
            results: results.clone(),
        });

        let use_case = SearchUseCase::new(mock_repo);
        let search_results = use_case
            .execute("test", SearchFilters::default())
            .await
            .unwrap();

        assert_eq!(search_results.len(), 1);
        assert_eq!(search_results[0].title, "Test Result");
    }

    #[tokio::test]
    async fn test_search_validates_query_length() {
        let mock_repo = Arc::new(MockSearchRepository { results: vec![] });
        let use_case = SearchUseCase::new(mock_repo);

        let long_query = "x".repeat(600);
        let result = use_case
            .execute(&long_query, SearchFilters::default())
            .await;

        assert!(result.is_err());
    }

    #[tokio::test]
    async fn test_search_empty_query() {
        let mock_repo = Arc::new(MockSearchRepository { results: vec![] });
        let use_case = SearchUseCase::new(mock_repo);

        let results = use_case
            .execute("", SearchFilters::default())
            .await
            .unwrap();

        assert_eq!(results.len(), 0);
    }
}
