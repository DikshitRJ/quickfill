import os from 'os';
import path from 'path';
import fs from 'fs';
export class FileSystemManager {
    tempDir;
    constructor() {
        this.tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'mcp-graphics-'));
        this.setupCleanup();
    }
    setupCleanup() {
        const cleanup = () => {
            try {
                if (fs.existsSync(this.tempDir)) {
                    fs.rmSync(this.tempDir, { recursive: true, force: true });
                }
            }
            catch (err) {
                console.error(`Failed to cleanup temp directory ${this.tempDir}:`, err);
            }
        };
        process.on('exit', cleanup);
        process.on('SIGINT', () => { cleanup(); process.exit(); });
        process.on('SIGTERM', () => { cleanup(); process.exit(); });
    }
    mountFile(absolutePath) {
        if (!fs.existsSync(absolutePath)) {
            throw new Error(`File not found: ${absolutePath}`);
        }
        const fileName = path.basename(absolutePath);
        const destPath = path.join(this.tempDir, fileName);
        fs.copyFileSync(absolutePath, destPath);
        return `./${fileName}`;
    }
    writeIndexHtml(content) {
        fs.writeFileSync(path.join(this.tempDir, 'index.html'), content);
    }
}
export const fsManager = new FileSystemManager();
