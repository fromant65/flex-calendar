"use client"

import type { OccurrenceWithTask } from "~/types"
import { Button } from "../ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../ui/dialog"
import { Clock, Flag } from "lucide-react"

interface ConfirmScheduleDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  occurrence: OccurrenceWithTask | null
  onConfirm: () => void
  onCancel: () => void
}

export function ConfirmScheduleDialog({
  open,
  onOpenChange,
  occurrence,
  onConfirm,
  onCancel,
}: ConfirmScheduleDialogProps) {
  const task = occurrence?.task

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>¿Agendar esta tarea?</DialogTitle>
          <DialogDescription>
            ¿Deseas programar esta tarea en el calendario?
          </DialogDescription>
        </DialogHeader>

        {task && (
          <div className="space-y-4 py-4">
            <div>
              <h4 className="font-medium text-foreground mb-1">{task.name}</h4>
              {task.description && (
                <p className="text-sm text-muted-foreground">{task.description}</p>
              )}
            </div>

            <div className="flex items-center gap-4 text-sm">
              {occurrence.targetTimeConsumption && (
                <div className="flex items-center gap-1.5 text-muted-foreground">
                  <Clock className="w-4 h-4" />
                  <span>
                    {occurrence.targetTimeConsumption}{" "}
                    {occurrence.targetTimeConsumption === 1 ? "hora" : "horas"}
                  </span>
                </div>
              )}
              <div className="flex items-center gap-1.5 text-muted-foreground">
                <Flag className="w-4 h-4" />
                <span>Importancia: {task.importance}</span>
              </div>
            </div>
          </div>
        )}

        <DialogFooter className="flex-col sm:flex-row gap-2">
          <Button variant="outline" onClick={onCancel} className="w-full sm:w-auto">
            Cancelar
          </Button>
          <Button onClick={onConfirm} className="w-full sm:w-auto">
            Sí, agendar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
