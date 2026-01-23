"use client";

import { Button } from "@/components/ui/button";
import { UserRoundPlus } from "lucide-react";
import { UserRow } from "./user-row";
import { DetailSection } from "@/components/common/detail-section";
import { UserTypeConfig } from "../types/property-details.types";
import type {
  propertyAccess,
  AccessType,
} from "../types/property-access.types";

interface UserManagementSectionProps {
  propertyAccess: propertyAccess[];
  propertyId: string;
  config: UserTypeConfig;
  onRoleChange?: (userId: string, role: AccessType) => void;
  onRemove?: (userId: string) => void;
  onInvite: () => void;
  viewOnly?: boolean;
}

export function UserManagementSection({
  propertyAccess,
  propertyId,
  config,
  onRoleChange,
  onRemove,
  onInvite,
  viewOnly,
}: UserManagementSectionProps) {
  return (
    <DetailSection
      title={config.sectionTitle}
      description={config.sectionDescription}
      actions={
        !viewOnly && (
          <Button
            variant="secondary"
            size="sm"
            onClick={onInvite}
            className="bg-accent-border hover:bg-accent-border/80 text-foreground h-8 sm:h-9 w-fit text-xs sm:text-sm"
          >
            <UserRoundPlus className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-primary" />
            {config.inviteButtonText}
          </Button>
        )
      }
    >
      <div className="flex flex-col gap-2 sm:gap-3 w-full lg:max-w-[560px]">
        {propertyAccess.length === 0 ? (
          <div className="flex items-center justify-center py-8 text-muted-foreground text-sm">
            No users have been added yet
          </div>
        ) : (
          [...propertyAccess]
            .filter(
              (access, index, self) =>
                self.findIndex(
                  (a) =>
                    a.organization_user.user_id === access.organization_user.user_id
                ) === index
            )
            .sort((a, b) => {
              const getPriority = (access: propertyAccess) => {
                if (access.is_client) return 2;
                if (access.organization_user.role === "ADMIN") return 0;
                return 1;
              };
              
              const priorityDiff = getPriority(a) - getPriority(b);
              if (priorityDiff !== 0) return priorityDiff;
              
              const aName = `${a.organization_user.user?.first_name || ""} ${a.organization_user.user?.last_name || ""}`.toLowerCase();
              const bName = `${b.organization_user.user?.first_name || ""} ${b.organization_user.user?.last_name || ""}`.toLowerCase();
              return aName.localeCompare(bName);
            })
            .map((access) => (
              <UserRow
                key={access.id}
                access={access}
                propertyId={propertyId}
                onRoleChange={onRoleChange}
                onRemove={onRemove}
                viewOnly={viewOnly}
              />
            ))
        )}
      </div>
    </DetailSection>
  );
}
