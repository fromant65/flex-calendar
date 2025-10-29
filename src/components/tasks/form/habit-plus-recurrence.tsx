import { useState } from "react"
import { Info } from "lucide-react"
import { Label } from "~/components/ui/label"
import { Input } from "~/components/ui/input"
import { DaySelector } from "./day-selector"

type RecurrenceMode = "interval-only" | "days-of-week" | "days-of-month"

interface HabitPlusRecurrenceProps {
  interval: number
  maxOccurrences: number | undefined
  daysOfWeek: string[]
  daysOfMonth: number[]
  endDate: string | undefined
  onIntervalChange: (value: number) => void
  onMaxOccurrencesChange: (value: number | undefined) => void
  onDaysOfWeekChange: (days: string[]) => void
  onDaysOfMonthChange: (days: number[]) => void
  onEndDateChange: (value: string) => void
}

export function HabitPlusRecurrence({
  interval,
  maxOccurrences,
  daysOfWeek,
  daysOfMonth,
  endDate,
  onIntervalChange,
  onMaxOccurrencesChange,
  onDaysOfWeekChange,
  onDaysOfMonthChange,
  onEndDateChange,
}: HabitPlusRecurrenceProps) {
  // Determine current mode
  const getCurrentMode = (): RecurrenceMode => {
    if (daysOfWeek.length > 0) return "days-of-week"
    if (daysOfMonth.length > 0) return "days-of-month"
    return "interval-only"
  }

  const [mode, setMode] = useState<RecurrenceMode>(getCurrentMode())

  const handleModeChange = (newMode: RecurrenceMode) => {
    setMode(newMode)
    // Clear conflicting fields
    if (newMode === "interval-only") {
      onDaysOfWeekChange([])
      onDaysOfMonthChange([])
    } else if (newMode === "days-of-week") {
      onDaysOfMonthChange([])
      // Set default interval for days-of-week mode (weekly = 7 days)
      if (interval === 1 || !interval) {
        onIntervalChange(7)
      }
    } else if (newMode === "days-of-month") {
      onDaysOfWeekChange([])
      // Set default interval for days-of-month mode (monthly = 30 days)
      if (interval === 1 || interval === 7 || !interval) {
        onIntervalChange(30)
      }
    }
  }

  const toggleDayOfWeek = (day: string) => {
    onDaysOfWeekChange(
      daysOfWeek.includes(day) ? daysOfWeek.filter((d) => d !== day) : [...daysOfWeek, day]
    )
  }

  return (
    <div className="space-y-4 rounded-lg border border-border bg-muted/30 p-4">
      <div className="flex items-center gap-2 text-sm font-medium text-foreground">
        <Info className="h-4 w-4 text-primary" />
        Configuración de Hábito+
      </div>

      {/* Recurrence Mode Selection */}
      <div>
        <Label className="text-foreground mb-3 block">
          Tipo de Recurrencia *
        </Label>
        <div className="space-y-2">
          <label className="flex items-start gap-3 rounded-lg border border-border p-3 cursor-pointer hover:bg-muted/50 transition-colors">
            <input
              type="radio"
              name="recurrence-mode"
              value="interval-only"
              checked={mode === "interval-only"}
              onChange={() => handleModeChange("interval-only")}
              className="mt-1"
            />
            <div className="flex-1">
              <div className="font-medium text-sm">Intervalo Simple</div>
              <div className="text-xs text-muted-foreground">
                N ocurrencias cada X días
              </div>
            </div>
          </label>

          <label className="flex items-start gap-3 rounded-lg border border-border p-3 cursor-pointer hover:bg-muted/50 transition-colors">
            <input
              type="radio"
              name="recurrence-mode"
              value="days-of-week"
              checked={mode === "days-of-week"}
              onChange={() => handleModeChange("days-of-week")}
              className="mt-1"
            />
            <div className="flex-1">
              <div className="font-medium text-sm">Días de la Semana</div>
              <div className="text-xs text-muted-foreground">
                Ocurrencias en días específicos de la semana
              </div>
            </div>
          </label>

          <label className="flex items-start gap-3 rounded-lg border border-border p-3 cursor-pointer hover:bg-muted/50 transition-colors">
            <input
              type="radio"
              name="recurrence-mode"
              value="days-of-month"
              checked={mode === "days-of-month"}
              onChange={() => handleModeChange("days-of-month")}
              className="mt-1"
            />
            <div className="flex-1">
              <div className="font-medium text-sm">Días del Mes</div>
              <div className="text-xs text-muted-foreground">
                Ocurrencias en días específicos del mes (1-31)
              </div>
            </div>
          </label>
        </div>
      </div>

      {/* Mode-specific fields */}
      {mode === "interval-only" && (
        <>
          <div>
            <Label htmlFor="interval" className="text-foreground">
              Intervalo del Período (días) *
            </Label>
            <p className="text-xs text-muted-foreground mb-2">
              Duración del período de seguimiento
            </p>
            <Input
              id="interval"
              type="number"
              min="1"
              value={interval}
              onChange={(e) => onIntervalChange(Number.parseInt(e.target.value))}
              className="mt-1.5"
              required
            />
          </div>

          <div>
            <Label htmlFor="maxOccurrences" className="text-foreground">
              Ocurrencias por Período *
            </Label>
            <p className="text-xs text-muted-foreground mb-2">
              Cuántas veces debe completarse en cada período
            </p>
            <Input
              id="maxOccurrences"
              type="number"
              min="1"
              value={maxOccurrences || ""}
              onChange={(e) => onMaxOccurrencesChange(Number.parseInt(e.target.value) || undefined)}
              placeholder="Ej: 3"
              className="mt-1.5"
              required
            />
          </div>
        </>
      )}

      {mode === "days-of-week" && (
        <>
          <div className="rounded-md bg-blue-50 dark:bg-blue-950/30 p-3 text-sm text-blue-900 dark:text-blue-200">
            <strong>Modo Semanal:</strong> El período se establece automáticamente en 7 días. 
            Cada semana se espera que completes las ocurrencias en los días seleccionados.
          </div>
          <div>
            <Label className="text-foreground">Días de la Semana *</Label>
            <p className="text-xs text-muted-foreground mb-2">
              Selecciona los días en los que debe generarse una ocurrencia cada semana
            </p>
            <div className="mt-2">
              <DaySelector selectedDays={daysOfWeek} onToggleDay={toggleDayOfWeek} />
            </div>
            {daysOfWeek.length === 0 && (
              <p className="text-xs text-destructive mt-1">
                Debes seleccionar al menos un día
              </p>
            )}
          </div>
        </>
      )}

      {mode === "days-of-month" && (
        <>
          <div className="rounded-md bg-blue-50 dark:bg-blue-950/30 p-3 text-sm text-blue-900 dark:text-blue-200">
            <strong>Modo Mensual:</strong> El período se establece automáticamente en 30 días. 
            Cada mes se espera que completes las ocurrencias en los días seleccionados.
          </div>
          <div>
            <Label htmlFor="daysOfMonth" className="text-foreground">
              Días del Mes *
            </Label>
            <p className="text-xs text-muted-foreground mb-2">
              Ingresa los días del mes separados por coma (1-31)
            </p>
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
            {daysOfMonth.length === 0 && (
              <p className="text-xs text-destructive mt-1">
                Debes ingresar al menos un día
              </p>
            )}
          </div>
        </>
      )}
    </div>
  )
}
