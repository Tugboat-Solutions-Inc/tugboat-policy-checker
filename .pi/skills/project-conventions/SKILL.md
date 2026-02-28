---
name: project-conventions
description: Always load at session start. Architecture, workflow rules, and conventions for the Tugboat Portal full build.
---

# Project Conventions — Tugboat Portal (tugboat-Aaron-build)

## What This Is

This is the **Tugboat Portal** — a property inventory management app (the "IMA") that is being expanded into the full Tugboat platform, replacing Noloco. This branch (`tugboat-Aaron-build`) is Aaron's side build for that work. It must NEVER affect the production `main` branch until explicitly merged.

## The Big Picture

### What exists today (production, on `main`)
- **Inventory Mini App (IMA)**: Users upload photos, AI generates item catalogs with brands, categories, conditions, estimated costs.
- **Auth & user management**: Supabase auth with JWT custom claims. Three user types: Individual, Multi-Tenant, Company. Role-based permissions (ADMIN/MEMBER, EDITOR/VIEWER).
- **Multi-tenant architecture**: Organizations → Properties → Units → Collections → Items. Property-level access control.
- **Live deployment**: `tugboat-portal.vercel.app` on Vercel.

### What we're building (on this branch)
- Integrating Tugbot's AI claims advocacy features into the portal
- Replacing Noloco as the primary client-facing platform
- Building claims management, messaging, document analysis, and correspondence features accessible through the portal's existing auth and user model

### Related systems
- **Tugbot** (`Tugboat-Solutions-Inc/tugbot`): AI claims advocacy pipeline. Separate repo, separate Vercel deployment. Two-pass LLM pipeline (content analysis → delivery voice). Currently standalone — will eventually be called from this portal.
- **Noloco**: Current client-facing platform being replaced. GraphQL API, client data, comments, documents. Tugbot reads from it today.
- **Backend API**: A separate backend service (NOT in this repo, NOT in the GitHub org). The portal is a frontend-only app — all data operations go through `NEXT_PUBLIC_API_URL`. The backend handles AI photo processing, item catalog generation, deduplication, exports. **Aaron needs to get access to this repo and a staging URL from the dev team.**

## Architecture

### Tech stack
- **Framework**: Next.js 16 (App Router, Turbopack)
- **Auth**: Supabase (PostgreSQL) — used ONLY for auth, not direct DB access. JWT tokens with custom claims (orgs, roles, user type, onboarding status).
- **Data**: All data flows through the backend API via `fetchWithAuth()` with Supabase JWT Bearer tokens.
- **UI**: Tailwind CSS 4 + shadcn/ui components in `src/components/ui/`
- **State**: Zustand stores in `src/stores/`
- **Forms**: React Hook Form + Zod validation
- **Tables**: TanStack Table
- **Storage**: BunnyCDN (images/video via `NEXT_PUBLIC_STORAGE_URL`), Supabase storage for other files
- **Package manager**: pnpm

### Key architectural patterns

**Parallel routes for user types:**
```
src/app/dashboard/
├── layout.tsx          # Selects slot based on org type
├── @individual/        # Individual user views
├── @multiTenant/       # Multi-tenant views
└── @company/           # Company views
```

**Feature modules** (self-contained):
```
src/features/{feature}/
├── api/          # Server actions (*-actions.ts)
├── components/   # Feature-specific components
├── config/       # Feature configuration
├── hooks/        # Feature-specific hooks
├── schemas/      # Zod validation schemas
├── types/        # TypeScript types
└── utils/        # Feature utilities
```

**Data model:**
- Organizations → Properties → Units → Collections → Items
- Users belong to organizations with roles (ADMIN/MEMBER)
- Property access is per-user with access types (EDITOR/VIEWER)
- Capability-based permissions: `can('edit_property')`, `canAny(...)`, `canAll(...)`

### Environment variables (all required)
| Variable | Purpose |
|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase project URL (auth) |
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | Supabase anon key |
| `NEXT_PUBLIC_BASE_URL` | This app's URL (e.g. `http://localhost:3000`) |
| `NEXT_PUBLIC_API_URL` | Backend API URL — all data operations |
| `NEXT_PUBLIC_STORAGE_URL` | BunnyCDN URL for images |
| `NEXT_PUBLIC_BUNNY_STREAM_LIBRARY_ID` | Bunny video streaming library |
| `NEXT_PUBLIC_GOOGLE_PLACES_API` | Google Places API key (address autocomplete) |
| `NEXT_PUBLIC_GOOGLE_PLACES_URL` | Google Places API URL |

## Dev Environment Setup (NOT YET COMPLETE)

### What's needed before running locally
1. **Separate Supabase project** for dev — do NOT use production Supabase. Needs the same custom JWT claims setup (orgs, roles, etc.) as production.
2. **Backend API staging URL** — ask the dev team. Without this, no data operations work.
3. **BunnyCDN** — can share production for reads during dev, but writes would need a separate zone.
4. **Google Places** — same API key is fine, it's stateless.

### Status
- ⬜ Supabase dev project — not yet created
- ⬜ Backend API access — Aaron needs to request repo + staging URL from dev team
- ⬜ `.env.local` — intentionally not created yet (keeps branch inert and safe)
- ✅ Branch created and pushed (`tugboat-Aaron-build`)
- ✅ Local clone at `~/tugboat-portal`

## Code Conventions

### File naming
Always prefix with feature name: `property-details.types.ts`, not `types.ts`.

### No barrel files
Use direct imports: `import { X } from "@/features/foo/components/foo-card"`, not from `index.ts`.

### No comments
Do not add comments unless explicitly requested.

### Routes
Always use `ROUTES` from `src/config/routes.ts`:
```typescript
import { ROUTES } from "@/config/routes";
router.push(ROUTES.DASHBOARD.ROOT);
```

### Type constants
Use constants, not string literals:
```typescript
import { USER_TYPES } from "@/constants/user-types";
import { ACCESS_TYPES } from "@/constants/roles.constants";
```

### Auth access
```typescript
import { useCurrentUser, useCurrentOrg, useOrgType } from "@/hooks/use-auth";
const user = useCurrentUser();
const orgType = useOrgType(); // "INDIVIDUAL" | "MULTI_TENANT" | "COMPANY"
```

### Permissions
```typescript
import { usePermissions } from "@/components/common/permissions-provider";
import { CAPABILITIES } from "@/constants/permissions.constants";
const { can } = usePermissions();
if (can(CAPABILITIES.EDIT_PROPERTY)) { /* ... */ }
```

## Git

- **Work on `tugboat-Aaron-build` only.** Do not touch `main`. Do not merge to `main` without Aaron's explicit decision.
- **Always pull before starting work.** `git pull origin tugboat-Aaron-build`
- **Commit and push together.** Never leave local-only commits.
- Commit messages: conventional commits (`feat:`, `fix:`, `refactor:`, `docs:`, `chore:`).
- Do not commit `.env.local`, `node_modules/`, `.next/`, or build artifacts.

## Key Files Reference

| File | Purpose |
|---|---|
| `src/proxy.ts` | Middleware — auth routing, onboarding redirects, protected routes |
| `src/lib/auth.ts` | Server-side auth utilities, JWT decoding, account type resolution |
| `src/lib/fetch-with-auth.ts` | Authenticated API calls to backend |
| `src/lib/client-upload.ts` | Client-side photo upload with compression, batching, dedup |
| `src/lib/permissions.ts` | Permission checking logic |
| `src/lib/jwt.ts` | JWT decode utilities |
| `src/lib/env.ts` | Zod-validated environment variables |
| `src/config/routes.ts` | All application routes (`ROUTES` constant) |
| `src/config/api.ts` | All backend API endpoints (`API_ENDPOINTS` constant) |
| `src/constants/permissions.constants.ts` | Capabilities and role-to-capability mappings |
| `src/constants/roles.constants.ts` | ORG_ROLES, ACCESS_TYPES, USER_ROLES |
| `src/constants/user-types.ts` | USER_TYPES (INDIVIDUAL, MULTI_TENANT, COMPANY) |
| `db.sql` | Database schema reference (context only, not executable) |

## Action Items Before Building

1. **Ask dev team for**: backend API repo access + staging API URL
2. **Create**: Supabase dev project (free tier) with matching JWT custom claims
3. **Create**: `.env.local` pointing at dev Supabase + staging API
4. **Run**: `pnpm install && pnpm dev` to verify local setup
5. **Then**: Start building on `tugboat-Aaron-build`
