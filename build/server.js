import express from 'express';
import { WebSocketServer, WebSocket } from 'ws';
import getPort from 'get-port';
import http from 'http';
import { fsManager } from './filesystem.js';
export class QuickfillServer {
    app = express();
    server;
    wss;
    port = 0;
    wsPort = 0;
    clients = new Set();
    constructor() {
        this.server = http.createServer(this.app);
        this.wss = new WebSocketServer({ server: this.server });
        this.wss.on('connection', (ws) => {
            this.clients.add(ws);
            ws.on('close', () => this.clients.delete(ws));
        });
        this.app.use(express.static(fsManager.tempDir));
    }
    async start() {
        this.port = await getPort({ port: [3000, 3001, 3002, 3003, 3004, 3005] });
        this.server.listen(this.port, () => {
            console.error(`[Server] Web server running at http://localhost:${this.port}`);
        });
    }
    broadcastReload() {
        console.error(`[Server] Broadcasting reload to ${this.clients.size} clients`);
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
