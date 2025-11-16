"use client"

import React from "react"
import { Card, CardHeader, CardTitle, CardContent } from "~/components/ui/card"
import { Badge } from "~/components/ui/badge"
import { HelpTip } from "~/components/ui/help-tip"
import { Filter, Search, Grid3x3, ArrowUpDown } from "lucide-react"

export function TimelineFiltersContent() {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filtros y Ordenamiento
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="p-4 bg-gradient-to-r from-green-50 to-teal-50 dark:from-green-950/20 dark:to-teal-950/20 border rounded-lg">
            <p className="text-sm text-muted-foreground">
              La Timeline incluye un sistema de filtros potente para mostrar solo las tareas que te interesan, 
              junto con opciones de ordenamiento para organizar las filas según diferentes criterios.
            </p>
          </div>

          <div>
            <h4 className="font-semibold mb-3 flex items-center gap-2">
              <Search className="h-4 w-4" />
              Búsqueda por Texto
            </h4>
            <div className="p-4 rounded-lg bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800">
              <p className="text-sm text-muted-foreground mb-3">
                Escribe cualquier texto en el campo de búsqueda para filtrar tareas por:
              </p>
              <ul className="space-y-2 text-sm text-muted-foreground ml-4">
                <li>• <strong>Nombre de tarea:</strong> Busca "ejercicio" para ver solo tareas que contengan esa palabra</li>
                <li>• <strong>Descripción:</strong> También busca en las descripciones de las tareas</li>
                <li>• <strong>Búsqueda incremental:</strong> Los resultados se actualizan mientras escribes</li>
              </ul>
              <div className="mt-3 p-3 rounded bg-blue-100 dark:bg-blue-900/30">
                <p className="text-xs text-muted-foreground">
                  <strong>Tip:</strong> La búsqueda no distingue entre mayúsculas y minúsculas.
                </p>
              </div>
            </div>
          </div>

          <div>
            <h4 className="font-semibold mb-3">Filtro por Tipo de Tarea</h4>
            <p className="text-sm text-muted-foreground mb-3">
              Selecciona uno o varios tipos de tareas para mostrar:
            </p>
            <div className="grid grid-cols-2 gap-2">
              <Badge variant="outline" className="justify-center py-2 bg-blue-50 dark:bg-blue-950/30 border-blue-200 dark:border-blue-800">
                Única
              </Badge>
              <Badge variant="outline" className="justify-center py-2 bg-green-50 dark:bg-green-950/30 border-green-200 dark:border-green-800">
                Recurrente Finita
              </Badge>
              <Badge variant="outline" className="justify-center py-2 bg-purple-50 dark:bg-purple-950/30 border-purple-200 dark:border-purple-800">
                Hábito
              </Badge>
              <Badge variant="outline" className="justify-center py-2 bg-orange-50 dark:bg-orange-950/30 border-orange-200 dark:border-orange-800">
                Hábito+
              </Badge>
              <Badge variant="outline" className="justify-center py-2 bg-cyan-50 dark:bg-cyan-950/30 border-cyan-200 dark:border-cyan-800">
                Única Fija
              </Badge>
              <Badge variant="outline" className="justify-center py-2 bg-pink-50 dark:bg-pink-950/30 border-pink-200 dark:border-pink-800">
                Única Repetitiva+
              </Badge>
            </div>
            <p className="text-xs text-muted-foreground mt-3">
              Puedes seleccionar múltiples tipos simultáneamente. Solo se mostrarán tareas de los tipos seleccionados.
            </p>
          </div>

          <div>
            <h4 className="font-semibold mb-3 flex items-center gap-2">
              <Grid3x3 className="h-4 w-4" />
              Filtro por Prioridad (Eisenhower)
            </h4>
            <div className="space-y-2">
              <div className="p-3 rounded-lg bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800">
                <Badge className="mb-2 bg-red-600 dark:bg-red-700">Urgente + Importante</Badge>
                <p className="text-xs text-muted-foreground">
                  Muestra solo tareas de alta importancia que tienen ocurrencias urgentes (fecha límite cercana o pasada).
                </p>
              </div>

              <div className="p-3 rounded-lg bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800">
                <Badge className="mb-2 bg-blue-600 dark:bg-blue-700">No Urgente + Importante</Badge>
                <p className="text-xs text-muted-foreground">
                  Tareas importantes pero sin urgencia inmediata. Ideales para planificación de largo plazo.
                </p>
              </div>

              <div className="p-3 rounded-lg bg-orange-50 dark:bg-orange-950/20 border border-orange-200 dark:border-orange-800">
                <Badge className="mb-2 bg-orange-600 dark:bg-orange-700">Urgente + No Importante</Badge>
                <p className="text-xs text-muted-foreground">
                  Tareas urgentes pero de baja importancia. Candidatas para delegar o minimizar.
                </p>
              </div>

              <div className="p-3 rounded-lg bg-gray-50 dark:bg-gray-950/20 border border-gray-200 dark:border-gray-700">
                <Badge className="mb-2 bg-gray-600 dark:bg-gray-700">No Urgente + No Importante</Badge>
                <p className="text-xs text-muted-foreground">
                  Tareas de baja prioridad en todos los aspectos. Revisar si realmente necesitan hacerse.
                </p>
              </div>
            </div>
            <HelpTip title="Filtro múltiple">
              Puedes seleccionar varios cuadrantes simultáneamente para ver, por ejemplo, 
              todas las tareas importantes (urgentes + no urgentes).
            </HelpTip>
          </div>

          <div>
            <h4 className="font-semibold mb-3">Filtro por Estado de Ocurrencias</h4>
            <p className="text-sm text-muted-foreground mb-3">
              Filtra tareas según el estado de sus ocurrencias:
            </p>
            <div className="space-y-2">
              <div className="flex items-center gap-3 p-3 rounded-lg bg-yellow-50 dark:bg-yellow-950/20 border border-yellow-200 dark:border-yellow-800">
                <Badge className="bg-yellow-600 dark:bg-yellow-700">Con Pendientes</Badge>
                <p className="text-xs text-muted-foreground flex-1">
                  Muestra solo tareas que tienen al menos una ocurrencia pendiente
                </p>
              </div>

              <div className="flex items-center gap-3 p-3 rounded-lg bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-800">
                <Badge className="bg-green-600 dark:bg-green-700">Con Completadas</Badge>
                <p className="text-xs text-muted-foreground flex-1">
                  Tareas que tienen ocurrencias completadas en el rango visible
                </p>
              </div>

              <div className="flex items-center gap-3 p-3 rounded-lg bg-gray-50 dark:bg-gray-950/20 border border-gray-200 dark:border-gray-700">
                <Badge className="bg-gray-600 dark:bg-gray-700">Con Salteadas</Badge>
                <p className="text-xs text-muted-foreground flex-1">
                  Tareas con ocurrencias saltadas. Útil para identificar hábitos abandonados
                </p>
              </div>

              <div className="flex items-center gap-3 p-3 rounded-lg bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-800">
                <Badge className="bg-emerald-600 dark:bg-emerald-700">Todo Completado</Badge>
                <p className="text-xs text-muted-foreground flex-1">
                  Solo tareas donde todas las ocurrencias del período están completadas
                </p>
              </div>
            </div>
          </div>

          <div>
            <h4 className="font-semibold mb-3 flex items-center gap-2">
              <ArrowUpDown className="h-4 w-4" />
              Opciones de Ordenamiento
            </h4>
            <p className="text-sm text-muted-foreground mb-3">
              Ordena las filas de tareas según diferentes criterios:
            </p>
            <div className="space-y-2">
              <div className="p-3 rounded-lg bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800">
                <div className="font-medium text-sm mb-1">Nombre (A-Z / Z-A)</div>
                <p className="text-xs text-muted-foreground">
                  Orden alfabético ascendente o descendente por nombre de tarea.
                </p>
              </div>

              <div className="p-3 rounded-lg bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-800">
                <div className="font-medium text-sm mb-1">Por Tipo</div>
                <p className="text-xs text-muted-foreground">
                  Agrupa tareas del mismo tipo juntas. Útil para ver todos tus hábitos, todas tus tareas únicas, etc.
                </p>
              </div>

              <div className="p-3 rounded-lg bg-purple-50 dark:bg-purple-950/20 border border-purple-200 dark:border-purple-800">
                <div className="font-medium text-sm mb-1">Por Importancia</div>
                <p className="text-xs text-muted-foreground">
                  Ordena de mayor a menor importancia (10 a 1). Tareas más importantes aparecen primero.
                </p>
              </div>

              <div className="p-3 rounded-lg bg-yellow-50 dark:bg-yellow-950/20 border border-yellow-200 dark:border-yellow-800">
                <div className="font-medium text-sm mb-1">Por Fecha Objetivo</div>
                <p className="text-xs text-muted-foreground">
                  Ordena tareas según la fecha objetivo más cercana de sus ocurrencias. Ideal para priorizar qué hacer próximamente.
                </p>
              </div>

              <div className="p-3 rounded-lg bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800">
                <div className="font-medium text-sm mb-1">Por Fecha Límite</div>
                <p className="text-xs text-muted-foreground">
                  Ordena según la fecha límite más cercana. Útil para ver qué tareas tienen deadline inminente.
                </p>
              </div>
            </div>
          </div>

          <div>
            <h4 className="font-semibold mb-3">Contador de Resultados</h4>
            <div className="p-4 rounded-lg bg-gradient-to-r from-purple-50 to-blue-50 dark:from-purple-950/20 dark:to-blue-950/20 border">
              <p className="text-sm text-muted-foreground mb-2">
                En la parte superior se muestra un contador como:
              </p>
              <div className="text-center p-3 bg-white dark:bg-gray-900 rounded border font-semibold">
                <span className="text-primary">12</span> de <span>48</span> tareas
              </div>
              <ul className="text-xs text-muted-foreground space-y-1 mt-3 ml-4">
                <li>• <strong>Primer número (12):</strong> Tareas que pasan los filtros actuales</li>
                <li>• <strong>Segundo número (48):</strong> Total de tareas con actividad en el rango de fechas</li>
                <li>• Te ayuda a saber cuántas tareas estás filtrando</li>
              </ul>
            </div>
          </div>

          <div>
            <h4 className="font-semibold mb-3">Limpiar Filtros</h4>
            <p className="text-sm text-muted-foreground">
              Si aplicaste varios filtros y quieres volver a ver todas las tareas, 
              usa el botón "Limpiar filtros" o el ícono de X junto a los filtros activos.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
