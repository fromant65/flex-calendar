/**
 * Status Badge Component
 * Displays status badge for completed, skipped, or not-completed tasks
 */

import { CheckCircle2, AlertCircle } from "lucide-react"

interface StatusBadgeProps {
  status: "completed" | "skipped" | "not-completed"
}

export function StatusBadge({ status }: StatusBadgeProps) {
  switch (status) {
    case "completed":
      return (
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-green-100 dark:bg-green-950/50 text-green-700 dark:text-green-400 text-sm font-medium">
          <CheckCircle2 className="h-4 w-4" />
          Completado
        </div>
      )
    case "skipped":
      return (
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-yellow-100 dark:bg-yellow-950/50 text-yellow-700 dark:text-yellow-400 text-sm font-medium">
          <AlertCircle className="h-4 w-4" />
          Salteado
        </div>
      )
    case "not-completed":
      return (
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-red-100 dark:bg-red-950/50 text-red-700 dark:text-red-400 text-sm font-medium">
          <AlertCircle className="h-4 w-4" />
          No Completado
        </div>
      )
  }
}
