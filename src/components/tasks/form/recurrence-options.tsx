import { Info, ChevronDown, ChevronUp } from "lucide-react"
import { useState, useEffect } from "react"
import { Label } from "~/components/ui/label"
import { Input } from "~/components/ui/input"
import { DaySelector } from "./day-selector"
import { validateAndParseDaysOfMonth } from "~/lib/recurrence-utils"
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
  // Local state for raw input values
  const [daysOfMonthInput, setDaysOfMonthInput] = useState("")
  const [daysOfMonthInputAdvanced, setDaysOfMonthInputAdvanced] = useState("")

  const toggleDayOfWeek = (day: string) => {
    onDaysOfWeekChange(
      daysOfWeek.includes(day) ? daysOfWeek.filter((d) => d !== day) : [...daysOfWeek, day]
    )
  }

  // Validate inputs
  const validation = validateAndParseDaysOfMonth(daysOfMonthInput)
  const validationAdvanced = validateAndParseDaysOfMonth(daysOfMonthInputAdvanced)

  return (
    <div className="space-y-4 rounded-lg border border-border bg-muted/30 p-4">
      <div className="flex items-center gap-2 text-sm font-medium text-foreground">
        <Info className="h-4 w-4 text-primary" />
        Opciones de Recurrencia
      </div>

      {taskType === "finite" && (
        <>
          <div className="rounded-md bg-blue-50 dark:bg-blue-950/30 p-3 text-sm text-blue-900 dark:text-blue-200">
            <strong>Nota:</strong> Usa solo UNO de los siguientes patrones: días de la semana O días del mes (no ambos).
          </div>

          <div>
            <Label htmlFor="maxOccurrences" className="text-foreground">
              Número de Ocurrencias *
            </Label>
            <Input
              id="maxOccurrences"
              type="number"
              min="1"
              value={maxOccurrences || ""}
              onChange={(e) => onMaxOccurrencesChange(Number.parseInt(e.target.value))}
              placeholder="Ej: 10"
              className="mt-1.5"
              required
            />
          </div>

          <div>
            <Label className="text-foreground">Días de la Semana (Opcional)</Label>
            <p className="text-xs text-muted-foreground mb-2">
              Selecciona días específicos de la semana
            </p>
            <div className="mt-2">
              <DaySelector 
                selectedDays={daysOfWeek} 
                onToggleDay={(day) => {
                  // Clear daysOfMonth when selecting daysOfWeek
                  if (daysOfMonth.length > 0) {
                    onDaysOfMonthChange([]);
                  }
                  toggleDayOfWeek(day);
                }} 
              />
            </div>
          </div>

          <div>
            <Label htmlFor="daysOfMonth" className="text-foreground">
              Días del Mes (separados por coma, opcional)
            </Label>
            <p className="text-xs text-muted-foreground mb-2">
              Ej: 1, 15, 30 para el 1, 15 y 30 de cada mes
            </p>
            <Input
              id="daysOfMonth"
              type="text"
              value={daysOfMonthInput}
              onChange={(e) => {
                const inputValue = e.target.value
                setDaysOfMonthInput(inputValue)
                // Update parent state with parsed days if valid
                const result = validateAndParseDaysOfMonth(inputValue)
                if (result.isValid) {
                  // Clear daysOfWeek when entering daysOfMonth
                  if (daysOfWeek.length > 0) {
                    onDaysOfWeekChange([]);
                  }
                  onDaysOfMonthChange(result.parsedDays)
                } else {
                  onDaysOfMonthChange([])
                }
              }}
              placeholder="Ej: 1, 15, 30"
              className="mt-1.5"
            />
            {!validation.isValid && daysOfMonthInput.trim() !== "" && (
              <p className="text-xs text-destructive mt-1">
                {validation.errorMessage}
              </p>
            )}
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
              Intervalo (días) *
            </Label>
            <p className="text-xs text-muted-foreground mb-2">
              Duración del período en días
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

          {taskType === "habit-plus" && (
            <>
              <div className="rounded-md bg-blue-50 dark:bg-blue-950/30 p-3 text-sm text-blue-900 dark:text-blue-200">
                <strong>Hábito+ permite tres modos:</strong>
                <ol className="list-decimal ml-5 mt-2 space-y-1">
                  <li><strong>Solo intervalo:</strong> N ocurrencias cada X días</li>
                  <li><strong>Intervalo + días de semana:</strong> Ocurrencias en días específicos de la semana</li>
                  <li><strong>Intervalo + días del mes:</strong> Ocurrencias en días específicos del mes</li>
                </ol>
                <p className="mt-2 text-xs">⚠️ No puedes combinar días de semana Y días del mes</p>
              </div>

              <div>
                <Label htmlFor="maxOccurrences" className="text-foreground">
                  Ocurrencias por Periodo
                </Label>
                <p className="text-xs text-muted-foreground mb-2">
                  Cuántas veces debe completarse por período
                </p>
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
                Configuración de Días Específicos
              </button>

              {showAdvanced && (
                <div className="space-y-4 rounded-lg border border-border bg-card/50 p-4">
                  <div>
                    <Label className="text-foreground">Días de la Semana</Label>
                    <p className="text-xs text-muted-foreground mb-2">
                      Selecciona días específicos para las ocurrencias
                    </p>
                    <div className="mt-2">
                      <DaySelector 
                        selectedDays={daysOfWeek} 
                        onToggleDay={(day) => {
                          // Clear daysOfMonth when selecting daysOfWeek
                          if (daysOfMonth.length > 0) {
                            onDaysOfMonthChange([]);
                          }
                          toggleDayOfWeek(day);
                        }} 
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="daysOfMonth" className="text-foreground">
                      Días del Mes (separados por coma)
                    </Label>
                    <p className="text-xs text-muted-foreground mb-2">
                      Ej: 1, 15, 30 para el 1, 15 y 30 de cada mes
                    </p>
                    <Input
                      id="daysOfMonth"
                      type="text"
                      value={daysOfMonthInputAdvanced}
                      onChange={(e) => {
                        const inputValue = e.target.value
                        setDaysOfMonthInputAdvanced(inputValue)
                        // Update parent state with parsed days if valid
                        const result = validateAndParseDaysOfMonth(inputValue)
                        if (result.isValid) {
                          // Clear daysOfWeek when entering daysOfMonth
                          if (daysOfWeek.length > 0) {
                            onDaysOfWeekChange([]);
                          }
                          onDaysOfMonthChange(result.parsedDays)
                        } else {
                          onDaysOfMonthChange([])
                        }
                      }}
                      placeholder="Ej: 1, 15, 30"
                      className="mt-1.5"
                    />
                    {!validationAdvanced.isValid && daysOfMonthInputAdvanced.trim() !== "" && (
                      <p className="text-xs text-destructive mt-1">
                        {validationAdvanced.errorMessage}
                      </p>
                    )}
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
