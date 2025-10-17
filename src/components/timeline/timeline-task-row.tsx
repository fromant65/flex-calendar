/**
 * Timeline Task Row Component
 */

import { Fragment } from "react"
import { motion } from "motion/react"
import type { TaskWithRecurrence, OccurrenceWithTask, EventWithDetails } from "~/types"
import { assignBlockLevels, getItemStyle, type TimeRange } from "./timeline-utils"

const OCCURRENCE_HEIGHT = 28 // h-7
const EVENT_HEIGHT = 24 // h-6
const GAP = 2

interface TimelineTaskRowProps {
  task: TaskWithRecurrence
  occurrences: OccurrenceWithTask[]
  events: EventWithDetails[]
  dateRange: Date[]
  onOccurrenceClick: (occurrence: OccurrenceWithTask) => void
  onEventClick: (event: EventWithDetails) => void
  getOccurrenceEndDate: (occurrence: OccurrenceWithTask) => Date
}

export function TimelineTaskRow({
  task,
  occurrences,
  events,
  dateRange,
  onOccurrenceClick,
  onEventClick,
  getOccurrenceEndDate,
}: TimelineTaskRowProps) {
  // Create occurrence blocks with their time ranges
  const occurrenceBlocks = occurrences.map((occ) => {
    const occStart = new Date(occ.startDate)
    const occEnd = getOccurrenceEndDate(occ)
    const occEvents = events.filter((e) => e.associatedOccurrenceId === occ.id)
    
    // Calculate the full range of the block (occurrence + all its events)
    let blockStart = occStart
    let blockEnd = occEnd
    
    occEvents.forEach((event) => {
      const eventStart = new Date(event.start)
      const eventEnd = new Date(event.finish)
      if (eventStart < blockStart) blockStart = eventStart
      if (eventEnd > blockEnd) blockEnd = eventEnd
    })

    return {
      occurrence: occ,
      events: occEvents,
      occurrenceRange: { start: occStart, end: occEnd },
      blockRange: { start: blockStart, end: blockEnd },
    }
  })

  // Assign levels to occurrence blocks based on their full range (occ + events)
  const occurrenceBlockLevels = assignBlockLevels(
    occurrenceBlocks.map((block) => ({
      range: block.blockRange,
      item: block.occurrence.id,
    }))
  )

  // Calculate total height needed
  const maxLevel = occurrenceBlocks.length > 0 
    ? Math.max(...Array.from(occurrenceBlockLevels.values())) 
    : 0

  // Each block needs space for 1 occurrence + its events
  let totalHeight = 0
  occurrenceBlocks.forEach((block) => {
    const numEvents = block.events.length
    const blockHeight = OCCURRENCE_HEIGHT + GAP + (numEvents > 0 ? numEvents * (EVENT_HEIGHT + GAP) : 0)
    totalHeight = Math.max(totalHeight, blockHeight)
  })

  // Multiply by number of levels
  const containerHeight = (maxLevel + 1) * totalHeight

  return (
    <div className="mb-1 border-b border-border/30 pb-1">
      <div className="flex">
        {/* Task Name Column */}
        <div className="w-48 shrink-0 px-4 py-1">
          <div className="text-sm font-medium">{task.name}</div>
          <div className="text-xs text-muted-foreground">Importancia: {task.importance}/10</div>
        </div>

        {/* Timeline Area */}
        <div className="relative flex-1 py-1">
          {/* Occurrence blocks with their events */}
          <div className="relative w-full" style={{ height: `${containerHeight}px` }}>
            {occurrenceBlocks.map((block) => {
              const level = occurrenceBlockLevels.get(block.occurrence.id)!
              const blockVerticalOffset = level * totalHeight

              // Assign levels to events within this occurrence block
              const eventBlocksWithRanges = block.events.map((event) => ({
                range: {
                  start: new Date(event.start),
                  end: new Date(event.finish),
                },
                item: event,
              }))

              const eventLevels = assignBlockLevels(eventBlocksWithRanges)
              const maxEventLevel = block.events.length > 0 
                ? Math.max(...Array.from(eventLevels.values())) 
                : 0

              return (
                <Fragment key={block.occurrence.id}>
                  {/* Occurrence */}
                  <div
                    className="absolute h-7 rounded bg-primary/20 backdrop-blur-sm border border-primary/30 cursor-pointer hover:bg-primary/30 transition-colors"
                    style={{
                      ...getItemStyle(
                        block.occurrenceRange.start,
                        block.occurrenceRange.end,
                        dateRange,
                        0
                      ),
                      top: `${blockVerticalOffset}px`,
                    }}
                    onClick={() => onOccurrenceClick(block.occurrence)}
                    title="Click to view details"
                  >
                    <div className="flex h-full items-center px-2">
                      <span className="truncate text-xs font-medium text-primary">
                        Occ {block.occurrence.id}
                      </span>
                    </div>
                  </div>

                  {/* Events for this occurrence */}
                  {block.events.map((event) => {
                    const eventLevel = eventLevels.get(event)!
                    const eventVerticalOffset = OCCURRENCE_HEIGHT + GAP + eventLevel * (EVENT_HEIGHT + GAP)
                    const absoluteEventTop = blockVerticalOffset + eventVerticalOffset

                    return (
                      <div
                        key={event.id}
                        className={`absolute h-6 rounded cursor-pointer hover:opacity-80 transition-opacity ${
                          event.isCompleted
                            ? "bg-accent/60 border border-accent"
                            : "bg-yellow-500/60 border border-yellow-500"
                        }`}
                        style={{
                          ...getItemStyle(
                            new Date(event.start),
                            new Date(event.finish),
                            dateRange,
                            0
                          ),
                          top: `${absoluteEventTop}px`,
                        }}
                        onClick={() => onEventClick(event)}
                        title={`${event.context || "Event"} - Click to view details`}
                      >
                        <div className="flex h-full items-center justify-center px-2">
                          <span className="truncate text-xs font-medium">
                            {event.context || `Event ${event.id}`}
                          </span>
                        </div>
                      </div>
                    )
                  })}
                </Fragment>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}
