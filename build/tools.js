import open from 'open';
import { fsManager } from './filesystem.js';
import { quickfillServer } from './server.js';
import { HTML_BOILERPLATE } from './constants.js';
let isFirstRun = true;
export async function handleRenderUi(htmlBody, requiredLibs = []) {
    const fullHtml = HTML_BOILERPLATE(htmlBody, requiredLibs, quickfillServer.port);
    fsManager.writeIndexHtml(fullHtml);
    if (isFirstRun) {
        console.error(`[Tools] First run: opening ${quickfillServer.getUrl()}`);
        await open(quickfillServer.getUrl());
        isFirstRun = false;
    }
    else {
        quickfillServer.broadcastReload();
    }
    return {
        content: [
            {
                type: 'text',
                text: `UI updated. Preview available at ${quickfillServer.getUrl()}`,
            },
        ],
    };
}
export function handleMountFile(absolutePath) {
    try {
        const relativePath = fsManager.mountFile(absolutePath);
        return {
            content: [
                {
                    type: 'text',
                    text: `File mounted successfully. Relative path: ${relativePath}`,
                },
            ],
        };
    }
    catch (error) {
        return {
            content: [
                {
                    type: 'text',
                    text: `Error mounting file: ${error.message}`,
                },
            ],
            isError: true,
        };
    }
}
