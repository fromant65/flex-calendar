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
                <h2 className="text-xl font-bold mb-2">Occurrence Details</h2>
                <div className="grid gap-2 text-sm">
                  <div>
                    <span className="font-medium">ID:</span> {selectedOccurrence.id}
                  </div>
                  <div>
                    <span className="font-medium">Task:</span> {selectedOccurrence.task.name}
                  </div>
                  <div>
                    <span className="font-medium">Start Date:</span>{" "}
                    {new Date(selectedOccurrence.startDate).toLocaleString()}
                  </div>
                  <div>
                    <span className="font-medium">Status:</span> {selectedOccurrence.status}
                  </div>
                  {selectedOccurrence.completedAt && (
                    <div>
                      <span className="font-medium">Completed At:</span>{" "}
                      {new Date(selectedOccurrence.completedAt).toLocaleString()}
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
                <h2 className="text-xl font-bold mb-2">Event Details</h2>
                <div className="grid gap-2 text-sm">
                  <div>
                    <span className="font-medium">ID:</span> {selectedEvent.id}
                  </div>
                  <div>
                    <span className="font-medium">Context:</span> {selectedEvent.context || "N/A"}
                  </div>
                  <div>
                    <span className="font-medium">Start:</span>{" "}
                    {new Date(selectedEvent.start).toLocaleString()}
                  </div>
                  <div>
                    <span className="font-medium">Finish:</span>{" "}
                    {new Date(selectedEvent.finish).toLocaleString()}
                  </div>
                  <div>
                    <span className="font-medium">Is Completed:</span>{" "}
                    {selectedEvent.isCompleted ? "Yes" : "No"}
                  </div>
                  {selectedEvent.completedAt && (
                    <div>
                      <span className="font-medium">Completed At:</span>{" "}
                      {new Date(selectedEvent.completedAt).toLocaleString()}
                    </div>
                  )}
                  {selectedEvent.occurrence && (
                    <div className="border-t pt-2 mt-2">
                      <div className="font-medium mb-1">Associated Occurrence:</div>
                      <div className="text-xs space-y-1 pl-2">
                        <div>ID: {selectedEvent.occurrence.id}</div>
                        <div>Task: {selectedEvent.occurrence.task.name}</div>
                        <div>
                          Start: {new Date(selectedEvent.occurrence.startDate).toLocaleString()}
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
