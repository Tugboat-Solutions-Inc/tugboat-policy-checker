"use client";

import { InviteModal } from "@/components/common/invite-modal/invite-modal";
import { INVITE_MODAL_CONFIGS } from "@/components/common/invite-modal/config/invite-modal-config";
import type { InviteTenantsFormValues } from "../../schemas/invite-tenants.schema";

interface InviteTenantsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit?: (data: InviteTenantsFormValues) => void | Promise<void>;
  unitId: string;
}

export function InviteTenantsModal({
  open,
  onOpenChange,
  onSubmit,
}: InviteTenantsModalProps) {
  return (
    <InviteModal
      open={open}
      onOpenChange={onOpenChange}
      onSubmit={onSubmit}
      config={INVITE_MODAL_CONFIGS.tenants}
    />
  );
}
