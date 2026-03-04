"use server";

import type {
  AnalyzeResponse,
  PolicyReportFull,
  PolicyReportSummary,
} from "../types/policy-checker.types";

function getPolicyServiceConfig() {
  const url = process.env.NEXT_PUBLIC_POLICY_SERVICE_URL;
  const secret = process.env.POLICY_SERVICE_SECRET;

  if (!url || !secret) {
    throw new Error("Policy service not configured");
  }

  return { url, secret };
}

async function policyServiceFetch<T>(
  path: string,
  options: { method?: string; body?: unknown } = {}
): Promise<T> {
  const { url, secret } = getPolicyServiceConfig();
  const { method = "GET", body } = options;

  const headers: Record<string, string> = {
    Authorization: `Bearer ${secret}`,
  };

  if (body !== undefined) {
    headers["Content-Type"] = "application/json";
  }

  const response = await fetch(`${url}${path}`, {
    method,
    headers,
    body: body !== undefined ? JSON.stringify(body) : undefined,
    cache: "no-store",
  });

  if (!response.ok) {
    const errorText = await response.text().catch(() => response.statusText);
    throw new Error(`Policy service error (${response.status}): ${errorText}`);
  }

  return response.json();
}

export async function analyzePolicyAction(input: {
  fileUrl: string;
  originalFilename: string;
  propertyAddress?: string;
  organizationId: string;
  createdBy: string;
  propertyId?: string;
}): Promise<AnalyzeResponse> {
  return policyServiceFetch<AnalyzeResponse>("/api/analyze", {
    method: "POST",
    body: input,
  });
}

export async function getReportAction(
  reportId: string
): Promise<PolicyReportFull> {
  return policyServiceFetch<PolicyReportFull>(`/api/reports/${reportId}`);
}

export async function listReportsAction(
  organizationId: string
): Promise<{ reports: PolicyReportSummary[] }> {
  return policyServiceFetch<{ reports: PolicyReportSummary[] }>(
    `/api/reports?organizationId=${organizationId}`
  );
}
