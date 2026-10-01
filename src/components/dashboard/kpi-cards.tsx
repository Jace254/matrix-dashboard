import { motion } from "motion/react"

import { kpis } from "@/lib/data"
import { icons } from "@/lib/icons"
import { cn } from "@/lib/utils"
import { Img } from "@/components/icon"
import { AnimatedNumber } from "@/components/animated-number"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"

export function KpiCards() {
  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
      {kpis.map((k, i) => (
        <motion.article
          key={k.id}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.05 + i * 0.07, ease: [0.16, 1, 0.3, 1] }}
          className="group flex flex-col overflow-clip rounded-[12px] bg-card-shell p-[2px] transition-shadow duration-300 hover:shadow-[0px_0px_0px_1px_rgba(0,0,0,0.06),0px_1px_1px_-0.5px_rgba(0,0,0,0.06),0px_3px_3px_-1.5px_rgba(0,0,0,0.06),_0px_6px_6px_-3px_rgba(0,0,0,0.06),0px_12px_12px_-6px_rgba(0,0,0,0.06),0px_24px_24px_-12px_rgba(0,0,0,0.06)]"
        >
          <div className="flex flex-col rounded-[10px] bg-card p-[14px] stroke-inside transition-colors duration-300 group-hover:after:border-white/[0.16]">
            <div className="flex items-start gap-[14px]">
              <div className="flex min-w-px flex-1 flex-col gap-[10px]">
                <h3 className="w-full font-mono text-[14px] font-normal uppercase leading-[normal] text-muted-foreground">{k.label}</h3>
                <div className="flex w-full items-center gap-2">
                  <AnimatedNumber
                    value={k.value}
                    prefix={k.prefix}
                    suffix={"suffix" in k ? k.suffix : ""}
                    decimals={k.decimals}
                    delay={0.15 + i * 0.07}
                    className="whitespace-nowrap font-mono text-[24px] font-semibold leading-[normal] text-foreground tabular"
                  />
                  {k.unit ? (
                    <span className="min-w-px flex-1 text-[12px] leading-[normal] text-muted-foreground">{k.unit}</span>
                  ) : (
                    <span className="h-[15px] w-[83px]" />
                  )}
                </div>
              </div>
              <MiniBars bars={k.bars} accent={k.accent} delay={0.2 + i * 0.07} />
            </div>
          </div>
          <div className="flex items-center justify-center gap-[10px] overflow-clip px-[12px] py-[10px]">
            <Tooltip>
              <TooltipTrigger asChild>
                <span className="flex size-[14px] items-center justify-center">
                  <Img src={icons.arrowUpCircle} width={14} height={14} className="transition-transform duration-300 group-hover:-translate-y-[1.5px]" />
                </span>
              </TooltipTrigger>
              <TooltipContent>Up {k.delta.toFixed(2).replace(".", ",")}% vs. last year</TooltipContent>
            </Tooltip>
            <p className="min-w-px flex-1 text-right font-display text-[12px] leading-[normal] tracking-[0.24px] text-[#7e7e7e]">
              <span className="font-medium text-success">+{k.delta.toFixed(2).replace(".", ",")}</span> last year
            </p>
          </div>
        </motion.article>
      ))}
    </div>
  )
}

function MiniBars({ bars, accent, delay }: { bars: readonly number[]; accent: number; delay: number }) {
  return (
    <div className="flex h-[56px] items-end gap-[6px]" aria-hidden="true">
      {bars.map((h, i) => (
        <motion.span
          key={i}
          initial={{ scaleY: 0 }}
          animate={{ scaleY: 1 }}
          transition={{ duration: 0.7, delay: delay + i * 0.04, ease: [0.16, 1, 0.3, 1] }}
          style={{ height: h, originY: 1 }}
          className={cn(
            "w-[2px] rounded-[88px] transition-[background-color,transform] duration-300",
            i === accent ? "bg-primary" : "bg-muted-3 group-hover:bg-[#4a4948]"
          )}
        />
      ))}
    </div>
  )
}
