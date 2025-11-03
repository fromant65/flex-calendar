import { useState, useEffect } from "react"
import { Info } from "lucide-react"
import { Label } from "~/components/ui/label"
import { Input } from "~/components/ui/input"
import { DaySelector } from "./day-selector"
import { validateAndParseDaysOfMonth } from "~/lib/recurrence-utils"

type RecurrencePattern = "days-of-week" | "days-of-month"

interface FiniteRecurrenceProps {
  maxOccurrences: number | undefined
  daysOfWeek: string[]
  daysOfMonth: number[]
  endDate: string | undefined
  onMaxOccurrencesChange: (value: number | undefined) => void
  onDaysOfWeekChange: (days: string[]) => void
  onDaysOfMonthChange: (days: number[]) => void
  onEndDateChange: (value: string) => void
}

export function FiniteRecurrence({
  maxOccurrences,
  daysOfWeek,
  daysOfMonth,
  endDate,
  onMaxOccurrencesChange,
  onDaysOfWeekChange,
  onDaysOfMonthChange,
  onEndDateChange,
}: FiniteRecurrenceProps) {
  // Determine current pattern
  const getCurrentPattern = (): RecurrencePattern => {
    if (daysOfWeek.length > 0) return "days-of-week"
    return "days-of-month"
  }

  const [pattern, setPattern] = useState<RecurrencePattern>(getCurrentPattern())
  const [daysOfMonthInput, setDaysOfMonthInput] = useState("")

  const handlePatternChange = (newPattern: RecurrencePattern) => {
    setPattern(newPattern)
    // Clear conflicting fields
    if (newPattern === "days-of-week") {
      onDaysOfMonthChange([])
      setDaysOfMonthInput("")
    } else {
      onDaysOfWeekChange([])
    }
  }

  const toggleDayOfWeek = (day: string) => {
    onDaysOfWeekChange(
      daysOfWeek.includes(day) ? daysOfWeek.filter((d) => d !== day) : [...daysOfWeek, day]
    )
  }

  // Validate input when it changes
  const validation = validateAndParseDaysOfMonth(daysOfMonthInput)

  return (
    <div className="space-y-4 rounded-lg border border-border bg-muted/30 p-4">
      <div className="flex items-center gap-2 text-sm font-medium text-foreground">
        <Info className="h-4 w-4 text-primary" />
        Opciones de Recurrencia Finita
      </div>

      <div>
        <Label htmlFor="maxOccurrences" className="text-foreground">
          Número Total de Ocurrencias *
        </Label>
        <p className="text-xs text-muted-foreground mb-2">
          Cuántas veces se repetirá la tarea en total
        </p>
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

      {/* Pattern Selection */}
      <div>
        <Label className="text-foreground mb-3 block">
          Patrón de Repetición *
        </Label>
        <p className="text-xs text-muted-foreground mb-3">
          Elige UNO de los siguientes patrones (no puedes usar ambos):
        </p>
        <div className="space-y-2">
          <label className="flex items-start gap-3 rounded-lg border border-border p-3 cursor-pointer hover:bg-muted/50 transition-colors">
            <input
              type="radio"
              name="recurrence-pattern"
              value="days-of-week"
              checked={pattern === "days-of-week"}
              onChange={() => handlePatternChange("days-of-week")}
              className="mt-1"
            />
            <div className="flex-1">
              <div className="font-medium text-sm">Días de la Semana</div>
              <div className="text-xs text-muted-foreground">
                Se repite en días específicos de la semana (Lun, Mar, etc.)
              </div>
            </div>
          </label>

          <label className="flex items-start gap-3 rounded-lg border border-border p-3 cursor-pointer hover:bg-muted/50 transition-colors">
            <input
              type="radio"
              name="recurrence-pattern"
              value="days-of-month"
              checked={pattern === "days-of-month"}
              onChange={() => handlePatternChange("days-of-month")}
              className="mt-1"
            />
            <div className="flex-1">
              <div className="font-medium text-sm">Días del Mes</div>
              <div className="text-xs text-muted-foreground">
                Se repite en días específicos del mes (1-31)
              </div>
            </div>
          </label>
        </div>
      </div>

      {/* Pattern-specific fields */}
      {pattern === "days-of-week" && (
        <div>
          <Label className="text-foreground">Días de la Semana *</Label>
          <p className="text-xs text-muted-foreground mb-2">
            Selecciona los días en los que se repetirá la tarea
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
      )}

      {pattern === "days-of-month" && (
        <div>
          <Label htmlFor="daysOfMonth" className="text-foreground">
            Días del Mes *
          </Label>
          <p className="text-xs text-muted-foreground mb-2">
            Ingresa los días del mes separados por coma (1-31)
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
          {daysOfMonthInput.trim() === "" && (
            <p className="text-xs text-destructive mt-1">
              Debes ingresar al menos un día
            </p>
          )}
        </div>
      )}

      <div>
        <Label htmlFor="endDate" className="text-foreground">
          Fecha de Finalización (Opcional)
        </Label>
        <p className="text-xs text-muted-foreground mb-2">
          Fecha límite para generar ocurrencias
        </p>
        <Input
          id="endDate"
          type="date"
          value={endDate || ""}
          onChange={(e) => onEndDateChange(e.target.value)}
          className="mt-1.5 [color-scheme:light] dark:[color-scheme:dark]"
        />
      </div>
    </div>
  )
}
