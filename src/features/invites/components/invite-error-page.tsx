"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ROUTES } from "@/config/routes";
import { AlertCircle } from "lucide-react";
import Logo from "@/components/common/logo";

interface InviteErrorPageProps {
  title?: string;
  message?: string;
}

export function InviteErrorPage({
  title = "Invalid Invite",
  message = "This invite link is invalid, expired, or has already been used.",
}: InviteErrorPageProps) {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-gray-50">
      <Link href={ROUTES.HOME} className="mb-8" aria-label="Tugboat Home">
        <Logo className="h-8" />
      </Link>

      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-destructive/10">
            <AlertCircle className="h-6 w-6 text-destructive" />
          </div>
          <CardTitle className="text-xl">{title}</CardTitle>
          <CardDescription>{message}</CardDescription>
        </CardHeader>

        <CardContent className="text-center text-sm text-muted-foreground">
          <p>
            If you believe this is an error, please contact the person who sent
            you this invite or request a new one.
          </p>
        </CardContent>

        <CardFooter className="flex flex-col gap-3">
          <Link href={ROUTES.DASHBOARD.ROOT} className="w-full">
            <Button className="w-full" size="lg">
              Go to Dashboard
            </Button>
          </Link>
          <Link href={ROUTES.AUTH.LOGIN} className="w-full">
            <Button className="w-full" variant="outline" size="lg">
              Sign In
            </Button>
          </Link>
        </CardFooter>
      </Card>
    </div>
  );
}
