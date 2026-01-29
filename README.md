# Tugboat Portal

A property inventory management system built with Next.js 16. Upload photos, AI generates item catalogs.

## Getting Started

### Prerequisites

- Node.js 18+
- pnpm
- Access to Supabase project credentials
- Access to backend API

### Installation

```bash
# Clone the repository
git clone <repository-url>
cd tugboat-portal

# Install dependencies
pnpm install
```

### Environment Setup

Create a `.env.local` file in the root directory:

```env
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=your-supabase-anon-key
NEXT_PUBLIC_BASE_URL=http://localhost:3000
NEXT_PUBLIC_GOOGLE_PLACES_API=your-google-places-api-key
NEXT_PUBLIC_API_URL=your-backend-api-url
```

See `.example.env` for reference.

### Running the Project

```bash
# Start development server (with Turbopack)
pnpm dev

# Build for production
pnpm build

# Start production server
pnpm start

# Lint code
pnpm lint

# Format code
pnpm format
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

# Project Documentation

## Overview

Tugboat Portal is a **property inventory management system** that allows property managers, landlords, and companies to manage property inventories through photo uploads that are processed by AI to generate item catalogs.

The platform supports three user types:

- **Individual** - Single property owners
- **Multi-Tenant** - Property managers with multiple units
- **Company** - Organizations managing multiple properties with teams

### User Type Routing (Parallel Routes)

To support these three user types under the **same URL** without cluttering page components with `if/else` statements, the dashboard uses [Next.js parallel routes](https://nextjs.org/docs/app/api-reference/file-conventions/parallel-routes).

**How it works:**

- The `/dashboard` route has three slots: `@individual`, `@multiTenant`, `@company`
- Each slot contains its own complete page tree (property details, collections, settings, etc.)
- The layout receives all slots as props and renders the appropriate one based on the user's org type
- The URL stays the same (`/dashboard/property/123`) regardless of user type

**Benefits:**

- Each user type has clean, focused components without conditional rendering logic
- Easier to maintain, test, and modify each user type's UI independently
- Conditional logic lives only in the layout, not scattered across every page

**Trade-offs:**

- Some pages that are identical across user types require duplicated files (e.g., property details page exists in all three slots)
- Changes to shared functionality may need to be applied in multiple places
- More files/folders to navigate in the codebase

We accept these trade-offs because the alternative (large components with nested conditionals for each user type) is harder to reason about, test, and maintain. The duplication is explicit and easy to spot, while conditional spaghetti is not.

```
/dashboard/
├── layout.tsx              # Conditionally renders the correct slot
├── @individual/           # Slot for individual users
├── @multiTenant/          # Slot for multi-tenant users
└── @company/              # Slot for company users
```

## Tech Stack

| Category         | Technology                         |
| ---------------- | ---------------------------------- |
| Framework        | Next.js 16 (App Router, Turbopack) |
| Language         | TypeScript 5                       |
| Auth             | Supabase Auth                      |
| Database         | Supabase (PostgreSQL)              |
| Styling          | Tailwind CSS 4                     |
| UI Components    | Radix UI + shadcn/ui               |
| State Management | Zustand                            |
| Forms            | React Hook Form + Zod              |
| Tables           | TanStack Table                     |
| Charts           | Recharts                           |
| File Uploads     | TUS protocol (tus-js-client)       |
| Export           | jsPDF, xlsx, PapaParse             |

## Architecture

### Directory Structure

```
src/
├── app/                      # Next.js App Router pages
│   ├── (auth)/              # Auth pages (login, signup, onboarding)
│   ├── auth/                # Auth callback handler
│   ├── dashboard/           # Main dashboard with parallel routes
│   │   ├── @individual/     # Individual user dashboard views
│   │   ├── @multiTenant/    # Multi-tenant dashboard views
│   │   └── @company/        # Company dashboard views
│   └── invite/              # Invite acceptance pages
├── components/
│   ├── common/              # Shared/reusable components
│   └── ui/                  # shadcn/ui primitives
├── config/
│   ├── api.ts               # API configuration
│   └── routes.ts            # Centralized route definitions
├── constants/               # Global constants (user types, permissions, roles)
├── features/                # Feature modules (see below)
├── hooks/                   # Global custom hooks
├── lib/                     # Utilities (auth, permissions, etc.)
├── stores/                  # Zustand stores
└── utils/                   # Utility functions
```

### Feature Modules

Each feature is self-contained with its own structure:

```
features/{feature-name}/
├── api/                     # Server actions (e.g., property-details.actions.ts)
├── components/              # Feature-specific components
├── config/                  # Feature configuration
├── hooks/                   # Feature-specific hooks
├── schemas/                 # Zod validation schemas
├── types/                   # TypeScript types
└── utils/                   # Feature utilities
```

**Key Features:**

- `auth` - Authentication, signup, login, onboarding
- `dashboard` - Main dashboard, KPIs, collections overview
- `property-details` - Property management, user access
- `collection-details` - Collection/item management, photo processing
- `tenant-dashboard` - Multi-tenant unit management
- `company-dashboard` - Company-wide property overview
- `settings` - User/organization settings
- `invites` - User invitation system
- `organizations` - Organization management

## Database Schema

Key entities (see `db.sql` for full schema):

```
organizations → properties → units → collections → items
     ↓              ↓
organization_users  property_access
     ↓
 users_data
```

- **organizations** - Companies/individuals owning properties
- **properties** - Physical properties with addresses
- **units** - Sub-divisions of properties (apartments, rooms)
- **collections** - Photo collections for inventory
- **items** - Individual inventory items (AI-detected from photos)
- **property_access** - Controls who can view/edit which properties

## Authentication & Authorization

### Auth Flow

1. User signs up via Supabase Auth
2. JWT token contains user data + organizations
3. Token decoded and stored in Zustand (`auth-store.ts`)
4. Organization type determines dashboard routing

### Auth Store

```typescript
// Access auth data via hooks
import { useCurrentUser, useCurrentOrg, useOrgType } from "@/hooks/use-auth";

const user = useCurrentUser(); // { email, firstName, lastName, ... }
const org = useCurrentOrg(); // { org_id, org_name, org_type, role }
const orgType = useOrgType(); // "INDIVIDUAL" | "MULTI_TENANT" | "COMPANY"
```

### Permissions System

Capability-based access control (see `PERMISSIONS_GUIDE.md`):

```typescript
import { usePermissions } from "@/components/common/permissions-provider";
import { CAPABILITIES } from "@/constants/permissions.constants";

const { can, canAny, canAll } = usePermissions();

// Check permissions
if (can(CAPABILITIES.EDIT_PROPERTY)) {
  /* show edit button */
}
```

**Roles:**

- `EDITOR` - Full access (edit, delete, manage)
- `VIEWER` - Read-only access

## Key Patterns

### 1. Parallel Routes

See [User Type Routing](#user-type-routing-parallel-routes) in the Overview section.

**Layout implementation example:**

```typescript
// dashboard/layout.tsx
export default function DashboardLayout({
  individual,
  multiTenant,
  company,
}: {
  individual: React.ReactNode;
  multiTenant: React.ReactNode;
  company: React.ReactNode;
}) {
  const orgType = getOrgType(); // from auth

  if (orgType === "INDIVIDUAL") return individual;
  if (orgType === "MULTI_TENANT") return multiTenant;
  if (orgType === "COMPANY") return company;
}
```

**Important:** Each slot must have a `default.tsx` file for fallback during navigation.

### 2. Server Actions

All API calls use Next.js Server Actions in `api/` folders:

```typescript
// features/property-details/api/property-details.actions.ts
"use server";

export async function getPropertyDetails(propertyId: string) {
  const response = await fetchWithAuth(`/properties/${propertyId}`);
  return response.data;
}
```

### 3. Route Constants

Never hardcode routes. Use `ROUTES` from `src/config/routes.ts`:

```typescript
import { ROUTES } from "@/config/routes";

// Static routes
router.push(ROUTES.DASHBOARD.ROOT);

// Dynamic routes
router.push(ROUTES.DASHBOARD.PROPERTY(propertyId));
```

### 4. Type Constants

Use constants for type-checking values:

```typescript
import { USER_TYPES } from "@/constants/user-types.constants";
import { ORG_ROLES, ACCESS_TYPES } from "@/constants/roles.constants";

if (orgType === USER_TYPES.COMPANY) { ... }
if (accessType === ACCESS_TYPES.EDITOR) { ... }
```

### 5. Forms

All forms use React Hook Form with Zod:

```typescript
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

const form = useForm({
  resolver: zodResolver(mySchema),
  defaultValues: { ... }
});
```

## State Management

### Zustand Stores

| Store                           | Purpose                       |
| ------------------------------- | ----------------------------- |
| `auth-store.ts`                 | Decoded JWT token, user data  |
| `selected-property-store.ts`    | Currently selected property   |
| `selected-collection-store.ts`  | Currently selected collection |
| `collection-favorites-store.ts` | User's favorited collections  |
| `property-form-store.ts`        | Property creation form state  |
| `impersonation-store.ts`        | Admin user impersonation      |

## Code Conventions

### File Naming

- **Always prefix** with feature name: `property-details.types.ts` (not `types.ts`)
- Use kebab-case for files: `invite-modal-config.ts`
- Components: PascalCase in kebab-case files: `export function InviteModal()`

### Comments

**Do not add comments** unless explicitly requested. Code should be self-documenting.

### Imports

Use direct imports (no barrel files):

```typescript
// Good
import { PropertyCard } from "@/features/property-details/components/property-card";

// Bad (no index.ts barrel)
import { PropertyCard } from "@/features/property-details/components";
```

## Current Work in Progress

### Completed/In Progress

1. **Invite Flow** - Fixed signup flow for invited users (see `.cursor/plans/fix_invite_flow_7c48377c.plan.md`)
2. **Export Functionality** - PDF/CSV/XLS export for collections (see `.cursor/plans/implement_collection_export_functionality_82025a76.plan.md`)
3. **Hardcoded Values Cleanup** - Ongoing refactor to use constants (see `HARDCODED_VALUES_AUDIT.md`)

### Pending Git Changes

Check `git status` for uncommitted changes:

- Modified: `app-sidebar.tsx`, `routes.ts`, `proxy.ts`, `settings-tabs.tsx`
- New files: `roles.constants.ts`, `onboarding.utils.ts`, `HARDCODED_VALUES_AUDIT.md`

## API Communication

The app communicates with a separate backend API via `src/lib/fetch-with-auth.ts`:

```typescript
import { fetchWithAuth } from "@/lib/fetch-with-auth";

const data = await fetchWithAuth("/properties", {
  method: "POST",
  body: JSON.stringify(payload),
});
```

API base URL configured in `src/config/api.ts`.

## Key Files Reference

| File                                     | Purpose                           |
| ---------------------------------------- | --------------------------------- |
| `src/proxy.ts`                           | API proxy logic, request handling |
| `src/lib/auth.ts`                        | Auth utilities                    |
| `src/lib/permissions.ts`                 | Permission checking utilities     |
| `src/lib/onboarding.utils.ts`            | Onboarding route determination    |
| `src/config/routes.ts`                   | All application routes            |
| `src/constants/permissions.constants.ts` | Capabilities & role mappings      |
| `src/constants/user-types.constants.ts`  | Organization types                |
| `src/constants/roles.constants.ts`       | User & org roles                  |

## Testing

No test framework currently configured. Consider adding:

- Vitest for unit tests
- Playwright for E2E tests

## Deployment

The project is designed for Vercel deployment. Ensure all `NEXT_PUBLIC_*` environment variables are configured in the deployment environment.

## Contact / Resources

- Backend API: Separate repository (check with team for access)
- Supabase Project: Check with team for dashboard access
- Design System: Uses shadcn/ui components

---

_Last updated: January 2026_
