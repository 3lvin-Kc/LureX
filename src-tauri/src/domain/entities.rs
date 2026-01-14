// Domain entities - core business objects

use chrono::{DateTime, Utc};
use serde::{Deserialize, Serialize};

/// GmailMessage represents an email message from Gmail
#[derive(Clone, Debug, Serialize, Deserialize)]
pub struct GmailMessage {
    pub message_id: String,
    pub thread_id: String,
    pub subject: String,
    pub from: String,
    pub to: String,
    pub cc: String,
    pub body_text: String,
    pub date: DateTime<Utc>,
    pub labels: Vec<String>,
}

impl Default for GmailMessage {
    fn default() -> Self {
        Self {
            message_id: String::new(),
            thread_id: String::new(),
            subject: String::new(),
            from: String::new(),
            to: String::new(),
            cc: String::new(),
            body_text: String::new(),
            date: Utc::now(),
            labels: vec![],
        }
    }
}

/// LocalFile represents an indexed file on the filesystem
#[derive(Clone, Debug, Serialize, Deserialize)]
pub struct LocalFile {
    pub path: String,
    pub file_type: String,
    pub file_size: u64,
    pub modified_at: DateTime<Utc>,
    pub extracted_text: String,
}

impl Default for LocalFile {
    fn default() -> Self {
        Self {
            path: String::new(),
            file_type: String::new(),
            file_size: 0,
            modified_at: Utc::now(),
            extracted_text: String::new(),
        }
    }
}

/// SearchResult represents a unified search result from any source
#[derive(Clone, Debug, Serialize, Deserialize)]
pub struct SearchResult {
    pub id: String,
    pub source_type: String,  // "gmail" or "file"
    pub title: String,
    pub snippet: String,
    pub body_text: String,
    pub created_at: DateTime<Utc>,
    pub rank_score: f32,
    pub metadata: serde_json::Value,
}

impl Default for SearchResult {
    fn default() -> Self {
        Self {
            id: String::new(),
            source_type: String::new(),
            title: String::new(),
            snippet: String::new(),
            body_text: String::new(),
            created_at: Utc::now(),
            rank_score: 0.0,
            metadata: serde_json::json!({}),
        }
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_gmail_message_creation() {
        let msg = GmailMessage {
            subject: "Test".to_string(),
            ..Default::default()
        };
        assert_eq!(msg.subject, "Test");
    }

    #[test]
    fn test_search_result_creation() {
        let result = SearchResult {
            title: "Test Result".to_string(),
            source_type: "gmail".to_string(),
            ..Default::default()
        };
        assert_eq!(result.title, "Test Result");
        assert_eq!(result.source_type, "gmail");
    }
}
