// Data Transfer Objects (DTOs) for API responses

use serde::{Deserialize, Serialize};

/// Search result DTO for API responses
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct SearchResultDTO {
    pub id: String,
    pub source_type: String,
    pub title: String,
    pub snippet: String,
    pub created_at: String,
    pub metadata: serde_json::Value,
}

/// Gmail connection OAuth response
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ConnectGmailResponse {
    pub oauth_url: String,
    pub message: String,
}

/// Index Gmail response
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct IndexGmailResponse {
    pub success: bool,
    pub synced_count: u64,
    pub total_messages: u64,
    pub message: String,
}

/// Index files response
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct IndexFilesResponse {
    pub success: bool,
    pub indexed_count: u64,
    pub total_files: u64,
    pub message: String,
}

/// Disconnect Gmail response
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct DisconnectGmailResponse {
    pub success: bool,
    pub message: String,
}

/// Delete index response
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct DeleteIndexResponse {
    pub success: bool,
    pub message: String,
}

/// Application status response
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct AppStatusDTO {
    pub gmail_connected: bool,
    pub gmail_message_count: u64,
    pub gmail_last_sync: Option<String>,
    pub gmail_last_error: Option<String>,
    pub file_count: u64,
    pub file_last_sync: Option<String>,
    pub file_last_error: Option<String>,
    pub total_indexed: u64,
    pub database_size_mb: f64,
}

/// Sync status for frontend
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct SyncStatusDTO {
    pub is_syncing: bool,
    pub progress_percent: u32,
    pub current_operation: String,
    pub last_error: Option<String>,
}

/// Generic API response wrapper
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ApiResponse<T: Serialize> {
    pub success: bool,
    pub data: Option<T>,
    pub error: Option<String>,
}

impl<T: Serialize> ApiResponse<T> {
    pub fn ok(data: T) -> Self {
        Self {
            success: true,
            data: Some(data),
            error: None,
        }
    }

    pub fn error(message: String) -> Self
    where
        T: Default,
    {
        Self {
            success: false,
            data: None,
            error: Some(message),
        }
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_search_result_dto_serialization() {
        let dto = SearchResultDTO {
            id: "test_id".to_string(),
            source_type: "gmail".to_string(),
            title: "Test Title".to_string(),
            snippet: "Test snippet...".to_string(),
            created_at: "2024-01-01T00:00:00Z".to_string(),
            metadata: serde_json::json!({}),
        };

        let json = serde_json::to_string(&dto).unwrap();
        let deserialized: SearchResultDTO = serde_json::from_str(&json).unwrap();

        assert_eq!(deserialized.id, "test_id");
        assert_eq!(deserialized.source_type, "gmail");
    }

    #[test]
    fn test_app_status_dto_serialization() {
        let dto = AppStatusDTO {
            gmail_connected: true,
            gmail_message_count: 10,
            gmail_last_sync: Some("2024-01-01T00:00:00Z".to_string()),
            gmail_last_error: None,
            file_count: 5,
            file_last_sync: None,
            file_last_error: None,
            total_indexed: 15,
            database_size_mb: 1.5,
        };

        let json = serde_json::to_string(&dto).unwrap();
        let deserialized: AppStatusDTO = serde_json::from_str(&json).unwrap();

        assert_eq!(deserialized.gmail_message_count, 10);
        assert!(deserialized.gmail_connected);
    }

    #[test]
    fn test_api_response_ok() {
        let response: ApiResponse<String> = ApiResponse::ok("Success".to_string());

        assert!(response.success);
        assert_eq!(response.data, Some("Success".to_string()));
        assert_eq!(response.error, None);
    }

    #[test]
    fn test_api_response_error() {
        let response: ApiResponse<String> = ApiResponse::error("Error occurred".to_string());

        assert!(!response.success);
        assert_eq!(response.data, None);
        assert_eq!(response.error, Some("Error occurred".to_string()));
    }
}
