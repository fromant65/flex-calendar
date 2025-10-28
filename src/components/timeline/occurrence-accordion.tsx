/**
 * Occurrence Accordion Component
 * Displays a single occurrence with its events in an accordion format
 */

import { useState } from "react"
import { Clock, Calendar, AlertCircle, CheckCircle2, ChevronDown } from "lucide-react"
import type { OccurrenceWithTask, EventWithDetails } from "~/types"

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
  return (
    <div className="rounded-lg bg-indigo-50 dark:bg-indigo-950/30 border border-indigo-200 dark:border-indigo-800/50 overflow-hidden">
      {/* Accordion Header */}
      <button
        onClick={onToggle}
        className="w-full p-4 flex items-center justify-between hover:bg-indigo-100 dark:hover:bg-indigo-900/40 transition-colors"
      >
        <div className="flex items-center gap-3">
          <ChevronDown 
            className={`h-5 w-5 text-indigo-600 dark:text-indigo-400 transition-transform ${
              isOpen ? "rotate-180" : ""
            }`}
          />
          <h4 className="font-semibold text-indigo-900 dark:text-indigo-100">
            Ocurrencia #{index + 1}
          </h4>
        </div>
        {occurrence.urgency !== undefined && (
          <div className="flex items-center gap-1 px-2 py-1 rounded bg-amber-100 dark:bg-amber-900/30 border border-amber-200 dark:border-amber-800">
            <AlertCircle className="h-3 w-3 text-amber-600 dark:text-amber-400" />
            <span className="text-xs font-bold text-amber-700 dark:text-amber-300">
              Urgencia: {occurrence.urgency}/10
            </span>
          </div>
        )}
      </button>

      {/* Accordion Content */}
      {isOpen && (
        <div className="px-4 pb-4 space-y-3">
          <div className="grid gap-2 text-sm">
            <div className="flex items-start gap-2">
              <Calendar className="h-4 w-4 mt-0.5 text-indigo-600 dark:text-indigo-400" />
              <div>
                <span className="font-medium text-indigo-900 dark:text-indigo-100">Fecha de Inicio:</span>
                <div className="text-indigo-700 dark:text-indigo-300">
                  {formatDateTime(occurrence.startDate)}
                </div>
              </div>
            </div>
            
            {occurrence.completedAt && (
              <div className="flex items-start gap-2">
                <CheckCircle2 className="h-4 w-4 mt-0.5 text-green-600 dark:text-green-400" />
                <div>
                  <span className="font-medium text-indigo-900 dark:text-indigo-100">Fecha de Finalización:</span>
                  <div className="text-indigo-700 dark:text-indigo-300">
                    {formatDateTime(occurrence.completedAt)}
                  </div>
                </div>
              </div>
            )}

            <div className="flex items-center gap-2">
              <span className="font-medium text-indigo-900 dark:text-indigo-100">Estado:</span>
              <span className="px-2 py-0.5 rounded text-xs bg-indigo-200 dark:bg-indigo-800 text-indigo-900 dark:text-indigo-100 font-medium">
                {occurrence.status}
              </span>
            </div>

            {occurrence.targetTimeConsumption && (
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
                <span className="font-medium text-indigo-900 dark:text-indigo-100">Tiempo Objetivo:</span>
                <span className="font-mono text-indigo-700 dark:text-indigo-300">
                  {formatTime(occurrence.targetTimeConsumption)}
                </span>
              </div>
            )}

            {occurrence.timeConsumed && (
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
                <span className="font-medium text-indigo-900 dark:text-indigo-100">Tiempo Consumido:</span>
                <span className="font-mono text-indigo-700 dark:text-indigo-300">
                  {formatTime(occurrence.timeConsumed)}
                </span>
              </div>
            )}
          </div>

          {/* Events for this occurrence */}
          {events.length > 0 && (
            <div className="mt-3 pt-3 border-t border-indigo-200 dark:border-indigo-800">
              <h5 className="text-xs font-semibold text-indigo-900 dark:text-indigo-100 mb-2 uppercase tracking-wide">
                Eventos de esta Ocurrencia ({events.length})
              </h5>
              
              <div className="space-y-2">
                {events.map((event, eventIndex) => (
                  <div
                    key={event.id}
                    className={`p-2.5 rounded border ${
                      event.isCompleted
                        ? "bg-green-50 dark:bg-green-950/30 border-green-300 dark:border-green-800/50"
                        : "bg-amber-50 dark:bg-amber-950/30 border-amber-300 dark:border-amber-800/50"
                    }`}
                  >
                    <div className="flex items-start justify-between mb-1.5">
                      <div className={`font-medium text-sm ${
                        event.isCompleted 
                          ? "text-green-900 dark:text-green-100" 
                          : "text-amber-900 dark:text-amber-100"
                      }`}>
                        {event.context || `Evento ${eventIndex + 1}`}
                      </div>
                      <div className={`text-xs px-1.5 py-0.5 rounded font-medium ${
                        event.isCompleted
                          ? "bg-green-200 dark:bg-green-800 text-green-900 dark:text-green-100"
                          : "bg-amber-200 dark:bg-amber-800 text-amber-900 dark:text-amber-100"
                      }`}>
                        {event.isCompleted ? "✓" : "○"}
                      </div>
                    </div>

                    <div className={`grid gap-1 text-xs ${
                      event.isCompleted 
                        ? "text-green-700 dark:text-green-300" 
                        : "text-amber-700 dark:text-amber-300"
                    }`}>
                      <div className="flex items-center gap-1.5">
                        <Calendar className="h-3 w-3" />
                        {new Date(event.start).toLocaleTimeString("es-ES", { hour: "2-digit", minute: "2-digit" })} - {new Date(event.finish).toLocaleTimeString("es-ES", { hour: "2-digit", minute: "2-digit" })}
                      </div>
                      
                      {event.dedicatedTime > 0 && (
                        <div className="flex items-center gap-1.5">
                          <Clock className="h-3 w-3" />
                          {formatTime(event.dedicatedTime)}
                        </div>
                      )}
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
