import { Collection } from "@/features/collection-details/types/collection.types";
import { AccessType } from "@/features/property-details/types/property-access.types";

export type Unit = {
  id: string;
  name: string;
  created_at: string;
  updated_at: string;
  collections: Collection[] | null;
};

export type CreateUnit = {
  name: string;
  users?: {
    email: string;
    access_type: AccessType;
  }[];
  organization_id: string;
};
