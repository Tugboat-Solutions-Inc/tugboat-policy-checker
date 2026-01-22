"use client";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { updateProfileSettingsSchema } from "../schemas/settings";
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Trash, Upload, Loader, GalleryVerticalEnd } from "lucide-react";
import { ChangePasswordDialog } from "./change-password-dialog";
import { UnsavedChangesDialog } from "@/components/common/unsaved-changes-dialog";
import { useUnsavedChanges } from "@/hooks/use-unsaved-changes";
import { USER_TYPES, UserType } from "@/constants/user-types";
import { cn, getUserInitials } from "@/lib/utils";
import { User } from "@/features/auth/schemas/user.schemas";
import { useCurrentOrg } from "@/hooks/use-auth";
import { env } from "@/lib/env";

type profileFormValues = {
  first_name: string;
  last_name: string;
  profile_image?: string | null;
  company_name: string;
};

interface ProfileTabProps {
  user: User;
  accountType?: UserType;
  canEditCompanyName?: boolean;
  onFormChange?: (isDirty: boolean) => void;
  onSubmit?: (data: profileFormValues) => void;
}

export function ProfileTab({
  user,
  accountType = USER_TYPES.INDIVIDUAL,
  canEditCompanyName = false,
  onFormChange,
  onSubmit,
}: ProfileTabProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [imageError, setImageError] = useState(false);
  const orgName = useCurrentOrg()?.org_name;
  const form = useForm<profileFormValues>({
    resolver: zodResolver(updateProfileSettingsSchema),
    defaultValues: {
      first_name: user.first_name,
      last_name: user.last_name,
      profile_image: user.profile_picture_url
        ? env.NEXT_PUBLIC_STORAGE_URL + user.profile_picture_url
        : null,
      company_name:
        accountType === USER_TYPES.COMPANY ||
        accountType === USER_TYPES.MULTI_TENANT
          ? (orgName ?? "")
          : "",
    },
  });

  const {
    formState: { isDirty },
  } = form;

  const {
    showDialog: showUnsavedChangesDialog,
    handleOpenChange: handleUnsavedChangesOpenChange,
    handleLeave,
  } = useUnsavedChanges({
    hasUnsavedChanges: isDirty,
  });

  const initials = getUserInitials(user.first_name, user.last_name);

  const handleSubmit = (data: profileFormValues) => {
    onSubmit?.(data);
    form.reset(data);
  };

  const handleFileChange = (
    event: React.ChangeEvent<HTMLInputElement>,
    onChange: (value: string) => void
  ) => {
    const file = event.target.files?.[0];
    if (file) {
      setIsUploading(true);
      setImageError(false);
      const reader = new FileReader();
      reader.onloadend = () => {
        onChange(reader.result as string);
        setIsUploading(false);
      };
      reader.readAsDataURL(file);
    }
  };

  useEffect(() => {
    onFormChange?.(isDirty);
  }, [isDirty, onFormChange]);

  useEffect(() => {
    setImageError(false);
  }, [user.profile_picture_url]);

  return (
    <div>
      <div className="p-3 bg-accent border border-accent-border rounded-[8px]">
        <form
          onSubmit={form.handleSubmit(handleSubmit)}
          className="w-full "
          id="profile-form"
        >
          <Controller
            name="profile_image"
            control={form.control}
            render={({ field }) => (
              <div className="flex flex-row items-center mb-8">
                <div className="relative h-[60px] w-[60px] shrink-0 overflow-hidden rounded-md bg-[#026E86] text-xl text-white items-center justify-center flex">
                  {field.value && !imageError ? (
                    <Image
                      src={field.value}
                      alt="Profile"
                      fill
                      className="object-cover"
                      onError={() => setImageError(true)}
                    />
                  ) : (
                    <span>{initials}</span>
                  )}
                </div>
                <div className="ml-5 mr-6">
                  <p className="text-foreground font-semibold text-[16px]">
                    {user.first_name} {user.last_name}
                  </p>
                  <p className="text-muted-foreground text-sm">{user.email}</p>
                </div>
                <div className="flex gap-3">
                  <input
                    type="file"
                    ref={fileInputRef}
                    className="hidden"
                    accept="image/*"
                    onChange={(e) => handleFileChange(e, field.onChange)}
                  />
                  <Button
                    variant="outline"
                    type="button"
                    size="sm"
                    className="gap-2 shadow-none px-3 py-2 h-9 cursor-pointer"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isUploading}
                  >
                    {isUploading ? (
                      <Loader className="h-4 w-4 text-primary animate-spin duration-100" />
                    ) : (
                      <Upload className="h-4 w-4 text-primary" />
                    )}
                    {field.value ? "Replace Photo" : "Upload Photo"}
                  </Button>
                  {field.value && (
                    <Button
                      variant="ghost"
                      type="button"
                      size="sm"
                      className="gap-2 shadow-none px-3 py-2 h-9 text-destructive cursor-pointer"
                      onClick={() => field.onChange("")}
                    >
                      <Trash className="h-4 w-4 " />
                      Remove
                    </Button>
                  )}
                </div>
              </div>
            )}
          />
          <FieldGroup className="gap-3 flex flex-row ">
            {(accountType === USER_TYPES.COMPANY ||
              accountType === USER_TYPES.INDIVIDUAL) && (
              <>
                <Controller
                  name="first_name"
                  control={form.control}
                  render={({ field, fieldState }) => (
                    <Field className="gap-2">
                      <FieldLabel htmlFor="first_name">First name*</FieldLabel>
                      <Input
                        {...field}
                        type="text"
                        placeholder="Enter your first name"
                        className="w-full h-12 shadow-none bg-background"
                        id="first_name"
                        required
                      />
                      {fieldState.error && (
                        <FieldError>{fieldState.error.message}</FieldError>
                      )}
                    </Field>
                  )}
                />
                <Controller
                  name="last_name"
                  control={form.control}
                  render={({ field, fieldState }) => (
                    <Field className="gap-2">
                      <FieldLabel htmlFor="last_name">Last name*</FieldLabel>
                      <Input
                        {...field}
                        type="text"
                        placeholder="Enter your last name"
                        className="w-full h-12 shadow-none bg-background"
                        id="last_name"
                        required
                      />
                      {fieldState.error && (
                        <FieldError>{fieldState.error.message}</FieldError>
                      )}
                    </Field>
                  )}
                />
              </>
            )}

            {(accountType === USER_TYPES.COMPANY ||
              accountType === USER_TYPES.MULTI_TENANT) && (
              <Controller
                name="company_name"
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field className="gap-2">
                    <FieldLabel htmlFor="company_name">
                      Company name{canEditCompanyName && "*"}
                    </FieldLabel>
                    <Input
                      {...field}
                      type="text"
                      placeholder="Enter your company name"
                      className={cn(
                        "h-12 shadow-none bg-background",
                        accountType === USER_TYPES.MULTI_TENANT
                          ? "lg:max-w-1/2 w-full"
                          : "w-full",
                        !canEditCompanyName && "cursor-not-allowed opacity-60"
                      )}
                      id="company_name"
                      required={canEditCompanyName}
                      disabled={!canEditCompanyName}
                    />
                    {fieldState.error && canEditCompanyName && (
                      <FieldError>{fieldState.error.message}</FieldError>
                    )}
                  </Field>
                )}
              />
            )}
          </FieldGroup>
        </form>
      </div>
      <div className="p-3 bg-accent border border-accent-border rounded-[8px] mt-3 flex items-center justify-between">
        <div>
          <h2 className="font-semibold text-lg">Manage Password</h2>
          <p className="text-sm text-muted-foreground">
            Manage your account credentials.
          </p>
        </div>

        <ChangePasswordDialog />
      </div>

      <UnsavedChangesDialog
        open={showUnsavedChangesDialog}
        onOpenChange={handleUnsavedChangesOpenChange}
        onLeave={handleLeave}
      />
    </div>
  );
}
