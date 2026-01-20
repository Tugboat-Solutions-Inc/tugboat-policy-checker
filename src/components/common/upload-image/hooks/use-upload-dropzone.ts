"use client";

import * as React from "react";
import { useDropzone, type DropzoneOptions } from "react-dropzone";

// Custom file getter to avoid File System Access API errors
async function getFilesFromEvent(event: any): Promise<File[]> {
  const files: File[] = [];
  const fileList = event.dataTransfer
    ? event.dataTransfer.files
    : event.target.files;

  for (let i = 0; i < fileList.length; i++) {
    const file = fileList.item(i);
    if (file) {
      files.push(file);
    }
  }

  return files;
}

interface UseUploadDropzoneOptions {
  onFilesSelected: (files: File[]) => void;
  maxFiles?: number;
  maxSize?: number;
  accept?: Record<string, string[]>;
  onError?: (error: Error) => void;
  onDropRejected?: (fileRejections: any[]) => void;
}

export function useUploadDropzone({
  onFilesSelected,
  maxFiles = 100,
  maxSize = 20 * 1024 * 1024,
  accept = {
    "image/jpeg": [".jpg", ".jpeg"],
    "image/png": [".png"],
    "image/webp": [".webp"],
  },
  onError,
  onDropRejected,
}: UseUploadDropzoneOptions) {
  const onDrop = React.useCallback(
    (acceptedFiles: File[], fileRejections: any[]) => {
      if (fileRejections.length > 0 && onDropRejected) {
        onDropRejected(fileRejections);
      }
      if (acceptedFiles.length > 0) {
        onFilesSelected(acceptedFiles);
      }
    },
    [onFilesSelected, onDropRejected]
  );

  const dropzoneOptions: DropzoneOptions = {
    onDrop,
    accept,
    maxFiles,
    maxSize,
    multiple: maxFiles > 1,
    useFsAccessApi: false,
    getFilesFromEvent,
    onError,
    noClick: false,
    noKeyboard: false,
  };

  return useDropzone(dropzoneOptions);
}
