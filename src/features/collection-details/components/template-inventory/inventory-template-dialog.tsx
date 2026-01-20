"use client";

import { ChevronLeft } from "lucide-react";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import TemplateTable from "./template-table";
import { useTemplateCache } from "../../hooks/use-template-cache";

interface InventoryTemplateDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onItemsAdded?: () => void;
  propertyId: string;
  unitId: string;
  collectionId: string;
  collectionName: string;
}

export function InventoryTemplateDialog({
  open,
  onOpenChange,
  onItemsAdded,
  propertyId,
  unitId,
  collectionId,
  collectionName,
}: InventoryTemplateDialogProps) {
  const { template, isLoading } = useTemplateCache();

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="max-w-none w-screen h-screen max-h-screen p-0 gap-0 rounded-none border-0"
        showCloseButton={false}
      >
        <div className="flex flex-col h-full">
          <header className="px-8 pt-8 pb-6 bg-background">
            <div className="flex items-center justify-between mb-6">
              <div className="flex flex-row gap-4 items-start">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onOpenChange(false)}
                  className=" h-6 w-6 rounded-[6px]"
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <div className="flex flex-col gap-3">
                  <DialogTitle className="text-2xl font-medium leading-none">
                    Template Inventory
                  </DialogTitle>
                  <p className="text-sm text-muted-foreground">
                    Browse our pre-filled inventory templates and quickly add
                    items to your personal list.
                  </p>
                </div>
              </div>
            </div>
            <Separator />
          </header>

          <div className="flex-1 overflow-hidden px-8 pb-8">
            {isLoading ? (
              <div className="flex flex-col gap-2 pt-4">
                {Array.from({ length: 8 }).map((_, i) => (
                  <Skeleton key={i} className="w-full h-[52px] rounded-lg" />
                ))}
              </div>
            ) : template ? (
              <TemplateTable
                propertyId={propertyId}
                unitId={unitId}
                collectionId={collectionId}
                collectionName={collectionName}
                onClose={() => onOpenChange(false)}
                onItemsAdded={onItemsAdded}
                template={template}
              />
            ) : null}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
