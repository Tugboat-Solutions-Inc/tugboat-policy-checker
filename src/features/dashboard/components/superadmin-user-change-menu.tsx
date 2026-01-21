"use client";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { SidebarMenuButton } from "@/components/ui/sidebar";
import { useLogout } from "@/hooks/use-logout";
import { Check, ChevronUp, LogOut, Search, Loader } from "lucide-react";
import { useEffect, useMemo, useState, useTransition, useCallback } from "react";
import { useRouter } from "next/navigation";
import { cn, getUserInitials } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { getAdminUsers } from "../api/admin-users.actions";
import {
  setImpersonatedUserId,
  clearImpersonatedUserId,
} from "../utils/impersonation";
import type { AdminUser } from "../types/admin-user.types";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { env } from "@/lib/env";
import { useCurrentUser } from "@/hooks/use-auth";
import { useImpersonationStore } from "@/stores/impersonation-store";

interface SuperadminUserChangeMenuProps {
  currentUserId: string;
  impersonatedUserId: string | null;
  isCollapsed?: boolean;
  onCollapsedClick?: () => void;
}

export function SuperadminUserChangeMenu({
  currentUserId,
  impersonatedUserId,
  isCollapsed = false,
  onCollapsedClick,
}: SuperadminUserChangeMenuProps) {
  const router = useRouter();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [isLoadingUsers, setIsLoadingUsers] = useState(true);
  const [isPending, startTransition] = useTransition();
  const currentUser = useCurrentUser();
  const logout = useLogout();
  const clearImpersonation = useImpersonationStore((state) => state.clearImpersonation);
  const setImpersonatedUser = useImpersonationStore((state) => state.setImpersonatedUser);
  const setImpLoading = useImpersonationStore((state) => state.setLoading);

  const displayName = isPending
    ? "Switching..."
    : impersonatedUserId && currentUser
      ? currentUser.fullName
      : "Superadmin";

  const displayInitials =
    isPending
      ? "..."
      : impersonatedUserId && currentUser
        ? getUserInitials(currentUser.firstName, currentUser.lastName)
        : "SA";

  const displayProfilePicture =
    impersonatedUserId && currentUser?.profilePictureUrl && currentUser.profilePictureUrl.trim()
      ? env.NEXT_PUBLIC_STORAGE_URL + currentUser.profilePictureUrl
      : null;

  const handleDropdownOpenChange = (open: boolean) => {
    if (isCollapsed && open && onCollapsedClick) {
      onCollapsedClick();
      return;
    }

    setIsDropdownOpen(open);

    if (open) {
      setSearchQuery("");
      setDebouncedQuery("");
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(searchQuery);
    }, 150);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  const fetchUsers = useCallback(async () => {
    setIsLoadingUsers(true);
    try {
      const result = await getAdminUsers({ page: 1, limit: 100, q: "" });
      if (result.success) {
        setUsers(result.data.data);
      }
    } finally {
      setIsLoadingUsers(false);
    }
  }, []);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  useEffect(() => {
    if (isDropdownOpen && users.length === 0 && !isLoadingUsers) {
      fetchUsers();
    }
  }, [isDropdownOpen, users.length, isLoadingUsers, fetchUsers]);

  const filteredUsers = useMemo(() => {
    if (!debouncedQuery.trim()) return users;

    const query = debouncedQuery.toLowerCase();
    return users.filter(
      (user) =>
        user.first_name?.toLowerCase().includes(query) ||
        user.last_name?.toLowerCase().includes(query) ||
        user.email?.toLowerCase().includes(query)
    );
  }, [users, debouncedQuery]);

  const handleUserSelect = async (user: AdminUser) => {
    setIsDropdownOpen(false);

    startTransition(async () => {
      clearImpersonation();
      setImpLoading(true);

      if (user.id === currentUserId) {
        await clearImpersonatedUserId();
      } else {
        await setImpersonatedUserId(user.id);
        setImpersonatedUser(user.id, {
          id: user.id,
          firstName: user.first_name || "",
          lastName: user.last_name || "",
          email: user.email,
          profilePictureUrl: user.profile_picture_url,
        });
      }

      setImpLoading(false);
      router.push("/dashboard");
      router.refresh();
    });
  };

  return (
    <DropdownMenu open={isDropdownOpen} onOpenChange={handleDropdownOpenChange}>
      <DropdownMenuTrigger asChild>
        <SidebarMenuButton className="px-2.5 py-2 transition-all duration-200 ease-in-out group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:p-2! focus:outline-none focus-visible:outline-none focus-visible:ring-0 focus:ring-0 outline-none ring-0">
          {displayProfilePicture ? (
            <Avatar className="h-6 w-6 shrink-0 rounded-[4px]">
              <AvatarImage
                src={displayProfilePicture}
                alt={displayName}
                className="rounded-[4px]"
              />
              <AvatarFallback className="bg-[#026e86] text-xs text-white rounded-[4px]">
                {displayInitials}
              </AvatarFallback>
            </Avatar>
          ) : (
            <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-[4px] bg-[#026e86]">
              <span className="text-xs text-white">{displayInitials}</span>
            </div>
          )}

          <span className="text-sm font-medium whitespace-nowrap group-data-[collapsible=icon]:hidden transition-opacity duration-200 ease-in-out group-data-[collapsible=icon]:opacity-0">
            {displayName}
          </span>

          <ChevronUp
            className={cn(
              "h-5 w-5 shrink-0 transition-transform group-data-[collapsible=icon]:hidden duration-200 ease-in-out group-data-[collapsible=icon]:opacity-0",
              isDropdownOpen && "rotate-180"
            )}
          />
        </SidebarMenuButton>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        side="top"
        sideOffset={6}
        align="start"
        className="w-(--radix-dropdown-menu-trigger-width) bg-transparent border-none shadow-none p-0 py-1 border-0 data-[state=closed]:slide-out-to-left-20 data-[state=open]:slide-in-from-left-20 data-[state=closed]:zoom-out-100 data-[state=open]:zoom-in-100 duration-400"
      >
        <div className="rounded-[12px] bg-white py-2 pl-2 border border-foreground/5">
          <DropdownMenuLabel className="pl-1 mb-2 pt-0">
            Switch Account
          </DropdownMenuLabel>
          <div className="relative pr-2 mb-3">
            <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground " />
            <Input
              type="text"
              placeholder="Search..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => {
                e.stopPropagation();
              }}
              className="pl-10 shadow-none"
            />
          </div>
          <DropdownMenuGroup className="max-h-[300px] overflow-y-auto thin-scrollbar">
            {isLoadingUsers ? (
              <div className="flex items-center justify-center py-8">
                <Loader className="h-5 w-5 animate-spin text-primary" />
              </div>
            ) : filteredUsers.length === 0 ? (
              <p className="text-sm text-muted-foreground px-2.5 py-2">
                {debouncedQuery
                  ? `No results for "${debouncedQuery}"`
                  : "No users found"}
              </p>
            ) : (
              filteredUsers.map((user) => {
                const isCurrentUser = (impersonatedUserId || currentUserId) === user.id;
                
                const displayFirstName = isCurrentUser && impersonatedUserId && currentUser
                  ? currentUser.firstName
                  : user.first_name || "";
                const displayLastName = isCurrentUser && impersonatedUserId && currentUser
                  ? currentUser.lastName
                  : user.last_name || "";
                const displayPicture = isCurrentUser && impersonatedUserId && currentUser?.profilePictureUrl && currentUser.profilePictureUrl.trim()
                  ? currentUser.profilePictureUrl
                  : isCurrentUser && impersonatedUserId
                    ? null
                    : user.profile_picture_url;

                return (
                  <DropdownMenuItem
                    onClick={() => handleUserSelect(user)}
                    key={user.id}
                    disabled={isPending}
                    className={cn(
                      "p-2.5 mb-1 rounded-[8px] flex items-center gap-2",
                      isCurrentUser
                        ? "bg-sidebar-accent hover:bg-sidebar-accent!"
                        : "hover:bg-sidebar-accent!"
                    )}
                  >
                    <div className="flex flex-row items-center gap-2.5 min-w-0 flex-1">
                      {displayPicture ? (
                        <Avatar className="h-6 w-6 shrink-0 rounded-[4px]">
                          <AvatarImage
                            src={env.NEXT_PUBLIC_STORAGE_URL + displayPicture}
                            alt={`${displayFirstName} ${displayLastName}`}
                            className="rounded-[4px]"
                          />
                          <AvatarFallback className="bg-[#026e86] text-xs text-white rounded-[4px]">
                            {getUserInitials(displayFirstName, displayLastName)}
                          </AvatarFallback>
                        </Avatar>
                      ) : (
                        <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-[4px] bg-[#026e86]">
                          <span className="text-xs text-white">
                            {getUserInitials(displayFirstName, displayLastName)}
                          </span>
                        </div>
                      )}
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-semibold truncate">
                          {displayFirstName} {displayLastName}
                        </p>
                        <p className="text-xs text-muted-foreground truncate">
                          {user.email}
                        </p>
                      </div>
                    </div>
                    {isCurrentUser && (
                      <Check className="text-primary shrink-0" size={16} />
                    )}
                  </DropdownMenuItem>
                );
              })
            )}
          </DropdownMenuGroup>
        </div>

        <div className="h-1" />
        <div className="rounded-[12px] px-3 bg-white h-12 flex flex-row items-center justify-between border border-foreground/5">
          <button
            onClick={() => logout()}
            className="flex w-full items-center gap-2 rounded-md px-2 py-3 text-sm cursor-pointer hover:text-destructive"
          >
            <LogOut className="h-4 w-4 text-destructive" />
            <span className="text-sm font-medium">Log out</span>
          </button>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
