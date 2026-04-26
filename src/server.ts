import express from 'express';
import { WebSocketServer, WebSocket } from 'ws';
import getPort from 'get-port';
import http from 'http';
import { fsManager } from './filesystem.js';

export class QuickfillServer {
  private app = express();
  private server: http.Server;
  private wss: WebSocketServer;
  public port: number = 0;
  private clients: Set<WebSocket> = new Set();

  constructor() {
    this.server = http.createServer(this.app);
    this.wss = new WebSocketServer({ server: this.server });
    
    this.wss.on('connection', (ws) => {
      this.clients.add(ws);
      ws.on('close', () => this.clients.delete(ws));
    });

    this.app.use(express.static(fsManager.tempDir, {
      setHeaders: (res) => {
        res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
        res.setHeader('Pragma', 'no-cache');
        res.setHeader('Expires', '0');
      }
    }));
  }

  async start() {
    this.port = await getPort({ port: [3000, 3001, 3002, 3003, 3004, 3005] });
    return new Promise<void>((resolve) => {
      this.server.listen(this.port, () => {
        process.stderr.write(`[Server] Web server running at http://localhost:${this.port}` + "\n");
        resolve();
      });
    });
  }

  broadcastReload() {
    process.stderr.write(`[Server] Broadcasting reload to ${this.clients.size} clients` + "\n");
    for (const client of this.clients) {
      if (client.readyState === WebSocket.OPEN) {
        client.send('reload');
      }
    }
  }

  getUrl() {
    return `http://localhost:${this.port}`;
  }
}

export const quickfillServer = new QuickfillServer();
