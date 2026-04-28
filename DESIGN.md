# Quickfill Design System

Comprehensive design guidelines for building Generative UI with Quickfill MCP.

---

## Core Design System

### Philosophy
- **Seamless**: Users shouldn't notice where AI ends and your widget begins.
- **Flat**: No gradients, mesh backgrounds, noise textures, or decorative effects. Clean flat surfaces.
- **Compact**: Show essential inline. Explain rest in text.
- **Text in response, visuals in tool** — All explanatory text must be written as normal response text OUTSIDE the tool call. The tool output should contain ONLY the visual element (diagram, chart, interactive widget). Never put paragraphs of explanation, section headings, or descriptive prose inside HTML/SVG.

### Streaming
Structure code for token-by-token streaming. Useful content must appear early.
- **HTML**: Short `<style>` → content HTML → `<script>` last
- **SVG**: `<defs>` (markers) → visual elements immediately
- Prefer inline `style="..."` over `<style>` blocks — inputs/controls must look correct mid-stream
- Keep `<style>` under ~15 lines. Interactive widgets with inputs/sliders need more style — that's fine, don't bloat with decorative CSS.
- Gradients, shadows, and blur flash during streaming DOM diffs. Use solid flat fills instead.

### Rules
- No `<!-- comments -->` or `/* comments */` — wastes tokens, breaks streaming
- No font-size below 11px
- No emoji — use CSS shapes or SVG paths
- No gradients, drop shadows, blur, glow, or neon effects
- No dark/colored backgrounds on outer containers (transparent only — host provides bg)
- **Typography**: Default font is Anthropic Sans. For editorial moments, use serif.
- **Headings**: h1 = 22px, h2 = 18px, h3 = 16px — all `font-weight: 500`. Body = 16px, weight 400, line-height 1.7.
- **Sentence case** always. Never Title Case, never ALL CAPS — applies to SVG labels too.
- **No mid-sentence bolding** — entity names/class names go in code style, not bold. Bold is for headings/labels only.
- Widget container is `display: block; width: 100%`. HTML fills naturally — no wrapper div needed.
- Never use `position: fixed` — iframe viewport sizes to in-flow content height.
- No DOCTYPE, `<html>`, `<head>`, `<body>` — just content fragments.
- When placing text on colored background, use darkest shade from same color family.
- **Corners**: use `border-radius: var(--border-radius-md)` (8px) or `-lg` (12px). In SVG, `rx="4"` default.

### CSS Variables
**Backgrounds**: `--color-background-primary` (white), `--color-background-secondary`, `--color-background-tertiary`
**Text**: `--color-text-primary` (black), `--color-text-secondary` (muted), `--color-text-tertiary` (hints)
**Borders**: `--color-border-tertiary` (0.15α, default), `--color-border-secondary` (0.3α, hover), `--color-border-primary` (0.4α)
**Layout**: `--border-radius-md` (8px), `--border-radius-lg` (12px), `--border-radius-xl` (16px)

All auto-adapt to light/dark mode. In HTML, use CSS variables.

### Dark Mode is Mandatory
Every color must work in both modes:
- In SVG: use pre-built color classes (`c-blue`, `c-teal`, `c-amber`, etc.) — they handle light/dark automatically.
- In SVG: every `<text>` element needs a class (`t`, `ts`, `th`) — never omit fill.
- In HTML: always use CSS variables for text colors. Never hardcode `#333` — invisible in dark mode.
- **Mental test**: if background were near-black, would text still be readable?

### sendPrompt(text)
Global function that sends a message to chat as if user typed it. Use when user's next step benefits from AI thinking. Handle filtering/sorting/toggles in JS instead.

### Links
`<a href="https://...">` works — clicks intercepted to open confirmation dialog.

---

## Interactive Module

For interactive explainers with sliders, buttons, live calculations, state displays.

### Patterns
- **Sliders**: `<input type="range">` with Alpine.js `x-model` for reactivity
- **Metric cards**: Muted 13px label above, 24px/500 number below. Background secondary, no border, radius-md.
- **Live calculations**: Update results as inputs change using Alpine.js computed
- **Toggles**: For binary states, use checkbox with custom styling

### Example Structure
```html
<div x-data="{ years: 20, rate: 5, principal: 1000 }" x-init="$watch('years', v => update()); $watch('rate', v => update())">
  <div class="flex items-center gap-3">
    <label class="text-sm text-gray-600 dark:text-gray-400">Years</label>
    <input type="range" x-model="years" min="1" max="40" class="flex-1">
    <span class="text-sm font-medium w-6" x-text="years">20</span>
  </div>
  <div class="flex items-baseline gap-2 mt-4">
    <span class="text-sm text-gray-600 dark:text-gray-400">$1,000 →</span>
    <span class="text-2xl font-medium" x-text="'$' + Math.round(principal * Math.pow(1 + rate/100, years)).toLocaleString()">$2,653</span>
  </div>
</div>
```

### UI Tokens
- Buttons: Transparent bg, 0.5px border-secondary, hover bg-secondary, active scale(0.98)
- **Round every displayed number** — JS float math leaks artifacts. Use `Math.round()`, `.toFixed(n)`, or `Intl.NumberFormat`.
- For range sliders, set `step="1"` so input emits round values.
- Spacing: rem for vertical rhythm, px for component gaps.

---

## Chart Module

For charts and data visualization using Chart.js.

### Chart.js Rules
- Canvas cannot resolve CSS variables. Use hardcoded hex.
- Wrap `<canvas>` in `<div>` with explicit height and `position: relative`.
- **Canvas sizing**: Set height ONLY on wrapper div. Use `position: relative` on wrapper + `responsive: true, maintainAspectRatio: false` in Chart.js.
- Never set CSS height directly on canvas — causes wrong dimensions.
- For horizontal bar charts: wrapper height = `number_of_bars * 40 + 80` pixels.
- Load UMD via CDN (`cdnjs.cloudflare.com`) — sets `window.Chart`. Follow with plain `<script>`.
- **Script load ordering**: Use `onload="initChart()"` on CDN script. Always include fallback: `if (window.Chart) initChart();`

### Number Formatting
Negative values: `-$5M` not `$-5M` — sign before currency. Use formatter.

### Custom Legends
Disable Chart.js default (round dots, no values). Build custom HTML:
```html
<div class="flex flex-wrap gap-4 mb-2 text-xs text-gray-600 dark:text-gray-400">
  <span class="flex items-center gap-1"><span class="w-2.5 h-2.5 rounded" style="background:#3266ad;"></span>Chrome 65%</span>
</div>
```

### Dashboard Layout
Wrap summary numbers in metric cards above chart. Use `sendPrompt()` for drill-down.

---

## Mockup Module

For UI mockups, forms, cards, dashboards.

### Components
- Cards: White bg, 0.5px border, radius-lg, padding 1rem 1.25rem
- Forms: Pre-styled inputs (36px), range sliders (4px track + 18px thumb), buttons
- Metric cards: Background secondary, no border, radius-md, padding 1rem

### Bounded Objects (Contact Card, Receipt)
Wrap in single raised card:
```html
<div class="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-5">
  <div class="flex items-center gap-3 mb-4">
    <div class="w-11 h-11 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center font-medium text-sm text-blue-700 dark:text-blue-300">MR</div>
    <div>
      <p class="font-medium text-base">Maya Rodriguez</p>
      <p class="text-sm text-gray-500 dark:text-gray-400">VP of Engineering</p>
    </div>
  </div>
  <div class="border-t border-gray-200 dark:border-gray-700 pt-3">
    <table class="w-full text-sm">
      <tr><td class="text-gray-500 py-1">Email</td><td class="text-right text-blue-600">m.rodriguez@acme.com</td></tr>
      <tr><td class="text-gray-500 py-1">Phone</td><td class="text-right">+1 (415) 555-0172</td></tr>
    </table>
  </div>
</div>
```

### Grid Overflow
Use `minmax(0, 1fr)` to clamp — 1fr has min-width auto by default.

---

## Diagram Module

For SVG flowcharts, structural diagrams, illustrative diagrams.

### Diagram Types

**Flowchart**: Steps in sequence, decisions branching.
- Max 4-5 nodes (~680px width)
- Node height: 44px (single-line), 56px (two-line)
- Use `viewBox="0 0 680 400"` max
- Arrow intersection check: trace coordinates against every box — use L-shaped path detour.

**Structural**: Things inside other things.
- Outer container: large rect rx=20-24, lightest fill (50), 0.5px stroke (600)
- Inner regions: medium rects rx=8-12, 100-200 fill
- 20px padding inside containers

**Illustrative**: Draw the mechanism, spatial metaphors.
- Physical: cross-sections, cutaways, schematics
- Abstract: invented shapes for concepts (attention = glowing threads, hash table = funnel into buckets)
- Color encodes intensity — warm for active, cool/gray for dormant

### Node Pattern
```svg
<g class="node c-blue" onclick="sendPrompt('Tell me more about T-cells')">
  <rect x="100" y="20" width="180" height="44" rx="8" stroke-width="0.5"/>
  <text class="th" x="190" y="42" text-anchor="middle" dominant-baseline="central">T-cells</text>
</g>
```

### Arrow Pattern
```svg
<line x1="200" y1="76" x2="200" y2="120" class="arr" marker-end="url(#arrow)"/>
```

### Color Usage
- Group nodes by category — same type = same color
- 2-3 colors per diagram max
- Prefer purple, teal, coral, pink for categories
- Reserve blue, green, amber, red for semantic (info, success, warning, error)

---

## Art Module

For illustration and generative art.

### Aesthetic
- Fill the canvas — art should feel rich
- Bold colors: mix categories for variety
- Layer overlapping shapes for depth
- Organic forms with `<path>` curves, `<ellipse>`, `<circle>`
- Texture via repetition (parallel lines, dots, hatching)

### Custom Styles Allowed
Art is the ONE place custom `<style>` color blocks are fine — freestyle colors, `prefers-color-scheme` variants.

---

## Color Palette

9 color ramps, 7 stops each (lightest to darkest).

| Class | 50 (lightest) | 100 | 200 | 400 | 600 | 800 | 900 (darkest) |
|-------|------|-----|-----|-----|-----|-----|------|
| `c-purple` | #EEEDFE | #CECBF6 | #AFA9EC | #7F77DD | #534AB7 | #3C3489 | #26215C |
| `c-teal` | #E1F5EE | #9FE1CB | #5DCAA5 | #1D9E75 | #0F6E56 | #085041 | #04342C |
| `c-coral` | #FAECE7 | #F5C4B3 | #F0997B | #D85A30 | #993C1D | #712B13 | #4A1B0C |
| `c-pink` | #FBEAF0 | #F4C0D1 | #ED93B1 | #D4537E | #993556 | #72243E | #4B1528 |
| `c-gray` | #F1EFE8 | #D3D1C7 | #B4B2A9 | #888780 | #5F5E5A | #444441 | #2C2C2A |
| `c-blue` | #E6F1FB | #B5D4F4 | #85B7EB | #378ADD | #185FA5 | #0C447C | #042C53 |
| `c-green` | #EAF3DE | #C0DD97 | #97C459 | #639922 | #3B6D11 | #27500A | #173404 |
| `c-amber` | #FAEEDA | #FAC775 | #EF9F27 | #BA7517 | #854F0B | #633806 | #412402 |
| `c-red` | #FCEBEB | #F7C1C1 | #F09595 | #E24B4A | #A32D2D | #791F1F | #501313 |

### Text on Colored Backgrounds
- Title: 800 in light mode, 100 in dark (darker)
- Subtitle: 600 in light, 200 in dark (lighter)
- Never use black or generic gray on colored fills.

### Light/Dark Mode Quick Pick
- **Light mode**: 50 fill + 600 stroke + **800 title / 600 subtitle**
- **Dark mode**: 800 fill + 200 stroke + **100 title / 200 subtitle**

---

## Mermaid Integration

For ERDs, class diagrams, flowcharts. Use mermaid.js with `erDiagram` syntax.

```html
<div id="erd"></div>
<script type="module">
  import mermaid from 'https://esm.sh/mermaid@11/dist/mermaid.esm.min.mjs';
  const dark = matchMedia('(prefers-color-scheme: dark)').matches;
  mermaid.initialize({ startOnLoad: false, theme: 'base', themeVariables: { darkMode: dark } });
  const { svg } = await mermaid.render('erd', `erDiagram USERS ||--o{ POSTS : writes`);
  document.getElementById('erd').innerHTML = svg;
</script>
```

Post-process to round corners:
```javascript
document.querySelectorAll('#erd svg.erDiagram .node').forEach(node => {
  const firstPath = node.querySelector('path[d]');
  if (!firstPath) return;
  const rect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
  // copy attributes, add rx="8"
  firstPath.replaceWith(rect);
});
```

---

## CDN Allowlist (CSP-enforced)
Only these origins work:
- `cdnjs.cloudflare.com`
- `esm.sh`
- `cdn.jsdelivr.net`
- `unpkg.com`

All other origins are silently blocked.

---

## When Nothing Fits

- **Editorial** (explanatory): No card wrapper, prose flows naturally
- **Card** (bounded object): Single raised card wraps entire thing
- Use `sendPrompt()` for actions benefiting from AI thinking