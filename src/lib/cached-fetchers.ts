import { cache } from "react";
import "server-only";

import { getPropertyById } from "@/features/auth/api/property.actions";
import { getPropertyAccess } from "@/features/property-details/api/property-details.actions";
import { getPropertyPermissions } from "@/features/property-details/api/property-permissions.actions";
import {
  getCollections,
  getCollectionById,
} from "@/features/collection-details/api/collection.actions";
import { getUser } from "@/features/auth/api/user.actions";
import { getProperties } from "@/features/auth/api/property.actions";
import { getOrganizationById } from "@/features/dashboard/api/organization.actions";
import { fetchKpiData } from "@/features/tenant-dashboard/api/tenant-dashboard.actions";

export const getCachedPropertyById = cache(getPropertyById);
export const getCachedPropertyAccess = cache(getPropertyAccess);
export const getCachedPropertyPermissions = cache(getPropertyPermissions);
export const getCachedCollections = cache(getCollections);
export const getCachedCollectionById = cache(getCollectionById);
export const getCachedUser = cache(getUser);
export const getCachedProperties = cache(getProperties);
export const getCachedOrganizationById = cache(getOrganizationById);
export const getCachedKpiData = cache(fetchKpiData);