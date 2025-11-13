"use client"

import { Popover, PopoverContent, PopoverTrigger } from "~/components/ui/popover"
import { Button } from "~/components/ui/button"
import { Badge } from "~/components/ui/badge"
import { Separator } from "~/components/ui/separator"
import { Filter } from "lucide-react"
import type { PriorityFilter } from "~/types/filters"
import { priorityLabels } from "~/types/filters"
import { cn } from "~/lib/utils"

interface MultiSelectPriorityFilterProps {
  selectedPriorities: PriorityFilter[]
  onToggle: (priority: PriorityFilter) => void
  onClear: () => void
}

// Matrix configuration with colors optimized for dark mode
const matrixConfig: Record<PriorityFilter, { label: string; shortLabel: string; bgColor: string; hoverColor: string; textColor: string; borderColor: string }> = {
  "not-urgent-important": {
    label: "No Urgente e Importante",
    shortLabel: "Importante",
    bgColor: "bg-green-100 dark:bg-green-900/50",
    hoverColor: "hover:bg-green-200 dark:hover:bg-green-800/50",
    textColor: "text-green-800 dark:text-green-200",
    borderColor: "border-green-500 dark:border-green-400",
  },
  "urgent-important": {
    label: "Urgente e Importante",
    shortLabel: "Crítico",
    bgColor: "bg-red-100 dark:bg-red-900/50",
    hoverColor: "hover:bg-red-200 dark:hover:bg-red-800/50",
    textColor: "text-red-800 dark:text-red-200",
    borderColor: "border-red-500 dark:border-red-400",
  },
  "not-urgent-not-important": {
    label: "No Urgente y No Importante",
    shortLabel: "Descartable",
    bgColor: "bg-gray-100 dark:bg-gray-800/50",
    hoverColor: "hover:bg-gray-200 dark:hover:bg-gray-700/50",
    textColor: "text-gray-800 dark:text-gray-200",
    borderColor: "border-gray-500 dark:border-gray-400",
  },
  "urgent-not-important": {
    label: "Urgente y No Importante",
    shortLabel: "Delegable",
    bgColor: "bg-amber-100 dark:bg-amber-900/50",
    hoverColor: "hover:bg-amber-200 dark:hover:bg-amber-800/50",
    textColor: "text-amber-800 dark:text-amber-200",
    borderColor: "border-amber-500 dark:border-amber-400",
  },
}

export function MultiSelectPriorityFilter({
  selectedPriorities,
  onToggle,
  onClear,
}: MultiSelectPriorityFilterProps) {
  const getDisplayLabel = () => {
    if (selectedPriorities.length === 0) return "Prioridades"
    if (selectedPriorities.length === 1) return matrixConfig[selectedPriorities[0]!].shortLabel
    if (selectedPriorities.length === 4) return "Todas las prioridades"
    return `${selectedPriorities.length} prioridades`
  }

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="outline" className="h-9 text-xs w-full sm:w-auto justify-start">
          <Filter className="h-4 w-4 mr-2" />
          {getDisplayLabel()}
          {selectedPriorities.length > 0 && (
            <Badge variant="secondary" className="ml-2 h-5 px-1.5">
              {selectedPriorities.length}
            </Badge>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[340px] p-3" align="start">
        <div className="space-y-3">
          <div className="font-semibold text-sm">Matriz de Eisenhower</div>
          
          {/* Grid 2x2: [Eje Vertical | Matriz] / [Vacío | Eje Horizontal] */}
          <div className="grid grid-cols-[auto_1fr] grid-rows-[1fr_auto] gap-2">
            {/* Eje vertical (Importancia) - Fila 1, Columna 1 */}
            <div className="flex flex-col justify-between items-center text-[9px] text-muted-foreground leading-tight">
              <div className="text-center">
                <div>Más</div>
                <div>importante</div>
              </div>
              <div className="text-xs font-bold text-muted-foreground/30">↕</div>
              <div className="text-center">
                <div>Menos</div>
                <div>importante</div>
              </div>
            </div>

            {/* Matriz 2x2 - Fila 1, Columna 2 */}
            <div className="grid grid-cols-2 gap-2">
              {/* Top Left: Not Urgent but Important */}
              <button
                onClick={() => onToggle("not-urgent-important")}
                className={cn(
                  "p-4 rounded-lg border-2 transition-all text-center",
                  matrixConfig["not-urgent-important"].bgColor,
                  matrixConfig["not-urgent-important"].hoverColor,
                  matrixConfig["not-urgent-important"].textColor,
                  selectedPriorities.includes("not-urgent-important")
                    ? `${matrixConfig["not-urgent-important"].borderColor} ring-2 ring-offset-1 ring-current/20`
                    : "border-border/50"
                )}
              >
                <div className="font-semibold text-sm">
                  {matrixConfig["not-urgent-important"].shortLabel}
                </div>
              </button>

              {/* Top Right: Urgent and Important */}
              <button
                onClick={() => onToggle("urgent-important")}
                className={cn(
                  "p-4 rounded-lg border-2 transition-all text-center",
                  matrixConfig["urgent-important"].bgColor,
                  matrixConfig["urgent-important"].hoverColor,
                  matrixConfig["urgent-important"].textColor,
                  selectedPriorities.includes("urgent-important")
                    ? `${matrixConfig["urgent-important"].borderColor} ring-2 ring-offset-1 ring-current/20`
                    : "border-border/50"
                )}
              >
                <div className="font-semibold text-sm">
                  {matrixConfig["urgent-important"].shortLabel}
                </div>
              </button>

              {/* Bottom Left: Not Urgent, Not Important */}
              <button
                onClick={() => onToggle("not-urgent-not-important")}
                className={cn(
                  "p-4 rounded-lg border-2 transition-all text-center",
                  matrixConfig["not-urgent-not-important"].bgColor,
                  matrixConfig["not-urgent-not-important"].hoverColor,
                  matrixConfig["not-urgent-not-important"].textColor,
                  selectedPriorities.includes("not-urgent-not-important")
                    ? `${matrixConfig["not-urgent-not-important"].borderColor} ring-2 ring-offset-1 ring-current/20`
                    : "border-border/50"
                )}
              >
                <div className="font-semibold text-sm">
                  {matrixConfig["not-urgent-not-important"].shortLabel}
                </div>
              </button>

              {/* Bottom Right: Urgent but Not Important */}
              <button
                onClick={() => onToggle("urgent-not-important")}
                className={cn(
                  "p-4 rounded-lg border-2 transition-all text-center",
                  matrixConfig["urgent-not-important"].bgColor,
                  matrixConfig["urgent-not-important"].hoverColor,
                  matrixConfig["urgent-not-important"].textColor,
                  selectedPriorities.includes("urgent-not-important")
                    ? `${matrixConfig["urgent-not-important"].borderColor} ring-2 ring-offset-1 ring-current/20`
                    : "border-border/50"
                )}
              >
                <div className="font-semibold text-sm">
                  {matrixConfig["urgent-not-important"].shortLabel}
                </div>
              </button>
            </div>

            {/* Vacío - Fila 2, Columna 1 */}
            <div></div>

            {/* Eje horizontal (Urgencia) - Fila 2, Columna 2 */}
            <div className="flex items-center justify-between text-[10px] text-muted-foreground px-1">
              <span>Menos urgente</span>
              <span className="text-base font-bold text-muted-foreground/30">↔</span>
              <span>Más urgente</span>
            </div>
          </div>

          {selectedPriorities.length > 0 && (
            <>
              <Separator className="my-2" />
              <Button
                variant="ghost"
                size="sm"
                onClick={onClear}
                className="w-full h-8 text-xs"
              >
                Limpiar selección
              </Button>
            </>
          )}
        </div>
      </PopoverContent>
    </Popover>
  )
}
