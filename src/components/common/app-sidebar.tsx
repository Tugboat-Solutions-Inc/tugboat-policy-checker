"use client";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
  SidebarSeparator,
  useSidebar,
} from "@/components/ui/sidebar";
import { GalleryVerticalEnd, LogOut, Loader2 } from "lucide-react";
import {
  MenuIcon,
  GearIcon,
  DashboardIcon,
  ChevronsLeftIcon,
} from "@/components/icons";
import Link from "next/link";
import { usePathname } from "next/navigation";
import Logo from "@/components/common/logo";
import { StatusChip } from "@/components/ui/status-chip";
import { Button } from "@/components/ui/button";
import { SidebarPropertyDropdown } from "./sidebar-property-dropdown/sidebar-property-dropdown";
import { useState, useTransition } from "react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { useLogout } from "@/hooks/use-logout";
import { ROUTES } from "@/config/routes";
import { USER_TYPES } from "@/constants/user-types";
import Image from "next/image";
import { SuperadminUserChangeMenu } from "@/features/dashboard/components/superadmin-user-change-menu";
import LogoNoText from "./logo-notext";
import { useCurrentUser, useAdminUser } from "@/hooks/use-auth";
import { useSelectedProperty } from "@/hooks/use-properties";
import type { Property } from "@/features/auth/types/property.types";
import { env } from "@/lib/env";

interface AppSidebarProps {
  accountType: "COMPANY" | "INDIVIDUAL" | "MULTI_TENANT" | null;
  ownedProperties: Property[];
  sharedProperties: Property[];
  currentUserId: string;
  impersonatedUserId: string | null;
}

export default function AppSidebar({
  accountType,
  ownedProperties: initialOwnedProperties,
  sharedProperties: initialSharedProperties,
  currentUserId,
  impersonatedUserId,
}: AppSidebarProps) {
  const user = useCurrentUser();
  const adminUser = useAdminUser();
  const ownedProperties = initialOwnedProperties;
  const sharedProperties = initialSharedProperties;
  const selectedProperty = useSelectedProperty(
    ownedProperties,
    sharedProperties
  );

  const pathname = usePathname();
  const { toggleSidebar, state } = useSidebar();
  const [isLoggingOut, startLogout] = useTransition();
  const logout = useLogout();

  const displayName = user?.fullName || user?.email || "";
  const initials = displayName
    .split(" ")
    .map((n: string) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  const isAdmin = adminUser?.role === "ADMIN";
  const isCollapsed = state === "collapsed";
  return (
    <Sidebar
      collapsible="icon"
      className=" border-r h-screen transition-all duration-300 ease-in-out overflow-hidden "
    >
      <SidebarHeader className="py-4 px-0 shrink-0">
        <div className="flex flex-col gap-[18px]">
          <div className="flex items-center justify-between group-data-[collapsible=icon]:justify-center px-4 transition-all duration-300 ease-in-out">
            <div className="group-data-[collapsible=icon]:hidden transition-opacity duration-300 ease-in-out">
              {!isAdmin ? (
                <>
                  {accountType === USER_TYPES.MULTI_TENANT ? (
                    <Link
                      href={ROUTES.DASHBOARD.ROOT}
                      className="flex items-center gap-2 cursor-pointer"
                    >
                      {user?.orgLogoUrl ? (
                        <Image
                          src={env.NEXT_PUBLIC_STORAGE_URL + user.orgLogoUrl}
                          alt="Brand Icon"
                          width={24}
                          height={24}
                          className="h-6 w-6 rounded-[6px] object-cover"
                        />
                      ) : (
                        <div className="flex h-6 w-6 items-center justify-center rounded-[6px] bg-sidebar-primary shrink-0">
                          <GalleryVerticalEnd className="h-3 w-3 text-white" />
                        </div>
                      )}
                      <div className="flex flex-col">
                        <h2 className="font-semibold text-sm max-w-40 ">
                          {user?.orgName || "Company Name"}
                        </h2>
                        <p className="text-xs text-muted-foreground">
                          Powered by Tugboat
                        </p>
                      </div>
                    </Link>
                  ) : (
                    <Link href={ROUTES.DASHBOARD.ROOT}>
                      <Logo className="h-5 cursor-pointer" />
                    </Link>
                  )}
                </>
              ) : (
                <Link
                  href={ROUTES.DASHBOARD.ROOT}
                  className="flex items-center flex-row gap-1.5 cursor-pointer"
                >
                  <LogoNoText className="h-5" />
                  <h2 className="font-semibold text-[15.5px]">Tugboat Super</h2>
                </Link>
              )}
            </div>
            <Button
              onClick={toggleSidebar}
              variant="ghost"
              size="icon"
              className="h-auto w-auto p-0 hover:bg-transparent cursor-pointer"
            >
              <ChevronsLeftIcon className="h-4 w-4 group-data-[collapsible=icon]:rotate-180 transition-transform duration-300" />
            </Button>
          </div>

          <SidebarSeparator className="mx-0 group-data-[collapsible=icon]:hidden" />
          {!(isAdmin && !impersonatedUserId) && (
            <div className="-mb-2 px-2 cursor-pointer">
              <SidebarPropertyDropdown
                userType={accountType}
                isAdmin={isAdmin}
                ownedProperties={ownedProperties}
                sharedProperties={sharedProperties}
                isCollapsed={isCollapsed}
                onCollapsedClick={toggleSidebar}
              />
            </div>
          )}
          {(accountType !== USER_TYPES.COMPANY ||
            pathname.includes("/property/")) &&
            !(isAdmin && !impersonatedUserId) &&
            selectedProperty && (
            <>
              <div className="flex items-end justify-between px-4 group-data-[collapsible=icon]:hidden transition-opacity duration-300 ease-in-out group-data-[collapsible=icon]:opacity-0">
                <div className="text-xs text-muted-foreground leading-4 w-3/5">
                  <p className="">{selectedProperty.address}</p>
                </div>
                {accountType === USER_TYPES.INDIVIDUAL && (
                  <StatusChip
                    variant={
                      ownedProperties.some((p) => p.id === selectedProperty.id)
                        ? "orange"
                        : "blue"
                    }
                    className="shrink-0 py-1.5 px-1 h-5 rounded-[6px]"
                  >
                    {ownedProperties.some((p) => p.id === selectedProperty.id)
                      ? "Owned"
                      : "Shared"}
                  </StatusChip>
                )}
              </div>

              <SidebarMenu className="px-2">
                <SidebarMenuItem>
                  <SidebarMenuButton
                    asChild
                    className="px-2.5 py-2 transition-all duration-200 ease-in-out"
                    isActive={pathname.includes("/details")}
                  >
                    <Link
                      href={ROUTES.DASHBOARD.PROPERTY_DETAILS(selectedProperty.id)}
                    >
                      <MenuIcon
                        isActive={pathname.includes("/details")}
                        className="shrink-0"
                      />
                      <span className="text-sm font-medium text-muted-foreground whitespace-nowrap">
                        Property Details
                      </span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              </SidebarMenu>

              <SidebarSeparator className="mx-0 group-data-[collapsible=icon]:hidden" />
            </>
          )}
        </div>
      </SidebarHeader>

      <SidebarContent className="flex-1 overflow-hidden">
        {(accountType !== USER_TYPES.COMPANY ||
          pathname.includes("/property/")) && (
          <div className="flex flex-col gap-3 px-2">
            <span className="px-2 text-xs text-muted-foreground/60 group-data-[collapsible=icon]:hidden transition-opacity duration-300 ease-in-out group-data-[collapsible=icon]:opacity-0 whitespace-nowrap">
              Navigation
            </span>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton
                  asChild
                  isActive={
                    pathname.includes("/property/") &&
                    !pathname.includes("/details")
                  }
                  className="px-2.5 py-2 transition-all duration-200 ease-in-out"
                >
                  <Link
                    href={
                      selectedProperty
                        ? ROUTES.DASHBOARD.PROPERTY(selectedProperty.id)
                        : ROUTES.DASHBOARD.ROOT
                    }
                  >
                    <DashboardIcon
                      isActive={
                        pathname.includes("/property/") &&
                        !pathname.includes("/details")
                      }
                    />
                    <span className="text-sm font-medium whitespace-nowrap">
                      Dashboard
                    </span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </div>
        )}
      </SidebarContent>

      <SidebarFooter className="px-2 py-4 shrink-0 mt-auto">
        <SidebarMenu>
          <SidebarMenuItem className="mb-3">
            <SidebarMenuButton
              isActive={pathname === ROUTES.DASHBOARD.SETTINGS}
              asChild
              className="px-2.5 py-2 transition-all duration-200 ease-in-out"
            >
              <Link href={ROUTES.DASHBOARD.SETTINGS}>
                <GearIcon
                  isActive={pathname === ROUTES.DASHBOARD.SETTINGS}
                  className="shrink-0"
                />
                <span className="text-sm font-medium text-muted-foreground whitespace-nowrap">
                  Settings
                </span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            {isAdmin === true ? (
              <SuperadminUserChangeMenu
                currentUserId={currentUserId}
                impersonatedUserId={impersonatedUserId}
                isCollapsed={isCollapsed}
                onCollapsedClick={toggleSidebar}
              />
            ) : (
              <Popover>
                <PopoverTrigger asChild>
                  <SidebarMenuButton className="px-2.5 py-2 transition-all duration-200 ease-in-out group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:p-2!">
                    {user?.profilePictureUrl ? (
                      <Image
                        src={
                          env.NEXT_PUBLIC_STORAGE_URL + user.profilePictureUrl
                        }
                        alt={displayName}
                        width={24}
                        height={24}
                        className="h-6 w-6 min-w-6 rounded-[4px] object-cover shrink-0"
                      />
                    ) : (
                      <div className="flex h-6 w-6 min-w-6 items-center justify-center rounded-[4px] bg-[#026e86] shrink-0">
                        <span className="text-xs text-white">{initials}</span>
                      </div>
                    )}
                    <div className="flex flex-col group-data-[collapsible=icon]:hidden transition-opacity duration-200 ease-in-out group-data-[collapsible=icon]:opacity-0 min-w-0 flex-1">
                      <span className="text-sm font-medium truncate">
                        {displayName}
                      </span>
                      {accountType === USER_TYPES.COMPANY && user?.orgName && (
                        <span className="text-xs text-foreground truncate">
                          {user.orgName}
                        </span>
                      )}
                    </div>
                  </SidebarMenuButton>
                </PopoverTrigger>
                <PopoverContent
                  side="top"
                  sideOffset={6}
                  align="start"
                  className={`${isCollapsed ? "w-fit p-0" : "w-(--radix-popover-trigger-width) py-1"} bg-background border-0 shadow-[0_1px_69.4px_0_rgba(87,87,87,0.10)]`}
                >
                  <button
                    onClick={() => startLogout(logout)}
                    disabled={isLoggingOut}
                    className={`flex w-full items-center rounded-md text-sm cursor-pointer hover:text-destructive disabled:opacity-50 disabled:cursor-not-allowed ${isCollapsed ? "gap-0 p-2" : "gap-2 px-2 py-3"}`}
                  >
                    {isLoggingOut ? (
                      <Loader2 className="h-4 w-4 text-destructive animate-spin" />
                    ) : (
                      <LogOut className="h-4 w-4 text-destructive" />
                    )}
                    {!isCollapsed && (
                      <span className="text-sm font-medium">
                        {isLoggingOut ? "Logging out..." : "Log out"}
                      </span>
                    )}
                  </button>
                </PopoverContent>
              </Popover>
            )}
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
