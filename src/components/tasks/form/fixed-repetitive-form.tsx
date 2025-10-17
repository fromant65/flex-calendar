import { Lock } from "lucide-react"
import { Label } from "~/components/ui/label"
import { Input } from "~/components/ui/input"
import { DaySelector } from "./day-selector"

interface FixedRepetitiveFormProps {
  daysOfWeek: string[]
  daysOfMonth: number[]
  fixedStartTime: string
  fixedEndTime: string
  endDate: string | undefined
  onDaysOfWeekChange: (days: string[]) => void
  onDaysOfMonthChange: (days: number[]) => void
  onFixedStartTimeChange: (value: string) => void
  onFixedEndTimeChange: (value: string) => void
  onEndDateChange: (value: string) => void
}

export function FixedRepetitiveForm({
  daysOfWeek,
  daysOfMonth,
  fixedStartTime,
  fixedEndTime,
  endDate,
  onDaysOfWeekChange,
  onDaysOfMonthChange,
  onFixedStartTimeChange,
  onFixedEndTimeChange,
  onEndDateChange,
}: FixedRepetitiveFormProps) {
  const toggleDayOfWeek = (day: string) => {
    onDaysOfWeekChange(
      daysOfWeek.includes(day) ? daysOfWeek.filter((d) => d !== day) : [...daysOfWeek, day]
    )
  }

  return (
    <div className="space-y-4 rounded-lg border border-blue-200 dark:border-blue-900 bg-blue-50/50 dark:bg-blue-950/30 p-4">
      <div className="flex items-center gap-2 text-sm font-medium text-blue-700 dark:text-blue-300">
        <Lock className="h-4 w-4" />
        Eventos Fijos Repetitivos
      </div>

      <div>
        <Label className="text-foreground">Días de la Semana *</Label>
        <div className="mt-2">
          <DaySelector selectedDays={daysOfWeek} onToggleDay={toggleDayOfWeek} variant="blue" />
        </div>
      </div>

      <div>
        <Label htmlFor="daysOfMonth" className="text-foreground">
          Días del Mes (opcional, separados por coma)
        </Label>
        <Input
          id="daysOfMonth"
          value={daysOfMonth.join(", ")}
          onChange={(e) => {
            const days = e.target.value
              .split(",")
              .map((d) => Number.parseInt(d.trim()))
              .filter((d) => !isNaN(d) && d >= 1 && d <= 31)
            onDaysOfMonthChange(days)
          }}
          placeholder="Ej: 1, 15, 30"
          className="mt-1.5"
        />
      </div>

      <div className="grid grid-cols-2 gap-3">
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

      <div>
        <Label htmlFor="endDate" className="text-foreground">
          Fecha de Finalización <span className="text-destructive">*</span>
        </Label>
        <Input
          id="endDate"
          type="date"
          value={endDate || ""}
          onChange={(e) => onEndDateChange(e.target.value)}
          required
          className="mt-1.5 [color-scheme:light] dark:[color-scheme:dark]"
        />
        <p className="mt-1 text-xs text-muted-foreground">
          Requerida para evitar generar eventos infinitamente
        </p>
      </div>

      <p className="text-xs text-blue-600 dark:text-blue-400">
        Se crearán eventos automáticamente en los días seleccionados con los horarios especificados
      </p>
    </div>
  )
}
