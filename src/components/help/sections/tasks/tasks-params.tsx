"use client"

import React from "react"
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "~/components/ui/card"
import { HelpTip } from "~/components/ui/help-tip"
import { Badge } from "~/components/ui/badge"
import { Target, Flag, Calendar, Clock, Repeat } from "lucide-react"

export function TasksParams() {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5" />
            Parámetros de las Tareas
          </CardTitle>
          <CardDescription>
            Entender los campos y propiedades que definen una tarea
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <p className="text-sm text-muted-foreground">
            Cada tarea en Flex Calendar tiene varios parámetros que determinan cómo se comporta y cuándo genera ocurrencias.
          </p>

          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <Target className="h-5 w-5 text-primary shrink-0 mt-0.5" />
              <div className="flex-1">
                <h4 className="font-semibold text-sm mb-1">Nombre y Descripción</h4>
                <p className="text-sm text-muted-foreground">
                  Identifica tu tarea. El nombre es corto y visible en todas partes. La descripción añade detalles opcionales.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <Flag className="h-5 w-5 text-orange-500 shrink-0 mt-0.5" />
              <div className="flex-1">
                <h4 className="font-semibold text-sm mb-1">Importancia (1-10)</h4>
                <p className="text-sm text-muted-foreground mb-2">
                  Qué tan relevante es esta tarea. Afecta la priorización en la Matriz de Eisenhower y el orden en listas.
                </p>
                <div className="flex gap-2 flex-wrap">
                  <Badge variant="outline" className="bg-red-50 dark:bg-red-950/30">9-10: Crítico</Badge>
                  <Badge variant="outline" className="bg-yellow-50 dark:bg-yellow-950/30">5-8: Importante</Badge>
                  <Badge variant="outline" className="bg-blue-50 dark:bg-blue-950/30">1-4: Normal</Badge>
                </div>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <Calendar className="h-5 w-5 text-blue-500 shrink-0 mt-0.5" />
              <div className="flex-1">
                <h4 className="font-semibold text-sm mb-1">Tipo de Tarea</h4>
                <p className="text-sm text-muted-foreground mb-2">
                  Define el patrón de recurrencia:
                </p>
                <ul className="space-y-1 text-sm text-muted-foreground ml-4">
                  <li>• <strong>Única:</strong> Solo una vez</li>
                  <li>• <strong>Recurrente finita:</strong>Se genera N veces</li>
                  <li>• <strong>Hábito:</strong> Recurrencia indefinida definida por periodo</li>
                  <li>• <strong>Hábito+:</strong> Patrón específico de días por periodo</li>
                  <li>• <strong>Única fija:</strong>Tarea única con fecha y horarios fijos</li>
                  <li>• <strong>Fija repetitiva+:</strong>Tarea repetitiva en dias y horarios fijos</li>
                </ul>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <Repeat className="h-5 w-5 text-purple-500 shrink-0 mt-0.5" />
              <div className="flex-1">
                <h4 className="font-semibold text-sm mb-1">Recurrencia (para Hábito+)</h4>
                <p className="text-sm text-muted-foreground mb-2">
                  Define el patrón de repetición:
                </p>
                <ul className="space-y-1 text-sm text-muted-foreground ml-4">
                  <li>• <strong>Periodo simple:</strong> Cada N días (ej: cada 3 días)</li>
                  <li>• <strong>Días de semana:</strong> Días específicos (ej: Lun, Mie, Vie)</li>
                  <li>• <strong>Días del mes:</strong> Fechas específicas (ej: días 1, 15, 30)</li>
                </ul>
              </div>
            </div>
          </div>

          <div className="p-4 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-950/20 dark:to-purple-950/20 rounded-lg border">
            <h4 className="font-semibold mb-2">💡 Tip: Combina parámetros inteligentemente</h4>
            <p className="text-sm">
              Una tarea "Ir al gimnasio" puede ser Hábito+ (Lun-Mie-Vie), con importancia 8,
              y horario fijo 18:00-19:30. Así cada ocurrencia ya sabe cuándo debe programarse.
            </p>
          </div>

          <HelpTip title="Estado activo/inactivo">
            Las tareas también tienen un estado activo/inactivo. Solo las activas generan nuevas ocurrencias.
            Desactivar una tarea pausa su generación sin perder historial.
          </HelpTip>
        </CardContent>
      </Card>
    </div>
  )
}
