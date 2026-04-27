# 🚀 Using Quickfill with AI Agents

Quickfill is compatible with any AI agent that supports the **Model Context Protocol (MCP)**. Below are setup guides for the most popular platforms.

## 🖥 Claude Desktop
The gold standard for MCP.
1. Open your `claude_desktop_config.json`:
   - **macOS**: `~/Library/Application Support/Claude/claude_desktop_config.json`
   - **Windows**: `%APPDATA%\Claude\claude_desktop_config.json`
2. Add Quickfill to the `mcpServers` object:
```json
{
  "mcpServers": {
    "quickfill": {
      "command": "npx",
      "args": ["-y", "@dikshitrj/quickfill-mcp@latest"]
    }
  }
}
```
3. Restart Claude Desktop.

---

## 🤖 Claude Code (CLI)
For developers using Anthropic's CLI agent.
1. Run the following command in your terminal to add Quickfill as a persistent tool:
```bash
mcp add quickfill npx -y @dikshitrj/quickfill-mcp@latest
```
2. Claude will now have access to `render_interactive_ui` and `mount_file` globally.

---

## ⚡ Cursor
The AI-powered IDE.
1. Go to **Settings** > **Cursor Settings** > **Features** > **MCP**.
2. Click **+ Add New MCP Server**.
3. Name: `Quickfill`
4. Type: `command`
5. Command: `npx -y @dikshitrj/quickfill-mcp@latest`

---

## 🛠 Gemini CLI
The specialized terminal agent for Google's Gemini.
1. Install as a global extension:
```bash
gemini extensions install https://github.com/DikshitRJ/quickfill-mcp
```
2. You can now use the `quickfill` subagent directly:
```bash
gemini invoke quickfill-mcp "Show me a dashboard of my recent analytics"
```

---

## 💻 VS Code (via MCP Extensions)
If you use extensions like *Cline* or *Roo Code*:
1. Open the extension's MCP configuration settings.
2. Add a new server:
   - **Command**: `npx`
   - **Args**: `["-y", "@dikshitrj/quickfill-mcp@latest"]`
