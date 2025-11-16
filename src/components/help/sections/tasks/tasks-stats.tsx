"use client"

import React from "react"
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "~/components/ui/card"
import { HelpTip } from "~/components/ui/help-tip"
import { BarChart3, TrendingUp } from "lucide-react"

export function TasksStats() {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Estadísticas de Tareas
          </CardTitle>
          <CardDescription>
            Cómo interpretar los datos y métricas de tus tareas
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <p className="text-sm text-muted-foreground">
            En la página de Tareas, verás estadísticas en tiempo real de todas tus tareas.
          </p>

          <div className="space-y-4">
            <div>
              <h4 className="font-semibold mb-2">📊 Estadísticas Generales</h4>
              <ul className="space-y-1 text-sm text-muted-foreground ml-4">
                <li>• <strong>Total de Tareas:</strong> Cantidad total de tareas creadas</li>
                <li>• <strong>Tareas Activas:</strong> Tareas que generan ocurrencias</li>
                <li>• <strong>Tareas Inactivas:</strong> Tareas desactivadas (solo historial)</li>
                <li>• <strong>Tareas Fijas:</strong> Tareas con horarios fijos predefinidos</li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold mb-2">📈 Distribución por Tipo</h4>
              <p className="text-sm text-muted-foreground mb-2">
                Cada tipo de tarea muestra:
              </p>
              <ul className="space-y-1 text-sm text-muted-foreground ml-4">
                <li>• <strong>Total:</strong> Cantidad de tareas de ese tipo</li>
                <li>• <strong>Activas:</strong> Cuántas están generando ocurrencias</li>
                <li>• <strong>Inactivas:</strong> Cuántas están desactivadas</li>
                <li>• <strong>Barra visual:</strong> Proporción activas/inactivas</li>
              </ul>
              <p className="text-sm text-muted-foreground mt-2">
                Los 6 tipos mostrados son: <strong>Única, Recurrente Finita, Hábito, Hábito+, Única Fija, Fija Repetitiva+</strong>
              </p>
            </div>

            <div>
              <h4 className="font-semibold mb-2">📊 Estado General</h4>
              <ul className="space-y-1 text-sm text-muted-foreground ml-4">
                <li>• <strong>Barra de progreso:</strong> Visual de proporción activas vs inactivas</li>
                <li>• <strong>Porcentajes:</strong> % de tareas activas e inactivas del total</li>
                <li>• <strong>Colores:</strong> Verde para activas, naranja para inactivas</li>
              </ul>
            </div>
          </div>

          <div className="p-4 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-950/20 dark:to-purple-950/20 rounded-lg border">
            <h4 className="font-semibold mb-2 flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              Interpreta las estadísticas
            </h4>
            <ul className="text-sm space-y-1">
              <li>✓ Identifica cuántas tareas tienes de cada tipo</li>
              <li>✓ Ve el balance entre tareas activas e inactivas</li>
              <li>✓ Detecta si tienes muchas tareas inactivas acumuladas</li>
              <li>✓ Compara tu distribución de tipos de tareas</li>
            </ul>
          </div>

          <HelpTip title="Estadísticas avanzadas">
            Para ver análisis más detallados sobre el cumplimiento de tus tareas, 
            visita la página de <strong>Estadísticas</strong> desde el menú principal, 
            donde encontrarás gráficos de tendencias y análisis de productividad.
          </HelpTip>
        </CardContent>
      </Card>
    </div>
  )
}
