// SearchRepository implementation using SQLite and FTS5

use crate::domain::{SearchResult, ports::{SearchRepository, SearchFilters}};
use async_trait::async_trait;
use chrono::Utc;
use serde_json::json;
use sqlx::SqlitePool;
use uuid::Uuid;

pub struct SqliteSearchRepository {
    pool: SqlitePool,
}

impl SqliteSearchRepository {
    pub fn new(pool: SqlitePool) -> Self {
        Self { pool }
    }
}

#[async_trait]
impl SearchRepository for SqliteSearchRepository {
    async fn search(
        &self,
        query: &str,
        filters: &SearchFilters,
    ) -> Result<Vec<SearchResult>, String> {
        // Escape the query for FTS5 - wrap in quotes for phrase search
        let fts_query = format!("\"{}\"", query.replace("\"", "\"\""));

        // Build the SQL query with filters using FTS5 virtual table
        // FTS5 uses a simpler syntax: just search the virtual table directly
        let mut sql = String::from(
            r#"
            SELECT
                sr.id, sr.source_type, sr.title, sr.snippet, sr.body_text,
                sr.created_at, sr.rank_score, sr.metadata
            FROM search_results sr
            WHERE sr.rowid IN (
                SELECT rowid FROM search_results_fts WHERE search_results_fts MATCH ?
            )
            "#,
        );

        // Add source filter
        match &filters.source {
            crate::domain::ports::SearchSource::Gmail => {
                sql.push_str(" AND sr.source_type = 'gmail'");
            }
            crate::domain::ports::SearchSource::Files => {
                sql.push_str(" AND sr.source_type = 'file'");
            }
            crate::domain::ports::SearchSource::All => {}
        }

        // Add time range filter
        match &filters.time_range {
            crate::domain::ports::TimeRange::Last7Days => {
                sql.push_str(" AND sr.created_at > datetime('now', '-7 days')");
            }
            crate::domain::ports::TimeRange::Last30Days => {
                sql.push_str(" AND sr.created_at > datetime('now', '-30 days')");
            }
            crate::domain::ports::TimeRange::Last365Days => {
                sql.push_str(" AND sr.created_at > datetime('now', '-365 days')");
            }
            crate::domain::ports::TimeRange::AllTime => {}
        }

        // Add label filter for Gmail
        if !filters.labels.is_empty() {
            sql.push_str(" AND (");
            for (i, _) in filters.labels.iter().enumerate() {
                if i > 0 {
                    sql.push_str(" OR ");
                }
                sql.push_str("sr.metadata->>'labels' LIKE ?");
            }
            sql.push_str(")");
        }

        sql.push_str(" ORDER BY sr.rank_score DESC, sr.created_at DESC LIMIT 100");

        let mut query_builder = sqlx::query_as::<_, (String, String, String, Option<String>, String, String, f32, Option<String>)>(&sql)
            .bind(&fts_query);

        // Bind label parameters
        for label in &filters.labels {
            query_builder = query_builder.bind(format!("%{}%", label));
        }

        let results = query_builder
            .fetch_all(&self.pool)
            .await
            .map_err(|e| e.to_string())?;

        Ok(results
            .into_iter()
            .map(|(id, source_type, title, snippet, body_text, created_at, rank_score, metadata)| {
                SearchResult {
                    id,
                    source_type,
                    title,
                    snippet: snippet.unwrap_or_default(),
                    body_text,
                    created_at: chrono::DateTime::parse_from_rfc3339(&created_at)
                        .ok()
                        .map(|dt| dt.with_timezone(&Utc))
                        .unwrap_or_else(Utc::now),
                    rank_score,
                    metadata: metadata
                        .and_then(|m| serde_json::from_str(&m).ok())
                        .unwrap_or(json!({})),
                }
            })
            .collect())
    }

    async fn index_item(&self, item: &SearchResult) -> Result<(), String> {
        let id = if item.id.is_empty() {
            Uuid::new_v4().to_string()
        } else {
            item.id.clone()
        };

        let metadata = serde_json::to_string(&item.metadata)
            .map_err(|e| e.to_string())?;

        sqlx::query(
            r#"
            INSERT INTO search_results
            (id, source_type, title, snippet, body_text, created_at, rank_score, metadata)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
            ON CONFLICT(id) DO UPDATE SET
                title = excluded.title,
                snippet = excluded.snippet,
                body_text = excluded.body_text,
                rank_score = excluded.rank_score,
                metadata = excluded.metadata
            "#,
        )
        .bind(&id)
        .bind(&item.source_type)
        .bind(&item.title)
        .bind(&item.snippet)
        .bind(&item.body_text)
        .bind(item.created_at.to_rfc3339())
        .bind(item.rank_score)
        .bind(&metadata)
        .execute(&self.pool)
        .await
        .map_err(|e| e.to_string())?;

        Ok(())
    }

    async fn delete_all(&self) -> Result<(), String> {
        sqlx::query("DELETE FROM search_results")
            .execute(&self.pool)
            .await
            .map_err(|e| e.to_string())?;

        Ok(())
    }

    async fn get_item_count(&self) -> Result<u64, String> {
        let count: (i64,) = sqlx::query_as("SELECT COUNT(*) FROM search_results")
            .fetch_one(&self.pool)
            .await
            .map_err(|e| e.to_string())?;

        Ok(count.0 as u64)
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use sqlx::sqlite::SqlitePool;

    async fn setup_test_db() -> SqlitePool {
        let pool = SqlitePool::connect("sqlite::memory:")
            .await
            .expect("Failed to create test db");

        sqlx::query(
            r#"
            CREATE TABLE search_results (
                id TEXT PRIMARY KEY,
                source_type TEXT NOT NULL,
                title TEXT NOT NULL,
                snippet TEXT,
                body_text TEXT NOT NULL,
                created_at DATETIME NOT NULL,
                rank_score REAL NOT NULL DEFAULT 0.0,
                metadata TEXT
            )
            "#,
        )
        .execute(&pool)
        .await
        .expect("Failed to create table");

        pool
    }

    #[tokio::test]
    async fn test_index_item() {
        let pool = setup_test_db().await;
        let repo = SqliteSearchRepository::new(pool);

        let item = SearchResult {
            id: "test-1".to_string(),
            source_type: "gmail".to_string(),
            title: "Test Email".to_string(),
            snippet: "This is a test".to_string(),
            body_text: "This is a test email body".to_string(),
            created_at: Utc::now(),
            rank_score: 0.95,
            metadata: json!({ "labels": ["inbox"] }),
        };

        let result = repo.index_item(&item).await;
        assert!(result.is_ok());

        let count = repo.get_item_count().await.unwrap();
        assert_eq!(count, 1);
    }

    #[tokio::test]
    async fn test_delete_all() {
        let pool = setup_test_db().await;
        let repo = SqliteSearchRepository::new(pool);

        let item = SearchResult {
            id: "test-1".to_string(),
            source_type: "gmail".to_string(),
            title: "Test Email".to_string(),
            snippet: "This is a test".to_string(),
            body_text: "This is a test email body".to_string(),
            created_at: Utc::now(),
            rank_score: 0.95,
            metadata: json!({}),
        };

        repo.index_item(&item).await.unwrap();
        assert_eq!(repo.get_item_count().await.unwrap(), 1);

        repo.delete_all().await.unwrap();
        assert_eq!(repo.get_item_count().await.unwrap(), 0);
    }

    #[tokio::test]
    async fn test_get_item_count() {
        let pool = setup_test_db().await;
        let repo = SqliteSearchRepository::new(pool);

        assert_eq!(repo.get_item_count().await.unwrap(), 0);

        for i in 0..5 {
            let item = SearchResult {
                id: format!("test-{}", i),
                source_type: "file".to_string(),
                title: format!("File {}", i),
                snippet: "".to_string(),
                body_text: "test content".to_string(),
                created_at: Utc::now(),
                rank_score: 0.5,
                metadata: json!({}),
            };
            repo.index_item(&item).await.unwrap();
        }

        assert_eq!(repo.get_item_count().await.unwrap(), 5);
    }
}
