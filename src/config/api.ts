import { env } from "@/lib/env";

export const API_BASE_URL = env.NEXT_PUBLIC_API_URL;

export const API_ENDPOINTS = {
  USERS: {
    ME: `${API_BASE_URL}/api/v1/users/me`,
    ADMIN_ALL: `${API_BASE_URL}/api/v1/users/admin`,
  },
  INVITES: {
    BY_TOKEN: (token: string) => `${API_BASE_URL}/api/v1/invites/${token}`,
  },
  TEMPLATES: {
    BASE: `${API_BASE_URL}/api/v1/templates`,
    SEARCH: `${API_BASE_URL}/api/v1/templates/search`,
    COLLECTIONS: `${API_BASE_URL}/api/v1/templates/collections`,
    CATEGORIES: `${API_BASE_URL}/api/v1/templates/categories`,
  },
  ORGANIZATIONS: {
    INVITE: (organizationId: string) =>
      `${API_BASE_URL}/api/v1/organizations/${organizationId}/invite`,
  },
  PROPERTIES: {
    BASE: `${API_BASE_URL}/api/v1/properties`,
    ACCESS: (propertyId: string) =>
      `${API_BASE_URL}/api/v1/properties/${propertyId}/access`,
    ACCESS_INVITES: (propertyId: string) =>
      `${API_BASE_URL}/api/v1/properties/${propertyId}/access`,
    UPDATE_ACCESS: (propertyId: string, accessId: string) =>
      `${API_BASE_URL}/api/v1/properties/${propertyId}/access/${accessId}`,
    DELETE_ACCESS: (propertyId: string, accessId: string) =>
      `${API_BASE_URL}/api/v1/properties/${propertyId}/access/${accessId}`,
    COLLECTIONS: (propertyId: string, unitId: string) =>
      `${API_BASE_URL}/api/v1/properties/${propertyId}/units/${unitId}/collections`,
    UPLOADS: (propertyId: string, unitId: string, collectionId: string) =>
      `${API_BASE_URL}/api/v1/properties/${propertyId}/units/${unitId}/collections/${collectionId}/uploads`,
    UPLOADS_UPDATE: (
      propertyId: string,
      unitId: string,
      collectionId: string,
      uploadId: string
    ) =>
      `${API_BASE_URL}/api/v1/properties/${propertyId}/units/${unitId}/collections/${collectionId}/uploads/${uploadId}`,
    UPLOADS_PHOTOS: (
      propertyId: string,
      unitId: string,
      collectionId: string,
      uploadId: string
    ) =>
      `${API_BASE_URL}/api/v1/properties/${propertyId}/units/${unitId}/collections/${collectionId}/uploads/${uploadId}/photos`,
    UPLOADS_START: (
      propertyId: string,
      unitId: string,
      collectionId: string,
      uploadId: string
    ) =>
      `${API_BASE_URL}/api/v1/properties/${propertyId}/units/${unitId}/collections/${collectionId}/uploads/${uploadId}/start`,
    UPLOADS_RETRY: (
      propertyId: string,
      unitId: string,
      collectionId: string,
      uploadId: string
    ) =>
      `${API_BASE_URL}/api/v1/properties/${propertyId}/units/${unitId}/collections/${collectionId}/uploads/${uploadId}/retry`,
    COLLECTIONS_UPDATE: (
      propertyId: string,
      collectionId: string,
      unitId: string
    ) =>
      `${API_BASE_URL}/api/v1/properties/${propertyId}/units/${unitId}/collections/${collectionId}`,
    BRANDS: (propertyId: string, unitId: string) =>
      `${API_BASE_URL}/api/v1/properties/${propertyId}/units/${unitId}/brands`,
    BRANDS_UPDATE: (propertyId: string, brandId: string, unitId: string) =>
      `${API_BASE_URL}/api/v1/properties/${propertyId}/units/${unitId}/brands/${brandId}`,
    CATEGORIES: (propertyId: string, unitId: string) =>
      `${API_BASE_URL}/api/v1/properties/${propertyId}/units/${unitId}/categories`,
    CATEGORIES_UPDATE: (
      propertyId: string,
      categoryId: string,
      unitId: string
    ) =>
      `${API_BASE_URL}/api/v1/properties/${propertyId}/units/${unitId}/categories/${categoryId}`,
    ITEMS: (propertyId: string, unitId: string, collectionId: string) =>
      `${API_BASE_URL}/api/v1/properties/${propertyId}/units/${unitId}/collections/${collectionId}/items`,
    ITEMS_UPDATE: (
      itemId: string,
      propertyId: string,
      unitId: string,
      collectionId: string
    ) =>
      `${API_BASE_URL}/api/v1/properties/${propertyId}/units/${unitId}/collections/${collectionId}/items/${itemId}`,
    ITEMS_DELETE: (propertyId: string, unitId: string, collectionId: string) =>
      `${API_BASE_URL}/api/v1/properties/${propertyId}/units/${unitId}/collections/${collectionId}/items/delete`,
    ITEMS_IMAGES: (
      itemId: string,
      propertyId: string,
      unitId: string,
      collectionId: string
    ) =>
      `${API_BASE_URL}/api/v1/properties/${propertyId}/units/${unitId}/collections/${collectionId}/items/${itemId}/images`,
    ITEMS_IMAGES_DELETE: (
      itemId: string,
      propertyId: string,
      unitId: string,
      collectionId: string,
      imageId: string
    ) =>
      `${API_BASE_URL}/api/v1/properties/${propertyId}/units/${unitId}/collections/${collectionId}/items/${itemId}/images/${imageId}`,
    UNITS: (propertyId: string) =>
      `${API_BASE_URL}/api/v1/properties/${propertyId}/units`,
    UNITS_UPDATE: (propertyId: string, unitId: string) =>
      `${API_BASE_URL}/api/v1/properties/${propertyId}/units/${unitId}`,
    UNITS_IMPORT: (propertyId: string) =>
      `${API_BASE_URL}/api/v1/properties/${propertyId}/units/import`,
    UPLOADS_BY_UNIT: (propertyId: string, unitId: string) =>
      `${API_BASE_URL}/api/v1/properties/${propertyId}/units/${unitId}/uploads`,
    VIDEOS: (propertyId: string, unitId: string, collectionId: string) =>
      `${API_BASE_URL}/api/v1/properties/${propertyId}/units/${unitId}/collections/${collectionId}/videos`,
    VIDEOS_INIT: (propertyId: string, unitId: string, collectionId: string) =>
      `${API_BASE_URL}/api/v1/properties/${propertyId}/units/${unitId}/collections/${collectionId}/video`,
    VIDEOS_DELETE: (
      propertyId: string,
      unitId: string,
      collectionId: string,
      videoId: string
    ) =>
      `${API_BASE_URL}/api/v1/properties/${propertyId}/units/${unitId}/collections/${collectionId}/videos/${videoId}`,
    DEDUPLICATE: (propertyId: string, unitId: string, collectionId: string) =>
      `${API_BASE_URL}/api/v1/properties/${propertyId}/units/${unitId}/collections/${collectionId}/deduplicate`,
    RESOLVE_DUPE_GROUP: (
      propertyId: string,
      unitId: string,
      collectionId: string,
      dupeGroupId: string
    ) =>
      `${API_BASE_URL}/api/v1/properties/${propertyId}/units/${unitId}/collections/${collectionId}/dupe-groups/${dupeGroupId}/resolve`,
    COLLECTION_FAVORITE: (
      propertyId: string,
      unitId: string,
      collectionId: string
    ) =>
      `${API_BASE_URL}/api/v1/properties/${propertyId}/units/${unitId}/collections/${collectionId}/favorite`,
    ORGANIZATIONS: (organizationId: string) =>
      `${API_BASE_URL}/api/v1/organizations/${organizationId}`,
    ORGANIZATIONS_USERS: (organizationId: string) =>
      `${API_BASE_URL}/api/v1/organizations/${organizationId}/users`,
    ORGANIZATIONS_USERS_UPDATE: (organizationId: string, userId: string) =>
      `${API_BASE_URL}/api/v1/organizations/${organizationId}/users/${userId}`,
    EXPORT_CSV: (propertyId: string, unitId: string) =>
      `${API_BASE_URL}/api/v1/properties/${propertyId}/units/${unitId}/export/csv`,
    EXPORT_PDF: (propertyId: string, unitId: string) =>
      `${API_BASE_URL}/api/v1/properties/${propertyId}/units/${unitId}/export/pdf`,
    EXPORT_XLSX: (propertyId: string, unitId: string) =>
      `${API_BASE_URL}/api/v1/properties/${propertyId}/units/${unitId}/export/xlsx`,
  },
} as const;

export const CACHE_REVALIDATION = {
  SHORT: 30,
  MEDIUM: 300,
  LONG: 3600,
  NEVER: false,
} as const;
