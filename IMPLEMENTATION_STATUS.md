# Implementation Status - Placeholder Code & Real-World Gaps

## ✅ Complete & Production-Ready
- [x] Rust backend architecture (3-layer Clean Architecture)
- [x] All 7 use cases fully implemented
- [x] SQLite FTS5 search indexing
- [x] Gmail OAuth2 integration skeleton
- [x] Tauri command handlers (8 commands)
- [x] React frontend components (Search, Status, Settings)
- [x] TypeScript type definitions
- [x] Custom React hooks

## ⚠️ Placeholder Code Requiring Real-World Implementation

### 1. Gmail OAuth2 Flow
- **Current**: Basic URL generation only
- **Need**: Complete OAuth flow with token exchange, token refresh, error handling
- **Files**: `src-tauri/src/application/use_cases/connect_gmail.rs`
- **Impact**: Gmail connection won't actually work

### 2. Gmail API Integration
- **Current**: Mock fetch_messages, no actual API calls
- **Need**: Real Google Gmail API v1 integration using google-api-rust-client
- **Files**: `src-tauri/src/infrastructure/gmail/`
- **Impact**: No actual emails will sync

### 3. File Folder Dialog
- **Current**: Placeholder alert() in frontend
- **Need**: Real Tauri file-dialog integration for folder selection
- **Files**: `src-ui/src/components/Settings.tsx` (handleIndexClick function)
- **Impact**: Users can't select folders to index

### 4. Keychain Token Storage
- **Current**: Stub KeychainManager (always succeeds)
- **Need**: Real OS keychain integration (Keyring crate for Linux/Windows, Security framework for macOS)
- **Files**: `src-tauri/src/infrastructure/keychain/`
- **Impact**: OAuth tokens not persisted securely

### 5. Email OAuth Redirect Handler
- **Current**: No actual OAuth callback handling
- **Need**: Local HTTP server to catch OAuth redirect, extract authorization code
- **Files**: `src-tauri/src/application/use_cases/connect_gmail.rs`
- **Impact**: OAuth flow can't complete

### 6. Frontend Folder Selection
- **Current**: Manual text input only
- **Need**: Real `@tauri-apps/plugin-dialog` folder picker
- **Impact**: UX is not user-friendly

### 7. Database Encryption
- **Current**: Plaintext SQLite (no encryption)
- **Need**: SQLCipher or native SQLite encryption for sensitive data
- **Impact**: Gmail tokens and emails stored unencrypted

### 8. Error Recovery & Retry Logic
- **Current**: Errors logged but not retried
- **Need**: Exponential backoff, network error handling, sync resume capability
- **Impact**: Transient failures cause complete sync failure

## Quick Priority List
1. **Critical**: Gmail OAuth token exchange (blocks login)
2. **Critical**: Real Gmail API integration (blocks sync)
3. **High**: Keychain implementation (security risk)
4. **High**: File dialog integration (UX blocker)
5. **Medium**: Email redirect handler (OAuth requirement)
6. **Medium**: Database encryption (security)
7. **Low**: Retry logic and error recovery

## Testing Status
- Backend: 83+ unit tests ✅
- Integration: None yet ⚠️
- Frontend: No tests yet (needs Jest/React Testing Library)
- E2E: Needs Tauri testing setup

## Known Limitations
- Single-account only (no multi-account support)
- No offline mode
- No incremental sync (full re-index each time)
- No background sync service
- Limited file type support (txt, md only by default)