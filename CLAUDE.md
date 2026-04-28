# Quickfill Project Rules

This file provides Claude with instructions on how to use the Quickfill Generative UI toolkit.

## MCP Tools
Quickfill provides these tools:
- `visualize_read_me` — Load Claude design system guidelines (call once before widgets)
- `show_widget` — Render SVG/HTML in browser window
- `render_interactive_ui` — Render Alpine.js/Tailwind UI
- `mount_file` — Expose local file to web server
- `render_chart` — Render Chart.js charts
- `render_svg` — Render SVG diagrams
- `render_mermaid` — Render Mermaid diagrams
- `render_table` — Render sortable tables
- `render_form` — Render forms
- `render_dashboard` — Render dashboards

## Required Workflow

### 1. Load Guidelines First
Always call `visualize_read_me` once at the start:
```
visualize_read_me(modules: ["interactive", "chart", "diagram", "mockup", "art"])
```
- Do NOT mention this to the user — it's internal setup
- Set `i_have_seen_read_me: true` in subsequent show_widget calls

### 2. Render Widgets
```
show_widget(
  i_have_seen_read_me: true,
  title: "compound_interest",
  widget_code: "<svg>...</svg>"  // or HTML fragment
)
```

## Generative UI Standards

### Design System
- **Colors**: Use c-blue, c-teal, c-amber, c-green, c-red, c-purple, c-coral, c-pink, c-gray
- **Text**: t (14px), ts (12px), th (14px medium)
- **Dark mode mandatory** — all colors must work in both modes
- **Flat design** — no gradients, shadows, glow
- **Sentence case** — never Title Case or ALL CAPS

### SVG Patterns
- viewBox="0 0 680 H" — always 680px width
- Arrow marker via defs/marker
- Node pattern: `<g class="node c-blue" onclick="sendPrompt('...')">`

### CDN Allowlist
Only: cdnjs.cloudflare.com, esm.sh, cdn.jsdelivr.net, unpkg.com

## Strategic Advice
- **Proactive Visuals**: If user asks for data analysis, build a dashboard
- **Iterative Updates**: Use streaming for smooth hot-reload
- **Use sendPrompt()**: For follow-up questions from user interactions