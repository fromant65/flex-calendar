"use client"

import { useState, useEffect } from "react"
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogCancel,
  AlertDialogAction,
} from "~/components/ui/alert-dialog"
import { Input } from "~/components/ui/input"
import { Label } from "~/components/ui/label"
import type { OccurrenceWithTask } from "~/types"

interface TaskConfirmationDialogsProps {
  // Complete dialog
  confirmCompleteOpen: boolean
  onConfirmCompleteChange: (open: boolean) => void
  occurrenceToComplete: OccurrenceWithTask | null
  onConfirmComplete: (completedAt?: Date) => void
  isCompleting: boolean
  
  // Skip dialog
  confirmSkipOpen: boolean
  onConfirmSkipChange: (open: boolean) => void
  occurrenceToSkip: OccurrenceWithTask | null
  onConfirmSkip: () => void
  isSkipping: boolean
}

export function TaskConfirmationDialogs({
  confirmCompleteOpen,
  onConfirmCompleteChange,
  occurrenceToComplete,
  onConfirmComplete,
  isCompleting,
  confirmSkipOpen,
  onConfirmSkipChange,
  occurrenceToSkip,
  onConfirmSkip,
  isSkipping,
}: TaskConfirmationDialogsProps) {
  const [completionDate, setCompletionDate] = useState<string>("")
  const [completionTime, setCompletionTime] = useState<string>("")

  // Initialize with current date/time when dialog opens
  useEffect(() => {
    if (confirmCompleteOpen) {
      const now = new Date()
      setCompletionDate(now.toISOString().split('T')[0] ?? "")
      setCompletionTime(`${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}`)
    }
  }, [confirmCompleteOpen])

  const handleComplete = () => {
    if (!completionDate || !completionTime) {
      // Use current date/time if not provided
      onConfirmComplete()
      return
    }

    // Parse date and time to create Date object
    const [year, month, day] = completionDate.split('-').map(Number)
    const [hours, minutes] = completionTime.split(':').map(Number)
    const completedAt = new Date(year!, month! - 1, day, hours, minutes)

    onConfirmComplete(completedAt)
  }

  return (
    <>
      {/* Confirm Complete Task Dialog */}
      <AlertDialog open={confirmCompleteOpen} onOpenChange={onConfirmCompleteChange}>
        <AlertDialogContent className="sm:max-w-md">
          <AlertDialogHeader>
            <AlertDialogTitle>¿Completar tarea?</AlertDialogTitle>
            <AlertDialogDescription>
              ¿Estás seguro de que deseas marcar la tarea{" "}
              <span className="font-semibold text-foreground">
                {occurrenceToComplete?.task?.name}
              </span>
              {" "}como completada? Esta acción no se puede deshacer.
            </AlertDialogDescription>
          </AlertDialogHeader>
          
          {/* Custom completion date/time */}
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="completion-date" className="text-sm font-medium">
                Fecha de finalización
              </Label>
              <Input
                id="completion-date"
                type="date"
                value={completionDate}
                onChange={(e) => setCompletionDate(e.target.value)}
                className="w-full"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="completion-time" className="text-sm font-medium">
                Hora de finalización
              </Label>
              <Input
                id="completion-time"
                type="time"
                value={completionTime}
                onChange={(e) => setCompletionTime(e.target.value)}
                className="w-full"
              />
            </div>
          </div>

          <AlertDialogFooter>
            <AlertDialogCancel className="cursor-pointer">Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleComplete}
              disabled={isCompleting}
              className="cursor-pointer bg-green-600 hover:bg-green-700 dark:bg-green-600 dark:hover:bg-green-700"
            >
              {isCompleting ? "Completando..." : "Completar"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Confirm Skip Task Dialog */}
      <AlertDialog open={confirmSkipOpen} onOpenChange={onConfirmSkipChange}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Saltar tarea?</AlertDialogTitle>
            <AlertDialogDescription>
              ¿Estás seguro de que deseas saltar la tarea{" "}
              <span className="font-semibold text-foreground">
                {occurrenceToSkip?.task?.name}
              </span>
              ? Esta acción marcará la tarea como saltada.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="cursor-pointer">Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={onConfirmSkip}
              disabled={isSkipping}
              className="cursor-pointer bg-gray-600 hover:bg-gray-700 dark:bg-gray-600 dark:hover:bg-gray-700"
            >
              {isSkipping ? "Saltando..." : "Saltar"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
