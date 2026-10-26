/**
 * Customer Engagement Hub MCP — tools for Claude / ChatGPT / Cursor / Copilot connectors.
 * All data access uses Firebase Admin + the same tenancy rules as /api/workspace.
 */
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { registerHubTools } from './registerHubTools';

export function createHubMcpServer(): McpServer {
  const server = new McpServer({
    name: 'customer-engagement-hub',
    version: '1.2.0',
  });

  registerHubTools(server);
  return server;
}
