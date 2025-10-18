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
    <div className="space-y-2 p-4 rounded-lg bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800/50">
      <div className="flex items-center gap-2">
        <Clock className="h-5 w-5 text-blue-600 dark:text-blue-400" />
        <span className="font-semibold text-blue-900 dark:text-blue-100">
          Tiempo Total Dedicado
        </span>
      </div>
      <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
        {formatTime(totalMinutes)}
      </div>
    </div>
  )
}
