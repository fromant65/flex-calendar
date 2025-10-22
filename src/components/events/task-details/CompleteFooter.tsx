"use client"

import { DialogFooter } from "~/components/ui/dialog"
import { Clock } from "lucide-react"
import { Button } from "~/components/ui/button"
import { LoadingSpinner } from "~/components/ui/loading-spinner"
import { AlertDialog, AlertDialogTrigger, AlertDialogContent, AlertDialogHeader, AlertDialogTitle, AlertDialogDescription, AlertDialogFooter, AlertDialogAction, AlertDialogCancel } from "~/components/ui/alert-dialog"
import { Checkbox } from "~/components/ui/checkbox"

export function CompleteFooter({ event, eventHasStarted, completeEventMutation, completeEventHandler, skipEventMutation, skipEventHandler, completeOccurrence, setCompleteOccurrence, skipOccurrence, setSkipOccurrence }: any) {
  if (!event || event.isCompleted) return null

  return (
    <DialogFooter className="border-t border-border pt-4">
      <div className="w-full space-y-3">
        {!eventHasStarted && (
          <div className="rounded-lg border border-orange-500/20 bg-orange-500/10 p-3">
            <div className="flex items-start gap-2.5">
              <Clock className="h-4 w-4 text-orange-600 dark:text-orange-400 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-sm font-semibold text-foreground">Evento aún no ha comenzado</p>
                <p className="text-xs text-muted-foreground mt-1">Solo puedes completar eventos que ya hayan iniciado.</p>
              </div>
            </div>
          </div>
        )}

        <div className="space-y-1.5">
          <label className="text-xs font-medium text-muted-foreground">Tiempo Dedicado (horas)</label>
          <input className="w-full bg-muted/20 border-border p-2 rounded" placeholder="ej: 2.5" />
          <p className="text-xs text-muted-foreground">Deja vacío para usar la duración programada</p>
        </div>

        <div className="flex gap-2">
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="outline" size="default" className="flex-1 hover:bg-accent" disabled={skipEventMutation.isPending}>
                {skipEventMutation.isPending ? (<><LoadingSpinner size="xs" /><span className="ml-2">Saltando...</span></>) : ("Saltar")}
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent className="border-border bg-card">
              <AlertDialogHeader>
                <AlertDialogTitle className="text-foreground">Saltar evento</AlertDialogTitle>
                <AlertDialogDescription className="text-muted-foreground">¿Estás seguro de que deseas saltar este evento programado?</AlertDialogDescription>
              </AlertDialogHeader>
              <div className="flex items-center space-x-2 px-6">
                <Checkbox id="skipOccurrence" checked={skipOccurrence} onCheckedChange={(checked) => setSkipOccurrence(checked === true)} />
                <label htmlFor="skipOccurrence" className="text-sm leading-none text-foreground">También saltar la ocurrencia asociada</label>
              </div>
              <AlertDialogFooter>
                <AlertDialogCancel className="hover:bg-accent">Cancelar</AlertDialogCancel>
                <AlertDialogAction onClick={skipEventHandler} className="bg-primary hover:bg-primary/90 text-primary-foreground">Saltar</AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>

          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="default" className="flex-1 bg-primary hover:bg-primary/90 text-primary-foreground" disabled={completeEventMutation.isPending || !eventHasStarted}>
                {completeEventMutation.isPending ? (<><LoadingSpinner size="xs" /><span className="ml-2">Completando...</span></>) : (
                  <>Completar</>
                )}
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent className="border-border bg-card">
              <AlertDialogHeader>
                <AlertDialogTitle className="text-foreground">Completar evento</AlertDialogTitle>
                <AlertDialogDescription className="text-muted-foreground">¿Estás seguro de que deseas marcar este evento como completado?</AlertDialogDescription>
              </AlertDialogHeader>
              <div className="flex items-center space-x-2 px-6">
                <Checkbox id="completeOccurrence" checked={completeOccurrence} onCheckedChange={(checked) => setCompleteOccurrence(checked === true)} />
                <label htmlFor="completeOccurrence" className="text-sm leading-none text-foreground">También completar la ocurrencia asociada</label>
              </div>
              <AlertDialogFooter>
                <AlertDialogCancel onClick={() => setCompleteOccurrence(false)} className="hover:bg-accent">Cancelar</AlertDialogCancel>
                <AlertDialogAction onClick={completeEventHandler} className="bg-primary hover:bg-primary/90 text-primary-foreground">Completar</AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </div>
    </DialogFooter>
  )
}

export default CompleteFooter
