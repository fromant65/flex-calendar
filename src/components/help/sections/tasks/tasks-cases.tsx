"use client"

import React from "react"
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "~/components/ui/card"
import { HelpTip } from "~/components/ui/help-tip"
import { Badge } from "~/components/ui/badge"
import { FileText } from "lucide-react"

export function TasksCases() {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Casos de Uso por Tipo de Tarea
          </CardTitle>
          <CardDescription>
            Ejemplos prácticos de cuándo usar cada tipo de tarea
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-4">
            <div>
              <h4 className="font-semibold mb-2 flex items-center gap-2">
                <Badge variant="outline" className="bg-blue-50 dark:bg-blue-950/30">Única</Badge>
                Tareas de una sola vez sin horario
              </h4>
              <ul className="space-y-2 text-sm text-muted-foreground ml-4">
                <li>• <strong>Proyecto específico:</strong> "Completar informe trimestral Q4"</li>
                <li>• <strong>Compra puntual:</strong> "Comprar regalo de cumpleaños para mamá"</li>
                <li>• <strong>Trámite:</strong> "Renovar pasaporte"</li>
                <li>• <strong>Tarea personal:</strong> "Organizar el closet"</li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold mb-2 flex items-center gap-2">
                <Badge variant="outline" className="bg-green-50 dark:bg-green-950/30">Recurrente finita</Badge>
                Tareas con N ocurrencias
              </h4>
              <ul className="space-y-2 text-sm text-muted-foreground ml-4">
                <li>• <strong>Capacitación:</strong> "Completar 8 módulos del curso online" (8 veces)</li>
                <li>• <strong>Serie de reuniones:</strong> "Entrevistas con candidatos" (5 veces)</li>
                <li>• <strong>Proyecto por fases:</strong> "Revisar capítulos de tesis" (6 veces)</li>
                <li>• <strong>Tratamiento:</strong> "Sesiones de fisioterapia" (10 veces)</li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold mb-2 flex items-center gap-2">
                <Badge variant="outline" className="bg-purple-50 dark:bg-purple-950/30">Hábito</Badge>
                Recurrencia indefinida por periodo
              </h4>
              <ul className="space-y-2 text-sm text-muted-foreground ml-4">
                <li>• <strong>Mantenimiento regular:</strong> "Revisar emails importantes" (cada 1 día)</li>
                <li>• <strong>Revisión periódica:</strong> "Actualizar backups del sistema" (cada 7 días)</li>
                <li>• <strong>Seguimiento continuo:</strong> "Llamar a clientes potenciales" (cada 2 días)</li>
                <li>• <strong>Control de calidad:</strong> "Revisar métricas de rendimiento" (cada 3 días)</li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold mb-2 flex items-center gap-2">
                <Badge variant="outline" className="bg-orange-50 dark:bg-orange-950/30">Hábito+</Badge>
                Hábitos con patrón de días específico
              </h4>
              <ul className="space-y-2 text-sm text-muted-foreground ml-4">
                <li>• <strong>Ejercicio:</strong> "Ir al gimnasio" (Lunes, Miércoles, Viernes)</li>
                <li>• <strong>Estudio:</strong> "Practicar inglés 30 min" (todos los días de la semana)</li>
                <li>• <strong>Finanzas:</strong> "Revisar gastos mensuales" (días 1 y 15 del mes)</li>
                <li>• <strong>Desarrollo personal:</strong> "Meditar" (Martes, Jueves, Sábado)</li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold mb-2 flex items-center gap-2">
                <Badge variant="outline" className="bg-cyan-50 dark:bg-cyan-950/30">Única fija</Badge>
                Tarea única con fecha y horario fijo
              </h4>
              <ul className="space-y-2 text-sm text-muted-foreground ml-4">
                <li>• <strong>Reunión importante:</strong> "Presentación con el cliente" (15 Nov, 10:00-11:30)</li>
                <li>• <strong>Cita médica:</strong> "Consulta con el dentista" (20 Nov, 15:00-16:00)</li>
                <li>• <strong>Evento único:</strong> "Entrega de proyecto final" (30 Nov, 9:00-10:00)</li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold mb-2 flex items-center gap-2">
                <Badge variant="outline" className="bg-pink-50 dark:bg-pink-950/30">Fija repetitiva+</Badge>
                Tarea repetitiva con días y horarios fijos
              </h4>
              <ul className="space-y-2 text-sm text-muted-foreground ml-4">
                <li>• <strong>Clase regular:</strong> "Clase de yoga" (Lun, Mie, Vie a las 18:00-19:00)</li>
                <li>• <strong>Tutoría:</strong> "Clases de piano" (Mar, Jue a las 16:00-17:30)</li>
                <li>• <strong>Reunión recurrente:</strong> "Stand-up diario" (Lun-Vie a las 9:00-9:15)</li>
              </ul>
            </div>
          </div>

          <HelpTip title="💡 Tip: Elegir el tipo correcto">
            <p className="text-sm mb-2">
              La clave está en el <strong>patrón de repetición y horarios</strong>:
            </p>
            <ul className="text-sm space-y-1 ml-4">
              <li>• <strong>Única:</strong> Solo una vez, sin horario</li>
              <li>• <strong>Recurrente finita:</strong> N veces exactas, sin horario</li>
              <li>• <strong>Hábito:</strong> Cada N días indefinido, sin horario</li>
              <li>• <strong>Hábito+:</strong> Días específicos indefinido, sin horario</li>
              <li>• <strong>Única fija:</strong> Una vez con fecha y horario fijo</li>
              <li>• <strong>Fija repetitiva+:</strong> Días y horarios fijos recurrentes</li>
            </ul>
          </HelpTip>
        </CardContent>
      </Card>
    </div>
  )
}
