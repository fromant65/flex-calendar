"use client"

import { Button } from "~/components/ui/button"
import { Badge } from "~/components/ui/badge"
import type { TimelineGrouping } from "./task-manager-timeline"
import { 
  Filter, 
  CheckCircle2, 
  Circle, 
  Clock, 
  XCircle,
  Layers,
  List
} from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuCheckboxItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "~/components/ui/dropdown-menu"

interface TimelineFilterBarProps {
  grouping: TimelineGrouping
  onGroupingChange: (grouping: TimelineGrouping) => void
  selectedStatuses: string[]
  onStatusesChange: (statuses: string[]) => void
}

const statusConfig = {
  Pending: { 
    label: "Pendiente", 
    icon: Circle, 
    color: "text-amber-600 dark:text-amber-400" 
  },
  "In Progress": { 
    label: "En Progreso", 
    icon: Clock, 
    color: "text-blue-600 dark:text-blue-400" 
  },
  Completed: { 
    label: "Completado", 
    icon: CheckCircle2, 
    color: "text-emerald-600 dark:text-emerald-400" 
  },
  Skipped: { 
    label: "Saltado", 
    icon: XCircle, 
    color: "text-slate-500 dark:text-slate-400" 
  },
}

export function TimelineFilterBar({
  grouping,
  onGroupingChange,
  selectedStatuses,
  onStatusesChange,
}: TimelineFilterBarProps) {
  const toggleStatus = (status: string) => {
    if (selectedStatuses.includes(status)) {
      // Don't allow removing all statuses
      if (selectedStatuses.length > 1) {
        onStatusesChange(selectedStatuses.filter((s) => s !== status))
      }
    } else {
      onStatusesChange([...selectedStatuses, status])
    }
  }

  return (
    <div className="flex flex-wrap items-center justify-between gap-2">
      {/* Grouping Options */}
      <div className="flex items-center gap-1.5">
        <span className="text-xs font-medium text-muted-foreground hidden sm:inline">Agrupar:</span>
        <div className="flex gap-0.5 rounded-md bg-muted p-0.5">
          <Button
            variant={grouping === "none" ? "default" : "ghost"}
            size="sm"
            onClick={() => onGroupingChange("none")}
            className="h-6 gap-1 px-1.5 text-xs"
            title="Sin agrupación"
          >
            <List className="h-3 w-3" />
            <span className="hidden lg:inline">Ninguno</span>
          </Button>
          <Button
            variant={grouping === "task" ? "default" : "ghost"}
            size="sm"
            onClick={() => onGroupingChange("task")}
            className="h-6 gap-1 px-1.5 text-xs"
            title="Agrupar por tarea"
          >
            <Layers className="h-3 w-3" />
            <span className="hidden lg:inline">Tarea</span>
          </Button>
          <Button
            variant={grouping === "status" ? "default" : "ghost"}
            size="sm"
            onClick={() => onGroupingChange("status")}
            className="h-6 gap-1 px-1.5 text-xs"
            title="Agrupar por estado"
          >
            <Filter className="h-3 w-3" />
            <span className="hidden lg:inline">Estado</span>
          </Button>
        </div>
      </div>

      {/* Status Filter */}
      <div className="flex items-center gap-1.5">
        <span className="text-xs font-medium text-muted-foreground hidden sm:inline">Filtrar:</span>
        
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm" className="h-6 gap-1.5 px-2 text-xs">
              <Filter className="h-3 w-3" />
              <span className="hidden sm:inline">Estados</span>
              <Badge variant="secondary" className="h-4 px-1 text-xs">
                {selectedStatuses.length}
              </Badge>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            <DropdownMenuLabel className="text-xs">Estados</DropdownMenuLabel>
            <DropdownMenuSeparator />
            {Object.entries(statusConfig).map(([status, config]) => {
              const Icon = config.icon
              return (
                <DropdownMenuCheckboxItem
                  key={status}
                  checked={selectedStatuses.includes(status)}
                  onCheckedChange={() => toggleStatus(status)}
                  disabled={selectedStatuses.length === 1 && selectedStatuses.includes(status)}
                  className="text-xs"
                >
                  <Icon className={`mr-2 h-3.5 w-3.5 ${config.color}`} />
                  {config.label}
                </DropdownMenuCheckboxItem>
              )
            })}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  )
}
