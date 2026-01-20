import Papa from "papaparse";

import type { AccessType } from "@/features/property-details/types/property-access.types";

export interface ParsedUnitRow {
  unitName: string;
  tenantEmail?: string;
  accessType?: AccessType;
}

export interface ParsedUnitsData {
  units: ParsedUnitRow[];
  errors: string[];
  warnings: string[];
}

interface CSVRow {
  "Unit name": string;
  "Tenant email address": string;
  "Tenant role": string;
}

const VALID_ACCESS_TYPES: AccessType[] = ["VIEWER", "EDITOR"];

/**
 * Parses a CSV file containing unit data according to the database schema.
 * Expected CSV format:
 * - Unit name (required)
 * - Tenant email address (optional)
 * - Tenant role (optional, one of: viewer, editor)
 */
export function parseUnitsCsv(file: File): Promise<ParsedUnitsData> {
  return new Promise((resolve) => {
    Papa.parse<CSVRow>(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        const units: ParsedUnitRow[] = [];
        const errors: string[] = [];
        const warnings: string[] = [];

        const expectedHeaders = [
          "Unit name",
          "Tenant email address",
          "Tenant role",
        ];
        const actualHeaders = results.meta.fields || [];

        const missingHeaders = expectedHeaders.filter(
          (header) => !actualHeaders.includes(header)
        );

        if (missingHeaders.length > 0) {
          errors.push(`Missing required columns: ${missingHeaders.join(", ")}`);
          resolve({ units: [], errors, warnings });
          return;
        }

        results.data.forEach((row, index) => {
          const rowNumber = index + 2;

          const unitName = row["Unit name"]?.trim();
          if (!unitName) {
            errors.push(`Row ${rowNumber}: Unit name is required`);
            return;
          }

          const tenantEmail = row["Tenant email address"]?.trim();

          if (tenantEmail && !isValidEmail(tenantEmail)) {
            errors.push(
              `Row ${rowNumber}: Invalid email format for "${tenantEmail}"`
            );
            return;
          }

          const accessTypeRaw = row["Tenant role"]?.trim().toUpperCase();
          let accessType: AccessType | undefined;

          if (accessTypeRaw) {
            if (VALID_ACCESS_TYPES.includes(accessTypeRaw as AccessType)) {
              accessType = accessTypeRaw as AccessType;
            } else {
              errors.push(
                `Row ${rowNumber}: Invalid Tenant role "${row["Tenant role"]?.trim()}". Must be one of: viewer, editor`
              );
              return;
            }
          }

          if (tenantEmail && !accessType) {
            warnings.push(
              `Row ${rowNumber}: Tenant email provided but Tenant role is missing`
            );
          }

          if (accessType && !tenantEmail) {
            warnings.push(
              `Row ${rowNumber}: Tenant role provided but Tenant email address is missing`
            );
          }

          units.push({
            unitName,
            tenantEmail: tenantEmail || undefined,
            accessType,
          });
        });

        // Check if any units were parsed
        if (units.length === 0 && errors.length === 0) {
          errors.push("No valid units found in the CSV file");
        }

        resolve({ units, errors, warnings });
      },
      error: (error) => {
        resolve({
          units: [],
          errors: [`Failed to parse CSV: ${error.message}`],
          warnings: [],
        });
      },
    });
  });
}

/**
 * Simple email validation
 */
function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}
