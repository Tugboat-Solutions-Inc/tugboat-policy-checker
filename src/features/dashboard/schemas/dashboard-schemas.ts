import { z } from "zod";

export const addVideosSchema = z.object({
  collection_id: z.string().min(1, "Please select a collection"),
  notes: z.string().optional(),
  walkthrough_videos: z.array(z.instanceof(File)).optional(),
});

export const addCollectionSchema = z.object({
  name: z.string().min(1, "Collection name is required"),
  description: z.string().max(180).optional(),
  cover_image_url: z.instanceof(File).optional(),
});

export const createUploadSchema = z.object({
  collection_id: z.string().min(1, "Collection is required"),
  unit_id: z.string().min(1, "Unit is required"),
  property_id: z.string().min(1, "Property is required"),
  notes: z.string().optional(),
  photos: z.array(z.instanceof(File)).min(1, "At least one photo is required"),
});

export type AddVideosFormValues = z.infer<typeof addVideosSchema>;
export type AddCollectionFormValues = z.infer<typeof addCollectionSchema>;
export type CreateUploadFormValues = z.infer<typeof createUploadSchema>;
