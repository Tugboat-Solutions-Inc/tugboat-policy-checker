"use client";

import { useEffect, useState } from "react";
import { useForm, useFieldArray, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { TugboatModal } from "@/components/common/tugboat-modal/tugboat-modal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Plus } from "lucide-react";
import { toast } from "@/components/common/toast/toast";
import {
  addUnitSchema,
  type AddUnitFormValues,
} from "../../schemas/add-unit.schema";
import { InviteRow } from "@/components/common/invite-row";

interface AddUnitModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit?: (data: AddUnitFormValues) => void | Promise<void>;
}

const createEmptyTenant = () => ({
  id: crypto.randomUUID(),
  email: "",
  permission: "view" as const,
});

export function AddUnitModal({
  open,
  onOpenChange,
  onSubmit,
}: AddUnitModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<AddUnitFormValues>({
    resolver: zodResolver(addUnitSchema),
    mode: "onChange",
    defaultValues: {
      unitName: "",
      tenantInvites: [createEmptyTenant()],
      addMoreUnits: false,
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "tenantInvites",
  });

  const addMoreUnits = form.watch("addMoreUnits");

  useEffect(() => {
    if (open) {
      form.reset({
        unitName: "",
        tenantInvites: [createEmptyTenant()],
        addMoreUnits: false,
      });
    }
  }, [open, form]);

  const handleSubmit = async (data: AddUnitFormValues) => {
    const filteredData = {
      ...data,
      tenantInvites: data.tenantInvites.filter((t) => t.email.trim() !== ""),
    };

    if (addMoreUnits) {
      form.reset({
        unitName: "",
        tenantInvites: [createEmptyTenant()],
        addMoreUnits: true,
      });
      onSubmit?.(filteredData);
    } else {
      setIsSubmitting(true);
      try {
        await onSubmit?.(filteredData);
        onOpenChange(false);
        setTimeout(() => {
          form.reset();
        }, 300);
      } catch (error) {
        console.error("Failed to add unit:", error);
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  const handleClose = () => {
    onOpenChange(false);
    form.reset();
  };

  const handleAddTenant = () => {
    append(createEmptyTenant());
  };

  return (
    <TugboatModal
      open={open}
      onOpenChange={onOpenChange}
      title="Add a New Unit"
      description="Enter unit details and invite tenants or collaborators to access it."
      maxWidth="lg"
      footer={
        <div className="flex items-center justify-between w-full">
          <div className="flex items-center gap-6">
            <Label
              htmlFor="add-more-units"
              className="text-sm font-medium cursor-pointer"
            >
              Add more units
            </Label>
            <Controller
              name="addMoreUnits"
              control={form.control}
              render={({ field }) => (
                <Switch
                  id="add-more-units"
                  checked={field.value}
                  onCheckedChange={field.onChange}
                />
              )}
            />
          </div>
          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              size="default"
              onClick={handleClose}
              type="button"
            >
              Cancel
            </Button>
            <Button
              variant="default"
              size="default"
              onClick={form.handleSubmit(handleSubmit)}
              disabled={!form.formState.isValid || isSubmitting}
              loading={isSubmitting}
              type="button"
            >
              Add unit
            </Button>
          </div>
        </div>
      }
    >
      <div className="flex flex-col gap-5">
        <div className="flex flex-col gap-2">
          <Label htmlFor="unit-name">Unit Name / Number*</Label>
          <Controller
            name="unitName"
            control={form.control}
            render={({ field, fieldState }) => (
              <>
                <Input
                  {...field}
                  id="unit-name"
                  placeholder="Enter unit name and number"
                  className="h-12"
                  autoFocus
                  aria-invalid={fieldState.invalid}
                />
                {fieldState.error && (
                  <p className="text-sm text-destructive">
                    {fieldState.error.message}
                  </p>
                )}
              </>
            )}
          />
        </div>

        <div className="flex flex-col gap-3">
          <Label>Tenant emails (optional)</Label>
          <div className="flex flex-col gap-3">
            {fields.map((field, index) => (
              <div key={field.id}>
                <InviteRow
                  index={index}
                  control={form.control}
                  invite={field}
                  onRemove={() => remove(index)}
                  canRemove={fields.length > 1}
                />
              </div>
            ))}
          </div>
          <Button
            variant="ghost"
            size="default"
            onClick={handleAddTenant}
            className="self-start h-10 gap-2 text-foreground px-3"
            type="button"
          >
            <Plus className="h-4 w-4 text-primary" />
            Add another
          </Button>
        </div>
      </div>
    </TugboatModal>
  );
}
