"use client";

import { useState, useEffect } from "react";
import { X, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "@/components/common/toast/toast";
import { useCurrentOrg } from "@/hooks/use-auth";
import { setDebugAccountType, getDebugAccountType } from "./debug-panel.actions";
import type { UserType } from "@/constants/user-types";

const ACCOUNT_TYPES: UserType[] = ["INDIVIDUAL", "MULTI_TENANT", "COMPANY"];

export function DebugPanel() {
  const [isOpen, setIsOpen] = useState(false);
  const [loadingAction, setLoadingAction] = useState<UserType | "clear" | null>(
    null
  );
  const [debugOverride, setDebugOverride] = useState<UserType | null>(null);
  const currentOrg = useCurrentOrg();
  const actualType = currentOrg?.org_type ?? null;
  const displayType = debugOverride ?? actualType;
  const isPending = loadingAction !== null;

  useEffect(() => {
    getDebugAccountType().then(setDebugOverride);
  }, []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.shiftKey && e.key === "D") {
        e.preventDefault();
        setIsOpen((prev) => !prev);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  const handleSelect = async (type: UserType) => {
    if (type === displayType) return;

    setLoadingAction(type);
    const result = await setDebugAccountType(type);

    if (result.success) {
      setDebugOverride(type);
      toast.success("Debug override set", `Forcing view as ${type}`);
      window.location.reload();
    } else {
      toast.error("Failed to set debug override", result.message);
      setLoadingAction(null);
    }
  };

  const handleClearOverride = async () => {
    setLoadingAction("clear");
    const result = await setDebugAccountType(null);

    if (result.success) {
      setDebugOverride(null);
      toast.success("Debug override cleared", "Using actual organization type");
      window.location.reload();
    } else {
      setLoadingAction(null);
    }
  };

  if (process.env.NODE_ENV === "production") {
    return null;
  }

  if (!isOpen) {
    return null;
  }

  return (
    <div className="fixed bottom-4 right-4 z-[9999] bg-background border border-border rounded-lg shadow-lg p-4 w-64">
      <div className="flex items-center justify-between mb-3">
        <span className="text-sm font-semibold text-foreground">Debug Panel</span>
        <button
          onClick={() => setIsOpen(false)}
          className="text-muted-foreground hover:text-foreground"
          disabled={isPending}
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      <div className="flex flex-col gap-2">
        <div className="text-xs text-muted-foreground mb-1">
          <div>Actual: <span className="text-foreground font-medium">{actualType ?? "Unknown"}</span></div>
          {debugOverride && (
            <div>Override: <span className="text-primary font-medium">{debugOverride}</span></div>
          )}
        </div>
        <span className="text-xs text-muted-foreground">
          Select account type:
        </span>
        <div className="flex flex-col gap-1">
          {ACCOUNT_TYPES.map((type) => (
            <Button
              key={type}
              variant={displayType === type ? "default" : "outline"}
              size="sm"
              onClick={() => handleSelect(type)}
              disabled={isPending}
              className="justify-start text-xs"
            >
              {loadingAction === type ? (
                <Loader2 className="h-3 w-3 mr-2 animate-spin" />
              ) : null}
              {type}
              {type === actualType && debugOverride && type !== debugOverride && (
                <span className="ml-auto text-[10px] opacity-60">(actual)</span>
              )}
            </Button>
          ))}
        </div>
        {debugOverride && (
          <Button
            variant="ghost"
            size="sm"
            onClick={handleClearOverride}
            disabled={isPending}
            loading={loadingAction === "clear"}
            className="text-xs text-muted-foreground mt-1"
          >
            Clear override
          </Button>
        )}
      </div>

      <div className="mt-3 pt-3 border-t border-border">
        <span className="text-[10px] text-muted-foreground">
          Press Ctrl+Shift+D to toggle
        </span>
      </div>
    </div>
  );
}
