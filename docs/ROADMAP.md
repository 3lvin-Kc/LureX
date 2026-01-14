# RecallDesk Development Roadmap

## Overview
RecallDesk is a desktop application that indexes and searches across Gmail messages and local files. This document outlines what's been completed in v1, what remains to be done, and the plans for v2 and v3.

---

## Version 1.0 - Foundation (Current)

### Completed Features

#### Backend (Rust/Tauri)
- **Gmail Integration**
  - OAuth2 authentication flow
  - Email fetching and parsing
  - Message indexing with full-text search
  - Sync management with state tracking
  - Token refresh and error handling

- **Local File System**
  - Folder recursion and file discovery
  - Text extraction from 25+ file formats (txt, md, json, csv, xml, yaml, pdf, docx, and more)
  - PDF text extraction using pdfium-render
  - DOCX text extraction using ZIP + XML parsing
  - File metadata extraction (size, modified date, type)
  - Concurrent indexing with error recovery
  - File watcher for real-time monitoring

- **Database & Search**
  - SQLite with FTS5 full-text search
  - Indexed storage for Gmail messages and files
  - Search filtering by source type (gmail/file)
  - Rank scoring for relevance
  - Sync state tracking

- **API & Commands**
  - Health check endpoint
  - Search command with filters
  - Gmail connect/disconnect/sync commands
  - File indexing command
  - Status retrieval command
  - Index deletion command

#### Frontend (React/TypeScript)
- **User Interface**
  - Search page with results display
  - Status page showing indexing statistics
  - Settings page for configuration
  - Gmail connection management
  - File folder selection and indexing
  - Result preview modal

- **File System Service**
  - Tauri folder selection dialog
  - File opening in default applications
  - Path validation and sanitization
  - File type detection and labeling
  - Emoji icons for different file types
  - Human-readable file size formatting
  - Relative date formatting
  - Path deduplication and filtering

- **Core Functionality**
  - Search across all indexed content
  - Sort results by date
  - Copy search snippets
  - Open files/folders
  - Manage indexed folders
  - View sync status
  - Dark theme support

### Testing
- 35+ backend integration tests for file system operations
- 50+ frontend unit tests for FileSystemService
- Test coverage for all file types and edge cases
- Unicode, large files, and special character handling

### Known Limitations
- No Gmail message preview/reading
- No file content preview in search results
- Single-device sync only
- No collaborative features
- Local SQLite database only

---

## What Remains for v1.0 (Polish & Release)

### High Priority
- Performance optimization for large indexes (1000+ files)
- Memory usage optimization during indexing
- Tauri bundle configuration for installers
- Application icon and branding
- Error recovery in Gmail sync
- UI responsiveness improvements

### Medium Priority
- Keyboard shortcuts documentation
- Accessibility improvements (ARIA labels)
- Loading progress indicators
- Cancel indexing operation
- Batch operations for folder management
- Notification system polish

### Low Priority
- Theming customization options
- Export search results
- Custom field mapping
- Advanced search syntax

---

## Version 2.0 - Enhanced Experience (Planned)

### Feature Enhancements

#### Backend
- **Advanced File Support**
  - Excel file extraction (xlsx, xls)
  - PowerPoint extraction (pptx, ppt)
  - Image OCR (extract text from images)
  - Email attachment indexing
  - Code syntax highlighting metadata

- **Search Improvements**
  - Advanced query syntax (AND, OR, NOT, phrases)
  - Fuzzy search capabilities
  - Search history and saved searches
  - Custom ranking algorithms
  - Search result deduplication

- **Performance**
  - Incremental indexing (only new/modified files)
  - Index compression and optimization
  - Parallel processing for multiple folders
  - Caching layer for frequent searches
  - Background sync without blocking UI

- **Database**
  - Migration tools for schema updates
  - Backup and restore functionality
  - Index rebuilding utilities
  - Database size management

#### Frontend
- **User Interface**
  - File content preview pane
  - Email message preview and reading
  - Advanced search filters UI
  - Search history dropdown
  - Quick actions menu
  - Customizable column layout

- **File Management**
  - Batch folder operations
  - Scheduled automatic indexing
  - Exclude patterns (ignore folders)
  - File type filtering in settings
  - Index statistics dashboard

- **Improvements**
  - Real-time sync status updates
  - Search result highlighting
  - Breadcrumb navigation
  - Keyboard shortcut help
  - Improved error messages

### Infrastructure
- Cloud backup integration (optional)
- Settings export/import
- Plugin system foundation
- Telemetry (opt-in)

---

## Version 3.0 - Multi-Device & Collaboration (Planned)

### Major Features

#### Backend
- **Cloud Synchronization**
  - Multi-device sync with conflict resolution
  - Cloud storage for index backups
  - End-to-end encryption for sensitive data
  - Incremental sync for efficiency

- **Advanced Features**
  - Email thread grouping in search
  - Calendar event indexing
  - Contact management
  - Tag and label system
  - Custom metadata extraction

- **API**
  - REST API for external integrations
  - Webhook support
  - Third-party tool integration (Notion, Evernote)
  - Export to standard formats (JSON, CSV)

#### Frontend
- **Collaboration Features**
  - Shared search results
  - Team workspaces
  - Comments and annotations
  - Activity timeline
  - Permission management

- **Mobile Support**
  - Mobile-responsive design
  - Tablet optimizations
  - Touch gestures
  - Mobile app consideration

- **Advanced UI**
  - Graph/timeline visualization
  - Search analytics dashboard
  - Custom reports
  - Dark/Light theme with sync
  - Customizable layouts

#### Infrastructure
- **Enterprise Features**
  - User authentication and roles
  - Audit logging
  - Data retention policies
  - Admin dashboard
  - LDAP/SSO integration

---

## Technical Debt & Maintenance

### Ongoing for All Versions
- Security updates and patches
- Dependency updates
- Performance monitoring
- Bug fixes
- Documentation updates
- Test coverage expansion

### Known Issues to Address
- PDF extraction performance on large files
- DOCX XML parsing reliability
- Gmail sync rate limiting
- Database locking issues
- Memory leaks in long-running processes

---

## Success Metrics for Each Version

### v1.0 Success
- ✓ Can index 500+ files successfully
- ✓ Search responds in under 1 second
- ✓ Gmail sync completes in under 2 minutes
- ✓ No data loss during operations
- ✓ Handles common file types correctly

### v2.0 Success
- ✓ Can index 5000+ files efficiently
- ✓ Advanced search syntax works
- ✓ Incremental indexing reduces sync time by 80%
- ✓ Email preview improves usability
- ✓ Additional file formats supported

### v3.0 Success
- ✓ Multi-device sync reliable
- ✓ Cloud backup secure
- ✓ Collaborative features adopted
- ✓ Enterprise adoption begins
- ✓ API enables integrations

---

## Release Timeline (Estimated)

- **v1.0**: Q1 2024 (Focus: Core functionality, stability)
- **v2.0**: Q3 2024 (Focus: Performance, user experience)
- **v3.0**: Q1 2025 (Focus: Collaboration, enterprise)

Timeline subject to change based on priorities and resource availability.

---

## Dependencies & Constraints

### Current Dependencies
- Rust 1.70+
- Tauri 2.0
- React 18+
- SQLite 3.35+
- Node.js 18+

### External Services
- Gmail API (requires Google account)
- Optional: Cloud storage provider (v2+)
- Optional: Authentication service (v3+)

### Constraints
- Single-device for v1
- Local storage only for v1
- Gmail-only email for v1
- No plugin system in v1

---

## Getting Help

For questions about the roadmap or feature requests:
- Check existing GitHub issues
- Review this document first
- Submit feature requests with use cases
- Contribute implementation ideas
