// Gmail repository implementation using Gmail API client

use crate::domain::{GmailMessage, ports::GmailRepository};
use async_trait::async_trait;
use base64::engine::general_purpose;
use base64::Engine;
use sqlx::SqlitePool;
use crate::infrastructure::gmail::gmail_api_client::GmailApiClient;
use chrono::Utc;

/// Gmail repository implementation combining API and database
pub struct SqliteGmailRepository {
    api_client: GmailApiClient,
    pool: SqlitePool,
}

impl SqliteGmailRepository {
    /// Create a new Gmail repository
    pub fn new(access_token: String, pool: SqlitePool) -> Self {
        Self {
            api_client: GmailApiClient::new(&access_token),
            pool,
        }
    }

    /// Convert API message to domain entity
    fn convert_message(&self, api_msg: crate::infrastructure::gmail::gmail_api_client::GmailFullMessage) -> GmailMessage {
        let mut subject = String::new();
        let mut from = String::new();
        let mut to = String::new();
        let mut cc = String::new();
        let mut body_text = String::new();

        if let Some(payload) = &api_msg.payload {
            for header in &payload.headers {
                match header.name.to_lowercase().as_str() {
                    "subject" => subject = header.value.clone(),
                    "from" => from = header.value.clone(),
                    "to" => to = header.value.clone(),
                    "cc" => cc = header.value.clone(),
                    _ => {}
                }
            }

            // Extract body text from payload
            if let Some(body) = &payload.body {
                if let Some(data) = &body.data {
                    if let Ok(decoded) = general_purpose::STANDARD.decode(data) {
                        body_text = String::from_utf8_lossy(&decoded).to_string();
                    }
                }
            }
        }

        GmailMessage {
            message_id: api_msg.id,
            thread_id: api_msg.threadId,
            subject,
            from,
            to,
            cc,
            body_text,
            date: Utc::now(),
            labels: api_msg.labelIds.unwrap_or_default(),
        }
    }
}

#[async_trait]
impl GmailRepository for SqliteGmailRepository {
    async fn fetch_messages(&self, query: &str) -> Result<Vec<GmailMessage>, String> {
        let message_list = self
            .api_client
            .fetch_messages(query, None)
            .await
            .map_err(|e| e.to_string())?;

        let mut messages = Vec::new();

        if let Some(msg_refs) = message_list.messages {
            for msg_ref in msg_refs.iter().take(10) {
                if let Ok(full_msg) = self.api_client.get_message(&msg_ref.id).await {
                    messages.push(self.convert_message(full_msg));
                }
            }
        }

        Ok(messages)
    }

    async fn save_message(&self, msg: &GmailMessage) -> Result<(), String> {
        sqlx::query(
            r#"
            INSERT INTO gmail_messages
            (message_id, thread_id, subject, from_email, to_email, cc_email, body_text, date, labels)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
            ON CONFLICT(message_id) DO UPDATE SET
                subject = excluded.subject,
                body_text = excluded.body_text,
                labels = excluded.labels
            "#,
        )
        .bind(&msg.message_id)
        .bind(&msg.thread_id)
        .bind(&msg.subject)
        .bind(&msg.from)
        .bind(&msg.to)
        .bind(&msg.cc)
        .bind(&msg.body_text)
        .bind(msg.date.to_rfc3339())
        .bind(msg.labels.join(","))
        .execute(&self.pool)
        .await
        .map_err(|e| format!("Failed to save message: {}", e))?;

        Ok(())
    }

    async fn get_message(&self, id: &str) -> Result<Option<GmailMessage>, String> {
        let result = sqlx::query_as::<_, (String, String, String, String, String, String, String, String, Option<String>)>(
            "SELECT message_id, thread_id, subject, from_email, to_email, cc_email, body_text, date, labels FROM gmail_messages WHERE message_id = ?"
        )
        .bind(id)
        .fetch_optional(&self.pool)
        .await
        .map_err(|e| format!("Failed to get message: {}", e))?;

        Ok(result.map(|(message_id, thread_id, subject, from, to, cc, body_text, date, labels)| {
            GmailMessage {
                message_id,
                thread_id,
                subject,
                from,
                to,
                cc,
                body_text,
                date: chrono::DateTime::parse_from_rfc3339(&date)
                    .ok()
                    .map(|dt| dt.with_timezone(&Utc))
                    .unwrap_or_else(Utc::now),
                labels: labels.map(|l| l.split(',').map(|s| s.to_string()).collect()).unwrap_or_default(),
            }
        }))
    }

    async fn delete_all(&self) -> Result<(), String> {
        sqlx::query("DELETE FROM gmail_messages")
            .execute(&self.pool)
            .await
            .map_err(|e| format!("Failed to delete all messages: {}", e))?;

        Ok(())
    }

    async fn get_message_count(&self) -> Result<u64, String> {
        let count: (i64,) = sqlx::query_as("SELECT COUNT(*) FROM gmail_messages")
            .fetch_one(&self.pool)
            .await
            .map_err(|e| format!("Failed to count messages: {}", e))?;

        Ok(count.0 as u64)
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[tokio::test]
    async fn test_repository_creation() {
        let pool = SqlitePool::connect("sqlite::memory:")
            .await
            .expect("Failed to create test pool");

        let _repo = SqliteGmailRepository::new("test_token".to_string(), pool);
    }

    #[tokio::test]
    async fn test_get_message_count() {
        let pool = SqlitePool::connect("sqlite::memory:")
            .await
            .expect("Failed to create test pool");

        // Create table
        sqlx::query(
            r#"
            CREATE TABLE gmail_messages (
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
        .execute(&pool)
        .await
        .ok();

        let repo = SqliteGmailRepository::new("test_token".to_string(), pool);

        let count = repo.get_message_count().await.unwrap();
        assert_eq!(count, 0);
    }

    #[tokio::test]
    async fn test_save_and_get_message() {
        let pool = SqlitePool::connect("sqlite::memory:")
            .await
            .expect("Failed to create test pool");

        // Create table
        sqlx::query(
            r#"
            CREATE TABLE gmail_messages (
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
        .execute(&pool)
        .await
        .ok();

        let repo = SqliteGmailRepository::new("test_token".to_string(), pool);

        let msg = GmailMessage {
            message_id: "msg_123".to_string(),
            thread_id: "thread_456".to_string(),
            subject: "Test".to_string(),
            from: "test@example.com".to_string(),
            to: "user@example.com".to_string(),
            cc: String::new(),
            body_text: "Test body".to_string(),
            date: Utc::now(),
            labels: vec!["INBOX".to_string()],
        };

        assert!(repo.save_message(&msg).await.is_ok());

        let retrieved = repo.get_message("msg_123").await.unwrap();
        assert!(retrieved.is_some());
        assert_eq!(retrieved.unwrap().subject, "Test");
    }
}
