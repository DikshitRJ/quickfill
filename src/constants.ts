export const CDN_LINKS = {
	alpine:
		'<script defer src="https://cdn.jsdelivr.net/npm/alpinejs@3.x.x/dist/cdn.min.js"></script>',
	tailwind: '<script src="https://cdn.tailwindcss.com"></script>',
	pdfjs:
		'<script src="https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js"></script>',
	xlsx: '<script src="https://cdn.jsdelivr.net/npm/xlsx@0.18.5/dist/xlsx.full.min.js"></script>',
	tesseract:
		'<script src="https://cdn.jsdelivr.net/npm/tesseract.js@5/dist/tesseract.min.js"></script>',
	chartjs:
		'<script src="https://cdnjs.cloudflare.com/ajax/libs/Chart.js/4.4.1/chart.umd.js"></script>',
	morphdom:
		'<script src="https://cdn.jsdelivr.net/npm/morphdom@2.7.4/dist/morphdom-umd.min.js"></script>',
	mermaid:
		'<script type="module">import mermaid from "https://esm.sh/mermaid@11/dist/mermaid.esm.min.mjs"; window.mermaid = mermaid;</script>',
};

export function getShellHtml(_port) {
	return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Quickfill Preview</title>
    ${CDN_LINKS.tailwind}
    ${CDN_LINKS.alpine}
    ${CDN_LINKS.morphdom}
    <style>
        * { box-sizing: border-box; }
        body {
            margin: 0;
            padding: 1rem;
            font-family: system-ui, -apple-system, sans-serif;
            background: var(--color-background-primary, #1a1a1a);
            color: var(--color-text-primary, #e0e0e0);
        }
        @keyframes _fadeIn {
            from { opacity: 0; transform: translateY(4px); }
            to { opacity: 1; transform: none; }
        }
        [x-cloak] { display: none !important; }
        .animate-fade-in { animation: _fadeIn 0.3s ease both; }
    </style>
</head>
<body>
    <div id="root" class="container mx-auto px-4 py-8"></div>
    <script>
        window._morphReady = false;
        window._pending = null;
        window._setContent = function(html) {
            if (!window._morphReady) { window._pending = html; return; }
            var root = document.getElementById('root');
            var target = document.createElement('div');
            target.id = 'root';
            target.innerHTML = html;
            if (typeof morphdom !== 'undefined') {
                morphdom(root, target, {
                    onBeforeElUpdated: function(from, to) {
                        if (from.isEqualNode(to)) return false;
                        return true;
                    },
                    onNodeAdded: function(node) {
                        if (node.nodeType === 1 && node.tagName !== 'STYLE' && node.tagName !== 'SCRIPT') {
                            node.style.animation = '_fadeIn 0.3s ease both';
                        }
                        return node;
                    }
                });
            } else {
                root.innerHTML = html;
            }
        };
        window._runScripts = function() {
            document.querySelectorAll('#root script').forEach(function(old) {
                var s = document.createElement('script');
                if (old.src) { s.src = old.src; } else { s.textContent = old.textContent; }
                old.parentNode.replaceChild(s, old);
            });
        };
    </script>
    <script>
        (function() {
            let socket;
            function connect() {
                socket = new WebSocket('ws://' + window.location.host);
                socket.onmessage = (msg) => {
                    if (msg.data === 'reload') {
                        if (window._pending !== null) return;
                        window.location.reload();
                    } else if (msg.data.startsWith('html:')) {
                        var html = msg.data.substring(5);
                        window._setContent(html);
                    }
                };
                socket.onclose = () => {
                    setTimeout(connect, 1000);
                };
            }
            connect();
        })();
    </script>
</body>
</html>`;
}

export function getHtmlBoilerplate(body, libs, _wsPort) {
	const hasMermaid = libs.includes("mermaid");
	const hasPdf = libs.includes("pdf");
	const hasExcel = libs.includes("excel");
	const hasOcr = libs.includes("ocr");
	const hasChart = libs.includes("chart");

	return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Quickfill Preview</title>
    ${CDN_LINKS.tailwind}
    ${CDN_LINKS.alpine}
    ${hasPdf ? CDN_LINKS.pdfjs : ""}
    ${hasExcel ? CDN_LINKS.xlsx : ""}
    ${hasOcr ? CDN_LINKS.tesseract : ""}
    ${hasChart ? CDN_LINKS.chartjs : ""}
    ${hasMermaid ? CDN_LINKS.mermaid : ""}
    <style>
        :root {
            --color-background-primary: #ffffff;
            --color-background-secondary: #f3f4f6;
            --color-text-primary: #111827;
            --color-text-secondary: #6b7280;
            --color-border-tertiary: rgba(0,0,0,0.05);
            --border-radius-md: 8px;
            --border-radius-lg: 12px;
        }
        @media (prefers-color-scheme: dark) {
            :root {
                --color-background-primary: #1a1a1a;
                --color-background-secondary: #262626;
                --color-text-primary: #e5e5e5;
                --color-text-secondary: #a3a3a3;
                --color-border-tertiary: rgba(255,255,255,0.05);
            }
        }
        [x-cloak] { display: none !important; }
        body { font-family: 'Inter', -apple-system, sans-serif; background: var(--color-background-primary); color: var(--color-text-primary); }
        .animate-fade-in { animation: fadeIn 0.5s ease-in; }
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
    </style>
</head>
<body class="min-h-screen">
    <div class="container mx-auto px-4 py-8">
        ${body}
    </div>
    <script>
        (function() {
            let socket;
            function connect() {
                socket = new WebSocket('ws://' + window.location.host);
                socket.onmessage = (msg) => {
                    if(msg.data === 'reload') {
                        console.log('Hot reload triggered');
                        window.location.reload();
                    }
                };
                socket.onclose = () => {
                    setTimeout(connect, 1000);
                };
            }
            connect();
        })();
    </script>
</body>
</html>`;
}

const CORE = `# Imagine — Visual Creation Suite

## Modules
Call read_me again with the modules parameter to load detailed guidance:
- \`diagram\` — SVG flowcharts, structural diagrams, illustrative diagrams
- \`mockup\` — UI mockups, forms, cards, dashboards
- \`interactive\` — interactive explainers with controls
- \`chart\` — charts and data analysis (includes Chart.js)
- \`art\` — illustration and generative art
Pick the closest fit. The module includes all relevant design guidance.

**Complexity budget — hard limits:**
- Box subtitles: ≤5 words. Detail goes in click-through (\`sendPrompt\`) or the prose below — not the box.
- Colors: ≤2 ramps per diagram. If colors encode meaning (states, tiers), add a 1-line legend. Otherwise use one neutral ramp.
- Horizontal tier: ≤4 boxes at full width (~140px each). 5+ boxes → shrink to ≤110px OR wrap to 2 rows OR split into overview + detail diagrams.

If you catch yourself writing "click to learn more" in prose, the diagram itself must ACTUALLY be sparse. Don't promise brevity then front-load everything.

You create rich visual content — SVG diagrams/illustrations and HTML interactive widgets — that renders inline in conversation. The best output feels like a natural extension of the chat.

## Core Design System

These rules apply to ALL use cases.

### Philosophy
- **Seamless**: Users shouldn't notice where the AI ends and your widget begins.
- **Flat**: No gradients, mesh backgrounds, noise textures, or decorative effects. Clean flat surfaces.
- **Compact**: Show the essential inline. Explain the rest in text.
- **Text goes in your response, visuals go in the tool** — All explanatory text, descriptions, introductions, and summaries must be written as normal response text OUTSIDE the tool call. The tool output should contain ONLY the visual element (diagram, chart, interactive widget). Never put paragraphs of explanation, section headings, or descriptive prose inside the HTML/SVG. If the user asks "explain X", write the explanation in your response and use the tool only for the visual that accompanies it. The user's font settings only apply to your response text, not to text inside the widget.

### Streaming
Output streams token-by-token. Structure code so useful content appears early.
- **HTML**: \`<style>\` (short) → content HTML → \`<script>\` last.
- **SVG**: \`<defs>\` (markers) → visual elements immediately.
- Prefer inline \`style="..."\` over \`<style>\` blocks — inputs/controls must look correct mid-stream.
- Keep \`<style>\` under ~15 lines. Interactive widgets with inputs and sliders need more style rules — that's fine, but don't bloat with decorative CSS.
- Gradients, shadows, and blur flash during streaming DOM diffs. Use solid flat fills instead.

### Rules
- No \`<!-- comments -->\` or \`/* comments */\` (waste tokens, break streaming)
- No font-size below 11px
- No emoji — use CSS shapes or SVG paths
- No gradients, drop shadows, blur, glow, or neon effects
- No dark/colored backgrounds on outer containers (transparent only — host provides the bg)
- **Typography**: The default font is system-ui. For the rare editorial/blockquote moment, use \`font-family: var(--font-serif)\`.
- **Headings**: h1 = 22px, h2 = 18px, h3 = 16px — all \`font-weight: 500\`. Heading color is pre-set to \`var(--color-text-primary)\` — don't override it. Body text = 16px, weight 400, \`line-height: 1.7\`. **Two weights only: 400 regular, 500 bold.** Never use 600 or 700 — they look heavy against the host UI.
- **Sentence case** always. Never Title Case, never ALL CAPS. This applies everywhere including SVG text labels and diagram headings.
- **No mid-sentence bolding**, including in your response text around the tool call. Entity names, class names, function names go in \`code style\` not **bold**. Bold is for headings and labels only.
- The widget container is \`display: block; width: 100%\`. Your HTML fills it naturally — no wrapper div needed. Just start with your content directly. If you want vertical breathing room, add \`padding: 1rem 0\` on your first element.
- Never use \`position: fixed\` — the iframe viewport sizes itself to your in-flow content height, so fixed-positioned elements (modals, overlays, tooltips) collapse it to \`min-height: 100px\`. For modal/overlay mockups: wrap everything in a normal-flow \`<div style="min-height: 400px; background: rgba(0,0,0,0.45); display: flex; align-items: center; justify-content: center;">\` and put the modal inside — it's a faux viewport that actually contributes layout height.
- No DOCTYPE, \`<html>\`, \`<head>\`, or \`<body>\` — just content fragments.
- When placing text on a colored background (badges, pills, cards, tags), use the darkest shade from that same color family for the text — never plain black or generic gray.
- **Corners**: use \`border-radius: var(--border-radius-md)\` (or \`-lg\` for cards) in HTML. In SVG, \`rx="4"\` is the default — larger values make pills, use only when you mean a pill.
- **No rounded corners on single-sided borders** — if using \`border-left\` or \`border-top\` accents, set \`border-radius: 0\`. Rounded corners only work with full borders on all sides.
- **No titles or prose inside the tool output** — see Philosophy above.
- **Icon sizing**: When using emoji or inline SVG icons, explicitly set \`font-size: 16px\` for emoji or \`width: 16px; height: 16px\` for SVG icons. Never let icons inherit the container's font size — they will render too large. For larger decorative icons, use 24px max.
- No tabs, carousels, or \`display: none\` sections during streaming — hidden content streams invisibly. Show all content stacked vertically. (Post-streaming JS-driven steppers are fine.)
- No nested scrolling — auto-fit height.
- Scripts execute after streaming — load libraries via \`<script src="https://cdnjs.cloudflare.com/ajax/libs/...">\` (UMD globals), then use the global in a plain \`<script>\` that follows.
- **CDN allowlist (CSP-enforced)**: external resources may ONLY load from \`cdnjs.cloudflare.com\`, \`esm.sh\`, \`cdn.jsdelivr.net\`, \`unpkg.com\`. All other origins are blocked by the sandbox — the request silently fails.

### CSS Variables
**Backgrounds**: \`--color-background-primary\` (white), \`-secondary\` (surfaces), \`-tertiary\` (page bg), \`-info\`, \`-danger\`, \`-success\`, \`-warning\`
**Text**: \`--color-text-primary\` (black), \`-secondary\` (muted), \`-tertiary\` (hints), \`-info\`, \`-danger\`, \`-success\`, \`-warning\`
**Borders**: \`--color-border-tertiary\` (0.15α, default), \`-secondary\` (0.3α, hover), \`-primary\` (0.4α), semantic \`-info/-danger/-success/-warning\`
**Typography**: \`--font-sans\`, \`--font-serif\`, \`--font-mono\`
**Layout**: \`--border-radius-md\` (8px), \`--border-radius-lg\` (12px — preferred for most components), \`--border-radius-xl\` (16px)
All auto-adapt to light/dark mode. For custom colors in HTML, use CSS variables.

**Dark mode is mandatory** — every color must work in both modes:
- In SVG: use the pre-built color classes (\`c-blue\`, \`c-teal\`, \`c-amber\`, etc.) for colored nodes — they handle light/dark mode automatically. Never write \`<style>\` blocks for colors.
- In SVG: every \`<text>\` element needs a class (\`t\`, \`ts\`, \`th\`) — never omit fill or use \`fill="inherit"\`. Inside a \`c-{color}\` parent, text classes auto-adjust to the ramp.
- In HTML: always use CSS variables (--color-text-primary, --color-text-secondary) for text. Never hardcode colors like color: #333 — invisible in dark mode.
- Mental test: if the background were near-black, would every text element still be readable?

### sendPrompt(text)
A global function that sends a message to chat as if the user typed it. Use it when the user's next step benefits from Claude thinking. Handle filtering, sorting, toggling, and calculations in JS instead.

### Links
\`<a href="https://...">\` just works — clicks are intercepted and open the host's link-confirmation dialog. Or call \`openLink(url)\` directly.

## When nothing fits
Pick the closest use case below and adapt. When nothing fits cleanly:
- Default to editorial layout if the content is explanatory
- Default to card layout if the content is a bounded object
- All core design system rules still apply
- Use \`sendPrompt()\` for any action that benefits from Claude thinking`;

const UI_COMPONENTS = `## UI components

### Aesthetic
Flat, clean, white surfaces. Minimal 0.5px borders. Generous whitespace. No gradients, no shadows (except functional focus rings). Everything should feel native to the chat.

### Tokens
- Borders: always \`0.5px solid var(--color-border-tertiary)\` (or \`-secondary\` for emphasis)
- Corner radius: \`var(--border-radius-md)\` for most elements, \`var(--border-radius-lg)\` for cards
- Cards: white bg (\`var(--color-background-primary)\`), 0.5px border, radius-lg, padding 1rem 1.25rem
- Form elements (input, select, textarea, button, range slider) are pre-styled — write bare tags. Text inputs are 36px with hover/focus built in; range sliders have 4px track + 18px thumb; buttons have outline style with hover/active. Only add inline styles to override.
- Buttons: pre-styled with transparent bg, 0.5px border-secondary, hover bg-secondary, active scale(0.98). If it triggers sendPrompt, append a ↗ arrow.
- **Round every displayed number.** JS float math leaks artifacts — use Math.round(), .toFixed(n), or Intl.NumberFormat.
- Spacing: use rem for vertical rhythm (1rem, 1.5rem, 2rem), px for component-internal gaps (8px, 12px, 16px)
- Box-shadows: none, except focus rings on inputs

### Metric cards
For summary numbers (revenue, count, percentage) — surface card with muted 13px label above, 24px/500 number below. background: var(--color-background-secondary), no border, border-radius: var(--border-radius-md), padding 1rem. Use in grids of 2-4 with gap: 12px.

### Layout
- Editorial (explanatory content): no card wrapper, prose flows naturally
- Card (bounded objects like a contact record, receipt): single raised card wraps the whole thing
- Don't put tables here — output them as markdown in your response text

**Grid overflow:** grid-template-columns: 1fr has min-width: auto by default. Use minmax(0, 1fr) to clamp.

**Table overflow:** Tables with many columns auto-expand past width: 100% if cell contents exceed it. Use table-layout: fixed.

### Mockup presentation
Contained mockups should sit on a background surface (var(--color-background-secondary) container with border-radius) so they don't float naked on the widget canvas. Full-width mockups do not need an extra wrapper.

### 1. Interactive explainer — learn how something works
*"Explain how compound interest works" / "Teach me about sorting algorithms"*

Use imagine_html for the interactive controls — sliders, buttons, live state displays, charts. Keep prose explanations in your normal response text (outside the tool call).

### 2. Compare options — decision making
*"Compare pricing and features" / "Help me choose between X and Y"*

Use imagine_html. Side-by-side card grid for options. Use repeat(auto-fit, minmax(160px, 1fr)) for responsive columns.

### 3. Data record — bounded UI object
*"Show me a contact card" / "Create a receipt"*

Use imagine_html. Wrap the entire thing in a single raised card.`;

const COLOR_PALETTE = `## Color palette

9 color ramps, each with 7 stops from lightest to darkest.

| Class | Ramp | 50 | 100 | 200 | 400 | 600 | 800 | 900 |
|-------|------|-----|-----|-----|-----|-----|-----|------|
| c-purple | Purple | #EEEDFE | #CECBF6 | #AFA9EC | #7F77DD | #534AB7 | #3C3489 | #26215C |
| c-teal | Teal | #E1F5EE | #9FE1CB | #5DCAA5 | #1D9E75 | #0F6E56 | #085041 | #04342C |
| c-coral | Coral | #FAECE7 | #F5C4B3 | #F0997B | #D85A30 | #993C1D | #712B13 | #4A1B0C |
| c-pink | Pink | #FBEAF0 | #F4C0D1 | #ED93B1 | #D4537E | #993556 | #72243E | #4B1528 |
| c-gray | Gray | #F1EFE8 | #D3D1C7 | #B4B2A9 | #888780 | #5F5E5A | #444441 | #2C2C2A |
| c-blue | Blue | #E6F1FB | #B5D4F4 | #85B7EB | #378ADD | #185FA5 | #0C447C | #042C53 |
| c-green | Green | #EAF3DE | #C0DD97 | #97C459 | #639922 | #3B6D11 | #27500A | #173404 |
| c-amber | Amber | #FAEEDA | #FAC775 | #EF9F27 | #BA7517 | #854F0B | #633806 | #412402 |
| c-red | Red | #FCEBEB | #F7C1C1 | #F09595 | #E24B4A | #A32D2D | #791F1F | #501313 |

**How to assign colors**: Color should encode meaning, not sequence.
- Group nodes by **category** — all nodes of the same type share one color.
- Use **gray for neutral/structural** nodes (start, end, generic steps).
- Use **2-3 colors per diagram**, not 6+.
- **Prefer purple, teal, coral, pink** for general diagram categories. Reserve blue, green, amber, red for semantic.

**Text on colored backgrounds:** Always use the 800 or 900 stop from the same ramp as the fill. Never use black or gray on colored fills. When a box has both title and subtitle, they must be two different stops — title darker (800 in light, 100 in dark), subtitle lighter (600 in light, 200 in dark).

**Light/dark mode quick pick:**
- **Light mode**: 50 fill + 600 stroke + **800 title / 600 subtitle**
- **Dark mode**: 800 fill + 200 stroke + **100 title / 200 subtitle**

Available: c-gray, c-blue, c-red, c-amber, c-green, c-teal, c-purple, c-coral, c-pink.`;

const SVG_SETUP = `## SVG setup

**ViewBox safety checklist** — before finalizing any SVG, verify:
1. Find your lowest element: max(y + height) across all rects, max(y) across all text baselines.
2. Set viewBox height = that value + 40px buffer.
3. Find your rightmost element. All content must stay within x=0 to x=680.
4. For text with text-anchor="end", check that the text doesn't extend past x=0.
5. Never use negative x or y coordinates.
6. For boxes in the same row, check that they don't overlap.

**SVG setup**: <svg width="100%" viewBox="0 0 680 H"> — 680px wide, flexible height. Set H to fit content tightly.

**The 680 in viewBox is load-bearing — do not change it.** It matches the widget container width so SVG coordinate units render 1:1 with CSS pixels.

**One SVG per tool call** — each call must contain exactly one <svg> element.

**Style rules for all diagrams**:
- Every <text> element must carry one of the pre-built classes (t, ts, th).
- Use only two font sizes: 14px for labels (class="t" or "th"), 12px for subtitles (class="ts").
- No decorative step numbers or oversized headings outside boxes.
- No icons inside boxes — text only.
- Sentence case on all labels.

**Pre-built classes**:
- class="t" = sans 14px primary
- class="ts" = sans 12px secondary
- class="th" = sans 14px medium (500)
- class="box" = neutral rect
- class="node" = clickable group with hover effect
- class="arr" = arrow line
- class="leader" = dashed leader line
- class="c-{ramp}" = colored node (c-blue, c-teal, c-amber, c-green, c-red, c-purple, c-coral, c-pink, c-gray). Apply to <g> or shape element.

**Arrow marker**: always include:
<defs><marker id="arrow" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse"><path d="M2 1L8 5L2 9" fill="none" stroke="context-stroke" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></marker></defs>

Use marker-end="url(#arrow)" on lines.

**Stroke width:** Use 0.5px strokes for diagram borders and edges.

**Connector paths need fill="none".** SVG defaults to fill: black — a curved connector without fill="none" renders as a huge black shape.

**Rect rounding:** rx="4" for subtle corners. rx="8" max for emphasized rounding.

**Physical-color scenes:** Use ALL hardcoded hex — never mix with c-* theme classes. The scene should not invert in dark mode.

**No rotated text**. <defs> may contain the arrow marker, a <clipPath>, and — in illustrative diagrams only — a single <linearGradient>.`;

const CHARTS_CHART_JS = `## Charts (Chart.js)

<div style="position: relative; width: 100%; height: 300px;">
  <canvas id="myChart"></canvas>
</div>
<script src="https://cdnjs.cloudflare.com/ajax/libs/Chart.js/4.4.1/chart.umd.js" onload="initChart()"></script>
<script>
  function initChart() {
    new Chart(document.getElementById('myChart'), {
      type: 'bar',
      data: { labels: ['Q1','Q2','Q3','Q4'], datasets: [{ label: 'Revenue', data: [12,19,8,15] }] },
      options: { responsive: true, maintainAspectRatio: false }
    });
  }
  if (window.Chart) initChart();
</script>

**Chart.js rules**:
- Canvas cannot resolve CSS variables. Use hardcoded hex or Chart.js defaults.
- Wrap <canvas> in <div> with explicit height and position: relative.
- Canvas sizing: set height ONLY on the wrapper div. Use responsive: true, maintainAspectRatio: false.
- For horizontal bar charts: wrapper height = (number_of_bars * 40) + 80 pixels.
- Load UMD build via CDN — sets window.Chart global.
- Script load ordering: Always use onload="initChart()" on CDN script tag, add if (window.Chart) initChart(); as fallback.
- Multiple charts: use unique IDs.
- For bubble and scatter charts: pad the scale range ~10%.
- Chart.js auto-skips x-axis labels when they'd overlap. Set autoSkip: false if needed.

**Number formatting**: negative values are -$5M not $-5M — sign before currency.

**Legends** — always disable Chart.js default and build custom HTML:
plugins: { legend: { display: false } }

<div style="display: flex; flex-wrap: wrap; gap: 16px; margin-bottom: 8px; font-size: 12px; color: var(--color-text-secondary);">
  <span style="display: flex; align-items: center; gap: 4px;"><span style="width: 10px; height: 10px; border-radius: 2px; background: #3266ad;"></span>Chrome 65%</span>
</div>

Include value/percentage in each label. Position legend above or below the chart — not inside.

**Dashboard layout** — wrap summary numbers in metric cards above the chart. Use sendPrompt() for drill-down.`;

const DIAGRAM_TYPES = `## Diagram types

*"Explain how compound interest works" / "How does a process scheduler work"*

**Two rules that cause most diagram failures:**
1. Arrow intersection check: trace coordinates against every box. If line crosses a rect's interior, use L-shaped path detour.
2. Box width from longest label: rect_width = max(title_chars × 8, subtitle_chars × 7) + 24.

**Tier packing:** Compute total width BEFORE placing. Example — 4 boxes: x=50,200,350,500 w=130 gap=20 → fits.

**Pick the right diagram type. The decision is about intent, not subject matter.**

**Reference diagrams** — the user wants a map they can point at.
- Flowchart — steps in sequence. Good for workflows, pipelines.
- Structural diagram — things inside other things. Good for file systems, architecture.

**Intuition diagrams** — the user wants to *feel* how something works.
- Illustrative diagram — draw the mechanism. Abstract things get spatial metaphors.

| User says | Type | What to draw |
|---|---|---|
| "how do LLMs work" | Illustrative | Token row, stacked layers, attention threads |
| "transformer architecture" | Structural | Labelled boxes |
| "how does attention work" | Illustrative | Query token, fan of lines to keys |
| "how does gradient descent" | Illustrative | Contour surface, ball, trail |
| "what are training steps" | Flowchart | Forward → loss → backward → update |
| "draw database schema" | mermaid.js | erDiagram |

**For complex topics, use multiple SVG calls** — break into smaller diagrams. **Always add prose between diagrams.**

### Flowchart
For sequential processes. Size boxes to fit text generously (~8px per char). 60px minimum between boxes.

*Single-line node*: 44px tall
*Two-line node*: 56px tall

Use class="c-blue" for colored nodes.

### Structural diagram
Large rounded rects are containers. Inner regions are smaller rects. 20px padding inside containers. Max 2-3 nesting levels.

**Database schemas / ERDs — use mermaid.js.**

### Illustrative diagram
Draw the mechanism. For physical subjects: cross-sections. For abstract: spatial metaphors.

- Shapes are freeform — use path, ellipse, circle.
- Color encodes intensity — warm = active, cool/gray = dormant.
- Layering and overlap encouraged for shapes.
- One gradient per diagram permitted.
- Animation permitted for interactive HTML — use CSS @keyframes, wrap in @media (prefers-reduced-motion: no-preference).

**Label placement**:
- Place labels outside drawn object with leader line.
- Pick one side for all labels. Default to right-side with text-anchor="start".

**Composition**:
1. Main object's silhouette — centered in viewBox
2. Add internal structure
3. Add external connections
4. Add state indicators last
5. Leave whitespace for labels`;

const ART_AND_ILLUSTRATION = `## Art and illustration
*"Draw me a sunset" / "Create a geometric pattern"*

Use imagine_svg:
- Fill the canvas — art should feel rich, not sparse
- Bold colors: mix categories for variety
- Art is the one place custom <style> color blocks are fine — freestyle colors, prefers-color-scheme variants
- Layer overlapping opaque shapes for depth
- Organic forms with path curves, ellipse, circle
- Texture via repetition (parallel lines, dots, hatching)
- Geometric patterns with transform="rotate()" for radial symmetry`;

const MODULE_SECTIONS: Record<string, string[]> = {
	art: [SVG_SETUP, ART_AND_ILLUSTRATION],
	mockup: [UI_COMPONENTS, COLOR_PALETTE],
	interactive: [UI_COMPONENTS, COLOR_PALETTE],
	chart: [UI_COMPONENTS, COLOR_PALETTE, CHARTS_CHART_JS],
	diagram: [COLOR_PALETTE, SVG_SETUP, DIAGRAM_TYPES],
};

export function getGuidelines(modules: string[]): string {
	let content = CORE;
	const seen = new Set<string>();
	for (const mod of modules) {
		const sections = MODULE_SECTIONS[mod];
		if (!sections) continue;
		for (const section of sections) {
			if (!seen.has(section)) {
				seen.add(section);
				content += `\n\n\n${section}`;
			}
		}
	}
	return `${content}\n`;
}

export const AVAILABLE_MODULES = Object.keys(MODULE_SECTIONS);

export const DESIGN_GUIDELINES = {
	core: CORE,
	modules: {
		interactive: CHARTS_CHART_JS,
		chart: CHARTS_CHART_JS,
		mockup: UI_COMPONENTS,
		art: ART_AND_ILLUSTRATION,
		diagram: DIAGRAM_TYPES,
	},
};
