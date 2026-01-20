"use client";

import { memo } from "react";
import { Controller, Control } from "react-hook-form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";
import type { InviteTenantsFormValues } from "@/features/tenant-dashboard/schemas/invite-tenants.schema";

interface TeamMemberInviteRowProps {
  index: number;
  control: Control<InviteTenantsFormValues>;
  onRemove: () => void;
  showRemove: boolean;
}

export const TeamMemberInviteRow = memo(function TeamMemberInviteRow({
  index,
  control,
  onRemove,
  showRemove,
}: TeamMemberInviteRowProps) {
  return (
    <div className="flex flex-col gap-2">
      <div className="flex gap-2 items-start">
        <Controller
          name={`tenantInvites.${index}.email`}
          control={control}
          render={({ field, fieldState }) => (
            <div className="flex-1 flex flex-col">
              <Input
                {...field}
                placeholder="Enter their email address"
                className="h-12"
                type="email"
                aria-invalid={fieldState.invalid}
              />
              {fieldState.error && (
                <p className="text-sm text-destructive mt-1.5">
                  {fieldState.error.message}
                </p>
              )}
            </div>
          )}
        />
        {showRemove && (
          <Button
            variant="ghost"
            size="icon"
            onClick={onRemove}
            className="h-12 w-12 shrink-0 text-muted-foreground hover:bg-transparent hover:text-destructive"
            type="button"
          >
            <X className="h-4 w-4" />
          </Button>
        )}
      </div>
    </div>
  );
});
