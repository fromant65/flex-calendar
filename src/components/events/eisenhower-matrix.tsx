"use client"

import type { OccurrenceWithTask, QuadrantPosition } from "~/types"
import { calculateQuadrant, getQuadrantLabel } from "~/lib/eisenhower-utils"
import { useMemo } from "react"
import { QuadrantPanel } from "./quadrant-panel"
import HelpTip from "~/components/ui/help-tip"
import { Input } from "~/components/ui/input"
import { useEventsContext } from "./events-context"

// Modularized component - EisenhowerMatrix
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
  const { filterStartDate, setFilterStartDate, filterEndDate, setFilterEndDate } = useEventsContext()

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

  // Format dates for input value (YYYY-MM-DD)
  const formatDateForInput = (date: Date) => {
    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const day = String(date.getDate()).padStart(2, '0')
    return `${year}-${month}-${day}`
  }

  // Handle date input changes
  const handleStartDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newDate = new Date(e.target.value)
    if (!isNaN(newDate.getTime())) {
      newDate.setHours(0, 0, 0, 0)
      setFilterStartDate(newDate)
    }
  }

  const handleEndDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newDate = new Date(e.target.value)
    if (!isNaN(newDate.getTime())) {
      newDate.setHours(23, 59, 59, 999)
      setFilterEndDate(newDate)
    }
  }

  return (
    <div className="h-full flex flex-col">
      <div className="flex justify-between items-start gap-4 p-2">
        {/* Date range filters */}
        <div className="flex flex-col sm:flex-row gap-2 flex-1">
          <div className="flex flex-col gap-1">
            <label htmlFor="start-date" className="text-xs text-muted-foreground">Desde</label>
            <Input
              id="start-date"
              type="date"
              value={formatDateForInput(filterStartDate)}
              onChange={handleStartDateChange}
              className="h-8 text-xs w-full sm:w-auto"
            />
          </div>
          <div className="flex flex-col gap-1">
            <label htmlFor="end-date" className="text-xs text-muted-foreground">Hasta</label>
            <Input
              id="end-date"
              type="date"
              value={formatDateForInput(filterEndDate)}
              onChange={handleEndDateChange}
              className="h-8 text-xs w-full sm:w-auto"
            />
          </div>
        </div>

        {/* Help tip */}
        <HelpTip title="Matriz Eisenhower">
          La matriz clasifica ocurrencias según urgencia e importancia. <br />
          Haz doble click para ver detalles de la misma.
          <div className="hidden lg:block">
            Arrastra tareas al calendario para programar su ejecución.
          </div>
          <div className="lg:hidden">
            Selecciona una tarea para programarla en el calendario.
          </div>
          Los inputs de fecha permiten filtrar las tareas mostradas en la matriz según su rango de fechas.
        </HelpTip>
      </div>
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
