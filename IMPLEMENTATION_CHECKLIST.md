# RecallDesk MVP Implementation Checklist

Complete this checklist as you build out the RecallDesk MVP. Each section represents a major milestone.

## Pre-Implementation ✅

- [x] Architecture documented (docs/architecture.md)
- [x] Development setup guide created (docs/dev-setup.md)
- [x] Project structure initialized
- [x] Domain layer implemented with tests
- [x] SearchUseCase example provided
- [x] Clean architecture enforced
- [x] Engineering standards defined

## M1: Skeleton App Setup

- [ ] Install all npm/cargo dependencies
  - [ ] `npm install` succeeds
  - [ ] `cargo build` compiles
  - [ ] No warnings

- [ ] Create Tauri configuration
  - [ ] `tauri.conf.json` configured
  - [ ] Development port set (5173 for Vite)
  - [ ] Oauth redirect port set (9999)

- [ ] Test basic Tauri app
  - [ ] `npm run dev` launches window
  - [ ] React frontend loads
  - [ ] DevTools accessible (Ctrl+Shift+I)

- [ ] Set up Vite + React
  - [ ] `vite.config.ts` created
  - [ ] `tsconfig.json` configured
  - [ ] React components compile

- [ ] Create empty pages
  - [ ] Onboarding page (stub)
  - [ ] Search page (stub)
  - [ ] Settings page (stub)
  - [ ] Navigation between pages works

- [ ] Test routing
  - [ ] Page navigation works
  - [ ] Back/forward works
  - [ ] URL state preserved

## M2: Gmail OAuth + Sync

### Backend: OAuth Implementation

- [ ] Google OAuth setup
  - [ ] `oauth-credentials.json` created
  - [ ] OAuth client ID/secret obtained
  - [ ] Redirect URI configured (`http://127.0.0.1:9999/oauth/callback`)

- [ ] Implement OAuth client (`infrastructure/gmail/oauth_client.rs`)
  - [ ] Generate authorization URL
  - [ ] Exchange auth code for token
  - [ ] Refresh expired tokens
  - [ ] Handle OAuth errors

- [ ] Implement secure token storage (`infrastructure/keychain/token_store.rs`)
  - [ ] Store token in OS keychain
  - [ ] Retrieve token from keychain
  - [ ] Delete token on disconnect
  - [ ] Cross-platform support (Windows/macOS/Linux)

- [ ] Implement Gmail API client (`infrastructure/gmail/gmail_api_client.rs`)
  - [ ] Fetch messages from Gmail
  - [ ] Parse message bodies
  - [ ] Extract headers (from, to, cc, subject, date)
  - [ ] Handle Gmail API rate limits
  - [ ] Support incremental sync (historyId)

- [ ] Create ConnectGmailUseCase (`application/use_cases/connect_gmail.rs`)
  - [ ] Start OAuth flow
  - [ ] Handle OAuth callback
  - [ ] Save token to keychain
  - [ ] Test with mock OAuth client

- [ ] Create DisconnectGmailUseCase (`application/use_cases/disconnect_gmail.rs`)
  - [ ] Revoke OAuth token
  - [ ] Delete token from keychain
  - [ ] Delete indexed Gmail messages
  - [ ] Clear sync state

### Backend: Database Setup

- [ ] Create SQLite connection (`infrastructure/db/connection.rs`)
  - [ ] Database file created in `.recalldesk/` directory
  - [ ] Connection pooling set up
  - [ ] WAL mode enabled
  - [ ] FTS5 enabled

- [ ] Write database schema (`infrastructure/db/schema.rs`)
  - [ ] `items` table (all indexed content)
  - [ ] `items_fts` table (FTS5 virtual table)
  - [ ] `gmail_messages` table (Gmail-specific metadata)
  - [ ] `sync_state` table (last sync timestamps)
  - [ ] `indexed_folders` table (selected folders)

- [ ] Implement SearchRepository (`infrastructure/db/search_engine.rs`)
  - [ ] Index item (insert/update)
  - [ ] Search with FTS5 (bm25 scoring)
  - [ ] Delete all items
  - [ ] Get item count

- [ ] Implement GmailRepository (`infrastructure/db/gmail_repository_impl.rs`)
  - [ ] Save message to database
  - [ ] Fetch message by ID
  - [ ] Delete all Gmail messages
  - [ ] Get message count

- [ ] Implement SyncStateRepository (`infrastructure/db/sync_state_repository_impl.rs`)
  - [ ] Get/set last sync time
  - [ ] Get/set last error message
  - [ ] Add/remove indexed folders
  - [ ] List indexed folders

### Backend: Gmail Indexing

- [ ] Create IndexGmailUseCase (`application/use_cases/index_gmail.rs`)
  - [ ] Fetch messages from Gmail
  - [ ] Convert to SearchResult entities
  - [ ] Index in database
  - [ ] Update sync state
  - [ ] Handle errors gracefully

- [ ] Create SyncGmailUseCase (`application/use_cases/sync_gmail.rs`)
  - [ ] Poll every 10 minutes (or use historyId)
  - [ ] Fetch only new/modified messages
  - [ ] Update database
  - [ ] Emit progress events to UI

- [ ] Wire up Tauri commands (`api/gmail.rs`)
  - [ ] `connect_gmail_command` → OAuth URL
  - [ ] `oauth_callback` → Exchange code for token
  - [ ] `disconnect_gmail_command` → Revoke & delete
  - [ ] `sync_gmail_command` → Start indexing

### Backend: Testing

- [ ] Unit tests for Gmail client
  - [ ] Token refresh logic
  - [ ] Message parsing
  - [ ] Error handling

- [ ] Integration tests for database
  - [ ] Insert/retrieve messages
  - [ ] Search functionality
  - [ ] Sync state tracking

- [ ] Integration tests for use cases
  - [ ] OAuth flow (with mock client)
  - [ ] Message indexing
  - [ ] Sync state updates

### Frontend: Onboarding

- [ ] Create Onboarding page (`pages/Onboarding.tsx`)
  - [ ] "Connect Gmail" button
  - [ ] Shows OAuth consent screen (in browser)
  - [ ] Handles OAuth callback
  - [ ] Shows success message
  - [ ] Progress indicator

- [ ] Create custom hook for Gmail connection (`hooks/useGmailConnection.ts`)
  - [ ] Start OAuth flow
  - [ ] Listen for OAuth callback
  - [ ] Save connection status to Zustand store

- [ ] Create settings store (`store/settingsStore.ts`)
  - [ ] Gmail connection status
  - [ ] Gmail account email
  - [ ] Last sync time

- [ ] Create API wrapper (`services/api.ts`)
  - [ ] `connectGmail()` → invoke command
  - [ ] `disconnectGmail()` → invoke command
  - [ ] `getSyncStatus()` → invoke command

### Frontend: Testing

- [ ] Component tests for Onboarding
  - [ ] "Connect Gmail" button visible
  - [ ] Click opens browser
  - [ ] Success message shown after auth

## M3: Local File Indexing

### Backend: File System

- [ ] Implement file watcher (`infrastructure/file_system/file_watcher.rs`)
  - [ ] Watch selected folders for changes
  - [ ] Detect new/modified/deleted files
  - [ ] Debounce rapid changes
  - [ ] Handle permission errors

- [ ] Implement FileRepository (`infrastructure/db/file_repository_impl.rs`)
  - [ ] Save file metadata
  - [ ] Retrieve file by path
  - [ ] Delete file record
  - [ ] Get file count

- [ ] Implement text extractors (`infrastructure/file_system/text_extractors/`)
  - [ ] Plain text (.txt)
  - [ ] Markdown (.md)
  - [ ] JSON (.json)
  - [ ] CSV (.csv)
  - [ ] PDF (via pdfium-render)
  - [ ] DOCX (via docx-rs)
  - [ ] Source code (.rs, .py, .js, etc.)

- [ ] Set size limits
  - [ ] Max 200KB per file
  - [ ] Skip very large files
  - [ ] Timeout per extraction (5 seconds)

### Backend: Folder Selection

- [ ] Create SelectFoldersUseCase (`application/use_cases/select_folders.rs`)
  - [ ] Add folder to index
  - [ ] Remove folder from index
  - [ ] List selected folders
  - [ ] Persist to database

- [ ] Create IndexFilesUseCase (`application/use_cases/index_files.rs`)
  - [ ] Scan selected folders
  - [ ] Extract text from files
  - [ ] Convert to SearchResult entities
  - [ ] Index in database
  - [ ] Emit progress events

### Backend: Testing

- [ ] Unit tests for text extractors
  - [ ] Plain text extraction
  - [ ] PDF extraction
  - [ ] Error handling (corrupt files)

- [ ] Integration tests for file indexing
  - [ ] Create temp files
  - [ ] Scan and extract
  - [ ] Verify database records

### Frontend: Folder Selection

- [ ] Create folder picker component (`components/FolderPicker.tsx`)
  - [ ] Opens native file dialog
  - [ ] Allows multiple selection
  - [ ] Shows selected folders
  - [ ] Add/remove buttons

- [ ] Extend Onboarding page
  - [ ] Step 1: Connect Gmail ✅
  - [ ] Step 2: Select folders
  - [ ] Step 3: Start indexing
  - [ ] Progress indicator

## M4: FTS5 Search + UI

### Backend: Search Ranking

- [ ] Implement search logic in SearchUseCase
  - [ ] Query FTS5 with bm25() scoring
  - [ ] Apply filters (source, time range)
  - [ ] Rank by relevance + recency
  - [ ] Limit to 50 results
  - [ ] Return as DTO

- [ ] Create GetRecentItemsUseCase (`application/use_cases/get_recent_items.rs`)
  - [ ] Return 20 most recent items
  - [ ] Used when search is empty
  - [ ] Ranked by recency

### Backend: API Commands

- [ ] Wire up search command (`api/search.rs`)
  - [ ] `search_command(query, filters)` → results
  - [ ] Debounce (150ms client-side)
  - [ ] Error handling

### Frontend: Search UI

- [ ] Create SearchBox component (`components/SearchBox.tsx`)
  - [ ] Text input
  - [ ] Debounced onChange (150ms)
  - [ ] Clear button
  - [ ] Focus on mount

- [ ] Create ResultItem component (`components/ResultItem.tsx`)
  - [ ] Title + snippet
  - [ ] Source icon (Gmail/File)
  - [ ] Created date
  - [ ] Click to open

- [ ] Create ResultsList component (`components/ResultsList.tsx`)
  - [ ] Display search results
  - [ ] Virtualized list (if >100 results)
  - [ ] Loading state
  - [ ] Empty state

- [ ] Create custom search hook (`hooks/useSearch.ts`)
  - [ ] Debounce query
  - [ ] Call search API
  - [ ] Manage results state
  - [ ] Error handling

- [ ] Create search store (`store/searchStore.ts`)
  - [ ] Query string
  - [ ] Results
  - [ ] Loading state
  - [ ] Error state

- [ ] Create Search page (`pages/Search.tsx`)
  - [ ] SearchBox component
  - [ ] Filters panel
  - [ ] ResultsList component
  - [ ] Keyboard shortcuts (Cmd+K)

- [ ] Create Filters component (`components/Filters.tsx`)
  - [ ] Source filter (Gmail/Files/All)
  - [ ] Time range (7d/30d/365d/All)
  - [ ] Gmail labels (Inbox/Sent/etc)

### Frontend: Testing

- [ ] Component tests for SearchBox
  - [ ] Input accepts text
  - [ ] Debounce works
  - [ ] Clear button works

- [ ] Hook tests for useSearch
  - [ ] Calls API with debounce
  - [ ] Handles results
  - [ ] Handles errors

## M5: Open Source Reference + Privacy

### Backend: Open Source

- [ ] Implement Gmail opening (`api/gmail.rs`)
  - [ ] Generate Gmail thread URL
  - [ ] Return to frontend

- [ ] Implement file opening (`api/files.rs`)
  - [ ] Open file with default OS handler
  - [ ] Reveal file in explorer

### Backend: Privacy Controls

- [ ] Create GetIndexStatusUseCase (`application/use_cases/get_index_status.rs`)
  - [ ] Total indexed items
  - [ ] Gmail message count
  - [ ] File count
  - [ ] Last sync time
  - [ ] Sync errors

- [ ] Create DeleteIndexUseCase (`application/use_cases/delete_index.rs`)
  - [ ] Delete all indexed items
  - [ ] Delete all Gmail data
  - [ ] Delete all file data
  - [ ] Reset sync state
  - [ ] Confirm dialog

### Backend: Encryption (Optional MVP)

- [ ] Add database encryption layer
  - [ ] Encrypt index at rest
  - [ ] Key stored in keychain
  - [ ] Transparent to use cases

### Backend: Logging & Security

- [ ] Structured logging
  - [ ] Log search queries (anonymized)
  - [ ] Log sync events
  - [ ] Log errors
  - [ ] Never log: tokens, email bodies, file contents

- [ ] Remove sensitive data from errors
  - [ ] No tokens in error messages
  - [ ] No file paths exposed
  - [ ] No personal data leaked

### Frontend: Settings Page

- [ ] Create Settings page (`pages/Settings.tsx`)
  - [ ] Gmail connection status
  - [ ] Connected email address
  - [ ] "Disconnect Gmail" button
  - [ ] Selected folders list
  - [ ] "Sync now" button
  - [ ] Sync status/progress
  - [ ] "Delete all data" button
  - [ ] Last sync time
  - [ ] Storage size used

- [ ] Create indexing store (`store/indexingStore.ts`)
  - [ ] Is syncing
  - [ ] Items indexed
  - [ ] Current status message
  - [ ] Last error

- [ ] Create custom hook for indexing (`hooks/useIndexing.ts`)
  - [ ] Poll sync status
  - [ ] Emit progress events
  - [ ] Handle errors

- [ ] Create ProgressBar component (`components/ProgressBar.tsx`)
  - [ ] Shows sync progress
  - [ ] Current count
  - [ ] Pause button
  - [ ] Cancel button

### Frontend: Testing

- [ ] Component tests for Settings
  - [ ] Connection status displayed
  - [ ] Buttons are functional
  - [ ] Confirm dialogs work

## Quality Assurance

### Code Quality

- [ ] All files <250 lines
  - [ ] Run line counter script
  - [ ] Refactor if needed

- [ ] Format all code
  - [ ] `npm run format` passes
  - [ ] `cargo fmt` passes

- [ ] Lint all code
  - [ ] `npm run lint` passes (zero errors)
  - [ ] `cargo clippy` passes (zero warnings)

- [ ] Type check
  - [ ] `npm run type-check` passes
  - [ ] No any types
  - [ ] All implicit types explicit

### Testing Coverage

- [ ] Unit tests
  - [ ] Domain layer: 100% coverage
  - [ ] Application layer: >80% coverage
  - [ ] Infrastructure: >60% coverage

- [ ] Integration tests
  - [ ] Database operations
  - [ ] Gmail sync
  - [ ] File indexing

- [ ] End-to-end tests (manual)
  - [ ] Onboard new user (OAuth)
  - [ ] Index files
  - [ ] Search and open results
  - [ ] Disconnect Gmail
  - [ ] Delete index

### Performance

- [ ] Search latency
  - [ ] Database query: <50ms
  - [ ] Perceived time: <300ms (with UI render)
  - [ ] Test with 10k+ emails

- [ ] Indexing speed
  - [ ] First-time Gmail sync: <5 min for 1000 emails
  - [ ] Incremental sync: <10s
  - [ ] File indexing: <100ms per file

- [ ] Memory usage
  - [ ] UI: <100MB
  - [ ] Backend: <200MB at idle
  - [ ] No memory leaks (24-hour test)

- [ ] Build size
  - [ ] Final binary: <100MB (compressed)
  - [ ] Startup time: <3 seconds

### Documentation

- [ ] Code documentation
  - [ ] All public APIs have doc comments
  - [ ] Modules have README files
  - [ ] Inline comments for complex logic

- [ ] User documentation
  - [ ] Setup guide complete
  - [ ] Architecture guide updated
  - [ ] Troubleshooting guide created

## Deployment

### Pre-Release

- [ ] Security audit
  - [ ] No tokens in plaintext
  - [ ] No sensitive data logged
  - [ ] OAuth scopes minimal
  - [ ] File permissions correct

- [ ] Cross-platform testing
  - [ ] macOS 11+
  - [ ] Windows 10+
  - [ ] Linux (Ubuntu 20.04+)

- [ ] Build optimization
  - [ ] Release build size
  - [ ] Startup time
  - [ ] Memory usage

### Release Build

- [ ] Create DMG (macOS)
  - [ ] Signed bundle
  - [ ] Notarized for Gatekeeper

- [ ] Create MSI (Windows)
  - [ ] Installer works
  - [ ] Uninstaller works
  - [ ] Start menu entry

- [ ] Create tarball (Linux)
  - [ ] README with installation
  - [ ] Desktop entry file

## Post-Launch (Phase B)

- [ ] Analytics (privacy-respecting)
  - [ ] Feature usage (no PII)
  - [ ] Error tracking
  - [ ] Performance metrics

- [ ] Bug fixes & optimization
  - [ ] Address user feedback
  - [ ] Performance tuning
  - [ ] Security patches

- [ ] New integrations
  - [ ] Slack support
  - [ ] GitHub issues
  - [ ] Jira tickets

- [ ] Advanced features
  - [ ] Vector search / embeddings
  - [ ] LLM summaries
  - [ ] Thread stitching
  - [ ] Multi-account support

---

## Progress Tracking

- [ ] M1: **0%** (baseline)
- [ ] M2: **20%** (Gmail OAuth + indexing)
- [ ] M3: **40%** (File indexing)
- [ ] M4: **60%** (Search UI)
- [ ] M5: **80%** (Privacy controls)
- [ ] **100%** MVP complete

---

**Estimated Timeline**: 8-12 weeks for full MVP

**Current Status**: Foundation complete, ready to implement infrastructure

**Next Step**: Start M2 - Gmail OAuth (infrastructure/gmail/oauth_client.rs)