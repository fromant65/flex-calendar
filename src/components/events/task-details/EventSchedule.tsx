"use client"

import { Calendar, Clock, Edit2, Save, X, Lock } from "lucide-react"
import { Button } from "~/components/ui/button"
import { Input } from "~/components/ui/input"
import { Label } from "~/components/ui/label"
import { LoadingSpinner } from "~/components/ui/loading-spinner"
import type { EventWithDetails } from "~/types"

interface EventScheduleProps {
  event: EventWithDetails;
  isEditing: boolean;
  startEditMode: () => void;
  cancelEdit: () => void;
  editDate: string;
  editStartTime: string;
  editEndTime: string;
  setEditDate: (value: string) => void;
  setEditStartTime: (value: string) => void;
  setEditEndTime: (value: string) => void;
  handleSaveEdit: () => void;
  updateEventMutation: {
    isPending?: boolean;
  };
}

export function EventSchedule({ event, isEditing, startEditMode, cancelEdit, editDate, editStartTime, editEndTime, setEditDate, setEditStartTime, setEditEndTime, handleSaveEdit, updateEventMutation }: EventScheduleProps) {
  return (
    <div className="border-t border-border pt-4 space-y-3">
      <div className="flex items-center justify-between">
        <h4 className="text-sm font-semibold text-foreground">Horario Programado</h4>
        {!event.isCompleted && !isEditing && !event.isFixed && (
          <Button variant="ghost" size="sm" onClick={startEditMode} className="hover:bg-accent">
            <Edit2 className="h-3.5 w-3.5" />
          </Button>
        )}

        {isEditing && (
          <div className="flex gap-1.5">
            <Button variant="ghost" size="sm" onClick={cancelEdit} disabled={updateEventMutation?.isPending} className="hover:bg-accent">
              <X className="h-3.5 w-3.5" />
            </Button>
            <Button variant="ghost" size="sm" onClick={handleSaveEdit} disabled={updateEventMutation?.isPending} className="hover:bg-accent">
              {updateEventMutation?.isPending ? <LoadingSpinner size="xs" /> : <Save className="h-3.5 w-3.5" />}
            </Button>
          </div>
        )}
      </div>

      {!isEditing ? (
        <>
          <div className="flex items-center gap-2.5 rounded-lg bg-muted/20 p-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-md bg-primary/10">
              <Calendar className="w-4 h-4 text-primary" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Fecha</p>
              <p className="text-sm font-semibold text-foreground">{new Date(event.start).toLocaleDateString("es-ES", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}</p>
            </div>
          </div>

          <div className="flex items-center gap-2.5 rounded-lg bg-muted/20 p-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-md bg-primary/10">
              <Clock className="w-4 h-4 text-primary" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Horario</p>
              <p className="text-sm font-semibold text-foreground">{new Date(event.start).toLocaleTimeString("es-ES", { hour: "numeric", minute: "2-digit" })} - {new Date(event.finish).toLocaleTimeString("es-ES", { hour: "numeric", minute: "2-digit" })}</p>
            </div>
          </div>
        </>
      ) : (
        <div className="space-y-3">
          <div className="space-y-1.5">
            <Label htmlFor="editDate" className="text-xs font-medium text-muted-foreground">Fecha</Label>
            <Input id="editDate" type="date" value={editDate} onChange={(e) => setEditDate(e.target.value)} className="bg-muted/20 border-border text-foreground" />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="editStartTime" className="text-xs font-medium text-muted-foreground">Hora de Inicio</Label>
              <Input id="editStartTime" type="time" value={editStartTime} onChange={(e) => setEditStartTime(e.target.value)} className="bg-muted/20 border-border text-foreground" />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="editEndTime" className="text-xs font-medium text-muted-foreground">Hora de Fin</Label>
              <Input id="editEndTime" type="time" value={editEndTime} onChange={(e) => setEditEndTime(e.target.value)} className="bg-muted/20 border-border text-foreground" />
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default EventSchedule
