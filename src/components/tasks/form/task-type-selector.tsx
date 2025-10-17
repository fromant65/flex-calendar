import { Calendar, Repeat, Target, Lock } from "lucide-react"
import { Label } from "~/components/ui/label"

export type FormTaskType = "unique" | "finite" | "habit" | "habit-plus" | "fixed-unique" | "fixed-repetitive"

interface TaskTypeSelectorProps {
  selectedType: FormTaskType
  onTypeChange: (type: FormTaskType) => void
}

const taskTypes = [
  { value: "unique" as FormTaskType, label: "Única", icon: Calendar, description: "Tarea de una sola vez" },
  { value: "finite" as FormTaskType, label: "Recurrente Finita", icon: Repeat, description: "Se repite N veces" },
  { value: "habit" as FormTaskType, label: "Hábito", icon: Target, description: "Se repite cada X días" },
  { value: "habit-plus" as FormTaskType, label: "Hábito +", icon: Target, description: "Hábito con opciones avanzadas" },
  { value: "fixed-unique" as FormTaskType, label: "Fija Única", icon: Lock, description: "Evento en fecha y hora específica" },
  { value: "fixed-repetitive" as FormTaskType, label: "Fija Repetitiva", icon: Lock, description: "Eventos fijos recurrentes" },
]

export function TaskTypeSelector({ selectedType, onTypeChange }: TaskTypeSelectorProps) {
  return (
    <div className="space-y-3">
      <Label className="text-foreground">Tipo de Tarea</Label>
      <div className="grid gap-2 sm:grid-cols-2">
        {taskTypes.map(({ value, label, icon: Icon, description }) => (
          <button
            key={value}
            type="button"
            onClick={() => onTypeChange(value)}
            className={`flex items-start gap-3 rounded-lg border p-3 text-left transition-all cursor-pointer ${
              selectedType === value
                ? "border-primary bg-primary/10 shadow-sm shadow-primary/20"
                : "border-border bg-card hover:border-primary/50 hover:bg-card/80"
            }`}
          >
            <div
              className={`rounded-lg p-2 ${
                selectedType === value ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
              }`}
            >
              <Icon className="h-4 w-4" />
            </div>
            <div className="flex-1">
              <div className="font-semibold text-foreground">{label}</div>
              <div className="text-xs text-muted-foreground">{description}</div>
            </div>
          </button>
        ))}
      </div>
    </div>
  )
}
