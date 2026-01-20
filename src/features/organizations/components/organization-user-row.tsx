"use client";

import { useState } from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ChevronDown, Check } from "lucide-react";
import { cn, getUserInitials } from "@/lib/utils";
import { ConfirmationDialog } from "@/components/common/confirmation-dialog";
import { useCurrentUser } from "@/hooks/use-auth";
import {
  updateOrganizationUser,
  deleteOrganizationUser,
} from "../api/organization-users.actions";
import { toast } from "@/components/common/toast/toast";
import { env } from "@/lib/env";
import type {
  OrganizationUser,
  OrganizationUserRole,
} from "../types/organization-users.types";

interface OrganizationUserRowProps {
  user: OrganizationUser;
  organizationId: string;
  onRoleChange?: (userId: string, role: OrganizationUserRole) => void;
  onRemove?: (userId: string) => void;
  isCurrentUserAdmin: boolean;
}

const teamMemberRoleOptions: { value: OrganizationUserRole; label: string }[] = [
  { value: "ADMIN", label: "Admin" },
  { value: "MEMBER", label: "Team Member" },
];

export function OrganizationUserRow({
  user,
  organizationId,
  onRoleChange,
  onRemove,
  isCurrentUserAdmin,
}: OrganizationUserRowProps) {
  const currentUser = useCurrentUser();
  const [isRemoveDialogOpen, setIsRemoveDialogOpen] = useState(false);
  const [isRemoving, setIsRemoving] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);

  const isCurrentUser = user.user.id === currentUser?.id;
  const isOwner = user.role === "ADMIN";
  const canEdit = isCurrentUserAdmin && !isCurrentUser;
  const userType = user.is_client ? "Client" : (user.role === "ADMIN" ? "Admin" : "Team Member");

  const handleRoleChange = async (newRole: OrganizationUserRole) => {
    if (newRole === user.role) return;

    setIsUpdating(true);
    const loadingToast = toast.loading("Updating role", "Please wait...");

    try {
      const result = await updateOrganizationUser(
        organizationId,
        user.id,
        newRole
      );

      if (!result.success) {
        throw new Error(result.message);
      }

      toast.dismiss(loadingToast);
      toast.success(
        "Role updated",
        `${user.user.first_name} ${user.user.last_name} is now ${newRole === "ADMIN" ? "an Admin" : "a Team Member"}`
      );

      onRoleChange?.(user.id, newRole);
    } catch (error) {
      toast.dismiss(loadingToast);
      toast.error(
        "Failed to update role",
        error instanceof Error ? error.message : "Please try again"
      );
    } finally {
      setIsUpdating(false);
    }
  };

  const handleRemoveClick = () => {
    setIsRemoveDialogOpen(true);
  };

  const handleConfirmRemove = async () => {
    setIsRemoving(true);
    const loadingToast = toast.loading("Removing user", "Please wait...");

    try {
      const result = await deleteOrganizationUser(organizationId, user.id);

      if (!result.success) {
        throw new Error(result.message);
      }

      toast.dismiss(loadingToast);
      toast.success(
        "User removed",
        `${user.user.first_name} ${user.user.last_name} has been removed from this organization`
      );

      onRemove?.(user.id);
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

  const initials = getUserInitials(user.user.first_name, user.user.last_name);
  const roleLabel = userType;

  return (
    <div className="bg-background border border-input rounded-lg min-h-12 px-2 py-2 flex items-center justify-between gap-2">
      <div className="flex items-center gap-2 sm:gap-2.5 min-w-0">
        {user.user.profile_picture_url ? (
          <div className="size-7 sm:size-8 rounded overflow-hidden shrink-0">
            <img
              src={env.NEXT_PUBLIC_STORAGE_URL + user.user.profile_picture_url}
              alt={user.user.first_name}
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
            {user.user.first_name} {user.user.last_name}
            {isCurrentUser && (
              <span className="ml-1 text-gray-400 font-normal">(You)</span>
            )}
          </span>
          <span className="text-[10px] sm:text-xs text-muted-foreground truncate">
            {user.user.email}
          </span>
        </div>
      </div>

      {!canEdit || user.is_client ? (
        <div className="h-9 px-3 flex items-center">
          <span className="text-sm font-normal text-muted-foreground">
            {roleLabel}
          </span>
        </div>
      ) : (
        <DropdownMenu>
          <DropdownMenuTrigger asChild disabled={isUpdating}>
            <button
              className={cn(
                "h-9 px-3 pr-3 flex items-center gap-2 rounded-lg",
                "text-sm font-medium text-foreground",
                "hover:bg-accent transition-colors",
                "focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
                isUpdating && "opacity-50 cursor-not-allowed"
              )}
            >
              {roleLabel}
              <ChevronDown className="h-4 w-4" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-[160px] bg-background">
            {teamMemberRoleOptions.map((option) => (
              <DropdownMenuItem
                key={option.value}
                onClick={() => handleRoleChange(option.value)}
                className={cn(
                  "gap-2.5 cursor-pointer",
                  user.role === option.value && "bg-sidebar-accent"
                )}
              >
                <Check
                  className={cn(
                    "h-4 w-4 text-primary",
                    user.role !== option.value && "opacity-0"
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
        description={`This will permanently remove ${user.user.first_name} ${user.user.last_name} from this organization and they will no longer be able to access it.`}
        confirmText="Remove User"
        onConfirm={handleConfirmRemove}
        isLoading={isRemoving}
      />
    </div>
  );
}
