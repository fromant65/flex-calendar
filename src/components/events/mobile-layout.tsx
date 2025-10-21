"use client"

import { CalendarViewComponent } from "./calendar-view"
import { EisenhowerMatrix } from "./eisenhower-matrix"
import { useEventsContext } from "./events-context"
import type { EventWithDetails, OccurrenceWithTask } from "~/types"

// Modular component - MobileLayout
// Renders the mobile view with toggled matrix/calendar views

interface MobileLayoutProps {
  availableOccurrences: OccurrenceWithTask[]
  events: EventWithDetails[]
  onTaskSelectMobile: (occurrence: OccurrenceWithTask) => void
  onTaskDragStart: (occurrence: OccurrenceWithTask) => void
  onOccurrenceClick: (occurrence: OccurrenceWithTask) => void
  onTimeSlotClick: (date: Date, hour?: number) => void
  onEventClick: (event: EventWithDetails) => void
  onCalendarDrop: (date: Date, hour?: number) => void
  onEventDragStart: (event: EventWithDetails) => void
}

export function MobileLayout({
  availableOccurrences,
  events,
  onTaskSelectMobile,
  onTaskDragStart,
  onOccurrenceClick,
  onTimeSlotClick,
  onEventClick,
  onCalendarDrop,
  onEventDragStart,
}: MobileLayoutProps) {
  const { mobileView, calendarView, setCalendarView, selectedTask } = useEventsContext()

  return (
    <div className="flex lg:hidden flex-1 overflow-hidden w-full">
      {mobileView === "matrix" ? (
        <div className="w-full bg-card overflow-hidden">
          <EisenhowerMatrix
            occurrences={availableOccurrences}
            onTaskSelect={onTaskSelectMobile}
            onTaskDragStart={onTaskDragStart}
            onTaskClick={onOccurrenceClick}
            selectedTaskId={selectedTask?.id}
          />
        </div>
      ) : (
        <div className="w-full bg-background overflow-hidden">
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
      )}
    </div>
  )
}
