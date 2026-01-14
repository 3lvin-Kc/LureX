// Index Files use case - indexes local file system

use crate::domain::{
    ports::{FileRepository, SearchRepository, SyncStateRepository},
    SearchResult,
};
use chrono::Utc;
use serde::{Deserialize, Serialize};
use std::sync::Arc;

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct IndexFilesRequest {
    pub folders: Vec<String>, // Paths to index
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct IndexFilesResponse {
    pub success: bool,
    pub indexed_count: u64,
    pub total_files: u64,
    pub message: String,
}

/// Use case for indexing local files
pub struct IndexFilesUseCase {
    file_repo: Arc<dyn FileRepository>,
    search_repo: Arc<dyn SearchRepository>,
    sync_state_repo: Arc<dyn SyncStateRepository>,
}

impl IndexFilesUseCase {
    /// Create a new IndexFiles use case
    pub fn new(
        file_repo: Arc<dyn FileRepository>,
        search_repo: Arc<dyn SearchRepository>,
        sync_state_repo: Arc<dyn SyncStateRepository>,
    ) -> Self {
        Self {
            file_repo,
            search_repo,
            sync_state_repo,
        }
    }

    /// Execute the index files use case
    pub async fn execute(&self, req: IndexFilesRequest) -> Result<IndexFilesResponse, String> {
        tracing::info!("Starting file indexing for {} paths (folders and/or files)", req.folders.len());
        tracing::info!("Paths to index: {:?}", req.folders);

        let mut total_indexed = 0u64;

        // Index each path (could be folder or individual file)
        for path in &req.folders {
            tracing::info!("Processing path: {}", path);

            // Check if path is a file or folder
            let path_obj = std::path::Path::new(path);
            let exists = path_obj.exists();
            let is_file = path_obj.is_file();
            let is_dir = path_obj.is_dir();

            tracing::info!("Path analysis - exists: {}, is_file: {}, is_dir: {}", exists, is_file, is_dir);

            if is_file {
                // Handle individual file
                tracing::info!("Path is a file: {}", path);
                match self.index_individual_file(path).await {
                    Ok(()) => {
                        total_indexed += 1;
                        tracing::info!("Successfully indexed individual file: {}", path);
                    }
                    Err(e) => {
                        tracing::error!("Failed to index file {}: {}", path, e);
                    }
                }
            } else if is_dir {
                // Handle folder
                tracing::info!("Path is a directory: {}", path);
                match self.file_repo.index_folder(path).await {
                    Ok(files) => {
                        tracing::debug!("Found {} files in {}", files.len(), path);

                        // Index each file
                        for file in files {
                            // Save to file repository
                            if let Err(e) = self.file_repo.save_file(&file).await {
                                tracing::warn!("Failed to save file {}: {}", file.path, e);
                                continue;
                            }

                            // Create search result from file
                            let search_result = SearchResult {
                                id: file.path.clone(),
                                source_type: "file".to_string(),
                                title: extract_filename(&file.path),
                                snippet: truncate_text(&file.extracted_text, 200),
                                body_text: file.extracted_text.clone(),
                                created_at: file.modified_at,
                                rank_score: 0.5, // Default score
                                metadata: serde_json::json!({
                                    "file_type": file.file_type,
                                    "file_size": file.file_size,
                                    "modified_at": file.modified_at.to_rfc3339(),
                                }),
                            };

                            // Index in search repository
                            if let Err(e) = self.search_repo.index_item(&search_result).await {
                                tracing::warn!("Failed to index file {}: {}", file.path, e);
                                continue;
                            }

                            total_indexed += 1;
                            tracing::debug!("Indexed file: {}", file.path);
                        }
                    }
                    Err(e) => {
                        tracing::warn!("Failed to index folder {}: {}", path, e);
                    }
                }
            } else {
                tracing::error!("Path does not exist or is not accessible: {} (exists: {}, is_file: {}, is_dir: {})", path, exists, is_file, is_dir);
            }
        }

        // Update sync state
        let now = Utc::now().to_rfc3339();
        self.sync_state_repo
            .set_last_sync("files", &now)
            .await
            .map_err(|e| format!("Failed to update sync state: {}", e))?;

        tracing::info!("File indexing complete: {} files indexed", total_indexed);

        Ok(IndexFilesResponse {
            success: true,
            indexed_count: total_indexed,
            total_files: total_indexed,
            message: format!("Successfully indexed {} files", total_indexed),
        })
    }

    /// Index an individual file
    async fn index_individual_file(&self, file_path: &str) -> Result<(), String> {
        tracing::info!("[index_individual_file] Starting indexing for: {}", file_path);

        // Read file metadata and content
        let path_obj = std::path::Path::new(file_path);
        let file_name = extract_filename(file_path);

        tracing::info!("[index_individual_file] Extracted file name: {}", file_name);

        // Get file metadata
        let metadata = std::fs::metadata(file_path)
            .map_err(|e| {
                let error_msg = format!("Failed to read file metadata: {}", e);
                tracing::error!("[index_individual_file] {}", error_msg);
                error_msg
            })?;

        let file_size = metadata.len();
        tracing::info!("[index_individual_file] File size: {} bytes", file_size);
        let modified_at = metadata
            .modified()
            .ok()
            .and_then(|t| {
                let duration = t.duration_since(std::time::UNIX_EPOCH).ok()?;
                Some(chrono::DateTime::<chrono::Utc>::from(std::time::SystemTime::UNIX_EPOCH + duration))
            })
            .unwrap_or_else(chrono::Utc::now);

        // Determine file type from extension
        let file_type = path_obj
            .extension()
            .and_then(|ext| ext.to_str())
            .unwrap_or("unknown")
            .to_string();

        // Read file content (simplified - just get text if possible)
        let extracted_text = std::fs::read_to_string(file_path)
            .unwrap_or_else(|_| {
                tracing::warn!("[index_individual_file] Could not read file as text: {}", file_path);
                String::from("[Binary file - content not extracted]")
            });

        tracing::info!("[index_individual_file] Extracted text length: {}", extracted_text.len());

        // Create LocalFile domain object
        let file = crate::domain::LocalFile {
            path: file_path.to_string(),
            file_type: file_type.clone(),
            file_size,
            modified_at,
            extracted_text: extracted_text.clone(),
        };

        // Save to file repository
        tracing::info!("[index_individual_file] Saving file to repository");
        self.file_repo.save_file(&file).await
            .map_err(|e| {
                let error_msg = format!("Failed to save file to repository: {}", e);
                tracing::error!("[index_individual_file] {}", error_msg);
                error_msg
            })?;

        // Create search result from file
        let search_result = SearchResult {
            id: file_path.to_string(),
            source_type: "file".to_string(),
            title: file_name,
            snippet: truncate_text(&extracted_text, 200),
            body_text: extracted_text,
            created_at: modified_at,
            rank_score: 0.5,
            metadata: serde_json::json!({
                "file_type": path_obj.extension().and_then(|e| e.to_str()).unwrap_or("unknown"),
                "file_size": file_size,
                "modified_at": modified_at.to_rfc3339(),
            }),
        };

        // Index in search repository
        tracing::info!("[index_individual_file] Indexing in search repository");
        self.search_repo.index_item(&search_result).await
            .map_err(|e| {
                let error_msg = format!("Failed to index file in search repository: {}", e);
                tracing::error!("[index_individual_file] {}", error_msg);
                error_msg
            })?;

        tracing::info!("[index_individual_file] Successfully indexed file: {}", file_path);
        Ok(())
    }
}

/// Extract filename from full path
fn extract_filename(path: &str) -> String {
    path.split('/')
        .last()
        .and_then(|s| s.split('\\').last())
        .unwrap_or(path)
        .to_string()
}

/// Truncate text to maximum length
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
    use crate::domain::LocalFile;

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
    impl crate::domain::ports::SyncStateRepository for MockSyncStateRepository {
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

    #[test]
    fn test_extract_filename_unix() {
        assert_eq!(extract_filename("/path/to/file.txt"), "file.txt");
    }

    #[test]
    fn test_extract_filename_windows() {
        assert_eq!(extract_filename("C:\\path\\to\\file.txt"), "file.txt");
    }

    #[test]
    fn test_truncate_text() {
        let text = "This is a long text that should be truncated";
        let truncated = truncate_text(text, 10);
        assert!(truncated.ends_with("..."));
        assert!(truncated.len() <= 13);
    }

    #[tokio::test]
    async fn test_index_files_execution() {
        let file_repo = Arc::new(MockFileRepository);
        let search_repo = Arc::new(MockSearchRepository);
        let sync_repo = Arc::new(MockSyncStateRepository);

        let use_case = IndexFilesUseCase::new(file_repo, search_repo, sync_repo);

        let req = IndexFilesRequest {
            folders: vec!["/tmp".to_string()],
        };

        let result = use_case.execute(req).await;
        assert!(result.is_ok());
    }
}
