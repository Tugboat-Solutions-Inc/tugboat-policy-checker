"use client";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";
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
import { CircleAlert, EyeOff, Eye } from "lucide-react";
import { ROUTES } from "@/config/routes";
import { useRouter } from "next/navigation";
import { PasswordToggleButton } from "@/components/common/password-toggle-button";

type resetPassFormValues = {
  password: string;
  confirmPassword: string;
};

export default function AuthResetPasswordForm() {
  const form = useForm<resetPassFormValues>({
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
  const [showPasswordValidation, setShowPasswordValidation] =
    useState<boolean>(false);

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

    // While typing password or before confirmPassword is done → show
    if (!isPasswordStrong || !confirmPassword || passwordsMismatch) {
      setShowPasswordValidation(true);
    }

    // When password is strong, confirmPassword filled and matches → hide after 2s
    if (isPasswordStrong && confirmPassword) {
      setShowPasswordValidation(true); // ensure it's visible first
      timeout = setTimeout(() => {
        setShowPasswordValidation(false);
      }, 2000);
    }

    return () => {
      if (timeout) clearTimeout(timeout);
    };
  }, [password, confirmPassword, isPasswordStrong, passwordsMismatch]);

  async function onSubmitForm(data: resetPassFormValues) {
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

  return (
    <form onSubmit={form.handleSubmit(onSubmitForm)} className="w-full">
      <FieldGroup className="gap-3">
        <Controller
          name="password"
          control={form.control}
          render={({ field }) => (
            <Field className="gap-2">
              <FieldLabel htmlFor="password" className="gap-1">
                New Password
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
                  onFocus={() => setShowPasswordValidation(true)}
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
              <FieldLabel htmlFor="confirmPassword" className="gap-1">
                Confirm New Password{" "}
                {(passwordsMismatch || error) && confirmPassword && (
                  <CircleAlert size={12} className="text-destructive" />
                )}
              </FieldLabel>

              <div className="relative">
                <Input
                  {...field}
                  type={showConfirmPassword ? "text" : "password"}
                  placeholder="Enter your password"
                  id="confirmPassword"
                  name="confirmPassword"
                  className="w-full h-12 pr-10"
                  required
                />

                <PasswordToggleButton
                  isVisible={showConfirmPassword}
                  onToggle={() => setShowConfirmPassword((p) => !p)}
                />
              </div>

              {passwordsMismatch && (
                <FieldError>Passwords do not match.</FieldError>
              )}

              {error && !passwordsMismatch && (
                <p className="text-sm text-destructive mt-2">{error}</p>
              )}
            </Field>
          )}
        />

        {showPasswordValidation && <PasswordValidation password={password} />}

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
          loading={isLoading}
          type="submit"
        >
          Reset Password
        </Button>
      </FieldGroup>
    </form>
  );
}
