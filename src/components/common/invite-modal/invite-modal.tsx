"use client";

import { useEffect, useState } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { TugboatModal } from "@/components/common/tugboat-modal/tugboat-modal";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Plus } from "lucide-react";
import { toast } from "@/components/common/toast/toast";
import {
  inviteTenantsSchema,
  type InviteTenantsFormValues,
} from "@/features/tenant-dashboard/schemas/invite-tenants.schema";
import { InviteRow } from "@/components/common/invite-row";
import type { InviteModalConfig } from "./config/invite-modal-config";

interface InviteModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit?: (data: InviteTenantsFormValues) => void | Promise<void>;
  config: InviteModalConfig;
}

const createEmptyInvite = () => ({
  email: "",
  permission: "view" as const,
});

export function InviteModal({
  open,
  onOpenChange,
  onSubmit,
  config,
}: InviteModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<InviteTenantsFormValues>({
    resolver: zodResolver(inviteTenantsSchema) as any,
    mode: "onChange",
    defaultValues: {
      tenantInvites: [createEmptyInvite()],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "tenantInvites",
  });

  useEffect(() => {
    if (open) {
      form.reset({
        tenantInvites: [createEmptyInvite()],
      });
    }
  }, [open, form]);

  const handleSubmit = async (data: InviteTenantsFormValues) => {
    setIsSubmitting(true);

    try {
      const filteredData = {
        ...data,
        tenantInvites: data.tenantInvites.filter((t) => t.email.trim() !== ""),
      };

      if (filteredData.tenantInvites.length === 0) {
        toast.error("No invites", "Please add at least one email address");
        setIsSubmitting(false);
        return;
      }

      await onSubmit?.(filteredData);

      toast.success(
        "Invites sent!",
        `${filteredData.tenantInvites.length} ${config.successNoun}${
          filteredData.tenantInvites.length !== 1 ? "s" : ""
        } invited`
      );

      onOpenChange(false);
      setTimeout(() => {
        form.reset();
      }, 300);
    } catch (error) {
      console.error("Failed to send invites:", error);
      toast.error(
        "Failed to send invites",
        error instanceof Error ? error.message : "Please try again"
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    onOpenChange(false);
    form.reset();
  };

  const handleAddInvite = () => {
    append(createEmptyInvite());
  };

  return (
    <TugboatModal
      open={open}
      onOpenChange={onOpenChange}
      title={config.title}
      description={config.description}
      maxWidth="lg"
      footer={
        <div className="flex items-center justify-end gap-3 w-full">
          <Button
            variant="secondary"
            size="default"
            onClick={handleClose}
            type="button"
            className="bg-accent-border hover:bg-accent-border/80"
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
            className={
              !form.formState.isValid || isSubmitting
                ? "bg-[rgba(34,158,186,0.05)] text-[rgba(13,123,148,0.3)] hover:bg-[rgba(34,158,186,0.05)]"
                : ""
            }
          >
            {config.submitButtonText}
          </Button>
        </div>
      }
    >
      <div className="flex flex-col gap-3">
        <Label>{config.labelText}</Label>
        <div className="flex flex-col gap-3">
          {fields.map((field, index) => (
            <div key={field.id}>
              <InviteRow
                index={index}
                control={form.control as any}
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
          onClick={handleAddInvite}
          className="self-start h-10 gap-2 text-foreground px-3"
          type="button"
        >
          <Plus className="h-4 w-4 text-primary" />
          Add another
        </Button>
      </div>
    </TugboatModal>
  );
}
