#!/usr/bin/env tsx

import { MISSING_FEATURES } from "./generate-linear-tickets";

const TEAM_ID = "264f04d1-0a42-4243-8b43-92e969aaf90b";

async function createTickets() {
  console.log("🚀 Creating Linear tickets...\n");

  for (const ticket of MISSING_FEATURES) {
    console.log(`Creating: ${ticket.title}...`);

    const description = `
${ticket.description}

## Backend Endpoints
${ticket.backendEndpoints.map((ep) => `- \`${ep}\``).join("\n") || "N/A"}

## Frontend Files to Create/Modify
${ticket.frontendFiles?.map((file) => `- \`${file}\``).join("\n") || "TBD"}

## Implementation Notes
${ticket.implementationNotes}
`.trim();

    try {
      const result = await fetch("https://api.linear.app/graphql", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: process.env.LINEAR_API_KEY || "",
        },
        body: JSON.stringify({
          query: `
            mutation CreateIssue($input: IssueCreateInput!) {
              issueCreate(input: $input) {
                success
                issue {
                  id
                  identifier
                  title
                  url
                }
              }
            }
          `,
          variables: {
            input: {
              teamId: TEAM_ID,
              title: ticket.title,
              description: description,
              priority: ticket.priority,
              labelIds: [], // Will need to fetch label IDs first
            },
          },
        }),
      });

      const data = await result.json();
      if (data.data?.issueCreate?.success) {
        const issue = data.data.issueCreate.issue;
        console.log(`✅ Created: ${issue.identifier} - ${issue.title}`);
        console.log(`   URL: ${issue.url}\n`);
      } else {
        console.error(`❌ Failed: ${JSON.stringify(data.errors || data.data?.issueCreate, null, 2)}\n`);
      }
    } catch (error) {
      console.error(`❌ Error creating ticket: ${error}\n`);
    }
  }

  console.log("✨ Done!");
}

if (require.main === module) {
  if (!process.env.LINEAR_API_KEY) {
    console.error("❌ LINEAR_API_KEY environment variable is required");
    console.log("\nTo get your API key:");
    console.log("1. Go to https://linear.app/settings/api");
    console.log("2. Create a new Personal API Key");
    console.log("3. Set it: export LINEAR_API_KEY=your_key_here");
    process.exit(1);
  }

  createTickets().catch(console.error);
}


