import { Plus } from "lucide-react";
import {
  TugboatMultiStepModal,
  MultiStepConfig,
} from "../tugboat-modal/tugboat-multi-step-modal";

interface AddPropertySectionProps {
  isModalOpen: boolean;
  onModalOpenChange: (open: boolean) => void;
  steps: MultiStepConfig[];
  onComplete: () => Promise<void>;
  onCancel: () => void;
}

export function AddPropertySection({
  isModalOpen,
  onModalOpenChange,
  steps,
  onComplete,
  onCancel,
}: AddPropertySectionProps) {
  return (
    <>
      <div
        onClick={() => onModalOpenChange(true)}
        className="rounded-[12px] px-3 bg-white h-12 flex flex-row items-center justify-between border border-foreground/5 cursor-pointer hover:bg-accent transition-colors"
      >
        <p className="font-semibold text-sm">Add New Property</p>
        <div className="h-6 w-6 rounded-sm bg-primary flex items-center justify-center">
          <Plus className="h-4 w-4 text-white" />
        </div>
      </div>
      <TugboatMultiStepModal
        open={isModalOpen}
        onOpenChange={(open) => !open && onCancel()}
        maxWidth="lg"
        steps={steps}
        onComplete={onComplete}
        onCancel={onCancel}
        showStepIndicator={steps.length > 1}
      />
    </>
  );
}

