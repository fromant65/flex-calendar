"use client"

import { Popover, PopoverContent, PopoverTrigger } from "~/components/ui/popover"
import { Button } from "~/components/ui/button"
import { Badge } from "~/components/ui/badge"
import { Checkbox } from "~/components/ui/checkbox"
import { Label } from "~/components/ui/label"
import { Separator } from "~/components/ui/separator"
import { Filter } from "lucide-react"
import type { TaskOccurrenceStatus } from "~/types"
import { taskOccurrenceStatusLabels, taskOccurrenceStatusOptions } from "~/types/filters"

interface MultiSelectOccurrenceStatusFilterProps {
  selectedStatuses: TaskOccurrenceStatus[]
  onToggle: (status: TaskOccurrenceStatus) => void
  onClear: () => void
}

export function MultiSelectOccurrenceStatusFilter({
  selectedStatuses,
  onToggle,
  onClear,
}: MultiSelectOccurrenceStatusFilterProps) {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="outline" className="h-9 text-xs w-full sm:w-auto justify-start">
          <Filter className="h-4 w-4 mr-2" />
          {selectedStatuses.length === 0 ? (
            "Estados"
          ) : selectedStatuses.length === 1 ? (
            taskOccurrenceStatusLabels[selectedStatuses[0]!]
          ) : (
            `${selectedStatuses.length} estados`
          )}
          {selectedStatuses.length > 0 && (
            <Badge variant="secondary" className="ml-2 h-5 px-1.5">
              {selectedStatuses.length}
            </Badge>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[240px] p-3" align="start">
        <div className="space-y-2">
          <div className="font-semibold text-sm mb-2">Estados de ocurrencia</div>
          {taskOccurrenceStatusOptions.map((status) => (
            <div key={status} className="flex items-center space-x-2">
              <Checkbox
                id={`occurrence-status-${status}`}
                checked={selectedStatuses.includes(status)}
                onCheckedChange={() => onToggle(status)}
              />
              <Label
                htmlFor={`occurrence-status-${status}`}
                className="text-sm cursor-pointer flex-1"
              >
                {taskOccurrenceStatusLabels[status]}
              </Label>
            </div>
          ))}
          {selectedStatuses.length > 0 && (
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
