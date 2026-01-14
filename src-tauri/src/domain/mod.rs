// Domain layer - pure business logic
//
// This layer contains:
// - Entities: Core business objects (Email, File, SearchResult)
// - Value Objects: Type-safe primitives (MessageId, ThreadId, FilePath)
// - Ports (Traits): Abstract interfaces for repositories and services
// - Services: Pure business logic for ranking, filtering, etc.
// - Errors: Domain-specific error types

pub mod entities;
pub mod errors;
pub mod ports;
pub mod services;
pub mod value_objects;

pub use entities::{GmailMessage, LocalFile, SearchResult};
pub use errors::DomainError;
