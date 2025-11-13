"use client"

import { useState, useMemo } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Input } from "~/components/ui/input"
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "~/components/ui/select"
import { Button } from "~/components/ui/button"
import { Badge } from "~/components/ui/badge"
import { Search, Filter, X, ChevronDown } from "lucide-react"
import type {
  UnifiedFilters,
  UnifiedFilterConfig,
  PriorityFilter,
  StatusFilter,
  FixedFilter,
} from "~/types/filters"
import {
  fixedLabels,
  taskTypeLabels,
  priorityLabels,
  statusLabels,
  taskOccurrenceStatusLabels,
  taskTypes,
  priorityOptions,
  statusOptions,
  taskOccurrenceStatusOptions,
  fixedOptions,
} from "~/types/filters"
import type { TaskType, TaskOccurrenceStatus } from "~/types"
import {
  MultiSelectTaskTypeFilter,
  MultiSelectPriorityFilter,
  MultiSelectStatusFilter,
  MultiSelectOccurrenceStatusFilter,
  SortDropdown,
  DateRangeFilter,
} from "./filters"

interface UnifiedFilterBarProps {
  filters: UnifiedFilters
  onFiltersChange: (filters: UnifiedFilters) => void
  config: UnifiedFilterConfig
  totalCount: number
  filteredCount: number
  className?: string
}

export function UnifiedFilterBar({
  filters,
  onFiltersChange,
  config,
  totalCount,
  filteredCount,
  className = "",
}: UnifiedFilterBarProps) {
  const [isExpanded, setIsExpanded] = useState(config.defaultExpanded ?? false)

  // Calculate active filter count
  const activeFilterCount = useMemo(() => {
    let count = 0
    if (config.enableSearch && filters.searchQuery !== "") count++
    if (config.enableTaskType && filters.taskTypesFilter.length > 0) count++
    if (config.enablePriority && filters.prioritiesFilter.length > 0) count++
    if (config.enableStatus && filters.statusesFilter.length > 0) count++
    if (config.enableTaskOccurrenceStatus && filters.taskOccurrenceStatusesFilter.length > 0) count++
    if (config.enableFixed && filters.fixedFilter !== "all") count++
    if (config.enableDateRange && (filters.dateRangeStart || filters.dateRangeEnd)) count++
    return count
  }, [filters, config])

  const hasActiveFilters = activeFilterCount > 0

  const handleClearFilters = () => {
    onFiltersChange({
      ...filters,
      searchQuery: "",
      taskTypeFilter: "all",
      taskTypesFilter: [],
      priorityFilter: "all",
      prioritiesFilter: [],
      statusFilter: "all",
      statusesFilter: [],
      taskOccurrenceStatusFilter: "all",
      taskOccurrenceStatusesFilter: [],
      fixedFilter: "all",
      dateRangeStart: null,
      dateRangeEnd: null,
    })
  }

  // Multi-select handlers
  const toggleTaskType = (type: TaskType) => {
    const current = filters.taskTypesFilter
    const updated = current.includes(type)
      ? current.filter(t => t !== type)
      : [...current, type]
    onFiltersChange({ ...filters, taskTypesFilter: updated })
  }

  const togglePriority = (priority: PriorityFilter) => {
    const current = filters.prioritiesFilter
    const updated = current.includes(priority)
      ? current.filter(p => p !== priority)
      : [...current, priority]
    onFiltersChange({ ...filters, prioritiesFilter: updated })
  }

  const toggleStatus = (status: StatusFilter) => {
    const current = filters.statusesFilter
    const updated = current.includes(status)
      ? current.filter(s => s !== status)
      : [...current, status]
    onFiltersChange({ ...filters, statusesFilter: updated })
  }

  const toggleTaskOccurrenceStatus = (status: TaskOccurrenceStatus) => {
    const current = filters.taskOccurrenceStatusesFilter
    const updated = current.includes(status)
      ? current.filter(s => s !== status)
      : [...current, status]
    onFiltersChange({ ...filters, taskOccurrenceStatusesFilter: updated })
  }

  // Render filters content
  const renderFiltersContent = () => (
    <div className="space-y-3">
      {/* Search Input */}
      {config.enableSearch && (
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar por nombre o descripción..."
            value={filters.searchQuery}
            onChange={(e) =>
              onFiltersChange({ ...filters, searchQuery: e.target.value })
            }
            className="pl-10 h-9"
          />
        </div>
      )}

      {/* Filter Row */}
      <div className="flex flex-wrap gap-2">
        {/* Task Type Filter */}
        {config.enableTaskType && config.enableMultiTaskType && (
          <MultiSelectTaskTypeFilter
            selectedTypes={filters.taskTypesFilter}
            onToggle={toggleTaskType}
            onClear={() => onFiltersChange({ ...filters, taskTypesFilter: [] })}
          />
        )}

        {config.enableTaskType && !config.enableMultiTaskType && (
          <Select
            value={filters.taskTypeFilter}
            onValueChange={(value) =>
              onFiltersChange({
                ...filters,
                taskTypeFilter: value as TaskType | "all",
              })
            }
          >
            <SelectTrigger className="h-9 text-xs w-full sm:w-[180px]">
              <SelectValue placeholder="Tipo de tarea" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos los tipos</SelectItem>
              {taskTypes.map((type) => (
                <SelectItem key={type} value={type}>
                  {taskTypeLabels[type]}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}

        {/* Priority Filter */}
        {config.enablePriority && config.enableMultiPriority && (
          <MultiSelectPriorityFilter
            selectedPriorities={filters.prioritiesFilter}
            onToggle={togglePriority}
            onClear={() => onFiltersChange({ ...filters, prioritiesFilter: [] })}
          />
        )}

        {config.enablePriority && !config.enableMultiPriority && (
          <Select
            value={filters.priorityFilter}
            onValueChange={(value) =>
              onFiltersChange({
                ...filters,
                priorityFilter: value as PriorityFilter | "all",
              })
            }
          >
            <SelectTrigger className="h-9 text-xs w-full sm:w-[200px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas las prioridades</SelectItem>
              {priorityOptions.map((priority) => (
                <SelectItem key={priority} value={priority}>
                  {priorityLabels[priority]}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}

        {/* Status Filter */}
        {config.enableStatus && config.enableMultiStatus && (
          <MultiSelectStatusFilter
            selectedStatuses={filters.statusesFilter}
            onToggle={toggleStatus}
            onClear={() => onFiltersChange({ ...filters, statusesFilter: [] })}
          />
        )}

        {config.enableStatus && !config.enableMultiStatus && (
          <Select
            value={filters.statusFilter}
            onValueChange={(value) =>
              onFiltersChange({
                ...filters,
                statusFilter: value as StatusFilter | "all",
              })
            }
          >
            <SelectTrigger className="h-9 text-xs w-full sm:w-[180px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos los estados</SelectItem>
              {statusOptions.map((status) => (
                <SelectItem key={status} value={status}>
                  {statusLabels[status]}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}

        {/* Task Occurrence Status Filter */}
        {config.enableTaskOccurrenceStatus && config.enableMultiTaskOccurrenceStatus && (
          <MultiSelectOccurrenceStatusFilter
            selectedStatuses={filters.taskOccurrenceStatusesFilter}
            onToggle={toggleTaskOccurrenceStatus}
            onClear={() => onFiltersChange({ ...filters, taskOccurrenceStatusesFilter: [] })}
          />
        )}

        {config.enableTaskOccurrenceStatus && !config.enableMultiTaskOccurrenceStatus && (
          <Select
            value={filters.taskOccurrenceStatusFilter}
            onValueChange={(value) =>
              onFiltersChange({
                ...filters,
                taskOccurrenceStatusFilter: value as TaskOccurrenceStatus | "all",
              })
            }
          >
            <SelectTrigger className="h-9 text-xs w-full sm:w-[180px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos los estados</SelectItem>
              {taskOccurrenceStatusOptions.map((status) => (
                <SelectItem key={status} value={status}>
                  {taskOccurrenceStatusLabels[status]}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}

        {/* Fixed/Flexible Filter */}
        {config.enableFixed && (
          <Select
            value={filters.fixedFilter}
            onValueChange={(value) =>
              onFiltersChange({
                ...filters,
                fixedFilter: value as FixedFilter | "all",
              })
            }
          >
            <SelectTrigger className="h-9 text-xs w-full sm:w-[150px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas</SelectItem>
              {fixedOptions.map((option) => (
                <SelectItem key={option} value={option}>
                  {fixedLabels[option]}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}

        {/* Sort Dropdown */}
        {config.enableSort && (
          <SortDropdown
            currentSort={filters.sortBy}
            onSortChange={(sortBy) => onFiltersChange({ ...filters, sortBy })}
          />
        )}
      </div>

      {/* Date Range Filters */}
      {config.enableDateRange && (
        <DateRangeFilter
          startDate={filters.dateRangeStart}
          endDate={filters.dateRangeEnd}
          onStartDateChange={(date) => onFiltersChange({ ...filters, dateRangeStart: date })}
          onEndDateChange={(date) => onFiltersChange({ ...filters, dateRangeEnd: date })}
        />
      )}
    </div>
  )

  // Collapsible mode
  if (config.collapsible) {
    return (
      <div className={`space-y-2 ${className}`}>
        {/* Compact Filter Toggle Button */}
        <div className="flex items-center gap-2 flex-wrap">
          <Button
            variant={hasActiveFilters ? "default" : "outline"}
            size="sm"
            onClick={() => setIsExpanded(!isExpanded)}
            className="gap-2 h-9"
          >
            <Filter className="h-4 w-4" />
            <span>Filtros</span>
            {activeFilterCount > 0 && (
              <Badge variant="secondary" className="h-5 px-1.5 text-xs ml-1">
                {activeFilterCount}
              </Badge>
            )}
            <ChevronDown
              className={`h-4 w-4 transition-transform ${isExpanded ? "rotate-180" : ""}`}
            />
          </Button>

          {hasActiveFilters && (
            <>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleClearFilters}
                className="h-9 gap-1.5"
              >
                <X className="h-3.5 w-3.5" />
                <span className="text-xs">Limpiar</span>
              </Button>

              <Badge variant="secondary" className="text-xs">
                <span className="hidden xs:inline">
                  {filteredCount} de {totalCount}
                </span>
                <span className="xs:hidden">
                  {filteredCount}/{totalCount}
                </span>
              </Badge>
            </>
          )}
        </div>

        {/* Expandable Filters Panel */}
        <AnimatePresence>
          {isExpanded && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="overflow-hidden"
            >
              <div className="bg-card/50 backdrop-blur-sm rounded-lg border border-border/50 p-3">
                {renderFiltersContent()}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    )
  }

  // Always expanded mode
  return (
    <div className={`space-y-2 ${className}`}>
      {renderFiltersContent()}
      
      {/* Results Counter */}
      {hasActiveFilters && (
        <div className="flex items-center gap-2 flex-wrap">
          <Badge variant="secondary" className="text-xs">
            {filteredCount} de {totalCount}
          </Badge>
          <button
            onClick={handleClearFilters}
            className="text-xs text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
          >
            Limpiar filtros
          </button>
        </div>
      )}
    </div>
  )
}
