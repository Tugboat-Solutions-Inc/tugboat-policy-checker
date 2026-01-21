import { z } from "zod";

export const userSettingsSchema = z.object({
  notifications: z.object({
    sms: z.boolean(),
    email: z.boolean(),
    marketing: z.boolean(),
  }),
});

export const userSchema = z.object({
  id: z.string(),
  email: z.string().email(),
  phone_number: z.string().nullable(),
  first_name: z.string(),
  last_name: z.string(),
  profile_picture_url: z.string().nullable(),
  settings: userSettingsSchema,
  created_at: z.string(),
  updated_at: z.string(),
});

export const updateUserInputSchema = z.object({
  first_name: z.string(),
  last_name: z.string(),
  settings: userSettingsSchema.optional(),
  profile_picture_b64: z.string().nullable().optional(),
  remove_profile_picture: z.boolean().optional(),
});

export type User = z.infer<typeof userSchema>;
export type UserSettings = z.infer<typeof userSettingsSchema>;
export type UpdateUserInput = z.infer<typeof updateUserInputSchema>;
