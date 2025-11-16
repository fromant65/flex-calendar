"use client"

import React from "react"
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "~/components/ui/card"
import { Badge } from "~/components/ui/badge"
import { HelpTip } from "~/components/ui/help-tip"
import { TrendingUp, Table2, Clock, Filter, MousePointer2, Calendar, Zap } from "lucide-react"

export function TimelineGlobalContent() {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Página de Timeline (Línea de Tiempo)
          </CardTitle>
          <CardDescription>
            Visualización matricial de tus tareas con ocurrencias y eventos a través del tiempo
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="p-4 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-950/20 dark:to-purple-950/20 border rounded-lg">
            <h4 className="font-semibold mb-2">¿Qué es la Timeline?</h4>
            <p className="text-sm text-muted-foreground">
              La Timeline es una vista de matriz temporal similar a aplicaciones de seguimiento de hábitos. 
              Cada <strong>fila</strong> representa una tarea, y cada <strong>columna</strong> representa un segmento de tiempo 
              (3 horas, día, semana, mes o año). Las <strong>celdas</strong> muestran el estado de las ocurrencias/eventos en ese período.
            </p>
          </div>

          <div>
            <h4 className="font-semibold mb-3 flex items-center gap-2">
              <Table2 className="h-4 w-4" />
              Estructura de la Matriz
            </h4>
            <div className="space-y-3">
              <div className="p-3 rounded-lg bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800">
                <Badge className="mb-2 bg-blue-600 dark:bg-blue-700">Filas</Badge>
                <p className="text-xs text-muted-foreground">
                  Cada fila representa una <strong>tarea</strong> con su nombre e importancia (1-10). 
                  Solo se muestran tareas que tienen actividad (ocurrencias o eventos) en el rango de fechas seleccionado.
                </p>
              </div>

              <div className="p-3 rounded-lg bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-800">
                <Badge className="mb-2 bg-green-600 dark:bg-green-700">Columnas</Badge>
                <p className="text-xs text-muted-foreground">
                  Cada columna representa un <strong>segmento temporal</strong>. El encabezado muestra la fecha/período. 
                  El número de columnas depende de la configuración (7 días, 4 semanas, etc.).
                </p>
              </div>

              <div className="p-3 rounded-lg bg-purple-50 dark:bg-purple-950/20 border border-purple-200 dark:border-purple-800">
                <Badge className="mb-2 bg-purple-600 dark:bg-purple-700">Celdas</Badge>
                <p className="text-xs text-muted-foreground">
                  La intersección fila-columna muestra el <strong>estado</strong> de esa tarea en ese período. 
                  Cada celda tiene color, icono y opcionalmente tiempo dedicado.
                </p>
              </div>
            </div>
          </div>

          <div>
            <h4 className="font-semibold mb-3 flex items-center gap-2">
              <Zap className="h-4 w-4" />
              Estados de las Celdas
            </h4>
            <div className="space-y-2">
              <div className="flex items-center gap-3 p-3 rounded-lg bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-800">
                <div className="w-10 h-10 rounded bg-green-100 dark:bg-green-900 flex items-center justify-center shrink-0">
                  <span className="text-green-700 dark:text-green-300 text-lg font-bold">✓</span>
                </div>
                <div className="flex-1">
                  <div className="font-medium text-sm text-green-900 dark:text-green-100">Completada</div>
                  <div className="text-xs text-muted-foreground">
                    La ocurrencia fue completada en ese período. Muestra check verde y opcionalmente el tiempo dedicado (ej: "2h 30m").
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3 p-3 rounded-lg bg-gray-50 dark:bg-gray-950/20 border border-gray-200 dark:border-gray-700">
                <div className="w-10 h-10 rounded bg-gray-100 dark:bg-gray-900 flex items-center justify-center shrink-0">
                  <span className="text-gray-600 dark:text-gray-400 text-lg font-bold">−</span>
                </div>
                <div className="flex-1">
                  <div className="font-medium text-sm text-gray-900 dark:text-gray-100">Saltada</div>
                  <div className="text-xs text-muted-foreground">
                    La ocurrencia fue omitida intencionalmente. Muestra un guion gris.
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3 p-3 rounded-lg bg-yellow-50 dark:bg-yellow-950/20 border border-yellow-200 dark:border-yellow-800">
                <div className="w-10 h-10 rounded bg-yellow-100 dark:bg-yellow-900 flex items-center justify-center shrink-0">
                  <span className="text-yellow-700 dark:text-yellow-300 text-lg font-bold">○</span>
                </div>
                <div className="flex-1">
                  <div className="font-medium text-sm text-yellow-900 dark:text-yellow-100">Pendiente</div>
                  <div className="text-xs text-muted-foreground">
                    Hay una ocurrencia pendiente en ese período que aún no fue completada ni saltada.
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3 p-3 rounded-lg bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800">
                <div className="w-10 h-10 rounded bg-blue-100 dark:bg-blue-900 flex items-center justify-center shrink-0">
                  <span className="text-blue-700 dark:text-blue-300 text-lg">⟳</span>
                </div>
                <div className="flex-1">
                  <div className="font-medium text-sm text-blue-900 dark:text-blue-100">En Progreso</div>
                  <div className="text-xs text-muted-foreground">
                    La ocurrencia está marcada como "En Progreso" (animación de spinner azul).
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3 p-3 rounded-lg bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800">
                <div className="w-10 h-10 rounded bg-red-100 dark:bg-red-900 flex items-center justify-center shrink-0">
                  <span className="text-red-700 dark:text-red-300 text-lg font-bold">✗</span>
                </div>
                <div className="flex-1">
                  <div className="font-medium text-sm text-red-900 dark:text-red-100">No Completada</div>
                  <div className="text-xs text-muted-foreground">
                    La ocurrencia venció sin completarse. Muestra X roja.
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/20 border">
                <div className="w-10 h-10 rounded bg-muted flex items-center justify-center shrink-0">
                  <span className="text-muted-foreground text-sm">—</span>
                </div>
                <div className="flex-1">
                  <div className="font-medium text-sm">Vacía</div>
                  <div className="text-xs text-muted-foreground">
                    No hay ocurrencias ni eventos para esa tarea en ese período. Celda gris sin icono.
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div>
            <h4 className="font-semibold mb-3 flex items-center gap-2">
              <Clock className="h-4 w-4" />
              Intervalos de Tiempo Disponibles
            </h4>
            <p className="text-sm text-muted-foreground mb-3">
              Usa el selector de intervalo en la parte superior para cambiar la granularidad temporal:
            </p>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
              <Badge variant="outline" className="justify-center py-2 bg-purple-50 dark:bg-purple-950/30">3 horas</Badge>
              <Badge variant="outline" className="justify-center py-2 bg-blue-50 dark:bg-blue-950/30">Día</Badge>
              <Badge variant="outline" className="justify-center py-2 bg-green-50 dark:bg-green-950/30">Semana</Badge>
              <Badge variant="outline" className="justify-center py-2 bg-yellow-50 dark:bg-yellow-950/30">Mes</Badge>
              <Badge variant="outline" className="justify-center py-2 bg-red-50 dark:bg-red-950/30">Año</Badge>
            </div>
            <p className="text-xs text-muted-foreground mt-3">
              <strong>Nota:</strong> El número de columnas mostradas se ajusta automáticamente según el tamaño de pantalla. 
              En mobile se muestran menos columnas para mejor legibilidad.
            </p>
          </div>

          <div>
            <h4 className="font-semibold mb-3 flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              Configuración de Días a Mostrar
            </h4>
            <p className="text-sm text-muted-foreground mb-3">
              Controla cuántos segmentos temporales ver simultáneamente:
            </p>
            <ul className="space-y-2 text-sm text-muted-foreground ml-4">
              <li>• <strong>7 días:</strong> Vista de semana completa (predeterminado)</li>
              <li>• <strong>14 días:</strong> Dos semanas de contexto</li>
              <li>• <strong>30 días:</strong> Vista mensual aproximada</li>
              <li>• <strong>90 días:</strong> Vista trimestral (solo en desktop)</li>
            </ul>
            <p className="text-xs text-muted-foreground mt-3">
              Combina esto con el intervalo: por ejemplo, "14 días" + "semana" = 2 columnas de semanas completas.
            </p>
          </div>

          <div>
            <h4 className="font-semibold mb-3 flex items-center gap-2">
              <Filter className="h-4 w-4" />
              Filtros y Búsqueda
            </h4>
            <div className="space-y-3">
              <div className="p-3 rounded-lg bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800">
                <div className="font-medium text-sm mb-1">Búsqueda por Texto</div>
                <p className="text-xs text-muted-foreground">
                  Filtra tareas por nombre o descripción. Solo se muestran tareas que coincidan con el texto ingresado.
                </p>
              </div>

              <div className="p-3 rounded-lg bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-800">
                <div className="font-medium text-sm mb-1">Tipo de Tarea</div>
                <p className="text-xs text-muted-foreground">
                  Filtra por tipo: Única, Recurrente Finita, Hábito, Hábito+, Fija Única, o Fija Repetitiva.
                </p>
              </div>

              <div className="p-3 rounded-lg bg-purple-50 dark:bg-purple-950/20 border border-purple-200 dark:border-purple-800">
                <div className="font-medium text-sm mb-1">Prioridad (Eisenhower)</div>
                <p className="text-xs text-muted-foreground">
                  Filtra por cuadrante de Eisenhower: Urgente+Importante, No Urgente+Importante, etc.
                </p>
              </div>

              <div className="p-3 rounded-lg bg-yellow-50 dark:bg-yellow-950/20 border border-yellow-200 dark:border-yellow-800">
                <div className="font-medium text-sm mb-1">Estado de Ocurrencias</div>
                <p className="text-xs text-muted-foreground">
                  Filtra tareas según tengan ocurrencias pendientes, completadas, saltadas o todo completado.
                </p>
              </div>
            </div>
            <p className="text-xs text-muted-foreground mt-3">
              El contador en la parte superior muestra: <strong>X de Y tareas</strong> (filtradas vs total).
            </p>
          </div>

          <div>
            <h4 className="font-semibold mb-3">Ordenamiento</h4>
            <p className="text-sm text-muted-foreground mb-3">
              Ordena las filas de tareas según diferentes criterios:
            </p>
            <div className="grid grid-cols-2 gap-2">
              <Badge variant="outline" className="justify-center">Nombre A-Z</Badge>
              <Badge variant="outline" className="justify-center">Nombre Z-A</Badge>
              <Badge variant="outline" className="justify-center">Por Tipo</Badge>
              <Badge variant="outline" className="justify-center">Por Importancia</Badge>
              <Badge variant="outline" className="justify-center">Fecha Objetivo</Badge>
              <Badge variant="outline" className="justify-center">Fecha Límite</Badge>
            </div>
          </div>

          <div>
            <h4 className="font-semibold mb-3 flex items-center gap-2">
              <MousePointer2 className="h-4 w-4" />
              Interacción con Celdas
            </h4>
            <div className="p-3 rounded-lg bg-gradient-to-r from-green-50 to-blue-50 dark:from-green-950/20 dark:to-blue-950/20 border">
              <div className="font-medium text-sm mb-2">Click en una Celda</div>
              <p className="text-xs text-muted-foreground mb-3">
                Al hacer clic en cualquier celda con contenido, se abre un <strong>modal detallado</strong> que muestra:
              </p>
              <ul className="text-xs text-muted-foreground space-y-1 ml-4">
                <li>• <strong>Nombre de la tarea</strong> y descripción completa</li>
                <li>• <strong>Importancia</strong> de la tarea (1-10)</li>
                <li>• <strong>Estado general</strong> para ese período (completado/saltado/no completado)</li>
                <li>• <strong>Tiempo total dedicado</strong> sumando todos los eventos</li>
                <li>• <strong>Lista de ocurrencias</strong> en ese período con detalles individuales</li>
                <li>• <strong>Eventos asociados</strong> a cada ocurrencia con horarios y tiempo dedicado</li>
                <li>• <strong>Fechas objetivo y límite</strong> de cada ocurrencia</li>
              </ul>
            </div>
          </div>

          <div>
            <h4 className="font-semibold mb-3">Indicadores Especiales</h4>
            <div className="space-y-3">
              <div className="flex items-start gap-3 p-3 rounded-lg bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800">
                <div className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center shrink-0 font-bold text-xs">
                  3
                </div>
                <div className="flex-1">
                  <div className="font-medium text-sm text-blue-900 dark:text-blue-100">Badge de Cantidad</div>
                  <div className="text-xs text-muted-foreground">
                    Cuando hay <strong>múltiples ocurrencias</strong> en un mismo segmento, aparece un número en la esquina inferior derecha de la celda.
                  </div>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3 rounded-lg bg-purple-50 dark:bg-purple-950/20 border border-purple-200 dark:border-purple-800">
                <div className="w-8 h-8 rounded bg-purple-100 dark:bg-purple-900 flex items-center justify-center shrink-0">
                  <div className="w-2 h-2 rounded-full bg-blue-500" />
                </div>
                <div className="flex-1">
                  <div className="font-medium text-sm text-purple-900 dark:text-purple-100">Punto Azul</div>
                  <div className="text-xs text-muted-foreground">
                    Un punto azul en la esquina superior derecha indica que hay <strong>múltiples eventos</strong> asociados a esas ocurrencias.
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div>
            <h4 className="font-semibold mb-3">Navegación Temporal</h4>
            <p className="text-sm text-muted-foreground mb-3">
              Usa los controles en la parte superior para moverte en el tiempo:
            </p>
            <ul className="space-y-2 text-sm text-muted-foreground ml-4">
              <li>• <strong>Flechas ← →:</strong> Avanza/retrocede según el intervalo seleccionado</li>
              <li>• <strong>Botón "Hoy":</strong> Salta a la fecha actual instantáneamente</li>
              <li>• El período actual se muestra en el footer inferior</li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold mb-3">Layout Responsivo</h4>
            <div className="grid md:grid-cols-2 gap-3">
              <div className="p-3 rounded-lg bg-muted/20 border">
                <Badge variant="outline" className="mb-2">Desktop</Badge>
                <p className="text-xs text-muted-foreground">
                  Muestra más columnas simultáneamente (hasta 90 días). Tamaños de celda más grandes con tiempo visible.
                </p>
              </div>
              <div className="p-3 rounded-lg bg-muted/20 border">
                <Badge variant="outline" className="mb-2">Mobile</Badge>
                <p className="text-xs text-muted-foreground">
                  Modo compacto con menos columnas visibles (scrolleable). Celdas más pequeñas, tiempo abreviado.
                </p>
              </div>
            </div>
          </div>

          <div className="p-4 bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-950/20 dark:to-pink-950/20 border border-purple-200 dark:border-purple-800 rounded-lg">
            <h5 className="font-semibold text-sm mb-2 text-purple-900 dark:text-purple-100">💡 Casos de Uso</h5>
            <ul className="text-xs text-purple-800 dark:text-purple-200 space-y-2">
              <li>• <strong>Análisis de patrones:</strong> Identifica qué días de la semana eres más productivo</li>
              <li>• <strong>Seguimiento de hábitos:</strong> Visualiza rachas de completitud para tareas recurrentes</li>
              <li>• <strong>Revisión histórica:</strong> Mira atrás para ver cuánto tiempo dedicaste a proyectos</li>
              <li>• <strong>Planificación futura:</strong> Ve qué tareas están pendientes en los próximos días/semanas</li>
              <li>• <strong>Detección de problemas:</strong> Identifica tareas que saltas frecuentemente o nunca completas</li>
            </ul>
          </div>

          <HelpTip title="Timeline vs Gestor de Tareas vs Eventos">
            La <strong>Página Timeline</strong> muestra una matriz de todas las tareas con sus estados. 
            El <strong>Gestor de Tareas (Timeline)</strong> muestra ocurrencias en tarjetas por fecha. 
            La <strong>Página Eventos</strong> muestra eventos agendados en calendario con horarios exactos.
          </HelpTip>
        </CardContent>
      </Card>
    </div>
  )
}
