"use client";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useState, useEffect, useId } from "react";
import { updatePassword } from "@/features/auth/api/auth.actions";
import { checkPasswordStrength } from "@/lib/utils";
import { useSearchParams } from "next/navigation";
import PasswordValidation from "@/components/common/password-validation";
import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm } from "react-hook-form";
import { updatePasswordSchema } from "../schemas/auth";
import {
  FieldGroup,
  Field,
  FieldLabel,
  FieldError,
} from "@/components/ui/field";
import { CircleAlert, Loader } from "lucide-react";
import { ROUTES } from "@/config/routes";
import { useRouter } from "next/navigation";
import { PasswordToggleButton } from "@/components/common/password-toggle-button";

type ResetPassFormValues = {
  password: string;
  confirmPassword: string;
};

export default function AuthResetPasswordForm() {
  const formId = useId();
  const errorId = useId();
  const passwordHintId = useId();
  const confirmErrorId = useId();
  
  const form = useForm<ResetPassFormValues>({
    resolver: zodResolver(updatePasswordSchema),
    mode: "onChange",
    defaultValues: {
      password: "",
      confirmPassword: "",
    },
  });

  const password = form.watch("password");
  const confirmPassword = form.watch("confirmPassword");

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [showPasswordValidation, setShowPasswordValidation] = useState<boolean>(false);

  const searchParams = useSearchParams();
  const tokenHash = searchParams.get("token");
  const router = useRouter();
  const isPasswordStrong = checkPasswordStrength(password);
  const passwordsMismatch =
    password.length > 0 &&
    confirmPassword.length > 0 &&
    password !== confirmPassword;

  useEffect(() => {
    if (error) {
      setError(null);
    }
  }, [password, confirmPassword]);

  useEffect(() => {
    let timeout: NodeJS.Timeout | undefined;

    if (!password) {
      setShowPasswordValidation(false);
      return;
    }

    if (!isPasswordStrong || !confirmPassword || passwordsMismatch) {
      setShowPasswordValidation(true);
    }

    if (isPasswordStrong && confirmPassword) {
      setShowPasswordValidation(true);
      timeout = setTimeout(() => {
        setShowPasswordValidation(false);
      }, 2000);
    }

    return () => {
      if (timeout) clearTimeout(timeout);
    };
  }, [password, confirmPassword, isPasswordStrong, passwordsMismatch]);

  async function onSubmitForm(data: ResetPassFormValues) {
    setError(null);
    setIsLoading(true);

    if (passwordsMismatch) {
      setIsLoading(false);
      return;
    }

    try {
      const formData = new FormData();
      formData.append("password", data.password);
      formData.append("confirmPassword", data.confirmPassword);
      const res = await updatePassword(null, formData, tokenHash);
      if (!res?.success) {
        setError(res?.message || "Something went wrong");
        return;
      }

      router.replace(ROUTES.AUTH.RESET_PASSWORD_SUCCESS);
    } catch (err) {
      setError("Failed to reset password. Please try again.");
    } finally {
      setIsLoading(false);
    }
  }

  const hasConfirmError = passwordsMismatch || (!!error && !!confirmPassword);

  return (
    <form 
      onSubmit={form.handleSubmit(onSubmitForm)} 
      className="w-full"
      aria-label="Reset password form"
      noValidate
    >
      <fieldset disabled={isLoading}>
        <legend className="sr-only">Create your new password</legend>
        
        <FieldGroup className="gap-3">
          <Controller
            name="password"
            control={form.control}
            render={({ field }) => (
              <Field className="gap-2">
                <FieldLabel htmlFor={`${formId}-password`}>
                  New Password
                </FieldLabel>

                <div className="relative">
                  <Input
                    {...field}
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter your new password"
                    id={`${formId}-password`}
                    autoComplete="new-password"
                    className="w-full h-12 pr-10"
                    onFocus={() => setShowPasswordValidation(true)}
                    aria-describedby={showPasswordValidation ? passwordHintId : undefined}
                  />

                  <PasswordToggleButton
                    isVisible={showPassword}
                    onToggle={() => setShowPassword((p) => !p)}
                  />
                </div>
              </Field>
            )}
          />

          <Controller
            name="confirmPassword"
            control={form.control}
            render={({ field }) => (
              <Field className="gap-2">
                <FieldLabel htmlFor={`${formId}-confirm-password`} className="gap-1">
                  Confirm New Password
                  {hasConfirmError && (
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
                    type={showConfirmPassword ? "text" : "password"}
                    placeholder="Confirm your new password"
                    id={`${formId}-confirm-password`}
                    autoComplete="new-password"
                    className="w-full h-12 pr-10"
                    aria-invalid={hasConfirmError}
                    aria-describedby={
                      passwordsMismatch 
                        ? confirmErrorId 
                        : error 
                          ? errorId 
                          : undefined
                    }
                  />

                  <PasswordToggleButton
                    isVisible={showConfirmPassword}
                    onToggle={() => setShowConfirmPassword((p) => !p)}
                  />
                </div>

                {passwordsMismatch && (
                  <FieldError id={confirmErrorId} role="alert">
                    Passwords do not match.
                  </FieldError>
                )}

                {error && !passwordsMismatch && (
                  <p 
                    id={errorId}
                    className="text-sm text-destructive mt-2" 
                    role="alert"
                    aria-live="polite"
                  >
                    {error}
                  </p>
                )}
              </Field>
            )}
          />

          {showPasswordValidation && (
            <PasswordValidation 
              password={password} 
              id={passwordHintId}
            />
          )}

          <Button
            variant="default"
            size="lg"
            className="w-full mt-3 h-12"
            disabled={
              !password ||
              !confirmPassword ||
              !isPasswordStrong ||
              passwordsMismatch ||
              isLoading
            }
            type="submit"
          >
            {isLoading ? (
              <>
                <Loader className="animate-spin size-4" aria-hidden="true" />
                <span>Resetting…</span>
                <span className="sr-only">Please wait</span>
              </>
            ) : (
              "Reset Password"
            )}
          </Button>
        </FieldGroup>
      </fieldset>
    </form>
  );
}
