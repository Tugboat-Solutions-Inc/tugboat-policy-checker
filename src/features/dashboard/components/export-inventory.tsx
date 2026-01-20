import { Dispatch, SetStateAction } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Collection } from "@/features/collection-details/types/collection.types";
import { env } from "@/lib/env";

export type ExportFormat = "pdf" | "csv" | "xls";

type ExportInventoryProps = {
  selectedCollections: Collection[];
  setSelectedCollections: Dispatch<SetStateAction<Collection[]>>;
  exportFormat: ExportFormat | null;
  setExportFormat: Dispatch<SetStateAction<ExportFormat | null>>;
  collections: Collection[];
};

export function ExportInventory({
  selectedCollections,
  setSelectedCollections,
  exportFormat,
  setExportFormat,
  collections,
}: ExportInventoryProps) {
  const isCollectionSelected = (id: string) =>
    selectedCollections.some((c) => c.id === id);

  const allSelected =
    collections.length > 0 &&
    selectedCollections.length === collections.length &&
    collections.every((c) => isCollectionSelected(c.id));

  const handleToggleCollection = (collection: Collection) => {
    setSelectedCollections((prev) =>
      prev.some((c) => c.id === collection.id)
        ? prev.filter((c) => c.id !== collection.id)
        : [...prev, collection]
    );
  };

  const handleToggleAll = () => {
    setSelectedCollections((prev) => {
      const isAllSelected =
        collections.length > 0 &&
        prev.length === collections.length &&
        collections.every((c) => prev.some((p) => p.id === c.id));

      return isAllSelected ? [] : [...collections];
    });
  };

  return (
    <div>
      <div className="mb-2 flex flex-row items-center justify-between">
        <p className="text-sm font-medium">Choose Collections</p>
        <Button
          variant="outline"
          size="sm"
          onClick={handleToggleAll}
          disabled={collections.length === 0}
        >
          {allSelected ? "Deselect All" : "Select All"}
        </Button>
      </div>

      {/* Collection list */}
      <div className="thin-scrollbar mb-6 flex max-h-[360px] flex-col gap-2 overflow-y-auto">
        {collections.map((collection) => (
          <div
            key={collection.id}
            onClick={() => handleToggleCollection(collection)}
            className="flex h-[72px] cursor-pointer items-center gap-4 rounded-[12px] border border-gray-100 bg-accent py-2 pl-2 pr-6 transition-colors hover:bg-accent/80"
          >
            <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-md">
              <Image
                src={env.NEXT_PUBLIC_STORAGE_URL + collection.cover_image_url}
                alt={collection.name}
                fill
                className="object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-b from-black/40 to-transparent" />
            </div>

            <div className="flex flex-col gap-1 min-w-0 flex-1 overflow-hidden">
              <p className="text-sm font-medium truncate">{collection.name}</p>
              <p className="text-sm text-muted-foreground truncate">
                {collection.description}
              </p>
            </div>

            <Checkbox
              checked={isCollectionSelected(collection.id)}
              className="rounded-[2px] border-foreground shrink-0"
            />
          </div>
        ))}
      </div>

      <p className="mb-4 text-sm font-medium">Export as</p>

      <RadioGroup
        value={exportFormat ?? undefined}
        onValueChange={(value) => setExportFormat(value as ExportFormat)}
      >
        <div className="flex cursor-pointer items-center gap-3">
          <RadioGroupItem
            value="pdf"
            id="r1"
            className="border-foreground [&>span>svg]:size-2.5 [&>span>svg]:fill-foreground"
          />
          <Label htmlFor="r1" className="cursor-pointer">Export PDF</Label>
        </div>

        <div className="flex cursor-pointer items-center gap-3">
          <RadioGroupItem
            value="csv"
            id="r2"
            className="border-foreground [&>span>svg]:size-2.5 [&>span>svg]:fill-foreground"
          />
          <Label htmlFor="r2" className="cursor-pointer">Export CSV</Label>
        </div>

        <div className="flex cursor-pointer items-center gap-3">
          <RadioGroupItem
            value="xls"
            id="r3"
            className="border-foreground [&>span>svg]:size-2.5 [&>span>svg]:fill-foreground"
          />
          <Label htmlFor="r3" className="cursor-pointer">Export XLS</Label>
        </div>
      </RadioGroup>
    </div>
  );
}
