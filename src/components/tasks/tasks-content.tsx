import { useMemo } from "react"
import { AnimatePresence } from "framer-motion"
import type { TaskGetMyTasksOutput } from "~/server/api/routers/derived-endpoint-types"
import { TaskFilterBar, type TaskFilter } from "./task-filter-bar"
import { ActiveTasksSection } from "./active-tasks-section"
import { InactiveTasksSection } from "./inactive-tasks-section"
import { StatsSection } from "./stats-section"
import { NoResultsMessage } from "./no-results-message"

type TaskFromList = TaskGetMyTasksOutput[number]

interface TasksContentProps {
  tasks: TaskGetMyTasksOutput
  filters: TaskFilter
  onFiltersChange: (filters: TaskFilter) => void
  onEdit: (task: TaskFromList) => void
  onDelete: (id: number) => void
  onView: (task: TaskFromList) => void
}

export function TasksContent({
  tasks,
  filters,
  onFiltersChange,
  onEdit,
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

      // Status filter
      if (filters.statusFilter === "active" && !task.isActive) return false
      if (filters.statusFilter === "inactive" && task.isActive) return false

      // Task type filter
      if (filters.taskTypeFilter !== "all" && task.taskType !== filters.taskTypeFilter)
        return false

      // Fixed filter
      if (filters.fixedFilter === "fixed" && !task.isFixed) return false
      if (filters.fixedFilter === "flexible" && task.isFixed) return false

      return true
    })
  }, [tasks, filters])

  // Separate active and inactive tasks
  const activeTasksList = filteredTasks.filter((t) => t.isActive)
  const inactiveTasksList = filteredTasks.filter((t) => !t.isActive)

  const handleClearFilters = () => {
    onFiltersChange({
      searchQuery: "",
      statusFilter: "all",
      taskTypeFilter: "all",
      fixedFilter: "all",
    })
  }

  return (
    <>
      {/* Filter Bar */}
      <div className="mb-6">
        <TaskFilterBar
          filters={filters}
          onFiltersChange={onFiltersChange}
          totalTasks={tasks.length}
          filteredCount={filteredTasks.length}
        />
      </div>

      {/* Content with animation on filter changes */}
      <AnimatePresence mode="wait">
        {filteredTasks.length === 0 ? (
          <NoResultsMessage onClearFilters={handleClearFilters} />
        ) : (
          <div key="tasks-content" className="space-y-8">
            {/* Active Tasks */}
            <ActiveTasksSection
              tasks={activeTasksList}
              onEdit={onEdit}
              onDelete={onDelete}
              onView={onView}
            />

            {/* Statistics */}
            <StatsSection tasks={tasks} />

            {/* Inactive Tasks */}
            <InactiveTasksSection
              tasks={inactiveTasksList}
              onEdit={onEdit}
              onDelete={onDelete}
              onView={onView}
            />
          </div>
        )}
      </AnimatePresence>
    </>
  )
}
