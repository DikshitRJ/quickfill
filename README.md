<div align="center">
  <img src="https://github.com/user-attachments/assets/b3aad172-76b8-4b42-8b28-54b20e9c0d60" 
       alt="Banner Image" 
       width="100%" 
       style="border-radius: 15px; display: block;"> <img>
</div>
<br/>

---

<br/>
<div align="center">

[![NPM](https://nodei.co/npm/@dikshitrj/quickfill-mcp.png?downloads=true&downloadRank=true&stars=true)](https://www.npmjs.com/package/@dikshitrj/quickfill-mcp)

[![license](https://img.shields.io/github/license/DikshitRJ/quickfill-mcp?style=for-the-badge)](LICENSE)
[![stars](https://img.shields.io/github/stars/DikshitRJ/quickfill-mcp?style=for-the-badge&logo=github)](https://github.com/DikshitRJ/quickfill-mcp/stargazers)
[![workflow](https://img.shields.io/github/actions/workflow/status/DikshitRJ/quickfill-mcp/ci.yml?style=for-the-badge&logo=github-actions)](https://github.com/DikshitRJ/quickfill-mcp/actions)


[🚀 Usage Guide](USAGE.md) • [🤝 Contributing](CONTRIBUTING.md) • [GitHub](https://github.com/DikshitRJ/quickfill-mcp)

</div>

<video src="https://github.com/user-attachments/assets/a71142aa-3481-4a40-98d7-71567f6b9ac4" autoplay="autoplay" loop="loop" muted="muted" playsinline="playsinline" style="max-width: 100%;">
</video>

---


## 📖 Table of Contents
- [🌟 Overview](#-overview)
- [✨ The "Generative UI" Workflow](#-the-generative-ui-workflow)
- [📦 Installation](#-installation)
- [🎨 Core Features](#-core-features)
- [🛠 Tool Reference](#-tool-reference)
- [📈 Star History](#-star-history)
- [🏗 Development](#-development)
- [📜 License](#-license)

---

## 🌟 Overview
**Quickfill** bridges the gap between AI reasoning and functional user interfaces. Instead of the AI simply describing a dashboard or a tool, it **builds and launches it** instantly in your browser. No project setup, no `npm install`, no boilerplate—just pure generative UI.

It uses a high-performance stack powered by **Hono**, **Alpine.js**, and **Tailwind CSS** to render lightweight, hot-reloading frontends directly from your conversation.

---

## ✨ The "Generative UI" Workflow
The power of Quickfill lies in its ability to bridge local data with interactive frontends:

1.  📊 **Analyze**: Feed an Excel sheet, PDF, or image to your AI agent.
2.  🎨 **Generate**: The AI drafts a custom-tailored UI using Tailwind & Alpine.js.
3.  🔗 **Bridge**: Use `mount_file` to expose your local data to the secure web environment.
4.  🚀 **Launch**: Use `render_interactive_ui` to pop open a live, functional dashboard in your browser.

---

## 📦 Installation
Check out the [USAGE.md](USAGE.md) for detailed installation and setup instructions.

---

## 🎨 Core Features
- ⚡ **Instant Rendering**: Zero-config browser UI updates with hot-reload.
- 📁 **Local Bridging**: `mount_file` creates secure symlinks to bypass browser file restrictions.
- 🛠 **Native Graphics Stack**:
    - **Tailwind CSS**: Utility-first styling for modern designs.
    - **Alpine.js**: Lightweight reactivity for complex interactions.
    - **WASM Parsers**: Built-in support for `PDF.js`, `SheetJS`, and `Tesseract.js` (OCR).
- 🚀 **Performant**: Built with **Hono** and **Biome** for maximum speed and minimal overhead.

---

## 🛠 Tool Reference

### 🖼 `render_interactive_ui`
The primary engine for Generative UI. It creates or updates the interactive browser view.

| Parameter | Type | Description |
| :--- | :--- | :--- |
| `html_body` | `string` | The HTML/Alpine.js body content to render. |
| `required_libs` | `string[]` | Optional. Choose from `["excel", "pdf", "ocr"]` to inject heavy libraries. |
| `open_in_browser` | `boolean` | Whether to automatically open the tab. Defaults to `true` on first call. |

### 🖇 `mount_file`
Securely exposes a local file to the web server's root. Essential for letting the browser "see" your local data.

| Parameter | Type | Description |
| :--- | :--- | :--- |
| `absolute_path` | `string` | The full path to the local file. |

**Returns:** A relative URL (e.g., `./data.xlsx`) that you can use in your UI code's `fetch()` or `src` attributes.

---

## 📈 Star History

[![Star History Chart](https://api.star-history.com/svg?repos=DikshitRJ/quickfill-mcp&type=Date)](https://star-history.com/#DikshitRJ/quickfill-mcp&Date)

---

## 🏗 Development
The project is built with **Node.js** and optimized with **Biome**.

```bash
# Setup
npm install

# Build the production bundle
npm run build

# Run quality checks
npm run check

# Run tests
npm test
```
Check out [CONTRIBUTNG.md](CONTRIBUTING.md) for contributing to this repository.

---

## 📜 License
Built with ❤️ by [DikshitRJ](https://github.com/DikshitRJ).  
This project is licensed under the [MIT License](LICENSE).

