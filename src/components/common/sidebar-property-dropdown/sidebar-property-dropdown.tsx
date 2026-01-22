import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ChevronDown, RefreshCw } from "lucide-react";
import { cn } from "@/lib/utils";
import { useState, useRef, useMemo } from "react";
import { usePathname, useRouter } from "next/navigation";
import { USER_TYPES } from "@/constants/user-types";
import { HomeIcon } from "../../icons";
import { NavLink } from "@/components/common/nav-link";
import { ROUTES } from "@/config/routes";
import { useSelectedProperty } from "@/hooks/use-properties";
import { SidebarPropertyDropdownProps } from "./sidebar-property-dropdown.types";
import { usePropertyDropdown } from "./use-property-dropdown";
import { usePropertyModal } from "./use-property-modal";
import { IndividualPropertiesSection } from "./individual-properties-section";
import { CompanyPropertiesSection } from "./company-properties-section";
import { AddPropertySection } from "./add-property-section";
import { createClient } from "@/utils/supabase/client";

export function SidebarPropertyDropdown({
  userType = USER_TYPES.INDIVIDUAL,
  isAdmin = false,
  ownedProperties = [],
  sharedProperties = [],
  isCollapsed = false,
  onCollapsedClick,
}: SidebarPropertyDropdownProps) {
  const pathname = usePathname();
  const router = useRouter();
  const selectedProperty = useSelectedProperty(
    ownedProperties,
    sharedProperties
  );
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [menuButtonWidth, setMenuButtonWidth] = useState<number | undefined>();
  const [isRetrying, setIsRetrying] = useState(false);
  const menuButtonRef = useRef<HTMLDivElement>(null);

  const isCompany = userType === USER_TYPES.COMPANY;
  const allProperties = isCompany
    ? [...ownedProperties, ...sharedProperties]
    : ownedProperties;

  const isTenant = useMemo(() => {
    return userType === USER_TYPES.MULTI_TENANT && !isAdmin;
  }, [userType, isAdmin]);

  const displayName = useMemo(() => {
    if (!selectedProperty) return null;
    
    if (isTenant && selectedProperty.units && selectedProperty.units.length > 0) {
      const unitName = selectedProperty.units[0]?.name;
      if (unitName && unitName !== "Default" && unitName !== "Default Unit") {
        return `${unitName} (${selectedProperty.name})`;
      }
    }
    
    return selectedProperty.name;
  }, [selectedProperty, isTenant]);
  
  const hasNoProperties = ownedProperties.length === 0 && sharedProperties.length === 0;

  const handleRetry = () => {
    setIsRetrying(true);
    router.refresh();
    setTimeout(() => setIsRetrying(false), 2000);
  };

  const {
    searchQuery,
    setSearchQuery,
    filteredProperties,
    handlePropertySelect,
    handlePropertyHover,
  } = usePropertyDropdown(allProperties);

  const {
    isModalOpen,
    setIsModalOpen,
    steps,
    handleComplete,
    handleModalClose,
  } = usePropertyModal(userType);

  const handleDropdownOpenChange = async (open: boolean) => {
    if (isCollapsed && open && onCollapsedClick) {
      onCollapsedClick();
      return;
    }

    if (open) {
      const supabase = createClient();
      await supabase.auth.refreshSession();
    }

    setIsDropdownOpen(open);

    if (open && !isCollapsed) {
      setSearchQuery("");
      setTimeout(() => {
        if (menuButtonRef.current) {
          setMenuButtonWidth(menuButtonRef.current.offsetWidth);
        }
      }, 0);
    }
  };

  const isOnPropertyPage = pathname.includes("/property/");
  const showDropdown = !isCompany || isOnPropertyPage;

  const isHomeActive = pathname === ROUTES.DASHBOARD.ROOT;
  const showExpandedHome = !isOnPropertyPage && !isCollapsed;
  const companyHomeIcon = isCompany && (
    <NavLink
      href={ROUTES.DASHBOARD.ROOT}
      className={cn(
        "flex items-center rounded-md p-2 transition-colors",
        showExpandedHome ? "w-full justify-start gap-2" : "justify-center",
        isOnPropertyPage && !isCollapsed ? "mr-1" : "",
        isHomeActive
          ? "bg-sidebar-accent text-sidebar-accent-foreground"
          : "hover:bg-sidebar-accent/50"
      )}
    >
      <HomeIcon isActive={isHomeActive} className="h-4 w-4" />
      {showExpandedHome && <span className="text-sm font-medium">Home</span>}
    </NavLink>
  );

  if (!showDropdown) {
    return (
      <div className="flex items-center justify-center">{companyHomeIcon}</div>
    );
  }

  return (
    <DropdownMenu onOpenChange={handleDropdownOpenChange}>
      <div
        id="menu-button"
        ref={menuButtonRef}
        className={cn(
          "flex items-center",
          isCollapsed && isOnPropertyPage
            ? "flex-col gap-2 justify-center"
            : "justify-between group-data-[collapsible=icon]:justify-center"
        )}
      >
        {isCollapsed ? (
          <>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="icon" className="h-8 w-8 mx-auto">
                <ChevronDown className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            {companyHomeIcon}
          </>
        ) : (
          <>
            <DropdownMenuTrigger
              asChild
              className="w-fit px-2 hover:bg-sidebar-accent rounded-sm"
            >
              <div className="flex items-center gap-2">
                <span className={cn(
                  "text-base font-semibold whitespace-nowrap truncate max-w-44",
                  !selectedProperty && hasNoProperties && "text-muted-foreground"
                )}>
                  {displayName || (hasNoProperties ? "No Properties" : "Select Property")}
                </span>
                <ChevronDown
                  className={cn(
                    "h-4 w-4 shrink-0 transition-transform",
                    isDropdownOpen && "rotate-180"
                  )}
                />
              </div>
            </DropdownMenuTrigger>
            {companyHomeIcon}
          </>
        )}
      </div>
      <DropdownMenuContent
        className="bg-transparent border-none shadow-none p-0 data-[state=closed]:slide-out-to-left-20 data-[state=open]:slide-in-from-left-20 data-[state=closed]:zoom-out-100 data-[state=open]:zoom-in-100 duration-400"
        align="start"
        side="bottom"
        style={
          !isCollapsed && menuButtonWidth
            ? { width: `${menuButtonWidth}px` }
            : { width: "15rem" }
        }
      >
        {hasNoProperties ? (
          <div className="rounded-[12px] bg-white border border-foreground/5 p-4 mb-1">
            <p className="text-sm text-muted-foreground text-center mb-3">
              No properties found
            </p>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleRetry}
              disabled={isRetrying}
              loading={isRetrying}
              className="w-full text-sm text-primary hover:text-primary/80"
            >
              Refresh
            </Button>
          </div>
        ) : (
          <>
            {userType === USER_TYPES.INDIVIDUAL && (
              <IndividualPropertiesSection
                ownedProperties={ownedProperties}
                sharedProperties={sharedProperties}
                selectedPropertyId={selectedProperty?.id}
                onPropertySelect={handlePropertySelect}
                onPropertyHover={handlePropertyHover}
              />
            )}

            {userType === USER_TYPES.MULTI_TENANT && isTenant && (
              <IndividualPropertiesSection
                ownedProperties={[]}
                sharedProperties={[...ownedProperties, ...sharedProperties]}
                selectedPropertyId={selectedProperty?.id}
                onPropertySelect={handlePropertySelect}
                onPropertyHover={handlePropertyHover}
                showUnitNames
              />
            )}

            {((userType === USER_TYPES.MULTI_TENANT && !isTenant) || isCompany) && (
              <CompanyPropertiesSection
                filteredProperties={filteredProperties}
                selectedPropertyId={selectedProperty?.id}
                searchQuery={searchQuery}
                onSearchChange={setSearchQuery}
                onPropertySelect={handlePropertySelect}
                onPropertyHover={handlePropertyHover}
              />
            )}

            {sharedProperties.length > 0 && <div className="h-1" />}
          </>
        )}

        <AddPropertySection
          isModalOpen={isModalOpen}
          onModalOpenChange={setIsModalOpen}
          steps={steps}
          onComplete={handleComplete}
          onCancel={handleModalClose}
        />
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
