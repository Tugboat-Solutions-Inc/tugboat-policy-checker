import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Check, ChevronDown, Image as ImageIcon, Plus } from "lucide-react";
import { useState, useRef, useEffect } from "react";
import Image from "next/image";
import { cn } from "@/lib/utils";
import { Collection } from "@/features/collection-details/types/collection.types";
import { env } from "@/lib/env";

interface CollectionsDropdownProps {
  collections: Collection[];
  value: Collection | null;
  onChange: (collection: Collection) => void;
  onCreateNew?: () => void;
}

export function CollectionsDropdown({
  collections,
  value,
  onChange,
  onCreateNew,
}: CollectionsDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [showBottomChevron, setShowBottomChevron] = useState(false);
  const [isScrolling, setIsScrolling] = useState(false);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const scrollTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const handleSelect = (collection: Collection) => {
    onChange(collection);
    setIsOpen(false);
  };

  const handleScroll = () => {
    if (!scrollContainerRef.current) return;

    const { scrollTop, scrollHeight, clientHeight } =
      scrollContainerRef.current;

    setIsScrolling(true);

    if (scrollTimeoutRef.current) {
      clearTimeout(scrollTimeoutRef.current);
    }

    scrollTimeoutRef.current = setTimeout(() => {
      setIsScrolling(false);
    }, 500);

    setShowBottomChevron(scrollTop < scrollHeight - clientHeight - 1);
  };

  useEffect(() => {
    if (isOpen && scrollContainerRef.current) {
      const needsScroll = collections.length > 6;
      setShowBottomChevron(needsScroll);
    } else {
      setShowBottomChevron(false);
    }
  }, [isOpen, collections.length]);

  useEffect(() => {
    return () => {
      if (scrollTimeoutRef.current) {
        clearTimeout(scrollTimeoutRef.current);
      }
    };
  }, []);

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          className="h-12 border rounded-[8px] flex items-center px-3 py-2 justify-between w-full text-left hover:bg-accent transition-colors"
        >
          {!value ? (
            <div className="text-sm text-muted-foreground">
              Choose a collection
            </div>
          ) : (
            <div className="flex items-center gap-3">
              <div className="relative h-8 w-8 shrink-0 overflow-hidden rounded-md">
                {value.cover_image_url ? (
                  <>
                    <Image
                      src={env.NEXT_PUBLIC_STORAGE_URL + value.cover_image_url}
                      alt={value.name}
                      fill
                      className="object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-b from-black/40 to-transparent" />
                  </>
                ) : (
                  <div className="flex h-full w-full items-center justify-center bg-accent">
                    <ImageIcon className="h-4 w-4 text-muted-foreground" />
                  </div>
                )}
              </div>
              <div className="text-sm">{value.name}</div>
            </div>
          )}
          <ChevronDown
            size={20}
            className={cn(
              "shrink-0 transition-transform",
              isOpen && "rotate-180"
            )}
          />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        className="w-[var(--radix-dropdown-menu-trigger-width)] bg-background p-0"
        align="start"
      >
        {onCreateNew && (
          <>
            <DropdownMenuItem
              onSelect={() => {
                setIsOpen(false);
                onCreateNew();
              }}
              className="h-[52px] px-2 py-2.5 flex items-center cursor-pointer"
            >
              <div className="flex items-center gap-3">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md border border-border bg-background">
                  <Plus className="h-5 w-5 text-primary" />
                </div>
                <span className="text-sm text-foreground">Create New</span>
              </div>
            </DropdownMenuItem>
            
          </>
        )}
        <div
          ref={scrollContainerRef}
          onScroll={handleScroll}
          className={cn(
            "overflow-y-auto transition-all duration-300",
            collections.length > 6 && "max-h-[312px]",
            isScrolling ? "thin-scrollbar" : "scrollbar-hide"
          )}
        >
          <DropdownMenuGroup>
            {collections.map((collection) => (
              <DropdownMenuItem
                key={collection.id}
                onSelect={() => handleSelect(collection)}
                className={cn(
                  "h-[52px] px-2 py-2.5 flex items-center justify-between cursor-pointer",
                  value?.id === collection.id ? "bg-accent" : ""
                )}
              >
                <div className="flex items-center gap-3">
                  <div className="relative h-8 w-8 shrink-0 overflow-hidden rounded-md">
                    {collection.cover_image_url ? (
                      <>
                        <Image
                          src={
                            env.NEXT_PUBLIC_STORAGE_URL + collection.cover_image_url
                          }
                          alt={collection.name}
                          fill
                          className="object-cover"
                        />
                        <div className="absolute inset-0 bg-gradient-to-b from-black/40 to-transparent" />
                      </>
                    ) : (
                      <div className="flex h-full w-full items-center justify-center bg-accent">
                        <ImageIcon className="h-4 w-4 text-muted-foreground" />
                      </div>
                    )}
                  </div>
                  <div className="text-sm">{collection.name}</div>
                </div>
                {value?.id === collection.id && (
                  <Check className="text-primary" size={16} />
                )}
              </DropdownMenuItem>
            ))}
          </DropdownMenuGroup>
        </div>
        <div
          className={cn(
            "items-center justify-center flex px-2 py-1 h-7 pointer-events-none transition-all duration-300 overflow-hidden",
            showBottomChevron ? "opacity-100 max-h-7" : "opacity-0 max-h-0 py-0"
          )}
        >
          <ChevronDown />
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
