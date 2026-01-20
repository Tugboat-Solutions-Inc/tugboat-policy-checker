import { AccessType } from "@/features/property-details/types/property-access.types";

export const CAPABILITIES = {
  VIEW_PROPERTY: "view_property",
  EDIT_PROPERTY: "edit_property",
  DELETE_PROPERTY: "delete_property",
  MANAGE_USERS: "manage_users",
  VIEW_COLLECTIONS: "view_collections",
  CREATE_COLLECTIONS: "create_collections",
  EDIT_COLLECTIONS: "edit_collections",
  DELETE_COLLECTIONS: "delete_collections",
  UPLOAD_MEDIA: "upload_media",
  DELETE_MEDIA: "delete_media",
} as const;

export type Capability = (typeof CAPABILITIES)[keyof typeof CAPABILITIES];

type RoleCapabilities = {
  [K in AccessType]: Capability[];
};

export const ROLE_CAPABILITIES: RoleCapabilities = {
  VIEWER: [
    CAPABILITIES.VIEW_PROPERTY,
    CAPABILITIES.VIEW_COLLECTIONS,
  ],
  EDITOR: [
    CAPABILITIES.VIEW_PROPERTY,
    CAPABILITIES.EDIT_PROPERTY,
    CAPABILITIES.VIEW_COLLECTIONS,
    CAPABILITIES.CREATE_COLLECTIONS,
    CAPABILITIES.EDIT_COLLECTIONS,
    CAPABILITIES.DELETE_COLLECTIONS,
    CAPABILITIES.UPLOAD_MEDIA,
    CAPABILITIES.DELETE_MEDIA,
    CAPABILITIES.MANAGE_USERS,
  ],
};

