"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Upload, FileText, X, Loader2, Shield } from "lucide-react";
import { analyzePolicyAction } from "../api/policy-checker.actions";

/**
 * Public version of the upload form — no auth required.
 * Uses a placeholder org/user ID for testing.
 * The authenticated version (policy-upload-form.tsx) should be used inside the dashboard.
 */
export function PolicyUploadFormPublic() {
  const [file, setFile] = useState<File | null>(null);
  const [propertyAddress, setPropertyAddress] = useState("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [dragActive, setDragActive] = useState(false);
  const router = useRouter();

  const isFormValid = file !== null;

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile && droppedFile.type === "application/pdf") {
      setFile(droppedFile);
      setError(null);
    } else {
      setError("Please upload a PDF file");
    }
  }, []);

  const handleFileSelect = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const selectedFile = e.target.files?.[0];
      if (selectedFile && selectedFile.type === "application/pdf") {
        setFile(selectedFile);
        setError(null);
      } else if (selectedFile) {
        setError("Please upload a PDF file");
      }
    },
    []
  );

  const handleRemoveFile = useCallback(() => {
    setFile(null);
  }, []);

  const handleSubmit = async () => {
    if (!file) return;

    setIsAnalyzing(true);
    setError(null);

    try {
      // Upload to Vercel Blob via our API route
      const formData = new FormData();
      formData.append("file", file);

      const uploadResponse = await fetch("/api/policy-checker/upload", {
        method: "POST",
        body: formData,
      });

      if (!uploadResponse.ok) {
        throw new Error("Failed to upload file");
      }

      const { fileUrl } = await uploadResponse.json();

      // Call the analysis server action with placeholder IDs for testing
      const result = await analyzePolicyAction({
        fileUrl,
        originalFilename: file.name,
        propertyAddress: propertyAddress || undefined,
        organizationId: "00000000-0000-0000-0000-000000000000",
        createdBy: "00000000-0000-0000-0000-000000000000",
      });

      if (result.success && result.reportId) {
        router.push(`/policy-checker/${result.reportId}`);
      } else {
        setError(result.error || "Analysis failed");
        setIsAnalyzing(false);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
      setIsAnalyzing(false);
    }
  };

  if (isAnalyzing) {
    return (
      <Card className="shadow-sm">
        <CardContent className="flex flex-col items-center justify-center py-16 gap-4">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <div className="text-center">
            <p className="text-lg font-semibold">Analyzing your policy...</p>
            <p className="text-sm text-muted-foreground mt-1">
              This may take a minute. We&apos;re extracting data and generating
              your report.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="shadow-sm">
      <CardHeader>
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
            <Shield className="h-5 w-5 text-primary" />
          </div>
          <div>
            <CardTitle>Policy Checker</CardTitle>
            <CardDescription>
              Upload a policy document and receive AI-powered insights
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Property Address (optional) */}
        <div className="space-y-2">
          <Label htmlFor="propertyAddress">Property Address (optional)</Label>
          <Input
            id="propertyAddress"
            placeholder="123 Main Street, City, State ZIP"
            value={propertyAddress}
            onChange={(e) => setPropertyAddress(e.target.value)}
          />
          <p className="text-xs text-muted-foreground">
            We&apos;ll extract this from the policy if not provided
          </p>
        </div>

        {/* File Upload */}
        <div className="space-y-2">
          <Label>Policy Document</Label>
          {file ? (
            <div className="flex items-center justify-between rounded-lg border border-border bg-muted/50 p-3">
              <div className="flex items-center gap-3">
                <FileText className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium">{file.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {(file.size / 1024 / 1024).toFixed(1)} MB
                  </p>
                </div>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={handleRemoveFile}
                className="h-8 w-8"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          ) : (
            <div
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
              className={`flex flex-col items-center justify-center rounded-lg border-2 border-dashed p-8 transition-colors cursor-pointer ${
                dragActive
                  ? "border-primary bg-primary/5"
                  : "border-border hover:border-primary/50"
              }`}
              onClick={() =>
                document.getElementById("file-upload-input-public")?.click()
              }
            >
              <Upload className="h-8 w-8 text-muted-foreground mb-3" />
              <p className="text-sm font-medium">
                Drop your policy PDF here or click to browse
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                PDF files only, max 15MB
              </p>
              <input
                id="file-upload-input-public"
                type="file"
                accept=".pdf,application/pdf"
                onChange={handleFileSelect}
                className="hidden"
              />
            </div>
          )}
        </div>

        {/* Error */}
        {error && (
          <div className="rounded-lg bg-destructive/10 p-3 text-sm text-destructive">
            {error}
          </div>
        )}

        {/* Submit */}
        <Button
          onClick={handleSubmit}
          disabled={!isFormValid}
          className="w-full"
          size="lg"
        >
          <Shield className="h-4 w-4 mr-2" />
          Analyze Policy
        </Button>
      </CardContent>
    </Card>
  );
}
