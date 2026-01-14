import React, { useCallback, useState } from 'react';
import { useGmail, useFileIndexing, useIndexManagement } from '../hooks/useApi';
import FileSystemService from '../services/fileSystem';
import FileDropZone from './FileDropZone';
import { useSettingsStore } from '../store/settingsStore';

interface SettingsProps {
  onSettingsChange?: (settings: any) => void;
}

const tabs = [
  { key: 'general', label: 'General' },
  { key: 'gmail', label: '📧 Gmail' },
  { key: 'files', label: '📁 Files' },
  { key: 'advanced', label: '⚙️ Advanced' },
] as const;

type TabKey = typeof tabs[number]['key'];

export const Settings: React.FC<SettingsProps> = ({ onSettingsChange }) => {
  const { settings, updateSetting, addFolders, removeFolders, addFiles, removeFiles } = useSettingsStore();
  const [activeTab, setActiveTab] = useState<TabKey>('general');

  const gmail = useGmail();
  const fileIndexing = useFileIndexing();
  const indexManagement = useIndexManagement();

  const handleSelectFolders = useCallback(async () => {
    try {
      const result = await FileSystemService.selectFolders();
      if (!result.cancelled && result.paths.length > 0) {
        const validPaths = result.paths.filter((path) => {
          const validation = FileSystemService.validateFolderPath(path);
          return validation.valid;
        });

        if (validPaths.length === 0) {
          alert('No valid folders were selected.');
          return;
        }

        const deduplicated = FileSystemService.deduplicatePaths(validPaths);
        const filtered = FileSystemService.filterNestedPaths(deduplicated);
        addFolders(filtered);
        setTimeout(() => {
          fileIndexing.indexFolders(filtered);
        }, 500);
      }
    } catch (error) {
      console.error('Failed to select folders:', error);
      alert('Failed to select folders. Please try again.');
    }
  }, [addFolders, fileIndexing]);

  const handleRemoveFolder = useCallback((folder: string) => {
    removeFolders([folder]);
  }, [removeFolders]);

  const handleRemoveFile = useCallback((file: string) => {
    removeFiles([file]);
  }, [removeFiles]);

  const handleSelectFiles = useCallback(async () => {
    try {
      const result = await FileSystemService.selectFiles();
      if (!result.cancelled && result.paths.length > 0) {
        const validPaths = result.paths.filter((path) => {
          const validation = FileSystemService.validateFolderPath(path);
          return validation.valid;
        });

        if (validPaths.length === 0) {
          alert('No valid files were selected.');
          return;
        }

        const deduplicated = FileSystemService.deduplicatePaths(validPaths);
        addFiles(deduplicated);
        alert(`${deduplicated.length} files added for indexing.`);
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
      {/* Tabs */}
      <div className="flex gap-1 mb-5 border-b border-gray-200 overflow-x-auto">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`px-4 py-3 text-sm font-medium whitespace-nowrap transition-colors border-b-2 -mb-px
              ${activeTab === tab.key
                ? 'text-indigo-600 border-indigo-600'
                : 'text-gray-500 border-transparent hover:text-gray-700'
              }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="bg-white rounded-xl p-5 border border-gray-200 animate-fade-in">
        {/* General Tab */}
        {activeTab === 'general' && (
          <div className="space-y-6">
            <h2 className="text-lg font-semibold text-gray-900">General Settings</h2>

            <div className="space-y-4">
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.autoSync}
                  onChange={(e) => updateSetting('autoSync', e.target.checked)}
                  className="w-4 h-4 accent-indigo-500"
                />
                <div>
                  <span className="font-medium text-gray-900">Enable auto-sync</span>
                  <p className="text-xs text-gray-500 mt-0.5">
                    Automatically sync Gmail and files at regular intervals
                  </p>
                </div>
              </label>

              {settings.autoSync && (
                <div className="ml-7 flex items-center gap-3">
                  <label className="text-sm text-gray-600">Sync interval (minutes):</label>
                  <input
                    type="number"
                    min="1"
                    max="1440"
                    value={settings.autoSyncInterval}
                    onChange={(e) => updateSetting('autoSyncInterval', parseInt(e.target.value))}
                    className="w-20 px-2 py-1.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-indigo-500"
                  />
                </div>
              )}

              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.themeDark}
                  onChange={(e) => updateSetting('themeDark', e.target.checked)}
                  className="w-4 h-4 accent-indigo-500"
                />
                <div>
                  <span className="font-medium text-gray-900">Dark theme</span>
                  <p className="text-xs text-gray-500 mt-0.5">Enable dark mode for the interface</p>
                </div>
              </label>
            </div>
          </div>
        )}

        {/* Gmail Tab */}
        {activeTab === 'gmail' && (
          <div className="space-y-6">
            <h2 className="text-lg font-semibold text-gray-900">Gmail Settings</h2>

            <div>
              <h3 className="text-sm font-medium text-gray-900 mb-3">Connection Status</h3>
              <div
                className={`px-4 py-3 rounded-lg flex items-center gap-2 text-sm font-medium
                  ${gmail.connected
                    ? 'bg-green-50 border border-green-200 text-green-700'
                    : 'bg-red-50 border border-red-200 text-red-700'
                  }`}
              >
                <span className="text-lg">{gmail.connected ? '✓' : '○'}</span>
                <span>{gmail.connected ? 'Gmail Connected' : 'Gmail Disconnected'}</span>
              </div>

              {gmail.error && (
                <div className="mt-3 px-4 py-2 bg-red-50 text-red-600 rounded-lg text-sm border-l-4 border-red-500">
                  {gmail.error}
                </div>
              )}

              <div className="flex gap-2 mt-4 flex-wrap">
                {!gmail.connected ? (
                  <button
                    onClick={() => gmail.connect()}
                    className="px-4 py-2.5 text-sm font-medium text-white bg-indigo-500 rounded-lg
                      hover:bg-indigo-600 transition-colors"
                  >
                    🔐 Connect Gmail
                  </button>
                ) : (
                  <>
                    <button
                      onClick={() => gmail.sync()}
                      disabled={gmail.syncing}
                      className="px-4 py-2.5 text-sm font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded-lg
                        hover:bg-gray-200 disabled:opacity-60 transition-colors"
                    >
                      {gmail.syncing ? '↻ Syncing...' : '↻ Sync Now'}
                    </button>
                    <button
                      onClick={() => gmail.disconnect()}
                      className="px-4 py-2.5 text-sm font-medium text-white bg-red-500 rounded-lg
                        hover:bg-red-600 transition-colors"
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
          <div className="space-y-6">
            <h2 className="text-lg font-semibold text-gray-900">File Indexing</h2>

            {/* Folders */}
            <div>
              <h3 className="text-sm font-medium text-gray-900 mb-2">Indexed Folders</h3>
              <p className="text-xs text-gray-500 mb-3">Select folders to index for full-text search</p>

              <div className="bg-gray-50 rounded-lg p-3 max-h-48 overflow-y-auto border border-gray-200">
                {settings.selectedFolders.length === 0 ? (
                  <p className="text-center text-gray-400 text-xs py-3 italic">No folders selected</p>
                ) : (
                  <div className="space-y-1">
                    {settings.selectedFolders.map((folder) => (
                      <div key={folder} className="flex justify-between items-center p-2 bg-white rounded border border-gray-100 text-xs">
                        <button
                          onClick={() => handleOpenFolder(folder)}
                          className="text-indigo-600 hover:text-indigo-800 text-left flex-1 truncate"
                        >
                          📁 {folder}
                        </button>
                        <button
                          onClick={() => handleRemoveFolder(folder)}
                          className="text-gray-400 hover:text-red-500 text-lg ml-2"
                        >
                          ✕
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="flex gap-2 mt-3">
                <button
                  onClick={handleSelectFolders}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded-lg
                    hover:bg-gray-200 transition-colors"
                >
                  📁 Add Folder
                </button>
                <button
                  onClick={handleSelectFiles}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded-lg
                    hover:bg-gray-200 transition-colors"
                >
                  📎 Add Files
                </button>
              </div>
            </div>

            {/* Individual Files */}
            <div>
              <h3 className="text-sm font-medium text-gray-900 mb-2">Individual Files</h3>
              <p className="text-xs text-gray-500 mb-3">Selected individual files for indexing</p>

              <div className="bg-gray-50 rounded-lg p-3 max-h-36 overflow-y-auto border border-gray-200">
                {settings.selectedFiles.length === 0 ? (
                  <p className="text-center text-gray-400 text-xs py-3 italic">No files selected</p>
                ) : (
                  <div className="space-y-1">
                    {settings.selectedFiles.map((file) => (
                      <div key={file} className="flex justify-between items-center p-2 bg-white rounded border border-gray-100 text-xs">
                        <span className="text-gray-700 truncate flex-1">
                          📄 {FileSystemService.getFileName(file)}
                        </span>
                        <button
                          onClick={() => handleRemoveFile(file)}
                          className="text-gray-400 hover:text-red-500 text-lg ml-2"
                        >
                          ✕
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Drop Zone */}
            <FileDropZone
              onFilesDropped={(files) => {
                const fileNames = files.map((file) => file.name);
                alert(`${files.length} files dropped for indexing: ${fileNames.join(', ')}`);
              }}
            >
              <div className="py-8 text-center opacity-70">
                <p className="text-sm text-gray-600">📁 Drag & drop files here to index</p>
                <p className="text-xs text-gray-500 mt-2">Or add individual files using the buttons above</p>
              </div>
            </FileDropZone>

            {/* Indexing Status */}
            {(settings.selectedFolders.length > 0 || settings.selectedFiles.length > 0) && (
              <div className="pt-4 border-t border-gray-200">
                <h3 className="text-sm font-medium text-gray-900 mb-2">Indexing Status</h3>
                {fileIndexing.indexing && (
                  <div className="text-orange-600 font-medium text-sm">
                    ⏳ Indexing {settings.selectedFolders.length} folder(s) and {settings.selectedFiles.length} file(s)...
                  </div>
                )}
                {!fileIndexing.indexing && fileIndexing.lastResult && (
                  <div className="px-3 py-2 bg-green-50 text-green-700 rounded-lg text-sm border-l-4 border-green-500">
                    ✓ Indexed {fileIndexing.lastResult.indexed_count} files
                  </div>
                )}
                {fileIndexing.error && (
                  <div className="px-3 py-2 bg-red-50 text-red-600 rounded-lg text-sm border-l-4 border-red-500">
                    ✕ {fileIndexing.error}
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* Advanced Tab */}
        {activeTab === 'advanced' && (
          <div className="space-y-6">
            <h2 className="text-lg font-semibold text-gray-900">Advanced Settings</h2>

            {/* Danger Zone */}
            <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg">
              <h3 className="text-sm font-semibold text-gray-900 mb-2">⚠️ Danger Zone</h3>
              <p className="text-xs text-gray-600 mb-4">
                These actions are irreversible. Proceed with caution.
              </p>
              <button
                onClick={() => indexManagement.deleteIndex()}
                disabled={indexManagement.deleting}
                className="px-4 py-2.5 text-sm font-medium text-white bg-red-500 rounded-lg
                  hover:bg-red-600 disabled:opacity-60 transition-colors"
              >
                {indexManagement.deleting ? '⏳ Deleting...' : '🗑️ Delete All Data'}
              </button>
              <p className="text-xs text-gray-500 mt-3">
                Permanently delete all indexed Gmail messages and files.
              </p>
              {indexManagement.error && (
                <div className="mt-3 px-3 py-2 bg-red-50 text-red-600 rounded-lg text-sm border-l-4 border-red-500">
                  {indexManagement.error}
                </div>
              )}
            </div>

            {/* Info */}
            <div>
              <h3 className="text-sm font-medium text-gray-900 mb-2">Information</h3>
              <p className="text-xs text-gray-500"><strong>Version:</strong> 1.0.0</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Settings;
