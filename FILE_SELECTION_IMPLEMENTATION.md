# File Selection Implementation - RecallDesk

**Date:** 2026-01-14  
**Status:** ✅ IMPLEMENTED  
**Feature:** Individual File Selection for Indexing

---

## Overview

RecallDesk now supports selecting **individual files** separately from folders for indexing. Previously, only folders could be added to the indexed content list.

## Changes Made

### 1. Data Structure Enhancement

**File:** `src-ui/src/components/Settings.tsx`

Added `selectedFiles` to the `AppSettings` interface:

```typescript
interface AppSettings {
  autoSync: boolean;
  autoSyncInterval: number;
  themeDark: boolean;
  selectedFolders: string[];
  selectedFiles: string[];  // NEW: Track individual files
}
```

### 2. File Selection Handler

**File:** `src-ui/src/components/Settings.tsx` (Lines 90-118)

Implemented `handleSelectFiles()` to:
- Open file dialog
- Validate selected file paths
- Deduplicate files
- Add to state
- Show success notification

```typescript
const handleSelectFiles = async () => {
  try {
    const result = await FileSystemService.selectFiles();

    if (!result.cancelled && result.paths.length > 0) {
      // Validate all paths
      const validPaths = result.paths.filter((path) => {
        const validation = FileSystemService.validateFolderPath(path);
        return validation.valid;
      });

      // Remove duplicates
      const deduplicated = FileSystemService.deduplicatePaths(validPaths);
      const updated = [...settings.selectedFiles, ...deduplicated];
      const unique = FileSystemService.deduplicatePaths(updated);
      
      handleSettingChange('selectedFiles', unique);
      alert(`${unique.length} files added for indexing.`);
    }
  } catch (error) {
    console.error('Failed to select files:', error);
    alert('Failed to select files. Please try again.');
  }
};
```

### 3. File Removal Handler

**File:** `src-ui/src/components/Settings.tsx` (Lines 86-89)

Added ability to remove individual files from the list:

```typescript
const handleRemoveFile = (index: number) => {
  const updated = settings.selectedFiles.filter((_, i) => i !== index);
  handleSettingChange('selectedFiles', updated);
};
```

### 4. UI Display for Selected Files

**File:** `src-ui/src/components/Settings.tsx` (Lines 304-327)

Added new section to display selected individual files:

```typescript
<h3 style={{ marginTop: '24px' }}>Individual Files</h3>
<p className="setting-description">Selected individual files for indexing</p>

<div className="folder-list">
  {settings.selectedFiles.length === 0 ? (
    <p className="empty-message">No files selected</p>
  ) : (
    settings.selectedFiles.map((file) => (
      <div key={file} className="folder-item">
        <span className="folder-link" style={{ cursor: 'default' }} title={file}>
          📄 {FileSystemService.getFileName(file)}
        </span>
        <button
          className="btn-remove"
          onClick={() => handleRemoveFile(settings.selectedFiles.indexOf(file))}
          title="Remove file"
        >
          ✕
        </button>
      </div>
    ))
  )}
</div>
```

### 5. Combined Indexing

**File:** `src-ui/src/components/Settings.tsx` (Lines 344-358)

Updated "Index Now" button to index both folders AND individual files:

```typescript
{(settings.selectedFolders.length > 0 || settings.selectedFiles.length > 0) && (
  <div className="setting-item">
    <h3>Index Now</h3>
    <button
      className="btn-primary"
      onClick={() => {
        const allPaths = [...settings.selectedFolders, ...settings.selectedFiles];
        fileIndexing.indexFolders(allPaths);
      }}
      disabled={fileIndexing.indexing}
    >
      {fileIndexing.indexing ? '⏳ Indexing...' : '📑 Index Now'}
    </button>
    <p className="setting-description">
      {fileIndexing.indexing
        ? 'Indexing files...'
        : `Index ${settings.selectedFolders.length} folder(s) and ${settings.selectedFiles.length} file(s)`}
    </p>
  </div>
)}
```

## User Workflow

### Adding Individual Files

1. Navigate to **⚙️ Settings** → **📁 Files** tab
2. Click **"📎 Add Files"** button
3. Select one or more files from the dialog
4. Files appear in the **"Individual Files"** section with 📄 icon
5. Click **"📑 Index Now"** to index both folders and files

### Removing Files

1. In the **"Individual Files"** section
2. Click **✕** next to any file to remove it
3. File is removed from the list

### Indexing

- The **"📑 Index Now"** button now indexes:
  - All selected folders
  - All selected individual files
  - In a single operation

## Technical Details

### Path Validation

Individual files go through the same validation as folders:
- Windows drive letters allowed (`C:\...`)
- Invalid characters rejected (`< > " | ? *`)
- Duplicates removed automatically

### File Display

Files show their **filename only** (not full path) for readability:
- Full path available in title attribute (hover to see)
- Uses `FileSystemService.getFileName()` utility

### Indexing Backend

The backend (`src-tauri/src`) already supports both:
- Directory indexing
- Individual file indexing

Frontend passes all paths as a combined array to `index_files_command`.

## User Interface Updates

### Settings Page Layout

**Before:**
```
Files Tab
├── Indexed Folders
│   └── [Folder list with Add Folder button]
└── Drag & drop zone
```

**After:**
```
Files Tab
├── Indexed Folders
│   └── [Folder list with Add Folder / Add Files buttons]
├── Individual Files (NEW)
│   └── [File list with file names and remove buttons]
├── Drag & drop zone
└── Index Now (updated description)
```

## Testing Checklist

- [ ] Navigate to Settings → Files tab
- [ ] Click "📎 Add Files"
- [ ] Select multiple individual files (e.g., `.txt`, `.pdf`)
- [ ] Verify files appear in "Individual Files" section
- [ ] Verify full path shows on hover
- [ ] Click ✕ to remove a file
- [ ] Verify file is removed from list
- [ ] Click "📑 Index Now" with both folders and files selected
- [ ] Verify description shows correct counts: "Index X folder(s) and Y file(s)"
- [ ] Verify indexing completes successfully
- [ ] Verify indexed files appear in search results

## Browser Compatibility

- Works in Tauri desktop app ✅
- `FileSystemService.selectFiles()` uses Tauri dialog plugin
- Not functional in browser mode (gracefully returns null)

## Future Enhancements

1. **File Type Filtering** - Show only supported file types in dialog
2. **Drag & Drop Files** - Implement file drag-drop handling in zone
3. **File Preview** - Show file count, size, type before indexing
4. **Bulk Remove** - Select and remove multiple files at once
5. **File Scheduling** - Watch files for changes and auto-reindex
6. **Recent Files** - Quick access to recently selected files

---

**Implementation Status:** ✅ COMPLETE  
**Ready for Testing:** YES