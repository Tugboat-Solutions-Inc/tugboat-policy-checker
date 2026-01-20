"use server";

import { SimplePlace } from "@/features/auth/schemas/google";
import { env } from "@/lib/env";

export async function getAutocomplete(address: string): Promise<SimplePlace[]> {
  try {
    const query = new URLSearchParams({
      key: env.NEXT_PUBLIC_GOOGLE_PLACES_API,
      input: address,
      sensor: "false",
      types: "address",
    });
    const response = await fetch(
      `${env.NEXT_PUBLIC_GOOGLE_PLACES_URL}?${query}`
    );
    const data = await response.json();

    if (!data || !Array.isArray(data.predictions)) {
      console.warn("Invalid API response structure:", data);
      return [];
    }

    return data.predictions.map((prediction: any) => ({
      description: prediction.description,
      placeId: prediction.place_id,
    }));
  } catch (error) {
    console.error("Unknown error fetching autocomplete:", error);
    return [];
  }
}
