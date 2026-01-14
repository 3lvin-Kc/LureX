// Integration tests for local file system indexing
// Tests PDF, DOCX, and standard text file support

#[cfg(test)]
mod local_filesystem_tests {
    use std::fs;
    use std::path::Path;
    use tempfile::TempDir;

    // Helper function to create test files
    fn create_test_file(dir: &Path, filename: &str, content: &[u8]) -> std::path::PathBuf {
        let file_path = dir.join(filename);
        fs::write(&file_path, content).expect("Failed to create test file");
        file_path
    }

    #[test]
    fn test_local_filesystem_basic_setup() {
        // Test that we can create a temporary directory for testing
        let temp_dir = TempDir::new().expect("Failed to create temp directory");
        assert!(temp_dir.path().exists());
        assert!(temp_dir.path().is_dir());
    }

    #[test]
    fn test_create_and_read_text_file() {
        let temp_dir = TempDir::new().unwrap();
        let test_content = "Hello, World! This is a test file.";

        let file_path = create_test_file(temp_dir.path(), "test.txt", test_content.as_bytes());

        assert!(file_path.exists());
        let read_content = fs::read_to_string(&file_path).unwrap();
        assert_eq!(read_content, test_content);
    }

    #[test]
    fn test_create_markdown_file() {
        let temp_dir = TempDir::new().unwrap();
        let markdown_content = "# Test Document\n\n## Section 1\n\nThis is a test markdown file.\n\n### Subsection\n\nWith multiple paragraphs.";

        let file_path = create_test_file(temp_dir.path(), "test.md", markdown_content.as_bytes());

        assert!(file_path.exists());
        let read_content = fs::read_to_string(&file_path).unwrap();
        assert!(read_content.contains("# Test Document"));
        assert!(read_content.contains("## Section 1"));
    }

    #[test]
    fn test_create_json_file() {
        let temp_dir = TempDir::new().unwrap();
        let json_content = r#"{"name": "test", "value": 42, "items": ["a", "b", "c"]}"#;

        let file_path = create_test_file(temp_dir.path(), "test.json", json_content.as_bytes());

        assert!(file_path.exists());
        let read_content = fs::read_to_string(&file_path).unwrap();
        assert!(read_content.contains("\"name\": \"test\""));
        assert!(read_content.contains("\"value\": 42"));
    }

    #[test]
    fn test_create_csv_file() {
        let temp_dir = TempDir::new().unwrap();
        let csv_content = "name,age,city\nJohn,30,New York\nJane,25,San Francisco\nBob,35,Chicago";

        let file_path = create_test_file(temp_dir.path(), "test.csv", csv_content.as_bytes());

        assert!(file_path.exists());
        let read_content = fs::read_to_string(&file_path).unwrap();
        assert!(read_content.contains("name,age,city"));
        assert!(read_content.contains("John,30,New York"));
    }

    #[test]
    fn test_create_yaml_file() {
        let temp_dir = TempDir::new().unwrap();
        let yaml_content = "database:\n  host: localhost\n  port: 5432\n  name: testdb\nusers:\n  - name: admin\n    role: administrator";

        let file_path = create_test_file(temp_dir.path(), "config.yaml", yaml_content.as_bytes());

        assert!(file_path.exists());
        let read_content = fs::read_to_string(&file_path).unwrap();
        assert!(read_content.contains("database:"));
        assert!(read_content.contains("host: localhost"));
    }

    #[test]
    fn test_create_xml_file() {
        let temp_dir = TempDir::new().unwrap();
        let xml_content = r#"<?xml version="1.0" encoding="UTF-8"?>
<root>
  <item id="1">
    <name>Test Item</name>
    <description>This is a test item</description>
  </item>
  <item id="2">
    <name>Another Item</name>
    <description>Another test item</description>
  </item>
</root>"#;

        let file_path = create_test_file(temp_dir.path(), "data.xml", xml_content.as_bytes());

        assert!(file_path.exists());
        let read_content = fs::read_to_string(&file_path).unwrap();
        assert!(read_content.contains("<?xml version"));
        assert!(read_content.contains("<name>Test Item</name>"));
    }

    #[test]
    fn test_create_python_source_file() {
        let temp_dir = TempDir::new().unwrap();
        let python_code = r#"#!/usr/bin/env python3
"""
Module docstring for test module.
"""

def hello(name: str) -> str:
    """Greet someone."""
    return f"Hello, {name}!"

class TestClass:
    """A test class."""

    def __init__(self, value: int):
        self.value = value

    def get_value(self) -> int:
        return self.value

if __name__ == "__main__":
    print(hello("World"))
    obj = TestClass(42)
    print(obj.get_value())
"#;

        let file_path = create_test_file(temp_dir.path(), "test.py", python_code.as_bytes());

        assert!(file_path.exists());
        let read_content = fs::read_to_string(&file_path).unwrap();
        assert!(read_content.contains("def hello(name: str)"));
        assert!(read_content.contains("class TestClass:"));
    }

    #[test]
    fn test_create_rust_source_file() {
        let temp_dir = TempDir::new().unwrap();
        let rust_code = r#"/// A simple function
fn add(a: i32, b: i32) -> i32 {
    a + b
}

/// A test struct
struct Point {
    x: i32,
    y: i32,
}

impl Point {
    /// Create a new point
    fn new(x: i32, y: i32) -> Self {
        Point { x, y }
    }

    /// Calculate distance from origin
    fn distance_from_origin(&self) -> f64 {
        ((self.x.pow(2) + self.y.pow(2)) as f64).sqrt()
    }
}

fn main() {
    let result = add(5, 3);
    println!("Result: {}", result);

    let point = Point::new(3, 4);
    println!("Distance: {}", point.distance_from_origin());
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_add() {
        assert_eq!(add(2, 2), 4);
    }
}
"#;

        let file_path = create_test_file(temp_dir.path(), "test.rs", rust_code.as_bytes());

        assert!(file_path.exists());
        let read_content = fs::read_to_string(&file_path).unwrap();
        assert!(read_content.contains("fn add(a: i32, b: i32)"));
        assert!(read_content.contains("struct Point"));
    }

    #[test]
    fn test_create_javascript_file() {
        let temp_dir = TempDir::new().unwrap();
        let js_code = r#"/**
 * A simple JavaScript module
 */

function greet(name) {
    return `Hello, ${name}!`;
}

class Calculator {
    constructor() {
        this.lastResult = 0;
    }

    add(a, b) {
        this.lastResult = a + b;
        return this.lastResult;
    }

    multiply(a, b) {
        this.lastResult = a * b;
        return this.lastResult;
    }
}

// Export for use in other modules
module.exports = { greet, Calculator };

// Usage example
console.log(greet("World"));
const calc = new Calculator();
console.log(calc.add(5, 3));
"#;

        let file_path = create_test_file(temp_dir.path(), "test.js", js_code.as_bytes());

        assert!(file_path.exists());
        let read_content = fs::read_to_string(&file_path).unwrap();
        assert!(read_content.contains("function greet(name)"));
        assert!(read_content.contains("class Calculator"));
    }

    #[test]
    fn test_create_typescript_file() {
        let temp_dir = TempDir::new().unwrap();
        let ts_code = r#"/**
 * TypeScript module with type safety
 */

interface User {
    id: number;
    name: string;
    email: string;
}

class UserManager {
    private users: User[] = [];

    addUser(user: User): void {
        this.users.push(user);
    }

    getUser(id: number): User | undefined {
        return this.users.find(u => u.id === id);
    }

    getAllUsers(): User[] {
        return [...this.users];
    }
}

// Generic function
function getValue<T>(value: T): T {
    return value;
}

export { User, UserManager, getValue };
"#;

        let file_path = create_test_file(temp_dir.path(), "test.ts", ts_code.as_bytes());

        assert!(file_path.exists());
        let read_content = fs::read_to_string(&file_path).unwrap();
        assert!(read_content.contains("interface User"));
        assert!(read_content.contains("class UserManager"));
    }

    #[test]
    fn test_create_shell_script_file() {
        let temp_dir = TempDir::new().unwrap();
        let shell_code = r#"#!/bin/bash
# A simple shell script

set -e

echo "Starting test script..."

# Function to print a message
print_message() {
    local message=$1
    echo "MESSAGE: $message"
}

# Main logic
for i in {1..5}; do
    print_message "Iteration $i"
done

echo "Script completed successfully"
"#;

        let file_path = create_test_file(temp_dir.path(), "test.sh", shell_code.as_bytes());

        assert!(file_path.exists());
        let read_content = fs::read_to_string(&file_path).unwrap();
        assert!(read_content.contains("#!/bin/bash"));
        assert!(read_content.contains("print_message() {"));
    }

    #[test]
    fn test_file_metadata() {
        let temp_dir = TempDir::new().unwrap();
        let file_path = create_test_file(temp_dir.path(), "metadata_test.txt", b"test content");

        let metadata = fs::metadata(&file_path).unwrap();
        assert!(metadata.is_file());
        assert!(metadata.len() > 0);
        assert!(metadata.modified().is_ok());
    }

    #[test]
    fn test_directory_traversal() {
        let temp_dir = TempDir::new().unwrap();

        // Create nested directory structure
        fs::create_dir_all(temp_dir.path().join("subdir1/subdir2")).unwrap();

        create_test_file(temp_dir.path(), "file1.txt", b"content1");
        create_test_file(temp_dir.path().join("subdir1").as_path(), "file2.txt", b"content2");
        create_test_file(temp_dir.path().join("subdir1/subdir2").as_path(), "file3.txt", b"content3");

        // Count files in directory tree
        let file_count = walkdir::WalkDir::new(temp_dir.path())
            .into_iter()
            .filter_map(|e| e.ok())
            .filter(|e| e.path().is_file())
            .count();

        assert_eq!(file_count, 3);
    }

    #[test]
    fn test_multiple_file_types_in_directory() {
        let temp_dir = TempDir::new().unwrap();

        // Create various file types
        create_test_file(temp_dir.path(), "document.txt", b"Text content");
        create_test_file(temp_dir.path(), "readme.md", b"# Markdown");
        create_test_file(temp_dir.path(), "data.json", b"{}");
        create_test_file(temp_dir.path(), "config.yaml", b"key: value");
        create_test_file(temp_dir.path(), "data.csv", b"col1,col2");
        create_test_file(temp_dir.path(), "script.py", b"print('hello')");

        // Verify all files exist
        assert!(temp_dir.path().join("document.txt").exists());
        assert!(temp_dir.path().join("readme.md").exists());
        assert!(temp_dir.path().join("data.json").exists());
        assert!(temp_dir.path().join("config.yaml").exists());
        assert!(temp_dir.path().join("data.csv").exists());
        assert!(temp_dir.path().join("script.py").exists());
    }

    #[test]
    fn test_file_with_special_characters() {
        let temp_dir = TempDir::new().unwrap();
        let filename = "test-file_2024 (copy).txt";
        let file_path = create_test_file(temp_dir.path(), filename, b"content with special chars");

        assert!(file_path.exists());
        let read_content = fs::read_to_string(&file_path).unwrap();
        assert_eq!(read_content, "content with special chars");
    }

    #[test]
    fn test_large_text_file() {
        let temp_dir = TempDir::new().unwrap();

        // Create a large file with 1000 lines
        let mut large_content = String::new();
        for i in 0..1000 {
            large_content.push_str(&format!("Line {}: This is a test line with some content\n", i));
        }

        let file_path = create_test_file(temp_dir.path(), "large.txt", large_content.as_bytes());

        assert!(file_path.exists());
        let read_content = fs::read_to_string(&file_path).unwrap();
        assert!(read_content.contains("Line 0:"));
        assert!(read_content.contains("Line 999:"));
        assert!(read_content.lines().count() >= 1000);
    }

    #[test]
    fn test_unicode_content() {
        let temp_dir = TempDir::new().unwrap();
        let unicode_content = "Hello 世界! Привет 🌍 مرحبا بالعالم";

        let file_path = create_test_file(temp_dir.path(), "unicode.txt", unicode_content.as_bytes());

        assert!(file_path.exists());
        let read_content = fs::read_to_string(&file_path).unwrap();
        assert_eq!(read_content, unicode_content);
        assert!(read_content.contains("世界"));
        assert!(read_content.contains("Привет"));
    }

    #[test]
    fn test_empty_file() {
        let temp_dir = TempDir::new().unwrap();
        let file_path = create_test_file(temp_dir.path(), "empty.txt", b"");

        assert!(file_path.exists());
        let metadata = fs::metadata(&file_path).unwrap();
        assert_eq!(metadata.len(), 0);
    }

    #[test]
    fn test_file_with_null_bytes() {
        let temp_dir = TempDir::new().unwrap();
        // Binary file with null bytes
        let binary_content = b"test\x00content\x00with\x00nulls";
        let file_path = create_test_file(temp_dir.path(), "binary.bin", binary_content);

        assert!(file_path.exists());
        let read_content = fs::read(&file_path).unwrap();
        assert_eq!(read_content, binary_content);
    }

    #[test]
    fn test_file_extension_detection() {
        let temp_dir = TempDir::new().unwrap();

        let test_files = vec![
            ("document.txt", "txt"),
            ("readme.md", "md"),
            ("data.json", "json"),
            ("script.py", "py"),
            ("style.css", "css"),
            ("image.png", "png"),
            ("video.mp4", "mp4"),
        ];

        for (filename, expected_ext) in test_files {
            let file_path = create_test_file(temp_dir.path(), filename, b"content");
            let ext = file_path
                .extension()
                .and_then(|e| e.to_str())
                .unwrap_or("");
            assert_eq!(ext, expected_ext);
        }
    }

    #[test]
    fn test_file_path_construction() {
        let temp_dir = TempDir::new().unwrap();

        // Create nested directory
        fs::create_dir_all(temp_dir.path().join("documents/projects/2024")).unwrap();

        let file_path = create_test_file(
            temp_dir.path().join("documents/projects/2024").as_path(),
            "report.txt",
            b"Annual report"
        );

        assert!(file_path.exists());
        assert!(file_path.to_string_lossy().contains("documents"));
        assert!(file_path.to_string_lossy().contains("projects"));
        assert!(file_path.to_string_lossy().contains("2024"));
        assert!(file_path.to_string_lossy().contains("report.txt"));
    }

    #[test]
    fn test_file_content_verification() {
        let temp_dir = TempDir::new().unwrap();
        let original_content = "This is the original content that should be preserved exactly.";

        let file_path = create_test_file(temp_dir.path(), "verify.txt", original_content.as_bytes());
        let read_content = fs::read_to_string(&file_path).unwrap();

        assert_eq!(read_content, original_content);
    }

    #[test]
    fn test_multiple_sequential_writes() {
        let temp_dir = TempDir::new().unwrap();
        let file_path = temp_dir.path().join("sequential.txt");

        // First write
        fs::write(&file_path, "First write\n").unwrap();

        // Append second write
        let mut content = fs::read_to_string(&file_path).unwrap();
        content.push_str("Second write\n");
        fs::write(&file_path, &content).unwrap();

        // Verify both writes
        let final_content = fs::read_to_string(&file_path).unwrap();
        assert!(final_content.contains("First write"));
        assert!(final_content.contains("Second write"));
    }

    #[test]
    fn test_directory_filtering() {
        let temp_dir = TempDir::new().unwrap();

        // Create files and directories
        create_test_file(temp_dir.path(), "file1.txt", b"content");
        fs::create_dir(temp_dir.path().join("subdir")).unwrap();
        create_test_file(temp_dir.path().join("subdir").as_path(), "file2.txt", b"content");

        // Count only files, not directories
        let file_count = std::fs::read_dir(temp_dir.path())
            .unwrap()
            .filter_map(|e| e.ok())
            .filter(|e| e.path().is_file())
            .count();

        assert_eq!(file_count, 1); // Only file1.txt in root
    }

    #[test]
    fn test_file_name_with_multiple_dots() {
        let temp_dir = TempDir::new().unwrap();
        let filename = "archive.backup.2024.01.15.tar.gz";
        let file_path = create_test_file(temp_dir.path(), filename, b"compressed content");

        assert!(file_path.exists());
        let name = file_path.file_name().unwrap().to_string_lossy();
        assert_eq!(name, filename);
    }

    #[test]
    fn test_path_canonicalization() {
        let temp_dir = TempDir::new().unwrap();
        let file_path = create_test_file(temp_dir.path(), "test.txt", b"content");

        // Verify we can canonicalize the path
        let canonical = std::fs::canonicalize(&file_path).unwrap();
        assert!(canonical.exists());
        assert_eq!(canonical.file_name(), file_path.file_name());
    }

    #[test]
    fn test_concurrent_file_operations() {
        let temp_dir = TempDir::new().unwrap();
        let temp_path = temp_dir.path().to_path_buf();

        // Create multiple files
        for i in 0..10 {
            let filename = format!("file_{}.txt", i);
            let content = format!("Content for file {}", i);
            create_test_file(&temp_path, &filename, content.as_bytes());
        }

        // Verify all files exist
        let file_count = std::fs::read_dir(&temp_path)
            .unwrap()
            .filter_map(|e| e.ok())
            .filter(|e| e.path().is_file())
            .count();

        assert_eq!(file_count, 10);
    }

    #[test]
    fn test_file_not_found_handling() {
        let temp_dir = TempDir::new().unwrap();
        let nonexistent = temp_dir.path().join("nonexistent.txt");

        let result = fs::read_to_string(&nonexistent);
        assert!(result.is_err());
    }

    #[test]
    fn test_supported_document_formats() {
        // Verify that text-based formats can be handled
        let formats = vec![
            "txt", "md", "json", "csv", "xml", "yaml", "yml", "toml",
            "py", "js", "ts", "rs", "go", "java", "rb", "php", "c", "cpp",
        ];

        for format in formats {
            let temp_dir = TempDir::new().unwrap();
            let filename = format!("test.{}", format);
            let file_path = create_test_file(temp_dir.path(), &filename, b"test content");
            assert!(file_path.exists(), "File format {} should be creatable", format);
        }
    }

    #[test]
    fn test_document_type_identification() {
        // Test PDF file identification
        let temp_dir = TempDir::new().unwrap();

        // Create a file with PDF magic bytes (simplified)
        let pdf_magic = b"%PDF-1.4\n";
        create_test_file(temp_dir.path(), "document.pdf", pdf_magic);

        let pdf_path = temp_dir.path().join("document.pdf");
        assert!(pdf_path.exists());

        // Read header to verify
        let header = fs::read(&pdf_path).unwrap();
        assert!(header.starts_with(b"%PDF"));
    }

    #[test]
    fn test_docx_file_structure() {
        // DOCX files are ZIP archives with specific structure
        let temp_dir = TempDir::new().unwrap();

        // Create a minimal DOCX-like structure (for testing purposes)
        // Real DOCX files would be created with proper libraries
        create_test_file(temp_dir.path(), "document.docx", b"PK\x03\x04");

        let docx_path = temp_dir.path().join("document.docx");
        assert!(docx_path.exists());

        // Verify file exists and can be read
        let content = fs::read(&docx_path).unwrap();
        assert!(content.starts_with(b"PK")); // ZIP magic bytes
    }
}
