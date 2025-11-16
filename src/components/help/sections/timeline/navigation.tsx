"use client"

import React from "react"
import { Card, CardHeader, CardTitle, CardContent } from "~/components/ui/card"
import { Badge } from "~/components/ui/badge"
import { ChevronLeft, ChevronRight, Calendar, Settings } from "lucide-react"

export function TimelineNavigationContent() {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ChevronRight className="h-5 w-5" />
            Navegación en Timeline
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="p-4 bg-gradient-to-r from-blue-50 to-cyan-50 dark:from-blue-950/20 dark:to-cyan-950/20 border rounded-lg">
            <p className="text-sm text-muted-foreground">
              La Timeline ofrece controles de navegación para moverte a través del tiempo 
              y ajustar la vista según tus necesidades.
            </p>
          </div>

          <div>
            <h4 className="font-semibold mb-3 flex items-center gap-2">
              <ChevronLeft className="h-4 w-4" />
              Controles de Navegación
            </h4>
            <div className="space-y-3">
              <div className="p-3 rounded-lg bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800">
                <Badge className="mb-2 bg-blue-600 dark:bg-blue-700">Flecha Izquierda ←</Badge>
                <p className="text-xs text-muted-foreground">
                  Retrocede en el tiempo según el intervalo seleccionado. Si el intervalo es "día", 
                  retrocede 1 día. Si es "semana", retrocede 7 días, y así sucesivamente.
                </p>
              </div>

              <div className="p-3 rounded-lg bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-800">
                <Badge className="mb-2 bg-green-600 dark:bg-green-700">Flecha Derecha →</Badge>
                <p className="text-xs text-muted-foreground">
                  Avanza hacia el futuro según el intervalo seleccionado. Permite planificar 
                  y ver qué tareas tienes pendientes en los próximos días/semanas.
                </p>
              </div>

              <div className="p-3 rounded-lg bg-purple-50 dark:bg-purple-950/20 border border-purple-200 dark:border-purple-800">
                <Badge className="mb-2 bg-purple-600 dark:bg-purple-700">Botón "Hoy"</Badge>
                <p className="text-xs text-muted-foreground">
                  Salta instantáneamente a la fecha actual. Útil cuando navegaste lejos en el tiempo 
                  y quieres volver al presente rápidamente.
                </p>
              </div>
            </div>
          </div>

          <div>
            <h4 className="font-semibold mb-3 flex items-center gap-2">
              <Settings className="h-4 w-4" />
              Selector de Intervalo
            </h4>
            <p className="text-sm text-muted-foreground mb-3">
              Cambia la granularidad temporal de las columnas:
            </p>
            <div className="grid grid-cols-2 gap-3">
              <div className="p-3 rounded-lg bg-purple-50 dark:bg-purple-950/20 border border-purple-200 dark:border-purple-800">
                <Badge className="mb-2 bg-purple-600 dark:bg-purple-700">3 horas</Badge>
                <p className="text-xs text-muted-foreground">
                  Máxima granularidad. Cada columna = 3 horas. 
                  Ideal para seguimiento de hábitos diarios frecuentes.
                </p>
              </div>

              <div className="p-3 rounded-lg bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800">
                <Badge className="mb-2 bg-blue-600 dark:bg-blue-700">Día</Badge>
                <p className="text-xs text-muted-foreground">
                  Cada columna = 1 día completo. 
                  Configuración predeterminada. Balance entre detalle y contexto.
                </p>
              </div>

              <div className="p-3 rounded-lg bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-800">
                <Badge className="mb-2 bg-green-600 dark:bg-green-700">Semana</Badge>
                <p className="text-xs text-muted-foreground">
                  Cada columna = 1 semana completa (Lun-Dom). 
                  Bueno para visión de mediano plazo.
                </p>
              </div>

              <div className="p-3 rounded-lg bg-yellow-50 dark:bg-yellow-950/20 border border-yellow-200 dark:border-yellow-800">
                <Badge className="mb-2 bg-yellow-600 dark:bg-yellow-700">Mes</Badge>
                <p className="text-xs text-muted-foreground">
                  Cada columna = 1 mes completo. 
                  Vista panorámica de largo plazo.
                </p>
              </div>

              <div className="p-3 rounded-lg bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800">
                <Badge className="mb-2 bg-red-600 dark:bg-red-700">Año</Badge>
                <p className="text-xs text-muted-foreground">
                  Cada columna = 1 año completo. 
                  Para análisis histórico extenso.
                </p>
              </div>
            </div>
          </div>

          <div>
            <h4 className="font-semibold mb-3 flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              Configuración de Días a Mostrar
            </h4>
            <p className="text-sm text-muted-foreground mb-3">
              Controla cuántas columnas ver simultáneamente. Combina esto con el intervalo:
            </p>
            <ul className="space-y-2 text-sm text-muted-foreground ml-4">
              <li>• <strong>7 días:</strong> Muestra 7 columnas (predeterminado)</li>
              <li>• <strong>14 días:</strong> Muestra 14 columnas (2 semanas)</li>
              <li>• <strong>30 días:</strong> Muestra 30 columnas (~1 mes)</li>
              <li>• <strong>90 días:</strong> Muestra 90 columnas (~3 meses, solo desktop)</li>
            </ul>
            <div className="mt-3 p-3 rounded-lg bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800">
              <p className="text-xs text-muted-foreground">
                <strong>Ejemplo:</strong> Si seleccionas intervalo "semana" y "14 días", verás 2 columnas de semanas completas.
                Si seleccionas intervalo "día" y "7 días", verás 7 columnas de días individuales.
              </p>
            </div>
          </div>

          <div>
            <h4 className="font-semibold mb-3">Indicador de Período Actual</h4>
            <p className="text-sm text-muted-foreground">
              En la parte inferior de la timeline se muestra el período que estás visualizando actualmente, 
              por ejemplo: "7 días desde 16 de noviembre de 2025".
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
