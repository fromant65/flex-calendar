"use client"

import React from "react"
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "~/components/ui/card"
import { HelpTip } from "~/components/ui/help-tip"
import { Badge } from "~/components/ui/badge"
import { CheckSquare } from "lucide-react"

export function OccurrencesContent() {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CheckSquare className="h-5 w-5" />
            Concepto de Ocurrencia
          </CardTitle>
          <CardDescription>
            La diferencia entre tarea, ocurrencia y evento
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <p className="text-sm text-muted-foreground">
            El Gestor de Tareas trabaja con <strong>ocurrencias</strong>, que son instancias específicas de tus tareas.
          </p>

          <div className="space-y-4">
            <h4 className="font-semibold mb-3">Los tres conceptos clave</h4>
            
            <div className="space-y-3">
              <div className="flex items-start gap-3 p-3 rounded-lg bg-purple-50 dark:bg-purple-950/20 border border-purple-200 dark:border-purple-800">
                <div className="flex items-center justify-center w-8 h-8 rounded-full bg-purple-500/10 dark:bg-purple-500/20 text-purple-600 dark:text-purple-400 font-bold text-sm shrink-0">
                  1
                </div>
                <div>
                  <div className="font-medium text-sm">Tarea</div>
                  <div className="text-xs text-muted-foreground">
                    La plantilla o definición general (ej: "Estudiar francés", importancia: 8, recurrencia: diaria)
                  </div>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3 rounded-lg bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800">
                <div className="flex items-center justify-center w-8 h-8 rounded-full bg-blue-500/10 dark:bg-blue-500/20 text-blue-600 dark:text-blue-400 font-bold text-sm shrink-0">
                  2
                </div>
                <div>
                  <div className="font-medium text-sm">Ocurrencia</div>
                  <div className="text-xs text-muted-foreground">
                    Una instancia para una fecha concreta (ej: "Estudiar francés" del 16 de noviembre). Tiene estado: Pending, Completed, Skipped
                  </div>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3 rounded-lg bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-800">
                <div className="flex items-center justify-center w-8 h-8 rounded-full bg-green-500/10 dark:bg-green-500/20 text-green-600 dark:text-green-400 font-bold text-sm shrink-0">
                  3
                </div>
                <div>
                  <div className="font-medium text-sm">Evento</div>
                  <div className="text-xs text-muted-foreground">
                    Un bloque de tiempo programado (ej: "Estudiar francés" de 18:00 a 19:30 el 16 de noviembre)
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div>
            <h4 className="font-semibold mb-3">Estados de una ocurrencia</h4>
            <div className="space-y-2">
              <div className="flex items-start gap-3 p-3 rounded-lg bg-muted/20 border">
                <Badge className="bg-yellow-500 shrink-0">Pending</Badge>
                <div>
                  <div className="font-medium text-sm">Pendiente</div>
                  <div className="text-xs text-muted-foreground">Aún no completada, puede tener o no un evento asociado</div>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3 rounded-lg bg-muted/20 border">
                <Badge className="bg-green-500 shrink-0">Completed</Badge>
                <div>
                  <div className="font-medium text-sm">Completada</div>
                  <div className="text-xs text-muted-foreground">Marcada como terminada, cuenta positivamente en estadísticas</div>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3 rounded-lg bg-muted/20 border">
                <Badge className="bg-gray-500 shrink-0">Skipped</Badge>
                <div>
                  <div className="font-medium text-sm">Skipped (Saltada)</div>
                  <div className="text-xs text-muted-foreground">Omitida intencionalmente, no cuenta como fallo</div>
                </div>
              </div>
            </div>
          </div>

          <HelpTip title="Backlog de ocurrencias" side="bottom">
            Si acumulas muchas ocurrencias pendientes, aparecerá una alerta de backlog sugiriendo saltar las más antiguas o ajustar la recurrencia de la tarea.
          </HelpTip>
        </CardContent>
      </Card>
    </div>
  )
}
