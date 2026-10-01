import { useEffect, useRef } from "react"
import { animate, useInView, useReducedMotion } from "motion/react"

type Props = {
  value: number
  decimals?: number
  prefix?: string
  suffix?: string
  duration?: number
  delay?: number
  className?: string
}

/**
 * Count-up number. Animates from 0 on first view, then tweens between values
 * whenever `value` changes (e.g. switching Weekly / Monthly / Yearly).
 * Writes straight to the DOM node so React doesn't re-render every frame.
 */
export function AnimatedNumber({ value, decimals = 0, prefix = "", suffix = "", duration = 1.4, delay = 0, className }: Props) {
  const ref = useRef<HTMLSpanElement>(null)
  const inView = useInView(ref, { once: true })
  const from = useRef(0)
  const reduced = useReducedMotion()

  const format = (n: number) =>
    `${prefix}${n.toLocaleString("en-US", { minimumFractionDigits: decimals, maximumFractionDigits: decimals })}${suffix}`

  useEffect(() => {
    const el = ref.current
    if (!el || !inView) return
    if (reduced) {
      el.textContent = format(value)
      from.current = value
      return
    }
    const controls = animate(from.current, value, {
      duration,
      delay,
      ease: [0.16, 1, 0.3, 1],
      onUpdate: (v) => {
        el.textContent = format(v)
      },
      onComplete: () => {
        from.current = value
      },
    })
    return () => {
      from.current = value
      controls.stop()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value, inView, reduced])

  return (
    <span ref={ref} className={className} aria-label={format(value)}>
      {format(reduced ? value : 0)}
    </span>
  )
}
