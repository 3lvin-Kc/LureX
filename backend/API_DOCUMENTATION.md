# Code Generation API Documentation

## Overview

This document describes the REST API endpoints for the Zero-to-One Code Generation Pipeline. The API enables generating complete Flutter applications from natural language prompts.

## Base URL

```
http://localhost:3000/api
```

## Authentication

All endpoints (except `/api/health`) require a Bearer token in the Authorization header:

```
Authorization: Bearer <token>
```

## Endpoints

### Health & Configuration

#### GET /api/health

Check server health status.

**Response:**
```json
{
  "status": "OK",
  "timestamp": "2025-01-15T10:30:00.000Z",
  "services": {
    "projectState": "available",
    "codeGeneration": "available",
    "storage": "available"
  }
}
```

#### GET /api/generate/config

Get current code generation configuration.

**Response:**
```json
{
  "config": {
    "model": "anthropic/claude-3.5-sonnet",
    "maxTokens": 8000,
    "maxRetries": 2,
    "hasApiKey": true
  },
  "storage": {
    "bucket": "generated-projects"
  }
}
```

#### POST /api/generate/test-connection

Test OpenRouter API connectivity.

**Response:**
```json
{
  "success": true,
  "message": "Connected successfully. Response: OK",
  "model": "anthropic/claude-3.5-sonnet"
}
```

---

### Project State Management

#### GET /api/project-state

Get default project state.

**Response:**
```json
{
  "projectState": {
    "project_id": null,
    "artifact_count": 0,
    "has_config": false,
    "architecture_decisions_recorded": false,
    "architecture_plan_established": false,
    "mode_locked": "ZERO_TO_ONE",
    "created_at": "2025-01-15T10:30:00.000Z",
    "updated_at": "2025-01-15T10:30:00.000Z"
  }
}
```

#### GET /api/project-state/:projectId

Get project state by ID (supports both database row ID and project_id).

**Parameters:**
- `projectId` (path) - The project state ID or project_id

**Response:**
```json
{
  "projectState": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "project_id": null,
    "identity_id": "660e8400-e29b-41d4-a716-446655440001",
    "artifact_count": 5,
    "has_config": false,
    "architecture_decisions_recorded": true,
    "architecture_plan_established": true,
    "mode_locked": "ONE_TO_N",
    "created_at": "2025-01-15T10:30:00.000Z",
    "updated_at": "2025-01-15T10:35:00.000Z"
  }
}
```

#### POST /api/project-state/new

Create a new project for Zero-to-One code generation.

**Response (201 Created):**
```json
{
  "projectState": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "project_id": null,
    "identity_id": null,
    "artifact_count": 0,
    "has_config": false,
    "architecture_decisions_recorded": false,
    "architecture_plan_established": false,
    "mode_locked": "ZERO_TO_ONE",
    "created_at": "2025-01-15T10:30:00.000Z",
    "updated_at": "2025-01-15T10:30:00.000Z"
  }
}
```

#### PUT /api/project-state/:projectId

Update project state.

**Parameters:**
- `projectId` (path) - The project state ID

**Request Body:**
```json
{
  "artifact_count": 5,
  "has_config": true,
  "architecture_decisions_recorded": true
}
```

**Response:**
```json
{
  "projectState": { ... }
}
```

#### POST /api/project-state/gatekeep

Execute gatekeeping logic to determine if an action is allowed.

**Request Body:**
```json
{
  "projectId": "550e8400-e29b-41d4-a716-446655440000",
  "userInput": "Add a settings page",
  "isZeroToOneRequest": false
}
```

**Response:**
```json
{
  "mode": "ONE_TO_N",
  "allowed": true,
  "reason": "Project has existing artifacts",
  "projectState": { ... }
}
```

---

### Code Generation

#### POST /api/generate

Start the Zero-to-One code generation pipeline.

**Request Body:**
```json
{
  "project_state_id": "550e8400-e29b-41d4-a716-446655440000",
  "user_prompt": "Create a simple Flutter counter app with increment and decrement buttons"
}
```

**Response (202 Accepted):**
```json
{
  "sessionId": "gen_1705315800123_abc123xyz",
  "status": "pending",
  "message": "Generation started. Poll /api/generate/:sessionId/status for updates.",
  "projectStateId": "550e8400-e29b-41d4-a716-446655440000"
}
```

**Error Responses:**

- `400 Bad Request` - Missing required fields or invalid project state
- `404 Not Found` - Project state not found

```json
{
  "error": "Project is not in ZERO_TO_ONE mode",
  "currentMode": "ONE_TO_N",
  "hint": "This endpoint is only for initial code generation. Use modification endpoints for existing projects."
}
```

#### GET /api/generate/:sessionId/status

Poll the status of a generation session.

**Parameters:**
- `sessionId` (path) - The generation session ID

**Response:**
```json
{
  "sessionId": "gen_1705315800123_abc123xyz",
  "projectStateId": "550e8400-e29b-41d4-a716-446655440000",
  "status": "generating",
  "message": "Generating code...",
  "progress": 30,
  "startedAt": "2025-01-15T10:30:00.000Z",
  "completedAt": null,
  "error": null,
  "filesGenerated": null,
  "result": null
}
```

**Status Values:**
- `pending` - Generation queued
- `generating` - AI is generating code
- `validating` - Validating generated code
- `uploading` - Uploading files to storage
- `completed` - Successfully completed
- `failed` - Generation failed
- `retrying` - Retrying after failure

**Completed Response:**
```json
{
  "sessionId": "gen_1705315800123_abc123xyz",
  "projectStateId": "550e8400-e29b-41d4-a716-446655440000",
  "status": "completed",
  "message": "Successfully generated 5 files",
  "progress": 100,
  "startedAt": "2025-01-15T10:30:00.000Z",
  "completedAt": "2025-01-15T10:31:30.000Z",
  "filesGenerated": 5,
  "result": {
    "success": true,
    "files_count": 5,
    "artifacts": [...],
    "metadata": {
      "model_used": "anthropic/claude-3.5-sonnet",
      "tokens_prompt": 2500,
      "tokens_completion": 4500,
      "tokens_total": 7000,
      "generation_time_ms": 45000,
      "total_time_ms": 90000,
      "attempt_number": 1,
      "max_attempts": 3
    }
  }
}
```

---

### Artifacts

#### GET /api/artifacts/:projectStateId

Get all generated artifacts for a project.

**Parameters:**
- `projectStateId` (path) - The project state ID

**Response:**
```json
{
  "projectStateId": "550e8400-e29b-41d4-a716-446655440000",
  "artifactCount": 5,
  "artifacts": [
    {
      "id": "770e8400-e29b-41d4-a716-446655440001",
      "project_state_id": "550e8400-e29b-41d4-a716-446655440000",
      "identity_id": "660e8400-e29b-41d4-a716-446655440001",
      "architecture_plan_id": "880e8400-e29b-41d4-a716-446655440002",
      "file_path": "lib/main.dart",
      "file_name": "main.dart",
      "storage_path": "projects/550e8400-e29b-41d4-a716-446655440000/lib/main.dart",
      "file_type": "dart",
      "file_size_bytes": 1234,
      "is_entry_point": true,
      "generation_order": 0,
      "created_at": "2025-01-15T10:31:30.000Z"
    },
    {
      "id": "770e8400-e29b-41d4-a716-446655440002",
      "file_path": "lib/screens/home_screen.dart",
      "file_name": "home_screen.dart",
      "file_type": "dart",
      "file_size_bytes": 2345,
      "is_entry_point": false,
      "generation_order": 1,
      ...
    }
  ]
}
```

#### GET /api/artifacts/:projectStateId/:filePath

Get the content of a specific generated file.

**Parameters:**
- `projectStateId` (path) - The project state ID
- `filePath` (path) - The file path (e.g., `lib/main.dart`)

**Example:**
```
GET /api/artifacts/550e8400-e29b-41d4-a716-446655440000/lib/main.dart
```

**Response:**
```json
{
  "filePath": "lib/main.dart",
  "fileName": "main.dart",
  "content": "import 'package:flutter/material.dart';\n\nvoid main() {\n  runApp(const MyApp());\n}\n...",
  "size": 1234,
  "mimeType": "text/x-dart",
  "isEntryPoint": true
}
```

#### DELETE /api/artifacts/:projectStateId

Delete all artifacts for a project (allows regeneration).

**Parameters:**
- `projectStateId` (path) - The project state ID

**Response:**
```json
{
  "success": true,
  "message": "Artifacts deleted successfully",
  "filesDeleted": 5,
  "artifactsDeleted": 5
}
```

---

### Sessions (Debug)

#### GET /api/sessions

Get all active generation sessions (for debugging).

**Response:**
```json
{
  "activeSessionCount": 2,
  "sessions": [
    {
      "sessionId": "gen_1705315800123_abc123xyz",
      "projectStateId": "550e8400-e29b-41d4-a716-446655440000",
      "status": "generating",
      "progress": 45,
      "startedAt": "2025-01-15T10:30:00.000Z",
      "completedAt": null
    }
  ]
}
```

---

## Complete Workflow Example

### 1. Create a new project

```bash
curl -X POST http://localhost:3000/api/project-state/new \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json"
```

### 2. Start code generation

```bash
curl -X POST http://localhost:3000/api/generate \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "project_state_id": "<id-from-step-1>",
    "user_prompt": "Create a todo app with ability to add, complete, and delete tasks"
  }'
```

### 3. Poll for status

```bash
curl http://localhost:3000/api/generate/<session-id>/status \
  -H "Authorization: Bearer <token>"
```

### 4. Get generated artifacts

```bash
curl http://localhost:3000/api/artifacts/<project-state-id> \
  -H "Authorization: Bearer <token>"
```

### 5. Get specific file content

```bash
curl http://localhost:3000/api/artifacts/<project-state-id>/lib/main.dart \
  -H "Authorization: Bearer <token>"
```

---

## Environment Variables

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `PORT` | No | 3000 | Server port |
| `OPENROUTER_API_KEY` | Yes | - | OpenRouter API key for AI generation |
| `OPENROUTER_MODEL` | No | anthropic/claude-3.5-sonnet | AI model to use |
| `OPENROUTER_MAX_TOKENS` | No | 8000 | Maximum tokens for generation |
| `VITE_SUPABASE_URL` | Yes | - | Supabase project URL |
| `VITE_SUPABASE_ANON_KEY` | Yes | - | Supabase anon key |
| `SUPABASE_SERVICE_ROLE_KEY` | Recommended | - | Supabase service role key (bypasses RLS) |

---

## Error Codes

| Status Code | Description |
|-------------|-------------|
| 200 | Success |
| 201 | Created |
| 202 | Accepted (async operation started) |
| 400 | Bad Request - Invalid input |
| 401 | Unauthorized - Missing or invalid token |
| 404 | Not Found - Resource doesn't exist |
| 500 | Internal Server Error |

---

## Rate Limiting

Currently no rate limiting is implemented. For production use, consider adding rate limiting middleware.

---

## WebSocket / SSE (Future)

Streaming generation updates via Server-Sent Events (SSE) is planned for future implementation. Currently, use polling via `GET /api/generate/:sessionId/status`.