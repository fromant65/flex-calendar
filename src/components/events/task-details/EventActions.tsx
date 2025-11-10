"use client"

import { Button } from "~/components/ui/button"
import { LoadingSpinner } from "~/components/ui/loading-spinner"
import { AlertDialog, AlertDialogTrigger, AlertDialogContent, AlertDialogHeader, AlertDialogTitle, AlertDialogDescription, AlertDialogFooter, AlertDialogAction, AlertDialogCancel } from "~/components/ui/alert-dialog"
import { Trash2 } from "lucide-react"
import type { EventWithDetails } from "~/types"

interface EventActionsProps {
  event: EventWithDetails;
  deleteEventMutation: {
    isPending: boolean;
  };
  deleteEventHandler: () => void;
}

export function EventActions({ event, deleteEventMutation, deleteEventHandler }: EventActionsProps) {
  return (
    <div className="border-t border-border pt-4">
      <AlertDialog>
        <AlertDialogTrigger asChild>
          <Button variant="destructive" className="w-full hover:bg-destructive/90" size="sm" disabled={deleteEventMutation.isPending}>
            {deleteEventMutation.isPending ? (
              <>
                <LoadingSpinner size="xs" />
                <span className="ml-2">Eliminando...</span>
              </>
            ) : (
              <>
                <Trash2 className="h-3.5 w-3.5 mr-2" />
                Eliminar Evento
              </>
            )}
          </Button>
        </AlertDialogTrigger>
        <AlertDialogContent className="border-border bg-card">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-foreground">¿Eliminar evento?</AlertDialogTitle>
            <AlertDialogDescription className="text-muted-foreground">¿Estás seguro de que quieres eliminar este evento? Esta acción no se puede deshacer.
              {event.associatedOccurrenceId && " La ocurrencia asociada será recuperada y estará disponible para reprogramación."}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="hover:bg-accent">Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={deleteEventHandler} className="bg-destructive hover:bg-destructive/90 text-destructive-foreground">Eliminar</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}

export default EventActions
