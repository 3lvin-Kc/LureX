// File system layer - file watching and indexing

pub mod extractor;
pub mod file_repository;
pub mod watcher;

pub use file_repository::FileSystemRepository;
