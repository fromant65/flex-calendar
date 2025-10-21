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
  onSkipBacklog: () => void
  isLoading?: boolean
}

export function BacklogAlert({
  taskId,
  taskName,
  pendingCount,
  oldestPendingDate,
  onSkipBacklog,
  isLoading = false,
}: BacklogAlertProps) {
  const [showConfirmDialog, setShowConfirmDialog] = useState(false)
  const [isDismissed, setIsDismissed] = useState(false)

  if (isDismissed) return null

  const toSkipCount = pendingCount - 1 // Skip all except the last one
  const daysSinceOldest = Math.floor(
    (new Date().getTime() - new Date(oldestPendingDate).getTime()) / (1000 * 60 * 60 * 24)
  )

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
                Tienes {pendingCount} ocurrencias pendientes. La más antigua es de hace {daysSinceOldest} días.
              </p>
              <div className="flex flex-wrap gap-2">
                <Button
                  size="sm"
                  variant="default"
                  onClick={() => setShowConfirmDialog(true)}
                  disabled={isLoading}
                  className="text-xs h-8"
                >
                  {isLoading ? "Procesando..." : "Saltear Backlog"}
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
            <DialogTitle>Confirmar Salteo de Backlog</DialogTitle>
            <DialogDescription className="space-y-2 pt-2">
              <p>
                Estás a punto de saltear <strong>{toSkipCount}</strong> ocurrencia{toSkipCount !== 1 ? "s" : ""} de la tarea <strong>"{taskName}"</strong>.
              </p>
              <p>
                Se mantendrá activa solo la ocurrencia más reciente para que puedas ponerte al día sin el peso del backlog acumulado.
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
              {isLoading ? "Salteando..." : "Confirmar Salteo"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
