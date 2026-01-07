# Code Generation Module Documentation

## Overview

The `code-generation/` module is a comprehensive Zero-to-One code generation pipeline for Flutter UI applications. It transforms user prompts into complete, production-ready Flutter applications while maintaining architectural consistency and quality standards.

## Architecture Philosophy

### Scaffold-Based Approach
The module uses a **scaffold-based generation strategy** that separates infrastructure from creative work:

- **Governed Infrastructure**: Base files (pubspec.yaml, main.dart, app.dart, app_router.dart) are injected by the system
- **Creative Work**: AI focuses solely on creating screens and widgets
- **Consistency**: Eliminates variance in base files and reduces LLM hallucination
- **Quality**: Ensures consistent project structure across all generated apps

### Pluggable AI Provider Architecture
The system supports multiple AI providers through a unified interface:
- OpenRouter (primary)
- Google Gemini (with built-in rate limiting)
- Easy to extend for new providers

## Directory Structure

```
code-generation/
├── index.ts                    # Main entry point and public API
├── models/                     # Data models and types
├── repositories/              # Database access layer
├── services/                  # Business logic and services
└── test-response-parser.ts    # Test utilities
```

## Core Components

### 1. Main Entry Point (`index.ts`)
**Responsibility**: Public API surface and convenience functions

**Why it exists**: Provides a clean, unified interface for external modules to interact with the code generation pipeline without needing to understand internal structure.

**Key Functions**:
- `executeZeroToOneGeneration()` - Main pipeline entry point
- `testAIProviderConnection()` - Health check for AI services
- `getGenerationConfig()` - Configuration inspection

---

### 2. Models (`models/`)

#### `generation-contract.ts`
**Responsibility**: Defines preconditions, requirements, and validation rules for generation

**Why it exists**: Ensures generation only proceeds when all prerequisites are met and validates results against expected criteria.

**Key Concepts**:
- Preconditions (mode validation, artifact checks)
- Generation requirements (category, complexity)
- Post-generation validations (file count, structure)

#### `generated-artifact.ts`
**Responsibility**: Models individual generated files and their metadata

**Why it exists**: Provides a structured way to track, store, and manage generated code files with full metadata.

**Key Features**:
- File type classification (dart, yaml, etc.)
- Storage path generation
- Entry point detection
- Database mapping

#### `generation-result.ts`
**Responsibility**: Models the complete generation session result and streaming events

**Why it exists**: Captures the entire generation outcome including success/failure state, metadata, and real-time streaming events.

**Key Features**:
- Generation status tracking
- Streaming event types (tokens, files, errors)
- Validation error collection
- Session persistence

#### `models/index.ts`
**Responsibility**: Centralized export of all models

**Why it exists**: Provides clean imports and hides internal model organization.

---

### 3. Repositories (`repositories/`)

#### `artifact-repository.ts`
**Responsibility**: Database persistence for generated artifact metadata

**Why it exists**: Separates data access logic from business logic and provides a clean interface for artifact CRUD operations.

**Key Features**:
- CRUD operations for artifacts
- Batch operations for atomic generation
- Query by project, identity, or architecture
- Aggregate operations (size, distribution)

---

### 4. Services (`services/`)

#### Core Orchestration

##### `code-generator-service.ts`
**Responsibility**: Main orchestrator for the entire generation pipeline

**Why it exists**: Coordinates all services, enforces the scaffold-based approach, and manages the complete generation workflow.

**Key Responsibilities**:
- Validates preconditions
- Creates Project Identity and Architecture Plan if needed
- Orchestrates AI generation
- Manages file upload and artifact creation
- Handles retries and error recovery

#### AI Provider Layer

##### `ai-provider-interface.ts`
**Responsibility**: Abstract interface for all AI providers

**Why it exists**: Enables pluggable architecture allowing easy switching between AI services without changing core logic.

##### `ai-provider-factory.ts`
**Responsibility**: Factory for creating and managing AI providers

**Why it exists**: Handles provider selection, configuration, and fallback logic in a centralized location.

##### `openrouter-client.ts`
**Responsibility**: Direct OpenRouter API client

**Why it exists**: Provides low-level access to OpenRouter API with streaming, retry logic, and error handling.

##### `openrouter-adapter.ts`
**Responsibility**: Adapter wrapping OpenRouter client to implement AIProvider interface

**Why it exists**: Bridges the existing OpenRouter client to the pluggable provider architecture.

##### `gemini-client.ts`
**Responsibility**: Google Gemini AI client with rate limiting

**Why it exists**: Provides alternative AI provider with built-in rate limiting for free tier usage.

#### Prompt Engineering

##### `prompt-assembler.ts`
**Responsibility**: Constructs AI prompts from project identity and architecture

**Why it exists**: Ensures consistent, high-quality prompts that incorporate project context and architectural constraints.

**Key Features**:
- Scaffold-based authority (LLM doesn't create base files)
- Platform and design system constraints
- Architecture-specific instructions
- Token count estimation and truncation

#### Response Processing

##### `response-parser.ts`
**Responsibility**: Parses and validates AI-generated code responses

**Why it exists**: Extracts structured code from AI responses and validates against architectural requirements.

**Key Features**:
- Multi-format parsing (delimiters, markdown)
- File extraction and validation
- Router addition parsing
- Cross-file dependency checking

##### `streaming-parser.ts`
**Responsibility**: Real-time parsing of AI streaming responses

**Why it exists**: Enables Lovable-style UI experience with real-time narration, file appearance, and code streaming.

**Key Features**:
- State machine-based parsing
- Event-driven architecture
- Narration, plan, and code detection

#### Infrastructure Management

##### `base-structure-template.ts`
**Responsibility**: Single source of truth for Flutter project structure

**Why it exists**: Enforces consistent project structure and provides templates for mandatory files.

**Key Features**:
- Mandatory file definitions
- Folder conventions
- Output format instructions
- Architecture principles

##### `scaffold-injector.ts`
**Responsibility**: Injects and manages base Flutter project scaffold

**Why it exists**: Provides governed infrastructure files that the LLM operates within, not creates.

**Key Features**:
- File governance tiers (locked, restricted, additive)
- Template generation
- Router addition merging
- App name/title derivation

#### Storage and Communication

##### `storage-service.ts`
**Responsibility**: File upload and management in Supabase Storage

**Why it exists**: Handles persistent storage of generated files with batch operations and signed URLs.

**Key Features**:
- Individual and batch uploads
- File download and deletion
- Signed URL generation
- Error handling

##### `websocket-service.ts`
**Responsibility**: Real-time WebSocket communication for streaming generation

**Why it exists**: Provides bidirectional communication between frontend and backend for real-time generation updates.

**Key Features**:
- Generation start/cancel
- Real-time streaming
- Session management
- Error handling

#### Utilities

##### `rate-limiter.ts`
**Responsibility**: Rate limiting for AI API requests

**Why it exists**: Prevents API quota exhaustion and implements token bucket algorithm for fair usage.

**Key Features**:
- Token bucket algorithm
- Per-minute and per-day limits
- Burst allowance
- In-memory storage

---

### 5. Testing (`test-response-parser.ts`)
**Responsibility**: Test utilities for response parser validation

**Why it exists**: Ensures the response parser correctly validates minimum screen requirements and architectural compliance.

## Data Flow

### Generation Pipeline
1. **Precondition Validation** - Check mode, existing artifacts
2. **Identity Creation** - Create Project Identity if needed
3. **Architecture Generation** - Create Architecture Plan if needed
4. **Scaffold Injection** - Generate base infrastructure files
5. **Prompt Assembly** - Construct AI prompt with context
6. **AI Generation** - Generate code via selected AI provider
7. **Response Parsing** - Extract and validate generated code
8. **File Upload** - Store files in Supabase Storage
9. **Artifact Creation** - Save metadata to database
10. **Mode Locking** - Lock project to ONE_TO_N mode

### Streaming Flow
1. **WebSocket Connection** - Establish real-time communication
2. **Generation Start** - Begin AI generation with streaming
3. **Real-time Parsing** - Parse chunks as they arrive
4. **Event Emission** - Send narration, file, and code events
5. **UI Updates** - Frontend updates in real-time

## Key Design Principles

### 1. Separation of Concerns
- Models define data structures
- Repositories handle data access
- Services contain business logic
- Each service has a single responsibility

### 2. Pluggable Architecture
- AI providers are interchangeable
- Easy to add new providers
- Consistent interface across providers

### 3. Scaffold-Based Generation
- Infrastructure is governed, not generated
- AI focuses on creative work
- Consistent project structure

### 4. Real-Time Experience
- Streaming generation
- Progress updates
- Error handling

### 5. Robust Error Handling
- Retry logic with exponential backoff
- Graceful degradation
- Comprehensive error reporting

## Configuration

### Environment Variables
- `VITE_SUPABASE_URL` - Supabase project URL
- `SUPABASE_SERVICE_ROLE_KEY` - Supabase service role key
- `VITE_SUPABASE_ANON_KEY` - Supabase anonymous key

### AI Provider Configuration
- OpenRouter API key and model selection
- Gemini API key and model selection
- Rate limiting parameters

## Usage Examples

### Basic Generation
```typescript
import { executeZeroToOneGeneration } from './code-generation';

const result = await executeZeroToOneGeneration({
  project_state_id: 'uuid',
  user_prompt: 'Build a todo app',
});
```

### With Callbacks
```typescript
const result = await executeZeroToOneGeneration(input, {
  onStatusChange: (status, message) => console.log(status, message),
  onToken: (token, accumulated) => console.log('Token:', token),
  onFileStart: (path, index, total) => console.log('Starting:', path),
  onComplete: (result) => console.log('Done:', result),
});
```

## Testing

The module includes comprehensive testing for:
- Response parsing validation
- Minimum screen requirements
- Architecture compliance
- Error scenarios

## Future Extensibility

### Adding New AI Providers
1. Implement `AIProvider` interface
2. Add to `AIProviderFactory`
3. Configure in environment

### Supporting New Frameworks
1. Update `base-structure-template.ts`
2. Modify `scaffold-injector.ts`
3. Adjust prompt templates

### Enhanced Validation
1. Add new validation rules to `response-parser.ts`
2. Update `generation-contract.ts`
3. Extend test coverage

## Conclusion

The code-generation module provides a robust, scalable, and maintainable foundation for AI-powered code generation. Its scaffold-based approach ensures consistency while its pluggable architecture enables flexibility. The real-time streaming capabilities and comprehensive error handling make it suitable for production use in generating Flutter applications.
