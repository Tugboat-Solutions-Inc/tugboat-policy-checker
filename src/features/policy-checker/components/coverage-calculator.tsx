"use client";

import { useState, useEffect } from "react";
import { Calculator, RefreshCw } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface CoverageCalculatorProps {
  coverageA: string; // Formatted string like "$500,000"
  initialSqFt?: string | number;
  onSqFtChange?: (sqFt: string) => void;
}

export function CoverageCalculator({
  coverageA,
  initialSqFt,
  onSqFtChange,
}: CoverageCalculatorProps) {
  const [sqFt, setSqFt] = useState<string>("");
  const [mode, setMode] = useState<"input" | "result">("input");
  const [costPerSqFt, setCostPerSqFt] = useState<number | null>(null);
  const [status, setStatus] = useState<"green" | "amber" | "red" | null>(null);

  useEffect(() => {
    if (initialSqFt) {
      const val = initialSqFt.toString();
      setSqFt(val);
      runCalculation(val);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialSqFt]);

  const runCalculation = (sqFtValueStr: string) => {
    const coverageValue = parseFloat(coverageA.replace(/[^0-9.]/g, ""));
    const sqFtValue = parseFloat(sqFtValueStr.replace(/,/g, ""));

    if (coverageValue && sqFtValue && sqFtValue > 0) {
      const perSqFt = coverageValue / sqFtValue;
      setCostPerSqFt(perSqFt);

      if (perSqFt >= 225) {
        setStatus("green");
      } else if (perSqFt >= 180) {
        setStatus("amber");
      } else {
        setStatus("red");
      }
      setMode("result");

      if (onSqFtChange) {
        onSqFtChange(sqFtValueStr);
      }
    }
  };

  const handleCalculate = () => {
    runCalculation(sqFt);
  };

  const handleReset = () => {
    setMode("input");
    setCostPerSqFt(null);
    setStatus(null);
  };

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(val);
  };

  const getStatusContent = () => {
    switch (status) {
      case "green":
        return {
          bgClass:
            "bg-emerald-50 border-emerald-200 dark:bg-emerald-950/20 dark:border-emerald-900/30",
          textClass: "text-emerald-800 dark:text-emerald-300",
          titleClass: "text-emerald-700 dark:text-emerald-400",
          badgeClass:
            "bg-emerald-100 text-emerald-800 border-emerald-200 dark:bg-emerald-900/40 dark:text-emerald-300 dark:border-emerald-800",
          badgeText: "Likely Adequate",
          explanation: "Likely adequate — still confirm locally.",
        };
      case "amber":
        return {
          bgClass:
            "bg-amber-50 border-amber-200 dark:bg-amber-950/20 dark:border-amber-900/30",
          textClass: "text-amber-800 dark:text-amber-300",
          titleClass: "text-amber-700 dark:text-amber-400",
          badgeClass:
            "bg-amber-100 text-amber-800 border-amber-200 dark:bg-amber-900/40 dark:text-amber-300 dark:border-amber-800",
          badgeText: "Verify coverage",
          explanation: "Borderline — verify local rebuild costs.",
        };
      case "red":
        return {
          bgClass:
            "bg-red-50 border-red-200 dark:bg-red-950/20 dark:border-red-900/30",
          textClass: "text-red-800 dark:text-red-300",
          titleClass: "text-red-700 dark:text-red-400",
          badgeClass:
            "bg-red-100 text-red-800 border-red-200 dark:bg-red-900/40 dark:text-red-300 dark:border-red-800",
          badgeText: "Flag for review",
          explanation: "Flag for review — coverage looks low. Verify locally.",
        };
      default:
        return null;
    }
  };

  const statusContent = getStatusContent();

  return (
    <Card className="mt-8 shadow-sm">
      <CardHeader>
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10">
            <Calculator className="h-5 w-5 text-primary" />
          </div>
          <CardTitle>Coverage A Rebuild Checker</CardTitle>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid gap-6 md:grid-cols-2 items-start">
          {mode === "input" && (
            <div className="space-y-4 col-span-2 md:col-span-1">
              <div className="space-y-2">
                <Label htmlFor="sqFt">Finished square footage</Label>
                <div className="flex gap-2">
                  <Input
                    id="sqFt"
                    type="number"
                    placeholder="e.g. 2500"
                    value={sqFt}
                    onChange={(e) => setSqFt(e.target.value)}
                    className="max-w-xs"
                  />
                  <Button onClick={handleCalculate} disabled={!sqFt}>
                    Calculate
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground">
                  Enter the total finished living area to check per-sq-ft
                  coverage.
                </p>
              </div>
            </div>
          )}

          {mode === "result" && statusContent && costPerSqFt !== null && (
            <div
              className={cn(
                "col-span-2 rounded-xl p-5 border",
                statusContent.bgClass
              )}
            >
              <div className="flex items-start justify-between mb-2">
                <div>
                  <h3
                    className={cn(
                      "text-2xl font-black",
                      statusContent.titleClass
                    )}
                  >
                    {formatCurrency(costPerSqFt)}/sq ft
                  </h3>
                </div>
                <div className="flex flex-col items-end gap-2">
                  <span
                    className={cn(
                      "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium border",
                      statusContent.badgeClass
                    )}
                  >
                    {statusContent.badgeText}
                  </span>
                  <button
                    type="button"
                    onClick={handleReset}
                    className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors"
                  >
                    <RefreshCw className="h-3 w-3" />
                    Recalculate
                  </button>
                </div>
              </div>

              <p className={cn("text-sm font-medium", statusContent.textClass)}>
                {statusContent.explanation}
              </p>

              <div className="mt-4 text-sm text-muted-foreground border-t border-border pt-3">
                <p>
                  Calculated based on {coverageA} Coverage A and{" "}
                  {parseFloat(sqFt.replace(/,/g, "")).toLocaleString()} sq ft.
                </p>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
