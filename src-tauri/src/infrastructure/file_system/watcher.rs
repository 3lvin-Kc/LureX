// File system watcher for monitoring file changes

use notify::{RecommendedWatcher, RecursiveMode, Watcher};
use std::path::{Path, PathBuf};
use std::sync::mpsc;
use thiserror::Error;

#[derive(Error, Debug)]
pub enum WatcherError {
    #[error("Watcher creation failed: {0}")]
    CreationFailed(String),
    #[error("Watch error: {0}")]
    WatchError(String),
}

pub type WatcherResult<T> = Result<T, WatcherError>;

#[derive(Clone, Debug)]
pub enum FileEvent {
    Created(PathBuf),
    Modified(PathBuf),
    Deleted(PathBuf),
    Renamed { from: PathBuf, to: PathBuf },
}

/// File system watcher for monitoring file changes
pub struct FileSystemWatcher {
    watcher: RecommendedWatcher,
    rx: mpsc::Receiver<FileEvent>,
}

impl FileSystemWatcher {
    /// Create a new file system watcher
    pub fn new<P: AsRef<Path>>(path: P) -> WatcherResult<Self> {
        let (tx, rx) = mpsc::channel();

        let mut watcher = notify::recommended_watcher(move |event: Result<notify::Event, _>| {
            match event {
                Ok(notify_event) => {
                    for path in notify_event.paths {
                        let file_event = match notify_event.kind {
                            notify::EventKind::Create(_) => Some(FileEvent::Created(path)),
                            notify::EventKind::Modify(_) => Some(FileEvent::Modified(path)),
                            notify::EventKind::Remove(_) => Some(FileEvent::Deleted(path)),
                            notify::EventKind::Access(_) => None,
                            _ => None,
                        };

                        if let Some(event) = file_event {
                            let _ = tx.send(event);
                        }
                    }
                }
                Err(_) => {}
            }
        })
        .map_err(|e| WatcherError::CreationFailed(e.to_string()))?;

        watcher
            .watch(path.as_ref(), RecursiveMode::Recursive)
            .map_err(|e| WatcherError::WatchError(e.to_string()))?;

        Ok(Self { watcher, rx })
    }

    /// Get the next file event (non-blocking)
    pub fn try_recv(&self) -> Option<FileEvent> {
        self.rx.try_recv().ok()
    }

    /// Get the next file event (blocking)
    pub fn recv(&self) -> Option<FileEvent> {
        self.rx.recv().ok()
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use std::fs;
    use tempfile::TempDir;

    #[test]
    fn test_watcher_creation() {
        let temp_dir = TempDir::new().unwrap();
        let result = FileSystemWatcher::new(temp_dir.path());
        assert!(result.is_ok());
    }

    #[test]
    fn test_watcher_detects_file_creation() {
        let temp_dir = TempDir::new().unwrap();
        let watcher = FileSystemWatcher::new(temp_dir.path()).unwrap();

        let file_path = temp_dir.path().join("test.txt");
        fs::write(&file_path, "test").unwrap();

        // Give watcher time to process
        std::thread::sleep(std::time::Duration::from_millis(100));

        let event = watcher.try_recv();
        assert!(event.is_some());
    }
}
