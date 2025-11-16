"use client"

import React from "react"
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "~/components/ui/card"
import { HelpTip } from "~/components/ui/help-tip"
import { Badge } from "~/components/ui/badge"
import { Grid3x3, Calendar, Layers, Filter } from "lucide-react"

export function TimelineContent() {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Grid3x3 className="h-5 w-5" />
            Vista de Timeline del Gestor
          </CardTitle>
          <CardDescription>
            Visualización temporal de tus ocurrencias organizadas cronológicamente
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="p-4 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-950/20 dark:to-purple-950/20 border rounded-lg">
            <p className="text-sm text-muted-foreground">
              El timeline del gestor de tareas muestra tus ocurrencias en una cuadrícula organizada por fechas. 
              Es ideal para ver qué ocurrencias tienes en un período de tiempo determinado (día, semana o mes).
            </p>
          </div>

          <div>
            <h4 className="font-semibold mb-3 flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              Modos de vista
            </h4>
            <div className="space-y-3">
              <div className="p-3 rounded-lg bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800">
                <Badge className="mb-2 bg-blue-600 dark:bg-blue-700">Vista de Día</Badge>
                <p className="text-xs text-muted-foreground">
                  Muestra todas las ocurrencias de un día específico en una sola columna. 
                  Perfecta para enfocarse en el día actual o un día específico.
                </p>
              </div>

              <div className="p-3 rounded-lg bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-800">
                <Badge className="mb-2 bg-green-600 dark:bg-green-700">Vista de Semana</Badge>
                <p className="text-xs text-muted-foreground">
                  Despliega una cuadrícula de 7 días (Lun-Dom) con las ocurrencias de cada día. 
                  Ideal para planificación semanal y ver la distribución de trabajo.
                </p>
              </div>

              <div className="p-3 rounded-lg bg-purple-50 dark:bg-purple-950/20 border border-purple-200 dark:border-purple-800">
                <Badge className="mb-2 bg-purple-600 dark:bg-purple-700">Vista de Mes</Badge>
                <p className="text-xs text-muted-foreground">
                  Muestra todo el mes en una cuadrícula amplia con tarjetas compactas. 
                  Excelente para visión general de largo plazo.
                </p>
              </div>
            </div>
          </div>

          <div>
            <h4 className="font-semibold mb-3 flex items-center gap-2">
              <Layers className="h-4 w-4" />
              Opciones de agrupación
            </h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>• <strong>Sin agrupar:</strong> Cuadrícula organizada por fechas, cada día muestra sus ocurrencias en tarjetas individuales</li>
              <li>• <strong>Agrupar por tarea:</strong> Agrupa todas las ocurrencias de la misma tarea juntas, útil para seguimiento de tareas recurrentes</li>
              <li>• <strong>Agrupar por estado:</strong> Separa ocurrencias pendientes, completadas y saltadas en grupos distintos</li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold mb-3 flex items-center gap-2">
              <Filter className="h-4 w-4" />
              Filtros disponibles
            </h4>
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">Puedes filtrar las ocurrencias mostradas por:</p>
              <div className="grid grid-cols-2 gap-2">
                <Badge variant="outline" className="justify-center bg-amber-50 dark:bg-amber-950/30 border-amber-200 dark:border-amber-800">Pendiente</Badge>
                <Badge variant="outline" className="justify-center bg-blue-50 dark:bg-blue-950/30 border-blue-200 dark:border-blue-800">En Progreso</Badge>
                <Badge variant="outline" className="justify-center bg-emerald-50 dark:bg-emerald-950/30 border-emerald-200 dark:border-emerald-800">Completado</Badge>
                <Badge variant="outline" className="justify-center bg-slate-50 dark:bg-slate-950/30 border-slate-200 dark:border-slate-700">Saltado</Badge>
              </div>
            </div>
          </div>

          <div>
            <h4 className="font-semibold mb-3">Tarjetas de ocurrencia</h4>
            <p className="text-sm text-muted-foreground mb-3">
              Cada ocurrencia se muestra en una tarjeta que incluye:
            </p>
            <ul className="space-y-2 text-sm text-muted-foreground ml-4">
              <li>• <strong>Icono y color de estado:</strong> Indica visualmente si está pendiente, completada o saltada</li>
              <li>• <strong>Borde de color según tipo:</strong> Cada tipo de tarea tiene un color distintivo</li>
              <li>• <strong>Indicador de urgencia:</strong> Las ocurrencias vencidas se marcan en rojo</li>
              <li>• <strong>Fechas objetivo y límite:</strong> Muestra cuántos días faltan o pasaron</li>
              <li>• <strong>Acciones rápidas:</strong> Completar, saltar o editar desde el menú de la tarjeta</li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold mb-3">Navegación temporal</h4>
            <p className="text-sm text-muted-foreground">
              Usa las flechas en la parte superior para moverte al día/semana/mes anterior o siguiente. 
              El botón "Hoy" te lleva de vuelta a la fecha actual instantáneamente.
            </p>
          </div>

          <HelpTip title="Timeline vs Página Timeline">
            Esta vista es específica del <strong>Gestor de Tareas</strong> y muestra ocurrencias. 
            La <strong>Página Timeline</strong> muestra eventos (bloques agendados) con su horario exacto y tiene otras funcionalidades.
          </HelpTip>
        </CardContent>
      </Card>
    </div>
  )
}
