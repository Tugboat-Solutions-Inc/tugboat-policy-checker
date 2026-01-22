"use client";

import * as React from "react";
import { TugboatModal, type TugboatModalProps } from "./tugboat-modal";
import { TugboatModalFooter } from "./tugboat-modal-footer";
import { TugboatModalStepIndicator } from "./tugboat-modal-step-indicator";

export interface MultiStepConfig {
  title: string;
  description?: string;
  component: React.ReactNode;
  onNext?: () => Promise<boolean> | boolean;
  nextText?: string;
  showNextIcon?: boolean;
  showBackIcon?: boolean;
  isNextDisabled?: boolean;
  maxFiles?: number;
  currentFiles?: number;
  showCancelInsteadOfBack?: boolean;
}

export interface TugboatMultiStepModalProps
  extends Omit<
    TugboatModalProps,
    "title" | "description" | "children" | "footer" | "headerRight"
  > {
  steps: MultiStepConfig[];
  onComplete?: () => void | Promise<void> | boolean | Promise<boolean>;
  onCancel?: () => void;
  showStepIndicator?: boolean;
  cancelText?: string;
}

export function TugboatMultiStepModal({
  steps,
  onComplete,
  onCancel,
  showStepIndicator = true,
  cancelText = "Cancel",
  ...modalProps
}: TugboatMultiStepModalProps) {
  const [currentStepIndex, setCurrentStepIndex] = React.useState(0);
  const [isLoading, setIsLoading] = React.useState(false);

  const safeStepIndex = Math.min(currentStepIndex, steps.length - 1);
  const currentStep = steps[safeStepIndex];
  const isLastStep = safeStepIndex === steps.length - 1;
  const isFirstStep = safeStepIndex === 0;

  if (!currentStep) {
    return null;
  }

  const handleNext = async () => {
    setIsLoading(true);

    try {
      // Run the current step's onNext validation if it exists
      if (currentStep.onNext) {
        const canProceed = await currentStep.onNext();
        if (!canProceed) {
          setIsLoading(false);
          return;
        }
      }

      if (isLastStep) {
        // Complete the form - check if onComplete returns false to indicate failure
        const result = await onComplete?.();
        // Only reset if onComplete succeeded (returned true or void/undefined)
        if (result !== false) {
          setCurrentStepIndex(0); // Reset for next time
        }
      } else {
        // Move to next step
        setCurrentStepIndex((prev) => prev + 1);
      }
    } catch (error) {
      console.error("Error in multi-step navigation:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    setCurrentStepIndex(0); // Reset steps
    onCancel?.();
  };

  const handleBack = () => {
    if (!isFirstStep) {
      setCurrentStepIndex((prev) => prev - 1);
    }
  };

  // Reset step when modal closes
  React.useEffect(() => {
    if (!modalProps.open) {
      setCurrentStepIndex(0);
    }
  }, [modalProps.open]);

  return (
    <TugboatModal
      {...modalProps}
      title={currentStep.title}
      description={currentStep.description}
      headerRight={
        showStepIndicator ? (
          <div className={modalProps.showCloseButton ? "mt-7" : ""}>
            <TugboatModalStepIndicator
              currentStep={currentStepIndex + 1}
              totalSteps={steps.length}
            />
          </div>
        ) : undefined
      }
      footer={
        <TugboatModalFooter
          onCancel={
            isFirstStep || currentStep.showCancelInsteadOfBack
              ? handleCancel
              : undefined
          }
          onBack={
            !isFirstStep && !currentStep.showCancelInsteadOfBack
              ? handleBack
              : undefined
          }
          onNext={handleNext}
          cancelLabel={cancelText}
          showBackIcon={currentStep.showBackIcon}
          nextLabel={
            currentStep.nextText || (isLastStep ? "Save Upload" : "Next Step")
          }
          showNextIcon={currentStep.showNextIcon ?? !isLastStep}
          isNextDisabled={isLoading || currentStep.isNextDisabled}
          isCancelDisabled={isLoading}
          isBackDisabled={isLoading}
          isNextLoading={isLoading}
          maxFiles={currentStep.maxFiles}
          currentFiles={currentStep.currentFiles}
        />
      }
    >
      {currentStep.component}
    </TugboatModal>
  );
}
