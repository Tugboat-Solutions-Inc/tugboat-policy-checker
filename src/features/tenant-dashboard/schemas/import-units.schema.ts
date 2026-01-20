import { z } from "zod";

const MAX_FILE_SIZE = 5 * 1024 * 1024;
const ACCEPTED_FILE_TYPES = ["text/csv", "application/vnd.ms-excel"];

export const importUnitsSchema = z.object({
  file: z
    .custom<File>()
    .refine(
      (file) => file !== undefined && file !== null,
      "Please upload a file"
    )
    .refine((file) => file instanceof File, "Please upload a file")
    .refine(
      (file) => !file || file.size <= MAX_FILE_SIZE,
      "File size must be less than 5MB"
    )
    .refine(
      (file) =>
        !file ||
        ACCEPTED_FILE_TYPES.includes(file.type) ||
        file.name.endsWith(".csv"),
      "Only CSV files are accepted"
    ),
});

export type ImportUnitsFormValues = z.infer<typeof importUnitsSchema>;
