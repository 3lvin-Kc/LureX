# Domain Layer

## Purpose

The domain layer contains the core business logic of RecallDesk. It is completely independent of frameworks, databases, and external services. This layer defines what RecallDesk *is* and what it *does*.

## Key Principles

- **No External Dependencies**: Domain code never imports from Infrastructure, Application, or Presentation layers
- **Pure Business Logic**: Entities and services contain only business rules
- **Type Safety**: Use Rust's type system to prevent invalid states
- **Testable**: All domain logic is trivial to test without mocks

## Module Structure

```
domain/
├── README.md                    # This file
├── entities/                    # Domain models
│   ├── mod.rs
│   ├── gmail_message.rs        # Email from Gmail
│   ├── local_file.rs           # File on disk
│   └── search_result.rs        # Unified search result
├── value_objects/              # Type-safe primitives
│   ├── mod.rs
│   ├── message_id.rs           # Newtype: String wrapper for message IDs
│   ├── thread_id.rs            # Newtype: String wrapper for thread IDs
│   └── file_path.rs            # Newtype: PathBuf wrapper
├── ports/                       # Trait definitions (interfaces)
│   ├── mod.rs
│   ├── gmail_repository.rs     # Abstract Gmail data access
│   ├── file_repository.rs      # Abstract file data access
│   ├── search_repository.rs    # Abstract search index
│   └── sync_state_repository.rs # Abstract sync state tracking
├── services/                    # Domain services
│   ├── mod.rs
│   ├── search_ranker.rs        # Pure ranking logic
│   └── content_filter.rs       # Pure filtering logic
└── errors.rs                    # Domain error types
```

## Entities

Domain entities represent core business concepts:

### `GmailMessage`
- Represents a single email message from Gmail
- Contains: `message_id`, `thread_id`, `subject`, `from`, `to`, `cc`, `body_text`, `date`, `labels`
- Pure methods: `snippet()`, `matches_label()`

### `LocalFile`
- Represents an indexed file on the local filesystem
- Contains: `path`, `file_type`, `file_size`, `modified_at`, `extracted_text`
- Pure methods: `extension()`, `is_text_file()`

### `SearchResult`
- Unified result from search (could be from Gmail or file)
- Contains: `id`, `source_type`, `title`, `snippet`, `metadata`, `created_at`, `rank_score`
- Pure method: `relevance_score()`

## Value Objects

Type-safe wrappers prevent mixing up different ID types:

### `MessageId`
```rust
// Prevents: thread_id == message_id (type mismatch)
pub struct MessageId(String);
```

### `ThreadId`
```rust
pub struct ThreadId(String);
```

### `FilePath`
```rust
pub struct FilePath(PathBuf);
```

## Ports (Trait Interfaces)

These traits define the contract between domain and infrastructure. Infrastructure implements them; domain uses them.

### `GmailRepository`
```rust
#[async_trait]
pub trait GmailRepository: Send + Sync {
    async fn fetch_messages(&self, query: &str) -> Result<Vec<GmailMessage>>;
    async fn save_message(&self, msg: &GmailMessage) -> Result<()>;
    async fn get_message(&self, id: &MessageId) -> Result<Option<GmailMessage>>;
}
```

### `SearchRepository`
```rust
#[async_trait]
pub trait SearchRepository: Send + Sync {
    async fn search(&self, query: &str, filters: &SearchFilters) -> Result<Vec<SearchResult>>;
    async fn index_item(&self, item: &SearchResult) -> Result<()>;
    async fn delete_all(&self) -> Result<()>;
}
```

## Services

Pure business logic that operates on domain entities:

### `SearchRanker`
Ranks search results by relevance:
- BM25 scoring from FTS5
- Recency boost (recent results ranked higher)
- Source preference (optional)

```rust
pub struct SearchRanker;

impl SearchRanker {
    pub fn rank(results: Vec<SearchResult>) -> Vec<SearchResult> {
        // Pure function: sorts by relevance
    }
}
```

### `ContentFilter`
Filters search results by criteria:
- Time range (last 7 days, 30 days, etc.)
- Source type (Gmail / Files)
- Labels (for Gmail)

```rust
pub struct ContentFilter;

impl ContentFilter {
    pub fn filter(results: Vec<SearchResult>, filters: &SearchFilters) -> Vec<SearchResult> {
        // Pure function: returns matching results
    }
}
```

## Error Types

Domain-level errors represent business failures:

```rust
pub enum DomainError {
    ValidationError(String),        // Invalid input
    NotFound(String),               // Entity not found
    InvalidState(String),           // Precondition violated
    ConversionError(String),        // Type conversion failed
}
```

These are converted to `ApplicationError` in the application layer.

## Usage Example

Here's how domain logic flows:

```rust
// 1. Application layer receives search query
let query = "deadline";
let filters = SearchFilters {
    time_range: TimeRange::Last30Days,
    source: Source::All,
};

// 2. Application calls SearchRepository (via port)
let raw_results = search_repo.search(query, &filters).await?;

// 3. Application calls domain service (pure logic)
let ranked = SearchRanker::rank(raw_results);
let filtered = ContentFilter::filter(ranked, &filters);

// 4. Return to presentation layer
Ok(filtered)
```

## Adding New Business Logic

1. **Identify the entity**: What domain concept are we modeling?
2. **Create entity file**: `domain/entities/my_entity.rs`
3. **Add value objects**: If needed, create newtype wrappers
4. **Create port (trait)**: If it needs persistence, define the trait
5. **Create service**: If it's stateless logic, add to `services/`
6. **Document with examples**: Every public type needs doc comments

## Testing Domain Logic

Domain logic should be tested without any infrastructure:

```rust
#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_search_ranker_boosts_recent_items() {
        let older = SearchResult {
            id: "1".into(),
            rank_score: 1.0,
            created_at: now - Duration::days(30),
            ..Default::default()
        };
        
        let recent = SearchResult {
            id: "2".into(),
            rank_score: 1.0,
            created_at: now,
            ..Default::default()
        };

        let results = SearchRanker::rank(vec![older, recent]);
        assert_eq!(results[0].id, "2"); // Recent first
    }
}
```

## Design Rules

1. **No framework knowledge**: Don't import from `tauri`, `sqlx`, `reqwest`, etc.
2. **No I/O operations**: No database calls, HTTP requests, file reads
3. **Keep it simple**: Use Rust's type system to encode invariants
4. **Document interfaces**: Every trait method needs a doc comment explaining its contract
5. **Use traits for dependencies**: Infrastructure can be swapped out

## Integration with Other Layers

- **From Application**: Application layer calls domain services and uses domain repositories
- **From Infrastructure**: Infrastructure implements domain repository traits
- **To Application**: Returns domain entities to be converted to DTOs
- **Never from Presentation**: UI never directly uses domain types (use DTOs instead)

## Future Extensions

To add a new data source (e.g., Slack):

1. Create `SlackMessage` entity in `entities/slack_message.rs`
2. Create `SlackRepository` trait in `ports/slack_repository.rs`
3. Unify in `SearchResult` by adding `source_type` field
4. Search logic automatically works for all sources!

This is the power of clean architecture: new sources integrate without touching existing code.