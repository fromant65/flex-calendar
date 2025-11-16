"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Input } from "~/components/ui/input"
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "~/components/ui/select"
import { Search, Filter, X, ChevronDown } from "lucide-react"
import { Badge } from "~/components/ui/badge"
import { Button } from "~/components/ui/button"
import type { TaskType } from "~/types"

export type TimelineFilters = {
  searchQuery: string
  taskTypeFilter: TaskType | "all"
  priorityFilter: "all" | "urgent-important" | "not-urgent-important" | "urgent-not-important" | "not-urgent-not-important"
  statusFilter: "all" | "has-pending" | "has-completed" | "has-skipped" | "all-completed"
  activeStatusFilter: "all" | "active" | "inactive"
}

interface TimelineFiltersProps {
  filters: TimelineFilters
  onFiltersChange: (filters: TimelineFilters) => void
  totalTasks: number
  filteredCount: number
}

const taskTypes: (TaskType | "all")[] = [
  "all",
  "Única",
  "Recurrente Finita",
  "Hábito",
  "Hábito +",
  "Fija Única",
  "Fija Repetitiva",
]

const priorityOptions: TimelineFilters["priorityFilter"][] = [
  "all",
  "urgent-important",
  "not-urgent-important",
  "urgent-not-important",
  "not-urgent-not-important",
]

const priorityLabels: Record<TimelineFilters["priorityFilter"], string> = {
  all: "Todas",
  "urgent-important": "Urgente e Importante",
  "not-urgent-important": "No Urgente e Importante",
  "urgent-not-important": "Urgente y No Importante",
  "not-urgent-not-important": "No Urgente y No Importante",
}

const statusOptions: TimelineFilters["statusFilter"][] = [
  "all",
  "has-pending",
  "has-completed",
  "has-skipped",
  "all-completed",
]

const statusLabels: Record<TimelineFilters["statusFilter"], string> = {
  all: "Todos",
  "has-pending": "Con pendientes",
  "has-completed": "Con completadas",
  "has-skipped": "Con salteadas",
  "all-completed": "Todo completado",
}

const activeStatusOptions: TimelineFilters["activeStatusFilter"][] = [
  "all",
  "active",
  "inactive",
]

const activeStatusLabels: Record<TimelineFilters["activeStatusFilter"], string> = {
  all: "Todas",
  active: "Activas",
  inactive: "Inactivas",
}

export function TimelineFilters({
  filters,
  onFiltersChange,
  totalTasks,
  filteredCount,
}: TimelineFiltersProps) {
  const [isExpanded, setIsExpanded] = useState(false)

  const hasActiveFilters = 
    filters.searchQuery !== "" || 
    filters.taskTypeFilter !== "all" || 
    filters.priorityFilter !== "all" ||
    filters.statusFilter !== "all" ||
    filters.activeStatusFilter !== "all"

  const activeFilterCount = [
    filters.searchQuery !== "",
    filters.taskTypeFilter !== "all",
    filters.priorityFilter !== "all",
    filters.statusFilter !== "all",
    filters.activeStatusFilter !== "all",
  ].filter(Boolean).length

  const handleClearFilters = () => {
    onFiltersChange({
      searchQuery: "",
      taskTypeFilter: "all",
      priorityFilter: "all",
      statusFilter: "all",
      activeStatusFilter: "all",
    })
  }

  return (
    <div className="space-y-2">
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
          <ChevronDown className={`h-4 w-4 transition-transform ${isExpanded ? "rotate-180" : ""}`} />
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
              <span className="hidden xs:inline">{filteredCount} de {totalTasks}</span>
              <span className="xs:hidden">{filteredCount}/{totalTasks}</span>
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
            <div className="bg-card/50 backdrop-blur-sm rounded-lg border border-border/50 p-3 space-y-3">
              {/* Search Input */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar tareas..."
                  value={filters.searchQuery}
                  onChange={(e) =>
                    onFiltersChange({ ...filters, searchQuery: e.target.value })
                  }
                  className="pl-10 h-9"
                />
              </div>

              {/* Filter Selects - Compact Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2">
                {/* Task Type Filter */}
                <Select
                  value={filters.taskTypeFilter}
                  onValueChange={(value) =>
                    onFiltersChange({
                      ...filters,
                      taskTypeFilter: value as TaskType | "all",
                    })
                  }
                >
                  <SelectTrigger className="h-9 text-xs">
                    <SelectValue placeholder="Tipo" />
                  </SelectTrigger>
                  <SelectContent>
                    {taskTypes.map((type) => (
                      <SelectItem key={type} value={type}>
                        {type === "all" ? "Todos los tipos" : type}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                {/* Priority Filter */}
                <Select
                  value={filters.priorityFilter}
                  onValueChange={(value) =>
                    onFiltersChange({
                      ...filters,
                      priorityFilter: value as TimelineFilters["priorityFilter"],
                    })
                  }
                >
                  <SelectTrigger className="h-9 text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {priorityOptions.map((priority) => (
                      <SelectItem key={priority} value={priority}>
                        {priorityLabels[priority]}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                {/* Status Filter */}
                <Select
                  value={filters.statusFilter}
                  onValueChange={(value) =>
                    onFiltersChange({
                      ...filters,
                      statusFilter: value as TimelineFilters["statusFilter"],
                    })
                  }
                >
                  <SelectTrigger className="h-9 text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {statusOptions.map((status) => (
                      <SelectItem key={status} value={status}>
                        {statusLabels[status]}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                {/* Active Status Filter */}
                <Select
                  value={filters.activeStatusFilter}
                  onValueChange={(value) =>
                    onFiltersChange({
                      ...filters,
                      activeStatusFilter: value as TimelineFilters["activeStatusFilter"],
                    })
                  }
                >
                  <SelectTrigger className="h-9 text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {activeStatusOptions.map((status) => (
                      <SelectItem key={status} value={status}>
                        {activeStatusLabels[status]}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
