import { StatusChipVariant } from "@/components/ui/status-chip";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import {
  OrgMetadata,
  CurrentUserType,
} from "@/features/auth/types/auth-store.types";
import { USER_TYPES } from "@/constants/user-types";
import { propertyAccess } from "@/features/property-details/types/property-access.types";
import { useCurrentUser } from "@/hooks/use-auth";
import type { Property } from "@/features/auth/types/property.types";
import { format } from "date-fns";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function isValidUUID(value: string): boolean {
  const uuidRegex =
    /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  return uuidRegex.test(value);
}

export function isEmailValid(email: string) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

export function checkPasswordStrength(password: string) {
  const minLength = 8;
  const hasUpperCase = /[A-Z]/.test(password);
  const hasNumber = /[0-9]/.test(password);

  return password.length >= minLength && hasUpperCase && hasNumber;
}

export const createThumbnail = (file: File): Promise<string> => {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new window.Image();
      img.onload = () => {
        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d");

        // Create small thumbnail (200x200 max)
        const maxSize = 200;
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > maxSize) {
            height *= maxSize / width;
            width = maxSize;
          }
        } else {
          if (height > maxSize) {
            width *= maxSize / height;
            height = maxSize;
          }
        }

        canvas.width = width;
        canvas.height = height;
        ctx?.drawImage(img, 0, 0, width, height);

        resolve(canvas.toDataURL("image/jpeg", 0.6));
      };
      img.src = e.target?.result as string;
    };
    reader.readAsDataURL(file);
  });
};

//TODO fix this with actual user types
export function getStatusChipText(user: any): string {
  if (user.userType === "company") {
    return "Company";
  } else if (user.userType === "individual") {
    return "Owner";
  } else if (user.userType === "multiTenant") {
    return "Multi-tenant";
  }
  return "Owner";
}

export function getStatusChipVariant(user: any): StatusChipVariant {
  if (user.userType === "company") {
    return "blue";
  } else if (user.userType === "individual") {
    return "orange";
  } else if (user.userType === "multiTenant") {
    return "green";
  }
  return "orange";
}

export function getInitials(user: any): string {
  const name = `${user?.first_name || ""} ${user?.last_name || ""}`.trim();
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

export function getUserInitials(first_name: string, last_name: string): string {
  const name = `${first_name || ""} ${last_name || ""}`.trim();
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

export function getUserDisplayInfo(user?: {
  first_name?: string | null;
  last_name?: string | null;
  email?: string | null;
} | null): { displayName: string; initials: string; email: string } {
  const firstName = user?.first_name || "";
  const lastName = user?.last_name || "";
  const email = user?.email || "";
  const hasName = firstName || lastName;
  const displayName = hasName ? `${firstName} ${lastName}`.trim() : email || "Unknown";
  const initials = hasName
    ? getUserInitials(firstName, lastName)
    : email?.charAt(0).toUpperCase() || "?";
  return { displayName, initials, email };
}

export function getIsStaticRole(
  access: propertyAccess,
  currentOrg: OrgMetadata,
  currentUser: CurrentUserType
): boolean {
  const isSameOrg =
    access.organization_user.organization_id === currentOrg.org_id;
  const isClient = access.is_client;
  const role = access.organization_user.role;
  if (currentUser.accountType === USER_TYPES.COMPANY) {
    if (isSameOrg && !isClient) {
      return true; // Static role for COMPANY orgs
    }
  } else {
    if (role === "ADMIN") {
      return true; // Static role for INDIVIDUAL or MULTI_TENANT orgs
    }
  }
  return false;
}

export function getShowCompanyField(
  access: propertyAccess,
  currentOrg: OrgMetadata,
  currentUser: CurrentUserType
): boolean {
  const isClient = access.is_client;
  const isSameOrg =
    currentOrg.org_id === access.organization_user.organization_id;
  if (currentUser.accountType === USER_TYPES.COMPANY) {
    if (isSameOrg && !isClient) {
      return true;
    }
  }
  return false;
}

export function getRoleLabel(
  access: propertyAccess,
  isStatic: boolean,
  currentUser: CurrentUserType
): string {
  const role = access.organization_user.role;
  const accessType = access.access_type;
  if (!isStatic) {
    if (accessType === "EDITOR") {
      return "Can Edit";
    } else {
      return "Can View";
    }
  }

  if (currentUser.accountType === USER_TYPES.COMPANY) {
    if (role === "ADMIN") {
      return "Admin";
    } else {
      return "Team Member";
    }
  } else {
    if (role === "ADMIN") {
      return "Owner";
    } else {
      return "User";
    }
  }
}

export async function convertImageToBase64(
  image: File | string | null | undefined
): Promise<string | null> {
  if (!image) return null;

  if (typeof image === "string") {
    if (image.startsWith("data:")) {
      const base64Marker = "base64,";
      const idx = image.indexOf(base64Marker);

      if (idx === -1) {
        return null;
      }

      return image.substring(idx + base64Marker.length);
    } else {
      return image;
    }
  }

  if (typeof FileReader === "undefined") {
    const arrayBuffer = await image.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    return buffer.toString("base64");
  }

  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      const result = reader.result as string;
      if (result.startsWith("data:")) {
        const base64Marker = "base64,";
        const idx = result.indexOf(base64Marker);
        if (idx === -1) {
          resolve(null);
          return;
        }
        resolve(result.substring(idx + base64Marker.length));
      } else {
        resolve(result);
      }
    };
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(image);
  });
}

export function formatDate(dateString: string): string {
  return format(new Date(dateString), "MMM d, yyyy");
}

export function formatCurrencyAbbreviated(value: number): string {
  if (value >= 1000000) {
    const millions = value / 1000000;
    return `$ ${millions.toFixed(1).replace(".", ",")}mil`;
  }
  if (value >= 1000) {
    const thousands = value / 1000;
    return `$ ${thousands.toFixed(1).replace(".", ",")}k`;
  }
  return `$ ${value}`;
}

export function getFirstUnitId(property: Property): string | null {
  if (!property.units || property.units.length === 0) {
    return null;
  }
  return property.units[0].id;
}

export function hasUnits(property: Property): boolean {
  return property.units && property.units.length > 0;
}
