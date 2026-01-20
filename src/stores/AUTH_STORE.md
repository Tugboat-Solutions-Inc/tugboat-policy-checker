# Auth Store Documentation

## Overview

The auth store provides a centralized way to manage decoded JWT token data across the application. When a user logs in, their access token is automatically decoded and stored in Zustand with persistence.

## Setup

The auth store is automatically initialized via the `AuthProvider` component in the root layout. No manual setup is required.

## Store Structure

### State

```typescript
interface AuthState {
  decodedToken: DecodedJWT | null;
  isAuthenticated: boolean;
}
```

### Actions

- `setDecodedToken(token: DecodedJWT)` - Store decoded JWT data
- `clearAuth()` - Clear all auth data (called on logout)
- `getCurrentOrg()` - Get the current organization (first org in the list)

## Usage

### 1. Using the Raw Store

```typescript
import { useAuthStore } from "@/stores/auth-store";

function MyComponent() {
  const decodedToken = useAuthStore((state) => state.decodedToken);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  return (
    <div>
      {isAuthenticated && <p>Welcome, {decodedToken?.email}</p>}
    </div>
  );
}
```

### 2. Using Helper Hooks (Recommended)

```typescript
import {
  useCurrentUser,
  useCurrentOrg,
  useIsAuthenticated,
  useUserRole,
  useOrgType,
  useAllOrgs,
} from "@/hooks/use-auth";

function MyComponent() {
  const user = useCurrentUser();
  const currentOrg = useCurrentOrg();
  const isAuthenticated = useIsAuthenticated();
  const userRole = useUserRole();
  const orgType = useOrgType();
  const allOrgs = useAllOrgs();

  return (
    <div>
      <p>Name: {user?.fullName}</p>
      <p>Email: {user?.email}</p>
      <p>Role: {userRole}</p>
      <p>Organization: {currentOrg?.org_name}</p>
      <p>Org Type: {orgType}</p>
    </div>
  );
}
```

## Available User Data

The decoded token contains:

- `sub` - User ID
- `email` - User email
- `first_name` - First name
- `last_name` - Last name
- `phone` - Phone number
- `role` - User role (e.g., "ADMIN")
- `profile_picture_url` - Profile picture URL
- `onboarding_complete` - Whether onboarding is complete
- `orgs` - Array of organizations the user belongs to

## Organization Data

Each organization includes:

- `org_id` - Organization ID
- `org_name` - Organization name
- `org_type` - Type: "INDIVIDUAL", "MULTI_TENANT", or "COMPANY"
- `org_logo_url` - Organization logo URL
- `owner` - Whether the user is the owner
- `role` - User's role in the organization

## Automatic Features

1. **Auto-sync on login** - Token is decoded and stored when user logs in
2. **Auto-refresh** - Token is updated when Supabase refreshes the session
3. **Auto-clear on logout** - Store is cleared when user logs out
4. **Persistence** - Token data persists across browser sessions
5. **Expiration check** - Automatically signs out if token is expired

## Token Expiration

The store automatically checks token expiration. If the token is expired, it will:

1. Clear the auth store
2. Sign the user out via Supabase

## Manual Operations

### Manually Clear Auth

```typescript
import { useAuthStore } from "@/stores/auth-store";

function LogoutButton() {
  const clearAuth = useAuthStore((state) => state.clearAuth);

  const handleLogout = async () => {
    clearAuth();
  };

  return <button onClick={handleLogout}>Logout</button>;
}
```

### Access Raw JWT Data

```typescript
import { useAuthStore } from "@/stores/auth-store";

function TokenInfo() {
  const token = useAuthStore((state) => state.decodedToken);

  return (
    <div>
      <p>Token issued at: {new Date(token.iat * 1000).toLocaleString()}</p>
      <p>Token expires at: {new Date(token.exp * 1000).toLocaleString()}</p>
    </div>
  );
}
```

## Dependencies

- `jwt-decode` - For decoding JWT tokens
- `zustand` - State management
- `zustand/middleware` - For persistence

Make sure to install jwt-decode:

```bash
npm install jwt-decode
```
