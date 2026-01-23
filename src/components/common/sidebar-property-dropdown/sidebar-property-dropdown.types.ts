import { AccountType } from "@/lib/auth";
import { Property } from "@/features/auth/types/property.types";

export interface SidebarPropertyDropdownProps {
  userType?: AccountType;
  isAdmin?: boolean;
  ownedProperties?: Property[];
  sharedProperties?: Property[];
  isCollapsed?: boolean;
  onCollapsedClick?: () => void;
  isCompanyClient?: boolean;
}

