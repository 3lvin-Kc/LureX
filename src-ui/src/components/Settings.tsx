import React, { useCallback } from 'react';
import { useGmail, useFileIndexing, useIndexManagement } from '../hooks/useApi';
import FileSystemService from '../services/fileSystem';
import FileDropZone from './FileDropZone';
import { useSettingsStore } from '../store/settingsStore';


interface SettingsProps {
  onSettingsChange?: (settings: any) => void;
}

/**
 * Settings Component - App configuration interface
 * Features:
 * - Gmail connection management
 * - File indexing configuration
 * - General preferences
 * - Index management
 */
export const Settings: React.FC<SettingsProps> = ({ onSettingsChange }) => {
  const { settings, updateSetting, addFolders, removeFolders, addFiles, removeFiles } =
    useSettingsStore();
  const [activeTab, setActiveTab] = React.useState<'general' | 'gmail' | 'files' | 'advanced'>(
    'general'
  );

  const gmail = useGmail();
  const fileIndexing = useFileIndexing();
  const indexManagement = useIndexManagement();

  const handleSettingChange = useCallback(
    <K extends keyof typeof settings>(key: K, value: (typeof settings)[K]) => {
      updateSetting(key, value);
      onSettingsChange?.(settings);
    },
    [updateSetting, onSettingsChange, settings]
  );

  const handleSelectFolders = useCallback(async () => {
    try {
      const result = await FileSystemService.selectFolders();

      if (!result.cancelled && result.paths.length > 0) {
        // Validate all paths and filter nested ones
        const validPaths = result.paths.filter((path) => {
          const validation = FileSystemService.validateFolderPath(path);
          if (!validation.valid) {
            console.warn(`Invalid path: ${path} - ${validation.error}`);
          }
          return validation.valid;
        });

        if (validPaths.length === 0) {
          alert('No valid folders were selected.');
          return;
        }

        // Remove duplicates and nested paths
        const deduplicated = FileSystemService.deduplicatePaths(validPaths);
        const filtered = FileSystemService.filterNestedPaths(deduplicated);
        addFolders(filtered);
        // Auto-index after folders are added
        console.log('[Settings] Auto-indexing folders:', filtered);
        setTimeout(() => {
          fileIndexing.indexFolders(filtered);
        }, 500);
      }
    } catch (error) {
      console.error('Failed to select folders:', error);
      alert('Failed to select folders. Please try again.');
    }
  }, [addFolders, fileIndexing]);

  const handleRemoveFolder = useCallback(
    (folder: string) => {
      removeFolders([folder]);
    },
    [removeFolders]
  );

  const handleRemoveFile = useCallback(
    (file: string) => {
      removeFiles([file]);
    },
    [removeFiles]
  );

  const handleSelectFiles = useCallback(async () => {
    try {
      const result = await FileSystemService.selectFiles();

      if (!result.cancelled && result.paths.length > 0) {
        // Validate all paths and filter
        const validPaths = result.paths.filter((path) => {
          const validation = FileSystemService.validateFolderPath(path);
          if (!validation.valid) {
            console.warn(`Invalid path: ${path} - ${validation.error}`);
          }
          return validation.valid;
        });

        if (validPaths.length === 0) {
          alert('No valid files were selected.');
          return;
        }

        // Remove duplicates
        const deduplicated = FileSystemService.deduplicatePaths(validPaths);
        addFiles(deduplicated);
        alert(`${deduplicated.length} files added for indexing.`);
        // Auto-index after files are added
        console.log('[Settings] Auto-indexing files:', deduplicated);
        setTimeout(() => {
          fileIndexing.indexFolders(deduplicated);
        }, 500);
      }
    } catch (error) {
      console.error('Failed to select files:', error);
      alert('Failed to select files. Please try again.');
    }
  }, [addFiles, fileIndexing]);

  const handleOpenFolder = useCallback(async (folderPath: string) => {
    try {
      await FileSystemService.openFolder(folderPath);
    } catch (error) {
      console.error('Failed to open folder:', error);
      alert('Failed to open folder.');
    }
  }, []);

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex gap-2 mb-5 border-b-2 border-gray-300 overflow-x-auto">
        <button
          className={`px-5 py-3 bg-none border-none border-b-3 border-transparent cursor-pointer text-sm font-medium text-gray-600 transition-all duration-200 whitespace-nowrap ${activeTab === 'general' ? 'text-blue-500 border-blue-500' : 'hover:text-gray-900'}`}
          onClick={() => setActiveTab('general')}
        >
          General
        </button>
        <button
          className={`px-5 py-3 bg-none border-none border-b-3 border-transparent cursor-pointer text-sm font-medium text-gray-600 transition-all duration-200 whitespace-nowrap ${activeTab === 'gmail' ? 'text-blue-500 border-blue-500' : 'hover:text-gray-900'}`}
          onClick={() => setActiveTab('gmail')}
        >
          📧 Gmail
        </button>
        <button
          className={`px-5 py-3 bg-none border-none border-b-3 border-transparent cursor-pointer text-sm font-medium text-gray-600 transition-all duration-200 whitespace-nowrap ${activeTab === 'files' ? 'text-blue-500 border-blue-500' : 'hover:text-gray-900'}`}
          onClick={() => setActiveTab('files')}
        >
          📁 Files
        </button>
        <button
          className={`px-5 py-3 bg-none border-none border-b-3 border-transparent cursor-pointer text-sm font-medium text-gray-600 transition-all duration-200 whitespace-nowrap ${activeTab === 'advanced' ? 'text-blue-500 border-blue-500' : 'hover:text-gray-900'}`}
          onClick={() => setActiveTab('advanced')}
        >
          ⚙️ Advanced
        </button>
      </div>

      <div className="bg-white rounded-xl p-5 animate-fade-in">
        {/* General Tab */}
        {activeTab === 'general' && (
          <div className="mb-6">
            <h2 className="m-0 mb-4 text-xl text-gray-900">General Settings</h2>

            <div className="setting-item">
              <label>
                <input
                  type="checkbox"
                  checked={settings.autoSync}
                  onChange={(e) => updateSetting('autoSync', e.target.checked)}
                />
                <span>Enable auto-sync</span>
              </label>
              <p className="m-0 mt-2 text-xs text-gray-600 leading-relaxed">
                Automatically sync Gmail and files at regular intervals
              </p>
            </div>

            {settings.autoSync && (
              <div className="setting-item">
                <label>
                  Sync interval (minutes):
                  <input
                    type="number"
                    min="1"
                    max="1440"
                    value={settings.autoSyncInterval}
                    onChange={(e) => updateSetting('autoSyncInterval', parseInt(e.target.value))}
                  />
                </label>
                <p className="setting-description">
                  How often to automatically sync content (1-1440 minutes)
                </p>
              </div>
            )}

            <div className="setting-item">
              <label>
                <input
                  type="checkbox"
                  checked={settings.themeDark}
                  onChange={(e) => updateSetting('themeDark', e.target.checked)}
                />
                <span>Dark theme</span>
              </label>
              <p className="m-0 mt-2 text-xs text-gray-600 leading-relaxed">Enable dark mode for the interface</p>
            </div>
          </div>
        )}

        {/* Gmail Tab */}
        {activeTab === 'gmail' && (
          <div className="mb-6">
            <h2 className="m-0 mb-4 text-xl text-gray-900">Gmail Settings</h2>

            <div className="mb-5 pb-5 border-b border-gray-200">
              <h3 className="m-0 mb-3 text-sm text-gray-900 font-semibold">Connection Status</h3>
              <div
                className={`p-3 rounded-lg flex items-center gap-2 my-3 font-medium text-sm ${gmail.connected ? 'bg-green-100 border border-green-300 text-green-800' : 'bg-red-100 border border-red-300 text-red-800'}`}
              >
                <span className="text-lg">{gmail.connected ? '✓' : '○'}</span>
                <span>{gmail.connected ? 'Gmail Connected' : 'Gmail Disconnected'}</span>
              </div>

              {gmail.error && <div className="error-message">{gmail.error}</div>}

              <div className="flex gap-2 flex-wrap">
                {!gmail.connected ? (
                  <button className="px-4 py-2.5 border-none rounded-lg cursor-pointer text-sm font-medium transition-all duration-200 bg-blue-500 text-white hover:bg-blue-600 hover:-translate-y-0.5 hover:shadow-md disabled:opacity-60 disabled:cursor-not-allowed disabled:transform-none" onClick={() => gmail.connect()}>
                    🔐 Connect Gmail
                  </button>
                ) : (
                  <>
                    <button
                      className="px-4 py-2.5 border-none rounded-lg cursor-pointer text-sm font-medium transition-all duration-200 bg-gray-200 text-gray-800 border border-gray-300 hover:bg-gray-300 disabled:opacity-60 disabled:cursor-not-allowed disabled:transform-none"
                      onClick={() => gmail.sync()}
                      disabled={gmail.syncing}
                    >
                      {gmail.syncing ? '↻ Syncing...' : '↻ Sync Now'}
                    </button>
                    <button
                      className="px-4 py-2.5 border-none rounded-lg cursor-pointer text-sm font-medium transition-all duration-200 bg-red-600 text-white hover:bg-red-700 disabled:opacity-60 disabled:cursor-not-allowed disabled:transform-none"
                      onClick={() => gmail.disconnect()}
                      disabled={gmail.error !== null}
                    >
                      🔓 Disconnect
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Files Tab */}
        {activeTab === 'files' && (
          <div className="mb-6">
            <h2 className="m-0 mb-4 text-xl text-gray-900">File Indexing</h2>

            <div className="setting-item">
              <h3>Indexed Folders</h3>
              <p className="setting-description">Select folders to index for full-text search</p>

              <div className="bg-gray-100 rounded-lg p-3 my-3 max-h-50 overflow-y-auto">
                {settings.selectedFolders.length === 0 ? (
                  <p className="text-center text-gray-500 text-xs my-3 italic">No folders selected</p>
                ) : (
                  settings.selectedFolders.map((folder) => (
                    <div key={folder} className="flex justify-between items-center p-2 bg-white rounded-sm mb-1 text-xs gap-2">
                      <button
                        className="flex-1 bg-none border-none cursor-pointer p-0 text-xs text-blue-500 text-left transition-colors duration-150 no-underline font-inherit hover:text-blue-700"
                        onClick={() => handleOpenFolder(folder)}
                        title="Open folder"
                      >
                        📁 {folder}
                      </button>
                      <button
                        className="bg-none border-none cursor-pointer text-lg text-gray-500 p-0 transition-colors duration-150 hover:text-red-600"
                        onClick={() => handleRemoveFolder(folder)}
                        title="Remove folder"
                      >
                        ✕
                      </button>
                    </div>
                  ))
                )}
              </div>

              <div className="button-group">
                <button className="px-4 py-2.5 border-none rounded-lg cursor-pointer text-sm font-medium transition-all duration-200 bg-gray-200 text-gray-800 border border-gray-300 hover:bg-gray-300 disabled:opacity-60 disabled:cursor-not-allowed disabled:transform-none" onClick={handleSelectFolders}>
                  📁 Add Folder
                </button>
                <button className="px-4 py-2.5 border-none rounded-lg cursor-pointer text-sm font-medium transition-all duration-200 bg-gray-200 text-gray-800 border border-gray-300 hover:bg-gray-300 disabled:opacity-60 disabled:cursor-not-allowed disabled:transform-none" onClick={handleSelectFiles}>
                  📎 Add Files
                </button>
              </div>

              <h3 className="mt-6">Individual Files</h3>
              <p className="setting-description">Selected individual files for indexing</p>

              <div className="folder-list">
                {settings.selectedFiles.length === 0 ? (
                  <p className="text-center text-gray-500 text-xs my-3 italic">No files selected</p>
                ) : (
                  settings.selectedFiles.map((file) => (
                    <div key={file} className="folder-item">
                      <span className="flex-1 bg-none border-none cursor-default p-0 text-xs text-blue-500 text-left font-inherit" title={file}>
                        📄 {FileSystemService.getFileName(file)}
                      </span>
                      <button
                        className="bg-none border-none cursor-pointer text-lg text-gray-500 p-0 transition-colors duration-150 hover:text-red-600"
                        onClick={() => handleRemoveFile(file)}
                        title="Remove file"
                      >
                        ✕
                      </button>
                    </div>
                  ))
                )}
              </div>
              <div className="mt-5 min-h-50">
                <FileDropZone
                  onFilesDropped={(files) => {
                    const fileNames = files.map((file) => file.name);
                    alert(`${files.length} files dropped for indexing: ${fileNames.join(', ')}`);
                  }}
                >
                  <div className="p-5 opacity-70">
                    <p>📁 Drag & drop files here to index</p>
                    <p className="text-sm mt-2.5">
                      Or add individual files using the "Add Files" button
                    </p>
                  </div>
                </FileDropZone>
              </div>
            </div>

            {(settings.selectedFolders.length > 0 || settings.selectedFiles.length > 0) && (
              <div className="mb-5 pb-5 border-b border-gray-200">
                <h3>Indexing Status</h3>
                <p className="setting-description">
                  Files are indexed automatically when you add them.
                </p>

                <div className="mt-3">
                  {fileIndexing.indexing && (
                    <div className="text-orange-500 font-bold">
                      ⏳ Indexing {settings.selectedFolders.length} folder(s) and{' '}
                      {settings.selectedFiles.length} file(s)...
                    </div>
                  )}

                  {!fileIndexing.indexing && fileIndexing.lastResult && (
                    <div className="mt-2 p-2 bg-green-100 text-green-800 rounded-lg text-xs border-l-4 border-green-500">
                      ✓ Indexed {fileIndexing.lastResult.indexed_count} files
                    </div>
                  )}

                  {fileIndexing.error && (
                    <div className="mt-2 p-2 bg-red-100 text-red-800 rounded-lg text-xs border-l-4 border-red-500">✕ {fileIndexing.error}</div>
                  )}
                </div>

                {!fileIndexing.indexing && !fileIndexing.lastResult && (
                  <p className="text-gray-500 mt-3">
                    Selected: {settings.selectedFolders.length} folder(s) and{' '}
                    {settings.selectedFiles.length} file(s)
                  </p>
                )}
              </div>
            )}
          </div>
        )}

        {/* Advanced Tab */}
        {activeTab === 'advanced' && (
          <div className="settings-section">
            <h2>Advanced Settings</h2>

            <div className="mb-5 pb-5 border-b border-gray-200 bg-yellow-50 border border-yellow-300 rounded-lg p-4">
              <h3>⚠️ Danger Zone</h3>
              <p className="m-0 mt-2 text-xs text-gray-600 leading-relaxed">
                These actions are irreversible. Proceed with caution.
              </p>

              <button
                className="px-4 py-2.5 border-none rounded-lg cursor-pointer text-sm font-medium transition-all duration-200 bg-red-600 text-white hover:bg-red-700 disabled:opacity-60 disabled:cursor-not-allowed disabled:transform-none"
                onClick={() => indexManagement.deleteIndex()}
                disabled={indexManagement.deleting}
              >
                {indexManagement.deleting ? '⏳ Deleting...' : '🗑️ Delete All Data'}
              </button>

              <p className="setting-description">
                Permanently delete all indexed Gmail messages and files.
              </p>

              {indexManagement.error && (
                <div className="mt-2 p-2 bg-red-100 text-red-800 rounded-lg text-xs border-l-4 border-red-500">{indexManagement.error}</div>
              )}
            </div>

            <div className="setting-item">
              <h3>Information</h3>
              <p className="setting-description">
                <strong>Version:</strong> 1.0.0
              </p>
              <p className="setting-description">
                <strong>Backend:</strong> Rust + Tauri
              </p>
              <p className="setting-description">
                <strong>Database:</strong> SQLite with FTS5
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Settings;
