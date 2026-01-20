"use client";

import * as React from "react";
import { KpiCard } from "@/components/common/kpi-card/kpi-card";
import { KpiCardSkeleton } from "@/components/common/kpi-card/kpi-card-skeleton";
import EmptyState from "@/components/common/empty-state";
import { CollectionCard } from "@/components/common/collection-card/collection-card";
import { CollectionCardSkeleton } from "@/components/common/collection-card/collection-card-skeleton";
import { CollectionCardList } from "@/components/common/collection-card/collection-card-list";
import { CollectionListItem } from "@/components/common/collection-list-item/collection-list-item";
import { CollectionListItemSkeleton } from "@/components/common/collection-list-item/collection-list-item-skeleton";
import { TugboatModal } from "@/components/common/tugboat-modal/tugboat-modal";
import { TugboatModalFooter } from "@/components/common/tugboat-modal/tugboat-modal-footer";
import { TugboatMultiStepModal } from "@/components/common/tugboat-modal/tugboat-multi-step-modal";
import {
  UploadImage,
  type UploadedFile,
} from "@/components/common/upload-image/upload-image";
import { HomeIcon } from "@/components/icons";
import { Button } from "@/components/ui/button";
import { Plus, Package } from "lucide-react";

export default function PlaygroundClient() {
  const [isModalOpen, setIsModalOpen] = React.useState(false);
  const [isMultiStepModalOpen, setIsMultiStepModalOpen] = React.useState(false);
  const [uploadedImage, setUploadedImage] = React.useState<string | null>(null);
  const [uploadedFiles, setUploadedFiles] = React.useState<UploadedFile[]>([]);

  const handleFavoriteToggle = async (isFavorite: boolean) => {
    console.log("Favorite toggled to:", isFavorite);
  };

  const handleCollectionFavoriteToggle = async (
    id: string,
    isFavorite: boolean
  ) => {
    console.log(`Collection ${id} favorite toggled to:`, isFavorite);
  };

  const mockCollections = [
    {
      id: "1",
      image:
        "https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=400",
      title: "Jewelry",
      itemCount: 25,
      value: "$ 25k",
      isFavorite: true,
    },
    {
      id: "2",
      image: "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=400",
      title: "Living Room",
      itemCount: 52,
      value: "$ 15k",
      isFavorite: false,
    },
    {
      id: "3",
      image: "https://images.unsplash.com/photo-1556912167-f556f1f39fdf?w=400",
      title: "Kitchen",
      itemCount: 38,
      value: "$ 8k",
      isFavorite: false,
    },
    {
      id: "4",
      image:
        "https://images.unsplash.com/photo-1540518614846-7eded433c457?w=400",
      title: "Bedroom",
      itemCount: 42,
      value: "$ 12k",
      isFavorite: true,
    },
    {
      id: "5",
      image:
        "https://images.unsplash.com/photo-1493809842364-78817add7ffb?w=400",
      title: "Vintage Watches",
      itemCount: 18,
      value: "$ 45k",
      isFavorite: false,
    },
    {
      id: "6",
      image:
        "https://images.unsplash.com/photo-1524758631624-e2822e304c36?w=400",
      title: "Art Collection",
      itemCount: 64,
      value: "$ 95k",
      isFavorite: true,
    },
  ];

  const handleFilesSelected = (files: File[]) => {
    console.log("Files selected:", files);
    if (files.length > 0) {
      const previewUrl = URL.createObjectURL(files[0]);
      setUploadedImage(previewUrl);
    }
  };

  const handleRemoveImage = () => {
    if (uploadedImage) {
      URL.revokeObjectURL(uploadedImage);
      setUploadedImage(null);
    }
  };

  const handleMultipleFilesSelected = (files: File[]) => {
    const newFiles: UploadedFile[] = files.map((file) => ({
      id: Math.random().toString(36).substring(7),
      url: URL.createObjectURL(file),
      file,
      status: "success" as const,
    }));
    setUploadedFiles((prev) => [...prev, ...newFiles]);
  };

  const handleRemoveFile = (fileId: string) => {
    setUploadedFiles((prev) => {
      const file = prev.find((f) => f.id === fileId);
      if (file) {
        URL.revokeObjectURL(file.url);
      }
      return prev.filter((f) => f.id !== fileId);
    });
  };

  return (
    <>
      <div>
        <h2 className="mb-4 text-lg font-semibold">
          Collection Cards with Search & Filter Animation
        </h2>
        <CollectionCardList
          collections={mockCollections}
          onFavoriteToggle={handleCollectionFavoriteToggle}
          searchPlaceholder="Search your collections..."
        />
      </div>

      <div>
        <h2 className="mb-4 text-lg font-semibold">
          Collection Cards (Static Grid)
        </h2>
        <div className="flex flex-wrap gap-3">
          <CollectionCard
            image="https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=400"
            title="Jewelry"
            itemCount={25}
            value="$ 25k"
            isFavorite
            onFavoriteToggle={handleFavoriteToggle}
          />
          <CollectionCard
            image="https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=400"
            title="Living Room"
            itemCount={52}
            value="$ 15k"
            onFavoriteToggle={handleFavoriteToggle}
          />
          <CollectionCard
            image="https://images.unsplash.com/photo-1556912167-f556f1f39fdf?w=400"
            title="Kitchen"
            itemCount={38}
            value="$ 8k"
            onFavoriteToggle={handleFavoriteToggle}
          />
        </div>
      </div>

      <div>
        <h2 className="mb-4 text-lg font-semibold">
          Collection Card Skeletons
        </h2>
        <div className="flex flex-wrap gap-3">
          <CollectionCardSkeleton />
          <CollectionCardSkeleton />
          <CollectionCardSkeleton />
        </div>
      </div>

      <div>
        <h2 className="mb-4 text-lg font-semibold">
          Collection List Items (Horizontal)
        </h2>
        <div className="flex flex-col gap-4">
          <CollectionListItem
            image="https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=400"
            title="Living Room"
            photoCount={24}
            itemCount={85}
            notes="Living room furniture after redecorating"
            completionPercentage={64}
            status="PROCESSING"
            date="Jan, 24 2025"
          />
          <CollectionListItem
            image="https://images.unsplash.com/photo-1556912167-f556f1f39fdf?w=400"
            title="Kitchen"
            photoCount={24}
            itemCount={85}
            status="COMPLETED"
            date="Jan, 24 2025"
          />
        </div>
      </div>

      <div>
        <h2 className="mb-4 text-lg font-semibold">
          Collection List Item Skeletons
        </h2>
        <div className="flex flex-col gap-4">
          <CollectionListItemSkeleton />
          <CollectionListItemSkeleton />
        </div>
      </div>

      <div>
        <h2 className="mb-4 text-lg font-semibold">KPI Cards - Default</h2>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          <KpiCard
            variant="default"
            label="Total Items"
            value={150}
            description="Across 12 collections"
            icon={<Package className="h-4 w-4 text-teal-600" />}
          />
          <KpiCard
            variant="default"
            label="Monthly Revenue"
            value="$12,340"
            description="This month"
            icon={<Package className="h-4 w-4 text-teal-600" />}
          />
          <KpiCard
            variant="default"
            label="Open Tickets"
            value={8}
            description="Need attention"
            icon={<Package className="h-4 w-4 text-teal-600" />}
          />
        </div>
      </div>

      <div>
        <h2 className="mb-4 text-lg font-semibold">KPI Cards - Compact</h2>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          <KpiCard
            variant="compact"
            label="Active Tenants"
            value={24}
            icon={<HomeIcon isActive />}
          />
          <KpiCard
            variant="compact"
            label="Total Properties"
            value={10}
            icon={<HomeIcon isActive />}
          />
        </div>
      </div>

      <div>
        <h2 className="mb-4 text-lg font-semibold">KPI Skeletons - Default</h2>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          <KpiCardSkeleton variant="default" />
          <KpiCardSkeleton variant="default" />
          <KpiCardSkeleton variant="default" />
        </div>
      </div>

      <div>
        <h2 className="mb-4 text-lg font-semibold">KPI Skeletons - Compact</h2>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          <KpiCardSkeleton variant="compact" />
          <KpiCardSkeleton variant="compact" />
        </div>
      </div>

      <div>
        <h2 className="mb-4 text-lg font-semibold">Empty State</h2>
        <div className="max-w-xl">
          <EmptyState
            title="No properties yet"
            subtitle="Create your first property to get started."
          >
            <Button size="sm">
              <Plus className="mr-2 h-4 w-4 text-white" />
              Add New Property
            </Button>
          </EmptyState>
        </div>
      </div>

      <div>
        <h2 className="mb-4 text-lg font-semibold">
          Tugboat Modal (Single Step)
        </h2>
        <Button onClick={() => setIsModalOpen(true)}>
          Open Single Step Modal
        </Button>
        <TugboatModal
          open={isModalOpen}
          onOpenChange={setIsModalOpen}
          title="Create New Upload"
          description="Choose a collection to organize your uploads."
          maxWidth="lg"
          footer={
            <TugboatModalFooter
              onCancel={() => setIsModalOpen(false)}
              onNext={() => {
                console.log("Save clicked");
                setIsModalOpen(false);
              }}
              nextLabel="Save"
              showNextIcon={false}
            />
          }
        >
          <div className="flex flex-col gap-4">
            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium text-foreground">
                Choose a collection*
              </label>
              <div className="h-12 rounded-lg border border-input bg-background px-3 flex items-center">
                <p className="text-sm text-muted-foreground">
                  Select a collection...
                </p>
              </div>
            </div>
            <div className="flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium text-foreground">
                  Notes
                </label>
                <span className="text-sm text-muted-foreground-2">40/80</span>
              </div>
              <div className="h-12 rounded-md border border-input bg-background px-3 flex items-center">
                <p className="text-sm text-foreground">
                  Living room furniture after redecorating
                </p>
              </div>
            </div>
          </div>
        </TugboatModal>
      </div>

      <div>
        <h2 className="mb-4 text-lg font-semibold">Tugboat Multi-Step Modal</h2>
        <Button onClick={() => setIsMultiStepModalOpen(true)}>
          Open Multi-Step Modal
        </Button>
        <TugboatMultiStepModal
          open={isMultiStepModalOpen}
          onOpenChange={setIsMultiStepModalOpen}
          maxWidth="lg"
          steps={[
            {
              title: "Step 1: Choose Collection",
              description: "Select a collection to organize your uploads.",
              component: (
                <div className="flex flex-col gap-4">
                  <div className="flex flex-col gap-2">
                    <label className="text-sm font-medium text-foreground">
                      Choose a collection*
                    </label>
                    <div className="h-12 rounded-lg border border-input bg-background px-3 flex items-center">
                      <p className="text-sm text-muted-foreground">
                        Select a collection...
                      </p>
                    </div>
                  </div>
                </div>
              ),
              onNext: async () => {
                console.log("Step 1 validation");
                return true;
              },
            },
            {
              title: "Step 2: Add Details",
              description: "Provide additional information about your upload.",
              component: (
                <div className="flex flex-col gap-4">
                  <div className="flex flex-col gap-2">
                    <div className="flex items-center justify-between">
                      <label className="text-sm font-medium text-foreground">
                        Notes
                      </label>
                      <span className="text-sm text-muted-foreground-2">
                        40/80
                      </span>
                    </div>
                    <div className="h-12 rounded-md border border-input bg-background px-3 flex items-center">
                      <p className="text-sm text-foreground">
                        Living room furniture after redecorating
                      </p>
                    </div>
                  </div>
                  <div className="flex flex-col gap-2">
                    <label className="text-sm font-medium text-foreground">
                      Tags
                    </label>
                    <div className="h-12 rounded-lg border border-input bg-background px-3 flex items-center">
                      <p className="text-sm text-muted-foreground">
                        Add tags...
                      </p>
                    </div>
                  </div>
                </div>
              ),
            },
          ]}
          onComplete={async () => {
            console.log("Multi-step form completed!");
            setIsMultiStepModalOpen(false);
          }}
          onCancel={() => setIsMultiStepModalOpen(false)}
        />
      </div>

      <div>
        <h2 className="mb-4 text-lg font-semibold">
          Upload Image - Single with Preview
        </h2>
        <div className="h-64 w-64">
          <UploadImage
            variant="single"
            maxFiles={1}
            onFilesSelected={handleFilesSelected}
            imageUrl={uploadedImage}
            onRemove={handleRemoveImage}
          />
        </div>
      </div>

      <div>
        <h2 className="mb-4 text-lg font-semibold">
          Upload Image - Multiple (Grid)
        </h2>
        <UploadImage
          variant="multiple"
          maxFiles={100}
          onFilesSelected={handleMultipleFilesSelected}
          uploadedFiles={uploadedFiles}
          onRemoveFile={handleRemoveFile}
        />
      </div>
    </>
  );
}
