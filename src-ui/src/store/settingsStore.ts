/**
 * Settings Store
 * Persistent state management for app settings using Zustand
 * Stores folders, files, and preferences across navigation
 */

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface AppSettings {
  autoSync: boolean;
  autoSyncInterval: number;
  themeDark: boolean;
  selectedFolders: string[];
  selectedFiles: string[];
}

interface SettingsStore {
  settings: AppSettings;
  setSettings: (settings: AppSettings) => void;
  updateSetting: <K extends keyof AppSettings>(key: K, value: AppSettings[K]) => void;
  addFolders: (folders: string[]) => void;
  removeFolders: (folders: string[]) => void;
  addFiles: (files: string[]) => void;
  removeFiles: (files: string[]) => void;
  getAllPaths: () => string[];
  clearAll: () => void;
}

const defaultSettings: AppSettings = {
  autoSync: true,
  autoSyncInterval: 300,
  themeDark: false,
  selectedFolders: [],
  selectedFiles: [],
};

export const useSettingsStore = create<SettingsStore>()(
  persist(
    (set, get) => ({
      settings: defaultSettings,

      setSettings: (settings: AppSettings) => {
        set({ settings });
      },

      updateSetting: <K extends keyof AppSettings>(key: K, value: AppSettings[K]) => {
        set((state) => ({
          settings: {
            ...state.settings,
            [key]: value,
          },
        }));
      },

      addFolders: (folders: string[]) => {
        console.log('[SettingsStore] addFolders called with:', folders);
        set((state) => {
          const updated = Array.from(new Set([...state.settings.selectedFolders, ...folders]));
          console.log('[SettingsStore] Updated selectedFolders:', updated);
          return {
            settings: {
              ...state.settings,
              selectedFolders: updated,
            },
          };
        });
      },

      removeFolders: (folders: string[]) => {
        set((state) => ({
          settings: {
            ...state.settings,
            selectedFolders: state.settings.selectedFolders.filter((f) => !folders.includes(f)),
          },
        }));
      },

      addFiles: (files: string[]) => {
        console.log('[SettingsStore] addFiles called with:', files);
        set((state) => {
          const updated = Array.from(new Set([...state.settings.selectedFiles, ...files]));
          console.log('[SettingsStore] Updated selectedFiles:', updated);
          return {
            settings: {
              ...state.settings,
              selectedFiles: updated,
            },
          };
        });
      },

      removeFiles: (files: string[]) => {
        set((state) => ({
          settings: {
            ...state.settings,
            selectedFiles: state.settings.selectedFiles.filter((f) => !files.includes(f)),
          },
        }));
      },

      getAllPaths: () => {
        const state = get();
        const allPaths = [...state.settings.selectedFolders, ...state.settings.selectedFiles];
        console.log('[SettingsStore] getAllPaths returning:', allPaths);
        return allPaths;
      },

      clearAll: () => {
        set({ settings: defaultSettings });
      },
    }),
    {
      name: 'recall-settings',
      version: 1,
    }
  )
);

export default useSettingsStore;
