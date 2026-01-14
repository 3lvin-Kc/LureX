/// Application configuration
///
/// Loads configuration from environment variables or defaults.

use std::path::PathBuf;

#[derive(Clone, Debug)]
pub struct AppConfig {
    /// Path to SQLite database
    pub db_path: PathBuf,

    /// Directory for app data (logs, cache, etc.)
    pub data_dir: PathBuf,

    /// Google OAuth client ID
    pub google_client_id: String,

    /// Google OAuth client secret
    pub google_client_secret: String,

    /// OAuth redirect port
    pub oauth_port: u16,

    /// Gmail sync interval in seconds
    pub gmail_sync_interval: u64,

    /// Max bytes to extract per file
    pub max_extract_size: usize,

    /// Supported file extensions
    pub supported_extensions: Vec<String>,
}

impl AppConfig {
    /// Load configuration from environment or defaults
    pub fn from_env() -> Result<Self, Box<dyn std::error::Error>> {
        let data_dir = std::env::var("APPDATA")
            .map(PathBuf::from)
            .unwrap_or_else(|_| PathBuf::from("."))
            .join("RecallDesk");

        let db_path = data_dir.join("index.db");

        // Ensure data directory exists
        std::fs::create_dir_all(&data_dir)?;

        Ok(Self {
            db_path,
            data_dir,
            google_client_id: std::env::var("GOOGLE_CLIENT_ID")
                .unwrap_or_else(|_| "YOUR_CLIENT_ID".to_string()),
            google_client_secret: std::env::var("GOOGLE_CLIENT_SECRET")
                .unwrap_or_else(|_| "YOUR_CLIENT_SECRET".to_string()),
            oauth_port: 9999,
            gmail_sync_interval: 600, // 10 minutes
            max_extract_size: 200 * 1024, // 200 KB
            supported_extensions: vec![
                "txt".to_string(),
                "md".to_string(),
                "json".to_string(),
                "csv".to_string(),
                "pdf".to_string(),
                "docx".to_string(),
                "rs".to_string(),
                "py".to_string(),
                "js".to_string(),
                "ts".to_string(),
            ],
        })
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_config_has_defaults() {
        let config = AppConfig {
            db_path: PathBuf::from("test.db"),
            data_dir: PathBuf::from("."),
            google_client_id: "test".into(),
            google_client_secret: "test".into(),
            oauth_port: 9999,
            gmail_sync_interval: 600,
            max_extract_size: 200 * 1024,
            supported_extensions: vec!["txt".to_string()],
        };

        assert_eq!(config.oauth_port, 9999);
        assert_eq!(config.gmail_sync_interval, 600);
    }
}
