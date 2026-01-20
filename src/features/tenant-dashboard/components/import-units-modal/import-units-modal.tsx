"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { TugboatModal } from "@/components/common/tugboat-modal/tugboat-modal";
import { toast } from "@/components/common/toast/toast";
import {
  importUnitsSchema,
  type ImportUnitsFormValues,
} from "../../schemas/import-units.schema";
import { CSVUploadField } from "./csv-upload-field";
import { ImportModalFooter } from "./import-modal-footer";

interface ImportUnitsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit?: (file: File) => void | Promise<void>;
}

export function ImportUnitsModal({
  open,
  onOpenChange,
  onSubmit,
}: ImportUnitsModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<ImportUnitsFormValues>({
    resolver: zodResolver(importUnitsSchema) as any,
    mode: "onChange",
  });

  const file = form.watch("file");

  const handleFileSelected = (selectedFile: File) => {
    form.setValue("file", selectedFile, { shouldValidate: true });
  };

  useEffect(() => {
    if (!open) {
      form.reset();
    }
  }, [open, form]);

  const handleSubmit = async (data: ImportUnitsFormValues) => {
    if (!data.file) {
      toast.error("No file selected", "Please select a CSV file.");
      return;
    }

    setIsSubmitting(true);

    try {
      await onSubmit?.(data.file);
      onOpenChange(false);
      setTimeout(() => {
        form.reset();
      }, 300);
    } catch (error) {
      console.error("Failed to import units:", error);
      toast.error("Failed to import units", "Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    onOpenChange(false);
    form.reset();
  };

  const handleDownloadSample = () => {
    const link = document.createElement("a");
    link.href = "/sample-units-import.csv";
    link.download = "sample-units-import.csv";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <TugboatModal
      open={open}
      onOpenChange={onOpenChange}
      title="Import Units by CSV"
      maxWidth="lg"
      footer={
        <ImportModalFooter
          isValid={form.formState.isValid}
          isSubmitting={isSubmitting}
          isParsing={false}
          hasErrors={false}
          onCancel={handleClose}
          onSubmit={form.handleSubmit(handleSubmit)}
          onDownloadSample={handleDownloadSample}
        />
      }
    >
      <div className="flex flex-col gap-6">
        <CSVUploadField
          selectedFile={file}
          onFileSelected={handleFileSelected}
          errorMessage={form.formState.errors.file?.message as string}
        />
      </div>
    </TugboatModal>
  );
}
