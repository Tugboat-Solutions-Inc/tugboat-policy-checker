---
name: Fix Invite Flow
overview: Fix the broken invite flow by updating frontend types, fixing accept/decline logic to work without backend endpoints, passing invite tokens through signup, and routing to correct onboarding based on organization type.
todos:
  - id: update-invite-types
    content: Add organization_type to invite types
    status: completed
  - id: fix-accept-decline
    content: Change accept to redirect to signup with token, remove API calls
    status: completed
  - id: signup-read-token
    content: Update signup page to read invite_token from URL params
    status: completed
  - id: signup-pass-token
    content: Pass invite_token to Supabase signUp metadata
    status: completed
  - id: verified-routing
    content: Route to correct onboarding based on org type after verification
    status: completed
  - id: test-flow
    content: Test complete invite flow via browser
    status: completed
---

# Fix Invite Flow for Multi-Tenant/Company Signup

## Problem Summary

The current invite flow is broken:

- Frontend calls `POST /invites/:token/accept` and `/decline` which don't exist on backend
- Signup doesn't pass `invite_token` to Supabase (required for SQL trigger)
- Frontend types don't capture `organization_type` from invite response
- No routing logic to send invited users to correct onboarding

## Architecture

```mermaid
flowchart TD
    A[User clicks invite link] --> B["Invite page"]
    B --> C{Fetch invite details}
    C --> D[Show invite info with org_type]
    D --> E{User clicks Accept}
    E --> F["Redirect to signup with token"]
    F --> G[Signup with token in metadata]
    G --> H[Supabase trigger processes invite]
    H --> I[Email verification]
    I --> J{Check org_type from token}
    J -->|INDIVIDUAL| K["Individual onboarding"]
    J -->|MULTI_TENANT| L["Multi-tenant onboarding"]
    J -->|COMPANY| M["Company onboarding"]

    D --> N{User clicks Decline}
    N --> O["Redirect to login"]
```

## Implementation

### 1. Update Invite Types

Update [`src/features/invites/types/invite.types.ts`](src/features/invites/types/invite.types.ts) to include organization type:

```typescript
export type OrganizationType = "INDIVIDUAL" | "MULTI_TENANT" | "COMPANY";

export type PropertyInvite = {
  // ... existing fields
  organization_type: OrganizationType; // ADD
};

export type OrganizationInvite = {
  // ... existing fields
  organization_type: OrganizationType; // ADD
};
```

### 2. Fix Accept/Decline Logic

Update [`src/features/invites/components/invite-accept-page.tsx`](src/features/invites/components/invite-accept-page.tsx):

- **Accept**: Redirect to `/signup?invite_token={token}` instead of calling non-existent API
- **Decline**: Show message and redirect to login (no API call needed)

### 3. Update Signup to Handle Invite Token

Update [`src/app/(auth)/signup/page.tsx`](<src/app/(auth)/signup/page.tsx>):

- Read `invite_token` from URL search params
- Pass to signup form

Update [`src/features/auth/components/auth-signup-form.tsx`](src/features/auth/components/auth-signup-form.tsx):

- Accept `inviteToken` prop
- Store in cookie/state for use after verification

Update [`src/features/auth/api/auth.actions.ts`](src/features/auth/api/auth.actions.ts) `signup()`:

- Pass `invite_token` in Supabase `signUp()` options:

```typescript
await supabase.auth.signUp({
  email,
  password,
  options: {
    data: { invite_token: inviteToken },  // ADD
    emailRedirectTo: ...
  }
});
```

### 4. Route to Correct Onboarding After Verification

Update [`src/app/(auth)/signup/verified/page.tsx`](<src/app/(auth)/signup/verified/page.tsx>):

- Check user's org type from JWT/session
- Redirect to appropriate onboarding:
  - INDIVIDUAL → `/onboarding`
  - MULTI_TENANT → `/onboarding/multi-tenant`
  - COMPANY → `/onboarding/company`

### 5. Handle Invited Users in Onboarding

For users invited to existing orgs, they shouldn't create a new org/property. Update onboarding pages to detect if user was invited (check if they already belong to an org) and show simplified flow (just name/profile).

## Files to Modify

| File | Change |

| ------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------- |

| [`src/features/invites/types/invite.types.ts`](src/features/invites/types/invite.types.ts) | Add `organization_type` field |

| [`src/features/invites/components/invite-accept-page.tsx`](src/features/invites/components/invite-accept-page.tsx) | Change accept to redirect, remove API call |

| [`src/features/invites/api/invite.actions.ts`](src/features/invites/api/invite.actions.ts) | Remove broken `acceptInvite`/`declineInvite` or make them redirects |

| [`src/app/(auth)/signup/page.tsx`](<src/app/(auth)/signup/page.tsx>) | Read invite_token from URL |

| [`src/features/auth/components/auth-signup-form.tsx`](src/features/auth/components/auth-signup-form.tsx) | Pass invite_token to signup action |

| [`src/features/auth/api/auth.actions.ts`](src/features/auth/api/auth.actions.ts) | Include invite_token in Supabase metadata |

| [`src/app/(auth)/signup/verified/page.tsx`](<src/app/(auth)/signup/verified/page.tsx>) | Route to correct onboarding based on org type |

| [`src/config/routes.ts`](src/config/routes.ts) | Add route helper for signup with invite token |
