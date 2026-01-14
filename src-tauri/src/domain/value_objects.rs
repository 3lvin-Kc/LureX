// Domain value objects - type-safe primitives

use std::path::PathBuf;

/// Type-safe wrapper for Gmail message IDs
#[derive(Clone, Debug, PartialEq, Eq, Hash)]
pub struct MessageId(pub String);

impl MessageId {
    pub fn new(id: String) -> Self {
        Self(id)
    }
}

/// Type-safe wrapper for Gmail thread IDs
#[derive(Clone, Debug, PartialEq, Eq, Hash)]
pub struct ThreadId(pub String);

impl ThreadId {
    pub fn new(id: String) -> Self {
        Self(id)
    }
}

/// Type-safe wrapper for file paths
#[derive(Clone, Debug, PartialEq, Eq, Hash)]
pub struct FilePath(pub PathBuf);

impl FilePath {
    pub fn new(path: PathBuf) -> Self {
        Self(path)
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_message_id_creation() {
        let id = MessageId::new("123".to_string());
        assert_eq!(id.0, "123");
    }

    #[test]
    fn test_thread_id_creation() {
        let id = ThreadId::new("thread123".to_string());
        assert_eq!(id.0, "thread123");
    }

    #[test]
    fn test_file_path_creation() {
        let path = FilePath::new(PathBuf::from("/home/user/file.txt"));
        assert_eq!(path.0.to_string_lossy(), "/home/user/file.txt");
    }
}
