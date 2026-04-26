import open from 'open';
import { fsManager } from './filesystem.js';
import { quickfillServer } from './server.js';
import { HTML_BOILERPLATE } from './constants.js';

let isFirstRun = true;

export async function handleRenderUi(
  htmlBody: string,
  requiredLibs: string[] = [],
  openInBrowser?: boolean
) {
  const fullHtml = HTML_BOILERPLATE(htmlBody, requiredLibs, quickfillServer.port);
  fsManager.writeIndexHtml(fullHtml);

  const shouldOpen = openInBrowser ?? isFirstRun;

  if (shouldOpen) {
    process.stderr.write(`[Tools] Attempting to open browser: ${quickfillServer.getUrl()}` + '\n');
    try {
      await open(quickfillServer.getUrl());
      process.stderr.write(`[Tools] Browser open command issued successfully` + '\n');
    } catch (err) {
      process.stderr.write(`[Tools] Failed to open browser: ${err}` + '\n');
    }
    isFirstRun = false;
  }

  quickfillServer.broadcastReload();

  let status = `UI updated. Preview available at ${quickfillServer.getUrl()}`;
  if (shouldOpen) {
    status += ` (Attempted to open browser)`;
  }

  return {
    content: [
      {
        type: 'text',
        text: status,
      },
    ],
  };
}

export function handleMountFile(absolutePath: string) {
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
  } catch (error) {
    return {
      content: [
        {
          type: 'text',
          text: `Error mounting file: ${error instanceof Error ? error.message : String(error)}`,
        },
      ],
      isError: true,
    };
  }
}
