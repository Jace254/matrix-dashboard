import { useState } from "react"

import { icons } from "@/lib/icons"
import { Img } from "@/components/icon"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

const ranges = ["Daily", "Weekly", "Monthly", "Yearly"]

export function ContentHeader({ onExport }: { onExport: () => void }) {
  const [range, setRange] = useState("Daily")
  const [exporting, setExporting] = useState<"idle" | "busy" | "done">("idle")

  const handleExport = () => {
    if (exporting !== "idle") return
    setExporting("busy")
    onExport()
    setTimeout(() => setExporting("done"), 650)
    setTimeout(() => setExporting("idle"), 2000)
  }

  return (
    <div className="flex flex-wrap items-center justify-between gap-3 animate-fade-up">
      <h1 className="whitespace-nowrap text-[24px] font-medium leading-[normal] tracking-[0.12px] text-foreground">
        Welcome back, Salung
      </h1>
      <div className="flex items-center gap-2">
        <div className="flex items-center overflow-clip rounded-[6px] bg-muted shadow-[0px_0px_0px_1px_rgba(0,0,0,0.2)] stroke-inside">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="group flex h-[38px] items-center justify-center gap-[6px] border-r-[0.6px] border-border px-[14px] py-[10px] text-[14px] leading-[normal] tracking-[0.07px] text-foreground outline-none transition-colors hover:bg-white/[0.04]">
                {range}
                <Img src={icons.chevronDown} width={10} height={10} className="transition-transform duration-200 group-data-[state=open]:rotate-180" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="min-w-[120px]">
              <DropdownMenuGroup>
                {ranges.map((r) => (
                  <DropdownMenuItem key={r} onSelect={() => setRange(r)}>
                    {r}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuGroup>
            </DropdownMenuContent>
          </DropdownMenu>
          <button className="flex h-[38px] items-center justify-center gap-[6px] px-[14px] py-[10px] text-[14px] leading-[normal] tracking-[0.07px] text-foreground outline-none transition-colors hover:bg-white/[0.04]">
            <Img src={icons.calendar16} width={16} height={16} />
            6 Nov 2025
          </button>
        </div>
        <Button variant="primary" onClick={handleExport} className="border border-white/20 font-medium" aria-live="polite">
          <span className="relative size-4">
            <Img
              src={icons.file02White}
              width={16}
              height={16}
              className={exporting === "busy" ? "animate-pulse" : "transition-transform duration-200"}
            />
          </span>
          {exporting === "done" ? "Exported" : "Export CSV"}
        </Button>
      </div>
    </div>
  )
}
