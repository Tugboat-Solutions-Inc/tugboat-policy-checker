import { Separator } from "../ui/separator";

interface TextSeparatorProps {
  label?: string;
}

export default function TextSeparator({ label = "or" }: TextSeparatorProps) {
  return (
    <div 
      className="flex flex-row items-center gap-3" 
      role="separator" 
      aria-orientation="horizontal"
    >
      <Separator className="flex-1" aria-hidden="true" />
      <span className="text-sm text-muted-foreground-2 font-light select-none">
        {label}
      </span>
      <Separator className="flex-1" aria-hidden="true" />
    </div>
  );
}
