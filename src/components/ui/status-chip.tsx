import * as React from "react";
import { cn } from "@/lib/utils";

const PRESET_VARIANTS = {
  success: {
    bg: "bg-[var(--tag-bg-green)]",
    border: "border-[rgba(113,202,17,0.1)]",
    text: "text-[var(--tag-foreground-green)]",
  },
  processing: {
    bg: "bg-[var(--tag-bg-yellow)]",
    border: "border-[var(--tag-bg-yellow)]",
    text: "text-[var(--tag-foreground-yellow)]",
  },
  warning: {
    bg: "bg-yellow-500/10",
    border: "border-yellow-500/10",
    text: "text-yellow-500",
  },
  danger: {
    bg: "bg-red-600/10",
    border: "border-red-600/10",
    text: "text-red-600",
  },
  info: {
    bg: "bg-blue-400/10",
    border: "border-blue-400/10",
    text: "text-blue-400",
  },
  neutral: {
    bg: "bg-slate-400/10",
    border: "border-slate-400/10",
    text: "text-gray-400",
  },
  orange: {
    bg: "bg-[rgba(250,173,96,0.1)]",
    border: "border-[rgba(250,173,96,0.1)]",
    text: "text-[#e89e50]",
  },
  blue: {
    bg: "bg-[rgba(96,165,250,0.1)]",
    border: "border-[rgba(96,165,250,0.1)]",
    text: "text-[#60a5fa]",
  },
  green: {
    bg: "bg-[rgba(113,202,17,0.1)]",
    border: "border-[rgba(113,202,17,0.1)]",
    text: "text-[#71CA11]",
  },
} as const;

export type StatusChipVariant = keyof typeof PRESET_VARIANTS;

export interface StatusChipProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  variant?: StatusChipVariant;
  colors?: {
    bg?: string;
    border?: string;
    text?: string;
  };
  progress?: number;
}

function StatusChip({
  className,
  variant,
  colors,
  children,
  style,
  progress,
  ...props
}: StatusChipProps) {
  const baseClasses =
    "inline-flex items-center justify-center rounded-[6px] border px-[10px] py-1 text-xs font-medium leading-none whitespace-nowrap";
  
  const fontFamily = "font-[var(--font-switzer)]";

  if (colors) {
    return (
      <div
        className={cn(baseClasses, fontFamily, className)}
        style={{
          backgroundColor: colors.bg,
          borderColor: colors.border,
          color: colors.text,
          ...style,
        }}
        {...props}
      >
        {children}
      </div>
    );
  }

  const variantClasses = variant
    ? PRESET_VARIANTS[variant]
    : PRESET_VARIANTS.neutral;

  if (variant === "processing" && progress !== undefined) {
    return (
      <div className="flex items-center gap-4">
        <div
          className={cn(
            baseClasses,
            fontFamily,
            variantClasses.bg,
            variantClasses.border,
            variantClasses.text,
            className
          )}
          style={style}
          {...props}
        >
          {children}
        </div>
        <div className="flex items-center gap-2">
          <svg className="size-4" viewBox="0 0 16 16">
            <circle
              cx="8"
              cy="8"
              r="6"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              className="text-muted/20"
            />
            <circle
              cx="8"
              cy="8"
              r="6"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeDasharray={`${progress * 0.377} 100`}
              strokeLinecap="round"
              className="text-[var(--tag-foreground-yellow)] -rotate-90 origin-center"
            />
          </svg>
          <span className="text-xs font-medium">
            {progress}%
          </span>
        </div>
      </div>
    );
  }

  return (
    <div
      className={cn(
        baseClasses,
        fontFamily,
        variantClasses.bg,
        variantClasses.border,
        variantClasses.text,
        className
      )}
      style={style}
      {...props}
    >
      {children}
    </div>
  );
}

export { StatusChip, PRESET_VARIANTS };
