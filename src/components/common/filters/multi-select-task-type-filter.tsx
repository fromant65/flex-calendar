"use client"

import { Popover, PopoverContent, PopoverTrigger } from "~/components/ui/popover"
import { Button } from "~/components/ui/button"
import { Badge } from "~/components/ui/badge"
import { Checkbox } from "~/components/ui/checkbox"
import { Label } from "~/components/ui/label"
import { Separator } from "~/components/ui/separator"
import { Filter } from "lucide-react"
import type { TaskType } from "~/types"
import { taskTypeLabels, taskTypes } from "~/types/filters"

interface MultiSelectTaskTypeFilterProps {
  selectedTypes: TaskType[]
  onToggle: (type: TaskType) => void
  onClear: () => void
}

export function MultiSelectTaskTypeFilter({
  selectedTypes,
  onToggle,
  onClear,
}: MultiSelectTaskTypeFilterProps) {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="outline" className="h-9 text-xs w-full sm:w-auto justify-start">
          <Filter className="h-4 w-4 mr-2" />
          {selectedTypes.length === 0 ? (
            "Tipos de tarea"
          ) : selectedTypes.length === 1 ? (
            taskTypeLabels[selectedTypes[0]!]
          ) : (
            `${selectedTypes.length} tipos`
          )}
          {selectedTypes.length > 0 && (
            <Badge variant="secondary" className="ml-2 h-5 px-1.5">
              {selectedTypes.length}
            </Badge>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[240px] p-3" align="start">
        <div className="space-y-2">
          <div className="font-semibold text-sm mb-2">Tipos de tarea</div>
          {taskTypes.map((type) => (
            <div key={type} className="flex items-center space-x-2">
              <Checkbox
                id={`task-type-${type}`}
                checked={selectedTypes.includes(type)}
                onCheckedChange={() => onToggle(type)}
              />
              <Label
                htmlFor={`task-type-${type}`}
                className="text-sm cursor-pointer flex-1"
              >
                {taskTypeLabels[type]}
              </Label>
            </div>
          ))}
          {selectedTypes.length > 0 && (
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
