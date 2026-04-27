import fs from "node:fs";
import os from "node:os";
import path from "node:path";

export class FileSystemManager {
	public tempDir: string;

	constructor() {
		this.tempDir = fs.mkdtempSync(path.join(os.tmpdir(), "mcp-graphics-"));
		this.setupCleanup();
	}

	private setupCleanup() {
		const cleanup = () => {
			try {
				if (fs.existsSync(this.tempDir)) {
					fs.rmSync(this.tempDir, { recursive: true, force: true });
				}
			} catch (err) {
				process.stderr.write(
					`Failed to cleanup temp directory ${this.tempDir}: ${err}\n`,
				);
			}
		};

		process.on("exit", cleanup);
		process.on("SIGINT", () => {
			cleanup();
			process.exit();
		});
		process.on("SIGTERM", () => {
			cleanup();
			process.exit();
		});
	}

	public mountFile(absolutePath: string): string {
		if (!fs.existsSync(absolutePath)) {
			throw new Error(`File not found: ${absolutePath}`);
		}

		const fileName = path.basename(absolutePath);
		const destPath = path.join(this.tempDir, fileName);

		if (fs.existsSync(destPath)) {
			fs.unlinkSync(destPath);
		}

		fs.symlinkSync(absolutePath, destPath);
		return `./${fileName}`;
	}

	public writeIndexHtml(content: string) {
		fs.writeFileSync(path.join(this.tempDir, "index.html"), content);
	}
}

export const fsManager = new FileSystemManager();
