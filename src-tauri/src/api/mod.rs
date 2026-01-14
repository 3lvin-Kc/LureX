// Tauri API commands - entry points for frontend to backend communication
// Phase 4 Implementation: Wire all use cases to Tauri commands

use crate::application::dto::*;
use crate::application::use_cases::index_files::{IndexFilesRequest, IndexFilesResponse};
use crate::application::use_cases::index_gmail::IndexGmailRequest;
use crate::application::use_cases::get_status::AppStatus;
use crate::application::use_cases::delete_index::DeleteIndexResponse;
use std::sync::Arc;

/// State wrapper for AppContainer
pub struct AppState {
    pub container: Arc<crate::application::AppContainer>,
}

// ============= Search Commands =============

/// Search command - unified search across all sources
#[tauri::command]
pub async fn search_command(
    query: String,
    state: tauri::State<'_, crate::application::AppContainer>,
) -> Result<Vec<SearchResultDTO>, String> {
    tracing::info!("Search command: {}", query);

    // Validate query
    if query.is_empty() {
        return Ok(vec![]);
    }

    if query.len() > 500 {
        return Err("Query exceeds maximum length of 500 characters".to_string());
    }

    // Execute search use case
    let filters = crate::domain::ports::SearchFilters::default();
    match state.search_use_case.execute(&query, filters).await {
        Ok(results) => {
            tracing::info!("Search returned {} results", results.len());
            let dtos: Vec<SearchResultDTO> = results.into_iter().map(|r| SearchResultDTO {
                id: r.id,
                source_type: r.source_type,
                title: r.title,
                snippet: r.snippet,
                created_at: r.created_at,
                metadata: r.metadata,
            }).collect();
            Ok(dtos)
        }
        Err(e) => {
            tracing::error!("Search failed: {}", e);
            Err(format!("Search failed: {}", e))
        }
    }
}

// ============= Gmail Commands =============

/// Connect Gmail account via OAuth
#[tauri::command]
pub async fn connect_gmail_command(
    state: tauri::State<'_, crate::application::AppContainer>,
) -> Result<ConnectGmailResponse, String> {
    tracing::info!("Connect Gmail command");

    // Execute Gmail connection use case
    match state.connect_gmail_use_case.execute().await {
        Ok(response) => {
            tracing::info!("Gmail connection initiated");
            Ok(ConnectGmailResponse {
                oauth_url: response.oauth_url,
                message: response.message,
            })
        }
        Err(e) => {
            tracing::error!("Gmail connection failed: {}", e);
            Err(format!("Failed to connect to Gmail: {}", e))
        }
    }
}

/// Disconnect from Gmail
#[tauri::command]
pub async fn disconnect_gmail_command(
    state: tauri::State<'_, crate::application::AppContainer>,
) -> Result<DisconnectGmailResponse, String> {
    tracing::info!("Disconnect Gmail command");

    // Execute disconnect use case
    match state.disconnect_gmail_use_case.execute().await {
        Ok(response) => {
            tracing::info!("Gmail disconnected successfully");
            let dto = DisconnectGmailResponse {
                success: response.success,
                message: response.message,
            };
            Ok(dto)
        }
        Err(e) => {
            tracing::error!("Gmail disconnect failed: {}", e);
            Err(format!("Failed to disconnect Gmail: {}", e))
        }
    }
}

/// Sync Gmail messages
#[tauri::command]
pub async fn sync_gmail_command(
    state: tauri::State<'_, crate::application::AppContainer>,
) -> Result<IndexGmailResponse, String> {
    tracing::info!("Sync Gmail command");

    // Execute Gmail index use case
    let request = IndexGmailRequest {
        query: None,
        max_results: 100,
    };
    match state.index_gmail_use_case.execute(request).await {
        Ok(response) => {
            tracing::info!("Gmail sync completed: {} messages synced", response.indexed_count);
            Ok(IndexGmailResponse {
                success: response.success,
                synced_count: response.indexed_count,
                total_messages: response.total_messages,
                message: response.message,
            })
        }
        Err(e) => {
            tracing::error!("Gmail sync failed: {}", e);
            Err(format!("Failed to sync Gmail: {}", e))
        }
    }
}

// ============= File Indexing Commands =============

/// Index local files from specified folders
#[tauri::command]
pub async fn index_files_command(
    folders: Vec<String>,
    state: tauri::State<'_, crate::application::AppContainer>,
) -> Result<IndexFilesResponse, String> {
    tracing::info!("Index files command for {} folders", folders.len());

    // Validate folders
    if folders.is_empty() {
        return Err("No folders specified for indexing".to_string());
    }

    // Execute index files use case
    let request = IndexFilesRequest { folders };
    match state.index_files_use_case.execute(request).await {
        Ok(response) => {
            tracing::info!("Files indexed successfully: {}", response.indexed_count);
            Ok(response)
        }
        Err(e) => {
            tracing::error!("File indexing failed: {}", e);
            Err(format!("Failed to index files: {}", e))
        }
    }
}

// ============= Index Management Commands =============

/// Get application status and statistics
#[tauri::command]
pub async fn get_status_command(
    state: tauri::State<'_, crate::application::AppContainer>,
) -> Result<AppStatus, String> {
    tracing::info!("Get status command");

    // Execute get status use case
    match state.get_status_use_case.execute().await {
        Ok(status) => {
            tracing::info!("Status retrieved: {} total indexed items", status.total_indexed);
            Ok(status)
        }
        Err(e) => {
            tracing::error!("Failed to get status: {}", e);
            Err(format!("Failed to retrieve status: {}", e))
        }
    }
}

/// Delete all indexed data (dangerous operation)
#[tauri::command]
pub async fn delete_index_command(
    state: tauri::State<'_, crate::application::AppContainer>,
) -> Result<DeleteIndexResponse, String> {
    tracing::warn!("Delete index command - all data will be deleted");

    // Execute delete index use case
    match state.delete_index_use_case.execute().await {
        Ok(response) => {
            tracing::warn!("Index deleted successfully");
            Ok(response)
        }
        Err(e) => {
            tracing::error!("Index deletion failed: {}", e);
            Err(format!("Failed to delete index: {}", e))
        }
    }
}

// ============= Health Check Command =============

/// Health check endpoint to verify backend is running
#[tauri::command]
pub fn health_check() -> Result<serde_json::Value, String> {
    tracing::debug!("Health check");

    Ok(serde_json::json!({
        "status": "healthy",
        "version": env!("CARGO_PKG_VERSION"),
        "timestamp": chrono::Utc::now().to_rfc3339(),
    }))
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_health_check() {
        let result = health_check();
        assert!(result.is_ok());

        let value = result.unwrap();
        assert_eq!(value["status"], "healthy");
    }
}
