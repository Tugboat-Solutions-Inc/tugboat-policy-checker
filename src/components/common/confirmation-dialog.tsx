"use client";

import { useState } from "react";
import * as AlertDialogPrimitive from "@radix-ui/react-alert-dialog";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface ConfirmationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description: string;
  cancelText?: string;
  confirmText: string;
  onConfirm: () => void | Promise<void>;
  isLoading?: boolean;
  variant?: "destructive" | "default";
  showCancel?: boolean;
}

export function ConfirmationDialog({
  open,
  onOpenChange,
  title,
  description,
  cancelText = "Cancel",
  confirmText,
  onConfirm,
  isLoading: externalLoading = false,
  variant = "destructive",
  showCancel = true,
}: ConfirmationDialogProps) {
  const [internalLoading, setInternalLoading] = useState(false);
  const isLoading = externalLoading || internalLoading;

  const handleConfirm = async () => {
    const result = onConfirm();
    if (result instanceof Promise) {
      setInternalLoading(true);
      try {
        await result;
      } finally {
        setInternalLoading(false);
      }
    }
    onOpenChange(false);
  };

  return (
    <AlertDialogPrimitive.Root open={open} onOpenChange={onOpenChange}>
      <AlertDialogPrimitive.Portal>
        <AlertDialogPrimitive.Overlay
          className="data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 fixed inset-0 z-50 backdrop-blur-[5px]"
          style={{ backgroundColor: "rgba(255, 255, 255, 0.8)" }}
        />
        <AlertDialogPrimitive.Content
          className={cn(
            "bg-background data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 fixed top-[50%] left-[50%] z-50 grid w-full max-w-[calc(100%-2rem)] translate-x-[-50%] translate-y-[-50%] gap-8 rounded-lg border p-6 shadow-lg duration-200 sm:max-w-[440px]"
          )}
        >
          <div className="flex flex-col gap-1.5 text-center sm:text-center">
            <AlertDialogPrimitive.Title className="text-lg font-semibold text-foreground">
              {title}
            </AlertDialogPrimitive.Title>
            <AlertDialogPrimitive.Description className="text-sm text-muted-foreground">
              {description}
            </AlertDialogPrimitive.Description>
          </div>
          <div className={cn("gap-4 flex flex-row", !showCancel && "justify-center")}>
            {showCancel && (
              <Button
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={isLoading}
                className="flex-1 bg-accent-border border-0 text-foreground hover:bg-accent-border/80"
              >
                {cancelText}
              </Button>
            )}
            <Button
              onClick={handleConfirm}
              disabled={isLoading}
              loading={isLoading}
              variant={variant === "destructive" ? "outline" : "default"}
              className={cn(
                variant === "destructive"
                  ? "bg-[var(--base-error-error-foreground,#FEF2F2)] border border-error/10 text-error hover:bg-[var(--base-error-error-foreground,#FEF2F2)]/80"
                  : "",
                showCancel ? "flex-1" : "min-w-[120px]"
              )}
            >
              {confirmText}
            </Button>
          </div>
        </AlertDialogPrimitive.Content>
      </AlertDialogPrimitive.Portal>
    </AlertDialogPrimitive.Root>
  );
}
