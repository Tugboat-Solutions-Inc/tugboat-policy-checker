"use client";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import TextLink from "@/components/common/text-link";
import React, { useState } from "react";
import { signup } from "@/features/auth/api/auth.actions";
import { checkPasswordStrength, isEmailValid } from "@/lib/utils";
import PasswordValidation from "@/components/common/password-validation";
import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm } from "react-hook-form";
import { signupSchema } from "../schemas/auth";
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { CircleAlert, Loader, Eye, EyeOff } from "lucide-react";
import { ROUTES } from "@/config/routes";
import { PasswordToggleButton } from "@/components/common/password-toggle-button";
type signupFormValues = {
  email: string;
  password: string;
};

interface AuthSignupFormProps {
  inviteToken?: string;
  inviteEmail?: string;
}

export default function AuthSignupForm({ inviteToken, inviteEmail }: AuthSignupFormProps) {
  const form = useForm<signupFormValues>({
    resolver: zodResolver(signupSchema),
    mode: "onChange",
    defaultValues: {
      email: inviteEmail || "",
      password: "",
    },
  });

  const [signUpError, setSignUpError] = useState<string | null>(null);
  const [isPasswordFocused, setIsPasswordFocused] = useState<boolean>(false);
  const [showPassword, setShowPassword] = useState(false);

  const email = form.watch("email");
  const password = form.watch("password");

  async function onSubmitForm(data: signupFormValues) {
    setSignUpError(null);
    try {
      const formData = new FormData();
      formData.append("email", data.email);
      formData.append("password", data.password);
      if (inviteToken) {
        formData.append("invite_token", inviteToken);
      }

      const result = await signup(null, formData);
      
      // If there's an error response (not a redirect), show it
      if (result && !result.success) {
        setSignUpError(result.message || "Unable to create account. Please try again.");
      }
      // If no error, the action will redirect to success page
    } catch (error) {
      // This catches the redirect or other unexpected errors
      // Redirects throw in Next.js server actions, which is expected
      if (error instanceof Error && error.message.includes("NEXT_REDIRECT")) {
        // This is expected - let the redirect happen
        throw error;
      }
      setSignUpError("Unable to create account. Please try again.");
    }
  }

  return (
    <form onSubmit={form.handleSubmit(onSubmitForm)} className="w-full">
      <FieldGroup className="gap-3">
        <Controller
          name="email"
          control={form.control}
          render={({ field, fieldState }) => (
            <Field className="gap-2">
              <FieldLabel htmlFor="email" className="gap-1">
                Email{" "}
                {email && fieldState.error && (
                  <CircleAlert size={12} className="text-destructive" />
                )}
              </FieldLabel>
              <Input
                {...field}
                type="email"
                placeholder="Enter your email address"
                className="w-full h-12"
                id="email"
                name="email"
                required
                disabled={!!inviteEmail}
              />
              {email && fieldState.error && (
                <FieldError>{fieldState.error.message}</FieldError>
              )}
            </Field>
          )}
        />
        {signUpError && (
          <p className="text-sm text-destructive mt-2">{signUpError}</p>
        )}

        <Controller
          name="password"
          control={form.control}
          render={({ field, fieldState }) => (
            <Field className="gap-2">
              <FieldLabel htmlFor="password" className="gap-1">
                Password
              </FieldLabel>

              <div className="relative">
                <Input
                  {...field}
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter your password"
                  className="w-full h-12 pr-10"
                  id="password"
                  name="password"
                  onFocus={(e) => {
                    setIsPasswordFocused(true);
                  }}
                  onBlur={(e) => {
                    setIsPasswordFocused(false);
                    field.onBlur();
                  }}
                  required
                />

                <PasswordToggleButton
                  isVisible={showPassword}
                  onToggle={() => setShowPassword((p) => !p)}
                />
              </div>
            </Field>
          )}
        />

        {(isPasswordFocused || !!password) && (
          <PasswordValidation password={password} />
        )}

        <Button
          variant="default"
          size="lg"
          className="w-full mt-3 h-12"
          disabled={
            !email ||
            !password ||
            form.formState.isSubmitting ||
            !checkPasswordStrength(password) ||
            !!form.formState.errors.email
          }
          type="submit"
        >
          {form.formState.isSubmitting ? (
            <>
              <Loader className="animate-spin size-4" />
              Sign Up
            </>
          ) : (
            "Sign Up"
          )}
        </Button>
        <div className="text-center">
          <TextLink label="Have an account? Log in" href={ROUTES.AUTH.LOGIN} />
        </div>
      </FieldGroup>
    </form>
  );
}
