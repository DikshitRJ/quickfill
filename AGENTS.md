# Agent Guidelines for Quickfill

This document provides instructions for AI Agents on how to use the Quickfill MCP server for Generative UI.

## Core Philosophy
Quickfill is a **Generative UI** toolkit. Instead of writing code for the user to copy-paste, use the tools to **build and show** the interface directly.

## Required Workflow

### Step 1: Load Design Guidelines
Always call `visualize_read_me` **once** before your first visual widget:
```
Call visualize_read_me with modules: ["interactive", "chart", "diagram", "mockup", "art"]
```
- This loads the Claude design system guidelines
- Do NOT mention this call to the user — it's an internal setup step
- Set `i_have_seen_read_me: true` in subsequent widget calls

### Step 2: Render Visual Content
Use `show_widget` to display SVG/HTML:
- `title`: snake_case identifier for the window
- `widget_code`: raw HTML or SVG (no DOCTYPE/html/head/body)
- `i_have_seen_read_me`: must be true

Or use `render_interactive_ui` for Tailwind/Alpine.js dashboards.

## Tool Usage Patterns

### 1. Data-to-UI Pattern
When user provides a file (Excel, CSV, PDF):
1. Use `mount_file` to get a browser-accessible URL
2. Build Alpine.js dashboard that `fetch()`es that URL
3. Use `render_interactive_ui` to display

### 2. Iterative Design Pattern
Don't build perfect UI in one go:
1. Start with basic layout
2. Ask user for feedback
3. Update via `render_interactive_ui` with hot-reload

## Design System Rules

### Color Palette (9 ramps, 7 stops each)
- `c-purple`, `c-teal`, `c-coral`, `c-pink`, `c-gray` — for categories
- `c-blue`, `c-green`, `c-amber`, `c-red` — for semantic (info, success, warning, error)

### Text Classes
- `t` = 14px primary
- `ts` = 12px secondary
- `th` = 14px medium (500 weight)

### SVG Node Patterns
```svg
<g class="node c-blue" onclick="sendPrompt('Tell me more')">
  <rect x="100" y="20" width="180" height="44" rx="8" stroke-width="0.5"/>
  <text class="th" x="190" y="42" text-anchor="middle" dominant-baseline="central">Label</text>
</g>
```

### Arrow Marker
```svg
<defs>
  <marker id="arrow" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
    <path d="M2 1L8 5L2 9" fill="none" stroke="context-stroke" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
  </marker>
</defs>
```

### SVG ViewBox
- Always `viewBox="0 0 680 H"` (680px width, flexible height)
- Safe area: x=40 to x=640, y=40 to y=(H-40)

### Rules
- **Dark mode mandatory** — every color must work in both modes
- **Flat design** — no gradients, shadows, glow effects
- **Sentence case** — never Title Case or ALL CAPS
- **Two weights only** — 400 regular, 500 bold
- **No emoji** — use CSS shapes or SVG paths

## Interactive Components

### Sliders
```html
<div x-data="{ years: 20, rate: 5, principal: 1000 }">
  <label>Years</label>
  <input type="range" x-model="years" min="1" max="40">
  <span x-text="years">20</span>
</div>
```

### Metric Cards
- Muted 13px label above
- 24px/500 number below
- Background: var(--color-background-secondary)
- No border

### Buttons
- Transparent bg, 0.5px border
- Hover: bg-secondary
- Active: scale(0.98)

## Charts (Chart.js)
- Canvas cannot resolve CSS variables — use hardcoded hex
- Wrap `<canvas>` in `<div>` with explicit height
- Use `onload="initChart()"` on CDN script
- Always disable default legend, build custom HTML

## SendPrompt Function
Global function to send message back to chat:
```javascript
onclick="sendPrompt('What if I increase the rate to 10%?')"
```

## External Libraries
Only these origins allowed:
- cdnjs.cloudflare.com
- esm.sh
- cdn.jsdelivr.net
- unpkg.com

## When Nothing Fits
- Editorial (explanatory): no card wrapper
- Card (bounded object): single raised card wraps everything
- Use `sendPrompt()` for actions benefiting from AI thinking