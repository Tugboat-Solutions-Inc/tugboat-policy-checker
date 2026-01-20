import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { DetailSection } from "@/components/common/detail-section";

interface UnitOverviewSectionProps {
  unitName: string;
  onChange: (name: string) => void;
}

export function UnitOverviewSection({
  unitName,
  onChange,
}: UnitOverviewSectionProps) {
  return (
    <DetailSection title="Overview" description="Manage your unit name.">
      <div className="flex flex-col gap-1.5 sm:gap-2 w-full lg:max-w-[560px]">
        <Label htmlFor="unit-name" className="text-xs sm:text-sm font-medium">
          Unit Name*
        </Label>
        <Input
          id="unit-name"
          value={unitName}
          onChange={(e) => onChange(e.target.value)}
          className="h-10 sm:h-12 bg-background text-sm"
        />
      </div>
    </DetailSection>
  );
}
