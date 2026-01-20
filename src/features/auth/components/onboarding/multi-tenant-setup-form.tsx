// features/onboarding/components/individual-name-form.tsx
"use client";

import { ChangeEvent, useEffect, useRef, useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm } from "react-hook-form";
import Image from "next/image";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { ChevronRight, Upload } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  multiTenantSetupInput,
  multiTenantSetupSchema,
} from "../../schemas/auth";

type multiTenantSetupFormProps = {
  onNext?: (values: multiTenantSetupInput) => void;
};

function BrandIconInput({
  value,
  onChange,
  onError,
}: {
  value?: File | null;
  onChange: (file: File | null) => void;
  onError?: (error: string | null) => void;
}) {
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);

  const openFilePicker = () => {
    inputRef.current?.click();
  };

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] ?? null;
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      onError?.("Please upload an image file.");
      return;
    }

    const img = new window.Image();
    const url = URL.createObjectURL(file);

    img.onload = () => {
      onError?.(null);
      onChange(file);
      setPreviewUrl((prev) => {
        if (prev && prev.startsWith("blob:")) URL.revokeObjectURL(prev);
        return url;
      });
    };

    img.onerror = () => {
      onError?.("Failed to load image.");
      URL.revokeObjectURL(url);
    };

    img.src = url;
  };

  // cleanup for blob URLs
  useEffect(() => {
    return () => {
      if (previewUrl && previewUrl.startsWith("blob:")) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);

  // If you later pass in an existing URL instead of File, you could also derive preview from that.
  // For now, we only preview newly selected files.

  return (
    <Button
      tabIndex={0}
      type="button"
      onClick={openFilePicker}
      className={cn(
        "relative flex h-[59px] w-[59px] items-center justify-center rounded-[10px] border",
        previewUrl ? "border-solid" : "border-dashed",
        "border-input bg-white cursor-pointer",
        "hover:border-primary hover:bg-primary/5 transition-colors"
      )}
      aria-label="Upload brand icon"
    >
      {previewUrl ? (
        <Image
          src={previewUrl}
          alt="Brand icon preview"
          fill
          className="object-cover rounded-[10px] p-2.5"
        />
      ) : (
        <Upload className="h-4 w-4 text-primary" />
      )}
      <Input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleFileChange}
      />
    </Button>
  );
}

export default function MultiTenantSetupForm({
  onNext,
}: multiTenantSetupFormProps) {
  const [iconError, setIconError] = useState<string | null>(null);

  const form = useForm<multiTenantSetupInput>({
    resolver: zodResolver(multiTenantSetupSchema),
    defaultValues: {
      company_name: "",
      brand_icon: undefined,
    },
  });

  const companyName = form.watch("company_name");

  async function onSubmitForm(data: multiTenantSetupInput) {
    try {
      onNext?.(data);
    } catch {
      // handle error if needed
    }
  }

  return (
    <form onSubmit={form.handleSubmit(onSubmitForm)} className="w-full">
      <FieldGroup className="gap-8">
        <Controller
          name="company_name"
          control={form.control}
          render={({ field }) => (
            <Field className="gap-2">
              <FieldLabel htmlFor="company_name" className="gap-1">
                Company Name
              </FieldLabel>
              <Input
                {...field}
                type="text"
                placeholder="Your company name"
                className="w-full h-12"
                id="company_name"
              />
            </Field>
          )}
        />

        <Controller
          name="brand_icon"
          control={form.control}
          render={({ field }) => (
            <>
              <Field orientation="horizontal" className="gap-4 items-center">
                <BrandIconInput
                  value={field.value}
                  onChange={(file) => {
                    field.onChange(file);
                  }}
                  onError={setIconError}
                />
                <div className="flex flex-col flex-1 gap-1">
                  <FieldLabel htmlFor="brand_icon">
                    Brand Icon (optional)
                  </FieldLabel>
                  <FieldDescription className="text-xs">
                    Upload your brand icon (24x24 px). It appears in your
                    workspace and tenant signup page.
                  </FieldDescription>
                </div>
              </Field>
              {iconError && (
                <p className="text-sm text-destructive -mt-4">{iconError}</p>
              )}
            </>
          )}
        />

        <Button
          variant="default"
          size="lg"
          className="w-full h-12 gap-2"
          disabled={!companyName || form.formState.isSubmitting}
          type="submit"
        >
          Next step <ChevronRight size={16} />
        </Button>
      </FieldGroup>
    </form>
  );
}
