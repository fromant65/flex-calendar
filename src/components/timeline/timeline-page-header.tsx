/**
 * Timeline Page Header Component
 * Unified header with controls, filters, and help
 */

"use client"

import { useState } from "react"
import { AnimatePresence, motion } from "framer-motion"
import { 
  ChevronLeft, 
  ChevronRight, 
  Calendar, 
  Filter, 
  X, 
  ChevronDown,
  Search 
} from "lucide-react"
import { Button } from "~/components/ui/button"
import { Badge } from "~/components/ui/badge"
import { HelpTip } from "~/components/ui/help-tip"
import { Input } from "~/components/ui/input"
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "~/components/ui/select"
import type { TimelineFilters } from "./timeline-filters"
import type { NavigationInterval } from "./timeline-controls"
import type { TaskType } from "~/types"

interface TimelinePageHeaderProps {
  // Navigation props
  navigationInterval: NavigationInterval
  setNavigationInterval: (interval: NavigationInterval) => void
  daysToShow: number
  setDaysToShow: (days: number) => void
  onPrevious: () => void
  onNext: () => void
  onToday: () => void
  
  // Filter props
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

export function TimelinePageHeader({
  navigationInterval,
  setNavigationInterval,
  daysToShow,
  setDaysToShow,
  onPrevious,
  onNext,
  onToday,
  filters,
  onFiltersChange,
  totalTasks,
  filteredCount,
}: TimelinePageHeaderProps) {
  const [isFiltersExpanded, setIsFiltersExpanded] = useState(false)

  const hasActiveFilters = 
    filters.searchQuery !== "" || 
    filters.taskTypeFilter !== "all" || 
    filters.priorityFilter !== "all" ||
    filters.statusFilter !== "all"

  const activeFilterCount = [
    filters.searchQuery !== "",
    filters.taskTypeFilter !== "all",
    filters.priorityFilter !== "all",
    filters.statusFilter !== "all",
  ].filter(Boolean).length

  const handleClearFilters = () => {
    onFiltersChange({
      searchQuery: "",
      taskTypeFilter: "all",
      priorityFilter: "all",
      statusFilter: "all",
    })
  }

  return (
    <div className="space-y-2">
      {/* Main Header Row */}
      <div className="flex items-center gap-2 flex-wrap">
        {/* Navigation Controls - Left Side */}
        <div className="flex items-center gap-1.5">
          <Button variant="outline" size="icon" className="h-9 w-9" onClick={onPrevious}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="icon" className="h-9 w-9" onClick={onNext}>
            <ChevronRight className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="sm" className="h-9" onClick={onToday}>
            <Calendar className="mr-1.5 h-4 w-4" />
            <span className="hidden sm:inline">Hoy</span>
          </Button>
        </div>

        {/* View & Jump Selects */}
        <div className="flex items-center gap-2">
          <select
            value={daysToShow}
            onChange={(e) => setDaysToShow(Number(e.target.value))}
            className="h-9 rounded-md border border-border bg-background px-2 py-1 text-xs"
          >
            <option value={1}>1 día</option>
            <option value={3}>3 días</option>
            <option value={7}>1 sem</option>
            <option value={14}>2 sem</option>
            <option value={30}>1 mes</option>
            <option value={90}>3 m</option>
            <option value={180}>6 m</option>
            <option value={365}>1 año</option>
          </select>

          <select
            value={navigationInterval}
            onChange={(e) => setNavigationInterval(e.target.value as NavigationInterval)}
            className="h-9 rounded-md border border-border bg-background px-2 py-1 text-xs"
          >
            <option value="3hours">3h</option>
            <option value="day">Día</option>
            <option value="week">Sem</option>
            <option value="month">Mes</option>
            <option value="year">Año</option>
          </select>
        </div>

        {/* Spacer - grows to push filters button to the right */}
        <div className="hidden lg:flex-1" />

        {/* Filter Button - Middle/Right on Desktop */}
        <div className="flex items-center gap-2 flex-wrap">
          <Button
            variant={hasActiveFilters ? "default" : "outline"}
            size="sm"
            onClick={() => setIsFiltersExpanded(!isFiltersExpanded)}
            className="gap-2 h-9"
          >
            <Filter className="h-4 w-4" />
            <span>Filtros</span>
            {activeFilterCount > 0 && (
              <Badge variant="secondary" className="h-5 px-1.5 text-xs ml-0.5">
                {activeFilterCount}
              </Badge>
            )}
            <ChevronDown className={`h-4 w-4 transition-transform ${isFiltersExpanded ? "rotate-180" : ""}`} />
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
                <span className="text-xs hidden sm:inline">Limpiar</span>
              </Button>

              <Badge variant="secondary" className="text-xs h-9 px-2">
                <span className="hidden xs:inline">{filteredCount} de {totalTasks}</span>
                <span className="xs:hidden">{filteredCount}/{totalTasks}</span>
              </Badge>
            </>
          )}
        </div>

        {/* Help Tip - Far Right */}
        <HelpTip title="Vista Línea de Tiempo" side="bottom">
          <div className="space-y-2 text-sm max-w-md">
            <p>
              La vista de línea de tiempo te permite visualizar tus tareas y sus ocurrencias 
              a lo largo del tiempo de forma gráfica.
            </p>
            
            <p className="font-semibold mt-3">Controles de navegación:</p>
            <p>
              • <strong>Vista</strong>: Cambia cuántos días/semanas/meses ver
            </p>
            <p>
              • <strong>Salto</strong>: Define el intervalo al navegar con las flechas
            </p>
            <p>
              • <strong>Hoy</strong>: Vuelve rápidamente a la fecha actual
            </p>
            
            <p className="font-semibold mt-3">Filtros:</p>
            <p>
              Usa el botón de <strong>Filtros</strong> para refinar qué tareas ver:
            </p>
            <p>
              • <strong>Búsqueda</strong>: Filtra por nombre o descripción
            </p>
            <p>
              • <strong>Tipo</strong>: Muestra solo ciertos tipos de tareas
            </p>
            <p>
              • <strong>Prioridad</strong>: Filtra por matriz de Eisenhower
            </p>
            <p>
              • <strong>Estado</strong>: Muestra tareas con pendientes, completadas, etc.
            </p>
            
            <p className="font-semibold mt-3">Interacción:</p>
            <p>
              Haz clic en cualquier celda para ver detalles de las ocurrencias y eventos.
            </p>
            
            <p className="font-semibold mt-3">Códigos de color:</p>
            <p>
              • <span className="text-green-600">Verde</span>: Completado •{" "}
              <span className="text-yellow-600">Amarillo</span>: Pendiente •{" "}
              <span className="text-gray-500">Gris</span>: Salteado •{" "}
              <span className="text-red-600">Rojo</span>: No completado
            </p>
          </div>
        </HelpTip>
      </div>

      {/* Expandable Filters Panel */}
      <AnimatePresence>
        {isFiltersExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="bg-card/50 backdrop-blur-sm rounded-lg border border-border/50 p-3">
              {/* Single row on large screens, 2 rows on mobile */}
              <div className="flex flex-col sm:flex-row gap-2">
                {/* Search bar - flexible width, takes remaining space on large screens */}
                <div className="relative sm:flex-1 sm:min-w-[200px] sm:max-w-[400px]">
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

                {/* Filter Selects - compact, fixed widths on desktop */}
                <div className="flex gap-2">
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
                    <SelectTrigger className="h-9 text-xs w-full sm:w-[140px]">
                      <SelectValue placeholder="Tipo" />
                    </SelectTrigger>
                    <SelectContent>
                      {taskTypes.map((type) => (
                        <SelectItem key={type} value={type}>
                          {type === "all" ? "Todos" : type}
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
                    <SelectTrigger className="h-9 text-xs w-full sm:w-[140px]">
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
                    <SelectTrigger className="h-9 text-xs w-full sm:w-[140px]">
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
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
