import type { Server } from "node:http";
import { type ServerType, serve } from "@hono/node-server";
import { serveStatic } from "@hono/node-server/serve-static";
import getPort from "get-port";
import { Hono } from "hono";
import { WebSocket, WebSocketServer } from "ws";
import { fsManager } from "./filesystem.js";

export class QuickfillServer {
	private app = new Hono();
	private server?: ServerType;
	private wss?: WebSocketServer;
	public port: number = 0;
	private clients: Set<WebSocket> = new Set();
	private shellClients: Set<WebSocket> = new Set();

	constructor() {
		this.app.use("/*", async (c: any, next: any) => {
			await next();
			c.header(
				"Cache-Control",
				"no-store, no-cache, must-revalidate, proxy-revalidate",
			);
			c.header("Pragma", "no-cache");
			c.header("Expires", "0");
		});

		this.app.get("/shell", async (c: any) => {
			const { getShellHtml } = await import("./constants.js");
			return c.html(getShellHtml(this.port));
		});

		this.app.use(
			"/*",
			serveStatic({
				root: fsManager.tempDir,
				rewriteRequestPath: (p: string) => p.replace(/^\//, ""),
			}),
		);
	}

	async start() {
		this.port = await getPort({ port: [3000, 3001, 3002, 3003, 3004, 3005] });

		return new Promise<void>((resolve) => {
			this.server = serve(
				{
					fetch: this.app.fetch,
					port: this.port,
				},
				(info: any) => {
					process.stderr.write(
						`[Server] Web server running at http://localhost:${info.port}\n`,
					);

					this.wss = new WebSocketServer({
						server: this.server as unknown as Server,
					});

					this.wss.on("connection", (ws: WebSocket, req: any) => {
						const url = req.url || "";
						if (url.includes("/shell")) {
							this.shellClients.add(ws);
						} else {
							this.clients.add(ws);
						}

						ws.on("close", () => {
							this.clients.delete(ws);
							this.shellClients.delete(ws);
						});
					});

					resolve();
				},
			);
		});
	}

	broadcastReload() {
		process.stderr.write(
			`[Server] Broadcasting reload to ${this.clients.size} clients\n`,
		);
		for (const client of this.clients) {
			if (client.readyState === WebSocket.OPEN) {
				client.send("reload");
			}
		}
	}

	broadcastHtmlUpdate(html: string) {
		process.stderr.write(
			`[Server] Broadcasting HTML update to ${this.shellClients.size} shell clients\n`,
		);
		for (const client of this.shellClients) {
			if (client.readyState === WebSocket.OPEN) {
				client.send(`html:${html}`);
			}
		}
	}

	getUrl() {
		return `http://localhost:${this.port}`;
	}

	getShellUrl() {
		return `http://localhost:${this.port}/shell`;
	}
}

export const quickfillServer = new QuickfillServer();
