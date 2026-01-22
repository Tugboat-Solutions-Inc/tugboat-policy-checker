"use client";
import { useState, useMemo, useEffect, useRef, useTransition } from "react";
import { useRouter } from "next/navigation";
import { LayoutGroup } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Search } from "lucide-react";
import EmptyState from "@/components/common/empty-state";
import { CollectionCard } from "@/components/common/collection-card/collection-card";
import EmblaCarousel from "@/components/common/carousel/embla-carousel";
import { Collection } from "@/features/collection-details/types/collection.types";
import {
  UploadImage,
  type UploadedFile,
} from "@/components/common/upload-image/upload-image";
import { toast } from "@/components/common/toast/toast";
import { TugboatMultiStepModal } from "@/components/common/tugboat-modal/tugboat-multi-step-modal";
import { AddCollectionForm } from "./add-collection-form";
import { addCollectionSchema } from "../schemas/dashboard-schemas";
import { Field, FieldDescription, FieldLabel } from "@/components/ui/field";
import { ROUTES } from "@/config/routes";
import { useSelectedPropertyId } from "@/hooks/use-properties";
import { usePermissions } from "@/components/common/permissions-provider";
import { CAPABILITIES } from "@/constants/permissions.constants";
import { Property } from "@/features/auth/schemas/property.schemas";
import {
  createCollection,
  updateCollectionFavorite,
  startDeduplication,
} from "@/features/collection-details/api/collection.actions";
import { createUpload } from "@/features/collection-details/api/upload.actions";
import {
  convertImageToBase64,
  formatCurrencyAbbreviated,
  getFirstUnitId,
  hasUnits,
} from "@/lib/utils";
import { useSelectedCollectionStore } from "@/stores/selected-collection-store";
import { useCollectionFavoritesStore } from "@/stores/collection-favorites-store";

type DashboardCollectionsSectionProps = {
  collections: Collection[];
  property: Property;
};

export function DashboardCollectionsSection({
  collections,
  property,
}: DashboardCollectionsSectionProps) {
  const { can } = usePermissions();
  const router = useRouter();
  const [, startTransition] = useTransition();
  const propertyId = useSelectedPropertyId();
  const { setSelectedCollection } = useSelectedCollectionStore();
  const { favorites, setFavorite, initializeFavorites, clearPending } = useCollectionFavoritesStore();
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [debouncedFavorites, setDebouncedFavorites] = useState<Record<string, boolean>>({});
  const isInitialMount = useRef(true);
  const pendingReorderTimeout = useRef<NodeJS.Timeout | null>(null);
  const prefetchedCollections = useRef<Set<string>>(new Set());

  const [coverImage, setCoverImage] = useState<string | null>(null);
  const [coverImageFile, setCoverImageFile] = useState<File | null>(null);
  const [photos, setPhotos] = useState<File[]>([]);
  const MAX_PHOTOS = 100;
  const [uploadedPhotos, setUploadedPhotos] = useState<UploadedFile[]>([]);
  const [isMultiStepModalOpen, setIsMultiStepModalOpen] = useState(false);
  const [description, setDescription] = useState<string>("");
  const [collectionName, setCollectionName] = useState<string>("");
  const [notes, setNotes] = useState<string>("");

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(searchQuery);
    }, 150);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  useEffect(() => {
    initializeFavorites(collections);
    if (isInitialMount.current) {
      const initialFavorites: Record<string, boolean> = {};
      collections.forEach((c) => {
        initialFavorites[c.id] = c.favorite;
      });
      setDebouncedFavorites(initialFavorites);
      isInitialMount.current = false;
    }
  }, [collections, initializeFavorites]);

  useEffect(() => {
    if (Object.keys(debouncedFavorites).length === 0) return;
    
    if (pendingReorderTimeout.current) {
      clearTimeout(pendingReorderTimeout.current);
    }
    
    pendingReorderTimeout.current = setTimeout(() => {
      setDebouncedFavorites(favorites);
      pendingReorderTimeout.current = null;
    }, 600);
    
    return () => {
      if (pendingReorderTimeout.current) {
        clearTimeout(pendingReorderTimeout.current);
      }
    };
  }, [favorites]);

  const filteredCollections = useMemo(() => {
    const collectionsWithFavorites = collections.map((c) => ({
      ...c,
      favorite: favorites[c.id] ?? c.favorite,
      sortFavorite: debouncedFavorites[c.id] ?? c.favorite,
    }));

    const sorted = [...collectionsWithFavorites].sort((a, b) => {
      if (a.sortFavorite === b.sortFavorite) return 0;
      return a.sortFavorite ? -1 : 1;
    });

    if (!debouncedQuery.trim()) {
      return sorted;
    }

    const query = debouncedQuery.toLowerCase();
    return sorted.filter((collection) =>
      collection.name.toLowerCase().includes(query)
    );
  }, [collections, debouncedQuery, favorites, debouncedFavorites]);

  const handleCollectionFavoriteToggle = async (
    id: string,
    isFavorite: boolean
  ) => {
    const unitId = getFirstUnitId(property);
    if (!unitId) {
      toast.error("No unit found for this property");
      return;
    }

    setFavorite(id, isFavorite);

    const result = await updateCollectionFavorite(
      property.id,
      unitId,
      id,
      isFavorite
    );

    if (result.success) {
      setTimeout(() => {
        clearPending(id);
      }, 700);
    } else {
      setFavorite(id, !isFavorite);
      clearPending(id);
      toast.error(`Failed to update favorite`);
    }
  };

  const handleMultipleImagesSelected = (files: File[]) => {
    const newFiles: UploadedFile[] = files.map((file) => ({
      id: Math.random().toString(36).substring(7),
      url: URL.createObjectURL(file),
      file,
      status: "success" as const,
    }));
    setUploadedPhotos((prev) => [...prev, ...newFiles]);
    setPhotos((prev) => [...prev, ...files]);
  };

  const handleRemoveImage = (fileId: string) => {
    const fileToRemove = uploadedPhotos.find((f) => f.id === fileId);
    if (fileToRemove) {
      setUploadedPhotos((prev) => prev.filter((f) => f.id !== fileId));
      setPhotos((prev) => prev.filter((f) => f !== fileToRemove.file));
      URL.revokeObjectURL(fileToRemove.url);
    }
  };

  const handleRemoveCoverImage = () => {
    if (coverImage) {
      URL.revokeObjectURL(coverImage);
      setCoverImage(null);
    }
    setCoverImageFile(null);
  };

  const handleCoverImageSelected = (files: File[]) => {
    if (files.length > 0) {
      const previewUrl = URL.createObjectURL(files[0]);
      setCoverImage(previewUrl);
      setCoverImageFile(files[0]);
    }
  };

  const handleCreateCollection = async () => {
    try {
      const unitId = getFirstUnitId(property);
      if (!unitId) {
        toast.error("No unit found for this property");
        return;
      }

      const cover_image_b64 = await convertImageToBase64(coverImageFile);

      const loadingToast = toast.loading(
        "Creating collection",
        `Creating "${collectionName}"${photos.length > 0 ? ` and uploading ${photos.length} ${photos.length === 1 ? "photo" : "photos"}...` : "..."}`
      );

      const result = await createCollection(
        property.id,
        unitId,
        {
          name: collectionName,
          description: description || "",
          cover_image_b64: cover_image_b64 || undefined,
        }
      );

      if (!result.success) {
        toast.dismiss(loadingToast);
        toast.error(`Failed to create collection "${collectionName}"`, result.message || "Please try again");
        return;
      }

      const collectionId = result.data.id;

      if (photos.length > 0) {
        const photosBase64 = await Promise.all(
          photos.map(async (photo) => {
            const base64 = await convertImageToBase64(photo);
            if (!base64) {
              throw new Error(
                `Failed to convert photo to base64: ${photo.name}`
              );
            }
            return base64;
          })
        );

        const uploadResult = await createUpload(
          collectionId,
          unitId,
          property.id,
          {
            notes: notes.trim() || " ",
            photos_b64: photosBase64,
          }
        );

        if (!uploadResult.success) {
          toast.dismiss(loadingToast);
          toast.error(
            `Collection "${collectionName}" created but failed to upload photos`,
            uploadResult.message || "Please try uploading photos again"
          );
        } else {
          startDeduplication(property.id, unitId, collectionId);
        }
      }

      toast.dismiss(loadingToast);
      setSelectedCollection(result.data);
      if (photos.length > 0) {
        toast.success(`Collection "${collectionName}" created!`, "We're detecting items from your photos. This may take a moment.");
      } else {
        toast.success(`Collection "${collectionName}" created!`);
      }
      setIsMultiStepModalOpen(false);
      router.push(
        ROUTES.DASHBOARD.COLLECTION(property.id, collectionId, unitId)
      );
    } catch (error) {
      toast.error(
        `Failed to create collection: ${error instanceof Error ? error.message : "Unknown error"}`
      );
    }
  };

  useEffect(() => {
    if (!isMultiStepModalOpen) {
      setCollectionName("");
      setDescription("");
      setNotes("");
      setCoverImage(null);
      setCoverImageFile(null);
      setPhotos([]);
      setUploadedPhotos([]);
    }
  }, [isMultiStepModalOpen]);

  const hasNoCollections = collections.length === 0;

  return (
    <div className={hasNoCollections ? "flex flex-col flex-1 py-5" : "py-5"}>
      <div className="px-6 mb-6 flex flex-row justify-between items-center">
        <div className="flex flex-row items-center gap-2">
          <h2 className="text-lg font-semibold">Collections</h2>
          {!hasNoCollections && (
            <p className="text-muted-foreground-2 text-sm">{`(${collections.length})`}</p>
          )}
        </div>
        <div className="flex flex-row gap-3">
          {!hasNoCollections && (
            <div className="relative">
              <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Search your collections..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
          )}
          {can(CAPABILITIES.CREATE_COLLECTIONS) && (
            <Button
              variant="default"
              size="sm"
              onClick={() => setIsMultiStepModalOpen(true)}
              className="gap-2 h-9 rounded-[8px]"
            >
              <Plus className="h-4 w-4" />
              Add Collection
            </Button>
          )}
          <TugboatMultiStepModal
            open={isMultiStepModalOpen}
            onOpenChange={setIsMultiStepModalOpen}
            maxWidth="lg"
            showCloseButton={true}
            steps={[
              {
                title: "Add a New Collection",
                description:
                  "Add a name, cover and photos. We'll generate a cover if you skip it.",
                component: (
                  <AddCollectionForm
                    onFileSelected={handleCoverImageSelected}
                    onRemove={handleRemoveCoverImage}
                    uploadedImage={coverImage}
                    description={description}
                    onDescriptionChange={setDescription}
                    collectionName={collectionName}
                    onCollectionNameChange={setCollectionName}
                  />
                ),
                isNextDisabled: !collectionName.trim(),

                onNext: async () => {
                  const validation = addCollectionSchema.safeParse({
                    name: collectionName,
                    description: description,
                    cover_image: coverImage,
                  });

                  if (!validation.success) {
                    console.error(
                      "Validation errors:",
                      validation.error.issues
                    );
                    return false;
                  }
                  return true;
                },
              },
              {
                title: `Upload Photos to ${collectionName}`,
                description:
                  "Upload photos of your items to add them to a collection.",
                component: (
                  <div>
                    <Field className="gap-2">
                      <div className="flex flex-row justify-between">
                        <FieldLabel htmlFor="notes" className="gap-1">
                          Notes
                        </FieldLabel>
                        <FieldDescription>
                          {notes?.length || "0"}/80
                        </FieldDescription>
                      </div>
                      <Input
                        id="notes"
                        value={notes}
                        placeholder="Enter notes"
                        className="w-full h-12 shadow-none mb-6"
                        onChange={(e) => setNotes(e.target.value)}
                        maxLength={80}
                      />
                    </Field>
                    <UploadImage
                      variant="multiple"
                      maxFiles={MAX_PHOTOS}
                      className=""
                      onFilesSelected={handleMultipleImagesSelected}
                      uploadedFiles={uploadedPhotos}
                      onRemoveFile={handleRemoveImage}
                    />
                  </div>
                ),
                maxFiles: MAX_PHOTOS,
                currentFiles: uploadedPhotos.length,
                nextText: "Create Collection",
                showBackIcon: false,
              },
            ]}
            onComplete={handleCreateCollection}
            onCancel={() => setIsMultiStepModalOpen(false)}
          />
        </div>
      </div>
      {hasNoCollections ? (
        <div className="flex-1 flex items-center justify-center bg-[#FCFCFC] rounded-[12px] mx-6 mb-6">
          <EmptyState
            title="No collections yet"
            subtitle="Add a collection to begin building your inventory."
            className="bg-transparent"
          />
        </div>
      ) : (
        <div className="px-6">
          {filteredCollections.length === 0 ? (
            <EmptyState
              title="No collections found"
              subtitle="Try adjusting your search."
              className="bg-background"
            />
          ) : (
            <LayoutGroup>
              <EmblaCarousel
                slides={filteredCollections.map((collection) => (
                  <CollectionCard
                    key={collection.id}
                    layoutId={`collection-${collection.id}`}
                    image={collection.cover_image_url || ""}
                    title={collection.name}
                    itemCount={collection.total_items}
                    duplicatesDetected={collection.duplicates_detected}
                    value={formatCurrencyAbbreviated(collection.total_value)}
                    isFavorite={collection.favorite}
                    onFavoriteToggle={(isFavorite) =>
                      handleCollectionFavoriteToggle(collection.id, isFavorite)
                    }
                    onClick={() => {
                      const unitId = getFirstUnitId(property);
                      if (propertyId && unitId) {
                        setSelectedCollection(collection);
                        startTransition(() => {
                          router.push(
                            ROUTES.DASHBOARD.COLLECTION(
                              propertyId,
                              collection.id,
                              unitId
                            )
                          );
                        });
                      }
                    }}
                    onMouseEnter={() => {
                      const unitId = getFirstUnitId(property);
                      if (propertyId && unitId) {
                        const collectionKey = `${propertyId}-${collection.id}-${unitId}`;
                        if (!prefetchedCollections.current.has(collectionKey)) {
                          const href = ROUTES.DASHBOARD.COLLECTION(
                            propertyId,
                            collection.id,
                            unitId
                          );

                          if (typeof window !== "undefined" && "requestIdleCallback" in window) {
                            window.requestIdleCallback(() => {
                              router.prefetch(href);
                            });
                          } else {
                            setTimeout(() => {
                              router.prefetch(href);
                            }, 0);
                          }

                          prefetchedCollections.current.add(collectionKey);
                        }
                      }
                    }}
                  />
                ))}
                options={{ align: "start" }}
              />
            </LayoutGroup>
          )}
        </div>
      )}
    </div>
  );
}
