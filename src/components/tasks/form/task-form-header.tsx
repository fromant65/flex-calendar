import { DialogDescription, DialogHeader, DialogTitle } from "~/components/ui/dialog"
import HelpTip from "~/components/ui/help-tip"

interface TaskFormHeaderProps {
  isEditing: boolean
  isDuplicating: boolean
}

export function TaskFormHeader({ isEditing, isDuplicating }: TaskFormHeaderProps) {
  return (
    <DialogHeader>
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1">
          <DialogTitle className="text-2xl">
            {isEditing ? "Editar Tarea" : isDuplicating ? "Duplicar Tarea" : "Crear Nueva Tarea"}
          </DialogTitle>
          <DialogDescription>
            {isEditing
              ? "Modifica los detalles de tu tarea"
              : isDuplicating
              ? "Crea una nueva tarea basada en la tarea seleccionada"
              : "Completa los campos para crear una nueva tarea o hábito"}
          </DialogDescription>
        </div>
        <HelpTip title="Tipos de tarea" side="bottom">
          <p className="mb-1">
            Única: una sola ocurrencia. <br />
            Recurrente (Finita): se repite según intervalo/días, una cantidad definida de veces. <br />
            Hábito: una ocurrencia por periodo. <br />
            Hábito +: una o más ocurrencias por periodo, con la capacidad de definir días específicos de ocurrencia. <br />
            Fija Única: asigna hora y/o fecha fijas para una única ocurrencia. <br />
            Fija Repetitiva: asigna hora fija y días específicos para una cantidad definida de ocurrencias.
          </p>
          <p className="text-xs text-muted-foreground">
            El tipo determina qué campos adicionales aparecen en este formulario (fechas, recurrencia, horarios fijos).
          </p>
        </HelpTip>
      </div>
    </DialogHeader>
  )
}
