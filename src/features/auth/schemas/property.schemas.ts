import { z } from "zod";

export const categorySchema = z.object({
  id: z.string(),
  created_at: z.string(),
  updated_at: z.string(),
  name: z.string(),
});

export const brandUnitSchema = z.object({
  id: z.string(),
  created_at: z.string(),
  updated_at: z.string(),
  name: z.string(),
  collections: z.null().optional(),
});

export const brandPropertySchema = z.object({
  id: z.string(),
  name: z.string(),
  address: z.string(),
  address_place_id: z.string(),
  created_at: z.string(),
  updated_at: z.string(),
  last_uploads: z.null().optional(),
  owner_id: z.string().optional(),
  total_items: z.number().optional(),
  total_value: z.number().optional(),
  avg_value: z.number().optional(),
  accesses: z.null().optional(),
});

export const brandSchema = z.object({
  id: z.string(),
  created_at: z.string(),
  updated_at: z.string(),
  name: z.string(),
  unit: brandUnitSchema,
  property: brandPropertySchema,
});

export const itemSchema = z.object({
  id: z.string(),
  created_at: z.string(),
  updated_at: z.string(),
  name: z.string(),
  description: z.string(),
  model_nr: z.string(),
  item_condition: z.string(),
  est_cost: z.number(),
  photo_context: z.string(),
  bounding_box: z.unknown().nullable(),
  photo_url: z.string(),
  category: categorySchema.nullable(),
  brand: brandSchema.nullable(),
  dupe_group_id: z.string().nullable(),
  est_age: z.number(),
  quantity: z.number(),
});

export const uploadCollectionSchema = z.object({
  id: z.string(),
  name: z.string(),
});

export const uploadSchema = z.object({
  id: z.string(),
  created_at: z.string(),
  updated_at: z.string(),
  upload_status: z.string(),
  photo_urls: z.array(z.string()),
  notes: z.string(),
  items: z.array(itemSchema).nullable(),
  items_count: z.number(),
  photo_count: z.number(),
  collection_data: uploadCollectionSchema.nullable().optional(),
});

export const collectionSchema = z.object({
  id: z.string(),
  created_at: z.string(),
  updated_at: z.string(),
  name: z.string(),
  description: z.string(),
  cover_image_url: z.string(),
  items: z.array(itemSchema),
  uploads: z.array(uploadSchema),
  duplicates_detected: z.boolean(),
  total_items: z.number(),
  total_value: z.number(),
  total_uploads: z.number().optional(),
});

export const propertyUnitSchema = z.object({
  id: z.string(),
  created_at: z.string(),
  updated_at: z.string(),
  name: z.string(),
  collections: z.array(collectionSchema).nullable(),
});

export const accessUserSchema = z.object({
  id: z.string(),
  email: z.string(),
  first_name: z.string().nullable().optional(),
  last_name: z.string().nullable().optional(),
  profile_picture_url: z.string().nullable().optional(),
});

export const organizationUserSchema = z.object({
  id: z.string(),
  user_id: z.string(),
  organization_id: z.string(),
  created_at: z.string(),
  updated_at: z.string(),
  role: z.string(),
  user: accessUserSchema.nullable().optional(),
});

export const accessSchema = z.object({
  id: z.string(),
  unit_id: z.string().optional(),
  organization_user: organizationUserSchema,
  created_at: z.string(),
  updated_at: z.string(),
  access_type: z.string(),
  is_client: z.boolean(),
});

export const propertySchema = z.object({
  id: z.string(),
  name: z.string(),
  address: z.string(),
  address_place_id: z.string(),
  created_at: z.string(),
  updated_at: z.string(),
  units: z.array(propertyUnitSchema),
  last_uploads: z.array(uploadSchema).nullable(),
  owner_id: z.string(),
  total_collections: z.number(),
  total_items: z.number(),
  total_value: z.number(),
  avg_value: z.number(),
  accesses: z.array(accessSchema).nullable(),
  favorite: z.boolean().optional(),
});

export const getPropertiesResponseSchema = z.object({
  owned: z.array(propertySchema),
  shared: z.array(propertySchema),
});

export const propertyCreateInputSchema = z.object({
  name: z.string().min(1, "Property name is required"),
  address_place_id: z.string().min(1, "Address place ID is required"),
  organization_id: z.string().min(1, "Organization ID is required"),
});

export type Category = z.infer<typeof categorySchema>;
export type BrandUnit = z.infer<typeof brandUnitSchema>;
export type BrandProperty = z.infer<typeof brandPropertySchema>;
export type Brand = z.infer<typeof brandSchema>;
export type Item = z.infer<typeof itemSchema>;
export type Upload = z.infer<typeof uploadSchema>;
export type PropertyCollection = z.infer<typeof collectionSchema>;
export type PropertyUnit = z.infer<typeof propertyUnitSchema>;
export type AccessUser = z.infer<typeof accessUserSchema>;
export type OrganizationUser = z.infer<typeof organizationUserSchema>;
export type Access = z.infer<typeof accessSchema>;
export type Property = z.infer<typeof propertySchema>;
export type GetPropertiesResponse = z.infer<typeof getPropertiesResponseSchema>;
export type PropertyCreateInput = z.infer<typeof propertyCreateInputSchema>;
