import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

export function generatePageNumbers(
  currentPage: number,
  totalPages: number
): (number | string)[] {
  const pages: (number | string)[] = [];
  const showEllipsis = totalPages > 7;

  if (!showEllipsis) {
    for (let i = 0; i < totalPages; i++) {
      pages.push(i);
    }
    return pages;
  }

  pages.push(0);

  if (currentPage <= 3) {
    for (let i = 1; i <= Math.min(4, totalPages - 2); i++) {
      pages.push(i);
    }
    if (totalPages > 5) {
      pages.push("ellipsis");
    }
  } else if (currentPage >= totalPages - 4) {
    pages.push("ellipsis");
    for (let i = Math.max(1, totalPages - 5); i < totalPages - 1; i++) {
      pages.push(i);
    }
  } else {
    pages.push("ellipsis");
    for (let i = currentPage - 1; i <= currentPage + 1; i++) {
      pages.push(i);
    }
    pages.push("ellipsis");
  }

  if (totalPages > 1) {
    pages.push(totalPages - 1);
  }

  return pages;
}

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  totalCount: number;
  pageSize: number;
  onPageChange: (page: number) => void;
}

export function Pagination({
  currentPage,
  totalPages,
  totalCount,
  pageSize,
  onPageChange,
}: PaginationProps) {
  const startIndex = currentPage * pageSize;
  const endIndex = Math.min(startIndex + pageSize, totalCount);

  return (
    <div className="flex items-center justify-between pt-5 shrink-0">
      <p className="text-xs leading-none text-foreground">
        Showing {totalCount === 0 ? 0 : startIndex + 1}-{endIndex}{" "}
        <span className="text-muted-foreground">of {totalCount}</span>
      </p>
      <div className="flex items-center p-0.5 rounded-lg">
        <button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 0}
          className={cn(
            "flex h-8 w-8 items-center justify-center rounded-md text-sm font-medium text-foreground transition-colors",
            "hover:bg-muted disabled:opacity-50 disabled:pointer-events-none"
          )}
        >
          <ChevronLeft className="h-4 w-4" />
        </button>
        <div className="flex items-center gap-1.5">
          {generatePageNumbers(currentPage, totalPages).map((page, index) => {
            if (page === "ellipsis") {
              return (
                <span
                  key={`ellipsis-${index}`}
                  className="flex h-8 w-8 items-center justify-center text-muted-foreground"
                >
                  ...
                </span>
              );
            }

            return (
              <button
                key={page}
                onClick={() => onPageChange(page as number)}
                className={cn(
                  "flex h-8 w-8 items-center justify-center rounded-md text-xs transition-colors",
                  currentPage === page
                    ? "bg-white border border-border text-foreground font-medium"
                    : "bg-[#fcfcfc] text-muted-foreground hover:bg-muted"
                )}
              >
                {(page as number) + 1}
              </button>
            );
          })}
        </div>
        <button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage >= totalPages - 1}
          className={cn(
            "flex h-8 w-8 items-center justify-center rounded-md text-sm font-medium text-foreground transition-colors",
            "hover:bg-muted disabled:opacity-50 disabled:pointer-events-none"
          )}
        >
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}

