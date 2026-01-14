# RecallDesk Development Setup

This guide walks you through setting up RecallDesk for local development, testing, and building.

## Prerequisites

### System Requirements

- **macOS 11+** or **Windows 10+** (Linux optional)
- **Rust 1.70+** ([install](https://rustup.rs/))
- **Node.js 18+** and **npm** ([install](https://nodejs.org/))
- **Git**

### Verify Installation

```bash
rustc --version  # Should be 1.70+
cargo --version
node --version   # Should be 18+
npm --version
```

## Project Setup

### 1. Clone / Initialize Project

```bash
cd ~/path/to/RecallDesk
git init  # Or clone if using Git
```

### 2. Install Dependencies

```bash
# Install Rust dependencies (backend)
cd src-tauri
cargo build --release  # First build takes a while
cd ..

# Install Node dependencies (frontend)
npm install
```

### 3. Configure OAuth

RecallDesk uses Google OAuth 2.0 for Gmail. You need to set up OAuth credentials.

#### Step 1: Create Google Cloud Project

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project: "RecallDesk"
3. Enable the **Gmail API**:
   - Search for "Gmail API"
   - Click "Enable"

#### Step 2: Create OAuth Credentials

1. Go to **Credentials** → **Create Credentials** → **OAuth client ID**
2. Choose **Desktop application**
3. Download the credentials JSON

#### Step 3: Store Credentials

1. Save the JSON to: `src-tauri/.env.local`

```env
GOOGLE_CLIENT_ID=YOUR_CLIENT_ID_HERE
GOOGLE_CLIENT_SECRET=YOUR_CLIENT_SECRET_HERE
GOOGLE_REDIRECT_URI=http://127.0.0.1:9999/oauth/callback
```

**Note**: The port (9999) must match `tauri.conf.json`. Keep these secrets local—never commit them.

## Running RecallDesk

### Development Mode

```bash
# Run Tauri + React in development
npm run dev

# In another terminal, if needed:
cd src-tauri
cargo watch -x run  # Hot reload on code changes
```

This launches:
- **React dev server** on `http://localhost:5173`
- **Tauri window** with your app
- Hot reload for UI changes

### Building for Production

```bash
# Create optimized binaries
npm run build

# Outputs to src-tauri/target/release/
# - RecallDesk.dmg (macOS)
# - RecallDesk.msi (Windows)
```

## Development Workflow

### Backend (Rust)

#### File Structure

```
src-tauri/src/
├── main.rs                # Tauri entry point
├── config.rs              # App configuration
├── domain/                # Pure business logic
│   ├── entities/
│   ├── value_objects/
│   ├── ports/             # Trait definitions
│   ├── services/
│   └── mod.rs
├── application/           # Use cases
│   ├── use_cases/
│   ├── dto/
│   └── mod.rs
├── infrastructure/        # Technical implementations
│   ├── db/
│   ├── gmail/
│   ├── file_system/
│   └── mod.rs
└── api/                   # Tauri command handlers
    ├── search.rs
    ├── gmail.rs
    ├── indexing.rs
    └── mod.rs
```

#### Writing Rust Code

**Key Rules**:
- Max 250 lines per file
- One responsibility per module
- Always use traits for dependencies (dependency injection)
- Document public APIs with doc comments

**Example: Creating a New Use Case**

1. Create `src-tauri/src/application/use_cases/my_feature.rs`

```rust
use crate::domain::repositories::SomeRepository;
use std::sync::Arc;

/// MyFeatureUseCase orchestrates the business logic for MyFeature.
///
/// # Dependencies
/// - `repository`: Abstracted repository for data access
///
/// # Example
/// ```
/// let use_case = MyFeatureUseCase::new(arc_repo);
/// use_case.execute("input").await?;
/// ```
pub struct MyFeatureUseCase {
    repository: Arc<dyn SomeRepository>,
}

impl MyFeatureUseCase {
    pub fn new(repository: Arc<dyn SomeRepository>) -> Self {
        Self { repository }
    }

    pub async fn execute(&self, input: &str) -> Result<String> {
        // 1. Validate input
        if input.is_empty() {
            return Err("Input cannot be empty".into());
        }

        // 2. Use repository
        let data = self.repository.get(input).await?;

        // 3. Return result
        Ok(data)
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[tokio::test]
    async fn test_execute_with_empty_input() {
        let mock_repo = MockSomeRepository::new();
        let use_case = MyFeatureUseCase::new(Arc::new(mock_repo));

        let result = use_case.execute("").await;
        assert!(result.is_err());
    }
}
```

2. Add to `src-tauri/src/application/mod.rs`

```rust
pub mod use_cases;
pub use use_cases::my_feature::MyFeatureUseCase;
```

3. Create Tauri command in `src-tauri/src/api/my_feature.rs`

```rust
use crate::application::MyFeatureUseCase;
use std::sync::Arc;

#[tauri::command]
pub async fn my_feature_command(
    input: String,
    use_case: tauri::State<'_, Arc<MyFeatureUseCase>>,
) -> Result<String, String> {
    use_case.execute(&input).await.map_err(|e| e.to_string())
}
```

4. Register in `src-tauri/src/main.rs`

```rust
let use_case = Arc::new(MyFeatureUseCase::new(repo));

tauri::Builder::default()
    .manage(use_case)
    .invoke_handler(tauri::generate_handler![my_feature_command])
    .run(tauri::generate_context!())
    .expect("Failed to run app")
```

#### Running Tests

```bash
# Run all tests
cd src-tauri
cargo test

# Run with output
cargo test -- --nocapture

# Test single module
cargo test domain::services::

# Watch for changes and re-test
cargo watch -x test
```

#### Database Setup

```bash
# Run migrations (creates SQLite schema)
cd src-tauri
sqlx migrate run

# Or, if manual:
sqlite3 ~/.recalldesk/index.db < migrations/001_init_schema.sql
```

### Frontend (React + TypeScript)

#### File Structure

```
src-ui/src/
├── pages/
│   ├── Onboarding.tsx      # Gmail + folders
│   ├── Search.tsx          # Main search UI
│   └── Settings.tsx        # Settings & privacy
├── components/
│   ├── SearchBar.tsx
│   ├── ResultsList.tsx
│   ├── FilterPanel.tsx
│   └── index.ts
├── hooks/
│   ├── useSearch.ts        # Search logic
│   ├── useIndexing.ts      # Sync progress
│   └── useGmailConnection.ts
├── services/
│   ├── api.ts              # Tauri command wrappers
│   └── logger.ts
├── store/
│   ├── searchStore.ts      # Zustand store
│   └── indexingStore.ts
├── types/
│   ├── search.ts
│   ├── index.ts
│   └── settings.ts
├── App.tsx
└── main.tsx
```

#### Writing React Code

**Key Rules**:
- Functional components with hooks only
- Custom hooks for stateful logic
- Components <200 lines if possible
- Props validated with TypeScript

**Example: Creating a Component**

1. Create `src-ui/src/components/MyComponent.tsx`

```typescript
import React, { useState } from 'react';
import { useSearch } from '../hooks/useSearch';

interface MyComponentProps {
  onSelect: (item: string) => void;
}

/**
 * MyComponent displays a list of items and handles selection.
 */
export const MyComponent: React.FC<MyComponentProps> = ({ onSelect }) => {
  const [query, setQuery] = useState('');
  const { results, loading, error } = useSearch(query);

  if (error) {
    return <div>Error: {error.message}</div>;
  }

  return (
    <div className="my-component">
      <input
        type="text"
        placeholder="Search..."
        value={query}
        onChange={(e) => setQuery(e.target.value)}
      />
      {loading && <div>Loading...</div>}
      <ul>
        {results.map((item) => (
          <li key={item.id} onClick={() => onSelect(item.id)}>
            {item.title}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default MyComponent;
```

2. Use in `src-ui/src/pages/Search.tsx`

```typescript
import MyComponent from '../components/MyComponent';

export const SearchPage = () => {
  const handleSelect = (id: string) => {
    console.log('Selected:', id);
  };

  return (
    <div className="search-page">
      <MyComponent onSelect={handleSelect} />
    </div>
  );
};
```

#### Custom Hooks

Create hooks in `src-ui/src/hooks/`:

```typescript
// useSearch.ts
import { useState, useEffect } from 'react';
import { invoke } from '@tauri-apps/api/tauri';
import { SearchResult } from '../types/search';

export const useSearch = (query: string) => {
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      return;
    }

    const searchAsync = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await invoke('search_command', { query });
        setResults(res as SearchResult[]);
      } catch (err) {
        setError(err instanceof Error ? err : new Error(String(err)));
      } finally {
        setLoading(false);
      }
    };

    const timer = setTimeout(searchAsync, 150); // Debounce 150ms
    return () => clearTimeout(timer);
  }, [query]);

  return { results, loading, error };
};
```

#### Running UI Tests

```bash
# Unit tests (React Testing Library)
npm run test

# Watch mode
npm run test:watch

# Coverage report
npm run test:coverage
```

### Linting & Formatting

```bash
# Rust (rustfmt)
cd src-tauri
cargo fmt

# Rust (clippy linter)
cargo clippy

# TypeScript (ESLint)
cd ../src-ui
npm run lint

# Format TypeScript (Prettier)
npm run format
```

## Testing Strategy

### Unit Tests (No I/O)

**Rust**: Test business logic in isolation using mocks.

```bash
cd src-tauri
cargo test domain::  # Test domain logic
cargo test application::  # Test use cases
```

**TypeScript**: Test components and hooks with React Testing Library.

```bash
cd src-ui
npm run test
```

### Integration Tests

**Rust**: Test with real database.

```bash
cd src-tauri
cargo test --test integration_tests
```

**TypeScript**: Test Tauri command invocation.

```bash
# Manual test: launch dev server and interact with the app
npm run dev
```

### Manual E2E Testing

1. Start dev server: `npm run dev`
2. Go through onboarding (connect Gmail, select folders)
3. Wait for initial index to complete
4. Search for a known email/file
5. Open result in Gmail / file explorer
6. Verify correct item opens
7. Test filters (time range, source)
8. Disconnect Gmail and verify data removed

## Debugging

### Rust Backend

```bash
# Run with debug output
RUST_LOG=debug cargo run

# Use a debugger (lldb on macOS, gdb on Linux)
lldb target/debug/recalldesk
```

### React Frontend

```bash
# Browser DevTools (F12 in Tauri window)
# Or use VS Code Debugger:
npm run dev
# Then attach VS Code debugger to localhost:5173
```

### Logs

Logs are written to:
- **macOS**: `~/Library/Logs/RecallDesk/`
- **Windows**: `%APPDATA%\RecallDesk\logs\`

## Common Development Tasks

### Add a New Module

1. Create folder: `src-tauri/src/domain/entities/my_entity.rs`
2. Add doc comments and public API
3. Add to `mod.rs`: `pub mod my_entity;`
4. Add tests in the same file (or separate `tests/` folder)

### Connect UI to Backend Command

1. Define Tauri command in `src-tauri/src/api/my_command.rs`
2. Register in `main.rs`
3. Create TypeScript wrapper in `src-ui/src/services/api.ts`
4. Use in React component via `invoke()` or custom hook

### Add Database Migration

1. Create `src-tauri/migrations/NNN_description.sql`
2. Write SQL schema changes
3. Run: `sqlx migrate run`

### Profile Performance

```bash
# Measure search latency
cd src-tauri
cargo bench

# Profile memory usage
cargo flamegraph --bench search
```

## Build Configuration

### `tauri.conf.json`

Located at `src-tauri/tauri.conf.json`:

```json
{
  "build": {
    "beforeBuildCommand": "npm run build",
    "devUrl": "http://localhost:5173",
    "frontendDist": "../src-ui/dist"
  },
  "app": {
    "title": "RecallDesk",
    "windows": [
      {
        "title": "RecallDesk",
        "width": 1200,
        "height": 800,
        "resizable": true
      }
    ]
  }
}
```

### Environment Variables

Create `.env.local` files (never commit):

```
# src-tauri/.env.local
GOOGLE_CLIENT_ID=...
GOOGLE_CLIENT_SECRET=...

# src-ui/.env.local
VITE_API_URL=http://localhost:9999
```

## Deployment

### macOS

```bash
npm run build

# Output: src-tauri/target/release/bundle/dmg/RecallDesk.dmg
# Notarize for Gatekeeper (requires Apple Developer account)
```

### Windows

```bash
npm run build

# Output: src-tauri/target/release/RecallDesk.msi
```

### Code Signing

For production releases, sign binaries:

```bash
# macOS: Use Apple Developer certificate
codesign -s - target/release/RecallDesk.app

# Windows: Use code signing certificate
```

## Troubleshooting

### Build Failures

**"cargo build failed"**
```bash
cargo clean
cargo build
```

**"Node modules broken"**
```bash
rm -rf node_modules package-lock.json
npm install
```

### OAuth Issues

**"Invalid redirect_uri"**
- Check `tauri.conf.json` and `.env.local` have matching ports
- Ensure Google Cloud credentials include `http://127.0.0.1:9999/oauth/callback`

**"Token revoked"**
- Clear OS keychain/Credential Manager
- Re-authenticate with Gmail

### Database Issues

**"Database locked"**
- SQLite conflict with concurrent access
- Ensure only one instance of app is running

**"Migration failed"**
```bash
sqlx database reset  # Recreate from scratch
```

## Code Style Guide

### Rust

```rust
// Use meaningful names
pub struct EmailMessage { }  // ✓ Good
pub struct Email { }         // ✓ Also fine
pub struct E { }             // ✗ Too vague

// Doc comments on public items
/// Fetches recent emails from Gmail.
///
/// # Arguments
/// * `limit` - Maximum number of emails to fetch
///
/// # Returns
/// Vec of GmailMessage entities, newest first
///
/// # Errors
/// Returns `GmailError` if API call fails
pub async fn fetch_recent(&self, limit: usize) -> Result<Vec<GmailMessage>> { }

// Use `#[derive(Debug)]` for debugging
#[derive(Clone, Debug)]
pub struct SomeEntity { }

// Keep functions to ~40 lines
pub fn do_something() -> Result<()> {
    // ~40 lines max
}
```

### TypeScript

```typescript
// Use meaningful types
interface SearchResult {
  id: string;
  title: string;
  snippet: string;
}

// JSDoc comments on exports
/**
 * Executes a unified search across Gmail and local files.
 * 
 * @param query - Search query string
 * @param filters - Optional search filters
 * @returns Array of matching items
 */
export async function search(query: string, filters?: SearchFilters): Promise<SearchResult[]> {
  // ...
}

// Use const for functions
const handleSearch = (query: string) => {
  // ...
};

// Explicit return types
const fetchData = async (): Promise<SearchResult[]> => {
  // ...
};
```

## Next Steps

1. **Read Architecture**: Review `docs/architecture.md`
2. **Run Dev Server**: `npm run dev`
3. **Explore Codebase**: Start in `src-tauri/src/main.rs`
4. **Write First Feature**: Create a use case + Tauri command + React component
5. **Run Tests**: `cargo test` + `npm run test`
6. **Build Release**: `npm run build`

## Support & Resources

- **Tauri Docs**: https://tauri.app/
- **Rust Book**: https://doc.rust-lang.org/book/
- **React Docs**: https://react.dev/
- **SQLite FTS5**: https://www.sqlite.org/fts5.html
- **Gmail API**: https://developers.google.com/gmail/api

---

Happy coding! 🚀