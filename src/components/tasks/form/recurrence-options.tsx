import { Info, ChevronDown, ChevronUp } from "lucide-react"
import { Label } from "~/components/ui/label"
import { Input } from "~/components/ui/input"
import { DaySelector } from "./day-selector"
import type { FormTaskType } from "./task-type-selector"

interface RecurrenceOptionsProps {
  taskType: FormTaskType
  interval: number
  maxOccurrences: number | undefined
  daysOfWeek: string[]
  daysOfMonth: number[]
  endDate: string | undefined
  showAdvanced: boolean
  onIntervalChange: (value: number) => void
  onMaxOccurrencesChange: (value: number | undefined) => void
  onDaysOfWeekChange: (days: string[]) => void
  onDaysOfMonthChange: (days: number[]) => void
  onEndDateChange: (value: string) => void
  onToggleAdvanced: () => void
}

export function RecurrenceOptions({
  taskType,
  interval,
  maxOccurrences,
  daysOfWeek,
  daysOfMonth,
  endDate,
  showAdvanced,
  onIntervalChange,
  onMaxOccurrencesChange,
  onDaysOfWeekChange,
  onDaysOfMonthChange,
  onEndDateChange,
  onToggleAdvanced,
}: RecurrenceOptionsProps) {
  const toggleDayOfWeek = (day: string) => {
    onDaysOfWeekChange(
      daysOfWeek.includes(day) ? daysOfWeek.filter((d) => d !== day) : [...daysOfWeek, day]
    )
  }

  return (
    <div className="space-y-4 rounded-lg border border-border bg-muted/30 p-4">
      <div className="flex items-center gap-2 text-sm font-medium text-foreground">
        <Info className="h-4 w-4 text-primary" />
        Opciones de Recurrencia
      </div>

      {taskType === "finite" && (
        <>
          <div>
            <Label htmlFor="maxOccurrences" className="text-foreground">
              Número de Ocurrencias
            </Label>
            <Input
              id="maxOccurrences"
              type="number"
              min="1"
              value={maxOccurrences || ""}
              onChange={(e) => onMaxOccurrencesChange(Number.parseInt(e.target.value))}
              placeholder="Ej: 10"
              className="mt-1.5"
            />
          </div>

          <div>
            <Label className="text-foreground">Días de la Semana (Opcional)</Label>
            <div className="mt-2">
              <DaySelector selectedDays={daysOfWeek} onToggleDay={toggleDayOfWeek} />
            </div>
          </div>

          <div>
            <Label htmlFor="daysOfMonth" className="text-foreground">
              Días del Mes (separados por coma, opcional)
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

          <div>
            <Label htmlFor="endDate" className="text-foreground">
              Fecha de Finalización (Opcional)
            </Label>
            <Input
              id="endDate"
              type="date"
              value={endDate || ""}
              onChange={(e) => onEndDateChange(e.target.value)}
              className="mt-1.5 [color-scheme:light] dark:[color-scheme:dark]"
            />
          </div>
        </>
      )}

      {(taskType === "habit" || taskType === "habit-plus") && (
        <>
          <div>
            <Label htmlFor="interval" className="text-foreground">
              Intervalo (días)
            </Label>
            <Input
              id="interval"
              type="number"
              min="1"
              value={interval}
              onChange={(e) => onIntervalChange(Number.parseInt(e.target.value))}
              className="mt-1.5"
            />
          </div>

          {taskType === "habit-plus" && (
            <>
              <div>
                <Label htmlFor="maxOccurrences" className="text-foreground">
                  Ocurrencias por Periodo
                </Label>
                <Input
                  id="maxOccurrences"
                  type="number"
                  min="1"
                  value={maxOccurrences || ""}
                  onChange={(e) =>
                    onMaxOccurrencesChange(Number.parseInt(e.target.value) || undefined)
                  }
                  placeholder="Ej: 3 veces por periodo"
                  className="mt-1.5"
                />
              </div>

              <button
                type="button"
                onClick={onToggleAdvanced}
                className="flex items-center gap-2 text-sm font-medium text-primary hover:underline"
              >
                {showAdvanced ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                Opciones Avanzadas
              </button>

              {showAdvanced && (
                <div className="space-y-4 rounded-lg border border-border bg-card/50 p-4">
                  <div>
                    <Label className="text-foreground">Días de la Semana</Label>
                    <div className="mt-2">
                      <DaySelector selectedDays={daysOfWeek} onToggleDay={toggleDayOfWeek} />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="daysOfMonth" className="text-foreground">
                      Días del Mes (separados por coma)
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

                  <div>
                    <Label htmlFor="endDate" className="text-foreground">
                      Fecha de Fin
                    </Label>
                    <Input
                      id="endDate"
                      type="date"
                      value={endDate || ""}
                      onChange={(e) => onEndDateChange(e.target.value)}
                      className="mt-1.5 [color-scheme:light] dark:[color-scheme:dark]"
                    />
                  </div>
                </div>
              )}
            </>
          )}
        </>
      )}
    </div>
  )
}
