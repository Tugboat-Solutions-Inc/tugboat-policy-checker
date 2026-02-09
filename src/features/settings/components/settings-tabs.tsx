"use client";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";
import { Separator } from "@/components/ui/separator";
import { ProfileTab } from "@/features/settings/components/profile-tab";
import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";
import Header from "@/components/common/header/header";
import { toast } from "@/components/common/toast/toast";
import { NotificationsTab } from "@/features/settings/components/notifications-tab";
import { OrganizationUsersSection } from "@/features/organizations/components/organization-users-section";
import { USER_TYPES, UserType } from "@/constants/user-types";
import { ORG_ROLES } from "@/constants/roles.constants";
import { useCurrentOrg } from "@/hooks/use-auth";
import { UpdateUserInput, User } from "@/features/auth/schemas/user.schemas";
import { updateUser } from "@/features/auth/api/user.actions";
import { updateOrganization } from "@/features/dashboard/api/organization.actions";
import { useAuthStore } from "@/stores/auth-store";
import { useImpersonationStore } from "@/stores/impersonation-store";
import { env } from "@/lib/env";
import { createOrganizationInvite } from "@/features/invites/api/invite.actions";

interface SettingsTabsProps {
  accountType?: UserType;
  user: User;
}

type ProfileFormData = {
  first_name: string;
  last_name: string;
  profile_image?: string | null;
  company_name: string;
};

export function SettingsTabs({
  accountType = USER_TYPES.INDIVIDUAL,
  user,
}: SettingsTabsProps) {
  const currentOrg = useCurrentOrg();
  const decodedToken = useAuthStore((state) => state.decodedToken);
  const impersonatedUserId = useImpersonationStore((state) => state.impersonatedUserId);
  const updateImpersonatedUserFields = useImpersonationStore((state) => state.updateImpersonatedUserFields);
  const [currentUser, setCurrentUser] = useState<User>(user);

  const [activeTab, setActiveTab] = useState("profile");
  const [isFormDirty, setIsFormDirty] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    setCurrentUser(user);
  }, [user]);

  const handleProfileSubmit = async (data: ProfileFormData) => {
    setIsSaving(true);
    const payload: UpdateUserInput & {
      profile_picture_b64?: string;
      remove_profile_picture?: boolean;
    } = {
      first_name: data.first_name,
      last_name: data.last_name,
    };

    const originalImageUrl = currentUser.profile_picture_url
      ? env.NEXT_PUBLIC_STORAGE_URL + currentUser.profile_picture_url
      : null;

    if (data.profile_image && data.profile_image.startsWith("data:")) {
      payload.profile_picture_b64 = data.profile_image;
    } else if (!data.profile_image && originalImageUrl) {
      payload.remove_profile_picture = true;
    }

    const shouldUpdateOrg =
      (accountType === USER_TYPES.COMPANY ||
        accountType === USER_TYPES.MULTI_TENANT) &&
      currentOrg?.org_id &&
      data.company_name !== currentOrg.org_name;

    const [userResult, orgResult] = await Promise.all([
      updateUser(payload),
      shouldUpdateOrg
        ? updateOrganization(currentOrg.org_id, { name: data.company_name })
        : Promise.resolve(null),
    ]);

    if (userResult.success) {
      const updatedUser = userResult.data;
      setCurrentUser(updatedUser);

      if (impersonatedUserId) {
        updateImpersonatedUserFields({
          firstName: updatedUser.first_name,
          lastName: updatedUser.last_name,
          profilePictureUrl: updatedUser.profile_picture_url,
        });
      }

      if (orgResult && !orgResult.success) {
        toast.error(orgResult.message || "Failed to update company name");
      } else {
        if (shouldUpdateOrg && currentOrg?.org_id) {
          useAuthStore.getState().updateOrgName(currentOrg.org_id, data.company_name);
        }
        toast.success("Changes saved!");
        setIsFormDirty(false);
      }
    } else {
      toast.error(userResult.message || "Failed to save changes");
    }
    setIsSaving(false);
  };

  const handleInviteSubmit = async (emails: string[]) => {
    if (!currentOrg?.org_id) {
      throw new Error("No organization found");
    }

    const results = await Promise.all(
      emails.map((email) =>
        createOrganizationInvite(currentOrg.org_id, email, "MEMBER")
      )
    );

    const failedResult = results.find((result) => !result.success);
    if (failedResult) {
      throw new Error(failedResult.message || "Failed to send invites");
    }
  };

  return (
    <div>
      <Header
        title="Settings"
        classname="mb-4 mx-0.5"
        children={
          activeTab === "profile" && (
            <Button
              type="submit"
              form="profile-form"
              variant="default"
              disabled={!isFormDirty || isSaving}
              loading={isSaving}
            >
              {isSaving ? "Saving..." : "Save Changes"}
            </Button>
          )
        }
      />
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="flex bg-transparent gap-9">
          <TabsTrigger
            className={cn(
              "data-[state=active]:shadow-none data-[state=active]:border-b-foreground data-[state=active]:text-foreground",
              "rounded-none px-0.5 pb-4 text-muted-foreground z-50"
            )}
            value="profile"
          >
            Profile
          </TabsTrigger>
          {accountType === USER_TYPES.COMPANY && !currentOrg?.is_client && (
            <TabsTrigger
              className={cn(
                "data-[state=active]:shadow-none data-[state=active]:border-b-foreground data-[state=active]:text-foreground",
                "rounded-none px-0.5 pb-4 text-muted-foreground z-50"
              )}
              value="team-management"
            >
              Team Management
            </TabsTrigger>
          )}
          <TabsTrigger
            className={cn(
              "data-[state=active]:shadow-none data-[state=active]:border-b-foreground data-[state=active]:text-foreground",
              "rounded-none px-0.5 pb-4 text-muted-foreground z-50"
            )}
            value="notifications"
          >
            Notifications
          </TabsTrigger>
        </TabsList>
        <Separator className="my-0 h-px mx-0.5 bg-border -mt-3 mb-2" />
        <TabsContent value="profile" className="mx-0.5">
          {currentUser ? (
            <ProfileTab
              user={currentUser}
              accountType={accountType}
              canEditCompanyName={
                (currentOrg?.owner || currentOrg?.role === ORG_ROLES.ADMIN) &&
                !currentOrg?.is_client
              }
              onFormChange={setIsFormDirty}
              onSubmit={handleProfileSubmit}
            />
          ) : null}
        </TabsContent>
        <TabsContent value="team-management" className="mx-0.5">
          <OrganizationUsersSection onInviteSubmit={handleInviteSubmit} />
        </TabsContent>
        <TabsContent value="notifications" className="mx-0.5">
          <NotificationsTab user={currentUser} onUserUpdated={setCurrentUser} />
        </TabsContent>
      </Tabs>

    </div>
  );
}
