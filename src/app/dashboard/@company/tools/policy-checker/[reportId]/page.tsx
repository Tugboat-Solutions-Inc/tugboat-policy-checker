import { getReportAction } from "@/features/policy-checker/api/policy-checker.actions";
import { PolicyReportView } from "@/features/policy-checker/components/policy-report-view";
import { notFound } from "next/navigation";

interface Props {
  params: Promise<{ reportId: string }>;
}

export default async function PolicyReportPage({ params }: Props) {
  const { reportId } = await params;

  try {
    const report = await getReportAction(reportId);

    if (!report || !report.reportData) {
      // If still processing, show loading state
      if (report?.status === "PROCESSING" || report?.status === "UPLOADING") {
        return (
          <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6">
            <div className="flex flex-col items-center justify-center py-16 gap-4">
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
              <p className="text-lg font-semibold">
                Processing your policy...
              </p>
              <p className="text-sm text-muted-foreground">
                This page will update when the analysis is complete.
              </p>
            </div>
          </div>
        );
      }

      if (report?.status === "FAILED") {
        return (
          <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6">
            <div className="rounded-lg bg-destructive/10 p-6 text-center">
              <p className="text-lg font-semibold text-destructive">
                Analysis Failed
              </p>
              <p className="text-sm text-muted-foreground mt-2">
                {report.errorMessage || "An unknown error occurred"}
              </p>
            </div>
          </div>
        );
      }

      notFound();
    }

    return (
      <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6">
        <PolicyReportView
          report={report.reportData}
          propertyAddress={
            report.propertyAddress || report.reportData.propertyAddress
          }
        />
      </div>
    );
  } catch {
    notFound();
  }
}
