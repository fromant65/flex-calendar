/**
 * Timeline Header Component - Date display with day labels
 */

import { formatDate, formatDayOfWeek } from "./timeline-utils"

interface TimelineHeaderProps {
  dateRange: Date[]
}

export function TimelineHeader({ dateRange }: TimelineHeaderProps) {
  return (
    <div className="flex pb-2 pt-1 border-b border-border/30">
      <div className="w-48 shrink-0 px-4">
        <span className="text-sm font-medium text-muted-foreground">Tasks</span>
      </div>
      <div className="relative flex flex-1">
        {dateRange.map((date, index) => (
          <div key={index} className="flex-1 relative px-2">
            {/* Day labels aligned to the right of vertical line */}
            <div className="absolute left-1 top-0 text-[10px] text-muted-foreground/60 font-medium leading-tight">
              <div>{formatDayOfWeek(date)}</div>
              <div>{formatDate(date)}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
