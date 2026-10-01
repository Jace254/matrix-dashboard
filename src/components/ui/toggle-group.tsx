import * as React from "react"
import { ToggleGroup as ToggleGroupPrimitive } from "radix-ui"
import { motion } from "motion/react"

import { cn } from "@/lib/utils"

/**
 * shadcn/ui ToggleGroup styled as the design's segmented pill
 * (#252423 track, #393837 active thumb that slides between items).
 */
const ToggleGroupContext = React.createContext<{ value?: string; id: string }>({ id: "" })

function ToggleGroup({
  className,
  children,
  value,
  ...props
}: Omit<React.ComponentProps<typeof ToggleGroupPrimitive.Root>, "type"> & { value: string; onValueChange: (v: string) => void }) {
  const id = React.useId()
  return (
    <ToggleGroupContext.Provider value={{ value, id }}>
      <ToggleGroupPrimitive.Root
        data-slot="toggle-group"
        type="single"
        value={value}
        className={cn(
          "flex h-[30px] items-center overflow-clip rounded-[88px] bg-card-shell shadow-[0px_1px_1px_0px_rgba(255,255,255,0.06)]",
          className
        )}
        {...(props as object)}
      >
        {children}
      </ToggleGroupPrimitive.Root>
    </ToggleGroupContext.Provider>
  )
}

function ToggleGroupItem({ className, children, value, ...props }: React.ComponentProps<typeof ToggleGroupPrimitive.Item>) {
  const ctx = React.useContext(ToggleGroupContext)
  const active = ctx.value === value
  return (
    <ToggleGroupPrimitive.Item
      data-slot="toggle-group-item"
      value={value}
      className={cn(
        "relative flex h-full items-center rounded-[88px] px-[14px] py-[8px] text-[12px] leading-none tracking-[0.24px] outline-none transition-colors duration-200",
        active ? "text-foreground" : "text-muted-foreground hover:text-[#b3b3b3]",
        className
      )}
      {...props}
    >
      {active && (
        <motion.span
          layoutId={`${ctx.id}-thumb`}
          className="absolute inset-0 rounded-[88px] border-[0.6px] border-border bg-muted drop-shadow-[0px_1px_2px_rgba(12,12,13,0.05)]"
          transition={{ type: "spring", stiffness: 500, damping: 38 }}
        />
      )}
      <span className="relative">{children}</span>
    </ToggleGroupPrimitive.Item>
  )
}

export { ToggleGroup, ToggleGroupItem }
