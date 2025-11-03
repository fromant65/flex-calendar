import { useState } from "react"
import { Lock, AlertCircle } from "lucide-react"
import { Label } from "~/components/ui/label"
import { Input } from "~/components/ui/input"
import { Alert, AlertDescription } from "~/components/ui/alert"
import { DaySelector } from "./day-selector"
import { validateAndParseDaysOfMonth } from "~/lib/recurrence-utils"

type RecurrencePattern = "days-of-week" | "days-of-month"

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
  validationError?: string | null
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
  validationError,
}: FixedRepetitiveFormProps) {
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
    <div className="space-y-4 rounded-lg border border-blue-200 dark:border-blue-900 bg-blue-50/50 dark:bg-blue-950/30 p-4">
      <div className="flex items-center gap-2 text-sm font-medium text-blue-700 dark:text-blue-300">
        <Lock className="h-4 w-4" />
        Eventos Fijos Repetitivos
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
          <label className="flex items-start gap-3 rounded-lg border border-blue-300 dark:border-blue-800 p-3 cursor-pointer hover:bg-blue-100/50 dark:hover:bg-blue-900/30 transition-colors">
            <input
              type="radio"
              name="fixed-pattern"
              value="days-of-week"
              checked={pattern === "days-of-week"}
              onChange={() => handlePatternChange("days-of-week")}
              className="mt-1"
            />
            <div className="flex-1">
              <div className="font-medium text-sm">Días de la Semana</div>
              <div className="text-xs text-muted-foreground">
                Eventos en días específicos de la semana
              </div>
            </div>
          </label>

          <label className="flex items-start gap-3 rounded-lg border border-blue-300 dark:border-blue-800 p-3 cursor-pointer hover:bg-blue-100/50 dark:hover:bg-blue-900/30 transition-colors">
            <input
              type="radio"
              name="fixed-pattern"
              value="days-of-month"
              checked={pattern === "days-of-month"}
              onChange={() => handlePatternChange("days-of-month")}
              className="mt-1"
            />
            <div className="flex-1">
              <div className="font-medium text-sm">Días del Mes</div>
              <div className="text-xs text-muted-foreground">
                Eventos en días específicos del mes (1-31)
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
            Selecciona los días en los que se crearán eventos
          </p>
          <div className="mt-2">
            <DaySelector selectedDays={daysOfWeek} onToggleDay={toggleDayOfWeek} variant="blue" />
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

      {/* Validation Error Alert */}
      {validationError && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{validationError}</AlertDescription>
        </Alert>
      )}

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
