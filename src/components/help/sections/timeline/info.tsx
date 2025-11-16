"use client"

import React from "react"
import { Card, CardHeader, CardTitle, CardContent } from "~/components/ui/card"
import { Badge } from "~/components/ui/badge"
import { Info, Clock, Target, Calendar, CheckCircle2 } from "lucide-react"

export function TimelineInfoContent() {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Info className="h-5 w-5" />
            Información Detallada en Celdas
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="p-4 bg-gradient-to-r from-cyan-50 to-blue-50 dark:from-cyan-950/20 dark:to-blue-950/20 border rounded-lg">
            <p className="text-sm text-muted-foreground">
              Al hacer clic en cualquier celda de la Timeline, se abre un modal con información 
              detallada sobre las ocurrencias y eventos de esa tarea en ese período.
            </p>
          </div>

          <div>
            <h4 className="font-semibold mb-3">Contenido del Modal</h4>
            <div className="space-y-3">
              <div className="p-4 rounded-lg bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800">
                <h5 className="font-medium text-sm mb-2 flex items-center gap-2 text-blue-900 dark:text-blue-100">
                  <Badge className="bg-blue-600 dark:bg-blue-700">1</Badge>
                  Encabezado
                </h5>
                <ul className="text-xs text-muted-foreground space-y-1 ml-4">
                  <li>• <strong>Nombre de la tarea</strong> (título grande)</li>
                  <li>• <strong>Badge de estado general:</strong> Completada, Saltada o No Completada</li>
                  <li>• <strong>Fecha del período:</strong> Por ejemplo "16 de noviembre de 2025"</li>
                </ul>
              </div>

              <div className="p-4 rounded-lg bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-800">
                <h5 className="font-medium text-sm mb-2 flex items-center gap-2 text-green-900 dark:text-green-100">
                  <Badge className="bg-green-600 dark:bg-green-700">2</Badge>
                  Información de la Tarea
                </h5>
                <ul className="text-xs text-muted-foreground space-y-1 ml-4">
                  <li>• <strong>Descripción completa</strong> de la tarea (si existe)</li>
                  <li>• <strong>Importancia:</strong> Valor del 1 al 10</li>
                  <li>• <strong>Tipo de tarea:</strong> Única, Hábito, Recurrente, etc.</li>
                </ul>
              </div>

              <div className="p-4 rounded-lg bg-purple-50 dark:bg-purple-950/20 border border-purple-200 dark:border-purple-800">
                <h5 className="font-medium text-sm mb-2 flex items-center gap-2 text-purple-900 dark:text-purple-100">
                  <Badge className="bg-purple-600 dark:bg-purple-700">3</Badge>
                  Tiempo Total Dedicado
                </h5>
                <p className="text-xs text-muted-foreground mb-2">
                  Suma de todo el tiempo dedicado en ese período, mostrando:
                </p>
                <ul className="text-xs text-muted-foreground space-y-1 ml-4">
                  <li>• <strong>Formato legible:</strong> "2h 30m" o "45m"</li>
                  <li>• Calcula sumando tiempo de todos los eventos completados</li>
                  <li>• Si no hay eventos, suma el tiempo de las ocurrencias</li>
                </ul>
              </div>

              <div className="p-4 rounded-lg bg-yellow-50 dark:bg-yellow-950/20 border border-yellow-200 dark:border-yellow-800">
                <h5 className="font-medium text-sm mb-2 flex items-center gap-2 text-yellow-900 dark:text-yellow-100">
                  <Badge className="bg-yellow-600 dark:bg-yellow-700">4</Badge>
                  Lista de Ocurrencias
                </h5>
                <p className="text-xs text-muted-foreground mb-2">
                  Cada ocurrencia se muestra en un acordeón expandible con:
                </p>
                <ul className="text-xs text-muted-foreground space-y-1 ml-4">
                  <li>• <strong>Encabezado:</strong> Número de ocurrencia y estado</li>
                  <li>• <strong>Fechas importantes:</strong> Fecha de inicio, objetivo y límite</li>
                  <li>• <strong>Estado:</strong> Pendiente, Completada, Saltada, En Progreso</li>
                  <li>• <strong>Contexto:</strong> Notas adicionales si existen</li>
                </ul>
              </div>

              <div className="p-4 rounded-lg bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800">
                <h5 className="font-medium text-sm mb-2 flex items-center gap-2 text-red-900 dark:text-red-100">
                  <Badge className="bg-red-600 dark:bg-red-700">5</Badge>
                  Eventos Asociados
                </h5>
                <p className="text-xs text-muted-foreground mb-2">
                  Dentro de cada ocurrencia, se listan sus eventos programados:
                </p>
                <ul className="text-xs text-muted-foreground space-y-1 ml-4">
                  <li>• <strong>Horario:</strong> Fecha y hora de inicio y fin</li>
                  <li>• <strong>Duración:</strong> Cuánto tiempo estaba programado</li>
                  <li>• <strong>Tiempo dedicado:</strong> Tiempo real invertido (si se completó)</li>
                  <li>• <strong>Estado:</strong> Completado, pendiente o saltado</li>
                  <li>• <strong>Contexto:</strong> Notas del agendamiento</li>
                </ul>
              </div>
            </div>
          </div>

          <div>
            <h4 className="font-semibold mb-3 flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4" />
              Detalles de Fechas en Ocurrencias
            </h4>
            <div className="space-y-2">
              <div className="flex items-start gap-3 p-3 rounded-lg bg-cyan-50 dark:bg-cyan-950/20 border border-cyan-200 dark:border-cyan-800">
                <Calendar className="h-5 w-5 text-cyan-600 dark:text-cyan-500 mt-0.5 shrink-0" />
                <div className="flex-1">
                  <div className="font-medium text-sm text-cyan-900 dark:text-cyan-100">Fecha de Inicio</div>
                  <p className="text-xs text-muted-foreground">
                    Cuándo comenzó la ocurrencia o cuándo se generó. Es la referencia temporal inicial.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3 rounded-lg bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-800">
                <Target className="h-5 w-5 text-green-600 dark:text-green-500 mt-0.5 shrink-0" />
                <div className="flex-1">
                  <div className="font-medium text-sm text-green-900 dark:text-green-100">Fecha Objetivo</div>
                  <p className="text-xs text-muted-foreground">
                    Fecha ideal para completar la ocurrencia. Es una meta sugerida, no una obligación.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3 rounded-lg bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800">
                <Clock className="h-5 w-5 text-red-600 dark:text-red-500 mt-0.5 shrink-0" />
                <div className="flex-1">
                  <div className="font-medium text-sm text-red-900 dark:text-red-100">Fecha Límite</div>
                  <p className="text-xs text-muted-foreground">
                    Deadline absoluto. Después de esta fecha, la ocurrencia se marca como vencida si no está completada.
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div>
            <h4 className="font-semibold mb-3">Múltiples Ocurrencias en un Período</h4>
            <div className="p-4 rounded-lg bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-950/20 dark:to-pink-950/20 border">
              <p className="text-sm text-muted-foreground mb-3">
                Algunas tareas pueden tener múltiples ocurrencias en el mismo período temporal. Por ejemplo:
              </p>
              <ul className="text-xs text-muted-foreground space-y-2 ml-4">
                <li>• Un <strong>Hábito</strong> puede tener una ocurrencia por día de la semana</li>
                <li>• Una <strong>tarea recurrente</strong> puede generar 2+ ocurrencias en una semana</li>
                <li>• Una <strong>tarea fija repetitiva</strong> puede tener varios slots en un día</li>
              </ul>
              <div className="mt-3 p-3 rounded bg-purple-100 dark:bg-purple-900/30">
                <p className="text-xs text-muted-foreground">
                  <strong>Indicador visual:</strong> Cuando hay múltiples ocurrencias, verás un badge numérico 
                  en la esquina inferior derecha de la celda (ej: "3" indica 3 ocurrencias).
                </p>
              </div>
            </div>
          </div>

          <div>
            <h4 className="font-semibold mb-3">Múltiples Eventos por Ocurrencia</h4>
            <div className="p-4 rounded-lg bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800">
              <p className="text-sm text-muted-foreground mb-3">
                Una misma ocurrencia puede tener varios eventos asociados:
              </p>
              <ul className="text-xs text-muted-foreground space-y-2 ml-4">
                <li>• Agendaste trabajo en la ocurrencia en diferentes horarios</li>
                <li>• Completaste la tarea en múltiples sesiones</li>
                <li>• Reagendaste el evento varias veces</li>
              </ul>
              <div className="mt-3 p-3 rounded bg-blue-100 dark:bg-blue-900/30">
                <p className="text-xs text-muted-foreground">
                  <strong>Indicador visual:</strong> Un punto azul en la esquina superior derecha indica múltiples eventos. 
                  El modal listará todos los eventos con sus horarios individuales.
                </p>
              </div>
            </div>
          </div>

          <div>
            <h4 className="font-semibold mb-3">Ejemplo Práctico</h4>
            <div className="p-4 rounded-lg bg-gradient-to-br from-green-50 to-teal-50 dark:from-green-950/20 dark:to-teal-950/20 border">
              <p className="text-sm font-medium mb-3">Haces clic en una celda verde de "Ejercicio" del lunes 16 de noviembre:</p>
              <div className="space-y-2 text-xs text-muted-foreground">
                <p><strong>Modal muestra:</strong></p>
                <ul className="ml-4 space-y-1">
                  <li>• Título: "Ejercicio"</li>
                  <li>• Estado: Badge verde "Completada"</li>
                  <li>• Fecha: "16 de noviembre de 2025"</li>
                  <li>• Descripción: "Rutina de ejercicio cardiovascular"</li>
                  <li>• Importancia: 8/10</li>
                  <li>• Tipo: Hábito</li>
                  <li>• Tiempo total: 1h 15m</li>
                </ul>
                <p className="mt-2"><strong>Ocurrencia #1:</strong></p>
                <ul className="ml-4 space-y-1">
                  <li>• Estado: Completada</li>
                  <li>• Fecha inicio: 16 nov 2025</li>
                  <li>• Fecha objetivo: 16 nov 2025</li>
                  <li>• Fecha límite: 16 nov 2025 23:59</li>
                  <li>• Evento asociado: 07:00 - 08:15 (75 min dedicados)</li>
                </ul>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
