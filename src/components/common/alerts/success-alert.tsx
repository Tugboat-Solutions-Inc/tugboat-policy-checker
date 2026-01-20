import { Alert, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { CheckCircle2Icon, X } from "lucide-react";

interface SuccessAlertProps {
  setShowSuccessAlert: (show: boolean) => void;
  alertMessage: string;
}

export function SuccessAlert({
  setShowSuccessAlert,
  alertMessage,
}: SuccessAlertProps) {
  return (
    <div className="fixed top-4 right-4 z-50">
      <Alert className="bg-foreground flex flex-row justify-between items-center w-96 p-4">
        <div className="flex flex-row items-center gap-2">
          <CheckCircle2Icon className="text-primary size-4" />
          <AlertTitle className="text-white">{alertMessage}</AlertTitle>
        </div>
        <Button
          onClick={() => setShowSuccessAlert(false)}
          variant="ghost"
          className="hover:bg-transparent"
        >
          <X className="text-muted-foreground-2 size-4" />
        </Button>
      </Alert>
    </div>
  );
}
