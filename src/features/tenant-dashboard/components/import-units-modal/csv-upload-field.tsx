"use client";

import { useRef } from "react";
import { Button } from "@/components/ui/button";
import { Upload, Folder, AlertCircle } from "lucide-react";
import { toast } from "@/components/common/toast/toast";
import { useUploadDropzone } from "@/components/common/upload-image/hooks/use-upload-dropzone";
import { cn } from "@/lib/utils";

interface CSVUploadFieldProps {
  selectedFile: File | null;
  onFileSelected: (file: File) => void;
  errors?: string[];
  errorMessage?: string;
}

export function CSVUploadField({
  selectedFile,
  onFileSelected,
  errors,
  errorMessage,
}: CSVUploadFieldProps) {
  const inputRef = useRef<HTMLInputElement | null>(null);

  const handleFilesSelected = (files: File[]) => {
    const file = files[0];
    if (file) {
      onFileSelected(file);
    }
  };

  const { getRootProps, getInputProps, isDragActive } = useUploadDropzone({
    onFilesSelected: handleFilesSelected,
    maxFiles: 1,
    maxSize: 5 * 1024 * 1024,
    accept: {
      "text/csv": [".csv"],
      "application/vnd.ms-excel": [".csv"],
    },
    onError: (error) => {
      toast.error("Upload error", error.message);
    },
    onDropRejected: (fileRejections) => {
      const error = fileRejections[0]?.errors[0];
      if (error?.code === "file-too-large") {
        toast.error("File too large", "File size must be less than 5MB");
      } else if (error?.code === "file-invalid-type") {
        toast.error("Invalid file type", "Only CSV files are accepted");
      }
    },
  });

  const inputProps = getInputProps();
  const dropzoneRef = (inputProps as any).ref;

  return (
    <div className="flex flex-col gap-2">
      <input
        {...inputProps}
        ref={(e) => {
          inputRef.current = e;
          if (typeof dropzoneRef === "function") {
            dropzoneRef(e);
          }
        }}
        className="hidden"
      />
      {!selectedFile ? (
        <div
          {...getRootProps({
            onClick: () => inputRef.current?.click(),
          })}
          className={cn(
            "relative flex flex-col items-center justify-center h-[145px] border-2 border-dashed rounded-xl bg-background transition-colors cursor-pointer",
            isDragActive
              ? "border-primary bg-primary/5"
              : "border-input hover:bg-accent/5"
          )}
        >
          <div className="flex flex-col items-center gap-4 pointer-events-none">
            <Button variant="outline" size="sm" className="gap-2" type="button">
              <Upload className="h-4 w-4" />
              Upload file
            </Button>
            {isDragActive && (
              <p className="text-sm text-primary font-medium">
                Drop CSV file here
              </p>
            )}
          </div>
        </div>
      ) : (
        <div className="flex items-center justify-between border border-accent-border rounded-[10px] pr-3 h-16">
          <div className="flex items-center gap-4">
            <div className="flex items-center justify-center size-16 bg-accent border border-accent-border rounded-l-[10px]">
              <Folder className="h-5 w-5 text-muted-foreground" />
            </div>
            <p className="text-sm font-medium text-foreground">
              {selectedFile.name}
            </p>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => inputRef.current?.click()}
            type="button"
          >
            Replace file
          </Button>
        </div>
      )}

      {errorMessage && (
        <p className="text-sm text-destructive">{errorMessage}</p>
      )}

      {errors && errors.length > 0 && (
        <div className="mt-4 p-4 bg-destructive/10 rounded-lg border border-destructive/20">
          <p className="text-sm font-medium text-destructive mb-2">
            Validation Errors:
          </p>
          <div className="space-y-1">
            {errors.map((error, idx) => (
              <div
                key={idx}
                className="flex items-start gap-2 text-xs text-destructive"
              >
                <AlertCircle className="h-3 w-3 mt-0.5 shrink-0" />
                <span>{error}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
