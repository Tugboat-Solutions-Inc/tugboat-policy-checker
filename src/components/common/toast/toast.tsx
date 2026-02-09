import { toast as sonnerToast } from "sonner";
import {
  CircleCheckIcon,
  InfoIcon,
  OctagonXIcon,
  TriangleAlertIcon,
  Loader2Icon,
} from "lucide-react";
import { BaseToast } from "@/components/common/toast/base-toast";

const TOAST_DURATION = 3000;
const TOAST_ERROR_DURATION = 5000;

export const toast = {
  success: (message: string, description?: string) => {
    return sonnerToast.custom(
      (id) => (
        <BaseToast
          id={id}
          icon={
            <CircleCheckIcon
              style={{ color: "var(--primary-toast)" }}
              className="size-4"
            />
          }
          message={message}
          description={description}
        />
      ),
      { duration: TOAST_DURATION }
    );
  },

  error: (message: string, description?: string) => {
    return sonnerToast.custom(
      (id) => (
        <BaseToast
          id={id}
          icon={
            <OctagonXIcon
              style={{ color: "var(--error)" }}
              className="size-4"
            />
          }
          message={message}
          description={description}
        />
      ),
      { duration: TOAST_ERROR_DURATION }
    );
  },

  info: (message: string, description?: string) => {
    return sonnerToast.custom(
      (id) => (
        <BaseToast
          id={id}
          icon={
            <InfoIcon
              style={{ color: "var(--primary-toast)" }}
              className="size-4"
            />
          }
          message={message}
          description={description}
        />
      ),
      { duration: TOAST_DURATION }
    );
  },

  warning: (message: string, description?: string) => {
    return sonnerToast.custom(
      (id) => (
        <BaseToast
          id={id}
          icon={
            <TriangleAlertIcon
              style={{ color: "var(--primary-toast)" }}
              className="size-4"
            />
          }
          message={message}
          description={description}
        />
      ),
      { duration: TOAST_DURATION }
    );
  },

  loading: (message: string, description?: string) => {
    return sonnerToast.custom(
      (id) => (
        <BaseToast
          id={id}
          icon={
            <Loader2Icon
              style={{ color: "var(--primary-toast)" }}
              className="size-4 animate-spin"
            />
          }
          message={message}
          description={description}
        />
      ),
      { duration: Infinity }
    );
  },

  dismiss: (toastId?: string | number) => {
    return sonnerToast.dismiss(toastId);
  },
};
