"use client"

import type { EventWithDetails, OccurrenceWithTask } from "~/types"
import { useState, useEffect } from "react"
import { Button } from "../ui/button"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "../ui/dialog"
import { HelpTip } from "~/components/ui/help-tip"
import { Input } from "../ui/input"
import { Label } from "../ui/label"
import { Alert, AlertDescription } from "../ui/alert"
import { AlertCircle } from "lucide-react"
import { ensureLocalDate } from "~/lib/calendar-utils"

interface ScheduleDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  occurrence: OccurrenceWithTask | null
  event?: EventWithDetails | null
  selectedDate: Date | null
  selectedHour?: number
  onSchedule: (start: Date, finish: Date, context?: string) => void
}

export function ScheduleDialog({
  open,
  onOpenChange,
  occurrence,
  event,
  selectedDate,
  selectedHour,
  onSchedule,
}: ScheduleDialogProps) {
  const [startTime, setStartTime] = useState("")
  const [endTime, setEndTime] = useState("")
  const [context, setContext] = useState<string>("")
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    // Reset error when dialog opens or closes
    if (!open) {
      setError(null);
    }
    
    if (event) {
      // Editing existing event
      const start = ensureLocalDate(event.start)
      const end = ensureLocalDate(event.finish)
      setStartTime(`${String(start.getHours()).padStart(2, "0")}:${String(start.getMinutes()).padStart(2, "0")}`)
      setEndTime(`${String(end.getHours()).padStart(2, "0")}:${String(end.getMinutes()).padStart(2, "0")}`)
      setContext(event.context ?? "")
    } else if (selectedHour !== undefined) {
      // New event with suggested hour
      setStartTime(`${String(selectedHour).padStart(2, "0")}:00`)
      // targetTimeConsumption is in HOURS, convert to minutes
      const suggestedDurationMinutes = (occurrence?.targetTimeConsumption || 1) * 60
      const endHour = Math.floor((selectedHour * 60 + suggestedDurationMinutes) / 60)
      const endMinute = (selectedHour * 60 + suggestedDurationMinutes) % 60
      setEndTime(`${String(endHour).padStart(2, "0")}:${String(endMinute).padStart(2, "0")}`)
      setContext("")
    } else {
      // Default times
      setStartTime("09:00")
      // targetTimeConsumption is in HOURS, convert to minutes
      const suggestedDurationMinutes = (occurrence?.targetTimeConsumption || 1) * 60
      const endHour = Math.floor((9 * 60 + suggestedDurationMinutes) / 60)
      const endMinute = (9 * 60 + suggestedDurationMinutes) % 60
      setEndTime(`${String(endHour).padStart(2, "0")}:${String(endMinute).padStart(2, "0")}`)
      setContext("")
    }
  }, [event, selectedHour, occurrence, open])
  
  // Clear error when times change
  useEffect(() => {
    if (error) {
      setError(null);
    }
  }, [startTime, endTime])

  const handleSchedule = () => {
    if (!selectedDate || !startTime || !endTime) return

    const [startHour, startMinute] = startTime.split(":").map(Number)
    const [endHour, endMinute] = endTime.split(":").map(Number)

    // Ensure we're working with a proper local date
    // Create a new date in local timezone, not UTC
    const localSelectedDate = ensureLocalDate(selectedDate)
    
    const start = new Date(
      localSelectedDate.getFullYear(),
      localSelectedDate.getMonth(),
      localSelectedDate.getDate(),
      startHour!,
      startMinute!,
      0,
      0
    )

    const finish = new Date(
      localSelectedDate.getFullYear(),
      localSelectedDate.getMonth(),
      localSelectedDate.getDate(),
      endHour!,
      endMinute!,
      0,
      0
    )
    
    // Validate that end time is after start time
    if (finish <= start) {
      setError("La hora de finalización debe ser posterior a la hora de inicio")
      return
    }

    onSchedule(start, finish, context?.trim() ? context.trim() : undefined)
    onOpenChange(false)
  }

  const task = occurrence?.task || event?.occurrence?.task

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
    <DialogContent showCloseButton={false} className="sm:max-w-md">
        <DialogHeader>
          <div className="w-full flex items-start justify-between gap-4">
            <div className="min-w-0">
              <DialogTitle className="truncate">{event ? "Reprogramar Evento" : "Programar Tarea"}</DialogTitle>
              <DialogDescription className="!mt-1">
                {event ? "Actualiza el horario de este evento" : "Establece el rango de tiempo para esta tarea"}
              </DialogDescription>
            </div>

            <div className="shrink-0">
              <HelpTip title="Sobre este formulario" side="bottom">
                <p className="mb-1">Aquí defines la hora de inicio y fin del evento. Si editas un evento fijo, algunos campos pueden estar bloqueados.</p>
                <p className="text-xs text-muted-foreground">La duración calculada se mostrará automáticamente. Asegúrate de que la hora de fin sea posterior a la de inicio.</p>
              </HelpTip>
            </div>
          </div>
        </DialogHeader>

        {task && (
          <div className="space-y-4">
            <div>
              <h4 className="font-medium text-foreground mb-1">{task.name}</h4>
              {task.description && <p className="text-sm text-muted-foreground">{task.description}</p>}
            </div>

            <div className="mt-4">
              <Label htmlFor="event-context" className="pb-2">Contexto (opcional)</Label>
              <Input
                id="event-context"
                type="text"
                value={context}
                onChange={(e) => setContext(e.target.value)}
                placeholder="Detalles adicionales, enlace o nota..."
                className="bg-background [color-scheme:light] dark:[color-scheme:dark]"
              />
            </div>

            {selectedDate && (
              <div className="text-sm text-muted-foreground mb-4">
                <p className="font-medium text-foreground">
                  {selectedDate.toLocaleDateString("es-ES", {
                    weekday: "long",
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </p>
              </div>
            )}

            {error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="start-time">Hora de Inicio</Label>
                <Input
                  id="start-time"
                  type="time"
                  value={startTime}
                  onChange={(e) => setStartTime(e.target.value)}
                  className="bg-background [color-scheme:light] dark:[color-scheme:dark]"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="end-time">Hora de Fin</Label>
                <Input
                  id="end-time"
                  type="time"
                  value={endTime}
                  onChange={(e) => setEndTime(e.target.value)}
                  className="bg-background [color-scheme:light] dark:[color-scheme:dark]"
                />
              </div>
            </div>

            {startTime &&
              endTime &&
              (() => {
                const [startHour, startMinute] = startTime.split(":").map(Number)
                const [endHour, endMinute] = endTime.split(":").map(Number)
                const durationMinutes = endHour! * 60 + endMinute! - (startHour! * 60 + startMinute!)

                if (durationMinutes > 0) {
                  return (
                    <div className="text-sm text-muted-foreground">
                      <p>
                        Duración: {Math.floor(durationMinutes / 60)}h {durationMinutes % 60}m
                      </p>
                    </div>
                  )
                }
                return null
              })()}
          </div>
        )}

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button onClick={handleSchedule}>{event ? "Actualizar" : "Programar"}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
