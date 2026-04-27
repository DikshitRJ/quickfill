import type { Server as HttpServer } from "node:http";
import { serve } from "@hono/node-server";
import { serveStatic } from "@hono/node-server/serve-static";
import getPort from "get-port";
import { Hono } from "hono";
import { WebSocket, WebSocketServer } from "ws";
import { fsManager } from "./filesystem.js";

export class QuickfillServer {
	private app = new Hono();
	private server?: HttpServer;
	private wss?: WebSocketServer;
	private _port = 0;
	private clients: Set<WebSocket> = new Set();
	private startingPromise: Promise<void> | null = null;

	constructor() {
		this.app.use(
			"/*",
			serveStatic({
				root: fsManager.tempDir,
				onFound: (_path, c) => {
					c.header(
						"Cache-Control",
						"no-store, no-cache, must-revalidate, proxy-revalidate",
					);
					c.header("Pragma", "no-cache");
					c.header("Expires", "0");
				},
			}),
		);
	}

	get port() {
		return this._port;
	}

	async ensureStarted() {
		if (this._port > 0) return;
		if (this.startingPromise) return this.startingPromise;

		this.startingPromise = (async () => {
			// If we're in a test environment or specific port not needed, use 0
			const portConfig =
				process.env.NODE_ENV === "test"
					? 0
					: await getPort({ port: [3000, 3001, 3002, 3003, 3004, 3005] });

			return new Promise<void>((resolve) => {
				this.server = serve(
					{
						fetch: this.app.fetch,
						port: portConfig,
					},
					(info) => {
						this._port = info.port;
						process.stderr.write(
							`[Server] Web server running at http://localhost:${info.port}\n`,
						);

						if (this.server) {
							this.wss = new WebSocketServer({ server: this.server });
							this.wss.on("connection", (ws: WebSocket) => {
								this.clients.add(ws);
								ws.on("close", () => this.clients.delete(ws));
							});
						}
						resolve();
					},
				) as HttpServer;
			});
		})();

		return this.startingPromise;
	}

	broadcastReload() {
		if (this.clients.size === 0) return;
		process.stderr.write(
			`[Server] Broadcasting reload to ${this.clients.size} clients\n`,
		);
		for (const client of this.clients) {
			if (client.readyState === WebSocket.OPEN) {
				client.send("reload");
			}
		}
	}

	getUrl() {
		return `http://localhost:${this._port}`;
	}
}

export const quickfillServer = new QuickfillServer();
