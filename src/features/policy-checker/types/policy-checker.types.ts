export interface PolicyReportGrade {
  grade: string;
  label: string;
  note: string;
  severity: "green" | "amber" | "red";
}

export interface ReportItem {
  icon: string;
  text: string;
  detailed?: string;
}

export interface CoverageSnapshotItem {
  title: string;
  severity: "good" | "warn" | "red";
  headline: string;
  note: string;
  detailed?: string;
}

export interface PolicyReport {
  propertyAddress: string;
  carrier: string;
  policyPeriod: string;
  policyType: string;
  docType?: string;
  summaryBadges: string[];
  policyGrade: PolicyReportGrade;
  carrierGrade: PolicyReportGrade;
  dwelling: string;
  deductible: string;
  liability: string;
  personalProperty: string;
  strengths: ReportItem[];
  itemsToVerify: ReportItem[];
  coverageSnapshot: CoverageSnapshotItem[];
  coverageALimit: number | null;
  sqFt?: number;
}

export interface PolicyReportSummary {
  id: string;
  status: "UPLOADING" | "PROCESSING" | "COMPLETED" | "FAILED";
  originalFilename: string;
  propertyAddress: string | null;
  carrierName: string | null;
  policyGrade: string | null;
  carrierGrade: string | null;
  createdAt: string;
}

export interface PolicyReportFull extends PolicyReportSummary {
  fileUrl: string;
  reportData: PolicyReport | null;
  errorMessage: string | null;
  updatedAt: string;
}

export interface AnalyzeResponse {
  success: boolean;
  reportId: string;
  status: string;
  report?: PolicyReport;
  error?: string;
}
