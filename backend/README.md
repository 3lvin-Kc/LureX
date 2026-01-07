# Backend Implementation: Zero-to-One Code Generation Pipeline

This directory contains the complete backend implementation for the Zero-to-One Code Generation Pipeline, including mode detection, project state management, and AI-powered Flutter code generation.

## Quick Start

```bash
# Install dependencies
npm install

# Set up environment variables
cp .env.example .env
# Edit .env with your API keys

# Start development server
npm run dev

# Run quick connectivity test
npm run test:quick

# Run full integration test
npm run test
```

## Architecture Overview

```
backend/
├── server.ts                      # Express server with all API endpoints
├── index.ts                       # Main entry point and exports
├── types.ts                       # Shared type definitions
│
├── project-state/                 # Project state management
│   ├── model.ts                  # Project state data model
│   ├── repository.ts             # Database operations (Supabase)
│   ├── project-state-service.ts  # Main service orchestrator
│   ├── mode-detector.ts          # Atomic mode detection logic
│   ├── mode-transition-manager.ts # Mode transition logic
│   ├── mode-gatekeeper.ts        # Gatekeeper layer
│   └── zero-to-one-intent-classifier.ts # Intent classification
│
├── project-identity/              # Project identity management
│   ├── model.ts                  # Identity data model (immutable)
│   ├── repository.ts             # Database operations
│   └── project-identity-service.ts # Identity service
│
├── architecture/                  # Architecture plan management
│   ├── model.ts                  # Architecture plan data model
│   ├── repository.ts             # Database operations
│   ├── architecture-service.ts   # Architecture service
│   └── engine.ts                 # Architecture decision engine
│
├── code-generation/               # AI code generation pipeline
│   ├── index.ts                  # Module exports
│   ├── models/                   # Data models
│   │   ├── generated-artifact.ts # Artifact metadata model
│   │   ├── generation-contract.ts # Generation preconditions
│   │   └── generation-result.ts  # Pipeline result model
│   ├── repositories/
│   │   └── artifact-repository.ts # Artifact database operations
│   └── services/
│       ├── code-generator-service.ts # Main orchestrator
│       ├── openrouter-client.ts     # AI API client (streaming)
│       ├── prompt-assembler.ts      # Prompt construction
│       ├── response-parser.ts       # AI response parsing
│       └── storage-service.ts       # Supabase Storage operations
│
└── test-*.ts                      # Integration test scripts
```

## Key Features

### 1. Zero-to-One Mode Detection
- **Atomic Detection**: Pure function based only on hard backend state
- **Fail-safe**: Defaults to ONE_TO_N when artifacts exist
- **Irreversible**: Once artifacts are created, mode cannot revert

### 2. Project Identity (Immutable)
- Created from initial user prompt
- Defines project purpose, scope, and constraints
- Never modified after creation

### 3. Architecture Plan (Immutable)
- Generated from project identity
- Defines file structure, naming conventions, patterns
- Guides AI code generation

### 4. AI Code Generation Pipeline
- Uses OpenRouter API with streaming support
- Assembles context-rich prompts
- Validates and parses AI responses
- Uploads files to Supabase Storage
- Creates artifact metadata records
- Automatic retry with exponential backoff

## API Endpoints

See [API_DOCUMENTATION.md](./API_DOCUMENTATION.md) for complete API reference.

### Key Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/health` | Health check |
| POST | `/api/project-state/new` | Create new project |
| GET | `/api/project-state/:id` | Get project state |
| POST | `/api/generate` | Start code generation |
| GET | `/api/generate/:sessionId/status` | Poll generation status |
| GET | `/api/artifacts/:projectId` | Get generated artifacts |
| GET | `/api/artifacts/:projectId/:path` | Get file content |
| DELETE | `/api/artifacts/:projectId` | Delete artifacts (reset) |

## Environment Variables

Create a `.env` file with:

```env
# Server
PORT=3000

# Supabase
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key  # Recommended

# OpenRouter (AI)
OPENROUTER_API_KEY=your-openrouter-key
OPENROUTER_MODEL=anthropic/claude-3.5-sonnet     # Optional
OPENROUTER_MAX_TOKENS=8000                        # Optional
```

## Database Migrations

Migrations are in `../supabase/migrations/`:

1. `20251229162313_project_states_table.sql` - Project states table
2. `20241231000002_create_project_identities_table.sql` - Project identities
3. `20241231000003_create_architecture_plans_table.sql` - Architecture plans
4. `20241231000004_add_foreign_key_constraints.sql` - FK constraints
5. `20250101000001_add_identity_id_and_artifacts.sql` - Artifacts & storage

Apply migrations via Supabase CLI or dashboard.

## Generation Flow

```
┌─────────────────────────────────────────────────────────────────┐
│                    POST /api/generate                           │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  1. Validate Preconditions                                      │
│     ├─ Project exists                                           │
│     ├─ Mode is ZERO_TO_ONE                                      │
│     └─ No existing artifacts                                    │
│                                                                 │
│  2. Create Project Identity (if needed)                         │
│     └─ Extract purpose from user prompt                         │
│                                                                 │
│  3. Generate Architecture Plan (if needed)                      │
│     └─ Based on identity constraints                            │
│                                                                 │
│  4. Assemble AI Prompt                                          │
│     ├─ Identity context                                         │
│     ├─ Architecture guidelines                                  │
│     └─ User request                                             │
│                                                                 │
│  5. Generate Code (OpenRouter)                                  │
│     ├─ Streaming response                                       │
│     └─ Retry on failure (max 2)                                 │
│                                                                 │
│  6. Parse & Validate Response                                   │
│     ├─ Extract JSON files array                                 │
│     ├─ Validate Dart syntax                                     │
│     └─ Check entry point exists                                 │
│                                                                 │
│  7. Upload to Storage                                           │
│     ├─ Atomic (all or nothing)                                  │
│     └─ Rollback on failure                                      │
│                                                                 │
│  8. Create Artifact Records                                     │
│     └─ Link to project, identity, architecture                  │
│                                                                 │
│  9. Transition Mode to ONE_TO_N                                 │
│     └─ Lock mode permanently                                    │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

## Testing

```bash
# Quick connectivity test
npm run test:quick

# Full integration test (requires API keys)
npm run test

# Full test with cleanup
npm run test:full

# Database validation
npm run test:db

# Identity creation test
npm run test:identity
```

## Error Handling

The pipeline includes comprehensive error handling:

- **Validation errors**: Returned immediately with helpful hints
- **Generation errors**: Automatic retry with exponential backoff
- **Upload errors**: Atomic rollback of all uploaded files
- **Database errors**: Detailed error messages in development

## Security Considerations

1. **Service Role Key**: Use `SUPABASE_SERVICE_ROLE_KEY` for backend operations to bypass RLS
2. **API Key Protection**: Never expose `OPENROUTER_API_KEY` to frontend
3. **Authentication**: All endpoints require Bearer token
4. **File Validation**: AI responses are validated before storage

## Development

```bash
# Start with hot reload
npm run dev

# Build TypeScript
npm run build

# Check project state
npm run check-state
```

## Troubleshooting

### "OpenRouter API key not configured"
Set `OPENROUTER_API_KEY` environment variable and restart server.

### "Failed to create project state: FK violation"
Run database migrations. The `project_identities` table must exist.

### "Generation timeout"
Increase timeout or reduce prompt complexity. Default is 5 minutes.

### "No entry point file found"
The AI response didn't include `lib/main.dart`. This triggers a retry.

## Future Enhancements

- [ ] SSE/WebSocket for real-time streaming updates
- [ ] File editing in ONE_TO_N mode
- [ ] Project export as ZIP
- [ ] Multiple AI model support
- [ ] Generation history and versioning