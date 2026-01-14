# RecallDesk MVP

A desktop app that connects to Gmail and local files, builds a local encrypted search index, and provides an instant unified search experience with source references.

## Quick Start

### Prerequisites
- Rust 1.70+
- Node.js 18+
- macOS 11+ or Windows 10+

### Setup
```bash
# Install dependencies
npm install

# Run in development
npm run dev

# Build for production
npm run build
```

## Project Structure

```
RecallDesk/
├── docs/                 # Architecture & onboarding documentation
│   ├── architecture.md   # System design and layer breakdown
│   └── dev-setup.md      # Development environment setup
├── src-tauri/            # Rust backend (Tauri)
│   ├── src/
│   │   ├── domain/       # Core business logic (entities, interfaces)
│   │   ├── application/  # Use cases & orchestration
│   │   ├── infrastructure/ # DB, Gmail API, filesystem
│   │   └── main.rs
│   ├── Cargo.toml
│   └── README.md
├── src-ui/               # TypeScript/React frontend
│   ├── src/
│   │   ├── presentation/ # UI components & pages
│   │   ├── hooks/        # React hooks
│   │   └── App.tsx
│   ├── package.json
│   └── README.md
├── src-tauri-ui.conf.json # Tauri configuration
├── package.json          # Root workspace config
└── README.md
```

## Key Features (MVP)

- **F1**: Connect Gmail via OAuth 2.0
- **F2**: Select and index local folders
- **F3**: Local indexing + incremental sync (Gmail + files)
- **F4**: Unified search UI (<300ms perceived time)
- **F5**: Open source references (Gmail thread / local file)
- **F6**: Privacy controls (encrypt index, disconnect Gmail)

## Architecture Highlights

- **Clean Architecture**: Domain → Application → Infrastructure → Presentation
- **Local-First**: No cloud uploads, encrypted local index
- **Type-Safe**: Rust backend + TypeScript frontend
- **Testable**: Business logic behind interfaces, mockable dependencies
- **Modular**: Max 250 lines per file, single responsibility per module

## Development

See [docs/dev-setup.md](docs/dev-setup.md) for detailed setup instructions.

See [docs/architecture.md](docs/architecture.md) for system design.

## Privacy & Security

- OAuth tokens stored in OS keychain (secure storage)
- Local index encrypted at rest
- No plaintext secrets in logs
- All indexing happens locally—zero cloud uploads

## Non-Goals (Out of Scope)

- Slack/GitHub/Teams/Jira integrations
- Cloud sync
- Team accounts / multi-user
- AI Q&A / LLM / RAG
- Mobile app
- Embeddings / vector search

## Success Metrics

- Time to first search after onboarding: <5 minutes
- Search latency (perceived): <300ms
- Zero trust-breaking events (no leaks, no uploads)
- Handle 10k+ emails without crashes