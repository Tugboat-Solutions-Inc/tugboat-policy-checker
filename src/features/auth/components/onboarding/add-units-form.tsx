// features/onboarding/components/individual-name-form.tsx
"use client";

import { useState, useEffect } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useFieldArray, useForm } from "react-hook-form";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field";
import { ChevronRight, PlusIcon, X } from "lucide-react";
import { addUnitsInput, addUnitsSchema } from "../../schemas/auth";

type AddUnitsFormValues = {
  units: { unit_name: string }[];
};

type AddUnitsFormProps = {
  onNext?: (values: AddUnitsFormValues) => void;
  onSkip?: () => void | Promise<void>;
  onlyInputs?: boolean;
  onFormStateChange?: (isValid: boolean, values: AddUnitsFormValues) => void;
  initialValues?: Partial<AddUnitsFormValues>;
};

export default function AddUnitsForm({
  onNext,
  onSkip,
  onlyInputs = false,
  onFormStateChange,
  initialValues,
}: AddUnitsFormProps) {
  const [currentUnitName, setCurrentUnitName] = useState("");

  const form = useForm<addUnitsInput>({
    resolver: zodResolver(addUnitsSchema),
    defaultValues: {
      units: initialValues?.units || [],
    },
  });

  const { fields, remove, prepend } = useFieldArray({
    control: form.control,
    name: "units",
  });

  const units = form.watch("units");

  useEffect(() => {
    if (onFormStateChange) {
      const isValid = units.length > 0;
      onFormStateChange(isValid, { units });
    }
  }, [units, onFormStateChange]);

  const handleAddUnit = () => {
    if (currentUnitName.trim()) {
      prepend({ unit_name: currentUnitName.trim() });
      setCurrentUnitName("");
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleAddUnit();
    }
  };

  async function onSubmitForm(data: addUnitsInput) {
    try {
      onNext?.(data);
    } catch {}
  }

  return (
    <form onSubmit={form.handleSubmit(onSubmitForm)} className="w-full">
      <FieldGroup className="gap-1 ">
        <Field className="gap-2">
          <div className="flex flex-row items-center justify-between w-full">
            <FieldLabel htmlFor="unit_name" className="gap-1">
              Unit Name / Number*
            </FieldLabel>
            <Button
              type="button"
              variant="ghost"
              className="h-12 px-6 w-fit disabled:bg-transparent disabled:text-foreground"
              onClick={handleAddUnit}
              disabled={!currentUnitName.trim()}
            >
              <PlusIcon className="h-4 w-4 text-primary" /> Add unit
            </Button>
          </div>

          <Input
            type="text"
            placeholder="Enter unit name and number"
            className="w-full h-12"
            id="unit_name"
            value={currentUnitName}
            onChange={(e) => setCurrentUnitName(e.target.value)}
            onKeyPress={handleKeyPress}
          />
        </Field>
        {fields.length > 0 && (
          <div className="space-y-2 overflow-y-auto max-h-50">
            {fields.map((field, index) => (
              <div key={field.id} className="flex flex-row items-center gap-2">
                <div className="flex flex-1 items-center justify-between p-1 border h-12 rounded-md bg-background">
                  <span className="text-sm truncate px-3">
                    {units[index]?.unit_name}
                  </span>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6 shrink-0"
                    onClick={() => remove(index)}
                  >
                    <X className="h-4 w-4 text-foreground" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}

        {!onlyInputs && (
          <>
            <Button
              variant="default"
              size="lg"
              className="w-full h-12 gap-2 mt-7"
              disabled={units.length === 0 || form.formState.isSubmitting}
              type="submit"
            >
              Next step <ChevronRight size={16} />
            </Button>
            <Button
              variant="secondary"
              size="lg"
              className="w-full h-12 gap-2"
              type="button"
              onClick={() => onSkip?.()}
            >
              Skip for now
            </Button>
          </>
        )}
      </FieldGroup>
    </form>
  );
}
