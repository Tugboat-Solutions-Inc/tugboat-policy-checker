"use client";

import { Input } from "@/components/ui/input";
import { useState, useEffect } from "react";
import { changePassword } from "@/features/settings/api/settings.actions";
import { checkPasswordStrength } from "@/lib/utils";
import PasswordValidation from "@/components/common/password-validation";
import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm } from "react-hook-form";
import { changePasswordSchema } from "../schemas/settings";
import {
  FieldGroup,
  Field,
  FieldLabel,
  FieldError,
} from "@/components/ui/field";
import { CircleAlert, EyeOff, Eye } from "lucide-react";
import { PasswordToggleButton } from "@/components/common/password-toggle-button";

type ChangePasswordFormValues = {
  currentPassword: string;
  newPassword: string;
  confirmNewPassword: string;
};

interface ChangePasswordFormProps {
  onSuccess?: () => void;
  onValidationChange?: (isValid: boolean) => void;
  onSubmittingChange?: (isSubmitting: boolean) => void;
}

export default function ChangePasswordForm({
  onSuccess,
  onValidationChange,
  onSubmittingChange,
}: ChangePasswordFormProps) {
  const form = useForm<ChangePasswordFormValues>({
    resolver: zodResolver(changePasswordSchema),
    mode: "onChange",
    defaultValues: {
      currentPassword: "",
      newPassword: "",
      confirmNewPassword: "",
    },
  });

  const currentPassword = form.watch("currentPassword");
  const newPassword = form.watch("newPassword");
  const confirmNewPassword = form.watch("confirmNewPassword");
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmNewPassword, setShowConfirmNewPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showPasswordValidation, setShowPasswordValidation] =
    useState<boolean>(false);
  const [isNewPasswordFocused, setIsNewPasswordFocused] = useState(false);
  const [currentPasswordValid, setCurrentPasswordValid] = useState<
    boolean | null
  >(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isNewPasswordStrong = checkPasswordStrength(newPassword);
  const passwordsMismatch =
    newPassword.length > 0 &&
    confirmNewPassword.length > 0 &&
    newPassword !== confirmNewPassword;

  const isFormValid = Boolean(
    currentPassword &&
      newPassword &&
      confirmNewPassword &&
      isNewPasswordStrong &&
      !passwordsMismatch
  );

  useEffect(() => {
    if (onValidationChange) {
      onValidationChange(isFormValid);
    }
  }, [isFormValid, onValidationChange]);

  useEffect(() => {
    let timeout: NodeJS.Timeout | undefined;

    if (!newPassword || !isNewPasswordFocused) {
      setShowPasswordValidation(false);
      return;
    }

    if (!isNewPasswordStrong || !confirmNewPassword || passwordsMismatch) {
      setShowPasswordValidation(true);
    }

    if (isNewPasswordStrong && confirmNewPassword && !passwordsMismatch) {
      setShowPasswordValidation(true);
      timeout = setTimeout(() => {
        setShowPasswordValidation(false);
      }, 2000);
    }

    return () => {
      if (timeout) clearTimeout(timeout);
    };
  }, [
    newPassword,
    confirmNewPassword,
    isNewPasswordStrong,
    passwordsMismatch,
    isNewPasswordFocused,
  ]);

  async function onSubmitForm(data: ChangePasswordFormValues) {
    setError(null);
    setCurrentPasswordValid(null);
    setIsSubmitting(true);
    onSubmittingChange?.(true);

    if (passwordsMismatch) {
      setError("Passwords do not match");
      setIsSubmitting(false);
      onSubmittingChange?.(false);
      return;
    }

    try {
      const formData = new FormData();
      formData.append("currentPassword", data.currentPassword);
      formData.append("newPassword", data.newPassword);
      formData.append("confirmNewPassword", data.confirmNewPassword);
      const res = await changePassword(null, formData);

      if (!res?.success) {
        if (res?.message?.includes("Current password is incorrect")) {
          setCurrentPasswordValid(false);
        }
        setError(res?.message || "Something went wrong");
        setIsSubmitting(false);
        onSubmittingChange?.(false);
        return;
      }

      form.reset();
      setCurrentPasswordValid(null);
      setError(null);
      setIsSubmitting(false);
      onSubmittingChange?.(false);
      if (onSuccess) {
        onSuccess();
      }
    } catch (err) {
      setError("Failed to change password. Please try again.");
      setIsSubmitting(false);
      onSubmittingChange?.(false);
    }
  }

  return (
    <form
      id="change-password-form"
      onSubmit={form.handleSubmit(onSubmitForm)}
      className="w-full space-y-4"
    >
      <FieldGroup className="gap-3">
        <Controller
          name="currentPassword"
          control={form.control}
          render={({ field }) => (
            <Field className="gap-2">
              <FieldLabel htmlFor="currentPassword" className="gap-1">
                Current Password
                {currentPasswordValid === false && (
                  <CircleAlert size={12} className="text-destructive" />
                )}
              </FieldLabel>

              <div className="relative">
                <Input
                  {...field}
                  type={showCurrentPassword ? "text" : "password"}
                  placeholder="Enter current password"
                  id="currentPassword"
                  name="currentPassword"
                  className="w-full h-12 pr-10 shadow-none"
                  required
                  autoFocus={false}
                  onChange={(e) => {
                    field.onChange(e);
                    setCurrentPasswordValid(null);
                    setError(null);
                  }}
                />

                <PasswordToggleButton
                  isVisible={showCurrentPassword}
                  onToggle={() => setShowCurrentPassword((p) => !p)}
                />
              </div>

              {currentPasswordValid === false && (
                <FieldError>Invalid password. Try again.</FieldError>
              )}
            </Field>
          )}
        />

        <Controller
          name="newPassword"
          control={form.control}
          render={({ field }) => (
            <Field className="gap-2">
              <FieldLabel htmlFor="newPassword" className="gap-1">
                New Password
                {passwordsMismatch && confirmNewPassword && (
                  <CircleAlert size={12} className="text-destructive" />
                )}
              </FieldLabel>

              <div className="relative">
                <Input
                  {...field}
                  type={showNewPassword ? "text" : "password"}
                  placeholder="Enter new password"
                  id="newPassword"
                  name="newPassword"
                  className="w-full h-12 pr-10 shadow-none"
                  required
                  onFocus={() => setIsNewPasswordFocused(true)}
                  onBlur={() => setIsNewPasswordFocused(false)}
                />

                <PasswordToggleButton
                  isVisible={showNewPassword}
                  onToggle={() => setShowNewPassword((p) => !p)}
                />
              </div>

              {showPasswordValidation && (
                <PasswordValidation password={newPassword} />
              )}
            </Field>
          )}
        />

        <Controller
          name="confirmNewPassword"
          control={form.control}
          render={({ field }) => (
            <Field className="gap-2">
              <FieldLabel htmlFor="confirmNewPassword" className="gap-1">
                Confirm New Password{" "}
                {passwordsMismatch && confirmNewPassword && (
                  <CircleAlert size={12} className="text-destructive" />
                )}
              </FieldLabel>

              <div className="relative">
                <Input
                  {...field}
                  type={showConfirmNewPassword ? "text" : "password"}
                  placeholder="Enter new password again"
                  id="confirmNewPassword"
                  name="confirmNewPassword"
                  className="w-full h-12 pr-10 shadow-none"
                  required
                />

                <PasswordToggleButton
                  isVisible={showConfirmNewPassword}
                  onToggle={() => setShowConfirmNewPassword((p) => !p)}
                />
              </div>

              {passwordsMismatch && (
                <FieldError>Passwords don't match. Try Again.</FieldError>
              )}
            </Field>
          )}
        />
      </FieldGroup>

      {error && currentPasswordValid !== false && (
        <p className="text-sm text-destructive">{error}</p>
      )}
    </form>
  );
}
