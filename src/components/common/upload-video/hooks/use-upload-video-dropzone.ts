"use client";

import * as React from "react";
import { useDropzone, type DropzoneOptions } from "react-dropzone";

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

interface UseUploadVideoDropzoneOptions {
  onFilesSelected: (files: File[]) => void;
  maxFiles?: number;
  maxSize?: number;
  accept?: Record<string, string[]>;
  onError?: (error: Error) => void;
  onDropRejected?: (fileRejections: any[]) => void;
}

export function useUploadVideoDropzone({
  onFilesSelected,
  maxFiles = 100,
  maxSize = 500 * 1024 * 1024,
  accept = {
    "video/mp4": [".mp4"],
    "video/quicktime": [".mov"],
    "video/x-msvideo": [".avi"],
    "video/webm": [".webm"],
  },
  onError,
  onDropRejected,
}: UseUploadVideoDropzoneOptions) {
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
  };

  return useDropzone(dropzoneOptions);
}
