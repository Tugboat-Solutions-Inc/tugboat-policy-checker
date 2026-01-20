import { z } from "zod";

const tenantInviteSchema = z.object({
  email: z
    .string()
    .refine(
      (val) => val === "" || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val),
      "Invalid email format."
    ),
  permission: z.enum(["view", "edit"]),
});

export const inviteTenantsSchema = z
  .object({
    tenantInvites: z.array(tenantInviteSchema),
  })
  .refine(
    (data) => data.tenantInvites.some((invite) => invite.email.trim() !== ""),
    {
      message: "At least one email address is required",
      path: ["tenantInvites"],
    }
  );

export type InviteTenantsFormValues = z.infer<typeof inviteTenantsSchema>;
export type TenantInvite = z.infer<typeof tenantInviteSchema>;
