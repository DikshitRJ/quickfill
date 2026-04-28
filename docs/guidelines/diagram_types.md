## Diagram types
*"Explain how compound interest works" / "How does a process scheduler work"*

**Two rules that cause most diagram failures — check these before writing each arrow and each box:**
1. **Arrow intersection check**: before writing any `<line>` or `<path>`, trace its coordinates against every box you've already placed. If the line crosses any rect's interior (not just its source/target), it will visibly slash through that box — use an L-shaped `<path>` detour instead. This applies to arrows crossing labels too.
2. **Box width from longest label**: before writing a `<rect>`, find its longest child text (usually the subtitle). `rect_width = max(title_chars × 8, subtitle_chars × 7) + 24`. A 100px-wide box holds at most a 10-char subtitle. If your subtitle is "Files, APIs, streams" (20 chars), the box needs 164px minimum — 100px will visibly overflow.

**Tier packing:** Compute total width BEFORE placing. Example — 4 pub/sub consumer boxes:
- WRONG: x=40,160,260,360 w=160 → 40-60px overlaps (4×160=640 > 480 available)
- RIGHT: x=50,200,350,500 w=130 gap=20 → fits (4×130 + 3×20 = 580 ≤ 590 safe width; right edge at 630 ≤ 640)
Work bottom-up for trees: size leaf tier first, parent width ≥ sum of children.

**Diagrams are the hardest use case** — they have the highest failure rate due to precise coordinate math. Common mistakes: viewBox too small (content clipped), arrows through unrelated boxes, labels on arrow lines, text past viewBox edges. For illustrative diagrams, also watch for: shapes extending outside the viewBox, overlapping labels that obscure the drawing, and color choices that don't map intuitively to the physical properties being shown. Double-check coordinates before finalizing.

**Pick the right diagram type.** The decision is about *intent*, not subject matter. Ask: is the user trying to *document* this, or *understand* it?

**Reference diagrams** — the user wants a map they can point at. Precision matters more than feeling. Boxes, labels, arrows, containment. These are the diagrams you'd find in documentation.
- **Flowchart** — steps in sequence, decisions branching, data transforming. Good for: approval workflows, request lifecycles, build pipelines, "what happens when I click submit". Trigger phrases: *"walk me through the process"*, *"what are the steps"*, *"what's the flow"*.
- **Structural diagram** — things inside other things. Good for: file systems (blocks in inodes in partitions), VPC/subnet/instance, "what's inside a cell". Trigger phrases: *"what's the architecture"*, *"how is this organised"*, *"where does X live"*.

**Intuition diagrams** — the user wants to *feel* how something works. The goal isn't a correct map, it's the right mental model. These should look nothing like a flowchart. The subject doesn't need a physical form — it needs a *visual metaphor*.
- **Illustrative diagram** — draw the mechanism. Physical things get cross-sections. Abstract things get spatial metaphors: an LLM is a stack of layers with tokens lighting up as attention weights, gradient descent is a ball rolling down a loss surface, a hash table is a row of buckets with items falling into them. Good for: ML concepts, physics intuition, CS fundamentals, anything where the breakthrough is *seeing* it rather than *reading* it. Trigger phrases: *"how does X actually work"*, *"explain X"*, *"I don't get X"*, *"give me an intuition for X"*.

**Route on the verb, not the noun.** Same subject, different diagram depending on what was asked:

| User says | Type | What to draw |
|---|---|---|
| "how do LLMs work" | **Illustrative** | Token row, stacked layer slabs, attention threads glowing warm between tokens. Go interactive if you can. |
| "transformer architecture" | Structural | Labelled boxes: embedding, attention heads, FFN, layer norm. |
| "how does attention work" | **Illustrative** | One query token, a fan of lines to every key, line opacity = weight. |
| "how does gradient descent work" | **Illustrative** | Contour surface, a ball, a trail of steps. Slider for learning rate. |
| "what are the training steps" | Flowchart | Forward → loss → backward → update. Boxes and arrows. |
| "how does a hash map work" | **Illustrative** | Key falling through a funnel into one of N buckets. |
| "draw the database schema" / "show me the ERD" | **mermaid.js** | `erDiagram` syntax. Not SVG. |

The illustrative route is the default for *"how does X work"* with no further qualification. It is the more ambitious choice — don't chicken out into a flowchart because it feels safer.

**For complex topics, use multiple SVG calls** — break the explanation into a series of smaller diagrams rather than one dense diagram.

**Always add prose between diagrams** — never stack multiple SVG calls back-to-back without text. Between each SVG, write a short paragraph in your normal response text that explains what the next diagram shows.

### Flowchart

For sequential processes, cause-and-effect, decision trees.

**Planning**: Size boxes to fit their text generously. At 14px sans-serif, each character is ~8px wide — a label like "Load Balancer" (13 chars) needs a rect at least 140px wide.

**Spacing**: 60px minimum between boxes, 24px padding inside boxes, 12px between text and edges. Leave 10px gap between arrowheads and box edges. Two-line boxes (title + subtitle) need at least 56px height with 22px between the lines.

**Vertical text placement**: Every `<text>` inside a box needs `dominant-baseline="central"`, with y set to the *centre* of the slot it sits in.

**Layout**: Prefer single-direction flows (all top-down or all left-right). Keep diagrams simple — max 4-5 nodes per diagram. The widget is narrow (~680px) so complex layouts break.

**Arrows:** A line from A to B must not cross any other box or label. If the direct path crosses something, route around with an L-bend: `<path d="M x1 y1 L x1 ymid L x2 ymid L x2 y2"/>`. Place arrow labels in clear space, not on the midpoint.

**Flowchart components** — use these patterns consistently:

*Single-line node* (44px tall):
```svg
<g class="node c-blue" onclick="sendPrompt('Tell me more about T-cells')">
  <rect x="100" y="20" width="180" height="44" rx="8" stroke-width="0.5"/>
  <text class="th" x="190" y="42" text-anchor="middle" dominant-baseline="central">T-cells</text>
</g>
```

*Two-line node* (56px tall):
```svg
<g class="node c-blue" onclick="sendPrompt('Tell me more about dendritic cells')">
  <rect x="100" y="20" width="200" height="56" rx="8" stroke-width="0.5"/>
  <text class="th" x="200" y="38" text-anchor="middle" dominant-baseline="central">Dendritic cells</text>
  <text class="ts" x="200" y="56" text-anchor="middle" dominant-baseline="central">Detect foreign antigens</text>
</g>
```

Make all nodes clickable by default — wrap in `<g class="node" onclick="sendPrompt('...')">`. The hover effect is built in.

### Structural diagram

For concepts where physical or logical containment matters — things inside other things.

**Container rules**:
- Outermost container: large rounded rect, rx=20-24, lightest fill (50 stop), 0.5px stroke (600 stop). Label at top-left inside, 14px bold.
- Inner regions: medium rounded rects, rx=8-12, next shade fill (100-200 stop). Use a different color ramp if the region is semantically different from its parent.
- 20px minimum padding inside every container.
- Max 2-3 nesting levels.

**Database schemas / ERDs — use mermaid.js, not SVG.** mermaid.js `erDiagram` does layout, cardinality, and connector routing for free.

### Illustrative diagram

For building *intuition*. Physical subjects get drawn as simplified versions of themselves. Abstract subjects get drawn as *spatial metaphors*. This is the most ambitious diagram type and the one Claude is best at.

**Prefer interactive over static.** If the real-world system has a control, give the diagram that control.

**Core principle**: Draw the mechanism, not a diagram *about* the mechanism. Spatial arrangement carries the meaning; labels annotate.

**What changes from flowchart/structural rules**:
- **Shapes are freeform.** Use `<path>`, `<ellipse>`, `<circle>`, `<polygon>`.
- **Color encodes intensity**, not category. Warm ramps = active/high-weight, cool or gray = dormant.
- **Layering and overlap are encouraged — for shapes.**
- **One gradient per diagram is permitted** — only to show a continuous physical property.
- **Animation is permitted for interactive HTML versions.** Use CSS `@keyframes` animating only `transform` and `opacity`. Wrap in `@media (prefers-reduced-motion: no-preference)`.

**Label placement**:
- Place labels *outside* the drawn object when possible, with a thin leader line pointing to the relevant part.
- External labels sit in the margin area or above/below the object.
- Pick one side for labels and put them all there. Default to right-side labels with `text-anchor="start"`.

**Composition approach**:
1. Start with the main object's silhouette — the largest shape, centered in the viewBox.
2. Add internal structure.
3. Add external connections.
4. Add state indicators last.
5. Leave generous whitespace around the object for labels.