# AGENTS.md, deploy

This file provides guidance to WARP (warp.dev) when working with code in this repository.

## Project Overview

Tugboat Portal is a property inventory management system built with Next.js 16 (App Router). Users upload photos and AI generates item catalogs. Supports three user types: Individual, Multi-Tenant, and Company.

## Development Commands

```bash
pnpm dev          # Start dev server (Turbopack)
pnpm build        # Production build
pnpm lint         # ESLint
pnpm format       # Prettier format
pnpm format:check # Check formatting
```

## Architecture

### Parallel Routes for User Types

The `/dashboard` route uses Next.js parallel routes to render different UIs for each user type under the same URL:

```
src/app/dashboard/
├── layout.tsx       # Selects slot based on org type
├── @individual/    # Individual user views
├── @multiTenant/   # Multi-tenant views
└── @company/       # Company views
```

- Each slot must have a `default.tsx` for fallback
- Some pages are duplicated across slots (intentional trade-off for cleaner code)
- The layout at `src/app/dashboard/layout.tsx` determines which slot to render based on `accountType`

### Feature Module Structure

Each feature is self-contained in `src/features/{feature-name}/`:

```
features/{feature}/
├── api/           # Server actions (*-actions.ts)
├── components/    # Feature-specific components
├── config/        # Feature configuration
├── hooks/         # Feature-specific hooks
├── schemas/       # Zod validation schemas
├── types/         # TypeScript types
└── utils/         # Feature utilities
```

### Key Directories

- `src/components/common/` - Shared reusable components
- `src/components/ui/` - shadcn/ui primitives
- `src/config/routes.ts` - Centralized route definitions (use `ROUTES` constant)
- `src/constants/` - Global constants (user types, permissions, roles)
- `src/stores/` - Zustand stores
- `src/lib/` - Utilities (auth, permissions, fetch-with-auth)

## Code Conventions

### File Naming

Always prefix with feature name:
- `property-details.types.ts` (not `types.ts`)
- `property-details.actions.ts` (not `actions.ts`)
- `property-details.config.ts` (not `config.ts`)

### No Barrel Files

Use direct imports, not index.ts barrels:
```typescript
// Good
import { PropertyCard } from "@/features/property-details/components/property-card";

// Bad
import { PropertyCard } from "@/features/property-details/components";
```

### No Comments

Do not add comments unless explicitly requested.

### Routes

Always use `ROUTES` from `src/config/routes.ts`:
```typescript
import { ROUTES } from "@/config/routes";
router.push(ROUTES.DASHBOARD.ROOT);
router.push(ROUTES.DASHBOARD.PROPERTY(propertyId));
```

### Type Constants

Use constants instead of string literals:
```typescript
import { USER_TYPES } from "@/constants/user-types.constants";
import { ACCESS_TYPES } from "@/constants/roles.constants";

if (orgType === USER_TYPES.COMPANY) { ... }
if (accessType === ACCESS_TYPES.EDITOR) { ... }
```

## Key Patterns

### Server Actions

All API calls use Next.js Server Actions in `api/` folders:
```typescript
// features/{feature}/api/{feature}.actions.ts
"use server";

export async function getPropertyDetails(propertyId: string) {
  const response = await fetchWithAuth(`/properties/${propertyId}`);
  return response.data;
}
```

### Auth Access

```typescript
import { useCurrentUser, useCurrentOrg, useOrgType } from "@/hooks/use-auth";

const user = useCurrentUser();
const org = useCurrentOrg();
const orgType = useOrgType(); // "INDIVIDUAL" | "MULTI_TENANT" | "COMPANY"
```

### Permissions

```typescript
import { usePermissions } from "@/components/common/permissions-provider";
import { CAPABILITIES } from "@/constants/permissions.constants";

const { can, canAny, canAll } = usePermissions();
if (can(CAPABILITIES.EDIT_PROPERTY)) { /* show edit button */ }
```

### Forms

All forms use React Hook Form with Zod:
```typescript
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

const form = useForm({
  resolver: zodResolver(mySchema),
  defaultValues: { ... }
});
```

## Tech Stack

- **Framework**: Next.js 16 (App Router, Turbopack)
- **Auth/DB**: Supabase (PostgreSQL)
- **Styling**: Tailwind CSS 4 + shadcn/ui
- **State**: Zustand
- **Forms**: React Hook Form + Zod
- **Tables**: TanStack Table

## Environment Variables

Required in `.env.local` (see `.example.env`):
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`
- `NEXT_PUBLIC_BASE_URL`
- `NEXT_PUBLIC_GOOGLE_PLACES_API`
- `NEXT_PUBLIC_API_URL`

## Key Files Reference

- `src/proxy.ts` - API proxy logic
- `src/lib/auth.ts` - Auth utilities
- `src/lib/permissions.ts` - Permission checking
- `src/lib/fetch-with-auth.ts` - API communication
- `src/config/routes.ts` - All application routes
- `src/constants/permissions.constants.ts` - Capabilities & role mappings
