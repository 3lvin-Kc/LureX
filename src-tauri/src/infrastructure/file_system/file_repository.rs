// File system repository implementation

use crate::domain::{LocalFile, ports::FileRepository};
use async_trait::async_trait;
use chrono::Utc;
use std::path::Path;
use thiserror::Error;
use walkdir::WalkDir;

use super::extractor::TextExtractor;

#[derive(Error, Debug)]
pub enum FileRepositoryError {
    #[error("File error: {0}")]
    FileError(String),
    #[error("Extraction error: {0}")]
    ExtractionError(String),
}

pub type FileRepositoryResult<T> = Result<T, FileRepositoryError>;

/// File system repository implementation
pub struct FileSystemRepository {
    index: std::sync::Arc<tokio::sync::RwLock<Vec<LocalFile>>>,
    max_file_size: usize,
}

impl FileSystemRepository {
    /// Create a new file system repository
    pub fn new(max_file_size: usize) -> Self {
        Self {
            index: std::sync::Arc::new(tokio::sync::RwLock::new(Vec::new())),
            max_file_size,
        }
    }

    /// Check if a file should be indexed
    fn should_index_file(path: &Path) -> bool {
        TextExtractor::is_supported(path)
    }

    /// Get file metadata
    async fn get_file_metadata(path: &Path) -> FileRepositoryResult<LocalFile> {
        let metadata = std::fs::metadata(path)
            .map_err(|e| FileRepositoryError::FileError(e.to_string()))?;

        let file_type = path
            .extension()
            .and_then(|ext| ext.to_str())
            .unwrap_or("unknown")
            .to_lowercase();

        let modified_at = metadata
            .modified()
            .ok()
            .and_then(|time| {
                time.duration_since(std::time::UNIX_EPOCH)
                    .ok()
                    .and_then(|d| chrono::DateTime::<Utc>::from_timestamp(d.as_secs() as i64, 0))
            })
            .unwrap_or_else(Utc::now);

        Ok(LocalFile {
            path: path.to_string_lossy().to_string(),
            file_type,
            file_size: metadata.len(),
            modified_at,
            extracted_text: String::new(),
        })
    }
}

#[async_trait]
impl FileRepository for FileSystemRepository {
    async fn index_folder(&self, path: &str) -> Result<Vec<LocalFile>, String> {
        let folder_path = Path::new(path);

        if !folder_path.exists() {
            return Err(format!("Folder does not exist: {}", path));
        }

        let mut indexed_files = Vec::new();

        for entry in WalkDir::new(folder_path)
            .into_iter()
            .filter_map(|e| e.ok())
            .filter(|e| e.path().is_file())
        {
            let file_path = entry.path();

            // Skip files that shouldn't be indexed
            if !Self::should_index_file(file_path) {
                continue;
            }

            // Get metadata
            match Self::get_file_metadata(file_path).await {
                Ok(mut file) => {
                    // Extract text
                    if let Ok(text) = TextExtractor::extract(file_path, self.max_file_size) {
                        file.extracted_text = text;
                        indexed_files.push(file);
                    }
                }
                Err(e) => {
                    tracing::warn!("Failed to index {}: {}", file_path.display(), e);
                }
            }
        }

        Ok(indexed_files)
    }

    async fn save_file(&self, file: &LocalFile) -> Result<(), String> {
        let mut index = self.index.write().await;

        // Remove old entry if exists
        index.retain(|f| f.path != file.path);

        // Add new entry
        index.push(file.clone());

        Ok(())
    }

    async fn get_file(&self, path: &str) -> Result<Option<LocalFile>, String> {
        let index = self.index.read().await;
        Ok(index.iter().find(|f| f.path == path).cloned())
    }

    async fn delete_all(&self) -> Result<(), String> {
        let mut index = self.index.write().await;
        index.clear();
        Ok(())
    }

    async fn get_file_count(&self) -> Result<u64, String> {
        let index = self.index.read().await;
        Ok(index.len() as u64)
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use std::fs;
    use tempfile::TempDir;

    #[tokio::test]
    async fn test_index_folder() {
        let temp_dir = TempDir::new().unwrap();
        let repo = FileSystemRepository::new(200 * 1024);

        // Create test files
        fs::write(temp_dir.path().join("test1.txt"), "Hello World").unwrap();
        fs::write(temp_dir.path().join("test2.md"), "# Test").unwrap();
        fs::write(temp_dir.path().join("test.bin"), b"binary").unwrap(); // Should be skipped

        let result = repo.index_folder(temp_dir.path().to_str().unwrap()).await;
        assert!(result.is_ok());

        let files = result.unwrap();
        assert_eq!(files.len(), 2); // Only .txt and .md should be indexed
    }

    #[tokio::test]
    async fn test_save_file() {
        let repo = FileSystemRepository::new(200 * 1024);
        let file = LocalFile {
            path: "/tmp/test.txt".to_string(),
            file_type: "txt".to_string(),
            file_size: 100,
            modified_at: Utc::now(),
            extracted_text: "Test content".to_string(),
        };

        let result = repo.save_file(&file).await;
        assert!(result.is_ok());

        let count = repo.get_file_count().await.unwrap();
        assert_eq!(count, 1);
    }

    #[tokio::test]
    async fn test_get_file() {
        let repo = FileSystemRepository::new(200 * 1024);
        let file = LocalFile {
            path: "/tmp/test.txt".to_string(),
            file_type: "txt".to_string(),
            file_size: 100,
            modified_at: Utc::now(),
            extracted_text: "Test content".to_string(),
        };

        repo.save_file(&file).await.unwrap();

        let retrieved = repo.get_file("/tmp/test.txt").await.unwrap();
        assert!(retrieved.is_some());
        assert_eq!(retrieved.unwrap().path, "/tmp/test.txt");
    }

    #[tokio::test]
    async fn test_delete_all() {
        let repo = FileSystemRepository::new(200 * 1024);
        let file = LocalFile::default();

        repo.save_file(&file).await.unwrap();
        assert_eq!(repo.get_file_count().await.unwrap(), 1);

        repo.delete_all().await.unwrap();
        assert_eq!(repo.get_file_count().await.unwrap(), 0);
    }
}
