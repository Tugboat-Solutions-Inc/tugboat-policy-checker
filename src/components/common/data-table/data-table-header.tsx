import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";

interface DataTableHeaderProps {
  title?: string;
  totalCount: number;
  searchPlaceholder?: string;
  searchValue: string;
  onSearchChange: (value: string) => void;
  headerActions?: React.ReactNode;
  showSearch: boolean;
}

export function DataTableHeader({
  title,
  totalCount,
  searchPlaceholder = "Search...",
  searchValue,
  onSearchChange,
  headerActions,
  showSearch,
}: DataTableHeaderProps) {
  if (!title && !headerActions && !showSearch) {
    return null;
  }

  return (
    <div className="flex items-center justify-between shrink-0">
      {title && (
        <div className="flex items-center gap-2">
          <h2 className="text-lg font-medium text-foreground">{title}</h2>
          <p className="text-sm text-muted-foreground-2">({totalCount})</p>
        </div>
      )}
      <div className="flex items-center gap-3">
        {showSearch && (
          <div className="relative w-[240px]">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-foreground" />
            <Input
              type="text"
              placeholder={searchPlaceholder}
              value={searchValue}
              onChange={(e) => onSearchChange(e.target.value)}
              className="pl-10 h-9"
            />
          </div>
        )}
        {headerActions}
      </div>
    </div>
  );
}
