"use client";

import React, { useCallback, useEffect, useState } from "react";
import useEmblaCarousel from "embla-carousel-react";
import { EmblaOptionsType } from "embla-carousel";
import { WheelGesturesPlugin } from "embla-carousel-wheel-gestures";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

type EmblaCarouselProps = {
  slides: React.ReactNode[];
  options?: EmblaOptionsType;
  className?: string;
};

export default function EmblaCarousel({
  slides,
  options,
  className,
}: EmblaCarouselProps) {
  const [emblaRef, emblaApi] = useEmblaCarousel(
    {
      align: "start",
      dragFree: true,
      duration: 15,
      ...options,
    },
    [WheelGesturesPlugin({ forceWheelAxis: "x" })]
  );

  const [prevBtnDisabled, setPrevBtnDisabled] = useState(true);
  const [nextBtnDisabled, setNextBtnDisabled] = useState(true);
  const [slidesInView, setSlidesInView] = useState<number[]>([0, 1, 2, 3, 4]);
  const [visibleRange, setVisibleRange] = useState({ start: 0, end: 20 });

  const scrollPrev = useCallback(() => {
    if (emblaApi) emblaApi.scrollPrev();
  }, [emblaApi]);

  const scrollNext = useCallback(() => {
    if (emblaApi) emblaApi.scrollNext();
  }, [emblaApi]);

  const onSelect = useCallback(() => {
    if (!emblaApi) return;
    setPrevBtnDisabled(!emblaApi.canScrollPrev());
    setNextBtnDisabled(!emblaApi.canScrollNext());
  }, [emblaApi]);

  const updateSlidesInView = useCallback(() => {
    if (!emblaApi) return;
    const inView = emblaApi.slidesInView();
    setSlidesInView(inView);

    if (inView.length > 0) {
      const buffer = 10;
      const minIndex = Math.max(0, Math.min(...inView) - buffer);
      const maxIndex = Math.min(
        slides.length - 1,
        Math.max(...inView) + buffer
      );
      setVisibleRange({ start: minIndex, end: maxIndex });
    }
  }, [emblaApi, slides.length]);

  useEffect(() => {
    if (!emblaApi) return;

    onSelect();
    updateSlidesInView();

    emblaApi.on("select", onSelect);
    emblaApi.on("reInit", onSelect);
    emblaApi.on("slidesInView", updateSlidesInView);
    emblaApi.on("reInit", updateSlidesInView);

    return () => {
      emblaApi.off("select", onSelect);
      emblaApi.off("reInit", onSelect);
      emblaApi.off("slidesInView", updateSlidesInView);
      emblaApi.off("reInit", updateSlidesInView);
    };
  }, [emblaApi, onSelect, updateSlidesInView]);

  return (
    <div className={cn("relative", className)}>
      <div className="overflow-hidden py-4 -my-4" ref={emblaRef}>
        <div className="flex gap-3 touch-pan-y touch-action-pan-y px-1">
          {slides.map((slide, index) => {
            const isInView = slidesInView.includes(index);
            const isLastInView =
              isInView && index === Math.max(...slidesInView);
            const canScrollNext = !nextBtnDisabled;
            const shouldDim = isLastInView && canScrollNext;
            const slideKey =
              React.isValidElement(slide) && slide.key ? slide.key : index;

            const shouldRender =
              index >= visibleRange.start && index <= visibleRange.end;

            return (
              <div
                key={slideKey}
                className={cn(
                  "flex-[0_0_auto] transition-opacity duration-300",
                  isInView && !shouldDim ? "opacity-100" : "opacity-30"
                )}
              >
                {shouldRender ? (
                  slide
                ) : (
                  <div className="w-[208px] h-[272px] bg-gray-100 rounded-lg animate-pulse" />
                )}
              </div>
            );
          })}
        </div>
      </div>

      <button
        onClick={scrollPrev}
        disabled={prevBtnDisabled}
        className={cn(
          "absolute left-2 top-1/2 -translate-y-1/2 z-10",
          "flex h-8 w-8 items-center justify-center rounded-md",
          "bg-white/90 border border-[#e5e7eb]",
          "transition-all duration-200",
          "hover:bg-white hover:scale-110",
          "disabled:opacity-0 disabled:pointer-events-none"
        )}
        aria-label="Previous slide"
      >
        <ChevronLeft className="h-4 w-4 text-gray-900" />
      </button>

      <button
        onClick={scrollNext}
        disabled={nextBtnDisabled}
        className={cn(
          "absolute right-2 top-1/2 -translate-y-1/2 z-10",
          "flex h-8 w-8 items-center justify-center rounded-md",
          "bg-white/90 border border-[#e5e7eb]",
          "transition-all duration-200",
          "hover:bg-white hover:scale-110",
          "disabled:opacity-0 disabled:pointer-events-none"
        )}
        aria-label="Next slide"
      >
        <ChevronRight className="h-4 w-4 text-gray-900" />
      </button>
    </div>
  );
}
