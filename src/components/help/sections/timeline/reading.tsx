"use client"

import React from "react"
import { Card, CardHeader, CardTitle, CardContent } from "~/components/ui/card"
import { Badge } from "~/components/ui/badge"
import { Table2, Rows, Columns, Grid3x3 } from "lucide-react"

export function TimelineReadingContent() {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Table2 className="h-5 w-5" />
            Leer la Timeline (Filas y Columnas)
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="p-4 bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-950/20 dark:to-pink-950/20 border rounded-lg">
            <p className="text-sm text-muted-foreground">
              La Timeline es una <strong>matriz bidimensional</strong> donde puedes cruzar información 
              de tareas (filas) con períodos de tiempo (columnas) para entender tu productividad.
            </p>
          </div>

          <div>
            <h4 className="font-semibold mb-3 flex items-center gap-2">
              <Rows className="h-4 w-4" />
              Cómo Leer las Filas
            </h4>
            <div className="space-y-3">
              <div className="p-4 rounded-lg bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800">
                <h5 className="font-medium text-sm mb-2 text-blue-900 dark:text-blue-100">Columna de Nombre</h5>
                <p className="text-xs text-muted-foreground mb-2">
                  La primera columna (izquierda) muestra:
                </p>
                <ul className="text-xs text-muted-foreground space-y-1 ml-4">
                  <li>• <strong>Nombre de la tarea:</strong> Truncado si es muy largo (hover para ver completo)</li>
                  <li>• <strong>Importancia:</strong> Valor numérico del 1 al 10 (ej: "Imp: 8/10")</li>
                </ul>
              </div>

              <div className="p-4 rounded-lg bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-800">
                <h5 className="font-medium text-sm mb-2 text-green-900 dark:text-green-100">Celdas de Estado</h5>
                <p className="text-xs text-muted-foreground mb-2">
                  Las columnas restantes muestran el estado de esa tarea en cada período:
                </p>
                <ul className="text-xs text-muted-foreground space-y-1 ml-4">
                  <li>• Cada celda representa una intersección tarea-período</li>
                  <li>• El color y el icono indican el estado (completada, pendiente, saltada, etc.)</li>
                  <li>• Puedes hacer clic en cualquier celda para ver detalles</li>
                </ul>
              </div>

              <div className="p-4 rounded-lg bg-purple-50 dark:bg-purple-950/20 border border-purple-200 dark:border-purple-800">
                <h5 className="font-medium text-sm mb-2 text-purple-900 dark:text-purple-100">Lectura Horizontal</h5>
                <p className="text-xs text-muted-foreground">
                  Leyendo de izquierda a derecha en una fila, ves la <strong>evolución temporal de una sola tarea</strong>. 
                  Puedes identificar patrones como: rachas de completitud, días donde salteaste, períodos inactivos, etc.
                </p>
              </div>
            </div>
          </div>

          <div>
            <h4 className="font-semibold mb-3 flex items-center gap-2">
              <Columns className="h-4 w-4" />
              Cómo Leer las Columnas
            </h4>
            <div className="space-y-3">
              <div className="p-4 rounded-lg bg-yellow-50 dark:bg-yellow-950/20 border border-yellow-200 dark:border-yellow-800">
                <h5 className="font-medium text-sm mb-2 text-yellow-900 dark:text-yellow-100">Encabezado de Fecha</h5>
                <p className="text-xs text-muted-foreground mb-2">
                  La primera fila (superior) muestra la fecha o período de cada columna:
                </p>
                <ul className="text-xs text-muted-foreground space-y-1 ml-4">
                  <li>• <strong>Vista de día:</strong> "Lun 16 Nov" o "16/11/2025"</li>
                  <li>• <strong>Vista de semana:</strong> "Semana 46" o rango "16-22 Nov"</li>
                  <li>• <strong>Vista de mes:</strong> "Noviembre 2025"</li>
                  <li>• El día/semana actual se resalta visualmente</li>
                </ul>
              </div>

              <div className="p-4 rounded-lg bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800">
                <h5 className="font-medium text-sm mb-2 text-red-900 dark:text-red-100">Lectura Vertical</h5>
                <p className="text-xs text-muted-foreground">
                  Leyendo de arriba a abajo en una columna, ves <strong>todas las tareas en un período específico</strong>. 
                  Puedes identificar: días muy productivos (muchas celdas verdes), días con muchas tareas saltadas, 
                  qué tareas completaste en una fecha específica, etc.
                </p>
              </div>
            </div>
          </div>

          <div>
            <h4 className="font-semibold mb-3 flex items-center gap-2">
              <Grid3x3 className="h-4 w-4" />
              Interpretando la Matriz Completa
            </h4>
            <div className="space-y-3">
              <div className="p-3 rounded-lg bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-800">
                <Badge className="mb-2 bg-green-600 dark:bg-green-700">Patrón: Racha Verde</Badge>
                <p className="text-xs text-muted-foreground">
                  Una fila con celdas verdes consecutivas indica que completaste esa tarea durante varios días seguidos. 
                  Excelente para hábitos.
                </p>
              </div>

              <div className="p-3 rounded-lg bg-gray-50 dark:bg-gray-950/20 border border-gray-200 dark:border-gray-700">
                <Badge className="mb-2 bg-gray-600 dark:bg-gray-700">Patrón: Muchas Celdas Grises</Badge>
                <p className="text-xs text-muted-foreground">
                  Una fila con muchas celdas con guion gris indica que salteaste frecuentemente esa tarea. 
                  Puede ser señal de replantear la tarea o su frecuencia.
                </p>
              </div>

              <div className="p-3 rounded-lg bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800">
                <Badge className="mb-2 bg-red-600 dark:bg-red-700">Patrón: Columna Roja</Badge>
                <p className="text-xs text-muted-foreground">
                  Una columna con muchas celdas rojas (X) indica un día/período donde no completaste muchas tareas. 
                  Útil para identificar días problemáticos.
                </p>
              </div>

              <div className="p-3 rounded-lg bg-yellow-50 dark:bg-yellow-950/20 border border-yellow-200 dark:border-yellow-800">
                <Badge className="mb-2 bg-yellow-600 dark:bg-yellow-700">Patrón: Columna Amarilla</Badge>
                <p className="text-xs text-muted-foreground">
                  Una columna futura con muchas celdas amarillas (círculos) muestra tareas pendientes. 
                  Te ayuda a planificar la carga de trabajo.
                </p>
              </div>
            </div>
          </div>

          <div>
            <h4 className="font-semibold mb-3">Ejemplo de Lectura</h4>
            <div className="p-4 rounded-lg bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-950/20 dark:to-purple-950/20 border">
              <p className="text-sm text-muted-foreground mb-3">
                Imagina que ves esta matriz:
              </p>
              <div className="bg-white dark:bg-gray-900 p-3 rounded border text-xs font-mono space-y-1">
                <div>Ejercicio    | ✓ ✓ ✓ − ✓ ✓ ○</div>
                <div>Leer         | ✓ ✓ − − − ✓ ○</div>
                <div>Programar    | ✓ ✓ ✓ ✓ ✓ ✓ ○</div>
              </div>
              <div className="mt-3 text-xs text-muted-foreground space-y-2">
                <p><strong>Lectura horizontal (fila "Ejercicio"):</strong> Completaste 5 de 6 días, saltaste 1 día. Buena consistencia.</p>
                <p><strong>Lectura horizontal (fila "Leer"):</strong> 3 días completados, 3 días saltados. Patrón irregular.</p>
                <p><strong>Lectura vertical (columna 4):</strong> Día donde saltaste "Ejercicio" y "Leer" pero completaste "Programar".</p>
                <p><strong>Última columna (○):</strong> Las 3 tareas están pendientes para hoy/mañana.</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
