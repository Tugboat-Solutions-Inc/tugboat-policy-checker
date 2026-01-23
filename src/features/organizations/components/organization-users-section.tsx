"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { UserRoundPlus } from "lucide-react";
import { DetailSection } from "@/components/common/detail-section";
import { OrganizationUserRow } from "./organization-user-row";
import { getOrganizationUsers } from "../api/organization-users.actions";
import { useCurrentOrg, useCurrentUser } from "@/hooks/use-auth";
import { toast } from "@/components/common/toast/toast";
import { Skeleton } from "@/components/ui/skeleton";
import type {
  OrganizationUser,
  OrganizationUserRole,
} from "../types/organization-users.types";
import { InviteTeamMemberModal } from "@/features/settings/components/invite-team-member-modal";

function UserRowSkeleton() {
  return (
    <div className="bg-background border border-input rounded-lg min-h-12 px-2 py-2 flex items-center justify-between gap-2">
      <div className="flex items-center gap-2 sm:gap-2.5">
        <Skeleton className="size-7 sm:size-8 rounded" />
        <div className="flex flex-col gap-1.5">
          <Skeleton className="h-3.5 sm:h-4 w-28 sm:w-36" />
          <Skeleton className="h-2.5 sm:h-3 w-36 sm:w-44" />
        </div>
      </div>
      <Skeleton className="h-5 w-20 sm:w-24" />
    </div>
  );
}

interface OrganizationUsersSectionProps {
  onInviteSubmit?: (emails: string[]) => Promise<void>;
}

export function OrganizationUsersSection({
  onInviteSubmit,
}: OrganizationUsersSectionProps) {
  const currentOrg = useCurrentOrg();
  const currentUser = useCurrentUser();
  const [users, setUsers] = useState<OrganizationUser[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);

  const isCurrentUserAdmin =
    users.find((u) => u.user.id === currentUser?.id)?.role === "ADMIN";

  useEffect(() => {
    if (!currentOrg?.org_id) return;

    let isCancelled = false;

    const fetchUsers = async () => {
      setIsLoading(true);
      try {
        const result = await getOrganizationUsers(currentOrg.org_id);
        if (isCancelled) return;
        if (result.success) {
          setUsers(result.data);
        } else {
          toast.error("Failed to load team members", result.message);
        }
      } catch (error) {
        if (isCancelled) return;
        toast.error(
          "Failed to load team members",
          error instanceof Error ? error.message : "Please try again"
        );
      } finally {
        if (!isCancelled) {
          setIsLoading(false);
        }
      }
    };

    fetchUsers();

    return () => {
      isCancelled = true;
    };
  }, [currentOrg?.org_id]);

  const refetchUsers = async () => {
    if (!currentOrg?.org_id) return;

    setIsLoading(true);
    try {
      const result = await getOrganizationUsers(currentOrg.org_id);
      if (result.success) {
        setUsers(result.data);
      } else {
        toast.error("Failed to load team members", result.message);
      }
    } catch (error) {
      toast.error(
        "Failed to load team members",
        error instanceof Error ? error.message : "Please try again"
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleRoleChange = (userId: string, newRole: OrganizationUserRole) => {
    setUsers((prev) =>
      prev.map((u) => (u.id === userId ? { ...u, role: newRole } : u))
    );
  };

  const handleRemove = (userId: string) => {
    setUsers((prev) => prev.filter((u) => u.id !== userId));
  };

  const handleInvite = () => {
    setIsInviteModalOpen(true);
  };

  const handleInviteSubmit = async (emails: string[]) => {
    await onInviteSubmit?.(emails);
    await refetchUsers();
  };

  if (!currentOrg?.org_id) {
    return null;
  }

  const teamMembers = users.filter((u) => !u.is_client);
  
  const sortedUsers = [...teamMembers].sort((a, b) => {
    const getRolePriority = (role: string) => {
      if (role === "ADMIN") return 0;
      if (role === "MEMBER") return 1;
      return 2;
    };
    
    const priorityDiff = getRolePriority(a.role) - getRolePriority(b.role);
    if (priorityDiff !== 0) return priorityDiff;
    
    const aName = `${a.user.first_name} ${a.user.last_name}`.toLowerCase();
    const bName = `${b.user.first_name} ${b.user.last_name}`.toLowerCase();
    return aName.localeCompare(bName);
  });

  return (
    <>
      <DetailSection
        title="Team Members"
        description="Manage your internal team's access and roles for this workspace."
        actions={
          isCurrentUserAdmin && (
            <Button
              variant="secondary"
              size="sm"
              onClick={handleInvite}
              className="bg-accent-border hover:bg-accent-border/80 text-foreground h-8 sm:h-9 w-fit text-xs sm:text-sm"
            >
              <UserRoundPlus className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-primary" />
              Invite Members
            </Button>
          )
        }
      >
        <div className="flex flex-col gap-2 sm:gap-3 w-full lg:max-w-[560px]">
          {isLoading ? (
            <>
              <UserRowSkeleton />
              <UserRowSkeleton />
              <UserRowSkeleton />
            </>
          ) : sortedUsers.length === 0 ? (
            <div className="flex items-center justify-center py-8 text-muted-foreground">
              No team members found
            </div>
          ) : (
            sortedUsers.map((user) => (
              <OrganizationUserRow
                key={user.id}
                user={user}
                organizationId={currentOrg.org_id}
                onRoleChange={handleRoleChange}
                onRemove={handleRemove}
                isCurrentUserAdmin={isCurrentUserAdmin}
              />
            ))
          )}
        </div>
      </DetailSection>

      <InviteTeamMemberModal
        open={isInviteModalOpen}
        onOpenChange={setIsInviteModalOpen}
        onSubmit={handleInviteSubmit}
      />
    </>
  );
}
