"use client"

import { CalendarViewComponent } from "./calendar-view"
import { EisenhowerMatrix } from "./eisenhower-matrix"
import { useEventsContext } from "./events-context"
import type { EventWithDetails, OccurrenceWithTask } from "~/types"
import { useState, useRef, useEffect } from "react"
import { GripVertical } from "lucide-react"

// Modular component - DesktopLayout
// Renders the desktop view with resizable panels (matrix + calendar)

interface DesktopLayoutProps {
  availableOccurrences: OccurrenceWithTask[]
  events: EventWithDetails[]
  onTaskSelect: (occurrence: OccurrenceWithTask) => void
  onTaskDragStart: (occurrence: OccurrenceWithTask) => void
  onOccurrenceClick: (occurrence: OccurrenceWithTask) => void
  onTimeSlotClick: (date: Date, hour?: number) => void
  onEventClick: (event: EventWithDetails) => void
  onCalendarDrop: (date: Date, hour?: number) => void
  onEventDragStart: (event: EventWithDetails) => void
}

export function DesktopLayout({
  availableOccurrences,
  events,
  onTaskSelect,
  onTaskDragStart,
  onOccurrenceClick,
  onTimeSlotClick,
  onEventClick,
  onCalendarDrop,
  onEventDragStart,
}: DesktopLayoutProps) {
  const { calendarView, setCalendarView, selectedTask } = useEventsContext()
  const [leftWidth, setLeftWidth] = useState(40)
  const [isDragging, setIsDragging] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)

  // Handle resizable divider
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isDragging || !containerRef.current) return

      const containerRect = containerRef.current.getBoundingClientRect()
      const newLeftWidth = ((e.clientX - containerRect.left) / containerRect.width) * 100

      // Constrain between 20% and 80%
      const constrainedWidth = Math.min(Math.max(newLeftWidth, 20), 80)
      setLeftWidth(constrainedWidth)
    }

    const handleMouseUp = () => {
      setIsDragging(false)
    }

    if (isDragging) {
      document.addEventListener("mousemove", handleMouseMove)
      document.addEventListener("mouseup", handleMouseUp)
      document.body.style.cursor = "col-resize"
      document.body.style.userSelect = "none"
    }

    return () => {
      document.removeEventListener("mousemove", handleMouseMove)
      document.removeEventListener("mouseup", handleMouseUp)
      document.body.style.cursor = ""
      document.body.style.userSelect = ""
    }
  }, [isDragging])

  return (
    <div ref={containerRef} className="hidden lg:flex flex-1 min-h-0">
      {/* Left Panel: Eisenhower Matrix */}
      <div className="border-r border-border bg-card h-full flex-shrink-0" style={{ width: `${leftWidth}%` }}>
        <EisenhowerMatrix
          occurrences={availableOccurrences}
          onTaskSelect={onTaskSelect}
          onTaskDragStart={onTaskDragStart}
          onTaskClick={onOccurrenceClick}
          selectedTaskId={selectedTask?.id}
        />
      </div>

      {/* Resizable Divider */}
      <div
        className="w-1 bg-border hover:bg-primary/50 cursor-col-resize flex-shrink-0 relative group transition-colors"
        onMouseDown={() => setIsDragging(true)}
      >
        <div className="absolute inset-y-0 -left-1 -right-1 flex items-center justify-center">
          <div className="bg-border group-hover:bg-primary/50 rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity">
            <GripVertical className="h-4 w-4 text-muted-foreground group-hover:text-primary" />
          </div>
        </div>
      </div>

      {/* Right Panel: Calendar */}
      <div className="flex-1 bg-background h-full">
        <CalendarViewComponent
          events={events}
          view={calendarView}
          onViewChange={setCalendarView}
          onTimeSlotClick={onTimeSlotClick}
          onEventClick={onEventClick}
          onDrop={onCalendarDrop}
          onEventDragStart={onEventDragStart}
        />
      </div>
    </div>
  )
}
