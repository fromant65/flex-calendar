import { Label } from "~/components/ui/label"
import { Input } from "~/components/ui/input"

interface TargetLimitDatesProps {
  targetDate: string | undefined
  limitDate: string | undefined
  onTargetDateChange: (value: string) => void
  onLimitDateChange: (value: string) => void
}

export function TargetLimitDates({
  targetDate,
  limitDate,
  onTargetDateChange,
  onLimitDateChange,
}: TargetLimitDatesProps) {
  return (
    <div className="mt-4 grid grid-cols-2 gap-3">
      <div>
        <Label htmlFor="targetDate" className="text-foreground">
          Fecha objetivo (Opcional)
        </Label>
        <Input
          id="targetDate"
          type="date"
          value={targetDate || ""}
          onChange={(e) => onTargetDateChange(e.target.value)}
          className="mt-1.5 [color-scheme:light] dark:[color-scheme:dark] cursor-text"
        />
      </div>

      <div>
        <Label htmlFor="limitDate" className="text-foreground">
          Fecha límite (Opcional)
        </Label>
        <Input
          id="limitDate"
          type="date"
          value={limitDate || ""}
          onChange={(e) => onLimitDateChange(e.target.value)}
          className="mt-1.5 [color-scheme:light] dark:[color-scheme:dark] cursor-text"
        />
      </div>
    </div>
  )
}
