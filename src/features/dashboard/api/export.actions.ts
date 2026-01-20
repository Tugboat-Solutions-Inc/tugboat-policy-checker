"use server";

import { API_ENDPOINTS } from "@/config/api";
import { getAuthHeaders } from "@/lib/auth";
import type { ExportFormat } from "../components/export-inventory";

type ExportResult =
  | { success: true; data: Blob; filename: string }
  | { success: false; message: string };

const FORMAT_EXTENSIONS: Record<ExportFormat, string> = {
  csv: "csv",
  pdf: "pdf",
  xls: "xlsx",
};

const FORMAT_MIME_TYPES: Record<ExportFormat, string> = {
  csv: "text/csv",
  pdf: "application/pdf",
  xls: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
};

export async function exportCollections(
  propertyId: string,
  unitId: string,
  collectionIds: string[],
  format: ExportFormat
): Promise<ExportResult> {
  const authHeaders = await getAuthHeaders();

  if (!authHeaders) {
    return { success: false, message: "Not authenticated" };
  }

  const endpointMap: Record<ExportFormat, string> = {
    csv: API_ENDPOINTS.PROPERTIES.EXPORT_CSV(propertyId, unitId),
    pdf: API_ENDPOINTS.PROPERTIES.EXPORT_PDF(propertyId, unitId),
    xls: API_ENDPOINTS.PROPERTIES.EXPORT_XLSX(propertyId, unitId),
  };

  const url = endpointMap[format];

  try {
    const response = await fetch(url, {
      method: "POST",
      headers: {
        ...authHeaders,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(collectionIds),
    });

    if (!response.ok) {
      const errorText = await response.text().catch(() => response.statusText);
      return { success: false, message: `Export failed: ${errorText}` };
    }

    const arrayBuffer = await response.arrayBuffer();
    const base64 = Buffer.from(arrayBuffer).toString("base64");
    const extension = FORMAT_EXTENSIONS[format];
    const mimeType = FORMAT_MIME_TYPES[format];
    const timestamp = new Date().toISOString().split("T")[0];
    const filename = `inventory-export-${timestamp}.${extension}`;

    return {
      success: true,
      data: base64 as unknown as Blob,
      filename,
    };
  } catch (error) {
    return {
      success: false,
      message: error instanceof Error ? error.message : "Export failed",
    };
  }
}

export type ExportCollectionsResult = Awaited<ReturnType<typeof exportCollections>>;
