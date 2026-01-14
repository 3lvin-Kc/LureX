import React, { useCallback, useState } from 'react';
import { handleDragEnter, handleDragOver, handleDragLeave, handleDrop } from '../utils/dragDropHandler';

interface FileDropZoneProps {
  onFilesDropped: (files: File[]) => void;
  children: React.ReactNode;
}

const FileDropZone: React.FC<FileDropZoneProps> = ({ onFilesDropped, children }) => {
  const [isDragging, setIsDragging] = useState(false);

  const onDragEnter = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    handleDragEnter(e);
    setIsDragging(true);
  }, []);

  const onDragOver = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    handleDragOver(e);
  }, []);

  const onDragLeave = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    handleDragLeave(e);
    setIsDragging(false);
  }, []);

  const onDrop = useCallback(async (e: React.DragEvent<HTMLDivElement>) => {
    const result = await handleDrop(e);
    setIsDragging(false);
    if (!result.cancelled && result.files.length > 0) {
      onFilesDropped(result.files);
    }
  }, [onFilesDropped]);

  return (
    <div
      onDragEnter={onDragEnter}
      onDragOver={onDragOver}
      onDragLeave={onDragLeave}
      onDrop={onDrop}
      className={`relative border-2 border-dashed rounded-xl p-5 text-center transition-all duration-200
        ${isDragging
          ? 'border-indigo-500 bg-indigo-50'
          : 'border-gray-300 hover:border-gray-400'
        }`}
    >
      {children}
      {isDragging && (
        <div className="absolute inset-0 bg-white/90 flex items-center justify-center z-10 rounded-xl">
          <h3 className="text-indigo-600 font-semibold">Drop files here</h3>
        </div>
      )}
    </div>
  );
};

export default FileDropZone;
