"use client";
import * as React from "react";
import Image from "next/image";
import { Pencil, CircleAlert, X, RotateCcw, Loader2 } from "lucide-react";
import { cn, formatDate } from "@/lib/utils";
import { StatusChip } from "@/components/ui/status-chip";
import { useState, useCallback, useRef, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Spinner } from "@/components/ui/spinner";
import { env } from "@/lib/env";
import { UploadStatus } from "@/features/collection-details/types/upload.types";

type SaveStatus = "idle" | "saving" | "error";

export interface CollectionListItemProps
  extends React.HTMLAttributes<HTMLDivElement> {
  image: string;
  title: string;
  photoCount: number;
  itemCount: number;
  showDuplicates?: boolean;
  notes?: string;
  notesPlaceholder?: string;
  completionPercentage?: number;
  status?: UploadStatus;
  date?: string;
  onNotesEdit?: (value: string) => Promise<{ success: boolean }>;
  onRetry?: () => Promise<void>;
  viewOnly?: boolean;
}

export function CollectionListItem({
  className,
  image,
  title,
  photoCount,
  itemCount,
  showDuplicates = false,
  notes,
  notesPlaceholder = "Add notes...",
  completionPercentage,
  status,
  date,
  onNotesEdit,
  onRetry,
  viewOnly = false,
  ...props
}: CollectionListItemProps) {
  const [note, setNote] = useState(notes ?? "");
  const hasNotes = note && note.trim().length > 0;
  const [isEditing, setIsEditing] = useState(false);
  const [saveStatus, setSaveStatus] = useState<SaveStatus>("idle");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isRetrying, setIsRetrying] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const originalNoteRef = useRef(notes ?? "");

  useEffect(() => {
    if (notes !== undefined) {
      setNote(notes);
      originalNoteRef.current = notes;
    }
  }, [notes]);

  const handleSave = useCallback(
    async (value: string) => {
      if (!onNotesEdit) return;
      if (value === originalNoteRef.current) {
        setIsEditing(false);
        return;
      }

      setSaveStatus("saving");
      setErrorMessage(null);

      try {
        const result = await onNotesEdit(value);
        if (result.success) {
          setNote(value);
          originalNoteRef.current = value;
          setSaveStatus("idle");
          setIsEditing(false);
        } else {
          setSaveStatus("error");
          setErrorMessage("Failed to save");
        }
      } catch {
        setSaveStatus("error");
        setErrorMessage("Failed to save");
      }
    },
    [onNotesEdit]
  );

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    const value = (e.target as HTMLInputElement).value;

    if (e.key === "Enter" && saveStatus !== "saving") {
      e.preventDefault();
      handleSave(value);
    }

    if (e.key === "Escape") {
      if (saveStatus === "saving") return;
      setNote(originalNoteRef.current);
      setSaveStatus("idle");
      setErrorMessage(null);
      setIsEditing(false);
    }
  };

  const handleBlur = () => {
    if (saveStatus === "saving") return;
    const value = inputRef.current?.value ?? note;
    if (value !== originalNoteRef.current) {
      handleSave(value);
    } else {
      setIsEditing(false);
    }
  };

  const handleNotesRetry = () => {
    const value = inputRef.current?.value ?? note;
    handleSave(value);
  };

  const handleCancel = () => {
    setNote(originalNoteRef.current);
    setSaveStatus("idle");
    setErrorMessage(null);
    setIsEditing(false);
  };

  const handleUploadRetry = async () => {
    if (!onRetry || isRetrying) return;
    setIsRetrying(true);
    try {
      await onRetry();
    } finally {
      setIsRetrying(false);
    }
  };

  const getStatusVariant = () => {
    if (status === "COMPLETED") return "success";
    if (status === "FAILED") return "danger";
    return "warning";
  };

  const getStatusLabel = () => {
    if (status === "COMPLETED") return "Completed";
    if (status === "FAILED") return "Failed";
    return "Processing";
  };

  return (
    <div
      className={cn(
        "flex items-start gap-3 rounded-[12px] border border-[var(--base-accent-accent-border,#f3f4f6)] bg-[var(--base-sidebar-sidebar-background,#fcfcfc)] px-4 py-2.5 pl-2.5",
        className
      )}
      {...props}
    >
      <div className="flex flex-1 items-center gap-6">
        <div className="flex items-center gap-4 shrink-0 w-[280px]">
          <div className="relative h-[46px] w-[46px] shrink-0 overflow-hidden rounded-md">
            <Image
              src={env.NEXT_PUBLIC_STORAGE_URL + image}
              alt={title}
              fill
              className="object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-b from-black/40 to-transparent" />
          </div>
          <div className="flex flex-col gap-2 min-w-0 flex-1">
            <p className="text-sm font-medium leading-none text-foreground truncate">
              {title}
            </p>
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1 rounded-md border border-border bg-background px-2.5 py-1 text-xs font-medium text-muted-foreground">
                {photoCount} photos
              </div>
              <div className="flex items-center gap-1 rounded-md border border-border bg-background px-2.5 py-1 text-xs font-medium text-muted-foreground">
                {itemCount} items
              </div>
              {showDuplicates ? (
                <div className="flex items-center gap-1 rounded-md border border-border bg-background px-2.5 py-1 text-xs font-medium text-destructive">
                  <CircleAlert className="h-3 w-3" />
                  Duplicates
                </div>
              ) : null}
            </div>
          </div>
        </div>

        {(!viewOnly || hasNotes) && (
          <div className="flex flex-col gap-1 w-[220px] shrink-0">
              {isEditing ? (
                <div className="flex flex-col gap-1">
                  <div className="relative flex items-center">
                    <Input
                      ref={inputRef}
                      className={cn(
                        "w-full rounded-[6px] border shadow-none focus:border-accent-border border-accent-border h-11 bg-background p-2 pr-10 text-sm text-foreground"
                      )}
                      defaultValue={note}
                      onBlur={handleBlur}
                      onKeyDown={handleKeyDown}
                      maxLength={80}
                      autoFocus
                      disabled={saveStatus === "saving"}
                    />
                    <div className="absolute right-2 flex items-center gap-1">
                      {saveStatus === "saving" && (
                        <Spinner className="h-4 w-4 text-muted-foreground" />
                      )}
                      {saveStatus === "error" && (
                        <div className="flex items-center gap-1">
                          <button
                            type="button"
                            onClick={handleNotesRetry}
                            className="text-xs text-destructive hover:underline"
                          >
                            Retry
                          </button>
                          <button
                            type="button"
                            onClick={handleCancel}
                            className="p-0.5 text-muted-foreground hover:text-foreground"
                          >
                            <X className="h-3 w-3" />
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                  {saveStatus === "error" && errorMessage && (
                    <p className="text-xs text-destructive">{errorMessage}</p>
                  )}
                </div>
              ) : (
                <div
                  className={cn(
                    "flex flex-col gap-1",
                    !viewOnly && "cursor-pointer"
                  )}
                  onClick={() => !viewOnly && setIsEditing(true)}
                >
                  <div className="flex items-center gap-1">
                    <p className="text-sm font-medium leading-none text-foreground">
                      Notes
                    </p>

                    {!viewOnly && onNotesEdit && (
                      <div className="flex items-center justify-center text-foreground transition-colors hover:text-foreground/80">
                        <Pencil className="h-3 w-3" />
                      </div>
                    )}
                  </div>
                  <div className="min-w-0">
                    <p
                      className={cn(
                        "text-sm truncate",
                        hasNotes
                          ? "text-muted-foreground"
                          : "text-(--base-muted-muted-foreground-2,#9ca3af)"
                      )}
                    >
                      {hasNotes ? note : notesPlaceholder}
                    </p>
                  </div>
                </div>
              )}
          </div>
        )}

        <div className="flex items-center gap-5 shrink-0 ml-auto">
          <div className="flex items-center gap-4">
            {status === "FAILED" && onRetry && (
              <button
                type="button"
                onClick={handleUploadRetry}
                disabled={isRetrying}
                className="flex items-center gap-1 px-1.5 py-1 rounded-md hover:bg-muted/50 transition-colors disabled:opacity-50"
              >
                {isRetrying ? (
                  <Loader2 className="h-3 w-3 animate-spin" />
                ) : (
                  <RotateCcw className="h-3 w-3" />
                )}
                <span className="text-xs font-medium underline">
                  {isRetrying ? "Retrying..." : "Retry"}
                </span>
              </button>
            )}
            {status ? (
              <StatusChip variant={getStatusVariant()}>
                {getStatusLabel()}
              </StatusChip>
            ) : null}
          </div>
          {date ? (
            <p className="text-xs leading-none text-muted-foreground">
              {formatDate(date)}
            </p>
          ) : null}
        </div>
      </div>
    </div>
  );
}
