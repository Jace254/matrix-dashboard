# Ascend — Overview dashboard

**Stack:** Vite + React 19 + TypeScript, Tailwind CSS v4, shadcn/ui-style components on Radix primitives, Motion for animation.

## Run

```bash
npm install
npm run dev        # http://localhost:5173
npm run build      # production build → dist/
npx vite build --mode single   # one self-contained HTML → dist-single/index.html
```

`dashboard.html` (next to this README) is that single-file build — double-click to open, no server needed.

## What's interactive

- **Sales Trend pixel chart** — a line chart rendered as a 25-row pixel grid (1 row = $2.5k). Hover / arrow-keys move the crosshair, marker, and tooltip; the hovered column lights up. Weekly / Monthly / Yearly re-flows the grid with a staggered wave. Down-samples columns on narrow screens.
- **Count-up numbers** on KPIs, totals, and table values (tween between values when data changes).
- **Revenue Breakdown** — bars grow in, hover shows revenue vs. target, date-range menu swaps data, AI insight expands.
- **Transactions** — search filter, sortable columns, select-all (with indeterminate), row actions menu, Add Transaction.
- Sidebar active pill slides between items; team + profile menus; ⌘K focuses search; Export CSV downloads a real file.
- Responsive: drawer sidebar < 1280px, stacked cards < 1024px, mobile layout down to 320px. Honors `prefers-reduced-motion`.

All icons, logo and avatar are the exact assets exported from Figma (`src/assets`).
# matrix-dashboard
