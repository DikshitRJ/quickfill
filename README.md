# Quickfill MCP Server

**Quickfill** is an MCP Server that allows AI models to "bring conversation to life" by instantly rendering interactive, hot-reloading, lightweight frontends. 

It is designed to bridge the gap between static AI text responses and functional user experiences. Instead of just seeing code, the user **feels** the conversation through a live browser interface.

## 🌟 The "Quickfill" Workflow
The power of this server lies in rapid prototyping and data visualization:

1.  **Visualize Data**: Feed an Excel sheet or PDF to the AI.
2.  **Generate UI**: The AI writes a tailored Alpine.js/Tailwind dashboard with charts and filters.
3.  **Mount & Render**: The AI uses `mount_file` to bridge your local data to the browser and `render_interactive_ui` to launch the frontend.
4.  **Interact**: You immediately interact with a functional mockup of your data in a live browser tab.

This MCP Server can be used to quickly interact with data, look at quick prototypes, etc. without the overhead of initializing a frontend project. Just tell your AI agent to show you whatever you want to see, and the MCP server directly renders it without creating a frontend project, or saving any file to the disk. Just by sending the Alpine.js frontend code to the MCP Server.

## ✨ Features

-   **render_interactive_ui**: Updates a browser-based Alpine.js UI with instant hot-reload.
-   **mount_file**: Securely copies local files (PDF/Excel/Images) to a temporary web-root so the browser can parse them via WASM (bypassing local file restrictions).
-   **Built-in Graphics Stack**: Includes out-of-the-box support for:
    -   **Tailwind CSS**: For modern, beautiful styling.
    -   **Alpine.js**: For lightweight, reactive interactivity.
    -   **PDF.js**: For client-side PDF rendering.
    -   **SheetJS (XLSX)**: For parsing spreadsheets directly in the browser.
    -   **Tesseract.js**: For client-side OCR.

## 🚀 Usage

### Run via npx (Direct)
```bash
npx -y @dikshitrj/quickfill-mcp@latest
```

### MCP Configuration
To use this with an MCP client (like Claude Desktop), add it to your configuration file:


```json
{
  "mcpServers": {
    "quickfill": {
      "command": "npx",
      "args": [
        "-y", 
        "@dikshitrj/quickfill-mcp@latest"
      ]
    }
  }
}
```

## 🛠 Tools

### `render_interactive_ui`
Renders or updates the browser interface.
- `html_body`: The HTML/Alpine.js content.
- `required_libs`: (Optional) Choose from `["excel", "pdf", "ocr"]` to inject specific WASM parsers.

### `mount_file`
Exposes a local file to the web environment.
- `absolute_path`: The full path to the file on your machine.
- Returns a relative URL that can be used in your `fetch()` calls or `src` attributes within the UI.

## 🏗 Development

```bash
# Install dependencies
npm install

# Build the project
npm run build

# Start the server locally
npm start
```

## 📜 License
MIT
