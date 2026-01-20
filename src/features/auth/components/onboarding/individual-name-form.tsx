"use client";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm } from "react-hook-form";
import { individualNameSchema } from "../../schemas/auth";
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field";
import { ChevronRight } from "lucide-react";

type IndividualNameFormValues = {
  first_name: string;
  last_name: string;
};

type IndividualNameFormProps = {
  onNext?: (data: IndividualNameFormValues) => void;
};

export default function IndividualNameForm({
  onNext,
}: IndividualNameFormProps) {
  const form = useForm<IndividualNameFormValues>({
    resolver: zodResolver(individualNameSchema),
    defaultValues: {
      first_name: "",
      last_name: "",
    },
  });

  const first_name = form.watch("first_name");
  const last_name = form.watch("last_name");

  async function onSubmitForm(data: IndividualNameFormValues) {
    onNext?.(data);
  }

  return (
    <form onSubmit={form.handleSubmit(onSubmitForm)} className="w-full">
      <FieldGroup className="gap-3">
        <Controller
          name="first_name"
          control={form.control}
          render={({ field }) => (
            <Field className="gap-2">
              <FieldLabel htmlFor="first_name" className="gap-1">
                First Name*
              </FieldLabel>
              <Input
                {...field}
                type="text"
                placeholder="Your first name"
                className="w-full h-12"
                id="first_name"
                required
              />
            </Field>
          )}
        />

        <Controller
          name="last_name"
          control={form.control}
          render={({ field }) => (
            <Field className="gap-2">
              <FieldLabel htmlFor="last_name" className="gap-1">
                Last Name*
              </FieldLabel>
              <Input
                {...field}
                type="text"
                placeholder="Your last name"
                className="w-full h-12"
                id="last_name"
                required
              />
            </Field>
          )}
        />

        <Button
          variant="default"
          size="lg"
          className="w-full mt-3 h-12 gap-2"
          disabled={!first_name || !last_name || form.formState.isSubmitting}
          type="submit"
        >
          Next step <ChevronRight size={16} />
        </Button>
      </FieldGroup>
    </form>
  );
}
