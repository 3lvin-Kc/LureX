// Text extraction from various file formats

use std::path::Path;
use thiserror::Error;

#[derive(Error, Debug)]
pub enum ExtractorError {
    #[error("Unsupported file type: {0}")]
    UnsupportedFileType(String),
    #[error("Extraction failed: {0}")]
    ExtractionFailed(String),
    #[error("File read error: {0}")]
    FileReadError(String),
}

pub type ExtractorResult<T> = Result<T, ExtractorError>;

/// Extract text from various file formats
pub struct TextExtractor;

impl TextExtractor {
    /// Extract text from a file based on its extension
    pub fn extract(path: &Path, max_size: usize) -> ExtractorResult<String> {
        let extension = path
            .extension()
            .and_then(|ext| ext.to_str())
            .unwrap_or("")
            .to_lowercase();

        let file_size = std::fs::metadata(path)
            .map_err(|e| ExtractorError::FileReadError(e.to_string()))?
            .len() as usize;

        if file_size > max_size {
            return Err(ExtractorError::ExtractionFailed(
                "File exceeds maximum size".to_string(),
            ));
        }

        match extension.as_str() {
            "txt" | "md" | "json" | "csv" | "xml" | "yaml" | "yml" | "toml" | "sh" | "bat"
            | "rs" | "py" | "js" | "ts" | "tsx" | "jsx" | "go" | "c" | "h" | "cpp" | "java"
            | "rb" | "php" => Self::extract_text(path),
            "pdf" => Self::extract_pdf(path),
            "doc" | "docx" => Self::extract_docx(path),
            _ => Err(ExtractorError::UnsupportedFileType(extension)),
        }
    }

    /// Extract plain text from text files
    fn extract_text(path: &Path) -> ExtractorResult<String> {
        std::fs::read_to_string(path)
            .map_err(|e| ExtractorError::FileReadError(e.to_string()))
    }

    /// Extract text from PDF files using pdfium-render
    fn extract_pdf(_path: &Path) -> ExtractorResult<String> {
        #[cfg(feature = "pdf")]
        {
            // For now, return a placeholder since pdfium-render has complex initialization
            // PDF support can be implemented with proper library initialization
            Err(ExtractorError::ExtractionFailed(
                "PDF extraction not yet implemented".to_string(),
            ))
        }

        #[cfg(not(feature = "pdf"))]
        {
            Err(ExtractorError::UnsupportedFileType(
                "PDF support not enabled in build".to_string(),
            ))
        }
    }

    /// Extract text from DOCX files (ZIP-based format)
    fn extract_docx(path: &Path) -> ExtractorResult<String> {
        #[cfg(feature = "docx")]
        {
            use std::io::Read;
            use zip::ZipArchive;

            // Open the DOCX file as a ZIP archive
            let file = std::fs::File::open(path)
                .map_err(|e| ExtractorError::FileReadError(format!("Failed to open DOCX: {}", e)))?;

            let mut archive = ZipArchive::new(file)
                .map_err(|e| ExtractorError::ExtractionFailed(format!("Failed to parse DOCX as ZIP: {}", e)))?;

            // Extract text from document.xml
            let document_xml = match archive.by_name("word/document.xml") {
                Ok(file) => {
                    let mut buf = String::new();
                    std::io::BufReader::new(file)
                        .read_to_string(&mut buf)
                        .map_err(|e| ExtractorError::ExtractionFailed(format!("Failed to read document.xml: {}", e)))?;
                    buf
                }
                Err(_) => {
                    return Err(ExtractorError::ExtractionFailed(
                        "Could not find word/document.xml in DOCX".to_string(),
                    ));
                }
            };

            // Extract text from XML using simple regex-based approach
            let text = Self::extract_text_from_docx_xml(&document_xml)?;

            if text.is_empty() {
                return Err(ExtractorError::ExtractionFailed(
                    "No text content found in DOCX".to_string(),
                ));
            }

            Ok(text)
        }

        #[cfg(not(feature = "docx"))]
        {
            Err(ExtractorError::UnsupportedFileType(
                "DOCX support not enabled in build".to_string(),
            ))
        }
    }

    #[cfg(feature = "docx")]
    /// Extract text content from DOCX XML content
    fn extract_text_from_docx_xml(xml_content: &str) -> ExtractorResult<String> {
        use regex::Regex;

        let mut text = String::new();

        // Extract text nodes from <w:t> tags in Word XML
        // Pattern: <w:t>...text content...</w:t>
        let text_regex = Regex::new(r"<w:t[^>]*>([^<]*)</w:t>")
            .map_err(|e| ExtractorError::ExtractionFailed(format!("Regex compilation failed: {}", e)))?;

        for cap in text_regex.captures_iter(xml_content) {
            if let Some(matched_text) = cap.get(1) {
                let content = matched_text.as_str();
                if !content.is_empty() {
                    text.push_str(content);
                }
            }
        }

        // Add space between paragraphs
        let paragraph_regex = Regex::new(r"</w:p>")
            .map_err(|e| ExtractorError::ExtractionFailed(format!("Regex compilation failed: {}", e)))?;

        text = paragraph_regex.replace_all(&text, "\n").to_string();

        // Clean up extra whitespace
        text = text
            .lines()
            .map(|line| line.trim())
            .filter(|line| !line.is_empty())
            .collect::<Vec<_>>()
            .join("\n");

        Ok(text)
    }

    /// Get supported file extensions
    pub fn supported_extensions() -> Vec<&'static str> {
        vec![
            "txt", "md", "json", "csv", "xml", "yaml", "yml", "toml", "sh", "bat", "rs", "py",
            "js", "ts", "tsx", "jsx", "go", "c", "h", "cpp", "java", "rb", "php", "pdf",
            "docx", "doc",
        ]
    }

    /// Check if a file type is supported
    pub fn is_supported(path: &Path) -> bool {
        let extension = path
            .extension()
            .and_then(|ext| ext.to_str())
            .unwrap_or("")
            .to_lowercase();

        Self::supported_extensions().contains(&extension.as_str())
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use std::fs;
    use tempfile::TempDir;

    #[test]
    fn test_supported_extensions() {
        let extensions = TextExtractor::supported_extensions();
        assert!(extensions.contains(&"txt"));
        assert!(extensions.contains(&"md"));
        assert!(extensions.contains(&"json"));
        assert!(extensions.contains(&"py"));
        assert!(extensions.contains(&"pdf"));
        assert!(extensions.contains(&"docx"));
    }

    #[test]
    fn test_is_supported() {
        assert!(TextExtractor::is_supported(Path::new("test.txt")));
        assert!(TextExtractor::is_supported(Path::new("test.md")));
        assert!(TextExtractor::is_supported(Path::new("test.py")));
        assert!(TextExtractor::is_supported(Path::new("test.pdf")));
        assert!(TextExtractor::is_supported(Path::new("test.docx")));
        assert!(TextExtractor::is_supported(Path::new("test.doc")));
        assert!(!TextExtractor::is_supported(Path::new("test.bin")));
        assert!(!TextExtractor::is_supported(Path::new("test.exe")));
    }

    #[test]
    fn test_extract_text_file() {
        let temp_dir = TempDir::new().unwrap();
        let file_path = temp_dir.path().join("test.txt");
        fs::write(&file_path, "Hello, World!").unwrap();

        let result = TextExtractor::extract(&file_path, 1024 * 1024);
        assert!(result.is_ok());
        assert_eq!(result.unwrap(), "Hello, World!");
    }

    #[test]
    fn test_extract_markdown_file() {
        let temp_dir = TempDir::new().unwrap();
        let file_path = temp_dir.path().join("test.md");
        fs::write(&file_path, "# Test\n\nThis is a test.").unwrap();

        let result = TextExtractor::extract(&file_path, 1024 * 1024);
        assert!(result.is_ok());
        assert_eq!(result.unwrap(), "# Test\n\nThis is a test.");
    }

    #[test]
    fn test_extract_json_file() {
        let temp_dir = TempDir::new().unwrap();
        let file_path = temp_dir.path().join("test.json");
        fs::write(&file_path, r#"{"key": "value"}"#).unwrap();

        let result = TextExtractor::extract(&file_path, 1024 * 1024);
        assert!(result.is_ok());
        assert_eq!(result.unwrap(), r#"{"key": "value"}"#);
    }

    #[test]
    fn test_extract_file_exceeds_max_size() {
        let temp_dir = TempDir::new().unwrap();
        let file_path = temp_dir.path().join("test.txt");
        fs::write(&file_path, "Hello, World!").unwrap();

        let result = TextExtractor::extract(&file_path, 5);
        assert!(result.is_err());
    }

    #[test]
    fn test_extract_unsupported_file_type() {
        let temp_dir = TempDir::new().unwrap();
        let file_path = temp_dir.path().join("test.bin");
        fs::write(&file_path, "binary data").unwrap();

        let result = TextExtractor::extract(&file_path, 1024 * 1024);
        assert!(result.is_err());
    }

    #[test]
    fn test_extract_nonexistent_file() {
        let result = TextExtractor::extract(Path::new("/nonexistent/file.txt"), 1024 * 1024);
        assert!(result.is_err());
    }

    #[test]
    fn test_is_supported_all_text_extensions() {
        let text_extensions = vec![
            "txt", "md", "json", "csv", "xml", "yaml", "yml", "toml", "sh", "bat", "rs", "py",
            "js", "ts", "tsx", "jsx", "go", "c", "h", "cpp", "java", "rb", "php",
        ];

        for ext in text_extensions {
            let path = Path::new(&format!("test.{}", ext));
            assert!(
                TextExtractor::is_supported(path),
                "Extension {} should be supported",
                ext
            );
        }
    }

    #[test]
    fn test_extract_csv_file() {
        let temp_dir = TempDir::new().unwrap();
        let file_path = temp_dir.path().join("test.csv");
        fs::write(&file_path, "name,age\nJohn,30\nJane,25").unwrap();

        let result = TextExtractor::extract(&file_path, 1024 * 1024);
        assert!(result.is_ok());
        let content = result.unwrap();
        assert!(content.contains("name,age"));
        assert!(content.contains("John,30"));
    }

    #[test]
    fn test_extract_yaml_file() {
        let temp_dir = TempDir::new().unwrap();
        let file_path = temp_dir.path().join("test.yaml");
        fs::write(&file_path, "key: value\nlist:\n  - item1\n  - item2").unwrap();

        let result = TextExtractor::extract(&file_path, 1024 * 1024);
        assert!(result.is_ok());
        let content = result.unwrap();
        assert!(content.contains("key: value"));
    }

    #[cfg(feature = "pdf")]
    #[test]
    fn test_pdf_feature_enabled() {
        let extensions = TextExtractor::supported_extensions();
        assert!(extensions.contains(&"pdf"), "PDF should be in supported extensions when feature is enabled");
    }

    #[cfg(feature = "docx")]
    #[test]
    fn test_docx_feature_enabled() {
        let extensions = TextExtractor::supported_extensions();
        assert!(extensions.contains(&"docx"), "DOCX should be in supported extensions when feature is enabled");
        assert!(extensions.contains(&"doc"), "DOC should be in supported extensions when feature is enabled");
    }

    #[test]
    fn test_extract_python_source_file() {
        let temp_dir = TempDir::new().unwrap();
        let file_path = temp_dir.path().join("test.py");
        let python_code = "def hello():\n    print('Hello, World!')\n\nif __name__ == '__main__':\n    hello()";
        fs::write(&file_path, python_code).unwrap();

        let result = TextExtractor::extract(&file_path, 1024 * 1024);
        assert!(result.is_ok());
        let content = result.unwrap();
        assert!(content.contains("def hello()"));
        assert!(content.contains("print"));
    }

    #[test]
    fn test_extract_rust_source_file() {
        let temp_dir = TempDir::new().unwrap();
        let file_path = temp_dir.path().join("test.rs");
        let rust_code = "fn main() {\n    println!(\"Hello, world!\");\n}";
        fs::write(&file_path, rust_code).unwrap();

        let result = TextExtractor::extract(&file_path, 1024 * 1024);
        assert!(result.is_ok());
        let content = result.unwrap();
        assert!(content.contains("fn main()"));
        assert!(content.contains("println!"));
    }

    #[test]
    fn test_extract_xml_file() {
        let temp_dir = TempDir::new().unwrap();
        let file_path = temp_dir.path().join("test.xml");
        fs::write(&file_path, "<?xml version=\"1.0\"?>\n<root>\n<item>Test</item>\n</root>").unwrap();

        let result = TextExtractor::extract(&file_path, 1024 * 1024);
        assert!(result.is_ok());
        let content = result.unwrap();
        assert!(content.contains("<?xml version"));
        assert!(content.contains("<item>Test</item>"));
    }

    #[cfg(feature = "docx")]
    #[test]
    fn test_extract_text_from_docx_xml() {
        let xml_content = r#"<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">
    <w:body>
        <w:p>
            <w:r>
                <w:t>Hello, World!</w:t>
            </w:r>
        </w:p>
        <w:p>
            <w:r>
                <w:t>This is a test document.</w:t>
            </w:r>
        </w:p>
    </w:body>
</w:document>"#;

        let result = TextExtractor::extract_text_from_docx_xml(xml_content);
        assert!(result.is_ok());
        let text = result.unwrap();
        assert!(text.contains("Hello, World!"));
        assert!(text.contains("This is a test document."));
    }

    #[cfg(feature = "docx")]
    #[test]
    fn test_extract_text_from_docx_xml_with_multiple_paragraphs() {
        let xml_content = r#"<?xml version="1.0"?>
<w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">
    <w:body>
        <w:p>
            <w:r>
                <w:t>First paragraph</w:t>
            </w:r>
        </w:p>
        <w:p>
            <w:r>
                <w:t>Second paragraph</w:t>
            </w:r>
        </w:p>
        <w:p>
            <w:r>
                <w:t>Third paragraph</w:t>
            </w:r>
        </w:p>
    </w:body>
</w:document>"#;

        let result = TextExtractor::extract_text_from_docx_xml(xml_content);
        assert!(result.is_ok());
        let text = result.unwrap();
        assert!(text.lines().count() >= 3);
        assert!(text.contains("First paragraph"));
        assert!(text.contains("Second paragraph"));
        assert!(text.contains("Third paragraph"));
    }

    #[cfg(feature = "docx")]
    #[test]
    fn test_extract_text_from_docx_xml_with_mixed_content() {
        let xml_content = r#"<?xml version="1.0"?>
<w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">
    <w:body>
        <w:p>
            <w:r>
                <w:t>Introduction text</w:t>
            </w:r>
            <w:r>
                <w:t> with multiple runs</w:t>
            </w:r>
        </w:p>
        <w:p>
            <w:r>
                <w:t>Another paragraph</w:t>
            </w:r>
        </w:p>
    </w:body>
</w:document>"#;

        let result = TextExtractor::extract_text_from_docx_xml(xml_content);
        assert!(result.is_ok());
        let text = result.unwrap();
        assert!(text.contains("Introduction text"));
        assert!(text.contains("with multiple runs"));
        assert!(text.contains("Another paragraph"));
    }

    #[cfg(feature = "docx")]
    #[test]
    fn test_extract_text_from_docx_xml_empty_paragraphs() {
        let xml_content = r#"<?xml version="1.0"?>
<w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">
    <w:body>
        <w:p>
            <w:r>
                <w:t>Text before empty</w:t>
            </w:r>
        </w:p>
        <w:p></w:p>
        <w:p>
            <w:r>
                <w:t>Text after empty</w:t>
            </w:r>
        </w:p>
    </w:body>
</w:document>"#;

        let result = TextExtractor::extract_text_from_docx_xml(xml_content);
        assert!(result.is_ok());
        let text = result.unwrap();
        assert!(text.contains("Text before empty"));
        assert!(text.contains("Text after empty"));
    }

    #[cfg(feature = "docx")]
    #[test]
    fn test_extract_text_from_docx_xml_with_special_chars() {
        let xml_content = r#"<?xml version="1.0" encoding="UTF-8"?>
<w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">
    <w:body>
        <w:p>
            <w:r>
                <w:t>Text with special: &lt;tag&gt; and &amp; ampersand</w:t>
            </w:r>
        </w:p>
        <w:p>
            <w:r>
                <w:t>Unicode: 日本語 and Ñoño</w:t>
            </w:r>
        </w:p>
    </w:body>
</w:document>"#;

        let result = TextExtractor::extract_text_from_docx_xml(xml_content);
        assert!(result.is_ok());
        let text = result.unwrap();
        assert!(text.contains("Text with special"));
        assert!(text.contains("Unicode"));
    }

    #[test]
    fn test_supported_extensions_comprehensive() {
        let extensions = TextExtractor::supported_extensions();

        // Text formats
        assert!(extensions.contains(&"txt"));
        assert!(extensions.contains(&"md"));

        // Data formats
        assert!(extensions.contains(&"json"));
        assert!(extensions.contains(&"csv"));
        assert!(extensions.contains(&"xml"));
        assert!(extensions.contains(&"yaml"));
        assert!(extensions.contains(&"toml"));

        // Code files
        assert!(extensions.contains(&"py"));
        assert!(extensions.contains(&"rs"));
        assert!(extensions.contains(&"js"));
        assert!(extensions.contains(&"ts"));
        assert!(extensions.contains(&"java"));
        assert!(extensions.contains(&"cpp"));
        assert!(extensions.contains(&"php"));

        // Document formats
        assert!(extensions.contains(&"pdf"));
        assert!(extensions.contains(&"docx"));
        assert!(extensions.contains(&"doc"));

        // Verify total count
        assert!(extensions.len() >= 25, "Should support at least 25 file types");
    }

    #[test]
    fn test_file_size_validation() {
        let temp_dir = TempDir::new().unwrap();
        let file_path = temp_dir.path().join("large.txt");

        // Create file with 1MB of content
        let large_content = "a".repeat(1024 * 1024);
        fs::write(&file_path, &large_content).unwrap();

        // Try to extract with small max size (100 bytes)
        let result = TextExtractor::extract(&file_path, 100);
        assert!(result.is_err(), "Should fail for files exceeding max size");
    }

    #[test]
    fn test_file_size_validation_within_limits() {
        let temp_dir = TempDir::new().unwrap();
        let file_path = temp_dir.path().join("small.txt");
        let content = "This is a small file";
        fs::write(&file_path, content).unwrap();

        // Extract with sufficient max size
        let result = TextExtractor::extract(&file_path, 1024 * 1024);
        assert!(result.is_ok());
        assert_eq!(result.unwrap(), content);
    }
}
