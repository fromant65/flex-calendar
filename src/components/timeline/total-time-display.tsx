/**
 * Total Time Display Component
 * Shows total time spent in a highlighted card
 */

import { Clock } from "lucide-react"

interface TotalTimeDisplayProps {
  totalMinutes: number
  formatTime: (minutes: number) => string
}

export function TotalTimeDisplay({ totalMinutes, formatTime }: TotalTimeDisplayProps) {
  if (totalMinutes <= 0) return null

  return (
    <div className="flex items-center gap-2.5 rounded-lg bg-muted/20 p-2.5">
      <div className="flex h-8 w-8 items-center justify-center rounded-md bg-primary/10">
        <Clock className="h-4 w-4 text-primary" />
      </div>
      <div>
        <p className="text-xs text-muted-foreground">Tiempo Total Dedicado</p>
        <p className="text-sm font-semibold text-foreground">{formatTime(totalMinutes)}</p>
      </div>
    </div>
  )
}
