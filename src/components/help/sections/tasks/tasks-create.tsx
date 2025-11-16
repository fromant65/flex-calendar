"use client"

import React from "react"
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "~/components/ui/card"
import { HelpTip } from "~/components/ui/help-tip"
import { Badge } from "~/components/ui/badge"

export function TasksCreate() {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Cómo Crear Cada Tipo de Tarea</CardTitle>
          <CardDescription>
            Guía paso a paso para crear tareas según tu necesidad
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-6">
            <div className="p-4 bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 rounded-lg">
              <h4 className="font-semibold mb-3 flex items-center gap-2">
                <Badge variant="outline" className="bg-white dark:bg-slate-900">Única</Badge>
                Tarea de una sola vez
              </h4>
              <ol className="space-y-2 text-sm">
                <li>1. Haz clic en "Nueva Tarea"</li>
                <li>2. Escribe el nombre (ej: "Completar informe Q4")</li>
                <li>3. Define importancia (1-10)</li>
                <li>4. Selecciona tipo <strong>"Única"</strong></li>
                <li>5. Opcional: añade descripción</li>
                <li>6. Guarda</li>
              </ol>
              <p className="text-xs text-muted-foreground mt-2">
                ✨ Se crea automáticamente UNA ocurrencia que puedes programar cuando quieras
              </p>
            </div>

            <div className="p-4 bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-800 rounded-lg">
              <h4 className="font-semibold mb-3 flex items-center gap-2">
                <Badge variant="outline" className="bg-white dark:bg-slate-900">Recurrente finita</Badge>
                Tarea que se genera N veces
              </h4>
              <ol className="space-y-2 text-sm">
                <li>1. Haz clic en "Nueva Tarea"</li>
                <li>2. Nombre (ej: "Revisar capítulos de tesis")</li>
                <li>3. Define importancia (1-10)</li>
                <li>4. Selecciona <strong>"Recurrente finita"</strong></li>
                <li>5. Define <strong>cantidad de ocurrencias</strong> (ej: 6 capítulos)</li>
                <li>6. Guarda</li>
              </ol>
              <p className="text-xs text-muted-foreground mt-2">
                ✨ Se crean N ocurrencias que puedes ir completando a tu ritmo
              </p>
            </div>

            <div className="p-4 bg-purple-50 dark:bg-purple-950/20 border border-purple-200 dark:border-purple-800 rounded-lg">
              <h4 className="font-semibold mb-3 flex items-center gap-2">
                <Badge variant="outline" className="bg-white dark:bg-slate-900">Hábito</Badge>
                Recurrencia indefinida por periodo
              </h4>
              <ol className="space-y-2 text-sm">
                <li>1. Haz clic en "Nueva Tarea"</li>
                <li>2. Nombre (ej: "Revisar emails importantes")</li>
                <li>3. Define importancia (1-10)</li>
                <li>4. Selecciona <strong>"Hábito"</strong></li>
                <li>5. Define <strong>periodo</strong> (ej: cada 1 día = diario, cada 3 días, etc.)</li>
                <li>6. Guarda</li>
              </ol>
              <p className="text-xs text-muted-foreground mt-2">
                ✨ Se generan ocurrencias automáticamente cada N días indefinidamente
              </p>
            </div>

            <div className="p-4 bg-orange-50 dark:bg-orange-950/20 border border-orange-200 dark:border-orange-800 rounded-lg">
              <h4 className="font-semibold mb-3 flex items-center gap-2">
                <Badge variant="outline" className="bg-white dark:bg-slate-900">Hábito+</Badge>
                Hábito con patrón específico de días
              </h4>
              <ol className="space-y-2 text-sm">
                <li>1. Haz clic en "Nueva Tarea"</li>
                <li>2. Nombre (ej: "Ir al gimnasio")</li>
                <li>3. Define importancia (1-10)</li>
                <li>4. Selecciona <strong>"Hábito+"</strong></li>
                <li>5. Elige tipo de recurrencia:
                  <ul className="ml-4 mt-1 space-y-1">
                    <li>• <strong>Periodo simple:</strong> Cantidad de ocurrencias por periodo de N días</li>
                    <li>• <strong>Días de semana:</strong> Marca Lun, Mie, Vie...</li>
                    <li>• <strong>Días del mes:</strong> Fechas específicas (ej: días 1, 15, 30)</li>
                  </ul>
                </li>
                <li>6. Guarda</li>
              </ol>
              <p className="text-xs text-muted-foreground mt-2">
                ✨ Se generan ocurrencias solo en los días específicos que configuraste
              </p>
            </div>

            <div className="p-4 bg-cyan-50 dark:bg-cyan-950/20 border border-cyan-200 dark:border-cyan-800 rounded-lg">
              <h4 className="font-semibold mb-3 flex items-center gap-2">
                <Badge variant="outline" className="bg-white dark:bg-slate-900">Única fija</Badge>
                Tarea única con fecha y horarios fijos
              </h4>
              <ol className="space-y-2 text-sm">
                <li>1. Haz clic en "Nueva Tarea"</li>
                <li>2. Nombre (ej: "Reunión con cliente")</li>
                <li>3. Define importancia (1-10)</li>
                <li>4. Selecciona <strong>"Única fija"</strong></li>
                <li>5. Define <strong>fecha específica</strong> (ej: 20 de noviembre)</li>
                <li>6. Define <strong>horario fijo</strong> (ej: 10:00 - 11:30)</li>
                <li>7. Guarda</li>
              </ol>
              <p className="text-xs text-muted-foreground mt-2">
                ✨ Se crea una ocurrencia con evento programado automáticamente en esa fecha y hora
              </p>
            </div>

            <div className="p-4 bg-pink-50 dark:bg-pink-950/20 border border-pink-200 dark:border-pink-800 rounded-lg">
              <h4 className="font-semibold mb-3 flex items-center gap-2">
                <Badge variant="outline" className="bg-white dark:bg-slate-900">Fija repetitiva+</Badge>
                Tarea repetitiva en días y horarios fijos
              </h4>
              <ol className="space-y-2 text-sm">
                <li>1. Haz clic en "Nueva Tarea"</li>
                <li>2. Nombre (ej: "Clase de yoga")</li>
                <li>3. Define importancia (1-10)</li>
                <li>4. Selecciona <strong>"Fija repetitiva+"</strong></li>
                <li>5. Define <strong>patrón de días</strong> (ej: Lun, Mie, Vie)</li>
                <li>6. Define <strong>horario fijo</strong> (ej: 18:00 - 19:00)</li>
                <li>7. Guarda</li>
              </ol>
              <p className="text-xs text-muted-foreground mt-2">
                ✨ Se crean ocurrencias con eventos automáticamente en los días y horarios configurados
              </p>
            </div>
          </div>

          <HelpTip title="¿Cuál elegir?">
            <ul className="text-sm space-y-1">
              <li>• <strong>Una vez sin horario</strong> → Única</li>
              <li>• <strong>N veces sin horario</strong> → Recurrente finita</li>
              <li>• <strong>Cada N días indefinido</strong> → Hábito</li>
              <li>• <strong>Días específicos indefinido</strong> → Hábito+</li>
              <li>• <strong>Una vez con fecha/hora fija</strong> → Única fija</li>
              <li>• <strong>Repetitiva con días/horas fijas</strong> → Fija repetitiva+</li>
            </ul>
          </HelpTip>
        </CardContent>
      </Card>
    </div>
  )
}
