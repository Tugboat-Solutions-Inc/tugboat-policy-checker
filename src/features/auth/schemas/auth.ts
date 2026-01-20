import { z } from "zod";

export const loginSchema = z.object({
  email: z.email("Invalid email format."),
  password: z.string().min(1, "Password is required"),
});

export const signupSchema = z.object({
  email: z.email("Invalid email address"),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .regex(/[a-z]/, "Password must contain at least one lowercase letter")
    .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
    .regex(/[0-9]/, "Password must contain at least one number"),
});

export const forgotPasswordSchema = z.object({
  email: z.email("Invalid email address"),
});

export const updatePasswordSchema = z.object({
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .regex(/[a-z]/, "Password must contain at least one lowercase letter")
    .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
    .regex(/[0-9]/, "Password must contain at least one number"),
  confirmPassword: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .regex(/[a-z]/, "Password must contain at least one lowercase letter")
    .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
    .regex(/[0-9]/, "Password must contain at least one number"),
});

export const individualNameSchema = z.object({
  first_name: z.string().min(1, "First name is required"),
  last_name: z.string().min(1, "Last name is required"),
});

export const individualPropertySchema = z.object({
  property_name: z.string().min(1, "Property name is required"),
  property_address: z.string().min(1, "Property address is required"),
  property_id: z.string(),
  multi_unit: z.boolean().optional(),
});

export const multiTenantSetupSchema = z.object({
  company_name: z.string().min(1, "Company name is required"),
  brand_icon: z.file().optional(),
});

export const companySetupSchema = z.object({
  company_name: z.string().min(1, "Company name is required"),
});

export const addUnitsSchema = z.object({
  units: z.array(
    z.object({
      unit_name: z.string().min(1, "Unit name is required"),
    })
  ),
});

export type addUnitsInput = z.infer<typeof addUnitsSchema>;
export type individualPropertyInput = z.infer<typeof individualPropertySchema>;
export type individualNameInput = z.infer<typeof individualNameSchema>;
export type multiTenantSetupInput = z.infer<typeof multiTenantSetupSchema>;
export type companySetupInput = z.infer<typeof companySetupSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type SignupInput = z.infer<typeof signupSchema>;
export type ForgotPasswordInput = z.infer<typeof forgotPasswordSchema>;
export type UpdatePasswordInput = z.infer<typeof updatePasswordSchema>;
