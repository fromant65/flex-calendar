"use client"

import type { OccurrenceWithTask, QuadrantPosition } from "~/types"
import { calculateQuadrant, getQuadrantLabel } from "~/lib/eisenhower-utils"
import { useMemo, useState } from "react"
import { QuadrantPanel } from "./quadrant-panel"
import HelpTip from "~/components/ui/help-tip"
import { UnifiedFilterBar } from "../common/unified-filter-bar"
import type { UnifiedFilters } from "~/types/filters"
import { defaultFilters } from "~/types/filters"
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
  const [filters, setFilters] = useState<UnifiedFilters>({
    ...defaultFilters,
    dateRangeStart: filterStartDate,
    dateRangeEnd: filterEndDate,
  })

  // Sync date range with context when filters change
  const handleFiltersChange = (newFilters: UnifiedFilters) => {
    setFilters(newFilters)
    if (newFilters.dateRangeStart) setFilterStartDate(newFilters.dateRangeStart)
    if (newFilters.dateRangeEnd) setFilterEndDate(newFilters.dateRangeEnd)
  }

  const quadrants = useMemo(() => {
    const grouped: Record<QuadrantPosition["quadrant"], OccurrenceWithTask[]> = {
      "urgent-important": [] as OccurrenceWithTask[],
      "not-urgent-important": [] as OccurrenceWithTask[],
      "urgent-not-important": [] as OccurrenceWithTask[],
      "not-urgent-not-important": [] as OccurrenceWithTask[],
    }

    // Filter by search query
    let filtered = occurrences
    
    if (filters.searchQuery) {
      const query = filters.searchQuery.toLowerCase()
      filtered = filtered.filter((occ) => {
        const taskName = occ.task.name.toLowerCase()
        const taskDescription = occ.task.description?.toLowerCase() ?? ""
        return taskName.includes(query) || taskDescription.includes(query)
      })
    }

    // Filter by task type - multi-select support
    if (filters.taskTypesFilter.length > 0) {
      filtered = filtered.filter((occ) => {
        const taskType = 'taskType' in occ.task ? occ.task.taskType : null
        return taskType && filters.taskTypesFilter.includes(taskType)
      })
    } else if (filters.taskTypeFilter !== "all") {
      // Fallback to single select
      filtered = filtered.filter((occ) => {
        const taskType = 'taskType' in occ.task ? occ.task.taskType : null
        return taskType === filters.taskTypeFilter
      })
    }

    // Filter by occurrence status - multi-select support
    if (filters.taskOccurrenceStatusesFilter.length > 0) {
      filtered = filtered.filter((occ) => 
        filters.taskOccurrenceStatusesFilter.includes(occ.status)
      )
    } else if (filters.taskOccurrenceStatusFilter !== "all") {
      // Fallback to single select
      filtered = filtered.filter((occ) => occ.status === filters.taskOccurrenceStatusFilter)
    }

    // Apply sorting before grouping
    const sortedFiltered = [...filtered]
    switch (filters.sortBy) {
      case "name-asc":
        sortedFiltered.sort((a, b) => a.task.name.localeCompare(b.task.name))
        break
      case "name-desc":
        sortedFiltered.sort((a, b) => b.task.name.localeCompare(a.task.name))
        break
      case "type":
        sortedFiltered.sort((a, b) => {
          const aType = 'taskType' in a.task ? (a.task.taskType ?? '') : ''
          const bType = 'taskType' in b.task ? (b.task.taskType ?? '') : ''
          return aType.localeCompare(bType)
        })
        break
      case "closest-target":
        sortedFiltered.sort((a, b) => {
          const aDate = a.targetDate ?? a.limitDate
          const bDate = b.targetDate ?? b.limitDate
          if (!aDate && !bDate) return 0
          if (!aDate) return 1
          if (!bDate) return -1
          return aDate.getTime() - bDate.getTime()
        })
        break
      case "closest-limit":
        sortedFiltered.sort((a, b) => {
          if (!a.limitDate && !b.limitDate) return 0
          if (!a.limitDate) return 1
          if (!b.limitDate) return -1
          return a.limitDate.getTime() - b.limitDate.getTime()
        })
        break
    }

    sortedFiltered.forEach((occurrence) => {
      const quadrant = calculateQuadrant(occurrence).quadrant
      grouped[quadrant].push(occurrence)
    })

    return grouped
  }, [occurrences, filters])

  // Calculate total count for filter bar
  const totalOccurrencesCount = occurrences.length
  const filteredOccurrencesCount = Object.values(quadrants).reduce((sum, arr) => sum + arr.length, 0)

  return (
    <div className="flex flex-col h-full overflow-hidden">
      {/* Unified Filter Bar */}
      <div className="p-2 border-b border-border bg-card/50 flex-shrink-0">
        <UnifiedFilterBar
          filters={filters}
          onFiltersChange={handleFiltersChange}
          config={{
            enableSearch: true,
            enableTaskType: true,
            enableMultiTaskType: true,
            enableTaskOccurrenceStatus: true,
            enableMultiTaskOccurrenceStatus: true,
            enableSort: true,
            enableDateRange: true,
            collapsible: true,
            defaultExpanded: false,
          }}
          totalCount={totalOccurrencesCount}
          filteredCount={filteredOccurrencesCount}
        />
        
        {/* Help tip */}
        <div className="mt-2 flex justify-end">
          <HelpTip title="Matriz Eisenhower">
            La matriz clasifica ocurrencias según urgencia e importancia. <br />
            Haz doble click para ver detalles de la misma.
            <div className="hidden lg:block">
              Arrastra tareas al calendario para programar su ejecución.
            </div>
            <div className="lg:hidden">
              Selecciona una tarea para programarla en el calendario.
            </div>
            Usa el buscador y los filtros para encontrar tareas específicas.
          </HelpTip>
        </div>
      </div>
      <div className="flex-1 grid grid-cols-2 grid-rows-2 gap-px bg-border p-px min-h-0">
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
