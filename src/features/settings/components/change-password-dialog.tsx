import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogOverlay,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ConfirmationDialog } from "@/components/common/confirmation-dialog";
import ChangePasswordForm from "./change-password-form";
import { useState } from "react";
import { signOutAndRedirect } from "../api/settings.actions";

export function ChangePasswordDialog() {
  const [showChangePassword, setShowChangePassword] = useState(false);
  const [isFormValid, setIsFormValid] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccessDialog, setShowSuccessDialog] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const handleSuccess = () => {
    setShowChangePassword(false);
    setShowSuccessDialog(true);
  };

  const handleValidationChange = (isValid: boolean) => {
    setIsFormValid(isValid);
  };

  const handleSubmittingChange = (submitting: boolean) => {
    setIsSubmitting(submitting);
  };

  const handleConfirmLogout = async () => {
    setIsLoggingOut(true);
    await signOutAndRedirect();
  };

  return (
    <Dialog open={showChangePassword} onOpenChange={setShowChangePassword}>
      <DialogOverlay
        className="data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 fixed inset-0 z-50 backdrop-blur-[5px]"
        style={{ backgroundColor: "rgba(255, 255, 255, 0.5)" }}
      />
      <DialogTrigger asChild>
        <Button
          variant="outline"
          type="button"
          size="sm"
          className="h-9 px-3 py-2 shadow-none cursor-pointer"
        >
          Change Password
        </Button>
      </DialogTrigger>
      <DialogContent
        className="sm:max-w-xl"
        showCloseButton={false}
        onOpenAutoFocus={(e) => e.preventDefault()}
      >
        <DialogHeader>
          <DialogTitle>Change Your Password</DialogTitle>
        </DialogHeader>
        <div className="py-4">
          <ChangePasswordForm
            onSuccess={handleSuccess}
            onValidationChange={handleValidationChange}
            onSubmittingChange={handleSubmittingChange}
          />
        </div>
        <DialogFooter className="flex flex-row gap-3">
          <DialogClose asChild>
            <Button
              type="button"
              variant="secondary"
              className="h-10 bg-accent-border text-foreground hover:bg-gray-200"
              disabled={isSubmitting}
            >
              Cancel
            </Button>
          </DialogClose>
          <Button
            type="submit"
            form="change-password-form"
            variant="default"
            className="h-10"
            disabled={!isFormValid || isSubmitting}
            loading={isSubmitting}
          >
            Change Password
          </Button>
        </DialogFooter>
      </DialogContent>

      <ConfirmationDialog
        open={showSuccessDialog}
        onOpenChange={setShowSuccessDialog}
        title="Password Changed Successfully"
        description="You will now be logged out. Please log in again with your new password."
        confirmText="Continue"
        showCancel={false}
        onConfirm={handleConfirmLogout}
        isLoading={isLoggingOut}
      />
    </Dialog>
  );
}
