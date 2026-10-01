import type { CSSProperties } from "react"
import { cn } from "@/lib/utils"

/**
 * Renders a Figma-exported SVG as a CSS mask so its colour can follow `currentColor`
 * (hover / active states) while keeping the exact exported geometry.
 */
export function MaskIcon({ src, size = 16, className, style }: { src: string; size?: number; className?: string; style?: CSSProperties }) {
  return (
    <span
      aria-hidden="true"
      className={cn("inline-block shrink-0 bg-current", className)}
      style={{
        width: size,
        height: size,
        WebkitMaskImage: `url("${src}")`,
        maskImage: `url("${src}")`,
        WebkitMaskSize: "100% 100%",
        maskSize: "100% 100%",
        WebkitMaskRepeat: "no-repeat",
        maskRepeat: "no-repeat",
        ...style,
      }}
    />
  )
}

/** Plain <img> for multi-colour exported assets. Keeps the SVG's own width/height. */
export function Img({ src, className, alt = "", ...rest }: React.ComponentProps<"img">) {
  return <img src={src} alt={alt} draggable={false} className={cn("block max-w-none shrink-0", className)} {...rest} />
}
