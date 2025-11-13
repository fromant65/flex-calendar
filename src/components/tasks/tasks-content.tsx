import { useMemo } from "react"
import { AnimatePresence } from "framer-motion"
import type { TaskGetMyTasksOutput } from "~/server/api/routers/derived-endpoint-types"
import { UnifiedFilterBar } from "../common/unified-filter-bar"
import type { UnifiedFilters } from "~/types/filters"
import { defaultFilters } from "~/types/filters"
import { ActiveTasksSection } from "./active-tasks-section"
import { InactiveTasksSection } from "./inactive-tasks-section"
import { StatsSection } from "./stats-section"
import { NoResultsMessage } from "./no-results-message"
import { calculateQuadrant } from "~/lib/eisenhower-utils"

type TaskFromList = TaskGetMyTasksOutput[number]

interface TasksContentProps {
  tasks: TaskGetMyTasksOutput
  filters: UnifiedFilters
  onFiltersChange: (filters: UnifiedFilters) => void
  onEdit: (task: TaskFromList) => void
  onDuplicate: (task: TaskFromList) => void
  onDelete: (id: number) => void
  onView: (task: TaskFromList) => void
}

export function TasksContent({
  tasks,
  filters,
  onFiltersChange,
  onEdit,
  onDuplicate,
  onDelete,
  onView,
}: TasksContentProps) {
  // Filter tasks based on search and filters
  const filteredTasks = useMemo(() => {
    return tasks.filter((task) => {
      // Search filter
      if (filters.searchQuery) {
        const searchLower = filters.searchQuery.toLowerCase()
        const matchesName = task.name.toLowerCase().includes(searchLower)
        const matchesDescription = task.description?.toLowerCase().includes(searchLower)
        if (!matchesName && !matchesDescription) return false
      }

      // Status filter - multi-select support
      if (filters.statusesFilter.length > 0) {
        const matchesStatus = filters.statusesFilter.some(status => {
          if (status === "active") return task.isActive
          if (status === "inactive") return !task.isActive
          return false
        })
        if (!matchesStatus) return false
      } else if (filters.statusFilter !== "all") {
        // Fallback to single select
        if (filters.statusFilter === "active" && !task.isActive) return false
        if (filters.statusFilter === "inactive" && task.isActive) return false
      }

      // Task type filter - multi-select support
      if (filters.taskTypesFilter.length > 0) {
        if (!filters.taskTypesFilter.includes(task.taskType)) return false
      } else if (filters.taskTypeFilter !== "all") {
        // Fallback to single select
        if (task.taskType !== filters.taskTypeFilter) return false
      }

      // Priority filter - multi-select support (using Eisenhower matrix)
      if (filters.prioritiesFilter.length > 0) {
        // Calculate the priority quadrant for this task
        const quadrant = calculateQuadrant({ task } as any).quadrant
        const matchesPriority = filters.prioritiesFilter.includes(quadrant)
        if (!matchesPriority) return false
      }

      return true
    })
  }, [tasks, filters])

  // Apply sorting
  const sortedTasks = useMemo(() => {
    const sorted = [...filteredTasks]
    
    switch (filters.sortBy) {
      case "name-asc":
        return sorted.sort((a, b) => a.name.localeCompare(b.name))
      case "name-desc":
        return sorted.sort((a, b) => b.name.localeCompare(a.name))
      case "type":
        return sorted.sort((a, b) => a.taskType.localeCompare(b.taskType))
      case "closest-target":
        return sorted.sort((a, b) => {
          // Use nextOccurrence dates if available
          const aDate = a.nextOccurrence?.targetDate ?? a.nextOccurrence?.limitDate
          const bDate = b.nextOccurrence?.targetDate ?? b.nextOccurrence?.limitDate
          if (!aDate && !bDate) return 0
          if (!aDate) return 1
          if (!bDate) return -1
          return aDate.getTime() - bDate.getTime()
        })
      case "closest-limit":
        return sorted.sort((a, b) => {
          const aDate = a.nextOccurrence?.limitDate
          const bDate = b.nextOccurrence?.limitDate
          if (!aDate && !bDate) return 0
          if (!aDate) return 1
          if (!bDate) return -1
          return aDate.getTime() - bDate.getTime()
        })
      case "importance":
        return sorted.sort((a, b) => b.importance - a.importance)
      default:
        return sorted
    }
  }, [filteredTasks, filters.sortBy])

  // Separate active and inactive tasks
  const activeTasksList = sortedTasks.filter((t) => t.isActive)
  const inactiveTasksList = sortedTasks.filter((t) => !t.isActive)

  const handleClearFilters = () => {
    onFiltersChange(defaultFilters)
  }

  return (
    <>
      {/* Filter Bar */}
      <div className="mb-6">
        <UnifiedFilterBar
          filters={filters}
          onFiltersChange={onFiltersChange}
          config={{
            enableSearch: true,
            enableTaskType: true,
            enableMultiTaskType: true,
            enablePriority: true,
            enableMultiPriority: true,
            enableStatus: true,
            enableMultiStatus: true,
            enableSort: true,
            collapsible: true,
            defaultExpanded: false,
          }}
          totalCount={tasks.length}
          filteredCount={sortedTasks.length}
        />
      </div>

      {/* Content with animation on filter changes */}
      <AnimatePresence mode="wait">
        {sortedTasks.length === 0 ? (
          <NoResultsMessage onClearFilters={handleClearFilters} />
        ) : (
          <div key="tasks-content" className="space-y-8">
            {/* Active Tasks */}
            <ActiveTasksSection
              tasks={activeTasksList}
              onEdit={onEdit}
              onDuplicate={onDuplicate}
              onDelete={onDelete}
              onView={onView}
            />

            {/* Statistics */}
            <StatsSection tasks={tasks} />

            {/* Inactive Tasks */}
            <InactiveTasksSection
              tasks={inactiveTasksList}
              onEdit={onEdit}
              onDuplicate={onDuplicate}
              onDelete={onDelete}
              onView={onView}
            />
          </div>
        )}
      </AnimatePresence>
    </>
  )
}
