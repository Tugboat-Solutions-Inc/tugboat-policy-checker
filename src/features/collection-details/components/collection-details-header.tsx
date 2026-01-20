"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { toast } from "@/components/common/toast/toast";
import {
  ChevronLeft,
  Star,
  MoreHorizontal,
  TvMinimalPlay,
  Pencil,
  Trash,
  Image,
} from "lucide-react";
import { motion, type Variants } from "framer-motion";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";

const starVariants: Variants = {
  favorited: {
    scale: [1, 1.2, 1],
    rotate: [0, -15, 0],
    transition: {
      duration: 0.5,
      ease: [0.34, 1.56, 0.64, 1],
    },
  },
  unfavorited: {
    scale: [1, 0.8, 1],
    rotate: [0, 15, 0],
    transition: {
      duration: 0.3,
      ease: "easeOut",
    },
  },
};
import { usePermissions } from "@/components/common/permissions-provider";
import { CAPABILITIES } from "@/constants/permissions.constants";
import { ConfirmationDialog } from "@/components/common/confirmation-dialog";
import { env } from "@/lib/env";
import { WalkthroughVideosSheet } from "./walkthrough-videos-sheet";
import { EditCollectionDialog } from "./edit-collection-dialog";
import {
  deleteCollection,
  updateCollection,
  updateCollectionFavorite,
} from "../api/collection.actions";
import { formatCurrency } from "@/utils/format";
import { ROUTES } from "@/config/routes";
import { Collection, CreateCollectionData } from "../types/collection.types";
import { useCollectionFavoritesStore } from "@/stores/collection-favorites-store";

interface CollectionDetailsHeaderProps {
  propertyId: string;
  unitId: string;
  collectionId: string;
  collection: Collection;
}

interface StatCardProps {
  label: string;
  value: string | number;
  showBorder?: boolean;
}

function StatCard({ label, value, showBorder = true }: StatCardProps) {
  return (
    <div
      className={cn(
        "flex flex-col gap-2 items-start justify-center w-full sm:w-[120px] min-w-[100px]",
        showBorder && "sm:border-r border-white/20"
      )}
    >
      <span className="text-sm text-gray-100">{label}</span>
      <span className="text-2xl font-semibold text-white">{value}</span>
    </div>
  );
}

export function CollectionDetailsHeader({
  propertyId,
  unitId,
  collectionId,
  collection: initialCollection,
}: CollectionDetailsHeaderProps) {
  const router = useRouter();
  const { can } = usePermissions();
  const { favorites, setFavorite, clearPending, initializeFavorites } = useCollectionFavoritesStore();
  const [collection, setCollection] = useState(initialCollection);
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [hasImageError, setHasImageError] = useState(false);
  const [isFavoritePending, setIsFavoritePending] = useState(false);
  const isFirstRender = useRef(true);
  
  const optimisticFavorite = favorites[collectionId] ?? initialCollection.favorite;

  useEffect(() => {
    setCollection(initialCollection);
    initializeFavorites([{ id: collectionId, favorite: initialCollection.favorite }]);
  }, [initialCollection, collectionId, initializeFavorites]);

  useEffect(() => {
    setHasImageError(false);
  }, [collection.cover_image_url]);

  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      if (!(collectionId in favorites)) {
        setFavorite(collectionId, initialCollection.favorite);
      }
    }
  }, [collectionId, initialCollection.favorite, favorites, setFavorite]);

  const showPlaceholder = !collection?.cover_image_url || hasImageError;

  const handleToggleFavorite = async () => {
    if (isFavoritePending) return;

    const newValue = !optimisticFavorite;
    setFavorite(collectionId, newValue);
    setIsFavoritePending(true);

    const result = await updateCollectionFavorite(
      propertyId,
      unitId,
      collectionId,
      newValue
    );

    if (result.success) {
      clearPending(collectionId);
      router.refresh();
    } else {
      setFavorite(collectionId, !newValue);
      clearPending(collectionId);
      toast.error(result.message || "Failed to update favorite");
    }

    setIsFavoritePending(false);
  };

  const getCoverImageUrl = () => {
    if (!collection?.cover_image_url) return "";
    return `${env.NEXT_PUBLIC_STORAGE_URL}${collection.cover_image_url}`;
  };

  const handleDeleteCollection = async () => {
    setIsDeleting(true);
    const result = await deleteCollection(propertyId, collectionId, unitId);

    if (result.success) {
      toast.success("Collection was deleted");
      router.push(ROUTES.DASHBOARD.PROPERTY(propertyId));
    } else {
      toast.error(result.message || "Failed to delete collection");
      setIsDeleting(false);
      setIsDeleteDialogOpen(false);
    }
  };

  const handleEditCollection = async (data: CreateCollectionData) => {
    const result = await updateCollection(
      propertyId,
      collectionId,
      unitId,
      data
    );

    if (result.success) {
      setCollection(result.data);
      setHasImageError(false);
      toast.success("Collection updated successfully");
      return true;
    } else {
      toast.error(result.message || "Failed to update collection");
      return false;
    }
  };

  return (
    <>
      <div className="relative w-full min-h-[220px]">
        <div
          className="relative w-full min-h-[220px] rounded-lg overflow-hidden bg-cover bg-center"
          style={
            showPlaceholder
              ? { backgroundColor: "hsl(var(--muted))" }
              : {
                  backgroundImage: `url(${getCoverImageUrl()})`,
                }
          }
        >
          {!showPlaceholder && (
            <img
              src={getCoverImageUrl()}
              alt=""
              className="hidden"
              onError={() => setHasImageError(true)}
            />
          )}
          {showPlaceholder && (
            <div className="absolute inset-0 flex items-center justify-center">
              <Image className="h-12 w-12 text-muted-foreground" />
            </div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent p-6" />

          <div className="relative z-10 flex flex-col justify-between h-full min-h-[220px] p-5">
            <div className="flex items-center justify-between">
              <Button
                variant="outline"
                size="icon"
                className="h-8 w-8"
                onClick={() => router.back()}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <div className="flex items-center gap-2">
                <motion.button
                  type="button"
                  onClick={handleToggleFavorite}
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                  className="flex h-8 w-8 items-center justify-center cursor-pointer"
                >
                  <motion.div
                    variants={starVariants}
                    initial={false}
                    animate={optimisticFavorite ? "favorited" : "unfavorited"}
                  >
                    <Star
                      className={cn(
                        "size-5 text-white transition-colors duration-200",
                        optimisticFavorite && "fill-white"
                      )}
                    />
                  </motion.div>
                </motion.button>

                {can(CAPABILITIES.EDIT_COLLECTIONS) && (
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="outline" size="icon">
                        <MoreHorizontal className="size-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-[180px]">
                      <DropdownMenuItem
                        onClick={() => setIsEditDialogOpen(true)}
                        className="gap-2 py-3"
                      >
                        <Pencil className="size-4 text-primary" />
                        <span className="text-sm font-medium">
                          Edit details
                        </span>
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => setIsDeleteDialogOpen(true)}
                        className="gap-2 py-3"
                      >
                        <Trash className="size-4 text-destructive" />
                        <span className="text-sm font-medium">
                          Delete collection
                        </span>
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                )}
              </div>
            </div>

            <div className="flex flex-col xl:flex-row xl:items-end gap-4 xl:gap-32 xl:justify-between">
              <div className="flex flex-col gap-2 max-w-full xl:max-w-[720px]">
                <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                  <h1 className="text-4xl font-medium text-white leading-tight">
                    {collection?.name}
                  </h1>

                  <Button
                    variant="outline"
                    size="sm"
                    className="h-9 bg-white border-input rounded-[8px] gap-2 px-3 hover:bg-white/90 w-fit"
                    onClick={() => setIsSheetOpen(true)}
                  >
                    <TvMinimalPlay className="h-4 w-4 text-primary" />
                    <span className="text-sm font-medium text-foreground">
                      Walkthrough Videos
                    </span>
                  </Button>
                </div>

                <p className="text-sm text-muted leading-[1.4] line-clamp-2 overflow-ellipsis">
                  {collection?.description}
                </p>
              </div>

              <div className="flex xl:shrink-0 items-center gap-4 xl:gap-6 flex-wrap">
                <StatCard
                  label="Uploads"
                  value={collection.total_uploads ?? collection.uploads?.length ?? 0}
                />
                <StatCard
                  label="Total Items"
                  value={collection.total_items ?? 0}
                />
                <StatCard
                  label="Total Value"
                  value={formatCurrency(collection.total_value ?? 0)}
                  showBorder={false}
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      <WalkthroughVideosSheet
        open={isSheetOpen}
        onOpenChange={setIsSheetOpen}
        propertyId={propertyId}
        unitId={unitId}
        collectionId={collectionId}
      />

      <EditCollectionDialog
        open={isEditDialogOpen}
        onOpenChange={setIsEditDialogOpen}
        collection={collection}
        propertyId={propertyId}
        unitId={unitId}
        onSave={handleEditCollection}
      />

      <ConfirmationDialog
        open={isDeleteDialogOpen}
        onOpenChange={(open) => {
          if (!isDeleting) {
            setIsDeleteDialogOpen(open);
          }
        }}
        title="Delete collection?"
        description="Deleting the collection will permanently delete all its items and cannot be undone. Would you like to continue?"
        cancelText="Cancel"
        confirmText="Delete"
        isLoading={isDeleting}
        onConfirm={handleDeleteCollection}
      />
    </>
  );
}
