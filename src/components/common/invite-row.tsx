"use client";

import { memo } from "react";
import { Controller, Control } from "react-hook-form";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { ChevronDown } from "lucide-react";
import type { TenantInvite } from "../../features/tenant-dashboard/schemas/add-unit.schema";

interface InviteRowProps {
  index: number;
  control: Control<any>;
  invite: TenantInvite;
  onRemove?: () => void;
  canRemove?: boolean;
  fieldNamePrefix?: string;
}

export const InviteRow = memo(function InviteRow({
  index,
  control,
  invite,
  onRemove,
  canRemove = true,
  fieldNamePrefix = "tenantInvites",
}: InviteRowProps) {
  return (
    <div className="flex flex-col gap-2">
      <div className="flex gap-2 items-start">
        <Controller
          name={`${fieldNamePrefix}.${index}.email`}
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
        <Controller
          name={`${fieldNamePrefix}.${index}.permission`}
          control={control}
          render={({ field }) => (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="outline"
                  size="default"
                  className="h-12 gap-2 shrink-0"
                >
                  Can {field.value}
                  <ChevronDown className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-32">
                <DropdownMenuItem onClick={() => field.onChange("view")}>
                  Can view
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => field.onChange("edit")}>
                  Can edit
                </DropdownMenuItem>
                {canRemove && onRemove && (
                  <>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={onRemove}>
                      Remove
                    </DropdownMenuItem>
                  </>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        />
      </div>
    </div>
  );
});
