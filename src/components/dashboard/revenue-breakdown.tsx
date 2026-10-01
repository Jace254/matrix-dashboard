import { useMemo, useState } from "react"
import { AnimatePresence, motion, useReducedMotion } from "motion/react"

import { fmtMoney, revenueBars } from "@/lib/data"
import { icons } from "@/lib/icons"
import { cn } from "@/lib/utils"
import { Img } from "@/components/icon"
import { AnimatedNumber } from "@/components/animated-number"
import { CardTitle } from "@/components/dashboard/sales-trend"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

const BODY_W = 352 // design width of the card body
const BASELINE = 368.4 // y of the bar baseline inside the body

const ranges = [
  { id: "ytd", label: "Jan 1 - Aug 30", total: 20320, scale: 1, from: "1 Jan", to: "30 Jan 2025" },
  { id: "q3", label: "Jul 1 - Sep 30", total: 17480, scale: 0.86, from: "1 Jul", to: "30 Sep 2025" },
  { id: "30d", label: "Last 30 days", total: 6940, scale: 0.72, from: "7 Oct", to: "6 Nov 2025" },
]

const insight =
  "Revenue peaked on Jan 10 and Jan 20 — both days had a promo push. Existing customers drove 71% of category revenue; Ergo seating is the top performer."

export function RevenueBreakdown() {
  const [rangeId, setRangeId] = useState("ytd")
  const [hover, setHover] = useState<number | null>(null)
  const [aiOpen, setAiOpen] = useState(false)
  const reduced = useReducedMotion()
  const range = ranges.find((r) => r.id === rangeId)!

  // alternate ranges reshuffle heights a little so the change is visible
  const bars = useMemo(
    () =>
      revenueBars.map((b, i) => {
        if (range.scale === 1) return b
        const k = range.scale * (0.85 + ((i * 37) % 11) / 30)
        const total = Math.min(210, b.total * k)
        const value = Math.min(total - 14, b.value * k)
        return { ...b, total, value, revenue: Math.round(value * 10), target: Math.round(total * 10) }
      }),
    [range.scale]
  )

  return (
    <section className="flex min-w-0 flex-col rounded-[12px] bg-card-shell p-[2px]" aria-labelledby="revenue-title">
      <CardTitle id="revenue-title" title="Revenue Breakdown" info="Daily revenue against category target" />
      <div className="relative h-[424px] overflow-hidden rounded-[10px] border-[0.6px] border-border bg-card">
        {/* dotted grid */}
        {Array.from({ length: 8 }, (_, i) => (
          <DottedLine key={i} className="absolute left-[8.8px] right-[11.6px]" style={{ top: 142.8 + i * 32 }} color="#554E44" dash="2 3" offset={1} />
        ))}

        {/* heading */}
        <div className="absolute left-[19.4px] top-[19.4px] flex flex-col justify-center gap-[6px]">
          <p className="whitespace-nowrap text-[12px] leading-[normal] text-[#7e7e7e]">Revenue by Category</p>
          <AnimatedNumber value={range.total} prefix="$" className="font-mono text-[24px] font-semibold leading-[normal] text-foreground tabular" />
        </div>

        {/* date range */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="group absolute right-[15.4px] top-[15.4px] flex h-[34px] items-center justify-center gap-[6px] overflow-clip rounded-[88px] border-[0.6px] border-border bg-card p-[10px] shadow-[0px_0px_0px_1px_rgba(0,0,0,0.2)] outline-none transition-colors hover:bg-muted">
              <Img src={icons.calendar14} width={14} height={14} />
              <span className="whitespace-nowrap text-[12px] leading-[1.6] text-muted-foreground transition-colors group-hover:text-[#b3b3b3]">{range.label}</span>
              <Img src={icons.chevronDownLight} width={10} height={10} className="transition-transform duration-200 group-data-[state=open]:rotate-180" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuGroup>
              {ranges.map((r) => (
                <DropdownMenuItem key={r.id} onSelect={() => setRangeId(r.id)}>
                  <span className={cn("size-1.5 rounded-full", r.id === rangeId ? "bg-primary" : "bg-muted-2")} />
                  {r.label}
                </DropdownMenuItem>
              ))}
            </DropdownMenuGroup>
          </DropdownMenuContent>
        </DropdownMenu>

        {/* AI insight */}
        <div className="absolute left-[5.4px] right-[5.4px] top-[83.4px] z-10">
          <button
            onClick={() => setAiOpen((o) => !o)}
            aria-expanded={aiOpen}
            className="group flex w-full flex-col overflow-clip rounded-[10px] bg-muted p-[8px] stroke-inside text-left shadow-[0px_0px_0px_1px_rgba(0,0,0,0.2)] outline-none transition-[background-color,box-shadow] duration-200 hover:bg-[#3f3e3c] hover:shadow-[0px_0px_0px_1px_rgba(0,0,0,0.2),0px_8px_20px_-8px_rgba(0,0,0,0.5)]"
          >
            <span className="flex w-full items-center justify-between">
              <span className="flex items-center gap-[10px]">
                <span className="relative size-[27px] overflow-clip rounded-[6px] border-[0.6px] border-[rgba(221,221,221,0.1)] bg-muted-2">
                  <Img src={icons.stars} width={13} height={13} className="absolute left-[6.4px] top-[6.4px] transition-transform duration-500 ease-spring group-hover:rotate-[20deg] group-hover:scale-110" />
                </span>
                <span className="whitespace-nowrap text-[12px] leading-[1.6] text-foreground">Get AI insight for better analysis</span>
              </span>
              <span className={cn("flex size-[14px] items-center justify-center transition-transform duration-300", aiOpen ? "rotate-180" : "rotate-90 group-hover:translate-x-[2px]")}>
                <Img src={icons.arrowUpCircle} width={14} height={14} />
              </span>
            </span>
            <AnimatePresence initial={false}>
              {aiOpen && (
                <motion.span
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
                  className="block overflow-hidden"
                >
                  <span className="block pt-[8px] text-[12px] leading-[1.6] text-[#b3b3b3]">{insight}</span>
                </motion.span>
              )}
            </AnimatePresence>
          </button>
        </div>

        {/* bars */}
        <div className="absolute inset-0" onPointerLeave={() => setHover(null)}>
          {bars.map((b, i) => {
            const left = `${(b.x / BODY_W) * 100}%`
            const dim = hover !== null && hover !== i
            return (
              <div
                key={i}
                className="absolute bottom-0 w-[24px] -translate-x-[10px] cursor-pointer"
                style={{ left, top: 150 }}
                onPointerEnter={() => setHover(i)}
                onFocus={() => setHover(i)}
                onBlur={() => setHover(null)}
                tabIndex={0}
                role="img"
                aria-label={`${b.date}: ${fmtMoney(b.revenue)} of ${fmtMoney(b.target)} target`}
              >
                <motion.span
                  className={cn("absolute left-[10px] w-[4px] rounded-[6px] transition-[background-color,opacity] duration-200", hover === i ? "bg-[#4a4947]" : "bg-muted", dim && "opacity-60")}
                  style={{ height: b.total, top: BASELINE - 150 - b.total, originY: 1 }}
                  initial={{ scaleY: 0 }}
                  animate={{ scaleY: 1, height: b.total, top: BASELINE - 150 - b.total }}
                  transition={{ duration: reduced ? 0 : 0.9, delay: reduced ? 0 : 0.25 + i * 0.045, ease: [0.16, 1, 0.3, 1] }}
                />
                <motion.span
                  className={cn("absolute w-[4px] rounded-[6px] bg-primary transition-[opacity,filter] duration-200", dim && "opacity-45", hover === i && "brightness-110")}
                  style={{
                    height: b.value,
                    top: BASELINE - 150 - b.value,
                    originY: 1,
                    left: i === 4 ? 10.32 : 10,
                    width: i === 4 ? 3.84 : 4,
                  }}
                  initial={{ scaleY: 0 }}
                  animate={{ scaleY: 1, height: b.value, top: BASELINE - 150 - b.value }}
                  transition={{ duration: reduced ? 0 : 0.9, delay: reduced ? 0 : 0.45 + i * 0.045, ease: [0.16, 1, 0.3, 1] }}
                />
              </div>
            )
          })}

          {/* hover tooltip */}
          <AnimatePresence>
            {hover !== null && (
              <motion.div
                key="rb-tip"
                className="pointer-events-none absolute z-20 w-[150px] rounded-[8px] border-[0.6px] border-border bg-gradient-to-b from-[#393837] to-[#2f2e2d] p-[4px] shadow-[0px_4px_12px_0px_rgba(0,0,0,0.4),0px_0px_0px_1px_rgba(0,0,0,0.2)]"
                initial={{ opacity: 0, scale: 0.96 }}
                animate={{
                  opacity: 1,
                  scale: 1,
                  left: `calc(${(bars[hover].x / BODY_W) * 100}% ${bars[hover].x > BODY_W / 2 ? "- 158px" : "+ 12px"})`,
                  top: Math.max(130, BASELINE - bars[hover].total - 20),
                }}
                exit={{ opacity: 0, scale: 0.96 }}
                transition={{ type: "spring", stiffness: 520, damping: 40 }}
              >
                <div className="rounded-[6px] border border-white/[0.08] bg-gradient-to-b from-white/[0.02] to-white/[0.06] px-[8px] py-[6px] text-[13px] leading-[normal] text-[#979797]">
                  {bars[hover].date}, 2025
                </div>
                <div className="flex items-center gap-[6px] px-[8px] pb-[4px] pt-[8px]">
                  <span className="size-[4px] rounded-full bg-primary" />
                  <span className="text-[12px] text-soft-foreground">Revenue</span>
                  <span className="ml-auto text-[13px] font-medium text-foreground tabular">{fmtMoney(bars[hover].revenue)}</span>
                </div>
                <div className="flex items-center gap-[6px] px-[8px] pb-[6px] pt-[4px]">
                  <span className="size-[4px] rounded-full bg-[#49433b]" />
                  <span className="text-[12px] text-soft-foreground">Target</span>
                  <span className="ml-auto text-[13px] font-medium text-foreground tabular">{fmtMoney(bars[hover].target)}</span>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* date axis */}
        <div className="pointer-events-none absolute bottom-[19.4px] left-[10.4px] right-[11.6px] flex items-center gap-[10px]">
          <p className="whitespace-nowrap text-[12px] uppercase leading-[normal] text-subtle-foreground">{range.from}</p>
          <DottedLine className="relative min-w-px flex-1" color="#666666" dash="2.02 3.03" offset={1.01} bothEnds />
          <p className="whitespace-nowrap text-right text-[12px] uppercase leading-[normal] text-subtle-foreground">{range.to}</p>
        </div>
      </div>
    </section>
  )
}

/** Figma "dotted" vector: a 3.2px dot (or two) plus a 0.6px dashed rule. */
function DottedLine({
  className,
  style,
  color,
  dash,
  offset,
  bothEnds,
}: {
  className?: string
  style?: React.CSSProperties
  color: string
  dash: string
  offset: number
  bothEnds?: boolean
}) {
  return (
    <div className={cn("pointer-events-none h-[3.2px]", className)} style={style} aria-hidden="true">
      <svg className="absolute inset-0 h-full w-full overflow-visible">
        <circle cx="1.6" cy="1.6" r="1.6" fill={color} />
        <line x1="1.6" y1="1.6" x2="100%" y2="1.6" stroke={color} strokeWidth="0.6" strokeDasharray={dash} strokeDashoffset={offset} />
      </svg>
      {bothEnds && <span className="absolute right-0 top-0 size-[3.2px] rounded-full" style={{ background: color }} />}
    </div>
  )
}
