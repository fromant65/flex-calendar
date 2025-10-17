/**
 * Timeline Modals Component
 */

import { Dialog, DialogContent } from "~/components/ui/dialog"
import type { OccurrenceWithTask, EventWithDetails } from "~/types"

interface TimelineModalsProps {
  selectedOccurrence: OccurrenceWithTask | null
  selectedEvent: EventWithDetails | null
  onOccurrenceClose: () => void
  onEventClose: () => void
}

export function TimelineModals({
  selectedOccurrence,
  selectedEvent,
  onOccurrenceClose,
  onEventClose,
}: TimelineModalsProps) {
  return (
    <>
      {/* Occurrence Details Modal */}
      <Dialog open={!!selectedOccurrence} onOpenChange={(open) => !open && onOccurrenceClose()}>
        <DialogContent className="max-w-md">
          {selectedOccurrence && (
            <div className="space-y-4">
              <div>
                <h2 className="text-xl font-bold mb-2">Detalles de la Ocurrencia</h2>
                <div className="grid gap-2 text-sm">
                  <div>
                    <span className="font-medium">ID:</span> {selectedOccurrence.id}
                  </div>
                  <div>
                    <span className="font-medium">Tarea:</span> {selectedOccurrence.task.name}
                  </div>
                  <div>
                    <span className="font-medium">Fecha de Inicio:</span>{" "}
                    {new Date(selectedOccurrence.startDate).toLocaleString("es-ES")}
                  </div>
                  <div>
                    <span className="font-medium">Estado:</span> {selectedOccurrence.status}
                  </div>
                  {selectedOccurrence.completedAt && (
                    <div>
                      <span className="font-medium">Completada el:</span>{" "}
                      {new Date(selectedOccurrence.completedAt).toLocaleString("es-ES")}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Event Details Modal */}
      <Dialog open={!!selectedEvent} onOpenChange={(open) => !open && onEventClose()}>
        <DialogContent className="max-w-md">
          {selectedEvent && (
            <div className="space-y-4">
              <div>
                <h2 className="text-xl font-bold mb-2">Detalles del Evento</h2>
                <div className="grid gap-2 text-sm">
                  <div>
                    <span className="font-medium">ID:</span> {selectedEvent.id}
                  </div>
                  <div>
                    <span className="font-medium">Contexto:</span> {selectedEvent.context || "N/A"}
                  </div>
                  <div>
                    <span className="font-medium">Inicio:</span>{" "}
                    {new Date(selectedEvent.start).toLocaleString("es-ES")}
                  </div>
                  <div>
                    <span className="font-medium">Fin:</span>{" "}
                    {new Date(selectedEvent.finish).toLocaleString("es-ES")}
                  </div>
                  <div>
                    <span className="font-medium">Completado:</span>{" "}
                    {selectedEvent.isCompleted ? "Sí" : "No"}
                  </div>
                  {selectedEvent.completedAt && (
                    <div>
                      <span className="font-medium">Completado el:</span>{" "}
                      {new Date(selectedEvent.completedAt).toLocaleString("es-ES")}
                    </div>
                  )}
                  {selectedEvent.occurrence && (
                    <div className="border-t pt-2 mt-2">
                      <div className="font-medium mb-1">Ocurrencia Asociada:</div>
                      <div className="text-xs space-y-1 pl-2">
                        <div>ID: {selectedEvent.occurrence.id}</div>
                        <div>Tarea: {selectedEvent.occurrence.task.name}</div>
                        <div>
                          Inicio: {new Date(selectedEvent.occurrence.startDate).toLocaleString("es-ES")}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  )
}
