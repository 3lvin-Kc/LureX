# Application Layer

## Purpose

The application layer orchestrates domain logic to implement use cases. It:

- **Coordinates** between domain and infrastructure
- **Implements** business workflows (use cases)
- **Manages** dependencies (dependency injection)
- **Converts** between domain entities and DTOs
- **Handles** application-level errors

## Key Principle

**Application depends on domain and infrastructure interfaces, never on concrete implementations.**

Use cases receive dependencies via constructor injection. This makes them testable and allows swapping implementations.

## Structure

```
application/
├── README.md                    # This file
├── use_cases/                   # Business workflows
│   ├── mod.rs
│   ├── search.rs               # SearchUseCase
│   ├── connect_gmail.rs        # ConnectGmailUseCase
│   ├── index_gmail.rs          # IndexGmailUseCase
│   ├── index_files.rs          # IndexFilesUseCase
│   ├── sync_gmail.rs           # SyncGmailUseCase
│   ├── disconnect_gmail.rs     # DisconnectGmailUseCase
│   ├── delete_index.rs         # DeleteIndexUseCase
│   ├── get_sync_status.rs      # GetSyncStatusUseCase
│   └── select_folders.rs       # SelectFoldersUseCase
├── dto/                         # Data Transfer Objects
│   ├── mod.rs
│   ├── search_result.rs        # SearchResultDTO
│   ├── gmail.rs                # GmailDTOs
│   ├── file.rs                 # FileDTOs
│   └── sync.rs                 # SyncStatusDTO
├── services/                    # Application services
│   ├── mod.rs
│   └── container.rs            # Dependency container
└── errors.rs                    # ApplicationError enum
```

## Use Cases

Each use case implements a single business workflow:

### SearchUseCase

Executes a search query against the local index.

```rust
pub struct SearchUseCase {
    search_repo: Arc<dyn SearchRepository>,
    ranker: SearchRanker,
}

impl SearchUseCase {
    pub fn new(search_repo: Arc<dyn SearchRepository>) -> Self {
        Self {
            search_repo,
            ranker: SearchRanker::new(),
        }
    }

    /// Execute a search query with optional filters.
    ///
    /// # Arguments
    /// * `query` - Search string (empty returns recent items)
    /// * `filters` - Time range, source type, labels
    ///
    /// # Returns
    /// Vec of ranked search results (newest/most relevant first)
    pub async fn execute(&self, query: &str, filters: SearchFilters) -> Result<Vec<SearchResultDTO>> {
        // 1. Validate input
        if query.len() > 500 {
            return Err(ApplicationError::ValidationError("Query too long".into()));
        }

        // 2. Query repository
        let results = self.search_repo.search(query, &filters).await?;

        // 3. Rank results (pure domain logic)
        let ranked = self.ranker.rank(results);

        // 4. Convert to DTOs
        let dtos = ranked.into_iter().map(|r| r.into()).collect();
        Ok(dtos)
    }
}
```

### ConnectGmailUseCase

OAuth flow to connect Gmail account.

```rust
pub struct ConnectGmailUseCase {
    oauth_client: Arc<dyn GoogleOAuthClient>,
    token_store: Arc<dyn TokenStore>,
}

pub async fn start_oauth(&self) -> Result<String> {
    // 1. Generate authorization URL
    let auth_url = self.oauth_client.get_authorization_url().await?;
    Ok(auth_url)
}

pub async fn complete_oauth(&self, code: &str) -> Result<()> {
    // 1. Exchange code for token
    let token = self.oauth_client.exchange_code_for_token(code).await?;

    // 2. Save to secure storage
    self.token_store.save_access_token(&token).await?;

    Ok(())
}
```

### IndexGmailUseCase

Fetch and index emails from Gmail.

```rust
pub struct IndexGmailUseCase {
    gmail_repo: Arc<dyn GmailRepository>,
    search_repo: Arc<dyn SearchRepository>,
}

pub async fn execute(&self, query: &str) -> Result<IndexProgressDTO> {
    // 1. Fetch messages from Gmail
    let messages = self.gmail_repo.fetch_messages(query).await?;

    // 2. Convert to search items
    let items: Vec<SearchResult> = messages.into_iter().map(|m| m.into()).collect();

    // 3. Index in database
    for item in items {
        self.search_repo.index_item(&item).await?;
    }

    Ok(IndexProgressDTO {
        indexed_count: items.len(),
        elapsed_ms: 0,
    })
}
```

### More Use Cases

- **SyncGmailUseCase**: Incremental Gmail sync (10 min interval)
- **IndexFilesUseCase**: Scan selected folders and index files
- **SelectFoldersUseCase**: Save folder selections to database
- **DisconnectGmailUseCase**: Revoke tokens and delete Gmail data
- **DeleteIndexUseCase**: Wipe entire search index
- **GetSyncStatusUseCase**: Return indexing progress/status

## DTOs (Data Transfer Objects)

DTOs are simple data containers for API boundaries. They're NOT domain entities—they're what flows across the Tauri boundary.

### SearchResultDTO

```rust
#[derive(Serialize, Deserialize, Debug, Clone)]
pub struct SearchResultDTO {
    pub id: String,
    pub source_type: String,  // "gmail" or "file"
    pub title: String,
    pub snippet: String,
    pub created_at: String,   // ISO 8601
    pub source_metadata: serde_json::Value,  // source-specific data
}

impl From<SearchResult> for SearchResultDTO {
    fn from(result: SearchResult) -> Self {
        Self {
            id: result.id,
            source_type: result.source_type,
            title: result.title,
            snippet: result.snippet,
            created_at: result.created_at.to_rfc3339(),
            source_metadata: serde_json::to_value(&result.metadata).unwrap_or_default(),
        }
    }
}
```

### GmailMessageDTO

```rust
#[derive(Serialize, Deserialize, Debug)]
pub struct GmailMessageDTO {
    pub message_id: String,
    pub thread_id: String,
    pub subject: String,
    pub from: String,
    pub to: String,
    pub cc: String,
    pub date: String,  // ISO 8601
    pub labels: Vec<String>,
}
```

### FileDTO

```rust
#[derive(Serialize, Deserialize, Debug)]
pub struct FileDTO {
    pub path: String,
    pub file_type: String,
    pub modified_at: String,
    pub file_size: u64,
}
```

### SyncStatusDTO

```rust
#[derive(Serialize, Deserialize, Debug)]
pub struct SyncStatusDTO {
    pub source: String,
    pub last_sync: Option<String>,
    pub item_count: u64,
    pub is_syncing: bool,
    pub last_error: Option<String>,
}
```

## Application Errors

```rust
#[derive(Debug, thiserror::Error)]
pub enum ApplicationError {
    #[error("Validation error: {0}")]
    ValidationError(String),

    #[error("Not found: {0}")]
    NotFound(String),

    #[error("Repository error: {0}")]
    RepositoryError(String),

    #[error("External service error: {0}")]
    ExternalServiceError(String),

    #[error("Internal error: {0}")]
    InternalError(String),
}

pub type Result<T> = std::result::Result<T, ApplicationError>;

// Convert from domain errors
impl From<DomainError> for ApplicationError {
    fn from(err: DomainError) -> Self {
        match err {
            DomainError::NotFound(msg) => ApplicationError::NotFound(msg),
            DomainError::ValidationError(msg) => ApplicationError::ValidationError(msg),
            _ => ApplicationError::InternalError(err.to_string()),
        }
    }
}
```

## Dependency Container

The container is responsible for wiring up all dependencies:

```rust
pub struct AppContainer {
    search_repo: Arc<dyn SearchRepository>,
    gmail_repo: Arc<dyn GmailRepository>,
    file_repo: Arc<dyn FileRepository>,
    token_store: Arc<dyn TokenStore>,
}

impl AppContainer {
    pub async fn new(config: &AppConfig) -> Result<Self> {
        // Initialize infrastructure components
        let db = SqliteConnection::open(&config.db_path).await?;
        let search_repo = Arc::new(SqliteSearchEngine::new(db.clone()));
        let gmail_repo = Arc::new(SqliteGmailRepository::new(db.clone()));
        let file_repo = Arc::new(SqliteFileRepository::new(db));
        let token_store = Arc::new(OsTokenStore::new());

        Ok(Self {
            search_repo,
            gmail_repo,
            file_repo,
            token_store,
        })
    }

    // Factory methods for use cases
    pub fn search_use_case(&self) -> SearchUseCase {
        SearchUseCase::new(self.search_repo.clone())
    }

    pub fn index_gmail_use_case(&self) -> IndexGmailUseCase {
        IndexGmailUseCase::new(
            self.gmail_repo.clone(),
            self.search_repo.clone(),
        )
    }

    pub fn disconnect_gmail_use_case(&self) -> DisconnectGmailUseCase {
        DisconnectGmailUseCase::new(
            self.token_store.clone(),
            self.gmail_repo.clone(),
        )
    }
}
```

## Testing Use Cases

Use cases are tested with mocked repositories:

```rust
#[cfg(test)]
mod tests {
    use super::*;
    use crate::domain::repositories::MockSearchRepository;

    #[tokio::test]
    async fn test_search_returns_results() {
        let mut mock_repo = MockSearchRepository::new();
        mock_repo
            .expect_search()
            .returning(|_, _| {
                Ok(vec![SearchResult {
                    id: "1".into(),
                    title: "Test Result".into(),
                    ..Default::default()
                }])
            });

        let use_case = SearchUseCase::new(Arc::new(mock_repo));
        let results = use_case.execute("test", SearchFilters::default()).await.unwrap();

        assert_eq!(results.len(), 1);
        assert_eq!(results[0].title, "Test Result");
    }

    #[tokio::test]
    async fn test_search_validates_query_length() {
        let mock_repo = MockSearchRepository::new();
        let use_case = SearchUseCase::new(Arc::new(mock_repo));

        let long_query = "x".repeat(600);
        let result = use_case.execute(&long_query, SearchFilters::default()).await;

        assert!(result.is_err());
    }
}
```

## Adding a New Use Case

1. Create `application/use_cases/my_feature.rs`

```rust
pub struct MyFeatureUseCase {
    some_repo: Arc<dyn SomeRepository>,
    another_repo: Arc<dyn AnotherRepository>,
}

impl MyFeatureUseCase {
    pub fn new(
        some_repo: Arc<dyn SomeRepository>,
        another_repo: Arc<dyn AnotherRepository>,
    ) -> Self {
        Self {
            some_repo,
            another_repo,
        }
    }

    pub async fn execute(&self, input: &str) -> Result<OutputDTO> {
        // 1. Validate
        // 2. Fetch from repos
        // 3. Apply domain logic
        // 4. Convert to DTO
        // 5. Return
    }
}
```

2. Add to `application/use_cases/mod.rs`

```rust
pub mod my_feature;
pub use my_feature::MyFeatureUseCase;
```

3. Add factory method to `AppContainer`

```rust
pub fn my_feature_use_case(&self) -> MyFeatureUseCase {
    MyFeatureUseCase::new(
        self.some_repo.clone(),
        self.another_repo.clone(),
    )
}
```

4. Wire up in Tauri API handler

```rust
#[tauri::command]
pub async fn my_feature_command(
    input: String,
    container: tauri::State<'_, Arc<AppContainer>>,
) -> Result<OutputDTO, String> {
    container
        .my_feature_use_case()
        .execute(&input)
        .await
        .map_err(|e| e.to_string())
}
```

## Design Rules

1. **One responsibility per use case**: Each file should represent one workflow
2. **Dependency injection**: Never create dependencies directly
3. **Validate input early**: Check constraints at use case entry point
4. **Return DTOs not entities**: Always convert to DTO before returning to Tauri
5. **No side effects in domain logic**: Keep domain services pure
6. **Test with mocks**: Mock all repositories in unit tests

## Flow: Use Case → Infrastructure

```
SearchUseCase::execute("deadline", filters)
    ↓
Calls SearchRepository::search() (abstracted)
    ↓
Infrastructure: SqliteSearchEngine::search()
    ↓
SQLite FTS5 query
    ↓
Returns Vec<SearchResult> (domain entity)
    ↓
SearchRanker::rank() (pure domain logic)
    ↓
Convert to SearchResultDTO
    ↓
Return to Tauri handler
    ↓
Serialize to JSON
    ↓
Send to React frontend
```

## See Also

- [Architecture Guide](../../docs/architecture.md#application-layer)
- [Domain Layer README](../domain/README.md)
- [Infrastructure Layer README](../infrastructure/README.md)