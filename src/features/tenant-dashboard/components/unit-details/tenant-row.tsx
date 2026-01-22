"use client";

import { useState } from "react";
import { UnitTenant } from "../../api/tenant-dashboard.actions";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ChevronDown, Check } from "lucide-react";
import { cn } from "@/lib/utils";
import { ConfirmationDialog } from "@/components/common/confirmation-dialog";

interface TenantRowProps {
  tenant: UnitTenant;
  onAccessLevelChange: (
    accessId: string,
    accessLevel: "VIEWER" | "EDITOR"
  ) => Promise<void>;
  onRemove: (accessId: string) => Promise<void>;
}

const accessLevelLabels: Record<string, string> = {
  EDITOR: "Can edit",
  VIEWER: "Can view",
};

export function TenantRow({
  tenant,
  onAccessLevelChange,
  onRemove,
}: TenantRowProps) {
  const [isRemoveDialogOpen, setIsRemoveDialogOpen] = useState(false);

  const handleAccessLevelChange = async (newAccessLevel: "VIEWER" | "EDITOR") => {
    await onAccessLevelChange(tenant.id, newAccessLevel);
  };

  const handleRemoveClick = () => {
    setIsRemoveDialogOpen(true);
  };

  const handleConfirmRemove = async () => {
    await onRemove(tenant.id);
  };

  const isOwner = tenant.accessType === "OWNER";
  const isTeamMember = tenant.accessType === "MANAGER";
  const showDropdown = tenant.accessType === "TENANT";
  const currentAccessLevel = tenant.accessLevel || "VIEWER";

  return (
    <div className="bg-background border border-input rounded-lg min-h-12 px-2 py-2 flex items-center justify-between gap-2">
      <div className="flex items-center gap-2 sm:gap-2.5 min-w-0">
        {tenant.avatarUrl ? (
          <div className="size-7 sm:size-8 rounded overflow-hidden shrink-0">
            <img
              src={tenant.avatarUrl}
              alt={tenant.name}
              className="size-full object-cover"
            />
          </div>
        ) : (
          <div className="size-7 sm:size-8 rounded bg-[#026e86] flex items-center justify-center shrink-0">
            <span className="text-[10px] sm:text-xs font-normal text-white">
              {tenant.initials || tenant.name.substring(0, 2).toUpperCase()}
            </span>
          </div>
        )}

        <div className="flex flex-col min-w-0">
          <span className="text-xs sm:text-sm font-medium text-foreground truncate">
            {tenant.name}
            {tenant.isCurrentUser && (
              <span className="ml-1 text-gray-400 font-normal">(You)</span>
            )}
          </span>
          {tenant.email && (
            <span className="text-[10px] sm:text-xs text-muted-foreground truncate">
              {tenant.email}
            </span>
          )}
        </div>
      </div>

      {isOwner ? (
        <div className="h-9 px-3 flex items-center">
          <span className="text-sm font-normal text-muted-foreground">
            Owner
          </span>
        </div>
      ) : isTeamMember ? (
        <div className="h-9 px-3 flex items-center">
          <span className="text-sm font-normal text-muted-foreground">
            Team Member
          </span>
        </div>
      ) : showDropdown ? (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button
              className={cn(
                "h-9 px-3 pr-3 flex items-center gap-2 rounded-lg",
                "text-sm font-medium text-foreground",
                "hover:bg-accent transition-colors",
                "focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
              )}
            >
              {accessLevelLabels[currentAccessLevel]}
              <ChevronDown className="h-4 w-4" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-[160px] bg-background">
            <DropdownMenuItem
              onClick={() => handleAccessLevelChange("EDITOR")}
              className={cn(
                "gap-2.5 cursor-pointer",
                currentAccessLevel === "EDITOR" && "bg-sidebar-accent"
              )}
            >
              <Check
                className={cn(
                  "h-4 w-4 text-primary",
                  currentAccessLevel !== "EDITOR" && "opacity-0"
                )}
              />
              Can edit
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => handleAccessLevelChange("VIEWER")}
              className={cn(
                "gap-2.5 cursor-pointer",
                currentAccessLevel === "VIEWER" && "bg-sidebar-accent"
              )}
            >
              <Check
                className={cn(
                  "h-4 w-4 text-primary",
                  currentAccessLevel !== "VIEWER" && "opacity-0"
                )}
              />
              Can view
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={handleRemoveClick}
              className="gap-2.5 cursor-pointer text-foreground"
            >
              <div className="h-4 w-4 opacity-0" />
              Remove
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      ) : (
        <div className="h-9 px-3 flex items-center">
          <span className="text-sm font-normal text-muted-foreground">
            {accessLevelLabels[currentAccessLevel]}
          </span>
        </div>
      )}

      <ConfirmationDialog
        open={isRemoveDialogOpen}
        onOpenChange={setIsRemoveDialogOpen}
        title="Remove user from this property?"
        description="They'll immediately lose access to this property and any shared links."
        confirmText="Remove User"
        onConfirm={handleConfirmRemove}
      />
    </div>
  );
}
