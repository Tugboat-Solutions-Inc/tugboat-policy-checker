"use client";

import { CircleAlert, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface DuplicatesAlertProps {
  title: string;
  description: string;
  onResolveClick?: () => void;
  className?: string;
}

export function DuplicatesAlert({
  title,
  description,
  onResolveClick,
  className,
}: DuplicatesAlertProps) {
  return (
    <div
      className={cn(
        "flex items-center gap-3 bg-[rgba(254,242,242,0.5)] rounded-[10px] pl-2.5 pr-4 py-3 w-full mt-2.5 mb-0.5",
        className
      )}
    >
      <div className="w-10 h-10 bg-background rounded-[6px] flex items-center justify-center shrink-0">
        <CircleAlert size={22} className="text-destructive" />
      </div>
      <div className="flex flex-col gap-1.5 flex-1 min-w-0">
        <p className="font-semibold text-base text-foreground leading-none">
          {title}
        </p>
        <p className="text-sm text-muted-foreground leading-none">
          {description}
        </p>
      </div>
      {onResolveClick && (
        <Button
          variant="link"
          size="sm"
          onClick={onResolveClick}
          className="shrink-0 text-destructive hover:text-destructive/80 p-0 h-auto"
        >
          Resolve Duplicates
          <ChevronRight size={16} />
        </Button>
      )}
    </div>
  );
}
