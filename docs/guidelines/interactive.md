# Interactive — Sliders, Controls, Live Calculations

For interactive explainers with controls, sliders, live calculations.

## Patterns
- **Sliders**: `<input type="range">` with Alpine.js `x-model` for reactivity
- **Metric cards**: Show key numbers with labels above, bold values below
- **Live calculations**: Update results as inputs change using computed properties
- **Toggle switches**: For binary states

## Example Structure
```html
<div x-data="{ years: 20, rate: 5, principal: 1000 }">
  <div class="flex items-center gap-3">
    <label class="text-sm text-gray-600 dark:text-gray-400">Years</label>
    <input type="range" x-model="years" min="1" max="40" class="flex-1">
    <span class="text-sm font-medium w-6" x-text="years">20</span>
  </div>
  <div class="flex items-baseline gap-2 mt-4">
    <span class="text-sm text-gray-600">$1,000 →</span>
    <span class="text-2xl font-medium" x-text="'$' + Math.round(principal * Math.pow(1 + rate/100, years)).toLocaleString()">$2,653</span>
  </div>
</div>
```

Use sendPrompt() to let users ask follow-ups: `sendPrompt('What if I increase the rate to 10%?')`

## UI Tokens
- Buttons: Transparent bg, 0.5px border, hover bg-secondary, active scale(0.98)
- **Round every displayed number** — JS float math leaks artifacts. Use `Math.round()`, `.toFixed(n)`, or `Intl.NumberFormat`.
- Spacing: rem for rhythm, px for gaps