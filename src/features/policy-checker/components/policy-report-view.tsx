"use client";

import { useState } from "react";
import {
  AlertTriangle,
  Building2,
  ChevronDown,
  ChevronUp,
  CircleAlert,
  CircleCheck,
  Droplets,
  Home as HomeIcon,
  Info,
  MapPin,
  Scale,
  Shield,
  Sparkles,
  Timer,
  TrendingUp,
  Wrench,
  Gem,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { CoverageCalculator } from "./coverage-calculator";
import type { PolicyReport, PolicyReportGrade } from "../types/policy-checker.types";

// --- Icon mapping ---
const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  HomeIcon,
  Gem,
  Scale,
  Shield,
  Building2,
  Timer,
  Droplets,
  Wrench,
};

// --- Grade color helper (works with grade letter from our PolicyReportGrade) ---
function getGradeColor(grade: string) {
  switch (grade) {
    case "A":
    case "B":
      return {
        text: "text-emerald-500",
        bg: "bg-emerald-100",
        label: "text-emerald-700",
      };
    case "C":
      return {
        text: "text-amber-500",
        bg: "bg-amber-100",
        label: "text-amber-700",
      };
    case "D":
      return {
        text: "text-orange-500",
        bg: "bg-orange-100",
        label: "text-orange-700",
      };
    case "F":
      return {
        text: "text-red-500",
        bg: "bg-red-100",
        label: "text-red-700",
      };
    default:
      return {
        text: "text-muted-foreground",
        bg: "bg-muted",
        label: "text-muted-foreground",
      };
  }
}

// --- Report Card Component ---
function ReportCard({
  icon,
  text,
  detailed,
  variant,
}: {
  icon: string;
  text: string;
  detailed?: string;
  variant: "strength" | "concern";
}) {
  const [isExpanded, setIsExpanded] = useState(false);

  const toggleExpand = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsExpanded(!isExpanded);
  };

  const IconComponent =
    iconMap[icon] || (variant === "strength" ? Shield : AlertTriangle);

  const iconBgClass =
    variant === "strength"
      ? "bg-emerald-100 dark:bg-emerald-950"
      : "bg-amber-100 dark:bg-amber-950";
  const iconColorClass =
    variant === "strength"
      ? "text-emerald-600 dark:text-emerald-400"
      : "text-amber-600 dark:text-amber-400";

  return (
    <div className="flex flex-col gap-3 rounded-xl bg-card p-4 ring-1 ring-border shadow-sm">
      <div className="flex items-start gap-3">
        <div
          className={cn(
            "flex h-8 w-8 shrink-0 items-center justify-center rounded-lg",
            iconBgClass
          )}
        >
          <IconComponent className={cn("h-4 w-4", iconColorClass)} />
        </div>
        <div className="flex-1">
          <p className="text-sm leading-relaxed text-muted-foreground">
            {text}
          </p>
          {detailed && (
            <button
              type="button"
              onClick={toggleExpand}
              className="mt-2 flex items-center gap-1 text-xs font-medium text-primary hover:underline"
            >
              {isExpanded ? "Show less" : "Read more"}
              {isExpanded ? (
                <ChevronUp className="h-3 w-3" />
              ) : (
                <ChevronDown className="h-3 w-3" />
              )}
            </button>
          )}
        </div>
      </div>
      {isExpanded && detailed && (
        <div className="mt-1 border-t border-border pt-3 text-sm text-muted-foreground animate-in fade-in slide-in-from-top-1 duration-200">
          {detailed}
        </div>
      )}
    </div>
  );
}

// --- Grade Card ---
function GradeCard({
  title,
  gradeData,
  icon: Icon,
}: {
  title: string;
  gradeData: PolicyReportGrade;
  icon: React.ComponentType<{ className?: string }>;
}) {
  const colors = getGradeColor(gradeData.grade);

  return (
    <div className="group relative overflow-hidden rounded-2xl bg-card p-5 ring-1 ring-border shadow-sm">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            {title}
          </p>
          <div className="mt-2 flex items-baseline gap-2">
            <span className={`text-5xl font-black ${colors.text}`}>
              {gradeData.grade}
            </span>
            <span
              className={`rounded-full ${colors.bg} px-2 py-0.5 text-xs font-medium ${colors.label}`}
            >
              {gradeData.label}
            </span>
          </div>
          <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
            {gradeData.note}
          </p>
        </div>
        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-muted">
          <Icon className="h-6 w-6 text-muted-foreground" />
        </div>
      </div>
    </div>
  );
}

// --- Main Report View ---
interface PolicyReportViewProps {
  report: PolicyReport;
  propertyAddress?: string;
}

export function PolicyReportView({
  report,
  propertyAddress,
}: PolicyReportViewProps) {
  const [currentSqFt, setCurrentSqFt] = useState<string | number | undefined>(
    report.sqFt
  );

  const displayAddress =
    propertyAddress || report.propertyAddress || "Property Address";

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col gap-4">
        <div>
          <div className="flex flex-wrap items-center gap-3 mb-2">
            <h1 className="text-xl font-bold tracking-tight text-foreground sm:text-2xl">
              Property Policy Report
            </h1>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-2.5 py-1 text-xs font-medium text-primary ring-1 ring-primary/20">
              <Sparkles className="h-3 w-3" />
              AI-Powered
            </span>
          </div>

          {/* Property info */}
          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-muted-foreground">
            <span className="flex items-center gap-1.5">
              <MapPin className="h-3.5 w-3.5 text-muted-foreground" />
              {displayAddress}
            </span>
            {report.carrier && (
              <span className="flex items-center gap-1.5">
                <Building2 className="h-3.5 w-3.5 text-muted-foreground" />
                {report.carrier}
              </span>
            )}
          </div>

          {/* Summary badges */}
          <div className="mt-2 flex flex-wrap gap-2">
            {report.docType && (
              <span className="rounded-full bg-secondary px-2.5 py-1 text-xs font-medium text-secondary-foreground ring-1 ring-border">
                {report.docType
                  .replace(/_/g, " ")
                  .replace(/\b\w/g, (l) => l.toUpperCase())}
              </span>
            )}
            {report.policyPeriod && report.policyPeriod !== "N/A" && (
              <span className="rounded-full bg-secondary px-2.5 py-1 text-xs font-medium text-secondary-foreground ring-1 ring-border">
                Policy Period: {report.policyPeriod}
              </span>
            )}
            {report.policyType && (
              <span className="rounded-full bg-secondary px-2.5 py-1 text-xs font-medium text-secondary-foreground ring-1 ring-border">
                {report.policyType}
              </span>
            )}
            {report.summaryBadges?.map((badge, idx) => (
              <span
                key={idx}
                className="rounded-full bg-secondary px-2.5 py-1 text-xs font-medium text-secondary-foreground ring-1 ring-border"
              >
                {badge}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Grade Cards */}
      <div className="grid gap-4 sm:grid-cols-2">
        <GradeCard
          title="Policy Grade"
          gradeData={report.policyGrade}
          icon={Shield}
        />
        <GradeCard
          title="Carrier Grade"
          gradeData={report.carrierGrade}
          icon={TrendingUp}
        />
      </div>

      {/* Coverage Stats */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <div className="rounded-xl bg-card p-4 shadow-sm ring-1 ring-border">
          <p className="text-xs font-medium text-muted-foreground">Dwelling</p>
          <p className="mt-1 text-lg font-bold text-card-foreground">
            {report.dwelling}
          </p>
        </div>
        <div className="rounded-xl bg-card p-4 shadow-sm ring-1 ring-border">
          <p className="text-xs font-medium text-muted-foreground">
            Deductible
          </p>
          <p className="mt-1 text-lg font-bold text-card-foreground">
            {report.deductible}
          </p>
        </div>
        <div className="rounded-xl bg-card p-4 shadow-sm ring-1 ring-border">
          <p className="text-xs font-medium text-muted-foreground">
            Liability
          </p>
          <p className="mt-1 text-lg font-bold text-card-foreground">
            {report.liability}
          </p>
        </div>
        <div className="rounded-xl bg-card p-4 shadow-sm ring-1 ring-border">
          <p className="text-xs font-medium text-muted-foreground">
            Personal Property
          </p>
          <p className="mt-1 text-lg font-bold text-card-foreground">
            {report.personalProperty}
          </p>
        </div>
      </div>

      {/* Coverage Snapshot */}
      {report.coverageSnapshot && report.coverageSnapshot.length > 0 && (
        <div>
          <div className="mb-4 flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10">
              <Shield className="h-5 w-5 text-primary" />
            </div>
            <h2 className="text-lg font-bold text-foreground">
              Coverage Snapshot
            </h2>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            {report.coverageSnapshot.map((item, idx) => {
              const severityStyles = {
                good: "border-emerald-200 bg-emerald-50 dark:bg-emerald-950/20",
                warn: "border-amber-200 bg-amber-50 dark:bg-amber-950/20",
                red: "border-red-200 bg-red-50 dark:bg-red-950/20",
              };
              const headlineStyles = {
                good: "text-emerald-700 dark:text-emerald-400",
                warn: "text-amber-700 dark:text-amber-400",
                red: "text-red-700 dark:text-red-400",
              };

              return (
                <div
                  key={idx}
                  className={cn(
                    "rounded-xl border p-4",
                    severityStyles[item.severity]
                  )}
                >
                  <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    {item.title}
                  </p>
                  <p
                    className={cn(
                      "mt-1 text-sm font-bold",
                      headlineStyles[item.severity]
                    )}
                  >
                    {item.headline}
                  </p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {item.note}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Policy Strengths */}
      {report.strengths && report.strengths.length > 0 && (
        <div>
          <div className="mb-4 flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-100 dark:bg-emerald-950">
              <CircleCheck className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
            </div>
            <h2 className="text-lg font-bold text-foreground">
              Policy Strengths
            </h2>
          </div>
          <div className="grid gap-3 sm:grid-cols-2 items-start">
            {report.strengths.map((item, idx) => (
              <ReportCard
                key={idx}
                icon={item.icon}
                text={item.text}
                detailed={item.detailed}
                variant="strength"
              />
            ))}
          </div>
        </div>
      )}

      {/* Items to Verify */}
      {report.itemsToVerify && report.itemsToVerify.length > 0 && (
        <div>
          <div className="mb-4 flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-100 dark:bg-amber-950">
              <CircleAlert className="h-5 w-5 text-amber-600 dark:text-amber-400" />
            </div>
            <h2 className="text-lg font-bold text-foreground">
              Items to Verify
            </h2>
          </div>
          <div className="grid gap-3 sm:grid-cols-2 items-start">
            {report.itemsToVerify.map((item, idx) => (
              <ReportCard
                key={idx}
                icon={item.icon}
                text={item.text}
                detailed={item.detailed}
                variant="concern"
              />
            ))}
          </div>
        </div>
      )}

      {/* Rebuild Calculator */}
      {report.dwelling && (
        <CoverageCalculator
          coverageA={report.dwelling}
          initialSqFt={currentSqFt}
          onSqFtChange={setCurrentSqFt}
        />
      )}

      {/* Disclaimer */}
      <div className="flex items-start gap-3 rounded-xl bg-muted/50 p-4 ring-1 ring-border">
        <Info className="mt-0.5 h-5 w-5 shrink-0 text-muted-foreground" />
        <p className="text-xs leading-relaxed text-muted-foreground">
          <strong className="text-foreground">About this report:</strong> This
          analysis is based on the policy documents you provided. All values,
          limits, and dates are extracted from your uploaded documents. This
          analysis is not personalized advice—consult a licensed insurance
          professional for your specific needs.
        </p>
      </div>
    </div>
  );
}
