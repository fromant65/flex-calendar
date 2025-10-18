interface DaySelectorProps {
  selectedDays: string[]
  onToggleDay: (day: string) => void
  variant?: "default" | "blue"
}

const daysOfWeek = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]
const dayLabels: Record<string, string> = {
  Mon: "Lu",
  Tue: "Ma",
  Wed: "Mi",
  Thu: "Ju",
  Fri: "Vi",
  Sat: "Sa",
  Sun: "Do",
}

export function DaySelector({ selectedDays, onToggleDay, variant = "default" }: DaySelectorProps) {
  const isBlue = variant === "blue"

  return (
    <div className="flex w-full gap-1 sm:gap-2">
      {daysOfWeek.map((day) => (
        <button
          key={day}
          type="button"
          onClick={() => onToggleDay(day)}
          className={`flex h-9 flex-1 items-center justify-center rounded-full border text-xs font-medium transition-all sm:h-10 sm:w-10 sm:flex-none sm:text-sm ${
            selectedDays.includes(day)
              ? isBlue
                ? "border-blue-500 bg-blue-500 text-white shadow-sm"
                : "border-primary bg-primary text-primary-foreground shadow-sm shadow-primary/20"
              : isBlue
                ? "border-border bg-background text-muted-foreground hover:border-blue-300 hover:bg-blue-50 dark:hover:bg-blue-950"
                : "border-border bg-background text-muted-foreground hover:border-primary/50 hover:bg-muted"
          }`}
        >
          {dayLabels[day]}
        </button>
      ))}
    </div>
  )
}
