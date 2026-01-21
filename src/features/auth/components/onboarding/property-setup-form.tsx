// features/onboarding/components/individual-name-form.tsx
"use client";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm } from "react-hook-form";
import { individualPropertySchema } from "../../schemas/auth";
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { PlacesDropdown } from "@/features/auth/components/onboarding/places-dropdown";
import { getAutocomplete } from "../../api/google.actions";
import { SimplePlace } from "../../schemas/google";
import { Switch } from "@/components/ui/switch";
import { ChevronRight } from "lucide-react";

export type PropertySetupFormValues = {
  property_name: string;
  property_address: string;
  property_id: string;
  multi_unit?: boolean;
};

type PropertySetupFormProps = {
  userType?: "individual" | "company" | "multi-tenant";
  onlyInputs?: boolean;
  onMultiUnitChange?: (isMultiUnit: boolean) => void;
  onPropertyNameChange?: (propertyName: string) => void;
  onNext?: (shouldGoToStep3: boolean) => void;
  onFormStateChange?: (
    isValid: boolean,
    values: PropertySetupFormValues
  ) => void;
  initialValues?: Partial<PropertySetupFormValues>;
  onSkip?: () => void | Promise<void>;
  onSubmit?: (values: PropertySetupFormValues) => void | Promise<void>;
  viewOnly?: boolean;
};

export default function PropertySetupForm({
  userType,
  onlyInputs = false,
  onMultiUnitChange,
  onPropertyNameChange,
  onNext,
  onFormStateChange,
  initialValues,
  onSkip,
  onSubmit,
  viewOnly,
}: PropertySetupFormProps) {
  const form = useForm<PropertySetupFormValues>({
    resolver: zodResolver(individualPropertySchema),
    defaultValues: {
      property_name: initialValues?.property_name || "",
      property_address: initialValues?.property_address || "",
      property_id: initialValues?.property_id || "",
      multi_unit: initialValues?.multi_unit || false,
    },
  });

  const [places, setPlaces] = useState<SimplePlace[]>([]);
  const [loadingAction, setLoadingAction] = useState<"submit" | "skip" | null>(
    null
  );

  const isLoading = loadingAction !== null;

  const property_name = form.watch("property_name");
  const property_address = form.watch("property_address");
  const property_id = form.watch("property_id");
  const multi_unit = form.watch("multi_unit");

  useEffect(() => {
    if (userType === "multi-tenant") {
      onMultiUnitChange?.(multi_unit ?? false);
    }
  }, [multi_unit, userType, onMultiUnitChange]);

  useEffect(() => {
    if (property_name) {
      onPropertyNameChange?.(property_name);
    }
  }, [property_name, onPropertyNameChange]);

  useEffect(() => {
    const delayTimer = setTimeout(async () => {
      if (property_address && property_address.length > 0) {
        const results = await getAutocomplete(property_address);
        setPlaces(results);
      } else {
        setPlaces([]);
      }
    }, 150);

    return () => clearTimeout(delayTimer);
  }, [property_address]);

  useEffect(() => {
    if (onFormStateChange) {
      const isValid = !!(property_name && property_address && property_id);
      onFormStateChange(isValid, {
        property_name,
        property_address,
        property_id,
        multi_unit,
      });
    }
  }, [
    property_name,
    property_address,
    property_id,
    multi_unit,
    onFormStateChange,
  ]);

  async function onSubmitForm(data: PropertySetupFormValues) {
    setLoadingAction("submit");
    try {
      if (data.property_name) {
        onPropertyNameChange?.(data.property_name);
      }
      if (onSubmit) {
        await onSubmit(data);
      }
      if (userType === "multi-tenant" && onNext) {
        onNext(data.multi_unit ?? false);
      }
    } catch (error) {
      console.error("Form submission error:", error);
    } finally {
      setLoadingAction(null);
    }
  }

  async function handleSkip() {
    setLoadingAction("skip");
    try {
      await onSkip?.();
    } catch (error) {
      console.error("Skip error:", error);
    } finally {
      setLoadingAction(null);
    }
  }

  return (
    <form onSubmit={form.handleSubmit(onSubmitForm)} className="w-full">
      <FieldGroup className="gap-3">
        <Controller
          name="property_name"
          control={form.control}
          render={({ field }) => (
            <Field className="gap-2">
              <FieldLabel htmlFor="property_name" className="gap-1">
                Property Name*
              </FieldLabel>
              <Input
                {...field}
                disabled={viewOnly}
                type="text"
                placeholder="Enter property name"
                className="w-full h-12 bg-background"
                id="property_name"
              />
            </Field>
          )}
        />

        <Controller
          name="property_address"
          control={form.control}
          render={({ field }) => (
            <Field className="gap-2">
              <FieldLabel htmlFor="property_address" className="gap-1">
                Property Address*
              </FieldLabel>

              <PlacesDropdown
                value={field.value}
                viewOnly={viewOnly}
                onChange={field.onChange}
                onPlaceSelect={(place) => {
                  form.setValue("property_id", place.placeId);
                }}
                places={places}
                placeholder="Enter property address"
                className="w-full h-12 bg-background truncate"
                id="property_address"
              />
            </Field>
          )}
        />
        {userType === "multi-tenant" && (
          <Controller
            name="multi_unit"
            control={form.control}
            render={({ field }) => (
              <Field
                orientation="horizontal"
                className=" items-center mt-2 mb-6 flex justify-between"
              >
                <div className="flex flex-col flex-[0.7] gap-1">
                  <FieldLabel htmlFor="multi_unit">
                    Multi-unit Property
                  </FieldLabel>
                  <FieldDescription className="text-xs">
                    Enable if this property includes multiple units (e.g.,
                    apartments or suites).
                  </FieldDescription>
                </div>
                <Switch
                  checked={field.value}
                  onCheckedChange={(checked) => {
                    field.onChange(checked);
                    onMultiUnitChange?.(checked);
                  }}
                  className="data-[state=checked]:bg-foreground data-[state=unchecked]:bg-input w-11 h-6 *:data-[slot='switch-thumb']:size-5"
                />
              </Field>
            )}
          />
        )}
        {!onlyInputs && (
          <>
            <Button
              variant="default"
              size="lg"
              className="w-full h-12 gap-2"
              disabled={!property_name || !property_address || !property_id || isLoading}
              loading={loadingAction === "submit"}
              type="submit"
            >
              {multi_unit ? (
                <>
                  Next step <ChevronRight size={16} />
                </>
              ) : (
                "Continue"
              )}
            </Button>
            <Button
              variant="secondary"
              size="lg"
              className="w-full h-12 gap-2 cursor-pointer"
              disabled={isLoading}
              loading={loadingAction === "skip"}
              onClick={handleSkip}
              type="button"
            >
              Skip for now
            </Button>
          </>
        )}
      </FieldGroup>
    </form>
  );
}
