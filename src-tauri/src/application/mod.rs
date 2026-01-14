// Application layer - use cases and orchestration
//
// This layer implements business workflows (use cases) by coordinating
// domain logic and infrastructure. It handles:
// - Dependency injection
// - Use case orchestration
// - Data transfer objects (DTOs)
// - Application-level error handling

pub mod dto;
pub mod errors;
pub mod services;
pub mod use_cases;

pub use errors::{ApplicationError, ApplicationResult};
pub use services::AppContainer;
