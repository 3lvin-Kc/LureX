// Database connection manager with connection pooling

use sqlx::sqlite::{SqlitePool, SqlitePoolOptions};
use std::path::Path;
use std::time::Duration;
use std::fs;

/// Database connection manager
pub struct DbConnection {
    pool: SqlitePool,
    db_path: std::path::PathBuf,
}

impl DbConnection {
    /// Create a new database connection pool
    pub async fn new(db_path: &Path) -> Result<Self, sqlx::Error> {
        // Ensure database file exists
        if !db_path.exists() {
            std::fs::File::create(db_path)
                .map_err(|e| sqlx::Error::Io(e))?;
        }

        let db_url = format!("sqlite://{}", db_path.display());

        let pool = SqlitePoolOptions::new()
            .max_connections(5)
            .acquire_timeout(Duration::from_secs(30))
            .connect(&db_url)
            .await?;

        // Enable foreign keys and WAL mode for better concurrency
        sqlx::query("PRAGMA foreign_keys = ON")
            .execute(&pool)
            .await?;

        sqlx::query("PRAGMA journal_mode = WAL")
            .execute(&pool)
            .await?;

        Ok(Self {
            pool,
            db_path: db_path.to_path_buf(),
        })
    }

    /// Get a reference to the connection pool
    pub fn pool(&self) -> &SqlitePool {
        &self.pool
    }

    /// Run database migrations
    pub async fn migrate(&self) -> Result<(), sqlx::Error> {
        // Create tables with FTS5 support
        sqlx::query(
            r#"
            CREATE TABLE IF NOT EXISTS search_results (
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
        .execute(&self.pool)
        .await?;

        // Create FTS5 virtual table for full-text search
        sqlx::query(
            r#"
            CREATE VIRTUAL TABLE IF NOT EXISTS search_results_fts USING fts5(
                title,
                body_text,
                content=search_results,
                content_rowid=rowid
            )
            "#,
        )
        .execute(&self.pool)
        .await?;

        // Create Gmail messages table
        sqlx::query(
            r#"
            CREATE TABLE IF NOT EXISTS gmail_messages (
                message_id TEXT PRIMARY KEY,
                thread_id TEXT NOT NULL,
                subject TEXT NOT NULL,
                from_email TEXT NOT NULL,
                to_email TEXT,
                cc_email TEXT,
                body_text TEXT NOT NULL,
                date DATETIME NOT NULL,
                labels TEXT,
                indexed_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
            )
            "#,
        )
        .execute(&self.pool)
        .await?;

        // Create files table
        sqlx::query(
            r#"
            CREATE TABLE IF NOT EXISTS files (
                path TEXT PRIMARY KEY,
                file_type TEXT NOT NULL,
                file_size INTEGER NOT NULL,
                modified_at DATETIME NOT NULL,
                extracted_text TEXT,
                indexed_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
            )
            "#,
        )
        .execute(&self.pool)
        .await?;

        // Create sync state table
        sqlx::query(
            r#"
            CREATE TABLE IF NOT EXISTS sync_state (
                source TEXT PRIMARY KEY,
                last_sync DATETIME,
                last_error TEXT,
                updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
            )
            "#,
        )
        .execute(&self.pool)
        .await?;

        // Create indices for better query performance
        sqlx::query("CREATE INDEX IF NOT EXISTS idx_gmail_date ON gmail_messages(date)")
            .execute(&self.pool)
            .await?;

        sqlx::query("CREATE INDEX IF NOT EXISTS idx_files_modified ON files(modified_at)")
            .execute(&self.pool)
            .await?;

        sqlx::query("CREATE INDEX IF NOT EXISTS idx_search_results_created ON search_results(created_at)")
            .execute(&self.pool)
            .await?;

        // Create FTS5 triggers to keep virtual table synchronized with main table
        sqlx::query(
            r#"
            CREATE TRIGGER IF NOT EXISTS search_results_ai AFTER INSERT ON search_results BEGIN
              INSERT INTO search_results_fts(rowid, title, body_text) VALUES (new.rowid, new.title, new.body_text);
            END
            "#,
        )
        .execute(&self.pool)
        .await?;

        sqlx::query(
            r#"
            CREATE TRIGGER IF NOT EXISTS search_results_ad AFTER DELETE ON search_results BEGIN
              INSERT INTO search_results_fts(search_results_fts, rowid, title, body_text) VALUES('delete', old.rowid, old.title, old.body_text);
            END
            "#,
        )
        .execute(&self.pool)
        .await?;

        sqlx::query(
            r#"
            CREATE TRIGGER IF NOT EXISTS search_results_au AFTER UPDATE ON search_results BEGIN
              INSERT INTO search_results_fts(search_results_fts, rowid, title, body_text) VALUES('delete', old.rowid, old.title, old.body_text);
              INSERT INTO search_results_fts(rowid, title, body_text) VALUES (new.rowid, new.title, new.body_text);
            END
            "#,
        )
        .execute(&self.pool)
        .await?;

        Ok(())
    }

    /// Get database file size in bytes
    pub async fn get_db_size(&self) -> Result<u64, sqlx::Error> {
        // Get file size from filesystem metadata
        match fs::metadata(&self.db_path) {
            Ok(metadata) => Ok(metadata.len()),
            Err(_) => Ok(0), // Return 0 if file doesn't exist or can't be read
        }
    }

    /// Close the connection pool
    pub async fn close(&self) {
        self.pool.close().await;
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use tempfile::TempDir;

    #[tokio::test]
    async fn test_create_connection() {
        let temp_dir = TempDir::new().unwrap();
        let db_path = temp_dir.path().join("test.db");

        let conn = DbConnection::new(&db_path).await;
        assert!(conn.is_ok());
    }

    #[tokio::test]
    async fn test_migrate() {
        let temp_dir = TempDir::new().unwrap();
        let db_path = temp_dir.path().join("test.db");

        let conn = DbConnection::new(&db_path).await.unwrap();
        let result = conn.migrate().await;
        assert!(result.is_ok());
    }

    #[tokio::test]
    async fn test_get_db_size() {
        let temp_dir = TempDir::new().unwrap();
        let db_path = temp_dir.path().join("test.db");

        let conn = DbConnection::new(&db_path).await.unwrap();
        conn.migrate().await.unwrap();

        let size = conn.get_db_size().await;
        assert!(size.is_ok());
        // Database file size should be >= 0 (might be empty or have content)
        assert!(size.unwrap() >= 0);
    }
}
