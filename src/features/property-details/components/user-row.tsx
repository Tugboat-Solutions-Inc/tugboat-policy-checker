"use client";

import { useState, useCallback, memo } from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ChevronDown, Check } from "lucide-react";
import {
  cn,
  getIsStaticRole,
  getRoleLabel,
  getUserDisplayInfo,
} from "@/lib/utils";
import { ConfirmationDialog } from "@/components/common/confirmation-dialog";
import { propertyAccess, AccessType } from "../types/property-access.types";
import { useCurrentOrg, useCurrentUser } from "@/hooks/use-auth";
import { removePropertyAccess } from "../api/property-access.actions";
import { toast } from "@/components/common/toast/toast";
import { env } from "@/lib/env";

interface UserRowProps {
  access: propertyAccess;
  propertyId: string;
  onRoleChange?: (userId: string, role: AccessType) => void;
  onRemove?: (userId: string) => void;
  viewOnly?: boolean;
}

const roleOptions: { value: AccessType; label: string }[] = [
  { value: "VIEWER", label: "Can View" },
  { value: "EDITOR", label: "Can Edit" },
];

function UserRowComponent({
  access,
  propertyId,
  onRoleChange,
  onRemove,
  viewOnly,
}: UserRowProps) {
  const currentUser = useCurrentUser();
  const currentOrg = useCurrentOrg();
  const [isRemoveDialogOpen, setIsRemoveDialogOpen] = useState(false);
  const [isRemoving, setIsRemoving] = useState(false);

  const handleRoleChange = useCallback(
    (newRole: AccessType) => {
      onRoleChange?.(access.organization_user.user_id, newRole);
    },
    [onRoleChange, access.organization_user.user_id]
  );

  const handleRemoveClick = useCallback(() => {
    setIsRemoveDialogOpen(true);
  }, []);

  const handleConfirmRemove = async () => {
    setIsRemoving(true);
    const loadingToast = toast.loading("Removing user", "Please wait...");

    try {
      const result = await removePropertyAccess(propertyId, access.id);

      if (!result.success) {
        throw new Error(result.message);
      }

      toast.dismiss(loadingToast);
      const { displayName: removedName } = getUserDisplayInfo(access.organization_user.user);
      toast.success(
        "User removed",
        `${removedName} has been removed from this property`
      );

      onRemove?.(access.organization_user.user_id);
      setIsRemoveDialogOpen(false);
    } catch (error) {
      toast.dismiss(loadingToast);
      toast.error(
        "Failed to remove user",
        error instanceof Error ? error.message : "Please try again"
      );
    } finally {
      setIsRemoving(false);
    }
  };

  const isStaticRole =
    viewOnly ||
    (currentOrg && currentUser
      ? getIsStaticRole(access, currentOrg, currentUser)
      : false);
  let roleLabel =
    currentUser && currentOrg
      ? getRoleLabel(access, isStaticRole, currentUser)
      : access.access_type;

  if (viewOnly) {
    const role = access.organization_user.role;
    const isClient = access.is_client;
    if (role === "ADMIN") {
      roleLabel = "Owner";
    } else if (!isClient) {
      roleLabel = "Team Member";
    } else {
      roleLabel = access.access_type === "EDITOR" ? "Can Edit" : "Can View";
    }
  }

  const user = access.organization_user.user;
  const { displayName, initials, email } = getUserDisplayInfo(user);
  const isCurrentUser = access.organization_user.user_id === currentUser?.id;
  const profilePictureUrl = user?.profile_picture_url;
  return (
    <div className="bg-background border border-input rounded-lg min-h-12 px-2 py-2 flex items-center justify-between gap-2">
      <div className="flex items-center gap-2 sm:gap-2.5 min-w-0">
        {profilePictureUrl ? (
          <div className="size-7 sm:size-8 rounded overflow-hidden shrink-0">
            <img
              src={env.NEXT_PUBLIC_STORAGE_URL + profilePictureUrl}
              alt={displayName}
              className="size-full object-cover"
            />
          </div>
        ) : (
          <div className="size-7 sm:size-8 rounded bg-[#026e86] flex items-center justify-center shrink-0">
            <span className="text-[10px] sm:text-xs font-normal text-white">
              {initials}
            </span>
          </div>
        )}

        <div className="flex flex-col min-w-0">
          <span className="text-xs sm:text-sm font-medium text-foreground truncate">
            {displayName}
            {isCurrentUser && (
              <span className="ml-1 text-gray-400 font-normal">(You)</span>
            )}
          </span>
          {email && (
            <span className="text-[10px] sm:text-xs text-muted-foreground truncate">
              {email}
            </span>
          )}
        </div>
      </div>

      {isStaticRole ? (
        <div className="h-9 px-3 flex items-center">
          <span className="text-sm font-normal text-muted-foreground">
            {roleLabel || access.organization_user.role}
          </span>
        </div>
      ) : (
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
              {roleLabel || access.access_type}
              <ChevronDown className="h-4 w-4" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-[160px] bg-background">
            {roleOptions.map((option) => (
              <DropdownMenuItem
                key={option.value}
                onClick={() => handleRoleChange(option.value)}
                className={cn(
                  "gap-2.5 cursor-pointer",
                  access.access_type === option.value && "bg-sidebar-accent"
                )}
              >
                <Check
                  className={cn(
                    "h-4 w-4 text-primary",
                    access.access_type !== option.value && "opacity-0"
                  )}
                />
                {option.label}
              </DropdownMenuItem>
            ))}
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
      )}

      <ConfirmationDialog
        open={isRemoveDialogOpen}
        onOpenChange={setIsRemoveDialogOpen}
        title="Remove User?"
        description={`This will permanently remove ${displayName || "this user"} from this property and they will no longer be able to access it.`}
        confirmText="Remove User"
        onConfirm={handleConfirmRemove}
        isLoading={isRemoving}
      />
    </div>
  );
}

export const UserRow = memo(UserRowComponent);
