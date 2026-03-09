import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StdioClientTransport } from "@modelcontextprotocol/sdk/client/stdio.js";

async function main() {
  const transport = new StdioClientTransport({
    command: "npx",
    args: ["-y", "@brightdata/mcp"],
    env: {
      ...process.env,
      API_TOKEN: process.env.BRIGHT_DATA_API_KEY,
    }
  });

  const mcpClient = new Client({
    name: "test",
    version: "1.0.0"
  }, {
    capabilities: {}
  });

  await mcpClient.connect(transport);
  const tools = await mcpClient.listTools();
  console.log(JSON.stringify(tools, null, 2));
  await transport.close();
}
main().catch(console.error);
