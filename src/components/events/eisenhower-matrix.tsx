"use client"

import type { OccurrenceWithTask, QuadrantPosition } from "~/types"
import { calculateQuadrant, getQuadrantLabel } from "~/lib/eisenhower-utils"
import { useMemo } from "react"
import { QuadrantPanel } from "./quadrant-panel"

// TODO: Modularized component - EisenhowerMatrix
// Main matrix layout, delegates quadrant rendering to QuadrantPanel

interface EisenhowerMatrixProps {
  occurrences: OccurrenceWithTask[]
  onTaskSelect: (occurrence: OccurrenceWithTask) => void
  onTaskDragStart: (occurrence: OccurrenceWithTask) => void
  onTaskClick: (occurrence: OccurrenceWithTask) => void
  selectedTaskId?: number
}

export function EisenhowerMatrix({
  occurrences,
  onTaskSelect,
  onTaskDragStart,
  onTaskClick,
  selectedTaskId,
}: EisenhowerMatrixProps) {
  const quadrants = useMemo(() => {
    const grouped: Record<QuadrantPosition["quadrant"], OccurrenceWithTask[]> = {
      "urgent-important": [] as OccurrenceWithTask[],
      "not-urgent-important": [] as OccurrenceWithTask[],
      "urgent-not-important": [] as OccurrenceWithTask[],
      "not-urgent-not-important": [] as OccurrenceWithTask[],
    }

    occurrences.forEach((occurrence) => {
      const quadrant = calculateQuadrant(occurrence).quadrant as keyof typeof grouped
      grouped[quadrant].push(occurrence)
    })

    return grouped
  }, [occurrences])

  return (
    <div className="h-full flex flex-col">
      <div className="flex-1 grid grid-cols-2 grid-rows-2 gap-px bg-border p-px overflow-hidden">
        {/* Top Left: Not Urgent but Important */}
        <QuadrantPanel
          title={getQuadrantLabel("not-urgent-important")}
          subtitle="Importante, No Urgente"
          tasks={quadrants["not-urgent-important"]}
          quadrant="not-urgent-important"
          onTaskSelect={onTaskSelect}
          onTaskDragStart={onTaskDragStart}
          onTaskClick={onTaskClick}
          selectedTaskId={selectedTaskId}
        />

        {/* Top Right: Urgent and Important */}
        <QuadrantPanel
          title={getQuadrantLabel("urgent-important")}
          subtitle="Importante y Urgente"
          tasks={quadrants["urgent-important"]}
          quadrant="urgent-important"
          onTaskSelect={onTaskSelect}
          onTaskDragStart={onTaskDragStart}
          onTaskClick={onTaskClick}
          selectedTaskId={selectedTaskId}
        />

        {/* Bottom Left: Not Urgent, Not Important */}
        <QuadrantPanel
          title={getQuadrantLabel("not-urgent-not-important")}
          subtitle="No Importante, No Urgente"
          tasks={quadrants["not-urgent-not-important"]}
          quadrant="not-urgent-not-important"
          onTaskSelect={onTaskSelect}
          onTaskDragStart={onTaskDragStart}
          onTaskClick={onTaskClick}
          selectedTaskId={selectedTaskId}
        />

        {/* Bottom Right: Urgent but Not Important */}
        <QuadrantPanel
          title={getQuadrantLabel("urgent-not-important")}
          subtitle="No Importante, Urgente"
          tasks={quadrants["urgent-not-important"]}
          quadrant="urgent-not-important"
          onTaskSelect={onTaskSelect}
          onTaskDragStart={onTaskDragStart}
          onTaskClick={onTaskClick}
          selectedTaskId={selectedTaskId}
        />
      </div>
    </div>
  )
}
