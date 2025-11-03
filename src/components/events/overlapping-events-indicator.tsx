"use client"

import { useState } from "react"
import type { EventWithDetails } from "~/types"
import { ensureLocalDate } from "~/lib/calendar-utils"
import { getTaskTypeClassName } from "~/lib/task-type-colors"
import { Clock, ChevronDown, Calendar } from "lucide-react"
import { cn } from "~/lib/utils"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "~/components/ui/dialog"

interface OverlappingEventsIndicatorProps {
  events: EventWithDetails[]
  startHour: number
  duration: number
  onEventClick: (event: EventWithDetails) => void
}

export function OverlappingEventsIndicator({
  events,
  startHour,
  duration,
  onEventClick,
}: OverlappingEventsIndicatorProps) {
  const [isOpen, setIsOpen] = useState(false)

  const handleIndicatorClick = (e: React.MouseEvent) => {
    e.stopPropagation()
    setIsOpen(true)
  }

  const handleEventClick = (event: EventWithDetails) => {
    setIsOpen(false)
    onEventClick(event)
  }

  return (
    <>
      {/* Indicator Card */}
      <div
        className="absolute left-1 lg:left-2 right-1 lg:right-2 border-l-2 lg:border-l-4 border-primary rounded p-1 lg:p-2 transition-all cursor-pointer bg-primary/10 hover:bg-primary/20 backdrop-blur-sm z-[5]"
        style={{
          top: `calc(${startHour} * var(--cell-height))`,
          height: `calc(${duration} * var(--cell-height))`,
        }}
        onClick={handleIndicatorClick}
      >
        <div className="flex items-center justify-between gap-1">
          <div className="text-[9px] lg:text-[10px] font-medium text-primary line-clamp-1">
            {events.length} eventos
          </div>
          <ChevronDown 
            className="w-2.5 h-2.5 lg:w-3 lg:h-3 text-primary flex-shrink-0" 
          />
        </div>
        <div className="text-[8px] lg:text-[9px] text-muted-foreground mt-0.5 line-clamp-1">
          Click para ver
        </div>
      </div>

      {/* Modal with Event List */}
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="max-w-md max-h-[80vh] overflow-hidden flex flex-col">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Calendar className="w-5 h-5" />
              Eventos simultáneos ({events.length})
            </DialogTitle>
          </DialogHeader>
          
          <div className="overflow-y-auto flex-1 -mx-6 px-6">
            <div className="space-y-2">
              {events.map((event) => {
                const start = ensureLocalDate(event.start)
                const finish = ensureLocalDate(event.finish)
                const taskTypeClassName = getTaskTypeClassName(event.occurrence?.task?.taskType, {
                  includeHover: true,
                  includeRing: false,
                })

                return (
                  <div
                    key={event.id}
                    className={cn(
                      "p-3 rounded-lg cursor-pointer transition-all border-l-4",
                      taskTypeClassName,
                      "hover:shadow-md"
                    )}
                    onClick={() => handleEventClick(event)}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-semibold text-foreground mb-1 flex items-center gap-2">
                          {event.occurrence?.task?.name || "Untitled Event"}
                          {event.isFixed && <span className="text-xs">🔒</span>}
                        </div>
                        <div className="text-xs text-muted-foreground flex items-center gap-1.5 mb-1">
                          <Clock className="w-3.5 h-3.5 flex-shrink-0" />
                          <span>
                            {start.toLocaleTimeString("es-ES", { hour: "2-digit", minute: "2-digit" })} -{" "}
                            {finish.toLocaleTimeString("es-ES", { hour: "2-digit", minute: "2-digit" })}
                          </span>
                        </div>
                        {event.context && (
                          <div className="text-xs text-muted-foreground mt-1.5 p-2 bg-muted/30 rounded">
                            {event.context}
                          </div>
                        )}
                        {event.occurrence?.task?.description && (
                          <div className="text-xs text-muted-foreground mt-1.5 line-clamp-2">
                            {event.occurrence.task.description}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}
