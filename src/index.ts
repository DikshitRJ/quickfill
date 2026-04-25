#!/usr/bin/env node
import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from '@modelcontextprotocol/sdk/types.js';
import { quickfillServer } from './server.js';
import { handleRenderUi, handleMountFile } from './tools.js';

const server = new Server(
  {
    name: 'quickfill',
    version: '1.0.0',
  },
  {
    capabilities: {
      tools: {},
    },
  }
);

server.setRequestHandler(ListToolsRequestSchema, async () => {
  return {
    tools: [
      {
        name: 'render_interactive_ui',
        description: 'Render or update an Alpine.js interactive UI in the browser.',
        inputSchema: {
          type: 'object',
          properties: {
            html_body: {
              type: 'string',
              description: 'The HTML/Alpine.js body content to render.',
            },
            required_libs: {
              type: 'array',
              items: {
                type: 'string',
                enum: ['excel', 'pdf', 'ocr'],
              },
              description: 'Optional libraries to include (pdf.js, xlsx, tesseract.js).',
            },
          },
          required: ['html_body'],
        },
      },
      {
        name: 'mount_file',
        description: 'Mount a local file into the web server root for browser access.',
        inputSchema: {
          type: 'object',
          properties: {
            absolute_path: {
              type: 'string',
              description: 'The absolute path to the local file.',
            },
          },
          required: ['absolute_path'],
        },
      },
    ],
  };
});

server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;
  console.error(`[Debug] Calling tool: ${name} with args: ${JSON.stringify(args)}`);

  try {
    if (name === 'render_interactive_ui') {
      const { html_body, required_libs } = args as {
        html_body: string;
        required_libs?: string[];
      };
      return await handleRenderUi(html_body, required_libs);
    }

    if (name === 'mount_file') {
      const { absolute_path } = args as { absolute_path: string };
      return handleMountFile(absolute_path);
    }

    throw new Error(`Tool not found: ${name}`);
  } catch (error: any) {
    return {
      content: [
        {
          type: 'text',
          text: `Error: ${error.message}`,
        },
      ],
      isError: true,
    };
  }
});

async function main() {
  // Start the Express/WS server first
  await quickfillServer.start();

  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error('Quickfill MCP server running on stdio');

  // Ensure process exits when the client closes the connection
  process.stdin.on('close', () => {
    console.error('MCP client disconnected (stdin closed). Exiting process.');
    process.exit(0);
  });
}

main().catch((error) => {
  console.error('Fatal error in main():', error);
  process.exit(1);
});
