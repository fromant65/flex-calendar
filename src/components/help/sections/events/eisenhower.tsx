"use client"

import React from "react"
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "~/components/ui/card"
import { HelpTip } from "~/components/ui/help-tip"
import { Badge } from "~/components/ui/badge"
import { Grid3x3, MousePointer2, Filter, ArrowRightLeft } from "lucide-react"

export function EisenhowerContent() {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Grid3x3 className="h-5 w-5" />
            Matriz de Eisenhower
          </CardTitle>
          <CardDescription>
            Prioriza ocurrencias según urgencia e importancia
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="p-4 bg-gradient-to-br from-purple-50 to-blue-50 dark:from-purple-950/20 dark:to-blue-950/20 border rounded-lg">
            <h4 className="font-semibold mb-2">¿Qué es la Matriz de Eisenhower?</h4>
            <p className="text-sm text-muted-foreground">
              Es un método de priorización que clasifica tareas en 4 cuadrantes según dos ejes:
              <strong> Urgencia</strong> (qué tan pronto debe hacerse) e <strong>Importancia</strong> (qué tan relevante es para tus objetivos).
            </p>
          </div>

          <div>
            <h4 className="font-semibold mb-3">Los 4 Cuadrantes</h4>
            <div className="grid md:grid-cols-2 gap-4">
              <div className="p-4 rounded-lg bg-red-50 dark:bg-red-950/20 border-2 border-red-300 dark:border-red-800">
                <div className="font-bold text-red-700 dark:text-red-400 mb-2">🔴 Urgente + Importante</div>
                <p className="text-xs text-muted-foreground mb-2">
                  Crisis, deadlines inminentes, problemas urgentes. <strong>Hacer inmediatamente.</strong>
                </p>
                <p className="text-xs text-muted-foreground">
                  Ejemplo: Entrega que vence hoy, emergencia laboral, problema crítico.
                </p>
              </div>

              <div className="p-4 rounded-lg bg-blue-50 dark:bg-blue-950/20 border-2 border-blue-300 dark:border-blue-800">
                <div className="font-bold text-blue-700 dark:text-blue-400 mb-2">🔵 No Urgente + Importante</div>
                <p className="text-xs text-muted-foreground mb-2">
                  Planificación, desarrollo personal, relaciones. <strong>Programar tiempo dedicado.</strong>
                </p>
                <p className="text-xs text-muted-foreground">
                  Ejemplo: Estudiar nuevo skill, planificar proyecto, ejercicio regular.
                </p>
              </div>

              <div className="p-4 rounded-lg bg-orange-50 dark:bg-orange-950/20 border-2 border-orange-300 dark:border-orange-800">
                <div className="font-bold text-orange-700 dark:text-orange-400 mb-2">🟠 Urgente + No Importante</div>
                <p className="text-xs text-muted-foreground mb-2">
                  Interrupciones, algunos emails, llamadas menores. <strong>Delegar o minimizar.</strong>
                </p>
                <p className="text-xs text-muted-foreground">
                  Ejemplo: Reunión innecesaria, tarea administrativa simple, favor urgente.
                </p>
              </div>

              <div className="p-4 rounded-lg bg-gray-50 dark:bg-gray-950/20 border-2 border-gray-300 dark:border-gray-800">
                <div className="font-bold text-gray-700 dark:text-gray-400 mb-2">⚪ No Urgente + No Importante</div>
                <p className="text-xs text-muted-foreground mb-2">
                  Distracciones, tareas triviales, tiempo perdido. <strong>Eliminar o posponer indefinidamente.</strong>
                </p>
                <p className="text-xs text-muted-foreground">
                  Ejemplo: Scroll en redes sociales, TV sin propósito, tareas irrelevantes.
                </p>
              </div>
            </div>
          </div>

          <div>
            <h4 className="font-semibold mb-3">Cómo se determinan los cuadrantes</h4>
            <div className="space-y-3">
              <div className="p-3 rounded-lg bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800">
                <div className="font-medium text-sm mb-1 flex items-center gap-2">
                  <Badge className="bg-blue-600 dark:bg-blue-700">Importancia</Badge>
                </div>
                <p className="text-xs text-muted-foreground">
                  Se define al crear la tarea con el parámetro "Importancia" (Baja/Media/Alta). 
                  Refleja cuán relevante es la tarea para tus objetivos de largo plazo.
                </p>
              </div>

              <div className="p-3 rounded-lg bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800">
                <div className="font-medium text-sm mb-1 flex items-center gap-2">
                  <Badge className="bg-red-600 dark:bg-red-700">Urgencia</Badge>
                </div>
                <p className="text-xs text-muted-foreground mb-2">
                  Se calcula automáticamente según las fechas de la ocurrencia:
                </p>
                <ul className="text-xs text-muted-foreground space-y-1 ml-4">
                  <li>• <strong>Urgente:</strong> Fecha objetivo/límite es hoy o ya pasó</li>
                  <li>• <strong>No Urgente:</strong> Fecha objetivo/límite está en el futuro</li>
                </ul>
              </div>
            </div>
          </div>

          <div>
            <h4 className="font-semibold mb-3 flex items-center gap-2">
              <MousePointer2 className="h-4 w-4" />
              Interacción con la Matriz
            </h4>
            <div className="space-y-3">
              <div className="p-3 rounded-lg bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-800">
                <Badge className="mb-2 bg-green-600 dark:bg-green-700">Desktop: Arrastrar y Soltar</Badge>
                <p className="text-xs text-muted-foreground">
                  Selecciona una ocurrencia de cualquier cuadrante y arrástrala al calendario. 
                  Suéltala en el horario deseado para crear un evento. Se abre un diálogo de confirmación.
                </p>
              </div>

              <div className="p-3 rounded-lg bg-purple-50 dark:bg-purple-950/20 border border-purple-200 dark:border-purple-800">
                <Badge className="mb-2 bg-purple-600 dark:bg-purple-700">Mobile: Tocar y Agendar</Badge>
                <p className="text-xs text-muted-foreground">
                  Toca una ocurrencia en la matriz para seleccionarla (se resalta). 
                  Luego toca el horario deseado en el calendario para crear el evento.
                </p>
              </div>

              <div className="p-3 rounded-lg bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800">
                <Badge className="mb-2 bg-blue-600 dark:bg-blue-700">Ver Detalles</Badge>
                <p className="text-xs text-muted-foreground">
                  Click/tap en una ocurrencia sin arrastrarla abre el modal de detalles con toda la información 
                  de la tarea y ocurrencia.
                </p>
              </div>
            </div>
          </div>

          <div>
            <h4 className="font-semibold mb-3 flex items-center gap-2">
              <Filter className="h-4 w-4" />
              Filtros Disponibles
            </h4>
            <p className="text-sm text-muted-foreground mb-3">
              Usa la barra de filtros superior para refinar qué ocurrencias ves en la matriz:
            </p>
            <ul className="space-y-2 text-sm text-muted-foreground ml-4">
              <li>• <strong>Búsqueda por texto:</strong> Filtra por nombre o descripción de tarea</li>
              <li>• <strong>Tipos de tarea:</strong> Selección múltiple de tipos (Única, Hábito, Recurrente, etc.)</li>
              <li>• <strong>Estados de ocurrencia:</strong> Pendiente, Completada, Saltada, En Progreso</li>
              <li>• <strong>Ordenamiento:</strong> Por nombre, tipo, fecha objetivo o fecha límite</li>
            </ul>
            <p className="text-xs text-muted-foreground mt-3">
              <strong>Nota:</strong> El contador en la barra muestra cuántas ocurrencias cumplen los filtros vs el total.
            </p>
          </div>

          <div>
            <h4 className="font-semibold mb-3 flex items-center gap-2">
              <ArrowRightLeft className="h-4 w-4" />
              Layout Responsivo
            </h4>
            <div className="grid md:grid-cols-2 gap-3">
              <div className="p-3 rounded-lg bg-muted/20 border">
                <Badge variant="outline" className="mb-2">Desktop</Badge>
                <p className="text-xs text-muted-foreground">
                  Cuadrícula 2×2 con matriz a la izquierda y calendario a la derecha. 
                  Ideal para arrastrar y soltar.
                </p>
              </div>
              <div className="p-3 rounded-lg bg-muted/20 border">
                <Badge variant="outline" className="mb-2">Mobile</Badge>
                <p className="text-xs text-muted-foreground">
                  Matriz arriba, calendario abajo, apilados verticalmente. 
                  Selección por tap.
                </p>
              </div>
            </div>
          </div>

          <HelpTip title="Estrategia de uso">
            Enfócate en <strong>vaciar el cuadrante rojo</strong> (Urgente+Importante) lo antes posible. 
            Luego dedica tiempo al <strong>cuadrante azul</strong> (No Urgente+Importante) para evitar que las tareas 
            importantes se vuelvan urgentes. Minimiza tiempo en cuadrantes naranja y gris.
          </HelpTip>
        </CardContent>
      </Card>
    </div>
  )
}
