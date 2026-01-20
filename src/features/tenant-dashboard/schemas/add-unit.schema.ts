import { z } from "zod";

export const tenantInviteSchema = z.object({
  id: z.string(),
  email: z
    .string()
    .refine(
      (val) => val === "" || z.string().email().safeParse(val).success,
      "Invalid email format."
    ),
  permission: z.enum(["view", "edit"]),
});

export const addUnitSchema = z.object({
  unitName: z
    .string()
    .min(1, "Unit name is required")
    .max(100, "Unit name must be less than 100 characters")
    .trim(),
  tenantInvites: z.array(tenantInviteSchema),
  addMoreUnits: z.boolean(),
});

export type AddUnitFormValues = z.infer<typeof addUnitSchema>;
export type TenantInvite = z.infer<typeof tenantInviteSchema>;
