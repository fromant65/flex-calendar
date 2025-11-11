/**
 * Timeline Cell Component
 * Displays the status of a task on a specific day
 * Similar to Habits app: shows completion status, time spent, or skip indicator
 */

import { Check, X, Minus, Clock, Circle, Loader } from "lucide-react"
import { motion } from "motion/react"
import { cn } from "~/lib/utils"

export type CellStatus = "completed" | "skipped" | "not-completed" | "pending" | "in-progress" | "empty"

export interface TimelineCellData {
  status: CellStatus
  timeSpent?: number // in minutes
  occurrenceIds?: number[] // Support multiple occurrences
  eventIds?: number[]
  completedAt?: Date
  isMultipleEvents?: boolean
  occurrenceCount?: number // How many occurrences in this segment
}

interface TimelineCellProps {
  data: TimelineCellData | null
  onClick?: () => void
  isCompact?: boolean // For views with many columns
}

export function TimelineCell({ data, onClick, isCompact = false }: TimelineCellProps) {
  if (!data || data.status === "empty") {
    return (
      <div className="h-12 border-r border-border/30 bg-card hover:bg-accent/5 transition-colors" />
    )
  }

  const getCellContent = () => {
    switch (data.status) {
      case "completed":
        if (data.timeSpent !== undefined && !isCompact) {
          // Show time spent in normal view
          const hours = Math.floor(data.timeSpent / 60)
          const minutes = data.timeSpent % 60
          const timeText = hours > 0 ? `${hours}h ${minutes}m` : `${minutes}m`
          
          return (
            <div className="flex flex-col items-center justify-center gap-0">
              <Check className="h-4 w-4 text-green-600 dark:text-green-400" />
              <span className="text-[10px] font-medium text-muted-foreground whitespace-nowrap leading-tight">{timeText}</span>
            </div>
          )
        } else if (data.timeSpent !== undefined && isCompact) {
          // Show abbreviated time in compact view
          const hours = Math.floor(data.timeSpent / 60)
          const minutes = data.timeSpent % 60
          const timeText = hours > 0 ? `${hours}h` : `${minutes}m`
          
          return (
            <div className="flex flex-col items-center justify-center gap-0">
              <Check className="h-3 w-3 text-green-600 dark:text-green-400" />
              <span className="text-[9px] font-medium text-muted-foreground leading-tight">{timeText}</span>
            </div>
          )
        }
        return <Check className={cn("text-green-600 dark:text-green-400", isCompact ? "h-4 w-4" : "h-5 w-5")} />
      
      case "skipped":
        return <Minus className={cn("text-gray-500 dark:text-gray-400", isCompact ? "h-4 w-4" : "h-5 w-5")} />
      
      case "in-progress":
        return <Loader className={cn("text-blue-600 dark:text-blue-400 animate-spin", isCompact ? "h-4 w-4" : "h-5 w-5")} />
      
      case "pending":
        return <Circle className={cn("text-yellow-600 dark:text-yellow-400", isCompact ? "h-4 w-4" : "h-5 w-5")} />
      
      case "not-completed":
        return <X className={cn("text-red-600 dark:text-red-400", isCompact ? "h-4 w-4" : "h-5 w-5")} />
      
      default:
        return null
    }
  }

  const getBgColor = () => {
    switch (data.status) {
      case "completed":
        return "bg-green-50 dark:bg-green-950/30 hover:bg-green-100 dark:hover:bg-green-950/50"
      case "skipped":
        return "bg-gray-50 dark:bg-gray-950/30 hover:bg-gray-100 dark:hover:bg-gray-950/50"
      case "in-progress":
        return "bg-blue-50 dark:bg-blue-950/30 hover:bg-blue-100 dark:hover:bg-blue-950/50"
      case "pending":
        return "bg-yellow-50 dark:bg-yellow-950/30 hover:bg-yellow-100 dark:hover:bg-yellow-950/50"
      case "not-completed":
        return "bg-red-50 dark:bg-red-950/30 hover:bg-red-100 dark:hover:bg-red-950/50"
      default:
        return "bg-card hover:bg-accent/5"
    }
  }

  return (
    <motion.div
      className={cn(
        "h-12 border-r border-border/30 flex items-center justify-center cursor-pointer transition-colors relative",
        getBgColor()
      )}
      onClick={onClick}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.2 }}
    >
      {getCellContent()}
      {data.isMultipleEvents && (
        <div className="absolute top-1 right-1 h-1.5 w-1.5 rounded-full bg-blue-500" />
      )}
      {data.occurrenceCount && data.occurrenceCount > 1 && (
        <div className="absolute bottom-0.5 right-0.5 h-4 w-4 rounded-full bg-primary text-primary-foreground text-[8px] font-bold flex items-center justify-center">
          {data.occurrenceCount}
        </div>
      )}
    </motion.div>
  )
}
