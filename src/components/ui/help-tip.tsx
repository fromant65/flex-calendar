"use client"

import * as React from "react"
import { HelpCircle } from "lucide-react"

import {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
} from "~/components/ui/tooltip"
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "~/components/ui/dialog"

import { cn } from "~/lib/utils"

type HelpTipProps = {
  title?: React.ReactNode
  children: React.ReactNode
  side?: "top" | "right" | "bottom" | "left"
  className?: string
  size?: number
}

/**
 * HelpTip
 * - shows a Tooltip on large screens (lg and up)
 * - shows a Dialog on small screens (below lg)
 *
 * Usage:
 * <HelpTip title="Qué es esto?">Explicación...</HelpTip>
 */
export function HelpTip({
  title,
  children,
  side = "top",
  className,
  size = 16,
}: HelpTipProps) {
  const id = React.useId()

  const icon = (
    <HelpCircle className={cn("shrink-0", "text-muted-foreground")} size={size} />
  )

  return (
    <span className={cn("inline-block", className)}>
      {/* Tooltip for large screens */}
      <Tooltip>
        <TooltipTrigger asChild>
          <button
            aria-describedby={id}
            aria-label={typeof title === "string" ? `Ayuda: ${title}` : "Ayuda"}
            className="hidden lg:inline-flex items-center justify-center rounded-full p-1 hover:bg-accent/5"
            type="button"
          >
            {icon}
          </button>
        </TooltipTrigger>
        <TooltipContent side={side} sideOffset={6} className="max-w-xs">
          {title && <div className="font-semibold text-sm mb-1">{title}</div>}
          <div className="text-xs text-muted-foreground" id={id}>
            {children}
          </div>
        </TooltipContent>
      </Tooltip>

      {/* Dialog for small screens */}
      <Dialog>
        <DialogTrigger asChild>
          <button
            aria-label={typeof title === "string" ? `Ayuda: ${title}` : "Ayuda"}
            className="inline-flex lg:hidden items-center justify-center rounded-full p-1 hover:bg-accent/5"
            type="button"
          >
            {icon}
          </button>
        </DialogTrigger>

        <DialogContent className="max-w-sm">
          <DialogHeader>
            {title && <DialogTitle>{title}</DialogTitle>}
          </DialogHeader>
          <DialogDescription className="text-sm text-muted-foreground">
            {children}
          </DialogDescription>
        </DialogContent>
      </Dialog>
    </span>
  )
}

export default HelpTip
