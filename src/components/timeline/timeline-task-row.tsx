/**
 * Timeline Task Row Component
 * Displays a task with cells showing completion status per time segment
 */

import type { TaskWithRecurrence } from "~/types"
import { TimelineCell, type TimelineCellData } from "./timeline-cell"
import { getSegmentKey, type TimeSegment } from "./timeline-utils"

interface TimelineTaskRowProps {
  task: TaskWithRecurrence
  segments: TimeSegment[]
  cellDataBySegment: Map<string, TimelineCellData>
  onCellClick: (segment: TimeSegment, cellData: TimelineCellData) => void
  isCompact?: boolean
  visibleSegments?: TimeSegment[] // For mobile: limit visible segments
}

export function TimelineTaskRow({
  task,
  segments,
  cellDataBySegment,
  onCellClick,
  isCompact = false,
  visibleSegments,
}: TimelineTaskRowProps) {
  const displaySegments = visibleSegments || segments

  return (
    <div className="flex border-b border-border/30">
      {/* Task Name Column - Responsive width */}
      <div className="w-32 sm:w-48 shrink-0 px-2 sm:px-4 py-3 flex flex-col justify-center border-r border-border/30 min-w-0">
        <div className="text-xs sm:text-sm font-medium break-words line-clamp-2" title={task.name}>
          {task.name}
        </div>
        <div className="text-[10px] sm:text-xs text-muted-foreground whitespace-nowrap">
          Imp: {task.importance}/10
        </div>
      </div>

      {/* Segment Cells */}
      <div className="flex flex-1 min-w-0">
        {displaySegments.map((segment) => {
          const segmentKey = getSegmentKey(segment)
          const cellData = cellDataBySegment.get(segmentKey) || null

          return (
            <div key={segmentKey} className="flex-1 min-w-0 max-w-full">
              <TimelineCell
                data={cellData}
                onClick={() => cellData && onCellClick(segment, cellData)}
                isCompact={isCompact}
              />
            </div>
          )
        })}
      </div>
    </div>
  )
}
