/**
 * Timeline Modals Component
 */

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "~/components/ui/dialog"
import type { OccurrenceWithTask, EventWithDetails } from "~/types"
import { StatusBadge } from "./status-badge"
import { TaskInfo } from "./task-info"
import { TotalTimeDisplay } from "./total-time-display"
import { OccurrenceAccordion } from "./occurrence-accordion"

export interface DayCellDetails {
  date: Date
  task: {
    id: number
    name: string
    description: string | null
    importance: number
  }
  occurrences: OccurrenceWithTask[] // Support multiple occurrences
  events: EventWithDetails[]
  totalTimeSpent: number
  status: "completed" | "skipped" | "not-completed"
}

interface TimelineModalsProps {
  selectedDayCell: DayCellDetails | null
  onClose: () => void
}

export function TimelineModals({ selectedDayCell, onClose }: TimelineModalsProps) {
  if (!selectedDayCell) return null

  // State for accordion - track which occurrences are open
  const [openOccurrences, setOpenOccurrences] = useState<Set<number>>(
    new Set(selectedDayCell.occurrences.map((_, index) => index))
  )

  const toggleOccurrence = (index: number) => {
    setOpenOccurrences((prev) => {
      const newSet = new Set(prev)
      if (newSet.has(index)) {
        newSet.delete(index)
      } else {
        newSet.add(index)
      }
      return newSet
    })
  }

  const formatTime = (minutes: number) => {
    const hours = Math.floor(minutes / 60)
    const mins = minutes % 60
    if (hours > 0) {
      return `${hours}h ${mins}m`
    }
    return `${mins}m`
  }

  const formatDateTime = (date: Date | string) => {
    return new Date(date).toLocaleString("es-ES", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  const formatDateOnly = (date: Date | string) => {
    return new Date(date).toLocaleDateString("es-ES", {
      year: "numeric",
      month: "long",
      day: "numeric",
    })
  }

  return (
    <Dialog open={true} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold flex items-center gap-2">
            {selectedDayCell.task.name}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Status Badge */}
          <div className="flex items-center justify-between">
            <StatusBadge status={selectedDayCell.status} />
            <div className="text-sm text-muted-foreground">
              {formatDateOnly(selectedDayCell.date)}
            </div>
          </div>

          {/* Task Information */}
          <TaskInfo task={selectedDayCell.task} />

          {/* Time Information */}
          <TotalTimeDisplay 
            totalMinutes={selectedDayCell.totalTimeSpent} 
            formatTime={formatTime} 
          />

          {/* Occurrences Details - Accordion style */}
          {selectedDayCell.occurrences.length > 0 && (
            <div className="space-y-2">
              <h3 className="font-semibold text-sm uppercase tracking-wide text-slate-600 dark:text-slate-400">
                Ocurrencias ({selectedDayCell.occurrences.length})
              </h3>
              
              {selectedDayCell.occurrences.map((occurrence, index) => {
                // Find events associated with this occurrence
                const occurrenceEvents = selectedDayCell.events.filter(
                  event => event.associatedOccurrenceId === occurrence.id
                )
                
                return (
                  <OccurrenceAccordion
                    key={occurrence.id}
                    occurrence={occurrence}
                    index={index}
                    events={occurrenceEvents}
                    formatTime={formatTime}
                    formatDateTime={formatDateTime}
                    isOpen={openOccurrences.has(index)}
                    onToggle={() => toggleOccurrence(index)}
                  />
                )
              })}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
