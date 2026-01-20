"use server";
import { cookies } from "next/headers";
import ResendVerificationClient from "./client";

export default async function ResendVerificationPage() {
  const cookieStore = await cookies();
  const emailHint = cookieStore.get("verification_email")?.value ?? null;

  return <ResendVerificationClient emailHint={emailHint} />;
}
