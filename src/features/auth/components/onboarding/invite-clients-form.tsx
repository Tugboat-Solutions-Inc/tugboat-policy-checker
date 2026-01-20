"use client";

import { useEffect } from "react";
import { useFieldArray, useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Plus } from "lucide-react";
import { InviteRow } from "@/components/common/invite-row";

type ClientInvite = { email: string; permission: "view" | "edit" };

type InviteClientsFormValues = {
  clientInvites: ClientInvite[];
};

type InviteClientsFormProps = {
  onlyInputs?: boolean;
  onFormStateChange?: (
    isValid: boolean,
    values: InviteClientsFormValues
  ) => void;
  initialValues?: Partial<InviteClientsFormValues>;
};

const createEmptyInvite = (): ClientInvite => ({
  email: "",
  permission: "view",
});

export default function InviteClientsForm({
  onlyInputs = false,
  onFormStateChange,
  initialValues,
}: InviteClientsFormProps) {
  const form = useForm<InviteClientsFormValues>({
    mode: "onChange",
    defaultValues: {
      clientInvites: initialValues?.clientInvites?.length
        ? initialValues.clientInvites
        : [createEmptyInvite()],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "clientInvites",
  });

  const clientInvites = form.watch("clientInvites");

  useEffect(() => {
    if (onFormStateChange) {
      onFormStateChange(true, { clientInvites });
    }
  }, [clientInvites, onFormStateChange]);

  const handleAddInvite = () => {
    append(createEmptyInvite());
  };

  return (
    <form className="w-full">
      <FieldGroup className="gap-3">
        <Field className="gap-2">
          <FieldLabel className="gap-1">Email address</FieldLabel>
          <div className="flex flex-col gap-3">
            {fields.map((field, index) => (
              <InviteRow
                key={field.id}
                index={index}
                control={form.control as any}
                invite={field}
                onRemove={() => remove(index)}
                canRemove={fields.length > 1}
                fieldNamePrefix="clientInvites"
              />
            ))}
          </div>
        </Field>
        <Button
          variant="ghost"
          size="default"
          onClick={handleAddInvite}
          className="w-fit h-10 gap-2 text-foreground px-0"
          type="button"
        >
          <Plus className="h-4 w-4 text-primary" />
          Add another
        </Button>
      </FieldGroup>
    </form>
  );
}
