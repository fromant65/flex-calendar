import { Lock } from "lucide-react"
import { Label } from "~/components/ui/label"
import { Input } from "~/components/ui/input"

interface FixedUniqueFormProps {
  fixedDate: string | undefined
  fixedStartTime: string
  fixedEndTime: string
  onFixedDateChange: (value: string) => void
  onFixedStartTimeChange: (value: string) => void
  onFixedEndTimeChange: (value: string) => void
}

export function FixedUniqueForm({
  fixedDate,
  fixedStartTime,
  fixedEndTime,
  onFixedDateChange,
  onFixedStartTimeChange,
  onFixedEndTimeChange,
}: FixedUniqueFormProps) {
  return (
    <div className="space-y-3 rounded-lg border border-blue-200 dark:border-blue-900 bg-blue-50/50 dark:bg-blue-950/30 p-4">
      <div className="flex items-center gap-2 text-sm font-medium text-blue-700 dark:text-blue-300">
        <Lock className="h-4 w-4" />
        Evento Fijo Único
      </div>
      <div>
        <Label htmlFor="fixedDate" className="text-foreground">
          Fecha *
        </Label>
        <Input
          id="fixedDate"
          type="date"
          value={fixedDate || ""}
          onChange={(e) => onFixedDateChange(e.target.value)}
          required
          className="mt-1.5 [color-scheme:light] dark:[color-scheme:dark]"
        />
      </div>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <div>
          <Label htmlFor="fixedStartTime" className="text-foreground">
            Hora de Inicio *
          </Label>
          <Input
            id="fixedStartTime"
            type="time"
            value={fixedStartTime}
            onChange={(e) => onFixedStartTimeChange(e.target.value)}
            required
            className="mt-1.5 [color-scheme:light] dark:[color-scheme:dark]"
          />
        </div>
        <div>
          <Label htmlFor="fixedEndTime" className="text-foreground">
            Hora de Fin *
          </Label>
          <Input
            id="fixedEndTime"
            type="time"
            value={fixedEndTime}
            onChange={(e) => onFixedEndTimeChange(e.target.value)}
            required
            className="mt-1.5 [color-scheme:light] dark:[color-scheme:dark]"
          />
        </div>
      </div>
      <p className="text-xs text-blue-600 dark:text-blue-400">
        Se creará un evento automáticamente en el calendario en la fecha y horario especificados
      </p>
    </div>
  )
}
