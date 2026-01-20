import { Checkbox } from "@/components/ui/checkbox";

interface CollectionItemProps {
  name: string;
  category: string;
  area?: string;
  checked?: boolean;
  onCheckedChange?: (checked: boolean) => void;
}

export default function CollectionItem({
  name,
  category,
  area,
  checked,
  onCheckedChange,
}: CollectionItemProps) {
  return (
    <div className="px-4 py-3 flex flex-row justify-between items-center border border-border rounded-lg">
      <div className="flex flex-col gap-0.5">
        <p className="text-sm font-medium">{name}</p>
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <span>{category}</span>
          {area && (
            <>
              <span>•</span>
              <span>{area}</span>
            </>
          )}
        </div>
      </div>
      <Checkbox
        className="shadow-none"
        checked={checked}
        onCheckedChange={onCheckedChange}
      />
    </div>
  );
}
