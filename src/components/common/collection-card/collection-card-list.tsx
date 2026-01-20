"use client";

import * as React from "react";
import { motion, AnimatePresence, LayoutGroup } from "framer-motion";
import { Plus, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { CollectionCard } from "./collection-card";
import EmptyState from "../empty-state";
import {
  MOTION_DURATIONS,
  MOTION_EASINGS,
  MOTION_SCALES,
  MOTION_OPACITY,
  DEBOUNCE_DELAYS,
  ANIMATION_THRESHOLDS,
} from "@/constants/motion";
import { Button } from "@/components/ui/button";

export interface Collection {
  id: string;
  image: string;
  title: string;
  itemCount: number;
  value: string;
  isFavorite?: boolean;
}

interface CollectionCardListProps {
  collections: Collection[];
  onFavoriteToggle: (id: string, isFavorite: boolean) => Promise<void>;
  searchPlaceholder?: string;
  emptyStateTitle?: string;
  emptyStateSubtitle?: string;
  className?: string;
  maxAnimatedItems?: number;
}

export function CollectionCardList({
  collections,
  onFavoriteToggle,
  searchPlaceholder = "Search collections...",
  emptyStateTitle = "No collections found",
  emptyStateSubtitle = "Try adjusting your search",
  className,
  maxAnimatedItems = 50,
}: CollectionCardListProps) {
  const [searchQuery, setSearchQuery] = React.useState("");
  const [debouncedQuery, setDebouncedQuery] = React.useState("");

  React.useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(searchQuery);
    }, DEBOUNCE_DELAYS.search);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  const filteredCollections = React.useMemo(() => {
    if (!debouncedQuery.trim()) return collections;

    const query = debouncedQuery.toLowerCase();
    return collections.filter((collection) =>
      collection.title.toLowerCase().includes(query)
    );
  }, [collections, debouncedQuery]);

  const shouldAnimate =
    filteredCollections.length <= ANIMATION_THRESHOLDS.maxAnimatedItems;

  return (
    <div className={className}>
      {/* Search input */}
      <div className="mb-6 mr-6 flex-row flex justify-between">
        <div className="flex flex-row text-center items-center gap-2">
          <h2 className=" text-lg font-medium">Collections</h2>
          <p className="text-muted-foreground-2 text-sm ">{`(${collections.length})`}</p>
        </div>
        <div className="flex flex-row gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              type="text"
              placeholder={searchPlaceholder}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          <Button
            variant="default"
            size="sm"
            className="gap-2 h-9 rounded-[8px]"
          >
            <Plus className="h-4 w-4" />
            Add Collection
          </Button>
        </div>
        {!shouldAnimate && filteredCollections.length > 0 && (
          <p className="mt-2 text-xs text-muted-foreground">
            Showing {filteredCollections.length} results (animations disabled
            for performance)
          </p>
        )}
      </div>

      {/* Collection grid */}
      {filteredCollections.length === 0 ? (
        <motion.div
          initial={{
            opacity: MOTION_OPACITY.hidden,
            scale: MOTION_SCALES.exit,
          }}
          animate={{ opacity: MOTION_OPACITY.visible, scale: 1 }}
          transition={{ duration: MOTION_DURATIONS.normal }}
        >
          <EmptyState title={emptyStateTitle} subtitle={emptyStateSubtitle} />
        </motion.div>
      ) : shouldAnimate ? (
        <LayoutGroup>
          <motion.div layout className="flex flex-wrap gap-3">
            <AnimatePresence mode="popLayout">
              {filteredCollections.map((collection) => (
                <motion.div
                  key={collection.id}
                  layout
                  initial={{
                    opacity: MOTION_OPACITY.hidden,
                    scale: MOTION_SCALES.exit,
                  }}
                  animate={{ opacity: MOTION_OPACITY.visible, scale: 1 }}
                  exit={{
                    opacity: MOTION_OPACITY.hidden,
                    scale: MOTION_SCALES.exit,
                  }}
                  transition={{
                    opacity: { duration: MOTION_DURATIONS.fast },
                    scale: { duration: MOTION_DURATIONS.fast },
                    layout: MOTION_EASINGS.spring,
                  }}
                >
                  <CollectionCard
                    image={collection.image}
                    title={collection.title}
                    itemCount={collection.itemCount}
                    value={collection.value}
                    isFavorite={collection.isFavorite}
                    onFavoriteToggle={(isFavorite) =>
                      onFavoriteToggle(collection.id, isFavorite)
                    }
                  />
                </motion.div>
              ))}
            </AnimatePresence>
          </motion.div>
        </LayoutGroup>
      ) : (
        <div className="flex flex-wrap gap-3">
          {filteredCollections.map((collection) => (
            <div key={collection.id}>
              <CollectionCard
                image={collection.image}
                title={collection.title}
                itemCount={collection.itemCount}
                value={collection.value}
                isFavorite={collection.isFavorite}
                onFavoriteToggle={(isFavorite) =>
                  onFavoriteToggle(collection.id, isFavorite)
                }
              />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
