"use client";

import { useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import Link from "next/link";
import { ROUTES } from "@/config/routes";
import Logo from "@/components/common/logo";
import { GalleryVerticalEnd, ChevronRight, Loader } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field";
import { updateUser } from "@/features/auth/api/user.actions";
import { createClient } from "@/utils/supabase/client";
import { useCurrentOrg } from "@/hooks/use-auth";
import { toast } from "@/components/common/toast/toast";

const memberOnboardingSchema = z.object({
  first_name: z.string().min(1, "First name is required"),
  last_name: z.string().min(1, "Last name is required"),
});

type MemberOnboardingFormValues = z.infer<typeof memberOnboardingSchema>;

export default function OnboardingMemberPage() {
  const currentOrg = useCurrentOrg();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<MemberOnboardingFormValues>({
    resolver: zodResolver(memberOnboardingSchema),
    mode: "onChange",
    defaultValues: {
      first_name: "",
      last_name: "",
    },
  });

  const firstName = form.watch("first_name");
  const lastName = form.watch("last_name");

  async function onSubmit(data: MemberOnboardingFormValues) {
    setIsSubmitting(true);

    try {
      const supabase = createClient();
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        console.error("No session found");
        window.location.href = ROUTES.AUTH.LOGIN;
        return;
      }

      const result = await updateUser({
        first_name: data.first_name,
        last_name: data.last_name,
        settings: {
          notifications: {
            sms: true,
            email: true,
            marketing: false,
          },
        },
      });

      if (!result.success) {
        console.error("Failed to complete onboarding:", result.message);
        toast.error("Failed to complete onboarding", result.message || "Please try again");
        setIsSubmitting(false);
        return;
      }

      await supabase.auth.refreshSession().catch((err) => {
        console.warn("Session refresh failed:", err);
      });
      
      window.location.href = ROUTES.DASHBOARD.ROOT;
    } catch (error) {
      console.error("Error updating user:", error);
      window.location.href = ROUTES.DASHBOARD.ROOT;
    } finally {
      setIsSubmitting(false);
    }
  }

  const organizationName = currentOrg?.org_name || "Tugboat";

  return (
    <div>
      <Link href={ROUTES.HOME} aria-label="Tugboat Home">
        <Logo className="h-6 mb-24" />
      </Link>

      <div className="flex items-center justify-center size-[52px] bg-foreground rounded-[13px] mb-5">
        <GalleryVerticalEnd className="size-[26px] text-background" />
      </div>

      <h1 className="text-3xl font-semibold mb-3">
        Welcome to {organizationName}
      </h1>
      <p className="text-base font-regular text-muted-foreground mb-11">
        Let's set up your profile.
      </p>

      <form onSubmit={form.handleSubmit(onSubmit)} className="w-full">
        <FieldGroup className="gap-3">
          <Controller
            name="first_name"
            control={form.control}
            render={({ field }) => (
              <Field className="gap-2">
                <FieldLabel htmlFor="first_name">First Name*</FieldLabel>
                <Input
                  {...field}
                  type="text"
                  placeholder="Enter your first name"
                  className="w-full h-12"
                  id="first_name"
                />
              </Field>
            )}
          />

          <Controller
            name="last_name"
            control={form.control}
            render={({ field }) => (
              <Field className="gap-2">
                <FieldLabel htmlFor="last_name">Last name*</FieldLabel>
                <Input
                  {...field}
                  type="text"
                  placeholder="Enter your last name"
                  className="w-full h-12"
                  id="last_name"
                />
              </Field>
            )}
          />

          <Button
            variant="default"
            size="lg"
            className="w-full mt-3 h-12"
            disabled={!firstName || !lastName || isSubmitting}
            type="submit"
          >
            {isSubmitting ? (
              <>
                <Loader className="animate-spin size-4" />
                Next step
              </>
            ) : (
              <>
                Next step
                <ChevronRight className="size-4 ml-1" />
              </>
            )}
          </Button>
        </FieldGroup>
      </form>
    </div>
  );
}
