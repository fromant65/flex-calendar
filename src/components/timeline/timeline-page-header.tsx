/**
 * Timeline Page Header Component
 * Unified header with controls, filters, and help
 */

"use client"

import { 
  ChevronLeft, 
  ChevronRight, 
  Calendar, 
} from "lucide-react"
import { Button } from "~/components/ui/button"
import { HelpTip } from "~/components/ui/help-tip"
import { UnifiedFilterBar } from "~/components/common/unified-filter-bar"
import type { UnifiedFilters } from "~/types/filters"
import type { NavigationInterval } from "./timeline-controls"

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
  filters: UnifiedFilters
  onFiltersChange: (filters: UnifiedFilters) => void
  totalTasks: number
  filteredCount: number
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

        {/* Spacer - grows to push help tip to the right */}
        <div className="hidden lg:flex-1" />

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

      {/* Unified Filter Bar */}
      <UnifiedFilterBar
        filters={filters}
        onFiltersChange={onFiltersChange}
        config={{
          enableSearch: true,
          enableTaskType: true,
          enableMultiTaskType: true,
          enablePriority: true,
          enableMultiPriority: true,
          enableTaskOccurrenceStatus: true,
          enableMultiTaskOccurrenceStatus: true,
          enableSort: true,
          collapsible: true,
          defaultExpanded: false,
        }}
        totalCount={totalTasks}
        filteredCount={filteredCount}
      />
    </div>
  )
}
