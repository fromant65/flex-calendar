"use client"

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
import type { OccurrenceWithTask } from "~/types"

interface TaskConfirmationDialogsProps {
  // Complete dialog
  confirmCompleteOpen: boolean
  onConfirmCompleteChange: (open: boolean) => void
  occurrenceToComplete: OccurrenceWithTask | null
  onConfirmComplete: () => void
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
  return (
    <>
      {/* Confirm Complete Task Dialog */}
      <AlertDialog open={confirmCompleteOpen} onOpenChange={onConfirmCompleteChange}>
        <AlertDialogContent>
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
          <AlertDialogFooter>
            <AlertDialogCancel className="cursor-pointer">Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={onConfirmComplete}
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
