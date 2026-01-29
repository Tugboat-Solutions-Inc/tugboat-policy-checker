# Hardcoded Values Audit

## Summary

Found several categories of hardcoded values across the codebase. Below is a breakdown with recommendations.

---

## ✅ Already Centralized

### User Types (Org Types)
**Location**: `src/constants/user-types.ts`
```typescript
export const USER_TYPES = {
  INDIVIDUAL: "INDIVIDUAL",
  MULTI_TENANT: "MULTI_TENANT",
  COMPANY: "COMPANY",
}
```
**Status**: ✅ Well-used throughout codebase

### Capabilities/Permissions
**Location**: `src/constants/permissions.constants.ts`
**Status**: ✅ Well-defined and used

---

## ✅ Newly Created

### Organization & User Roles
**Location**: `src/constants/roles.constants.ts`
```typescript
export const ORG_ROLES = { ADMIN: "ADMIN", MEMBER: "MEMBER" }
export const ACCESS_TYPES = { EDITOR: "EDITOR", VIEWER: "VIEWER" }
export const USER_ROLES = { ADMIN: "ADMIN", USER: "USER" }
```

### Onboarding Routes
**Location**: `src/lib/onboarding.utils.ts`
- Centralized `getOnboardingRoute()` function
- Uses `ORG_TYPES` and `ORG_ROLES` constants
- Replaced 3 duplicate implementations

---

## 🟡 Recommendations for Further Cleanup (Optional)

### 1. Access Types (EDITOR/VIEWER) - ~16 remaining files
**Current State**: Partially updated
**Completed**: Core files (property-details-page, utils, property-access.utils)
**Remaining**: Tenant dashboard components, sidebar modals

**Remaining high-impact files**:
- `src/features/tenant-dashboard/components/*`
- `src/components/common/sidebar-property-dropdown/use-property-modal.tsx`

### 2. Organization Roles (ADMIN/MEMBER) - ~32 remaining files
**Current State**: Partially updated
**Completed**: Core files (proxy, app-sidebar, settings-tabs, utils)
**Remaining**: Various dashboard components, organization management

**Remaining files**:
- `src/features/organizations/components/*`
- `src/features/property-details/components/user-row.tsx`
- Dashboard page files

### 3. Role Labels (UI Text)
**Current State**: Hardcoded strings like "Team Member", "Can Edit", "Can View"
**Files**: 
- `src/features/organizations/components/organization-user-row.tsx`
- `src/features/property-details/components/user-row.tsx`
- `src/features/tenant-dashboard/components/unit-details/tenant-row.tsx`

**Recommendation**: Create a `ROLE_LABELS` constant:
```typescript
export const ROLE_LABELS = {
  ADMIN: "Admin",
  MEMBER: "Team Member",
  EDITOR: "Can Edit",
  VIEWER: "Can View",
}
```

### 4. Permission Strings ("edit", "view")
**Current State**: Converting between "edit"/"view" and "EDITOR"/"VIEWER"
**Files**: Multiple invite/permission handlers

**Example Pattern**:
```typescript
access_type: invite.permission === "edit" ? "EDITOR" : "VIEWER"
```

**Recommendation**: Create conversion utilities or use constants directly

---

## 📊 Impact Analysis

| Constant Type | Original | Completed | Remaining | Priority |
|---------------|----------|-----------|-----------|----------|
| ACCESS_TYPES (EDITOR/VIEWER) | ~22 | 6 core files | ~16 | Medium |
| ORG_ROLES (ADMIN/MEMBER) | ~38 | 6 core files | ~32 | Low (core done) |
| Role Labels (UI) | ~10 | 0 | ~10 | Low |
| Permission mappings | ~8 | 1 | ~7 | Low |

**✅ High-priority core files complete!** Remaining files can be updated gradually as you touch them.

---

## 🎯 Next Steps (Optional)

1. **Low Priority**: Update tenant dashboard components to use `ACCESS_TYPES`
2. **Low Priority**: Update organization management components to use `ORG_ROLES`
3. **Optional**: Centralize UI label strings
4. **Optional**: Create permission mapping utilities

**Recommendation**: Update remaining files gradually as you work on them ("fix on touch" approach).

---

## ✅ Completed Refactorings

1. ✅ Created `src/constants/roles.constants.ts`
2. ✅ Updated `src/lib/onboarding.utils.ts` to use centralized constants
3. ✅ Removed 3 duplicate `getOnboardingRoute()` implementations
4. ✅ Fixed hardcoded `/auth/callback` and `/invite` routes
5. ✅ Replaced switch statement with mapping object
6. ✅ **Updated high-priority core files**:
   - ✅ `src/proxy.ts` - Uses `USER_ROLES.ADMIN`
   - ✅ `src/features/property-details/utils/property-access.utils.ts` - Uses `ORG_ROLES.ADMIN`, `ACCESS_TYPES.EDITOR`
   - ✅ `src/components/common/app-sidebar.tsx` - Uses `USER_ROLES.ADMIN`, `ORG_ROLES.ADMIN`
   - ✅ `src/features/property-details/components/property-details-page.tsx` - Uses `ACCESS_TYPES.EDITOR/VIEWER`
   - ✅ `src/features/settings/components/settings-tabs.tsx` - Uses `ORG_ROLES.ADMIN`
   - ✅ `src/lib/utils.ts` - Uses `ORG_ROLES.ADMIN`, `ACCESS_TYPES.EDITOR`

---

## Notes

- `USER_TYPES` already exists and is well-adopted
- Most hardcoded values follow consistent patterns
- No critical bugs, just maintainability improvements
- Gradual migration is recommended (update on touch)
