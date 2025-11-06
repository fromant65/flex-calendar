"use client"

import { AlertTriangle, X } from "lucide-react"
import { Button } from "~/components/ui/button"
import { Card, CardContent } from "~/components/ui/card"
import { useState } from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "~/components/ui/dialog"

interface BacklogAlertProps {
  taskId: number
  taskName: string
  pendingCount: number
  oldestPendingDate: Date
  overdueCount?: number
  estimatedMissingCount?: number
  onSkipBacklog: () => void
  isLoading?: boolean
}

export function BacklogAlert({
  taskId,
  taskName,
  pendingCount,
  oldestPendingDate,
  overdueCount = 0,
  estimatedMissingCount = 0,
  onSkipBacklog,
  isLoading = false,
}: BacklogAlertProps) {
  const [showConfirmDialog, setShowConfirmDialog] = useState(false)
  const [isDismissed, setIsDismissed] = useState(false)

  if (isDismissed) return null

  const daysSinceOldest = Math.floor(
    (new Date().getTime() - new Date(oldestPendingDate).getTime()) / (1000 * 60 * 60 * 24)
  )

  // Build descriptive message
  const buildMessage = () => {
    const parts = [];
    const totalToProcess = overdueCount + estimatedMissingCount;
    
    if (totalToProcess > 0) {
      parts.push(`${totalToProcess} ocurrencia${totalToProcess !== 1 ? 's' : ''} atrasada${totalToProcess !== 1 ? 's' : ''}`);
      
      // Add breakdown if we have both types
      if (overdueCount > 0 && estimatedMissingCount > 0) {
        parts.push(`(${overdueCount} vencida${overdueCount !== 1 ? 's' : ''}, ${estimatedMissingCount} por generar)`);
      } else if (estimatedMissingCount > 0) {
        parts.push(`(por generar)`);
      }
    }
    
    if (parts.length === 0) {
      return `Tienes ocurrencias atrasadas. La más antigua es de hace ${daysSinceOldest} días.`;
    }
    
    return `Tienes ${parts.join(' ')}. Se procesarán automáticamente.`;
  };

  const handleConfirmSkip = () => {
    onSkipBacklog()
    setShowConfirmDialog(false)
  }

  return (
    <>
      <Card className="border-l-4 border-l-orange-500 bg-orange-50/50 dark:bg-orange-950/20">
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <AlertTriangle className="h-5 w-5 text-orange-500 mt-0.5 flex-shrink-0" />
            <div className="flex-1 min-w-0">
              <h4 className="font-semibold text-sm text-foreground mb-1">
                Backlog detectado en "{taskName}"
              </h4>
              <p className="text-xs text-muted-foreground mb-3">
                {buildMessage()}
              </p>
              <div className="flex flex-wrap gap-2">
                <Button
                  size="sm"
                  variant="default"
                  onClick={() => setShowConfirmDialog(true)}
                  disabled={isLoading}
                  className="text-xs h-8"
                >
                  {isLoading ? "Procesando..." : "Procesar Backlog"}
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => setIsDismissed(true)}
                  className="text-xs h-8"
                >
                  Ignorar
                </Button>
              </div>
            </div>
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6 flex-shrink-0"
              onClick={() => setIsDismissed(true)}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </CardContent>
      </Card>

      <Dialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirmar Procesamiento de Backlog</DialogTitle>
            <DialogDescription className="space-y-2 pt-2">
              <p>
                Estás a punto de procesar el backlog de la tarea <strong>"{taskName}"</strong>.
              </p>
              {estimatedMissingCount > 0 && (
                <p>
                  Se generarán <strong>{estimatedMissingCount}</strong> ocurrencia{estimatedMissingCount !== 1 ? 's' : ''} faltante{estimatedMissingCount !== 1 ? 's' : ''}.
                </p>
              )}
              {overdueCount > 0 && (
                <p>
                  Se saltarán <strong>{overdueCount}</strong> ocurrencia{overdueCount !== 1 ? 's' : ''} vencida{overdueCount !== 1 ? 's' : ''}.
                </p>
              )}
              {estimatedMissingCount > 0 && (
                <p>
                  Las ocurrencias generadas que estén vencidas también serán saltadas automáticamente.
                </p>
              )}
              <p>
                Solo se mantendrán activas las ocurrencias más recientes que aún estén dentro de su período válido.
              </p>
              <p className="text-xs text-muted-foreground mt-2">
                Esta acción no se puede deshacer.
              </p>
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowConfirmDialog(false)}
              disabled={isLoading}
            >
              Cancelar
            </Button>
            <Button
              variant="default"
              onClick={handleConfirmSkip}
              disabled={isLoading}
            >
              {isLoading ? "Procesando..." : "Procesar Backlog"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
