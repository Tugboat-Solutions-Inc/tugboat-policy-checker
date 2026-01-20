"use client";

import { X } from "lucide-react";
import { toast as sonnerToast } from "sonner";

interface BaseToastProps {
  id: string | number;
  icon?: React.ReactNode;
  message: string;
  description?: string;
}

export function BaseToast({ id, icon, message, description }: BaseToastProps) {
  return (
    <div className="flex items-center gap-4 p-4">
      <div className="flex items-center gap-2 flex-1">
        {icon && (
          <div className="shrink-0 flex items-center justify-center size-4">
            {icon}
          </div>
        )}
        <div className="flex flex-col gap-0.5 flex-1">
          <p className="text-sm font-medium text-white leading-5">{message}</p>
          {description && (
            <p className="text-sm text-white/70 leading-5">{description}</p>
          )}
        </div>
      </div>
      <button
        type="button"
        onClick={() => sonnerToast.dismiss(id)}
        className="shrink-0 hover:text-white transition-colors size-4 flex items-center justify-center cursor-pointer"
        style={{ color: "var(--muted-foreground-2)" }}
        aria-label="Close"
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  );
}
