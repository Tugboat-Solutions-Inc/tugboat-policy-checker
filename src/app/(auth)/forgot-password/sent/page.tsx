"use server";
import { cookies } from "next/headers";
import ForgotPasswordSentClient from "./client";

export default async function ForgotPasswordSentPage() {
  const cookieStore = await cookies();
  const emailHint = cookieStore.get("reset_email")?.value ?? null;

  return <ForgotPasswordSentClient emailHint={emailHint} />;
}
