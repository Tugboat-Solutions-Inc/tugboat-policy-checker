"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { FileInput } from "lucide-react";
import { TugboatModal } from "../tugboat-modal/tugboat-modal";
import { TugboatModalFooter } from "../tugboat-modal/tugboat-modal-footer";
import {
  ExportInventory,
  type ExportFormat,
} from "@/features/dashboard/components/export-inventory";
import { Collection } from "@/features/collection-details/types/collection.types";
import { exportCollections } from "@/features/dashboard/api/export.actions";
import { toast } from "@/components/common/toast/toast";

interface ExportButtonProps {
  collections: Collection[];
  propertyId: string;
  unitId: string;
  disabled?: boolean;
}

const FORMAT_MIME_TYPES: Record<ExportFormat, string> = {
  csv: "text/csv",
  pdf: "application/pdf",
  xls: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
};

export function ExportButton({
  collections,
  propertyId,
  unitId,
  disabled = false,
}: ExportButtonProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedCollections, setSelectedCollections] = useState<
    Collection[]
  >([]);
  const [exportFormat, setExportFormat] = useState<ExportFormat | null>(null);
  const [isExporting, setIsExporting] = useState(false);

  const isNextDisabled =
    selectedCollections.length === 0 || exportFormat === null || isExporting;

  const handleExport = async () => {
    if (!exportFormat || selectedCollections.length === 0) return;

    setIsExporting(true);

    try {
      const collectionIds = selectedCollections.map((c) => c.id);
      const result = await exportCollections(
        propertyId,
        unitId,
        collectionIds,
        exportFormat
      );

      if (result.success) {
        const base64Data = result.data as unknown as string;
        const mimeType = FORMAT_MIME_TYPES[exportFormat];
        const byteCharacters = atob(base64Data);
        const byteNumbers = new Array(byteCharacters.length);
        for (let i = 0; i < byteCharacters.length; i++) {
          byteNumbers[i] = byteCharacters.charCodeAt(i);
        }
        const byteArray = new Uint8Array(byteNumbers);
        const blob = new Blob([byteArray], { type: mimeType });

        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = result.filename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);

        toast.success(
          "Export successful",
          `Your inventory has been exported as ${exportFormat.toUpperCase()}.`
        );
        setIsModalOpen(false);
      } else {
        toast.error("Export failed", result.message);
      }
    } catch {
      toast.error("Export failed", "An unexpected error occurred.");
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <>
      <Button
        variant="default"
        size="sm"
        className="h-9 gap-2 rounded-[8px]"
        disabled={disabled || collections.length === 0}
        onClick={() => {
          setSelectedCollections([]);
          setExportFormat(null);
          setIsModalOpen(true);
        }}
      >
        <FileInput className="h-4 w-4" />
        Export
      </Button>

      <TugboatModal
        open={isModalOpen}
        onOpenChange={setIsModalOpen}
        title="Export Inventory List"
        description="Select collections to export your inventory list."
        maxWidth="lg"
        showCloseButton={true}
        footer={
          <TugboatModalFooter
            onNext={handleExport}
            nextLabel="Export Inventory"
            showNextIcon={false}
            isNextDisabled={isNextDisabled}
            isNextLoading={isExporting}
          />
        }
      >
        <ExportInventory
          selectedCollections={selectedCollections}
          setSelectedCollections={setSelectedCollections}
          exportFormat={exportFormat}
          setExportFormat={setExportFormat}
          collections={collections}
        />
      </TugboatModal>
    </>
  );
}
