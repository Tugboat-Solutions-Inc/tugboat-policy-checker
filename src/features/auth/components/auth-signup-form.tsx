"use client";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import TextLink from "@/components/common/text-link";
import React, { useState, useId } from "react";
import { signup } from "@/features/auth/api/auth.actions";
import { checkPasswordStrength } from "@/lib/utils";
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
import { CircleAlert, Loader } from "lucide-react";
import { ROUTES } from "@/config/routes";
import { PasswordToggleButton } from "@/components/common/password-toggle-button";
import { AnimatePresence } from "framer-motion";

type SignupFormValues = {
  email: string;
  password: string;
};

interface AuthSignupFormProps {
  inviteToken?: string;
  inviteEmail?: string;
}

export default function AuthSignupForm({ inviteToken, inviteEmail }: AuthSignupFormProps) {
  const formId = useId();
  const errorId = useId();
  const emailErrorId = useId();
  const passwordHintId = useId();

  const form = useForm<SignupFormValues>({
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

  async function onSubmitForm(data: SignupFormValues) {
    setSignUpError(null);
    try {
      const formData = new FormData();
      formData.append("email", data.email);
      formData.append("password", data.password);
      if (inviteToken) {
        formData.append("invite_token", inviteToken);
      }

      const result = await signup(null, formData);
      
      if (result && !result.success) {
        setSignUpError(result.message || "Unable to create account. Please try again.");
      }
    } catch (error) {
      if (error instanceof Error && error.message.includes("NEXT_REDIRECT")) {
        throw error;
      }
      setSignUpError("Unable to create account. Please try again.");
    }
  }

  const emailError = form.formState.errors.email;
  const hasEmailError = !!emailError && !!email;
  const showPasswordHints = isPasswordFocused || !!password;

  return (
    <form 
      onSubmit={form.handleSubmit(onSubmitForm)} 
      className="w-full"
      aria-label="Create account form"
      noValidate
    >
      <fieldset disabled={form.formState.isSubmitting}>
        <legend className="sr-only">Enter your account details</legend>
        
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
                  disabled={!!inviteEmail}
                  aria-invalid={hasEmailError}
                  aria-describedby={fieldState.error ? emailErrorId : undefined}
                />
                {email && fieldState.error && (
                  <FieldError id={emailErrorId} role="alert">
                    {fieldState.error.message}
                  </FieldError>
                )}
              </Field>
            )}
          />
          
          {signUpError && (
            <p 
              id={errorId}
              className="text-sm text-destructive" 
              role="alert"
              aria-live="polite"
            >
              {signUpError}
            </p>
          )}

          <Controller
            name="password"
            control={form.control}
            render={({ field }) => (
              <Field className="gap-2">
                <FieldLabel htmlFor={`${formId}-password`}>
                  Password
                </FieldLabel>

                <div className="relative">
                  <Input
                    {...field}
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter your password"
                    className="w-full h-12 pr-10"
                    id={`${formId}-password`}
                    autoComplete="new-password"
                    onFocus={() => setIsPasswordFocused(true)}
                    onBlur={() => {
                      setIsPasswordFocused(false);
                      field.onBlur();
                    }}
                    aria-describedby={showPasswordHints ? passwordHintId : undefined}
                  />

                  <PasswordToggleButton
                    isVisible={showPassword}
                    onToggle={() => setShowPassword((p) => !p)}
                  />
                </div>
              </Field>
            )}
          />

          <AnimatePresence>
            {showPasswordHints && (
              <PasswordValidation 
                password={password} 
                id={passwordHintId}
              />
            )}
          </AnimatePresence>

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
            aria-describedby={signUpError ? errorId : undefined}
          >
            {form.formState.isSubmitting ? (
              <>
                <Loader className="animate-spin size-4" aria-hidden="true" />
                <span>Creating account…</span>
                <span className="sr-only">Please wait</span>
              </>
            ) : (
              "Sign Up"
            )}
          </Button>
          
          <nav className="text-center" aria-label="Account navigation">
            <TextLink label="Have an account? Log in" href={ROUTES.AUTH.LOGIN} />
          </nav>
        </FieldGroup>
      </fieldset>
    </form>
  );
}
