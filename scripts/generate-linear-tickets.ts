#!/usr/bin/env tsx

import { readdir, readFile } from "fs/promises";
import { join } from "path";

interface TicketDefinition {
  title: string;
  description: string;
  priority: 1 | 2 | 3 | 4;
  labels?: string[];
  backendEndpoints: string[];
  frontendFiles?: string[];
  implementationNotes: string;
}

const MISSING_FEATURES: TicketDefinition[] = [
  {
    title: "Fix OAuth Callback Route (Critical)",
    description: `Restore the OAuth callback route handler that was deleted. This is blocking social login (Google/Apple).

## Problem
- Files \`src/app/auth/callback/route.ts\` and \`src/app/auth/auth-code-error/page.tsx\` were deleted
- OAuth flow is broken - users can't complete social login

## Requirements
1. Restore \`src/app/auth/callback/route.ts\`:
   - Exchange OAuth code for session using \`supabase.auth.exchangeCodeForSession\`
   - Handle cookies correctly with \`createServerClient\` from \`@supabase/ssr\`
   - Redirect to dashboard on success, error page on failure
   - Use \`ROUTES.AUTH.CALLBACK\` from \`src/config/routes.ts\`

2. Restore \`src/app/auth/auth-code-error/page.tsx\`:
   - Simple error page for OAuth failures
   - Link back to login page

3. Ensure \`proxy.ts\` includes both routes in \`publicRoutes\`

## Reference
- Previous implementation handled session persistence correctly
- Must work for both production and staging Supabase projects`,
    priority: 1,
    labels: ["bug", "critical", "auth"],
    backendEndpoints: [],
    frontendFiles: [
      "src/app/auth/callback/route.ts",
      "src/app/auth/auth-code-error/page.tsx",
      "src/proxy.ts",
    ],
    implementationNotes: "This is a restore task - check git history for previous implementation",
  },
  {
    title: "Implement Invite System Frontend",
    description: `Implement the complete invite system for property access and organization invites.

## Backend Endpoints (from Bruno docs)
- \`GET /api/v1/invites/:token\` - Get invite by token
- \`POST /api/v1/organizations/:organizationId/invite\` - Invite user to organization
- \`POST /api/v1/properties/:propertyId/access/invites\` - Create property access invites

## Current Status
- Backend endpoints exist and are documented
- Frontend has no invite acceptance flow
- No UI for viewing/managing invites

## Requirements
1. Create \`src/features/invites/api/invite.actions.ts\`:
   - \`getInviteByToken(token: string)\` - Fetch invite details
   - \`acceptInvite(token: string)\` - Accept invite (property or org)

2. Create \`src/features/invites/components/invite-accept-page.tsx\`:
   - Display invite details (who invited, what property/org)
   - Accept/decline buttons
   - Handle loading and error states

3. Add route \`/invite/:token\` in \`src/app/invite/[token]/page.tsx\`
   - Server component that fetches invite
   - Passes data to client component

4. Update \`src/config/routes.ts\` with invite routes

5. Add invite management UI (if needed):
   - View pending invites
   - Resend invites
   - Cancel invites

## Reference Files
- \`backend/docs/API/Invites/Get invite by token.bru\`
- \`backend/docs/API/Organizations/Invite user by email.bru\`
- \`backend/docs/API/Properties/Property access/Create property access invites by property ID.bru\``,
    priority: 2,
    labels: ["feature", "invites", "high-priority"],
    backendEndpoints: [
      "GET /api/v1/invites/:token",
      "POST /api/v1/organizations/:organizationId/invite",
      "POST /api/v1/properties/:propertyId/access/invites",
    ],
    frontendFiles: [
      "src/features/invites/api/invite.actions.ts",
      "src/features/invites/components/invite-accept-page.tsx",
      "src/app/invite/[token]/page.tsx",
    ],
    implementationNotes: "Follow existing auth patterns. Check if invite tokens are JWT or UUIDs.",
  },
  {
    title: "Implement Organization Users Management",
    description: `Implement full CRUD for organization users management.

## Backend Endpoints (from Bruno docs)
- \`GET /api/v1/organizations/:organizationId/users\` - List org users
- \`PUT /api/v1/organizations/:organizationId/users/:userId\` - Update user role
- \`DELETE /api/v1/organizations/:organizationId/users/:userId\` - Remove user

## Current Status
- Backend endpoints exist
- Frontend has partial implementation in \`src/config/api.ts\` (endpoints defined)
- No UI for managing organization users

## Requirements
1. Create \`src/features/organizations/api/organization-users.actions.ts\`:
   - \`getOrganizationUsers(organizationId: string)\`
   - \`updateOrganizationUser(organizationId: string, userId: string, role: OrganizationUserRole)\`
   - \`deleteOrganizationUser(organizationId: string, userId: string)\`

2. Create \`src/features/organizations/components/organization-users-section.tsx\`:
   - Display list of users with roles
   - Edit role dropdown
   - Remove user button
   - Add user button (invite)

3. Add to settings page or create dedicated org management page

4. Types:
   - \`OrganizationUserRole\` enum: \`"ADMIN" | "MEMBER"\`
   - \`OrganizationUser\` type matching backend response

## Reference Files
- \`backend/docs/API/Organizations/Organization users/\`
- \`src/config/api.ts\` (endpoints already defined)
- \`src/features/property-details/components/user-management-section.tsx\` (similar pattern)`,
    priority: 2,
    labels: ["feature", "organizations", "high-priority"],
    backendEndpoints: [
      "GET /api/v1/organizations/:organizationId/users",
      "PUT /api/v1/organizations/:organizationId/users/:userId",
      "DELETE /api/v1/organizations/:organizationId/users/:userId",
    ],
    frontendFiles: [
      "src/features/organizations/api/organization-users.actions.ts",
      "src/features/organizations/components/organization-users-section.tsx",
    ],
    implementationNotes: "Follow pattern from property access user management. Check permissions for org admin vs member.",
  },
  {
    title: "Implement Item Images API",
    description: `Implement item images (additional photos) management.

## Backend Endpoints (from Bruno docs)
- \`GET /api/v1/properties/:propertyId/units/:unitId/collections/:collectionId/items/:itemId/images\` - Get item images
- \`POST /api/v1/properties/:propertyId/units/:unitId/collections/:collectionId/items/:itemId/images\` - Add item image
- \`DELETE /api/v1/properties/:propertyId/units/:unitId/collections/:collectionId/items/:itemId/images/:imageId\` - Delete item image

## Current Status
- Backend endpoints exist
- Frontend has no implementation
- Items only show single \`photo_url\`, but backend supports \`AdditionalPhotos\` array

## Requirements
1. Add endpoints to \`src/config/api.ts\`:
   - \`ITEM_IMAGES\`, \`ITEM_IMAGES_ADD\`, \`ITEM_IMAGES_DELETE\`

2. Create \`src/features/collection-details/api/item-images.actions.ts\`:
   - \`getItemImages(propertyId, unitId, collectionId, itemId)\`
   - \`addItemImage(propertyId, unitId, collectionId, itemId, imageFile)\`
   - \`deleteItemImage(propertyId, unitId, collectionId, itemId, imageId)\`

3. Update \`ItemDetailsSheet\` component:
   - Display all images (main + additional)
   - Add image upload button
   - Delete image button
   - Image gallery/carousel

4. Update types:
   - \`Item\` type should include \`additional_photos: AdditionalItemPhoto[]\`
   - \`AdditionalItemPhoto\` type with \`id\`, \`photo_url\`, \`created_at\`

## Reference Files
- \`backend/docs/API/Properties/Units/Collections/Items/Item images/\`
- \`src/features/collection-details/components/item-details-sheet.tsx\`
- \`src/features/collection-details/types/item.types.ts\``,
    priority: 2,
    labels: ["feature", "items", "high-priority"],
    backendEndpoints: [
      "GET /api/v1/properties/:propertyId/units/:unitId/collections/:collectionId/items/:itemId/images",
      "POST /api/v1/properties/:propertyId/units/:unitId/collections/:collectionId/items/:itemId/images",
      "DELETE /api/v1/properties/:propertyId/units/:unitId/collections/:collectionId/items/:itemId/images/:imageId",
    ],
    frontendFiles: [
      "src/features/collection-details/api/item-images.actions.ts",
      "src/features/collection-details/components/item-details-sheet.tsx",
    ],
    implementationNotes: "Follow existing image upload patterns. Check if base64 or multipart form data.",
  },
  {
    title: "Implement Video Support",
    description: `Implement video upload and playback functionality.

## Backend Endpoints (from Bruno docs)
- \`GET /api/v1/properties/:propertyId/units/:unitId/collections/:collectionId/videos\` - Get videos
- \`POST /api/v1/properties/:propertyId/units/:unitId/collections/:collectionId/videos/init\` - Init video upload
- \`DELETE /api/v1/properties/:propertyId/units/:unitId/collections/:collectionId/videos/:videoId\` - Delete video

## Current Status
- Backend endpoints exist
- Frontend has no implementation
- No UI for video upload/playback

## Requirements
1. Add endpoints to \`src/config/api.ts\`

2. Create \`src/features/collection-details/api/video.actions.ts\`:
   - \`getVideos(propertyId, unitId, collectionId)\`
   - \`initVideoUpload(propertyId, unitId, collectionId, videoFile)\`
   - \`deleteVideo(propertyId, unitId, collectionId, videoId)\`

3. Create video upload component:
   - Similar to \`UploadPhotosDialog\`
   - Handle video file validation
   - Progress tracking

4. Create video player component:
   - Display videos in collection details
   - Video player with controls

5. Types:
   - \`Video\` type matching backend response

## Reference Files
- \`backend/docs/API/Properties/Units/Collections/\`
- \`src/components/common/upload-photos-dialog.tsx\`
- \`src/components/common/video-player-dialog.tsx\` (may exist)`,
    priority: 3,
    labels: ["feature", "videos", "medium-priority"],
    backendEndpoints: [
      "GET /api/v1/properties/:propertyId/units/:unitId/collections/:collectionId/videos",
      "POST /api/v1/properties/:propertyId/units/:unitId/collections/:collectionId/videos/init",
      "DELETE /api/v1/properties/:propertyId/units/:unitId/collections/:collectionId/videos/:videoId",
    ],
    frontendFiles: [
      "src/features/collection-details/api/video.actions.ts",
      "src/features/collection-details/components/video-upload-dialog.tsx",
    ],
    implementationNotes: "Check backend for video upload flow - may need chunked upload or direct URL upload.",
  },
  {
    title: "Implement Duplication Resolution UI",
    description: `Implement UI for resolving duplicate items detected by AI.

## Backend Endpoints (from Bruno docs)
- \`POST /api/v1/properties/:propertyId/units/:unitId/collections/:collectionId/duplications/:duplicationGroupId/resolve\` - Resolve duplication group

## Current Status
- Backend endpoint exists
- Frontend has no implementation
- Items have \`dupe_group_id\` but no UI to resolve

## Requirements
1. Add endpoint to \`src/config/api.ts\`

2. Create \`src/features/collection-details/api/duplication.actions.ts\`:
   - \`resolveDuplicationGroup(propertyId, unitId, collectionId, duplicationGroupId, action: 'merge' | 'keep_separate')\`

3. Create duplication resolution UI:
   - Detect items with same \`dupe_group_id\`
   - Show side-by-side comparison
   - Options: merge into one, keep separate, delete duplicates
   - Confirmation dialog

4. Update items table:
   - Visual indicator for duplicate items
   - Link to resolution UI

## Reference Files
- \`backend/docs/API/Properties/Units/Collections/Resolve duplication group by ID.bru\`
- \`src/features/collection-details/types/collection-details.types.ts\` (check for \`dupe_group_id\`)`,
    priority: 3,
    labels: ["feature", "duplicates", "medium-priority"],
    backendEndpoints: [
      "POST /api/v1/properties/:propertyId/units/:unitId/collections/:collectionId/duplications/:duplicationGroupId/resolve",
    ],
    frontendFiles: [
      "src/features/collection-details/api/duplication.actions.ts",
      "src/features/collection-details/components/duplication-resolution-dialog.tsx",
    ],
    implementationNotes: "Check backend for exact resolve action format. May need to specify which item to keep.",
  },
];

async function generateTicketMarkdown(ticket: TicketDefinition): Promise<string> {
  const backendEndpointsList = ticket.backendEndpoints
    .map((ep) => `- \`${ep}\``)
    .join("\n");

  const frontendFilesList = ticket.frontendFiles
    ? ticket.frontendFiles.map((file) => `- \`${file}\``).join("\n")
    : "TBD";

  return `# ${ticket.title}

${ticket.description}

## Backend Endpoints
${backendEndpointsList || "N/A"}

## Frontend Files to Create/Modify
${frontendFilesList}

## Implementation Notes
${ticket.implementationNotes}

## Priority
${ticket.priority === 1 ? "🔴 Critical" : ticket.priority === 2 ? "🟠 High" : "🟡 Medium"}

## Labels
${ticket.labels?.map((l) => `\`${l}\``).join(", ") || "None"}
`;
}

async function main() {
  console.log("📋 Generating Linear ticket definitions...\n");

  for (const ticket of MISSING_FEATURES) {
    const markdown = await generateTicketMarkdown(ticket);
    console.log("=".repeat(80));
    console.log(markdown);
    console.log("\n");
  }

  console.log("\n✅ Ticket definitions generated!");
  console.log("\nNext steps:");
  console.log("1. Review each ticket definition above");
  console.log("2. Use Linear MCP to create tickets:");
  console.log("   - mcp_Linear_create_issue");
  console.log("3. Or run this script with --create flag to auto-create tickets");
}

if (require.main === module) {
  main().catch(console.error);
}

export { MISSING_FEATURES, generateTicketMarkdown };


