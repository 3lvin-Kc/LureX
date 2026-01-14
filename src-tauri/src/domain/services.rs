// Domain services - pure business logic

/// SearchRanker implements ranking logic for search results
pub struct SearchRanker;

impl SearchRanker {
    /// Create a new SearchRanker
    pub fn new() -> Self {
        Self
    }

    /// Rank search results by relevance and recency
    ///
    /// Results are sorted by:
    /// 1. Relevance score (from FTS5 BM25)
    /// 2. Recency boost (newer items ranked higher)
    pub fn rank(mut results: Vec<crate::domain::SearchResult>) -> Vec<crate::domain::SearchResult> {
        results.sort_by(|a, b| {
            // Sort by rank score (descending)
            b.rank_score.partial_cmp(&a.rank_score)
                .unwrap_or(std::cmp::Ordering::Equal)
                .then_with(|| {
                    // Then by recency (newer first)
                    b.created_at.cmp(&a.created_at)
                })
        });
        results
    }
}

impl Default for SearchRanker {
    fn default() -> Self {
        Self::new()
    }
}

/// ContentFilter filters search results by criteria
pub struct ContentFilter;

impl ContentFilter {
    /// Create a new ContentFilter
    pub fn new() -> Self {
        Self
    }

    /// Filter results by source type
    pub fn by_source(
        results: Vec<crate::domain::SearchResult>,
        source: &str,
    ) -> Vec<crate::domain::SearchResult> {
        if source == "all" {
            results
        } else {
            results.into_iter()
                .filter(|r| r.source_type == source)
                .collect()
        }
    }

    /// Filter results to recent items (last N days)
    pub fn by_recency(
        results: Vec<crate::domain::SearchResult>,
        days: i64,
    ) -> Vec<crate::domain::SearchResult> {
        use chrono::Utc;

        let cutoff = Utc::now() - chrono::Duration::days(days);
        results.into_iter()
            .filter(|r| r.created_at > cutoff)
            .collect()
    }
}

impl Default for ContentFilter {
    fn default() -> Self {
        Self::new()
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use chrono::Utc;

    #[test]
    fn test_search_ranker_sorts_by_score() {
        let ranker = SearchRanker::new();

        let result1 = crate::domain::SearchResult {
            rank_score: 0.5,
            ..Default::default()
        };

        let result2 = crate::domain::SearchResult {
            rank_score: 0.9,
            ..Default::default()
        };

        let ranked = SearchRanker::rank(vec![result1.clone(), result2.clone()]);
        assert!(ranked[0].rank_score >= ranked[1].rank_score);
    }

    #[test]
    fn test_content_filter_by_source() {
        let results = vec![
            crate::domain::SearchResult {
                source_type: "gmail".to_string(),
                ..Default::default()
            },
            crate::domain::SearchResult {
                source_type: "file".to_string(),
                ..Default::default()
            },
        ];

        let filtered = ContentFilter::by_source(results, "gmail");
        assert_eq!(filtered.len(), 1);
        assert_eq!(filtered[0].source_type, "gmail");
    }
}
