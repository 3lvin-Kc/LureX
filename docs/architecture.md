# RecallDesk Architecture

## Overview

RecallDesk follows **Clean Architecture** principles to ensure the system is:
- **Testable**: Business logic independent of frameworks
- **Maintainable**: Clear separation of concerns
- **Extensible**: Easy to add new indexing sources (e.g., Slack)
- **Reliable**: Explicit error handling, no silent failures

## Layered Architecture

```
┌─────────────────────────────────────────────────────────┐
│          PRESENTATION LAYER (React/TypeScript)          │
│  UI Components, Pages, Store (Redux/Zustand)            │
└────────────────┬────────────────────────────────────────┘
                 │ calls
                 ▼
┌─────────────────────────────────────────────────────────┐
│      APPLICATION LAYER (Tauri Commands / Use Cases)     │
│  Orchestration, business flow, command handlers         │
└────────────────┬────────────────────────────────────────┘
                 │ uses
                 ▼
┌─────────────────────────────────────────────────────────┐
│         DOMAIN LAYER (Entities, Value Objects)          │
│  SearchResult, GmailMessage, IndexedFile, etc.          │
│  Domain interfaces: GmailClient, FileWatcher, etc.      │
└────────────────┬────────────────────────────────────────┘
                 │ implements
                 ▼
┌─────────────────────────────────────────────────────────┐
│    INFRASTRUCTURE LAYER (DB, APIs, File System)         │
│  SQLiteSearchEngine, GmailOAuthClient, FileIndexer      │
└─────────────────────────────────────────────────────────┘
```

## Dependency Flow (Strict Inward)

**Golden Rule**: Dependencies flow INWARD only.

```
Infrastructure → Domain (depends on domain interfaces)
Application → Domain + Infrastructure (via dependency injection)
Presentation → Application (calls Tauri commands)
Domain ↔ NOTHING (pure business logic)
```

**What this means:**
- Domain layer NEVER imports from Application, Infrastructure, or Presentation
- Application never imports from Presentation
- Infrastructure implements Domain interfaces
- Presentation calls Application layer only

## Layer Breakdown

### 1. Domain Layer (`src-tauri/src/domain/`)

**Purpose**: Pure business logic, entities, interfaces.

**Does NOT depend on**: Database, OAuth libraries, file system, UI, HTTP frameworks.

**Contains**:
- `entities/`: Domain models (GmailMessage, IndexedFile, SearchResult)
- `value_objects/`: MessageId, ThreadId, FilePath (type-safe primitives)
- `repositories/`: Trait definitions (not implementations)
  - `GmailRepository` - fetch emails
  - `FileRepository` - fetch indexed files
  - `SearchRepository` - query search index
  - `SyncStateRepository` - track Gmail sync progress
- `services/`: Domain services
  - `SearchRanker` - ranking logic for results
  - `ContentExtractor` - text extraction rules
- `errors.rs` - Domain error types

**Key Files**:
```
domain/
├── README.md                    # Module documentation
├── entities/
│   ├── gmail_message.rs        # GmailMessage entity
│   ├── indexed_file.rs         # IndexedFile entity
│   ├── search_result.rs        # SearchResult entity
│   └── mod.rs
├── value_objects/
│   ├── message_id.rs           # Newtype: MessageId
│   ├── thread_id.rs            # Newtype: ThreadId
│   ├── file_path.rs            # Newtype: FilePath
│   └── mod.rs
├── repositories/
│   ├── gmail_repository.rs     # Trait (interface)
│   ├── file_repository.rs      # Trait (interface)
│   ├── search_repository.rs    # Trait (interface)
│   ├── sync_state_repository.rs # Trait (interface)
│   └── mod.rs
├── services/
│   ├── search_ranker.rs        # Pure ranking logic
│   ├── content_extractor.rs    # Text extraction rules
│   └── mod.rs
└── errors.rs                   # DomainError enum
```

**Example - Pure Entity**:
```rust
pub struct GmailMessage {
    pub message_id: MessageId,
    pub thread_id: ThreadId,
    pub subject: String,
    pub from: String,
    pub body_text: String,
    pub date: DateTime<Utc>,
}

impl GmailMessage {
    // Pure domain logic - no dependencies
    pub fn snippet(&self, max_len: usize) -> String {
        self.body_text.chars().take(max_len).collect()
    }
}
```

### 2. Application Layer (`src-tauri/src/application/`)

**Purpose**: Orchestrate domain logic, coordinate repositories, implement use cases.

**Does NOT depend on**: UI framework specifics, HTTP status codes, database schema.

**Depends on**: Domain interfaces (repositories, entities).

**Contains**:
- `use_cases/`: Each feature is a use case
  - `ConnectGmailUseCase` - OAuth flow
  - `SelectFoldersUseCase` - folder selection
  - `IndexGmailUseCase` - fetch & store emails
  - `IndexFilesUseCase` - scan & extract files
  - `SearchUseCase` - execute search query
  - `GetSyncStatusUseCase` - check indexing progress
- `dto/`: Data Transfer Objects (for API boundaries)
- `services/`: Application-level services (coordinator)
  - `IndexingService` - manages background sync

**Key Files**:
```
application/
├── README.md
├── use_cases/
│   ├── connect_gmail.rs        # OAuth flow
│   ├── select_folders.rs       # Save folder selections
│   ├── index_gmail.rs          # Fetch & store emails
│   ├── index_files.rs          # Scan filesystem
│   ├── search.rs               # Execute search
│   ├── get_sync_status.rs      # Indexing progress
│   ├── disconnect_gmail.rs     # Revoke tokens
│   ├── delete_index.rs         # Wipe all data
│   └── mod.rs
├── dto/
│   ├── gmail_dto.rs            # API DTOs
│   ├── search_result_dto.rs    # Search result shape
│   └── mod.rs
├── services/
│   ├── indexing_service.rs     # Orchestration
│   └── mod.rs
└── errors.rs                   # ApplicationError
```

**Example - Use Case**:
```rust
pub struct SearchUseCase {
    search_repo: Arc<dyn SearchRepository>,
}

impl SearchUseCase {
    pub async fn execute(
        &self,
        query: &str,
        filters: SearchFilters,
    ) -> Result<Vec<SearchResultDTO>> {
        // 1. Validate input
        if query.is_empty() {
            return Ok(vec![]); // or return recent items
        }

        // 2. Query repository (abstracted)
        let results = self.search_repo.search(query, filters).await?;

        // 3. Convert to DTO
        let dtos = results.into_iter().map(|r| r.into()).collect();
        Ok(dtos)
    }
}
```

### 3. Infrastructure Layer (`src-tauri/src/infrastructure/`)

**Purpose**: Implement domain repositories, external integrations, persistence.

**Depends on**: Domain interfaces, external crates (sqlx, oauth2, notify).

**Contains**:
- `db/`: SQLite implementation
  - `search_engine.rs` - FTS5 queries
  - `gmail_repository_impl.rs` - Persist emails
  - `file_repository_impl.rs` - Persist file metadata
  - `sync_state_repository_impl.rs` - Track sync progress
  - `migrations/` - SQL migrations
- `gmail/`: Gmail OAuth & API client
  - `oauth_client.rs` - OAuth 2.0 flow
  - `gmail_api_client.rs` - Fetch emails
- `file_system/`: Local file indexing
  - `file_watcher.rs` - Watch for changes
  - `file_indexer.rs` - Extract text
  - `content_extractors/` - PDF, DOCX, plaintext
- `keychain/`: Secure token storage
  - `token_store.rs` - OS keychain integration

**Key Files**:
```
infrastructure/
├── README.md
├── db/
│   ├── connection.rs           # SQLite setup
│   ├── search_engine.rs        # FTS5 queries
│   ├── gmail_repository_impl.rs # GmailRepository impl
│   ├── file_repository_impl.rs  # FileRepository impl
│   ├── sync_state_repository_impl.rs
│   ├── migrations/
│   │   ├── 001_init_schema.sql
│   │   └── 002_add_fts5.sql
│   └── mod.rs
├── gmail/
│   ├── oauth_client.rs         # OAuth 2.0
│   ├── gmail_api_client.rs     # Gmail API
│   └── mod.rs
├── file_system/
│   ├── file_watcher.rs         # notify crate
│   ├── file_indexer.rs         # Filesystem scan
│   ├── content_extractors/
│   │   ├── pdf_extractor.rs
│   │   ├── docx_extractor.rs
│   │   ├── plaintext_extractor.rs
│   │   └── mod.rs
│   └── mod.rs
├── keychain/
│   ├── token_store.rs          # OS keychain
│   └── mod.rs
└── errors.rs                   # Infrastructure errors
```

**Example - Repository Implementation**:
```rust
pub struct SqliteSearchEngine {
    db: Connection,
}

#[async_trait]
impl SearchRepository for SqliteSearchEngine {
    async fn search(
        &self,
        query: &str,
        filters: SearchFilters,
    ) -> Result<Vec<SearchResult>> {
        // Execute FTS5 query
        let results = sqlx::query_as!(
            SearchResult,
            "SELECT * FROM items_fts WHERE items_fts MATCH ? ... LIMIT 50",
            query
        )
        .fetch_all(&self.db)
        .await?;

        Ok(results)
    }
}
```

### 4. Presentation Layer (`src-ui/src/`)

**Purpose**: UI components, pages, state management.

**Depends on**: Application layer (Tauri commands), types.

**Contains**:
- `components/`: Reusable UI components
  - `SearchBar.tsx`
  - `ResultItem.tsx`
  - `FilterPanel.tsx`
- `pages/`: Full page components
  - `OnboardingPage.tsx` - Gmail + folders
  - `HomePage.tsx` - Search interface
  - `SettingsPage.tsx` - Connection, index mgmt
- `hooks/`: Custom React hooks
  - `useSearch.ts` - Search logic
  - `useGmailConnection.ts` - OAuth flow
  - `useIndexing.ts` - Sync progress
- `services/`: API client
  - `tauriAPI.ts` - Tauri command wrappers
- `store/`: State management (Zustand/Redux)
  - `searchStore.ts`
  - `indexingStore.ts`
- `types/`: TypeScript interfaces
  - `api.ts` - API response types
  - `domain.ts` - Matching domain entities

**Key Files**:
```
src-ui/src/
├── components/
│   ├── SearchBar.tsx
│   ├── ResultItem.tsx
│   ├── FilterPanel.tsx
│   └── README.md
├── pages/
│   ├── OnboardingPage.tsx
│   ├── HomePage.tsx
│   ├── SettingsPage.tsx
│   └── README.md
├── hooks/
│   ├── useSearch.ts
│   ├── useGmailConnection.ts
│   ├── useIndexing.ts
│   └── README.md
├── services/
│   ├── tauriAPI.ts             # Tauri command wrappers
│   └── README.md
├── store/
│   ├── searchStore.ts
│   ├── indexingStore.ts
│   └── README.md
├── types/
│   ├── api.ts
│   ├── domain.ts
│   └── README.md
├── App.tsx
└── main.tsx
```

## Data Flow Example: Search

```
User Types in SearchBar
    ↓
[Presentation] SearchBar component → calls useSearch hook
    ↓
useSearch → invoke Tauri command: search(query)
    ↓
[API] Tauri command handler (src-tauri/src/api/commands/search.rs)
    ↓
[Application] SearchUseCase::execute(query, filters)
    ↓
SearchUseCase → calls SearchRepository interface
    ↓
[Infrastructure] SqliteSearchEngine::search() → FTS5 query
    ↓
Results come back as SearchResult (domain entity)
    ↓
Application converts to SearchResultDTO
    ↓
Returns to Tauri handler → JSON serialization
    ↓
[Presentation] SearchBar receives results
    ↓
Renders ResultItem components
```

## Adding a New Integration Source (Example: Slack)

To prove extensibility, here's how you'd add Slack:

1. **Domain** (`src-tauri/src/domain/repositories/slack_repository.rs`):
```rust
#[async_trait]
pub trait SlackRepository {
    async fn fetch_messages(&self, since: DateTime<Utc>) -> Result<Vec<SlackMessage>>;
}
```

2. **Domain Entity** (`src-tauri/src/domain/entities/slack_message.rs`):
```rust
pub struct SlackMessage {
    pub ts: String,
    pub channel: String,
    pub user: String,
    pub text: String,
}
```

3. **Infrastructure** (`src-tauri/src/infrastructure/slack/slack_api_client.rs`):
```rust
pub struct SlackApiClient { /* ... */ }

#[async_trait]
impl SlackRepository for SlackApiClient {
    async fn fetch_messages(&self, since: DateTime<Utc>) -> Result<Vec<SlackMessage>> {
        // Slack API calls
    }
}
```

4. **Application** (`src-tauri/src/application/use_cases/index_slack.rs`):
```rust
pub struct IndexSlackUseCase {
    slack_repo: Arc<dyn SlackRepository>,
    file_repo: Arc<dyn FileRepository>,
}
```

5. **Store indexed items** in same schema (polymorphic via `source_type: "slack"`).

No changes needed to presentation or search logic!

## Database Schema

### Core Tables

```sql
-- Metadata for all indexed items
CREATE TABLE items (
    id INTEGER PRIMARY KEY,
    source_type TEXT NOT NULL, -- 'gmail' | 'file'
    source_id TEXT UNIQUE NOT NULL, -- messageId / filePath
    title TEXT NOT NULL,
    snippet TEXT,
    body_text TEXT,
    created_at DATETIME,
    modified_at DATETIME,
    metadata JSONB -- source-specific data
);

-- Full-text search index (FTS5)
CREATE VIRTUAL TABLE items_fts USING fts5(
    title,
    body_text,
    content=items,
    content_rowid=id
);

-- Gmail-specific metadata
CREATE TABLE gmail_messages (
    id INTEGER PRIMARY KEY,
    item_id INTEGER NOT NULL,
    message_id TEXT UNIQUE NOT NULL,
    thread_id TEXT NOT NULL,
    from_email TEXT,
    to_email TEXT,
    cc_email TEXT,
    labels TEXT, -- JSON array
    FOREIGN KEY (item_id) REFERENCES items(id) ON DELETE CASCADE
);

-- File-specific metadata
CREATE TABLE indexed_files (
    id INTEGER PRIMARY KEY,
    item_id INTEGER NOT NULL,
    file_path TEXT UNIQUE NOT NULL,
    file_size INTEGER,
    file_type TEXT, -- 'pdf' | 'docx' | 'txt' | etc.
    FOREIGN KEY (item_id) REFERENCES items(id) ON DELETE CASCADE
);

-- Sync state
CREATE TABLE sync_state (
    id INTEGER PRIMARY KEY,
    source_type TEXT UNIQUE NOT NULL,
    last_sync DATETIME,
    gmail_history_id TEXT, -- For Gmail incremental sync
    last_error TEXT
);

-- Selected folders for indexing
CREATE TABLE indexed_folders (
    id INTEGER PRIMARY KEY,
    folder_path TEXT UNIQUE NOT NULL,
    added_at DATETIME
);
```

## Error Handling Strategy

**Principle**: No silent failures. All errors must be categorized and logged.

### Error Categories

```rust
pub enum DomainError {
    ValidationError(String),
    NotFound(String),
}

pub enum ApplicationError {
    DomainError(DomainError),
    RepositoryError(String),
    ExternalServiceError(String),
}

pub enum InfrastructureError {
    DatabaseError(String),
    OAuthError(String),
    FileSystemError(String),
    NetworkError(String),
}
```

### Logging Rules

✓ **Log these**:
- Search queries (anonymized)
- Sync start/end times
- File extraction errors
- Database migrations
- OAuth flow state

✗ **Never log**:
- OAuth tokens
- Full email bodies
- Sensitive file contents
- Personal data (emails, names)

## Testing Strategy

### Unit Tests (No I/O)

```rust
#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_search_ranker_boosts_recency() {
        let ranker = SearchRanker::new();
        let result1 = SearchResult { created_at: now, ... };
        let result2 = SearchResult { created_at: one_week_ago, ... };
        
        let ranked = ranker.rank(vec![result2, result1]);
        assert_eq!(ranked[0].id, result1.id); // Recent first
    }

    #[tokio::test]
    async fn test_search_use_case_with_mock_repo() {
        let mock_repo = MockSearchRepository::new();
        mock_repo.expect_search().returning(|_| Ok(vec![]));

        let use_case = SearchUseCase::new(Arc::new(mock_repo));
        let results = use_case.execute("test", filters).await.unwrap();
        assert_eq!(results.len(), 0);
    }
}
```

### Integration Tests (Against real DB)

```rust
#[tokio::test]
async fn test_gmail_sync_persists_messages() {
    let db = setup_test_db().await;
    let repo = SqliteGmailRepository::new(db);

    let msg = GmailMessage { /* ... */ };
    repo.save(&msg).await.unwrap();

    let fetched = repo.get(&msg.message_id).await.unwrap();
    assert_eq!(fetched.subject, msg.subject);
}
```

### UI Tests (Component-level)

```typescript
import { render, screen } from '@testing-library/react';
import SearchBar from './SearchBar';

test('SearchBar accepts input', () => {
    render(<SearchBar />);
    const input = screen.getByRole('textbox');
    fireEvent.change(input, { target: { value: 'test' } });
    expect(input.value).toBe('test');
});
```

## File Length Enforcement

**Rule**: No file exceeds 250 lines. If you find yourself writing > 200 lines:

1. **Refactor into smaller modules**
   - Extract service classes
   - Create separate files for entities vs. logic
   - Split tests into separate test modules

2. **Example**: If `search_use_case.rs` grows > 250 lines:
   ```
   search_use_case.rs (main logic, ~100 lines)
   search_use_case_filters.rs (filter logic, ~100 lines)
   search_use_case_ranking.rs (ranking logic, ~100 lines)
   mod.rs (re-exports)
   ```

## Dependency Injection Pattern

Using constructor injection + factory pattern:

```rust
// Infrastructure layer provides factory
pub struct AppContainer {
    search_engine: Arc<dyn SearchRepository>,
    gmail_repo: Arc<dyn GmailRepository>,
}

impl AppContainer {
    pub async fn new(db_path: &str) -> Result<Self> {
        let db = Connection::open(db_path)?;
        let search_engine = Arc::new(SqliteSearchEngine::new(db.clone()));
        let gmail_repo = Arc::new(SqliteGmailRepository::new(db));

        Ok(Self {
            search_engine,
            gmail_repo,
        })
    }

    pub fn search_use_case(&self) -> SearchUseCase {
        SearchUseCase::new(self.search_engine.clone())
    }
}
```

## Module Documentation Template

Every module should have `README.md`:

```markdown
# [Module Name]

## Purpose
What does this module do? Why does it exist?

## Responsibilities
- Responsibility 1
- Responsibility 2

## Key Types & Functions
- `SomeType` - description
- `some_function()` - description

## Dependencies
What other modules does this depend on?

## Usage Examples
```rust
let service = SomeService::new();
service.do_something().await?;
```

## Testing
How to test this module? Mocks? Fixtures?

## Future Extensions
What's the design pattern for adding new cases?
```

---

This architecture ensures that RecallDesk remains:
- **Testable** without running the app
- **Extensible** for new sources (Slack, Teams, etc.)
- **Maintainable** with clear responsibilities
- **Reliable** with comprehensive error handling