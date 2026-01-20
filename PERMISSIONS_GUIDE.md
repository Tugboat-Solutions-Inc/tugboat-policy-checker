# Permissions System Guide

## Overview

This permissions system provides a capability-based approach to access control. Instead of passing boolean flags like `viewOnly` around, components check specific capabilities like `can('edit_property')`.

### Key Benefits

- **Semantic**: `can('edit_property')` is clearer than `!viewOnly`
- **Extensible**: Add new roles without changing UI code
- **Centralized**: All permission logic lives in one place
- **Type-safe**: Full TypeScript support
- **Secure**: Default-deny - missing access = no capabilities

## Architecture

### 1. Capabilities (What users can do)

Defined in `src/constants/permissions.constants.ts`:

```typescript
export const CAPABILITIES = {
  VIEW_PROPERTY: "view_property",
  EDIT_PROPERTY: "edit_property",
  DELETE_PROPERTY: "delete_property",
  MANAGE_USERS: "manage_users",
  VIEW_COLLECTIONS: "view_collections",
  CREATE_COLLECTIONS: "create_collections",
  EDIT_COLLECTIONS: "edit_collections",
  DELETE_COLLECTIONS: "delete_collections",
  UPLOAD_MEDIA: "upload_media",
  DELETE_MEDIA: "delete_media",
} as const;
```

### 2. Roles (User access levels)

Defined in `src/features/property-details/types/property-access.types.ts`:

```typescript
export type AccessType = "EDITOR" | "VIEWER";
```

### 3. Role-to-Capability Mapping

Maps roles to their capabilities in `src/constants/permissions.constants.ts`:

```typescript
export const ROLE_CAPABILITIES = {
  VIEWER: [
    CAPABILITIES.VIEW_PROPERTY,
    CAPABILITIES.VIEW_COLLECTIONS,
  ],
  EDITOR: [
    CAPABILITIES.VIEW_PROPERTY,
    CAPABILITIES.EDIT_PROPERTY,
    CAPABILITIES.VIEW_COLLECTIONS,
    CAPABILITIES.CREATE_COLLECTIONS,
    CAPABILITIES.EDIT_COLLECTIONS,
    CAPABILITIES.DELETE_COLLECTIONS,
    CAPABILITIES.UPLOAD_MEDIA,
    CAPABILITIES.DELETE_MEDIA,
    CAPABILITIES.MANAGE_USERS,
  ],
};
```

## Usage

### Server Component (Fetch Permissions)

In your page component, fetch permissions and pass to provider:

```typescript
import { getPropertyPermissions } from "@/features/property-details/api/property-permissions.actions";
import { PermissionsProvider } from "@/components/common/permissions-provider";

export default async function PropertyPage({ params }) {
  const { propertyId } = await params;
  
  const permissionsResult = await getPropertyPermissions(propertyId);
  const capabilities = permissionsResult.success ? permissionsResult.data : [];

  return (
    <PermissionsProvider capabilities={capabilities}>
      <YourPageContent />
    </PermissionsProvider>
  );
}
```

### Client Component (Check Permissions)

Use the `usePermissions` hook in client components:

```typescript
"use client";

import { usePermissions } from "@/components/common/permissions-provider";
import { CAPABILITIES } from "@/constants/permissions.constants";

export function MyComponent() {
  const { can, canAny, canAll } = usePermissions();

  return (
    <div>
      {can(CAPABILITIES.EDIT_PROPERTY) && (
        <EditButton />
      )}
      
      {can(CAPABILITIES.DELETE_PROPERTY) && (
        <DeleteButton />
      )}
      
      {canAny(CAPABILITIES.EDIT_PROPERTY, CAPABILITIES.MANAGE_USERS) && (
        <AdminPanel />
      )}
      
      {canAll(CAPABILITIES.EDIT_COLLECTIONS, CAPABILITIES.DELETE_COLLECTIONS) && (
        <AdvancedCollectionTools />
      )}
    </div>
  );
}
```

### API Reference

#### `usePermissions()` Hook

Returns an object with:

- **`can(capability)`**: Check single capability
  ```typescript
  if (can(CAPABILITIES.EDIT_PROPERTY)) {
    // User can edit
  }
  ```

- **`canAny(...capabilities)`**: Check if user has ANY of the capabilities
  ```typescript
  if (canAny(CAPABILITIES.EDIT_PROPERTY, CAPABILITIES.MANAGE_USERS)) {
    // User has at least one capability
  }
  ```

- **`canAll(...capabilities)`**: Check if user has ALL capabilities
  ```typescript
  if (canAll(CAPABILITIES.EDIT_COLLECTIONS, CAPABILITIES.DELETE_COLLECTIONS)) {
    // User has both capabilities
  }
  ```

- **`capabilities`**: Array of all user capabilities
  ```typescript
  console.log(capabilities); // ['view_property', 'edit_property', ...]
  ```

## Real-World Examples

### Example 1: Conditional Header Actions

```typescript
"use client";

import { usePermissions } from "@/components/common/permissions-provider";
import { CAPABILITIES } from "@/constants/permissions.constants";
import Header from "@/components/common/header/header";
import { ExportButton } from "@/components/common/header/export-button";
import { ShareButton } from "@/components/common/header/share-button";

export function PropertyHeader() {
  const { can } = usePermissions();

  return (
    <Header title="Property Dashboard">
      {can(CAPABILITIES.EDIT_PROPERTY) && <ExportButton />}
      {can(CAPABILITIES.MANAGE_USERS) && <ShareButton />}
    </Header>
  );
}
```

### Example 2: Disable Form Inputs

```typescript
"use client";

import { usePermissions } from "@/components/common/permissions-provider";
import { CAPABILITIES } from "@/constants/permissions.constants";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export function PropertyForm() {
  const { can } = usePermissions();
  const canEdit = can(CAPABILITIES.EDIT_PROPERTY);

  return (
    <form>
      <Input 
        name="propertyName"
        disabled={!canEdit}
      />
      <Button type="submit" disabled={!canEdit}>
        Save Changes
      </Button>
    </form>
  );
}
```

### Example 3: Role-Based UI Sections

```typescript
"use client";

import { usePermissions } from "@/components/common/permissions-provider";
import { CAPABILITIES } from "@/constants/permissions.constants";

export function PropertySettings() {
  const { can, canAny } = usePermissions();

  return (
    <div>
      <h2>Settings</h2>
      
      {can(CAPABILITIES.EDIT_PROPERTY) && (
        <section>
          <h3>Property Details</h3>
          <PropertyDetailsForm />
        </section>
      )}
      
      {can(CAPABILITIES.MANAGE_USERS) && (
        <section>
          <h3>User Management</h3>
          <UserManagementPanel />
        </section>
      )}
      
      {canAny(CAPABILITIES.UPLOAD_MEDIA, CAPABILITIES.DELETE_MEDIA) && (
        <section>
          <h3>Media Library</h3>
          <MediaManagement />
        </section>
      )}
    </div>
  );
}
```

## Adding New Capabilities

### Step 1: Define the Capability

Add to `src/constants/permissions.constants.ts`:

```typescript
export const CAPABILITIES = {
  // ... existing
  EXPORT_REPORTS: "export_reports",
  MANAGE_FINANCES: "manage_finances",
} as const;
```

### Step 2: Map to Roles

Update `ROLE_CAPABILITIES`:

```typescript
export const ROLE_CAPABILITIES = {
  VIEWER: [
    CAPABILITIES.VIEW_PROPERTY,
    CAPABILITIES.VIEW_COLLECTIONS,
  ],
  EDITOR: [
    // ... existing capabilities
    CAPABILITIES.EXPORT_REPORTS,
  ],
  // New role
  ADMIN: [
    // ... all capabilities
    CAPABILITIES.MANAGE_FINANCES,
  ],
};
```

### Step 3: Use in Components

```typescript
{can(CAPABILITIES.EXPORT_REPORTS) && <ExportReportsButton />}
```

That's it! No need to update existing code - the new capability is automatically available through the `usePermissions` hook.

## Adding New Roles

### Step 1: Define the Role

Update `src/features/property-details/types/property-access.types.ts`:

```typescript
export type AccessType = "EDITOR" | "VIEWER" | "CONTRIBUTOR";
```

### Step 2: Map Capabilities

Add to `ROLE_CAPABILITIES` in `src/constants/permissions.constants.ts`:

```typescript
export const ROLE_CAPABILITIES = {
  VIEWER: [...],
  EDITOR: [...],
  CONTRIBUTOR: [
    CAPABILITIES.VIEW_PROPERTY,
    CAPABILITIES.VIEW_COLLECTIONS,
    CAPABILITIES.EDIT_COLLECTIONS,
    CAPABILITIES.UPLOAD_MEDIA,
  ],
};
```

### Step 3: Update Backend

Ensure your backend/database recognizes the new role type.

That's it! All UI components will automatically respect the new role's capabilities.

## Security Considerations

### Default-Deny

If permissions fail to load or user has no access entry:

```typescript
capabilities = []  // Empty array = no capabilities
```

This means:
- `can(anything)` returns `false`
- UI hides all protected actions
- Safe fallback when permission data is missing

### Server-Side Enforcement

⚠️ **IMPORTANT**: The permissions system controls UI visibility only.

**You MUST also enforce permissions on the backend:**

```typescript
// Backend API route
export async function updateProperty(propertyId: string, data: any) {
  const permissions = await getPropertyPermissions(propertyId);
  
  if (!permissions.data.includes(CAPABILITIES.EDIT_PROPERTY)) {
    throw new Error("Unauthorized");
  }
  
  // Proceed with update
}
```

Never rely solely on frontend permission checks for security.

## Migration from Boolean Flags

### Before (Boolean Pattern)

```typescript
// Server
const viewOnly = isMyUserViewOnly(propertyAccess, userId);

// Client
<MyComponent viewOnly={viewOnly} />

// Usage
{!viewOnly && <EditButton />}
```

### After (Capability Pattern)

```typescript
// Server
const capabilities = await getPropertyPermissions(propertyId);

// Client
<PermissionsProvider capabilities={capabilities.data}>
  <MyComponent />
</PermissionsProvider>

// Usage
const { can } = usePermissions();
{can(CAPABILITIES.EDIT_PROPERTY) && <EditButton />}
```

### Benefits of Migration

1. **More semantic**: `can('edit_property')` vs `!viewOnly`
2. **Granular control**: Check specific actions, not broad "read" vs "write"
3. **Easier testing**: Mock specific capabilities
4. **Future-proof**: Add new capabilities without refactoring

## Troubleshooting

### Error: "usePermissions must be used within a PermissionsProvider"

**Solution**: Wrap your component tree with `PermissionsProvider`:

```typescript
<PermissionsProvider capabilities={capabilities}>
  <YourComponent />
</PermissionsProvider>
```

### User Has No Permissions

If `capabilities` is an empty array:

1. **Check server response**: Is `getPropertyPermissions` succeeding?
2. **Check user access**: Does user have an entry in property access list?
3. **Check role mapping**: Is user's role mapped in `ROLE_CAPABILITIES`?

### Permission Check Not Working

```typescript
// ❌ Wrong - string literal
can("edit_property")

// ✅ Correct - use constant
can(CAPABILITIES.EDIT_PROPERTY)
```

Always use the `CAPABILITIES` constants to avoid typos and get TypeScript autocomplete.

## Testing

### Unit Tests

```typescript
import { render, screen } from '@testing-library/react';
import { PermissionsProvider } from '@/components/common/permissions-provider';
import { CAPABILITIES } from '@/constants/permissions.constants';
import { MyComponent } from './MyComponent';

test('shows edit button for editors', () => {
  render(
    <PermissionsProvider capabilities={[CAPABILITIES.EDIT_PROPERTY]}>
      <MyComponent />
    </PermissionsProvider>
  );
  
  expect(screen.getByText('Edit')).toBeInTheDocument();
});

test('hides edit button for viewers', () => {
  render(
    <PermissionsProvider capabilities={[CAPABILITIES.VIEW_PROPERTY]}>
      <MyComponent />
    </PermissionsProvider>
  );
  
  expect(screen.queryByText('Edit')).not.toBeInTheDocument();
});
```

### Integration Tests

Test with realistic role combinations:

```typescript
const editorCapabilities = ROLE_CAPABILITIES.EDITOR;
const viewerCapabilities = ROLE_CAPABILITIES.VIEWER;

test('editor can perform all actions', () => {
  render(
    <PermissionsProvider capabilities={editorCapabilities}>
      <PropertyPage />
    </PermissionsProvider>
  );
  
  expect(screen.getByText('Edit')).toBeInTheDocument();
  expect(screen.getByText('Delete')).toBeInTheDocument();
  expect(screen.getByText('Share')).toBeInTheDocument();
});
```

## Summary

The permissions system provides:

✅ **Capability-based** access control  
✅ **Type-safe** with TypeScript  
✅ **Extensible** - add roles/capabilities easily  
✅ **Testable** - mock permissions in tests  
✅ **Secure** - default-deny policy  
✅ **Semantic** - clear, readable code  

Use `getPropertyPermissions` on the server, wrap with `PermissionsProvider`, and check capabilities with `usePermissions` hook in client components.

