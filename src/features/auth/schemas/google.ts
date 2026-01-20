import { z } from "zod";

const matchedSubstringSchema = z.object({
  length: z.number(),
  offset: z.number(),
});

const structuredFormattingSchema = z.object({
  main_text: z.string(),
  main_text_matched_substrings: z.array(matchedSubstringSchema),
  secondary_text: z.string(),
});

const termSchema = z.object({
  offset: z.number(),
  value: z.string(),
});

const predictionSchema = z.object({
  description: z.string(),
  matched_substrings: z.array(matchedSubstringSchema),
  place_id: z.string(),
  reference: z.string(),
  structured_formatting: structuredFormattingSchema,
  terms: z.array(termSchema),
  types: z.array(z.string()),
});

export const googlePlacesAutocompleteResponseSchema = z.object({
  predictions: z.array(predictionSchema),
  status: z.string(),
});

export const simplePlaceSchema = z.object({
  description: z.string(),
  placeId: z.string(),
});

export type GooglePlacesAutocompleteResponse = z.infer<
  typeof googlePlacesAutocompleteResponseSchema
>;
export type Prediction = z.infer<typeof predictionSchema>;
export type SimplePlace = z.infer<typeof simplePlaceSchema>;
