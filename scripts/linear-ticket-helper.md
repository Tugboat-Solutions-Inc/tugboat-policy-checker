# Linear Ticket Creation Guide

This guide helps you create Linear tickets for missing frontend features using Linear MCP.

## Quick Start

1. **Review ticket definitions:**
   ```bash
   npx tsx scripts/generate-linear-tickets.ts
   ```

2. **Create tickets using Cursor AI:**
   - Ask Cursor: "Create Linear tickets from the definitions in `scripts/generate-linear-tickets.ts`"
   - Or use the MCP tools directly (see below)

## Using Linear MCP in Cursor

You can use Linear MCP tools directly in Cursor. Here's the pattern:

### 1. Get Team Info
```typescript
// Team ID: 264f04d1-0a42-4243-8b43-92e969aaf90b (Caldausa)
```

### 2. Create a Ticket
Use `mcp_Linear_create_issue` with:
- `title`: Ticket title
- `team`: Team ID or name ("Caldausa")
- `description`: Full markdown description
- `priority`: 1 (Urgent), 2 (High), 3 (Normal), 4 (Low)
- `labels`: Array of label names (will be created if they don't exist)

### Example Ticket Creation

For "Fix OAuth Callback Route":

```typescript
mcp_Linear_create_issue({
  title: "Fix OAuth Callback Route (Critical)",
  team: "Caldausa",
  description: `Restore the OAuth callback route handler...

[Full description from generate-linear-tickets.ts]`,
  priority: 1,
  labels: ["bug", "critical", "auth"]
})
```

## Automated Creation Script

If you want to automate this, you can ask Cursor AI:

> "Create Linear tickets for all missing features defined in `scripts/generate-linear-tickets.ts`. Use the Linear MCP tools. Create them in the Caldausa team with appropriate priorities and labels."

## Ticket Structure

Each ticket includes:
- **Title**: Clear, actionable title
- **Description**: Full context, requirements, and implementation notes
- **Backend Endpoints**: List of API endpoints to integrate
- **Frontend Files**: Files to create/modify
- **Priority**: Based on impact (1=Critical, 2=High, 3=Medium)
- **Labels**: For filtering and organization

## Labels to Use

- `bug` - For fixing broken functionality
- `critical` - For blocking issues
- `feature` - For new functionality
- `auth` - Authentication related
- `invites` - Invite system
- `organizations` - Org management
- `items` - Item-related features
- `videos` - Video functionality
- `duplicates` - Duplication resolution
- `high-priority` - High priority features
- `medium-priority` - Medium priority features

## Next Steps After Creating Tickets

1. **Link tickets to branches:**
   - When creating a feature branch, reference the Linear ticket ID
   - Example: `git checkout -b fix/TUG-123-oauth-callback`

2. **Update ticket status:**
   - Move to "In Progress" when starting work
   - Add comments with implementation details
   - Link PR when ready for review

3. **Use in Cursor Cloud:**
   - Reference ticket ID in Cursor Cloud prompts
   - Example: "Implement TUG-123: Fix OAuth Callback Route"


