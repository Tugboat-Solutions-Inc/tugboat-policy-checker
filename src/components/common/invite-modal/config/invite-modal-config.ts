export interface InviteModalConfig {
  title: string;
  description: string;
  labelText: string;
  submitButtonText: string;
  successNoun: string;
}

export const INVITE_MODAL_CONFIGS: Record<string, InviteModalConfig> = {
  tenants: {
    title: "Invite Tenants",
    description:
      "Send email invites to give tenants access to their property account.",
    labelText: "Tenant emails",
    submitButtonText: "Invite Tenants",
    successNoun: "tenant",
  },
  users: {
    title: "Invite Users",
    description:
      "Send email invites to give users access to their property account.",
    labelText: "Email Address",
    submitButtonText: "Invite Users",
    successNoun: "user",
  },
  clients: {
    title: "Invite Clients",
    description:
      "Send email invites to give clients access to their property account.",
    labelText: "Email Address",
    submitButtonText: "Invite Clients",
    successNoun: "client",
  },
} as const;
