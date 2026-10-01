import { useEffect, useId, useMemo, useRef, useState } from "react"
import { AnimatePresence, motion, useReducedMotion } from "motion/react"

import { PIXEL_ROWS, salesSeries, valueToCells, type Period } from "@/lib/data"
import { icons } from "@/lib/icons"
import { cn } from "@/lib/utils"
import { Img } from "@/components/icon"
import { AnimatedNumber } from "@/components/animated-number"
import { Button } from "@/components/ui/button"
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"

const POINTS = 57 // data points per period (one pixel column each on desktop)
const MIN_COL_W = 7 // below this, columns are down-sampled so pixels stay square-ish on small screens
const CELL = 10
const GAP = 2
const PITCH = CELL + GAP
const GRID_H = PIXEL_ROWS * PITCH - GAP // 298
const DEFAULT_POINT = 26 // the point highlighted in the design (Jun 2025)

const COLOR_EMPTY = "#393837"
const COLOR_NEW = "#444341"
const COLOR_EXISTING = "#f97316"

export function SalesTrend() {
  const [period, setPeriod] = useState<Period>("monthly")
  const series = salesSeries[period]

  return (
    <section className="flex min-w-0 flex-col rounded-[12px] bg-card-shell p-[2px]" aria-labelledby="sales-trend-title">
      <CardTitle id="sales-trend-title" title="Sales Trend" info="New vs. existing users revenue, in thousands" />
      <div className="relative h-[424px] overflow-hidden rounded-[10px] border-[0.6px] border-border bg-card [--chart-top:71px] max-sm:h-[468px] max-sm:[--chart-top:115px]">
        {/* Top row: total · legend · range */}
        <div className="absolute inset-x-[20px] top-[20px] flex flex-wrap items-start justify-between gap-x-4 gap-y-3 max-sm:inset-x-[16px]">
          <div className="flex h-[31px] items-center gap-[10px] whitespace-nowrap">
            <span className="text-[12px] leading-[normal] text-[#7e7e7e]">Total Revenue :</span>
            <AnimatedNumber
              value={series.total}
              prefix="$"
              duration={1.1}
              className="font-mono text-[24px] font-semibold leading-[normal] text-foreground tabular"
            />
          </div>
          <div className="pointer-events-none absolute left-[264.5px] top-[7px] hidden items-center gap-[28px] min-[900px]:flex lg:hidden min-[1180px]:flex" aria-hidden="true">
            <LegendItem color="#49433b" label="New user" />
            <LegendItem color={COLOR_EXISTING} label="existing user" />
          </div>
          <ToggleGroup value={period} onValueChange={(v: string) => v && setPeriod(v as Period)} aria-label="Sales period">
            <ToggleGroupItem value="weekly">Weekly</ToggleGroupItem>
            <ToggleGroupItem value="monthly">Monthly</ToggleGroupItem>
            <ToggleGroupItem value="yearly">Yearly</ToggleGroupItem>
          </ToggleGroup>
        </div>

        <PixelChart period={period} />
      </div>
    </section>
  )
}

function LegendItem({ color, label }: { color: string; label: string }) {
  return (
    <span className="flex items-center gap-[6px]">
      <span className="size-[6px] rounded-[4px] border border-black/10" style={{ background: color }} />
      <span className="whitespace-nowrap font-mono text-[12px] uppercase leading-[normal] tracking-[0.24px] text-soft-foreground">{label}</span>
    </span>
  )
}

export function CardTitle({ id, title, info, children }: { id?: string; title: string; info: string; children?: React.ReactNode }) {
  return (
    <div className="flex h-[42px] items-center justify-between gap-3 overflow-clip px-[14px] py-[12px]">
      <div className="flex min-w-0 items-center gap-2">
        <h2 id={id} className="truncate font-mono text-[14px] font-medium uppercase leading-[normal] tracking-[0.14px] text-muted-foreground">
          {title}
        </h2>
        <Tooltip>
          <TooltipTrigger asChild>
            <button className="flex size-[14px] shrink-0 items-center justify-center rounded-full opacity-100 outline-none transition-opacity hover:opacity-70" aria-label={`About ${title}`}>
              <Img src={icons.info} width={14} height={14} />
            </button>
          </TooltipTrigger>
          <TooltipContent>{info}</TooltipContent>
        </Tooltip>
      </div>
      <div className="flex items-center gap-2">
        {children}
        <Button variant="ghostRound" size="round" aria-label={`${title} options`}>
          <Img src={icons.more} width={14} height={14} />
        </Button>
      </div>
    </div>
  )
}

/* ------------------------------------------------------------------ */
/* Pixel line chart                                                    */
/* ------------------------------------------------------------------ */

function PixelChart({ period }: { period: Period }) {
  const uid = useId().replace(/:/g, "")
  const { points, axis } = salesSeries[period]
  const reduced = useReducedMotion()
  const frameRef = useRef<HTMLDivElement>(null)
  const [width, setWidth] = useState(682)
  const [revealed, setRevealed] = useState(false)
  const [hoverCol, setHoverCol] = useState<number | null>(null)

  // responsive column count: every point on desktop, evenly down-sampled on narrow screens
  const COLS = Math.max(16, Math.min(POINTS, Math.floor((width + GAP) / (MIN_COL_W + GAP))))
  const idxs = useMemo(
    () => Array.from({ length: COLS }, (_, i) => (COLS === POINTS ? i : Math.round((i * (POINTS - 1)) / (COLS - 1)))),
    [COLS]
  )
  const DEFAULT_COL = idxs.reduce((best, v, i) => (Math.abs(v - DEFAULT_POINT) < Math.abs(idxs[best] - DEFAULT_POINT) ? i : best), 0)
  const activeCol = Math.min(hoverCol ?? DEFAULT_COL, COLS - 1)
  const firstReveal = useRef(true)

  // measure frame → responsive column pitch
  useEffect(() => {
    const el = frameRef.current
    if (!el) return
    const ro = new ResizeObserver(([e]) => setWidth(e.contentRect.width))
    ro.observe(el)
    return () => ro.disconnect()
  }, [])

  // reveal once in view
  useEffect(() => {
    const el = frameRef.current
    if (!el) return
    const io = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) {
          requestAnimationFrame(() => setRevealed(true))
          io.disconnect()
        }
      },
      { threshold: 0.2 }
    )
    io.observe(el)
    return () => io.disconnect()
  }, [])

  useEffect(() => {
    if (revealed) {
      const t = setTimeout(() => (firstReveal.current = false), 1600)
      return () => clearTimeout(t)
    }
  }, [revealed])

  const colW = (width - GAP * (COLS - 1)) / COLS
  const colCenter = (c: number) => c * (colW + GAP) + colW / 2

  // cells: rendered once per period, colours change through CSS transitions
  const cells = useMemo(() => {
    const out: React.ReactNode[] = []
    for (let r = 0; r < PIXEL_ROWS; r++) {
      const level = PIXEL_ROWS - r // 25 at top … 1 at bottom
      for (let c = 0; c < COLS; c++) {
        const p = points[idxs[c]]
        const nCells = valueToCells(p.newUser)
        const eCells = valueToCells(p.existing)
        const color = !revealed ? COLOR_EMPTY : level <= eCells ? COLOR_EXISTING : level <= nCells ? COLOR_NEW : COLOR_EMPTY
        // first reveal: rise from the baseline, sweeping left → right; later: soft wave
        const delay = reduced ? 0 : firstReveal.current ? c * 14 + (PIXEL_ROWS - r) * 22 : c * 9 + (PIXEL_ROWS - r) * 6
        out.push(
          <div
            key={`${r}-${c}`}
            data-c={c}
            className="pc rounded-[1px]"
            style={{ backgroundColor: color, ["--d" as string]: `${delay}ms` }}
          />
        )
      }
    }
    return out
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [points, revealed, reduced, idxs])

  const p = points[idxs[activeCol]]
  const topCells = Math.max(1, valueToCells(p.newUser))
  const markerY = (PIXEL_ROWS - topCells) * PITCH + CELL / 2 - 0.5
  const cx = colCenter(activeCol)
  const TOOLTIP_W = 156
  const flip = cx + 8 + TOOLTIP_W > width
  const tooltipX = flip ? cx - 8 - TOOLTIP_W : cx + 8
  const tooltipY = Math.min(Math.max(markerY - 19.5, -60), GRID_H - 107)
  const activeAxis = Math.min(axis.length - 1, Math.floor((idxs[activeCol] * axis.length) / POINTS))

  const compactAxis = width < 440 && axis.length > 7

  const onMove = (e: React.PointerEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect()
    const x = e.clientX - rect.left
    const c = Math.max(0, Math.min(COLS - 1, Math.floor(x / (colW + GAP))))
    if (c !== hoverCol) setHoverCol(c)
  }

  const onKey = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowRight" || e.key === "ArrowLeft") {
      e.preventDefault()
      const d = e.key === "ArrowRight" ? 1 : -1
      setHoverCol((h) => Math.max(0, Math.min(COLS - 1, (h ?? DEFAULT_COL) + d)))
    }
    if (e.key === "Escape") setHoverCol(null)
  }

  const spring = { type: "spring", stiffness: 520, damping: 42, mass: 0.7 } as const

  return (
    <>
      {/* Y axis labels + dotted ticks */}
      <div className="pointer-events-none absolute left-[20px] top-[calc(var(--chart-top)-1px)] w-[29px] max-sm:left-[14px]" aria-hidden="true">
        {["60k", "50k", "40k", "30k", "20k", "10k", "0k"].map((l, i) => (
          <p key={l} className="absolute left-0 font-display text-[12px] leading-[15px] tracking-[0.24px] text-muted-foreground" style={{ top: i * 47 }}>
            {l}
          </p>
        ))}
      </div>
      <svg className="pointer-events-none absolute left-[52.9px] top-[calc(var(--chart-top)+5.4px)] max-sm:left-[38.9px]" width="22.1" height="285.2" viewBox="0 0 22.1 285.2" aria-hidden="true">
        {Array.from({ length: 7 }, (_, i) => (
          <g key={i} transform={`translate(0 ${i * 47})`}>
            <circle cx="1.6" cy="1.6" r="1.6" fill="#808080" />
            <line x1="1.6" y1="1.6" x2="22.1" y2="1.6" stroke="#808080" strokeWidth="0.6" strokeDasharray="0.7885 0.7885" strokeDashoffset="0.3945" />
          </g>
        ))}
      </svg>

      {/* Chart frame */}
      <div
        ref={frameRef}
        role="img"
        tabIndex={0}
        aria-label={`Sales trend ${period}. ${p.label}: new users ${Math.round(p.newUser)}k, existing users ${Math.round(p.existing)}k. Use arrow keys to inspect.`}
        onPointerMove={onMove}
        onPointerLeave={() => setHoverCol(null)}
        onKeyDown={onKey}
        onBlur={() => setHoverCol(null)}
        className="group/chart absolute left-[76px] right-[20px] top-(--chart-top) max-sm:left-[62px] max-sm:right-[14px] cursor-crosshair rounded-[2px] outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-4 focus-visible:ring-offset-card"
        style={{ height: GRID_H }}
      >
        <style>{`
          .${uid} .pc { transition: background-color 420ms cubic-bezier(.16,1,.3,1), opacity 180ms ease, filter 180ms ease; transition-delay: var(--d), 0ms, 0ms; }
          ${hoverCol !== null ? `.${uid} .pc:not([data-c="${hoverCol}"]) { opacity: .72; } .${uid} .pc[data-c="${hoverCol}"] { filter: brightness(1.22); }` : ""}
        `}</style>
        <div
          className={cn(uid, "grid h-full w-full")}
          style={{ gridTemplateColumns: `repeat(${COLS}, minmax(0, 1fr))`, gridTemplateRows: `repeat(${PIXEL_ROWS}, ${CELL}px)`, gap: GAP }}
        >
          {cells}
        </div>

        {/* crosshair */}
        <motion.svg
          className="pointer-events-none absolute top-0"
          width="0.6"
          height={GRID_H}
          viewBox={`0 0 0.6 ${GRID_H}`}
          initial={false}
          animate={{ x: cx - 0.3, opacity: revealed ? 1 : 0 }}
          transition={spring}
          aria-hidden="true"
        >
          <defs>
            <linearGradient id={`${uid}-xh`} x1="0.8" y1="0" x2="0.8" y2={GRID_H} gradientUnits="userSpaceOnUse">
              <stop stopColor="white" stopOpacity="0" />
              <stop offset="0.159935" stopColor="white" />
              <stop offset="1" stopColor="white" />
            </linearGradient>
          </defs>
          <path d={`M0.3 ${GRID_H}V0`} stroke={`url(#${uid}-xh)`} strokeWidth="0.6" strokeDasharray="2 4" />
        </motion.svg>

        {/* marker */}
        <motion.span
          className="pointer-events-none absolute left-0 top-0 size-[9px] rounded-[88px] border border-white bg-[#1a1a1a] shadow-[0px_0px_0px_2px_rgba(26,26,26,0.1),0px_2px_4px_0px_rgba(0,0,0,0.25)]"
          initial={false}
          animate={{ x: cx - 4.5, y: markerY - 4.5, opacity: revealed ? 1 : 0, scale: revealed ? 1 : 0.4 }}
          transition={{ ...spring, opacity: { delay: revealed && firstReveal.current ? 1.1 : 0 } }}
          aria-hidden="true"
        />

        {/* tooltip */}
        <motion.div
          className="pointer-events-none absolute left-0 top-0 z-10 flex w-[156px] flex-col overflow-clip rounded-[8px] stroke-inside !absolute bg-gradient-to-b from-[#393837] to-[#2f2e2d] p-[4px] shadow-[0px_4px_12px_0px_rgba(0,0,0,0.4),0px_0px_0px_1px_rgba(0,0,0,0.2)]"
          initial={false}
          animate={{ x: tooltipX, y: tooltipY, opacity: revealed ? 1 : 0 }}
          transition={{ ...spring, opacity: { duration: 0.3, delay: revealed && firstReveal.current ? 1.2 : 0 } }}
          aria-hidden="true"
        >
          <div className="flex w-full items-center rounded-[6px] bg-gradient-to-b from-white/[0.02] to-white/[0.06] p-[8px] shadow-[inset_0_0_0_1px_rgba(255,255,255,0.08)]">
            <AnimatePresence mode="popLayout" initial={false}>
              <motion.p
                key={p.label}
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -4 }}
                transition={{ duration: 0.16 }}
                className="flex-1 whitespace-nowrap text-[14px] leading-[normal] tracking-[-0.14px] text-[#979797]"
              >
                {p.label}
              </motion.p>
            </AnimatePresence>
          </div>
          <TooltipRow dot="#49433b" label="New User" value={p.newUser} />
          <TooltipRow dot={COLOR_EXISTING} label="Existing User" value={p.existing} />
        </motion.div>
      </div>

      {/* X axis */}
      <div className="pointer-events-none absolute left-[76px] right-[20px] top-[calc(var(--chart-top)+318px)] flex items-center justify-between max-sm:left-[62px] max-sm:right-[14px]" aria-hidden="true">
        {axis.map((l, i) => (
          <span key={`${period}-${l}`} className="contents">
            {i > 0 && !compactAxis && <span className="size-[3px] shrink-0 rounded-full bg-subtle-foreground" />}
            <span
              className={cn(
                "min-w-px flex-1 text-center text-[12px] uppercase leading-[normal] transition-colors duration-200",
                i === (compactAxis ? activeAxis - (activeAxis % 2) : activeAxis) ? "font-medium text-foreground" : "text-subtle-foreground"
              )}
            >
              {compactAxis && i % 2 === 1 ? "" : l}
            </span>
          </span>
        ))}
      </div>
    </>
  )
}

function TooltipRow({ dot, label, value }: { dot: string; label: string; value: number }) {
  return (
    <div className="flex w-full items-center gap-[6px] overflow-clip p-[8px]">
      <span className="size-[4px] shrink-0 rounded-full" style={{ background: dot }} />
      <span className="whitespace-nowrap text-[12px] leading-[normal] tracking-[-0.12px] text-soft-foreground">{label}</span>
      <AnimatePresence mode="popLayout" initial={false}>
        <motion.span
          key={Math.round(value)}
          initial={{ opacity: 0, y: 5 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -5 }}
          transition={{ duration: 0.18, ease: [0.16, 1, 0.3, 1] }}
          className="whitespace-nowrap text-[14px] font-medium leading-[normal] tracking-[-0.14px] text-foreground tabular"
        >
          {Math.round(value)}k
        </motion.span>
      </AnimatePresence>
    </div>
  )
}
