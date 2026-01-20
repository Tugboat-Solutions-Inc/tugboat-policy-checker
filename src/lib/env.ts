import { z } from "zod";

const envSchema = z.object({
  NEXT_PUBLIC_SUPABASE_URL: z.string().url("Invalid Supabase URL"),
  NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY: z
    .string()
    .min(1, "Supabase key is required"),
  NEXT_PUBLIC_BASE_URL: z.string().url("Invalid base URL"),
  NEXT_PUBLIC_GOOGLE_PLACES_API: z
    .string()
    .min(1, "Google Places API key is required"),
  NEXT_PUBLIC_GOOGLE_PLACES_URL: z
    .string()
    .min(1, "Google Places URL is required"),
  NEXT_PUBLIC_API_URL: z.string().url("Invalid API URL"),
  NEXT_PUBLIC_STORAGE_URL: z.string().url("Invalid Storage URL"),
  NEXT_PUBLIC_BUNNY_STREAM_LIBRARY_ID: z
    .string()
    .min(1, "Bunny Stream Library ID is required"),
});

export const env = envSchema.parse({
  NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
  NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY:
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY,
  NEXT_PUBLIC_BASE_URL: process.env.NEXT_PUBLIC_BASE_URL,
  NEXT_PUBLIC_GOOGLE_PLACES_API: process.env.NEXT_PUBLIC_GOOGLE_PLACES_API,
  NEXT_PUBLIC_GOOGLE_PLACES_URL: process.env.NEXT_PUBLIC_GOOGLE_PLACES_URL,
  NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL,
  NEXT_PUBLIC_STORAGE_URL: process.env.NEXT_PUBLIC_STORAGE_URL + "/",
  NEXT_PUBLIC_BUNNY_STREAM_LIBRARY_ID:
    process.env.NEXT_PUBLIC_BUNNY_STREAM_LIBRARY_ID,
});
