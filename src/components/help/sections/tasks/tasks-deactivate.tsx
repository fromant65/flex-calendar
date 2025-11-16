"use client"

import React from "react"
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "~/components/ui/card"
import { HelpTip } from "~/components/ui/help-tip"
import { XCircle } from "lucide-react"

export function TasksDeactivate() {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <XCircle className="h-5 w-5" />
            Desactivar Tareas
          </CardTitle>
          <CardDescription>
            Qué sucede cuando desactivas una tarea y cuándo hacerlo
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <h4 className="font-semibold mb-3">¿Qué significa desactivar?</h4>
            <p className="text-sm text-muted-foreground mb-3">
              Desactivar una tarea es el <strong>equivalente a eliminarla</strong> en esta aplicación. Cuando desactivas una tarea:
            </p>
            <ul className="space-y-2 text-sm text-muted-foreground ml-4">
              <li>✅ <strong>Se mantiene el historial:</strong> Todas las ocurrencias y eventos pasados quedan guardados</li>
              <li>✅ <strong>Puedes consultarla:</strong> La tarea aparece en la sección "Tareas Inactivas" colapsada</li>
              <li>❌ <strong>No se puede reactivar:</strong> Una vez desactivada, no puedes volver a activarla</li>
              <li>❌ <strong>No genera nuevas ocurrencias:</strong> No se crearán más ocurrencias automáticamente</li>
              <li>❌ <strong>Ocurrencias pendientes se saltan:</strong> Las que estaban pendientes se marcan como saltadas</li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold mb-3">¿Cuándo desactivar una tarea?</h4>
            <div className="space-y-3">
              <div className="p-3 bg-muted/20 rounded-lg border">
                <p className="font-medium text-sm mb-1">✅ Objetivo completado</p>
                <p className="text-sm text-muted-foreground">
                  "Leer 12 capítulos de libro" (Recurrente finita). Ya completaste los 12, desactívala para limpiar tu lista.
                </p>
              </div>
              <div className="p-3 bg-muted/20 rounded-lg border">
                <p className="font-medium text-sm mb-1">🔄 Cambio de hábitos</p>
                <p className="text-sm text-muted-foreground">
                  Tenías "Ir al gimnasio" pero cambiaste a clases de natación. Desactiva la tarea vieja y crea una nueva.
                </p>
              </div>
              <div className="p-3 bg-muted/20 rounded-lg border">
                <p className="font-medium text-sm mb-1">🗑️ Ya no es relevante</p>
                <p className="text-sm text-muted-foreground">
                  Una tarea que ya no necesitas pero quieres conservar su historial de completado para estadísticas.
                </p>
              </div>
            </div>
          </div>

          <div className="p-4 bg-yellow-50 dark:bg-yellow-950/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
            <p className="text-sm font-semibold mb-2 text-yellow-800 dark:text-yellow-300">⚠️ Desactivar es permanente</p>
            <ul className="text-sm text-yellow-700 dark:text-yellow-200 space-y-1">
              <li>• <strong>No hay vuelta atrás:</strong> No puedes reactivar una tarea desactivada</li>
              <li>• <strong>Solo lectura:</strong> Puedes ver su historial pero no editarla ni usarla</li>
              <li>• <strong>Piénsalo bien:</strong> Si crees que volverás a necesitarla, mejor duplica y crea una variante</li>
              <li>• <strong>Conserva datos:</strong> Ideal si quieres mantener el historial para estadísticas</li>
            </ul>
          </div>

          <HelpTip title="Cómo desactivar">
            En la tarjeta de tarea, haz clic en el ícono de 🗑️ (papelera). 
            Confirma la acción y la tarea se moverá a la sección "Tareas Inactivas" que puedes expandir para consultar.
          </HelpTip>
        </CardContent>
      </Card>
    </div>
  )
}
