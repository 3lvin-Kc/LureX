/**
 * FileSystemService Tests
 * Comprehensive unit tests for local file system operations
 */

import FileSystemService from '../fileSystem';

describe('FileSystemService', () => {
  describe('getFileName', () => {
    it('should extract filename from Unix path', () => {
      expect(FileSystemService.getFileName('/path/to/file.txt')).toBe('file.txt');
    });

    it('should extract filename from Windows path', () => {
      expect(FileSystemService.getFileName('C:\\path\\to\\file.txt')).toBe('file.txt');
    });

    it('should handle filename without extension', () => {
      expect(FileSystemService.getFileName('/path/to/README')).toBe('README');
    });

    it('should return empty string for empty path', () => {
      expect(FileSystemService.getFileName('')).toBe('');
    });

    it('should handle path without directories', () => {
      expect(FileSystemService.getFileName('file.txt')).toBe('file.txt');
    });

    it('should handle multiple dots in filename', () => {
      expect(FileSystemService.getFileName('/path/archive.backup.2024.01.15.tar.gz')).toBe(
        'archive.backup.2024.01.15.tar.gz'
      );
    });
  });

  describe('getFileExtension', () => {
    it('should extract extension from filename', () => {
      expect(FileSystemService.getFileExtension('/path/to/file.txt')).toBe('txt');
    });

    it('should return lowercase extension', () => {
      expect(FileSystemService.getFileExtension('/path/file.TXT')).toBe('txt');
    });

    it('should handle multiple dots correctly', () => {
      expect(FileSystemService.getFileExtension('/path/archive.tar.gz')).toBe('gz');
    });

    it('should return empty string for no extension', () => {
      expect(FileSystemService.getFileExtension('/path/README')).toBe('');
    });

    it('should return empty string for empty path', () => {
      expect(FileSystemService.getFileExtension('')).toBe('');
    });

    it('should handle hidden files', () => {
      expect(FileSystemService.getFileExtension('/path/.gitignore')).toBe('gitignore');
    });
  });

  describe('isSupportedFileType', () => {
    it('should support text files', () => {
      expect(FileSystemService.isSupportedFileType('file.txt')).toBe(true);
      expect(FileSystemService.isSupportedFileType('file.md')).toBe(true);
      expect(FileSystemService.isSupportedFileType('file.json')).toBe(true);
      expect(FileSystemService.isSupportedFileType('file.csv')).toBe(true);
      expect(FileSystemService.isSupportedFileType('file.xml')).toBe(true);
    });

    it('should support source code files', () => {
      expect(FileSystemService.isSupportedFileType('script.py')).toBe(true);
      expect(FileSystemService.isSupportedFileType('script.js')).toBe(true);
      expect(FileSystemService.isSupportedFileType('script.ts')).toBe(true);
      expect(FileSystemService.isSupportedFileType('code.rs')).toBe(true);
      expect(FileSystemService.isSupportedFileType('program.java')).toBe(true);
    });

    it('should support document files', () => {
      expect(FileSystemService.isSupportedFileType('document.pdf')).toBe(true);
      expect(FileSystemService.isSupportedFileType('document.docx')).toBe(true);
      expect(FileSystemService.isSupportedFileType('document.doc')).toBe(true);
    });

    it('should not support binary files', () => {
      expect(FileSystemService.isSupportedFileType('image.png')).toBe(false);
      expect(FileSystemService.isSupportedFileType('image.jpg')).toBe(false);
      expect(FileSystemService.isSupportedFileType('video.mp4')).toBe(false);
      expect(FileSystemService.isSupportedFileType('binary.exe')).toBe(false);
    });

    it('should not support unsupported files', () => {
      expect(FileSystemService.isSupportedFileType('file.bin')).toBe(false);
      expect(FileSystemService.isSupportedFileType('file.zip')).toBe(false);
    });

    it('should handle case-insensitive extensions', () => {
      expect(FileSystemService.isSupportedFileType('file.TXT')).toBe(true);
      expect(FileSystemService.isSupportedFileType('file.PDF')).toBe(true);
      expect(FileSystemService.isSupportedFileType('file.DOCX')).toBe(true);
    });
  });

  describe('getFileTypeLabel', () => {
    it('should return label for PDF files', () => {
      expect(FileSystemService.getFileTypeLabel('document.pdf')).toBe('PDF Document');
    });

    it('should return label for Word documents', () => {
      expect(FileSystemService.getFileTypeLabel('document.docx')).toBe('Word Document');
      expect(FileSystemService.getFileTypeLabel('document.doc')).toBe('Word Document');
    });

    it('should return label for source code', () => {
      expect(FileSystemService.getFileTypeLabel('script.py')).toBe('Python');
      expect(FileSystemService.getFileTypeLabel('script.js')).toBe('JavaScript');
      expect(FileSystemService.getFileTypeLabel('code.rs')).toBe('Rust');
    });

    it('should return default label for unknown types', () => {
      expect(FileSystemService.getFileTypeLabel('file.unknown')).toBe('UNKNOWN File');
    });

    it('should handle case-insensitive extensions', () => {
      expect(FileSystemService.getFileTypeLabel('file.TXT')).toBe('Text File');
      expect(FileSystemService.getFileTypeLabel('script.PY')).toBe('Python');
    });
  });

  describe('getFileIcon', () => {
    it('should return icon for documents', () => {
      expect(FileSystemService.getFileIcon('file.pdf')).toBe('📄');
      expect(FileSystemService.getFileIcon('file.docx')).toBe('📝');
      expect(FileSystemService.getFileIcon('file.txt')).toBe('📄');
    });

    it('should return icon for source code', () => {
      expect(FileSystemService.getFileIcon('script.py')).toBe('🐍');
      expect(FileSystemService.getFileIcon('script.js')).toBe('⚡');
      expect(FileSystemService.getFileIcon('script.rs')).toBe('🦀');
      expect(FileSystemService.getFileIcon('code.java')).toBe('☕');
    });

    it('should return default icon for unknown types', () => {
      expect(FileSystemService.getFileIcon('file.unknown')).toBe('📄');
    });
  });

  describe('formatFileSize', () => {
    it('should format bytes correctly', () => {
      expect(FileSystemService.formatFileSize(0)).toBe('0 B');
      expect(FileSystemService.formatFileSize(1024)).toBe('1 KB');
      expect(FileSystemService.formatFileSize(1024 * 1024)).toBe('1 MB');
      expect(FileSystemService.formatFileSize(1024 * 1024 * 1024)).toBe('1 GB');
    });

    it('should round to 2 decimal places', () => {
      expect(FileSystemService.formatFileSize(1536)).toBe('1.5 KB');
      expect(FileSystemService.formatFileSize(1024 * 1024 * 1.5)).toBe('1.5 MB');
    });

    it('should handle large file sizes', () => {
      expect(FileSystemService.formatFileSize(1024 * 1024 * 1024 * 1024)).toBe('1 TB');
    });

    it('should handle non-zero small sizes', () => {
      expect(FileSystemService.formatFileSize(512)).toBe('0.5 KB');
      expect(FileSystemService.formatFileSize(256)).toBe('0.25 KB');
    });
  });

  describe('formatDate', () => {
    it('should format today\'s date with time', () => {
      const today = new Date();
      const dateString = today.toISOString();
      const formatted = FileSystemService.formatDate(dateString);
      expect(formatted).toContain('Today at');
    });

    it('should format yesterday\'s date', () => {
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      const dateString = yesterday.toISOString();
      const formatted = FileSystemService.formatDate(dateString);
      expect(formatted).toContain('Yesterday at');
    });

    it('should format older dates without year if current year', () => {
      const date = new Date();
      date.setDate(date.getDate() - 30);
      const dateString = date.toISOString();
      const formatted = FileSystemService.formatDate(dateString);
      expect(formatted).toMatch(/\w+ \d+/); // Month and day format
    });

    it('should include year for dates from previous years', () => {
      const date = new Date();
      date.setFullYear(date.getFullYear() - 1);
      const dateString = date.toISOString();
      const formatted = FileSystemService.formatDate(dateString);
      expect(formatted).toMatch(/\d{4}/); // Contains year
    });

    it('should handle invalid dates gracefully', () => {
      const result = FileSystemService.formatDate('invalid-date');
      expect(result).toBe('invalid-date');
    });
  });

  describe('deduplicatePaths', () => {
    it('should remove duplicate paths', () => {
      const paths = ['/path/a', '/path/b', '/path/a', '/path/c', '/path/b'];
      const result = FileSystemService.deduplicatePaths(paths);
      expect(result).toHaveLength(3);
      expect(new Set(result).size).toBe(3);
    });

    it('should preserve order of first occurrence', () => {
      const paths = ['/path/a', '/path/b', '/path/a'];
      const result = FileSystemService.deduplicatePaths(paths);
      expect(result[0]).toBe('/path/a');
      expect(result[1]).toBe('/path/b');
    });

    it('should handle empty array', () => {
      expect(FileSystemService.deduplicatePaths([])).toEqual([]);
    });

    it('should handle single path', () => {
      expect(FileSystemService.deduplicatePaths(['/path/a'])).toEqual(['/path/a']);
    });

    it('should handle no duplicates', () => {
      const paths = ['/path/a', '/path/b', '/path/c'];
      expect(FileSystemService.deduplicatePaths(paths)).toEqual(paths);
    });
  });

  describe('filterNestedPaths', () => {
    it('should remove nested paths', () => {
      const paths = ['/home/user', '/home/user/documents', '/home/user/downloads'];
      const result = FileSystemService.filterNestedPaths(paths);
      expect(result).toHaveLength(1);
      expect(result[0]).toBe('/home/user');
    });

    it('should handle Windows paths', () => {
      const paths = ['C:\\Users\\user', 'C:\\Users\\user\\Documents'];
      const result = FileSystemService.filterNestedPaths(paths);
      expect(result).toHaveLength(1);
      expect(result[0]).toBe('C:\\Users\\user');
    });

    it('should handle mixed path separators', () => {
      const paths = ['/home/user', '/home/user\\documents'];
      const result = FileSystemService.filterNestedPaths(paths);
      expect(result).toHaveLength(1);
    });

    it('should preserve non-nested paths', () => {
      const paths = ['/home/user', '/var/log', '/etc'];
      const result = FileSystemService.filterNestedPaths(paths);
      expect(result).toEqual(paths);
    });

    it('should handle single path', () => {
      expect(FileSystemService.filterNestedPaths(['/home/user'])).toEqual(['/home/user']);
    });

    it('should be case-insensitive on Windows', () => {
      const paths = ['/HOME/USER', '/home/user/documents'];
      const result = FileSystemService.filterNestedPaths(paths);
      expect(result).toHaveLength(1);
    });
  });

  describe('validateFolderPath', () => {
    it('should validate valid paths', () => {
      expect(FileSystemService.validateFolderPath('/home/user/documents')).toEqual({
        valid: true,
      });
      expect(FileSystemService.validateFolderPath('C:\\Users\\documents')).toEqual({
        valid: true,
      });
    });

    it('should reject empty paths', () => {
      const result = FileSystemService.validateFolderPath('');
      expect(result.valid).toBe(false);
      expect(result.error).toBeDefined();
    });

    it('should reject whitespace-only paths', () => {
      const result = FileSystemService.validateFolderPath('   ');
      expect(result.valid).toBe(false);
    });

    it('should reject paths with invalid characters', () => {
      expect(FileSystemService.validateFolderPath('/path/<invalid>')).toEqual({
        valid: false,
        error: expect.stringContaining('invalid characters'),
      });
      expect(FileSystemService.validateFolderPath('C:\\path\\file|name')).toEqual({
        valid: false,
        error: expect.stringContaining('invalid characters'),
      });
    });

    it('should reject paths with consecutive slashes', () => {
      const result = FileSystemService.validateFolderPath('/path//to///folder');
      expect(result.valid).toBe(false);
      expect(result.error).toBeDefined();
    });

    it('should accept paths with single slashes', () => {
      expect(FileSystemService.validateFolderPath('/path/to/folder')).toEqual({
        valid: true,
      });
    });
  });

  describe('getSupportedExtensions', () => {
    it('should return array of supported extensions', () => {
      const extensions = FileSystemService.getSupportedExtensions();
      expect(Array.isArray(extensions)).toBe(true);
      expect(extensions.length > 0).toBe(true);
    });

    it('should include document formats', () => {
      const extensions = FileSystemService.getSupportedExtensions();
      expect(extensions).toContain('pdf');
      expect(extensions).toContain('docx');
      expect(extensions).toContain('txt');
    });

    it('should include code formats', () => {
      const extensions = FileSystemService.getSupportedExtensions();
      expect(extensions).toContain('py');
      expect(extensions).toContain('js');
      expect(extensions).toContain('rs');
      expect(extensions).toContain('java');
    });

    it('should include data formats', () => {
      const extensions = FileSystemService.getSupportedExtensions();
      expect(extensions).toContain('json');
      expect(extensions).toContain('csv');
      expect(extensions).toContain('xml');
      expect(extensions).toContain('yaml');
    });

    it('should not be empty', () => {
      const extensions = FileSystemService.getSupportedExtensions();
      expect(extensions.length).toBeGreaterThan(15);
    });
  });

  describe('getSupportedFileTypesByCategory', () => {
    it('should return object with file type categories', () => {
      const categories = FileSystemService.getSupportedFileTypesByCategory();
      expect(typeof categories).toBe('object');
      expect(categories).not.toBeNull();
    });

    it('should have Documents category', () => {
      const categories = FileSystemService.getSupportedFileTypesByCategory();
      expect(categories['Documents']).toBeDefined();
      expect(Array.isArray(categories['Documents'])).toBe(true);
      expect(categories['Documents']).toContain('pdf');
      expect(categories['Documents']).toContain('docx');
    });

    it('should have Code category', () => {
      const categories = FileSystemService.getSupportedFileTypesByCategory();
      expect(categories['Code']).toBeDefined();
      expect(categories['Code']).toContain('py');
      expect(categories['Code']).toContain('js');
      expect(categories['Code']).toContain('rs');
    });

    it('should have Data category', () => {
      const categories = FileSystemService.getSupportedFileTypesByCategory();
      expect(categories['Data']).toBeDefined();
      expect(categories['Data']).toContain('json');
      expect(categories['Data']).toContain('csv');
      expect(categories['Data']).toContain('xml');
    });

    it('should have Markup category', () => {
      const categories = FileSystemService.getSupportedFileTypesByCategory();
      expect(categories['Markup']).toBeDefined();
      expect(categories['Markup']).toContain('md');
    });
  });

  describe('isValidPath', () => {
    it('should validate normal paths as true', async () => {
      const result = await FileSystemService.isValidPath('/home/user/documents');
      expect(result).toBe(true);
    });

    it('should reject empty paths', async () => {
      const result = await FileSystemService.isValidPath('');
      expect(result).toBe(false);
    });

    it('should reject whitespace paths', async () => {
      const result = await FileSystemService.isValidPath('   ');
      expect(result).toBe(false);
    });

    it('should reject paths with invalid characters', async () => {
      expect(await FileSystemService.isValidPath('/path/<invalid>')).toBe(false);
      expect(await FileSystemService.isValidPath('C:\\path|file')).toBe(false);
      expect(await FileSystemService.isValidPath('/path:invalid')).toBe(false);
    });

    it('should handle errors gracefully', async () => {
      const result = await FileSystemService.isValidPath(null as any);
      expect(result).toBe(false);
    });
  });

  describe('Integration Tests', () => {
    it('should correctly process a full file path', () => {
      const path = '/home/user/documents/report_2024.pdf';
      expect(FileSystemService.getFileName(path)).toBe('report_2024.pdf');
      expect(FileSystemService.getFileExtension(path)).toBe('pdf');
      expect(FileSystemService.isSupportedFileType(path)).toBe(true);
      expect(FileSystemService.getFileTypeLabel(path)).toBe('PDF Document');
      expect(FileSystemService.getFileIcon(path)).toBe('📄');
    });

    it('should handle multiple folder selections with deduplication', () => {
      const folders = ['/home/user', '/home/user/documents', '/home/user', '/var/log'];
      const deduplicated = FileSystemService.deduplicatePaths(folders);
      const filtered = FileSystemService.filterNestedPaths(deduplicated);

      expect(filtered).toContain('/home/user');
      expect(filtered).toContain('/var/log');
      expect(filtered).not.toContain('/home/user/documents');
      expect(filtered.length).toBe(2);
    });

    it('should validate and categorize multiple file types', () => {
      const files = [
        'document.pdf',
        'script.py',
        'data.json',
        'readme.md',
        'image.png',
      ];

      const supported = files.filter(f => FileSystemService.isSupportedFileType(f));
      expect(supported).toHaveLength(4);
      expect(supported).not.toContain('image.png');

      const labels = supported.map(f => FileSystemService.getFileTypeLabel(f));
      expect(labels).toContain('PDF Document');
      expect(labels).toContain('Python');
      expect(labels).toContain('JSON');
      expect(labels).toContain('Markdown');
    });
  });
});
