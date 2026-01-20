"use client";

import * as AlertDialogPrimitive from "@radix-ui/react-alert-dialog";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface UnsavedChangesDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onLeave: () => void;
}

export function UnsavedChangesDialog({
  open,
  onOpenChange,
  onLeave,
}: UnsavedChangesDialogProps) {
  return (
    <AlertDialogPrimitive.Root open={open}>
      <AlertDialogPrimitive.Portal>
        <AlertDialogPrimitive.Overlay
          className="data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 fixed inset-0 z-50 backdrop-blur-[5px]"
          style={{ backgroundColor: "rgba(255, 255, 255, 0.8)" }}
        />
        <AlertDialogPrimitive.Content
          className={cn(
            "bg-background data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 fixed top-[50%] left-[50%] z-50 grid w-full max-w-[calc(100%-2rem)] translate-x-[-50%] translate-y-[-50%] gap-8 rounded-lg border border-accent-border p-6 shadow-lg duration-200 sm:max-w-[400px]"
          )}
        >
          <div className="flex flex-col gap-1.5 text-center">
            <AlertDialogPrimitive.Title className="text-lg font-semibold text-foreground">
              Unsaved changes
            </AlertDialogPrimitive.Title>
            <AlertDialogPrimitive.Description className="text-sm text-muted-foreground">
              If you leave this page, your edits will be lost.
            </AlertDialogPrimitive.Description>
          </div>
          <div className="gap-4 flex flex-row">
            <Button
              variant="outline"
              onClick={onLeave}
              className="flex-1 bg-accent-border border-0 text-foreground hover:bg-accent-border/80"
            >
              Leave without saving
            </Button>
            <Button onClick={() => onOpenChange(false)} className="flex-1">
              Continue editing
            </Button>
          </div>
        </AlertDialogPrimitive.Content>
      </AlertDialogPrimitive.Portal>
    </AlertDialogPrimitive.Root>
  );
}
