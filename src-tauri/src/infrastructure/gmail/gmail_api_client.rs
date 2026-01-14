// Gmail API client for fetching messages and labels

use reqwest::Client;
use serde::{Deserialize, Serialize};
use thiserror::Error;

#[derive(Error, Debug)]
pub enum GmailApiError {
    #[error("API request failed: {0}")]
    RequestFailed(String),
    #[error("Invalid response: {0}")]
    InvalidResponse(String),
    #[error("Authentication failed: {0}")]
    AuthenticationFailed(String),
}

pub type GmailApiResult<T> = Result<T, GmailApiError>;

/// Gmail message metadata from API
#[derive(Clone, Debug, Serialize, Deserialize)]
pub struct GmailMessageData {
    pub id: String,
    pub threadId: String,
    pub labelIds: Option<Vec<String>>,
}

/// Gmail message headers
#[derive(Clone, Debug, Serialize, Deserialize)]
pub struct MessageHeader {
    pub name: String,
    pub value: String,
}

/// Gmail message payload
#[derive(Clone, Debug, Serialize, Deserialize)]
pub struct MessagePayload {
    pub headers: Vec<MessageHeader>,
    pub body: Option<MessageBody>,
    pub parts: Option<Vec<MessagePayload>>,
}

/// Gmail message body
#[derive(Clone, Debug, Serialize, Deserialize)]
pub struct MessageBody {
    pub data: Option<String>,
    pub size: Option<u64>,
}

/// Full Gmail message with headers
#[derive(Clone, Debug, Serialize, Deserialize)]
pub struct GmailFullMessage {
    pub id: String,
    pub threadId: String,
    pub labelIds: Option<Vec<String>>,
    pub payload: Option<MessagePayload>,
    pub raw: Option<String>,
}

/// Gmail API response for message list
#[derive(Clone, Debug, Serialize, Deserialize)]
pub struct GmailMessageList {
    pub messages: Option<Vec<GmailMessageData>>,
    pub nextPageToken: Option<String>,
    pub resultSizeEstimate: Option<u64>,
}

/// Gmail label data
#[derive(Clone, Debug, Serialize, Deserialize)]
pub struct GmailLabel {
    pub id: String,
    pub name: String,
    #[serde(rename = "type")]
    pub label_type: String,
}

/// Gmail labels response
#[derive(Clone, Debug, Serialize, Deserialize)]
pub struct GmailLabelList {
    pub labels: Vec<GmailLabel>,
}

/// Gmail API client
pub struct GmailApiClient {
    http_client: Client,
    access_token: String,
}

impl GmailApiClient {
    /// Create a new Gmail API client
    pub fn new(access_token: &str) -> Self {
        Self {
            http_client: Client::new(),
            access_token: access_token.to_string(),
        }
    }

    /// Fetch messages from Gmail
    pub async fn fetch_messages(&self, query: &str, page_token: Option<&str>) -> GmailApiResult<GmailMessageList> {
        let mut url = "https://www.googleapis.com/gmail/v1/users/me/messages".to_string();
        let mut params = vec![format!("q={}", urlencoding::encode(query))];

        if let Some(token) = page_token {
            params.push(format!("pageToken={}", token));
        }

        params.push("maxResults=10".to_string());

        if !params.is_empty() {
            url.push('?');
            url.push_str(&params.join("&"));
        }

        let response = self
            .http_client
            .get(&url)
            .bearer_auth(&self.access_token)
            .send()
            .await
            .map_err(|e| GmailApiError::RequestFailed(e.to_string()))?;

        if !response.status().is_success() {
            return Err(GmailApiError::AuthenticationFailed(
                format!("API returned status: {}", response.status()),
            ));
        }

        let messages = response
            .json::<GmailMessageList>()
            .await
            .map_err(|e| GmailApiError::InvalidResponse(e.to_string()))?;

        Ok(messages)
    }

    /// Fetch a single message by ID
    pub async fn get_message(&self, message_id: &str) -> GmailApiResult<GmailFullMessage> {
        let url = format!(
            "https://www.googleapis.com/gmail/v1/users/me/messages/{}?format=full",
            message_id
        );

        let response = self
            .http_client
            .get(&url)
            .bearer_auth(&self.access_token)
            .send()
            .await
            .map_err(|e| GmailApiError::RequestFailed(e.to_string()))?;

        if !response.status().is_success() {
            return Err(GmailApiError::AuthenticationFailed(
                format!("API returned status: {}", response.status()),
            ));
        }

        let message = response
            .json::<GmailFullMessage>()
            .await
            .map_err(|e| GmailApiError::InvalidResponse(e.to_string()))?;

        Ok(message)
    }

    /// Fetch all labels
    pub async fn get_labels(&self) -> GmailApiResult<GmailLabelList> {
        let url = "https://www.googleapis.com/gmail/v1/users/me/labels";

        let response = self
            .http_client
            .get(url)
            .bearer_auth(&self.access_token)
            .send()
            .await
            .map_err(|e| GmailApiError::RequestFailed(e.to_string()))?;

        if !response.status().is_success() {
            return Err(GmailApiError::AuthenticationFailed(
                format!("API returned status: {}", response.status()),
            ));
        }

        let labels = response
            .json::<GmailLabelList>()
            .await
            .map_err(|e| GmailApiError::InvalidResponse(e.to_string()))?;

        Ok(labels)
    }

    /// Get user profile
    pub async fn get_profile(&self) -> GmailApiResult<serde_json::Value> {
        let url = "https://www.googleapis.com/gmail/v1/users/me/profile";

        let response = self
            .http_client
            .get(url)
            .bearer_auth(&self.access_token)
            .send()
            .await
            .map_err(|e| GmailApiError::RequestFailed(e.to_string()))?;

        if !response.status().is_success() {
            return Err(GmailApiError::AuthenticationFailed(
                format!("API returned status: {}", response.status()),
            ));
        }

        let profile = response
            .json::<serde_json::Value>()
            .await
            .map_err(|e| GmailApiError::InvalidResponse(e.to_string()))?;

        Ok(profile)
    }
}

/// Extract text from message headers
pub fn extract_header(headers: &[MessageHeader], name: &str) -> Option<String> {
    headers
        .iter()
        .find(|h| h.name.eq_ignore_ascii_case(name))
        .map(|h| h.value.clone())
}

/// Decode base64url encoded data
pub fn decode_base64url(data: &str) -> GmailApiResult<Vec<u8>> {
    use base64::{engine::general_purpose, Engine};

    general_purpose::URL_SAFE_NO_PAD
        .decode(data)
        .map_err(|e| GmailApiError::InvalidResponse(e.to_string()))
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_create_client() {
        let client = GmailApiClient::new("test_token");
        assert_eq!(client.access_token, "test_token");
    }

    #[test]
    fn test_extract_header() {
        let headers = vec![
            MessageHeader {
                name: "Subject".to_string(),
                value: "Test Email".to_string(),
            },
            MessageHeader {
                name: "From".to_string(),
                value: "test@example.com".to_string(),
            },
        ];

        assert_eq!(
            extract_header(&headers, "Subject"),
            Some("Test Email".to_string())
        );
        assert_eq!(
            extract_header(&headers, "From"),
            Some("test@example.com".to_string())
        );
    }

    #[test]
    fn test_decode_base64url() {
        // "Hello" encoded in base64url
        let encoded = "SGVsbG8";
        let decoded = decode_base64url(encoded).unwrap();
        assert_eq!(String::from_utf8(decoded).unwrap(), "Hello");
    }
}
