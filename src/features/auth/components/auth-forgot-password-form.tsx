"use client";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import React, { useState, useId } from "react";
import { forgotPassword } from "@/features/auth/api/auth.actions";
import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm } from "react-hook-form";
import { forgotPasswordSchema } from "../schemas/auth";
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { CircleAlert, Loader } from "lucide-react";

type ForgotPassFormValues = {
  email: string;
};

export default function AuthForgotPasswordForm() {
  const formId = useId();
  const errorId = useId();
  const emailErrorId = useId();
  
  const form = useForm<ForgotPassFormValues>({
    resolver: zodResolver(forgotPasswordSchema),
    mode: "onChange",
    defaultValues: {
      email: "",
    },
  });

  const email = form.watch("email");
  const [error, setError] = useState<string | null>(null);

  async function onSubmitForm(data: ForgotPassFormValues) {
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

  const emailError = form.formState.errors.email;
  const hasEmailError = !!emailError && !!email;

  return (
    <form 
      onSubmit={form.handleSubmit(onSubmitForm)} 
      className="w-full"
      aria-label="Password reset request form"
      noValidate
    >
      <fieldset disabled={form.formState.isSubmitting}>
        <legend className="sr-only">Enter your email to receive a password reset link</legend>
        
        <FieldGroup className="gap-4">
          <Controller
            name="email"
            control={form.control}
            render={({ field, fieldState }) => (
              <Field className="gap-2">
                <FieldLabel htmlFor={`${formId}-email`} className="gap-1">
                  Email
                  {hasEmailError && (
                    <CircleAlert 
                      size={12} 
                      className="text-destructive" 
                      aria-hidden="true"
                    />
                  )}
                </FieldLabel>
                <Input
                  {...field}
                  type="email"
                  placeholder="Enter your email address"
                  className="w-full h-12"
                  id={`${formId}-email`}
                  autoComplete="email"
                  aria-invalid={hasEmailError}
                  aria-describedby={fieldState.error ? emailErrorId : undefined}
                />
                {fieldState.error && email && (
                  <FieldError id={emailErrorId} role="alert">
                    {fieldState.error.message}
                  </FieldError>
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
            aria-describedby={error ? errorId : undefined}
          >
            {form.formState.isSubmitting ? (
              <>
                <Loader className="animate-spin size-4" aria-hidden="true" />
                <span>Sending…</span>
                <span className="sr-only">Please wait</span>
              </>
            ) : (
              "Send Reset Link"
            )}
          </Button>
          
          {error && (
            <p 
              id={errorId}
              className="text-sm text-destructive mt-2" 
              role="alert"
              aria-live="polite"
            >
              {error}
            </p>
          )}
        </FieldGroup>
      </fieldset>
    </form>
  );
}
