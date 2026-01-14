// Sync state repository implementation

use crate::domain::ports::SyncStateRepository;
use async_trait::async_trait;
use sqlx::SqlitePool;

/// SQLite implementation of SyncStateRepository
pub struct SqliteSyncStateRepository {
    pool: SqlitePool,
}

impl SqliteSyncStateRepository {
    /// Create a new sync state repository
    pub fn new(pool: SqlitePool) -> Self {
        Self { pool }
    }
}

#[async_trait]
impl SyncStateRepository for SqliteSyncStateRepository {
    async fn get_last_sync(&self, source: &str) -> Result<Option<String>, String> {
        let result: Option<(String,)> = sqlx::query_as(
            "SELECT last_sync FROM sync_state WHERE source = ?",
        )
        .bind(source)
        .fetch_optional(&self.pool)
        .await
        .map_err(|e| e.to_string())?;

        Ok(result.map(|(timestamp,)| timestamp))
    }

    async fn set_last_sync(&self, source: &str, timestamp: &str) -> Result<(), String> {
        sqlx::query(
            r#"
            INSERT INTO sync_state (source, last_sync, updated_at)
            VALUES (?, ?, datetime('now'))
            ON CONFLICT(source) DO UPDATE SET
                last_sync = excluded.last_sync,
                updated_at = datetime('now')
            "#,
        )
        .bind(source)
        .bind(timestamp)
        .execute(&self.pool)
        .await
        .map_err(|e| format!("Failed to set last sync: {}", e))?;

        Ok(())
    }

    async fn get_last_error(&self, source: &str) -> Result<Option<String>, String> {
        let result: Option<(Option<String>,)> = sqlx::query_as(
            "SELECT last_error FROM sync_state WHERE source = ?",
        )
        .bind(source)
        .fetch_optional(&self.pool)
        .await
        .map_err(|e| e.to_string())?;

        Ok(result.and_then(|(error,)| error))
    }

    async fn set_last_error(&self, source: &str, error: &str) -> Result<(), String> {
        sqlx::query(
            r#"
            INSERT INTO sync_state (source, last_error, updated_at)
            VALUES (?, ?, datetime('now'))
            ON CONFLICT(source) DO UPDATE SET
                last_error = excluded.last_error,
                updated_at = datetime('now')
            "#,
        )
        .bind(source)
        .bind(error)
        .execute(&self.pool)
        .await
        .map_err(|e| format!("Failed to set last error: {}", e))?;

        Ok(())
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    async fn setup_test_db() -> SqlitePool {
        let pool = SqlitePool::connect("sqlite::memory:")
            .await
            .expect("Failed to create test pool");

        sqlx::query(
            r#"
            CREATE TABLE sync_state (
                source TEXT PRIMARY KEY,
                last_sync DATETIME,
                last_error TEXT,
                updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
            )
            "#,
        )
        .execute(&pool)
        .await
        .ok();

        pool
    }

    #[tokio::test]
    async fn test_set_and_get_last_sync() {
        let pool = setup_test_db().await;
        let repo = SqliteSyncStateRepository::new(pool);

        let timestamp = Utc::now().to_rfc3339();
        let result = repo.set_last_sync("gmail", &timestamp).await;
        assert!(result.is_ok());

        let retrieved = repo.get_last_sync("gmail").await.unwrap();
        assert_eq!(retrieved, Some(timestamp));
    }

    #[tokio::test]
    async fn test_set_and_get_last_error() {
        let pool = setup_test_db().await;
        let repo = SqliteSyncStateRepository::new(pool);

        let error_msg = "Connection timeout";
        let result = repo.set_last_error("gmail", error_msg).await;
        assert!(result.is_ok());

        let retrieved = repo.get_last_error("gmail").await.unwrap();
        assert_eq!(retrieved, Some(error_msg.to_string()));
    }

    #[tokio::test]
    async fn test_nonexistent_source() {
        let pool = setup_test_db().await;
        let repo = SqliteSyncStateRepository::new(pool);

        let result = repo.get_last_sync("nonexistent").await.unwrap();
        assert_eq!(result, None);

        let error = repo.get_last_error("nonexistent").await.unwrap();
        assert_eq!(error, None);
    }

    #[tokio::test]
    async fn test_update_existing_sync() {
        let pool = setup_test_db().await;
        let repo = SqliteSyncStateRepository::new(pool);

        let time1 = Utc::now().to_rfc3339();
        repo.set_last_sync("gmail", &time1).await.ok();

        let time2 = Utc::now().to_rfc3339();
        repo.set_last_sync("gmail", &time2).await.ok();

        let retrieved = repo.get_last_sync("gmail").await.unwrap();
        assert_eq!(retrieved, Some(time2));
    }
}
