// features/onboarding/components/individual-name-form.tsx
"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm } from "react-hook-form";


import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { ChevronRight } from "lucide-react";
import { companySetupSchema } from "../../schemas/auth";

type CompanySetupValues = {
  company_name: string;
};

type CompanySetupFormProps = {
  onNext?: (values: CompanySetupValues) => void;
};

export default function CompanySetupForm({ onNext }: CompanySetupFormProps) {
  const form = useForm<CompanySetupValues>({
    resolver: zodResolver(companySetupSchema),
    defaultValues: {
      company_name: "",
    },
  });

  const companyName = form.watch("company_name");

  async function onSubmitForm(data: CompanySetupValues) {
    try {
      onNext?.(data);
    } catch {
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
                required
              />
            </Field>
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
