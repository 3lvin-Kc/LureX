// Application dependency injection container

use crate::application::use_cases::{
    ConnectGmailUseCase, DeleteIndexUseCase, DisconnectGmailUseCase, GetStatusUseCase,
    IndexFilesUseCase, IndexGmailUseCase, SearchUseCase,
};
use crate::config::AppConfig;
use crate::domain::ports::{FileRepository, GmailRepository, SearchRepository, SyncStateRepository};
use crate::infrastructure::{
    db::{DbConnection, SqliteSearchRepository, SqliteSyncStateRepository},
    file_system::FileSystemRepository,
    gmail::SqliteGmailRepository,
};
use std::sync::Arc;

/// Application container for dependency injection
pub struct AppContainer {
    pub search_repo: Arc<dyn SearchRepository>,
    pub gmail_repo: Arc<dyn GmailRepository>,
    pub file_repo: Arc<dyn FileRepository>,
    pub sync_state_repo: Arc<dyn SyncStateRepository>,
    pub search_use_case: Arc<SearchUseCase>,
    pub connect_gmail_use_case: Arc<ConnectGmailUseCase>,
    pub index_gmail_use_case: Arc<IndexGmailUseCase>,
    pub index_files_use_case: Arc<IndexFilesUseCase>,
    pub disconnect_gmail_use_case: Arc<DisconnectGmailUseCase>,
    pub delete_index_use_case: Arc<DeleteIndexUseCase>,
    pub get_status_use_case: Arc<GetStatusUseCase>,
}

impl AppContainer {
    /// Create a new application container with all dependencies initialized
    pub async fn new(config: AppConfig) -> Result<Self, Box<dyn std::error::Error>> {
        // Initialize database connection
        let db_conn = DbConnection::new(&config.db_path).await?;
        db_conn.migrate().await?;

        // Create repositories
        let search_repo: Arc<dyn SearchRepository> =
            Arc::new(SqliteSearchRepository::new(db_conn.pool().clone()));

        let sync_state_repo: Arc<dyn SyncStateRepository> =
            Arc::new(SqliteSyncStateRepository::new(db_conn.pool().clone()));

        let file_repo: Arc<dyn FileRepository> =
            Arc::new(FileSystemRepository::new(config.max_extract_size));

        // Gmail repository requires access token, so we create a placeholder
        // It will be initialized when user connects Gmail
        let gmail_repo: Arc<dyn GmailRepository> = Arc::new(SqliteGmailRepository::new(
            "placeholder_token".to_string(),
            db_conn.pool().clone(),
        ));

        // Initialize use cases
        let search_use_case = Arc::new(SearchUseCase::new(search_repo.clone()));

        let connect_gmail_use_case = Arc::new(ConnectGmailUseCase::new());

        let index_gmail_use_case = Arc::new(IndexGmailUseCase::new(
            gmail_repo.clone(),
            search_repo.clone(),
            sync_state_repo.clone(),
        ));

        let index_files_use_case = Arc::new(IndexFilesUseCase::new(
            file_repo.clone(),
            search_repo.clone(),
            sync_state_repo.clone(),
        ));

        let disconnect_gmail_use_case = Arc::new(DisconnectGmailUseCase::new(
            gmail_repo.clone(),
            sync_state_repo.clone(),
        ));

        let delete_index_use_case = Arc::new(DeleteIndexUseCase::new(
            search_repo.clone(),
            gmail_repo.clone(),
            file_repo.clone(),
            sync_state_repo.clone(),
        ));

        let get_status_use_case = Arc::new(GetStatusUseCase::new(
            search_repo.clone(),
            gmail_repo.clone(),
            file_repo.clone(),
            sync_state_repo.clone(),
        ));

        Ok(Self {
            search_repo,
            gmail_repo,
            file_repo,
            sync_state_repo,
            search_use_case,
            connect_gmail_use_case,
            index_gmail_use_case,
            index_files_use_case,
            disconnect_gmail_use_case,
            delete_index_use_case,
            get_status_use_case,
        })
    }

    /// Create a Gmail repository with a real access token
    pub fn create_gmail_repository(&self, access_token: String, pool: sqlx::SqlitePool) -> Arc<dyn GmailRepository> {
        Arc::new(SqliteGmailRepository::new(
            access_token,
            pool,
        ))
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use tempfile::TempDir;

    #[tokio::test]
    async fn test_create_app_container() {
        let temp_dir = TempDir::new().unwrap();
        let db_path = temp_dir.path().join("test.db");

        let config = AppConfig {
            db_path,
            data_dir: temp_dir.path().to_path_buf(),
            google_client_id: "test_id".to_string(),
            google_client_secret: "test_secret".to_string(),
            oauth_port: 9999,
            gmail_sync_interval: 600,
            max_extract_size: 200 * 1024,
            supported_extensions: vec!["txt".to_string(), "md".to_string()],
        };

        let container = AppContainer::new(config).await;
        assert!(container.is_ok());
    }

    #[tokio::test]
    async fn test_container_has_all_repos() {
        let temp_dir = TempDir::new().unwrap();
        let db_path = temp_dir.path().join("test.db");

        let config = AppConfig {
            db_path,
            data_dir: temp_dir.path().to_path_buf(),
            google_client_id: "test_id".to_string(),
            google_client_secret: "test_secret".to_string(),
            oauth_port: 9999,
            gmail_sync_interval: 600,
            max_extract_size: 200 * 1024,
            supported_extensions: vec!["txt".to_string()],
        };

        let container = AppContainer::new(config).await.unwrap();

        // Verify all repositories are initialized
        let count = container.search_repo.get_item_count().await;
        assert!(count.is_ok());
    }

    #[tokio::test]
    async fn test_container_has_all_use_cases() {
        let temp_dir = TempDir::new().unwrap();
        let db_path = temp_dir.path().join("test.db");

        let config = AppConfig {
            db_path,
            data_dir: temp_dir.path().to_path_buf(),
            google_client_id: "test_id".to_string(),
            google_client_secret: "test_secret".to_string(),
            oauth_port: 9999,
            gmail_sync_interval: 600,
            max_extract_size: 200 * 1024,
            supported_extensions: vec!["txt".to_string()],
        };

        let container = AppContainer::new(config).await.unwrap();

        // Verify all use cases are initialized and callable
        // This is a simple check that they exist
        let _ = &container.search_use_case;
        let _ = &container.connect_gmail_use_case;
        let _ = &container.index_gmail_use_case;
        let _ = &container.index_files_use_case;
        let _ = &container.disconnect_gmail_use_case;
        let _ = &container.delete_index_use_case;
        let _ = &container.get_status_use_case;
    }
}
