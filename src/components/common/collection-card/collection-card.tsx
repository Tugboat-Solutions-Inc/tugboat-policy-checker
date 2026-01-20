"use client";

import * as React from "react";
import Image from "next/image";
import { Star, Image as ImageIcon, CircleAlert } from "lucide-react";
import { motion, type Variants, useMotionValue, useSpring, useTransform, useMotionTemplate } from "framer-motion";
import { cn } from "@/lib/utils";
import { env } from "@/lib/env";

export interface CollectionCardProps
  extends Omit<React.HTMLAttributes<HTMLDivElement>, 'onDrag' | 'onDragStart' | 'onDragEnd' | 'onDragOver' | 'onAnimationStart'> {
  image: string | null;
  title: string;
  itemCount: number;
  value?: string;
  isFavorite?: boolean;
  onFavoriteToggle?: (isFavorite: boolean) => Promise<void> | void;
  duplicatesDetected?: boolean;
  layoutId?: string;
}

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

export const CollectionCard = React.memo(function CollectionCard({
  className,
  image,
  title,
  itemCount,
  value,
  isFavorite = false,
  onFavoriteToggle,
  duplicatesDetected,
  layoutId,
  ...props
}: CollectionCardProps) {
  const [optimisticFavorite, setOptimisticFavorite] =
    React.useState(isFavorite);
  const [isPending, setIsPending] = React.useState(false);
  const [hasImageError, setHasImageError] = React.useState(false);
  const [isHovered, setIsHovered] = React.useState(false);
  const isFirstRender = React.useRef(true);
  const cardRef = React.useRef<HTMLDivElement>(null);

  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  const springConfig = { stiffness: 300, damping: 30 };
  
  const rotateX = useSpring(useTransform(mouseY, [-0.5, 0.5], [5, -5]), springConfig);
  const rotateY = useSpring(useTransform(mouseX, [-0.5, 0.5], [-5, 5]), springConfig);
  
  const sheenX = useSpring(useTransform(mouseX, [-0.5, 0.5], [20, 80]), springConfig);
  const sheenY = useSpring(useTransform(mouseY, [-0.5, 0.5], [20, 80]), springConfig);
  
  const shadowX = useSpring(useTransform(mouseX, [-0.5, 0.5], [6, -6]), springConfig);
  const shadowY = useSpring(useTransform(mouseY, [-0.5, 0.5], [6, -6]), springConfig);
  const boxShadow = useMotionTemplate`${shadowX}px ${shadowY}px 20px rgba(0, 0, 0, 0.1)`;

  const handleMouseMove = React.useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      if (!cardRef.current) return;
      const rect = cardRef.current.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width - 0.5;
      const y = (e.clientY - rect.top) / rect.height - 0.5;
      mouseX.set(x);
      mouseY.set(y);
    },
    [mouseX, mouseY]
  );

  const handleMouseLeave = React.useCallback(() => {
    mouseX.set(0);
    mouseY.set(0);
    setIsHovered(false);
  }, [mouseX, mouseY]);

  const handleMouseEnter = React.useCallback(() => {
    setIsHovered(true);
  }, []);

  const showPlaceholder = !image || hasImageError;

  React.useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }
    setOptimisticFavorite(isFavorite);
  }, [isFavorite]);

  const handleToggle = React.useCallback(
    async (e: React.MouseEvent) => {
      e.stopPropagation();
      if (!onFavoriteToggle || isPending) return;

      const newValue = !optimisticFavorite;
      setOptimisticFavorite(newValue);
      setIsPending(true);

      try {
        await onFavoriteToggle(newValue);
      } catch (error) {
        setOptimisticFavorite(!newValue);
      } finally {
        setIsPending(false);
      }
    },
    [onFavoriteToggle, isPending, optimisticFavorite]
  );

  return (
    <motion.div
      ref={cardRef}
      layoutId={layoutId}
      layout
      className={cn(
        "flex w-[208px] flex-col gap-4 rounded-[12px] border border-accent-border bg-accent p-1 pb-4 cursor-pointer relative",
        className
      )}
      style={{
        rotateX,
        rotateY,
        transformStyle: "preserve-3d",
        perspective: 1000,
        boxShadow: isHovered ? boxShadow : "0 2px 8px rgba(0, 0, 0, 0.06)",
      }}
      whileHover={{
        scale: 1.02,
      }}
      transition={{
        layout: { type: "spring", stiffness: 300, damping: 30 },
        scale: { duration: 0.2, ease: "easeOut" },
      }}
      onMouseMove={handleMouseMove}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      {...props}
    >
      <motion.div
        className="absolute inset-0 rounded-[12px] pointer-events-none z-50"
        style={{
          background: useTransform(
            [sheenX, sheenY],
            ([x, y]) => 
              `radial-gradient(circle at ${x}% ${y}%, rgba(255,255,255,0.15) 0%, rgba(255,255,255,0) 50%)`
          ),
          opacity: isHovered ? 1 : 0,
        }}
        transition={{ opacity: { duration: 0.3 } }}
      />
      <div className="relative h-[200px] w-[200px] overflow-hidden rounded-[10px]" style={{ transform: "translateZ(20px)" }}>
        {showPlaceholder ? (
          <div className="absolute inset-0 flex items-center justify-center bg-background">
            <ImageIcon className="h-8 w-8 text-muted-foreground" />
          </div>
        ) : (
          <>
            <Image
              src={env.NEXT_PUBLIC_STORAGE_URL + image}
              alt={title}
              fill
              className="object-cover"
              loading="lazy"
              sizes="208px"
              onError={() => setHasImageError(true)}
            />
            <div className="absolute inset-0 bg-gradient-to-b from-black/40 to-transparent rounded-[10px]" />
          </>
        )}
        {duplicatesDetected ? (
          <div className="absolute left-3 top-3 flex items-center gap-1 rounded-md border border-border bg-background px-2 py-1">
            <CircleAlert className="h-3 w-3 text-destructive" />
            <span className="text-xs font-medium text-destructive">Duplicates</span>
          </div>
        ) : null}
        {onFavoriteToggle ? (
          <motion.button
            type="button"
            onClick={handleToggle}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            className="absolute right-3 top-3 flex h-5 w-5 items-center justify-center text-white cursor-pointer"
          >
            <motion.div
              variants={starVariants}
              initial={false}
              animate={optimisticFavorite ? "favorited" : "unfavorited"}
            >
              <Star
                className={cn(
                  "h-5 w-5 transition-colors duration-200",
                  optimisticFavorite && "fill-current"
                )}
              />
            </motion.div>
          </motion.button>
        ) : (
          <div className="absolute right-3 top-3 flex h-5 w-5 items-center justify-center text-white">
            <Star
              className={cn("h-5 w-5", optimisticFavorite && "fill-current")}
            />
          </div>
        )}
      </div>
      <div className="flex flex-col gap-1.5 px-3" style={{ transform: "translateZ(10px)" }}>
        <p className="text-base font-medium leading-none text-foreground truncate">
          {title}
        </p>
        <div className="flex items-center gap-2">
          <p className="text-sm leading-none text-muted-foreground">
            {itemCount} items
          </p>
          {value ? (
            <>
              <div className="h-1 w-1 rounded-full bg-muted-foreground" />
              <p className="text-sm leading-none text-muted-foreground">
                {value}
              </p>
            </>
          ) : null}
        </div>
      </div>
    </motion.div>
  );
});
