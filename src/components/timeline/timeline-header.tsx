/**
 * Timeline Header Component - Segment display with adaptive labels
 */

import { formatDayOfWeek, type TimeSegment } from "./timeline-utils"

interface TimelineHeaderProps {
  segments: TimeSegment[]
  isCompact?: boolean
  visibleSegments?: TimeSegment[] // For mobile: limit visible segments
}

export function TimelineHeader({ segments, isCompact = false, visibleSegments }: TimelineHeaderProps) {
  const displaySegments = visibleSegments || segments

  const isToday = (segment: TimeSegment) => {
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const segmentStart = new Date(segment.start)
    segmentStart.setHours(0, 0, 0, 0)
    return segmentStart.getTime() === today.getTime()
  }

  const getSegmentLabel = (segment: TimeSegment, compact: boolean) => {
    switch (segment.type) {
      case "hours":
        // For hourly segments, show time and date
        const hour = segment.start.getHours()
        const dateLabel = `${segment.start.getDate().toString().padStart(2, '0')}/${(segment.start.getMonth() + 1).toString().padStart(2, '0')}`
        
        if (compact) {
          return {
            top: `${hour}h`,
            bottom: dateLabel.split('/')[0], // just day
          }
        }
        return {
          top: `${hour}:00`,
          bottom: dateLabel,
        }
      case "months":
        // For monthly segments, show date range without day of week
        if (compact) {
          const monthLabel = segment.start.toLocaleDateString("es-ES", { month: "short" })
          return {
            top: monthLabel,
            bottom: "",
          }
        }
        return {
          top: segment.label, // Already formatted as dd/mm - dd/mm
          bottom: "",
        }
      case "weeks":
        // For weekly segments, show date range without "Semana" word
        if (compact) {
          const weekStart = segment.start.toLocaleDateString("es-ES", { day: "numeric" })
          return {
            top: "S",
            bottom: weekStart,
          }
        }
        return {
          top: segment.label, // Already formatted as dd/mm - dd/mm
          bottom: "",
        }
      case "days":
      default:
        // For daily segments, show day of week and date
        if (compact) {
          return {
            top: formatDayOfWeek(segment.start).substring(0, 1), // Just first letter
            bottom: segment.start.getDate().toString(),
          }
        }
        return {
          top: formatDayOfWeek(segment.start),
          bottom: segment.label,
        }
    }
  }

  return (
    <div className="flex border-b-2 border-border bg-card">
      {/* Task Name Column Header */}
      <div className="w-32 sm:w-48 shrink-0 px-2 sm:px-4 py-2 sm:py-3 border-r border-border/30">
        <span className="text-xs sm:text-sm font-semibold text-foreground">Tareas</span>
      </div>

      {/* Segment Headers */}
      <div className="flex flex-1 min-w-0">
        {displaySegments.map((segment, index) => {
          const labels = getSegmentLabel(segment, isCompact)
          const isTodaySegment = segment.type === "days" && isToday(segment)

          return (
            <div
              key={index}
              className={`flex-1 flex flex-col items-center justify-center py-1 sm:py-2 px-0.5 sm:px-1 border-r border-border/30 min-w-0 max-w-full ${
                isTodaySegment ? "bg-primary/10" : ""
              }`}
            >
              <div
                className={`text-[9px] sm:text-xs font-semibold text-center break-words w-full truncate ${
                  isTodaySegment ? "text-primary" : "text-muted-foreground"
                }`}
              >
                {labels.top}
              </div>
              {labels.bottom && (
                <div
                  className={`text-[10px] sm:text-sm font-bold text-center break-words w-full truncate ${
                    isTodaySegment ? "text-primary" : "text-foreground"
                  }`}
                >
                  {labels.bottom}
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
