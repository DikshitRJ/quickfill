import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { spawn, ChildProcess } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const SERVER_PATH = path.resolve(__dirname, '../dist/index.js');

describe('MCP Server Integration', () => {
  let serverProcess: ChildProcess;
  let serverOutput = '';
  let serverError = '';

  beforeAll(async () => {
    // Start the server
    serverProcess = spawn('node', [SERVER_PATH], {
      env: { ...process.env, NODE_ENV: 'test' },
    });

    serverProcess.stdout?.on('data', (data) => {
      serverOutput += data.toString();
    });

    serverProcess.stderr?.on('data', (data) => {
      const msg = data.toString();
      serverError += msg;
      // console.error('[Server Stderr]', msg);
    });

    // Wait for the server to initialize (Express starts on stderr log)
    await new Promise((resolve, reject) => {
      const timeout = setTimeout(() => reject(new Error('Server took too long to start')), 5000);
      const interval = setInterval(() => {
        if (serverError.includes('[Server] Web server running at')) {
          clearTimeout(timeout);
          clearInterval(interval);
          resolve(true);
        }
      }, 100);
    });
  });

  afterAll(() => {
    if (serverProcess) {
      serverProcess.kill();
    }
  });

  it('should respond to list_tools request', async () => {
    const listToolsRequest = {
      jsonrpc: '2.0',
      id: 1,
      method: 'tools/list',
      params: {},
    };

    const response = await sendRequest(listToolsRequest);
    expect(response.result.tools).toBeDefined();
    expect(response.result.tools.some((t: any) => t.name === 'render_interactive_ui')).toBe(true);
  });

  it('should render interactive UI and start web server', async () => {
    const renderRequest = {
      jsonrpc: '2.0',
      id: 2,
      method: 'tools/call',
      params: {
        name: 'render_interactive_ui',
        arguments: {
          html_body: '<div x-data="{ count: 0 }"><button @click="count++" x-text="count"></button></div>',
          open_in_browser: false
        },
      },
    };

    const response = await sendRequest(renderRequest);
    expect(response.result.content[0].text).toContain('UI updated. Preview available at');

    // Extract port from stderr
    const portMatch = serverError.match(/http:\/\/localhost:(\d+)/);
    expect(portMatch).not.toBeNull();
    const port = portMatch![1];

    // Check if the web server is actually serving the content
    const fetchResponse = await fetch(`http://localhost:${port}/index.html`);
    expect(fetchResponse.status).toBe(200);
    const html = await fetchResponse.text();
    expect(html).toContain('x-data="{ count: 0 }"');
  });

  async function sendRequest(request: any): Promise<any> {
    return new Promise((resolve, reject) => {
      let responseData = '';
      
      const onData = (data: Buffer) => {
        responseData += data.toString();
        try {
          // MCP responses are delimited by newlines in practice for many implementations,
          // but strictly they are just JSON. We try to parse it.
          const json = JSON.parse(responseData);
          serverProcess.stdout?.off('data', onData);
          resolve(json);
        } catch (e) {
          // Wait for more data
        }
      };

      serverProcess.stdout?.on('data', onData);
      serverProcess.stdin?.write(JSON.stringify(request) + '\n');

      setTimeout(() => {
        serverProcess.stdout?.off('data', onData);
        reject(new Error(`Request timed out: ${JSON.stringify(request)}`));
      }, 3000);
    });
  }
});
