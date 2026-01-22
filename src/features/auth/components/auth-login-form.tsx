"use client";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import TextLink from "@/components/common/text-link";
import React, { useEffect, useState, useId } from "react";
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
import { CircleAlert, Loader } from "lucide-react";
import { ROUTES } from "@/config/routes";
import { PasswordToggleButton } from "@/components/common/password-toggle-button";

type LoginFormValues = {
  email: string;
  password: string;
};

export default function AuthLoginForm() {
  const formId = useId();
  const errorId = useId();
  const emailErrorId = useId();
  const passwordErrorId = useId();
  
  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    mode: "onChange",
    defaultValues: {
      email: "",
      password: "",
    },
  });
  
  const [error, setError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const email = form.watch("email");
  const password = form.watch("password");

  useEffect(() => {
    if (error) setError(null);
  }, [email, password]);

  async function onSubmitForm(data: LoginFormValues) {
    setError(null);
    setIsLoading(true);
    
    const formData = new FormData();
    formData.append("email", data.email);
    formData.append("password", data.password);

    const result = await login(null, formData);

    if (result && !result.success) {
      setError("Incorrect email or password. Please try again");
      setIsLoading(false);
    }
  }

  const emailError = form.formState.errors.email;
  const passwordError = form.formState.errors.password;
  const hasEmailError = (!!error || !!emailError) && !!email;
  const hasPasswordError = (!!error || !!passwordError) && !!password;

  return (
    <form 
      onSubmit={form.handleSubmit(onSubmitForm)} 
      className="w-full"
      aria-label="Login form"
      noValidate
    >
      <fieldset disabled={isLoading}>
        <legend className="sr-only">Enter your login credentials</legend>
        
        <FieldGroup className="gap-3">
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

          <Controller
            name="password"
            control={form.control}
            render={({ field, fieldState }) => (
              <Field className="gap-2">
                <FieldLabel htmlFor={`${formId}-password`} className="gap-1">
                  Password
                  {hasPasswordError && (
                    <CircleAlert 
                      size={12} 
                      className="text-destructive" 
                      aria-hidden="true"
                    />
                  )}
                </FieldLabel>

                <div className="relative">
                  <Input
                    {...field}
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter your password"
                    id={`${formId}-password`}
                    autoComplete="current-password"
                    className="w-full h-12 pr-10"
                    aria-invalid={hasPasswordError}
                    aria-describedby={fieldState.error ? passwordErrorId : undefined}
                  />

                  <PasswordToggleButton
                    isVisible={showPassword}
                    onToggle={() => setShowPassword((p) => !p)}
                  />
                </div>

                {fieldState.error && password && (
                  <FieldError id={passwordErrorId} role="alert">
                    {fieldState.error.message}
                  </FieldError>
                )}
              </Field>
            )}
          />
        </FieldGroup>

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

        <div className="mt-6">
          <Button
            variant="default"
            size="lg"
            className="w-full mb-3 h-12"
            disabled={
              !email ||
              !password ||
              isLoading ||
              !!form.formState.errors.email
            }
            type="submit"
            aria-describedby={error ? errorId : undefined}
          >
            {isLoading ? (
              <>
                <Loader className="animate-spin size-4" aria-hidden="true" />
                <span>Logging in…</span>
                <span className="sr-only">Please wait</span>
              </>
            ) : (
              "Log In"
            )}
          </Button>
          
          <TextLink 
            label="Forgot password?" 
            href={ROUTES.AUTH.FORGOT_PASSWORD}
          />
        </div>
      </fieldset>
    </form>
  );
}
