import { Separator } from "../ui/separator";

export default function TextSeparator({ label }: { label?: string }) {
  return (
    <div className="flex flex-row items-center gap-3">
      <Separator className="flex-1" />
      <span className="text-sm text-muted-foreground-2 font-light">
        {label || "or"}
      </span>
      <Separator className="flex-1" />
    </div>
  );
}
