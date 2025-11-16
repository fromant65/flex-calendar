"use client"

import React from "react"
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "~/components/ui/card"
import { HelpTip } from "~/components/ui/help-tip"
import { Badge } from "~/components/ui/badge"
import { Calendar, PlayCircle, Edit, Clock, AlertTriangle, Trash2 } from "lucide-react"

export function CalendarContent() {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Calendario de Eventos</CardTitle>
          <CardDescription>Gestiona tus bloques de tiempo programados</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="p-4 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-950/20 dark:to-purple-950/20 border rounded-lg">
            <p className="text-sm text-muted-foreground">
              El calendario muestra tus eventos (bloques de tiempo ya agendados) con sus horarios exactos. 
              Es la vista principal para ver cuándo realizarás cada tarea a lo largo del día/semana/mes.
            </p>
          </div>

          <div>
            <h4 className="font-semibold mb-3">Vistas Disponibles</h4>
            <div className="space-y-3">
              <div className="p-3 rounded-lg bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800">
                <div className="font-medium text-sm mb-1 flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  Vista Diaria
                </div>
                <div className="text-xs text-muted-foreground">
                  Muestra las 24 horas del día con todos los eventos en sus horarios exactos. 
                  Los eventos se muestran como bloques con altura proporcional a su duración. 
                  Incluye indicador de hora actual.
                </div>
              </div>

              <div className="p-3 rounded-lg bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-800">
                <div className="font-medium text-sm mb-1 flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  Vista Semanal
                </div>
                <div className="text-xs text-muted-foreground">
                  7 columnas (Lun-Dom) mostrando las 24 horas de cada día con eventos distribuidos. 
                  Perfecta para visión general de la semana y planificación de mediano plazo.
                </div>
              </div>

              <div className="p-3 rounded-lg bg-purple-50 dark:bg-purple-950/20 border border-purple-200 dark:border-purple-800">
                <div className="font-medium text-sm mb-1 flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  Vista Mensual
                </div>
                <div className="text-xs text-muted-foreground">
                  Cuadrícula con todos los días del mes mostrando cuántos eventos hay cada día. 
                  No muestra horarios exactos, solo cantidad de eventos por día.
                </div>
              </div>
            </div>
          </div>

          <div>
            <h4 className="font-semibold mb-3">Crear Eventos</h4>
            <div className="space-y-3">
              <div className="flex items-start gap-3 p-3 rounded-lg bg-muted/20 border">
                <PlayCircle className="h-5 w-5 text-green-600 dark:text-green-500 mt-0.5 shrink-0" />
                <div>
                  <div className="font-medium text-sm">Desde la Matriz (Desktop)</div>
                  <div className="text-xs text-muted-foreground">
                    Arrastra una ocurrencia desde cualquier cuadrante de la matriz de Eisenhower 
                    y suéltala en el horario deseado del calendario. Se abre un diálogo de confirmación 
                    donde puedes ajustar fecha, hora de inicio y fin.
                  </div>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3 rounded-lg bg-muted/20 border">
                <PlayCircle className="h-5 w-5 text-green-600 dark:text-green-500 mt-0.5 shrink-0" />
                <div>
                  <div className="font-medium text-sm">Desde la Matriz (Mobile)</div>
                  <div className="text-xs text-muted-foreground">
                    Selecciona una ocurrencia tocándola en la matriz, luego toca el horario deseado 
                    en el calendario para crear el evento.
                  </div>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3 rounded-lg bg-muted/20 border">
                <Clock className="h-5 w-5 text-blue-600 dark:text-blue-500 mt-0.5 shrink-0" />
                <div>
                  <div className="font-medium text-sm">Click en Horario Vacío</div>
                  <div className="text-xs text-muted-foreground">
                    Haz clic en cualquier horario vacío del calendario para crear un evento rápidamente 
                    (requiere tener una ocurrencia seleccionada).
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div>
            <h4 className="font-semibold mb-3">Editar Eventos</h4>
            <div className="space-y-3">
              <div className="flex items-start gap-3 p-3 rounded-lg bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800">
                <Edit className="h-5 w-5 text-amber-600 dark:text-amber-500 mt-0.5 shrink-0" />
                <div>
                  <div className="font-medium text-sm">Eventos de Tareas No Fijas</div>
                  <div className="text-xs text-muted-foreground mb-2">
                    Los eventos de tareas no fijas pueden editarse libremente:
                  </div>
                  <ul className="text-xs text-muted-foreground space-y-1 ml-4">
                    <li>• <strong>Arrastrar:</strong> Mueve el evento a otro horario/día</li>
                    <li>• <strong>Click:</strong> Abre el modal y edita fecha/hora exacta</li>
                    <li>• <strong>Eliminar:</strong> Quita el evento del calendario (no elimina la ocurrencia)</li>
                  </ul>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3 rounded-lg bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800">
                <AlertTriangle className="h-5 w-5 text-red-600 dark:text-red-500 mt-0.5 shrink-0" />
                <div>
                  <div className="font-medium text-sm">Eventos Fijos (🔒)</div>
                  <div className="text-xs text-muted-foreground">
                    Los eventos de tareas "Única fija" o "Única repetitiva+" son inmutables. 
                    NO pueden arrastrarse, editarse o eliminarse. Solo pueden completarse o saltarse.
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div>
            <h4 className="font-semibold mb-3">Modal de Eventos</h4>
            <p className="text-sm text-muted-foreground mb-3">
              Al hacer clic en un evento se abre un modal que muestra:
            </p>
            <ul className="space-y-2 text-sm text-muted-foreground ml-4">
              <li>• <strong>Información de la tarea:</strong> Nombre, descripción, tipo, importancia</li>
              <li>• <strong>Información de la ocurrencia:</strong> Fechas objetivo y límite, estado</li>
              <li>• <strong>Horario del evento:</strong> Fecha, hora de inicio y fin (editable si no es fijo)</li>
              <li>• <strong>Contexto:</strong> Notas adicionales sobre el agendamiento</li>
              <li>• <strong>Acciones:</strong> Completar, saltar o eliminar el evento</li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold mb-3">Completar y Saltear Eventos</h4>
            <div className="space-y-3">
              <div className="p-3 rounded-lg bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-800">
                <Badge className="mb-2 bg-green-600 dark:bg-green-700">Completar Evento</Badge>
                <p className="text-xs text-muted-foreground mb-2">
                  Marca el evento como completado. Opcionalmente:
                </p>
                <ul className="text-xs text-muted-foreground space-y-1 ml-4">
                  <li>• Registra el tiempo dedicado (en horas)</li>
                  <li>• Marca también la ocurrencia como completada (checkbox)</li>
                  <li>• Ajusta fecha y hora de finalización real</li>
                </ul>
              </div>

              <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-950/20 border border-slate-200 dark:border-slate-700">
                <Badge className="mb-2 bg-slate-600 dark:bg-slate-700">Saltear Evento</Badge>
                <p className="text-xs text-muted-foreground">
                  Marca el evento como saltado cuando decides no realizarlo. 
                  Opcionalmente puedes marcar la ocurrencia también como saltada.
                </p>
              </div>
            </div>
            <HelpTip title="¿Cuándo completar el evento?">
              Solo puedes completar o saltear eventos que <strong>ya iniciaron</strong> (hora de inicio en el pasado). 
              Los eventos futuros no pueden marcarse como completados.
            </HelpTip>
          </div>

          <div>
            <h4 className="font-semibold mb-3 flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-orange-600" />
              Eventos Superpuestos
            </h4>
            <div className="p-3 rounded-lg bg-orange-50 dark:bg-orange-950/20 border border-orange-200 dark:border-orange-800">
              <p className="text-xs text-muted-foreground mb-2">
                Cuando varios eventos coinciden en el mismo horario, se muestran como un 
                <strong> indicador especial</strong> que dice "X eventos":
              </p>
              <ul className="text-xs text-muted-foreground space-y-1 ml-4">
                <li>• <strong>Click en el indicador:</strong> Abre un modal con lista de todos los eventos</li>
                <li>• <strong>Vista de lista:</strong> Muestra nombre, horario y tipo de cada evento</li>
                <li>• <strong>Seleccionar evento:</strong> Click en cualquiera abre su modal de detalles</li>
              </ul>
            </div>
          </div>

          <div>
            <h4 className="font-semibold mb-3">Navegación</h4>
            <p className="text-sm text-muted-foreground">
              Usa las flechas ← → para avanzar/retroceder (día/semana/mes según la vista). 
              El botón "Hoy" te lleva a la fecha actual. Cambia de vista usando los botones Día/Semana/Mes.
            </p>
          </div>

          <HelpTip title="Colores en el calendario">
            Cada evento tiene un borde de color según el <strong>tipo de tarea</strong>. 
            Los eventos completados se muestran con opacidad reducida y un tachado visual.
          </HelpTip>
        </CardContent>
      </Card>
    </div>
  )
}
