"use client";

import * as React from "react";
import { X } from "lucide-react";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogOverlay,
  DialogPortal,
  DialogTitle,
} from "@/components/ui/dialog";
import { TugboatModalStepIndicator } from "./tugboat-modal-step-indicator";
import { cn } from "@/lib/utils";

export interface TugboatModalProps {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  title: string;
  description?: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
  headerRight?: React.ReactNode;
  maxWidth?: "sm" | "md" | "lg" | "xl" | "2xl";
  showCloseButton?: boolean;
  className?: string;
}

const maxWidthClasses = {
  sm: "max-w-sm",
  md: "max-w-md",
  lg: "max-w-[778px]",
  xl: "max-w-xl",
  "2xl": "max-w-2xl",
};

export function TugboatModal({
  open,
  onOpenChange,
  title,
  description,
  children,
  footer,
  headerRight,
  maxWidth = "lg",
  showCloseButton = false,
  className,
}: TugboatModalProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogPortal>
        <DialogOverlay
          className="data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 fixed inset-0 z-50 backdrop-blur-[5px]"
          style={{ backgroundColor: "rgba(255, 255, 255, 0.8)" }}
        />
        <DialogContent
          showCloseButton={showCloseButton}
          className={cn(
            "w-full max-h-[95vh] gap-6 rounded-lg border border-[var(--base-accent-accent-border,#f3f4f6)] bg-white p-6 flex flex-col",
            maxWidthClasses[maxWidth],
            className
          )}
        >
          <div className="flex flex-col gap-6 min-h-0">
            <DialogHeader className="border-b border-[var(--base-accent-accent-border,#f3f4f6)] pb-4 shrink-0">
              <div className="flex items-center justify-between">
                <div className="flex flex-col gap-1.5">
                  <DialogTitle className="text-lg font-semibold leading-none text-foreground">
                    {title}
                  </DialogTitle>
                  {description && (
                    <DialogDescription className="text-sm leading-5 text-muted-foreground">
                      {description}
                    </DialogDescription>
                  )}
                </div>
                {headerRight}
              </div>
            </DialogHeader>

            <div className="flex flex-col gap-8 overflow-y-auto thin-scrollbar flex-1 min-h-0">
              {children}
            </div>

            {footer && (
              <DialogFooter className="w-full border-t-0 pt-0 shrink-0">
                {footer}
              </DialogFooter>
            )}
          </div>
        </DialogContent>
      </DialogPortal>
    </Dialog>
  );
}
