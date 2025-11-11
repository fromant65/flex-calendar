/**
 * Occurrence Accordion Component
 * Displays a single occurrence with its events in an accordion format
 */

import { useState } from "react"
import { Clock, Calendar, AlertCircle, CheckCircle2, ChevronDown } from "lucide-react"
import type { OccurrenceWithTask, EventWithDetails } from "~/types"
import { getLimitDateDisplay, formatDateShort } from "~/lib/date-display-utils"

interface OccurrenceAccordionProps {
  occurrence: OccurrenceWithTask
  index: number
  events: EventWithDetails[]
  formatTime: (minutes: number) => string
  formatDateTime: (date: Date | string) => string
  isOpen: boolean
  onToggle: () => void
}

export function OccurrenceAccordion({
  occurrence,
  index,
  events,
  formatTime,
  formatDateTime,
  isOpen,
  onToggle,
}: OccurrenceAccordionProps) {
  const limitDisplay = getLimitDateDisplay(occurrence.limitDate);
  
  return (
    <div className="rounded-lg border border-border bg-muted/10 overflow-hidden">
      {/* Accordion Header */}
      <button
        onClick={onToggle}
        className="w-full p-4 flex items-center justify-between hover:bg-muted/20 transition-colors"
      >
        <div className="flex items-center gap-3">
          <ChevronDown 
            className={`h-5 w-5 text-foreground transition-transform ${
              isOpen ? "rotate-180" : ""
            }`}
          />
          <h4 className="font-semibold text-foreground">
            Ocurrencia #{index + 1}
          </h4>
        </div>
      </button>

      {/* Accordion Content */}
      {isOpen && (
        <div className="px-4 pb-4 space-y-3">
          <div className="grid gap-2 text-sm">
            <div className="flex items-center gap-2.5 rounded-lg bg-muted/20 p-2.5">
              <div className="flex h-8 w-8 items-center justify-center rounded-md bg-primary/10">
                <Calendar className="h-4 w-4 text-primary" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Fecha de Inicio</p>
                <p className="text-sm font-semibold text-foreground">
                  {formatDateTime(occurrence.startDate)}
                </p>
              </div>
            </div>
            
            {occurrence.completedAt && (
              <div className="flex items-center gap-2.5 rounded-lg bg-muted/20 p-2.5">
                <div className="flex h-8 w-8 items-center justify-center rounded-md bg-green-500/10">
                  <CheckCircle2 className="h-4 w-4 text-green-600 dark:text-green-400" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Fecha de Finalización</p>
                  <p className="text-sm font-semibold text-foreground">
                    {formatDateTime(occurrence.completedAt)}
                  </p>
                </div>
              </div>
            )}

            {occurrence.limitDate && (
              <div className="flex items-center gap-2.5 rounded-lg bg-muted/20 p-2.5">
                <div className="flex h-8 w-8 items-center justify-center rounded-md bg-orange-500/10">
                  <AlertCircle className="h-4 w-4 text-orange-600 dark:text-orange-400" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Fecha Límite</p>
                  <p className={`text-sm font-semibold ${limitDisplay.color}`}>
                    {formatDateShort(occurrence.limitDate)}
                  </p>
                </div>
              </div>
            )}

            <div className="flex items-center gap-2.5 rounded-lg bg-muted/20 p-2.5">
              <div className="flex h-8 w-8 items-center justify-center rounded-md bg-muted/30">
                <CheckCircle2 className="h-4 w-4 text-foreground" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Estado</p>
                <p className="text-sm font-semibold text-foreground">{occurrence.status}</p>
              </div>
            </div>

            {occurrence.targetTimeConsumption && (
              <div className="flex items-center gap-2.5 rounded-lg bg-muted/20 p-2.5">
                <div className="flex h-8 w-8 items-center justify-center rounded-md bg-primary/10">
                  <Clock className="h-4 w-4 text-primary" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Tiempo Objetivo</p>
                  <p className="text-sm font-semibold text-foreground">
                    {formatTime(occurrence.targetTimeConsumption)}
                  </p>
                </div>
              </div>
            )}

            {occurrence.timeConsumed ? (
              <div className="flex items-center gap-2.5 rounded-lg bg-muted/20 p-2.5">
                <div className="flex h-8 w-8 items-center justify-center rounded-md bg-green-500/10">
                  <Clock className="h-4 w-4 text-green-600 dark:text-green-400" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Tiempo Consumido</p>
                  <p className="text-sm font-semibold text-foreground">
                    {formatTime(occurrence.timeConsumed)}
                  </p>
                </div>
              </div>
            ) : null}
          </div>

          {/* Events for this occurrence */}
          {events.length > 0 && (
            <div className="mt-3 pt-3 border-t border-border">
              <h5 className="text-xs font-semibold text-muted-foreground mb-2 uppercase tracking-wide">
                Eventos de esta Ocurrencia ({events.length})
              </h5>
              
              <div className="space-y-2">
                {events.map((event, eventIndex) => (
                  <div
                    key={event.id}
                    className="p-2.5 rounded-lg border border-border bg-muted/10"
                  >
                    <div className="flex items-start justify-between mb-1.5">
                      <div className="font-medium text-sm text-foreground">
                        {event.context || `Evento ${eventIndex + 1}`}
                      </div>
                      <div className={`text-xs px-1.5 py-0.5 rounded font-medium ${
                        event.isCompleted
                          ? "bg-green-500/10 text-green-600 dark:text-green-400"
                          : "bg-muted/30 text-muted-foreground"
                      }`}>
                        {event.isCompleted ? "✓" : "○"}
                      </div>
                    </div>

                    <div className="grid gap-1 text-xs text-muted-foreground">
                      <div className="flex items-center gap-1.5">
                        <Calendar className="h-3 w-3" />
                        <span className="font-medium">
                          {new Date(event.start).toLocaleDateString("es-ES", { 
                            day: "2-digit", 
                            month: "short",
                            year: "numeric"
                          })}
                        </span>
                        <span>•</span>
                        <span>
                          {new Date(event.start).toLocaleTimeString("es-ES", { hour: "2-digit", minute: "2-digit" })} - {new Date(event.finish).toLocaleTimeString("es-ES", { hour: "2-digit", minute: "2-digit" })}
                        </span>
                      </div>
                      
                      {event.dedicatedTime > 0 ? (
                        <div className="flex items-center gap-1.5">
                          <Clock className="h-3 w-3" />
                          {formatTime(event.dedicatedTime)}
                        </div>
                      ) : null}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
