"use client";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import TextLink from "@/components/common/text-link";
import React, { useEffect, useState } from "react";
import { login } from "@/features/auth/api/auth.actions";
import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm } from "react-hook-form";
import { loginSchema } from "../schemas/auth";
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { CircleAlert, Loader, Eye, EyeOff } from "lucide-react";
import { ROUTES } from "@/config/routes";
import { PasswordToggleButton } from "@/components/common/password-toggle-button";

type loginFormValues = {
  email: string;
  password: string;
};

export default function AuthLoginForm() {
  const form = useForm<loginFormValues>({
    resolver: zodResolver(loginSchema),
    mode: "onChange",
    defaultValues: {
      email: "",
      password: "",
    },
  });
  const [error, setError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);

  const email = form.watch("email");
  const password = form.watch("password");

  useEffect(() => {
    if (error) setError(null);
  }, [email, password]);

  async function onSubmitForm(data: loginFormValues) {
    setError(null);
    const formData = new FormData();
    formData.append("email", data.email);
    formData.append("password", data.password);

    const result = await login(null, formData);

    if (result && !result.success) {
      setError("Incorrect email or password. Please try again");
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
                {(error || fieldState.error) && email && (
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
              />
              {fieldState.error && email && (
                <FieldError>{fieldState.error.message}</FieldError>
              )}
            </Field>
          )}
        />

        <Controller
          name="password"
          control={form.control}
          render={({ field, fieldState }) => (
            <Field className="gap-2">
              <FieldLabel htmlFor="password" className="gap-1">
                Password{" "}
                {(error || fieldState.error) && password && (
                  <CircleAlert size={12} className="text-destructive" />
                )}
              </FieldLabel>

              <div className="relative">
                <Input
                  {...field}
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter your password"
                  id="password"
                  name="password"
                  className="w-full h-12 pr-10"
                  required
                />

                <PasswordToggleButton
                  isVisible={showPassword}
                  onToggle={() => setShowPassword((p) => !p)}
                />
              </div>

              {fieldState.error && password && (
                <FieldError>{fieldState.error.message}</FieldError>
              )}
            </Field>
          )}
        />
      </FieldGroup>

      {error && <p className="text-sm text-destructive mt-2">{error}</p>}

      <div className="mt-6">
        <Button
          variant="default"
          size="lg"
          className="w-full mb-3 h-12"
          disabled={
            !email ||
            !password ||
            form.formState.isSubmitting ||
            !!form.formState.errors.email
          }
          type="submit"
        >
          {form.formState.isSubmitting ? (
            <>
              <Loader className="animate-spin size-4" />
              Log In
            </>
          ) : (
            "Log In"
          )}
        </Button>
        <TextLink label="Forgot password?" href={ROUTES.AUTH.FORGOT_PASSWORD} />
      </div>
    </form>
  );
}
