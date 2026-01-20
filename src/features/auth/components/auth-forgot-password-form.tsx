"use client";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import React, { useState } from "react";
import { forgotPassword } from "@/features/auth/api/auth.actions";
import { isEmailValid } from "@/lib/utils";
import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm } from "react-hook-form";
import { forgotPasswordSchema } from "../schemas/auth";
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { CircleAlert } from "lucide-react";

type forgotPassFormValues = {
  email: string;
};

export default function AuthForgotPasswordForm() {
  const form = useForm<forgotPassFormValues>({
    resolver: zodResolver(forgotPasswordSchema),
    mode: "onChange",
    defaultValues: {
      email: "",
    },
  });

  const email = form.watch("email");
  const [error, setError] = useState<string | null>(null);

  async function onSubmitForm(data: forgotPassFormValues) {
    setError(null);
    try {
      const formData = new FormData();
      formData.append("email", data.email);
      formData.append("resend", "false");
      await forgotPassword(null, formData);
    } catch (err) {
      setError("Failed to send password reset email. Please try again.");
    }
  }

  return (
    <form onSubmit={form.handleSubmit(onSubmitForm)} className="w-full">
      <FieldGroup className="gap-4">
        <Controller
          name="email"
          control={form.control}
          render={({ field, fieldState }) => (
            <Field className="gap-2">
              <FieldLabel htmlFor="email" className="gap-1">
                Email{" "}
                {fieldState.error && email && (
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
        <Button
          variant="default"
          size="lg"
          className="w-full h-12"
          disabled={
            !email ||
            form.formState.isSubmitting ||
            !!form.formState.errors.email
          }
          type="submit"
        >
          Send Reset Link
        </Button>
        {error && <p className="text-sm text-destructive mt-2">{error}</p>}
      </FieldGroup>
    </form>
  );
}
