"use client"

import { Input } from "~/components/ui/input"

interface DateRangeFilterProps {
  startDate: Date | null
  endDate: Date | null
  onStartDateChange: (date: Date | null) => void
  onEndDateChange: (date: Date | null) => void
}

export function DateRangeFilter({
  startDate,
  endDate,
  onStartDateChange,
  onEndDateChange,
}: DateRangeFilterProps) {
  // Format dates for input value (YYYY-MM-DD)
  const formatDateForInput = (date: Date | null) => {
    if (!date) return ""
    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, "0")
    const day = String(date.getDate()).padStart(2, "0")
    return `${year}-${month}-${day}`
  }

  const handleStartDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newDate = e.target.value ? new Date(e.target.value) : null
    if (newDate && !isNaN(newDate.getTime())) {
      newDate.setHours(0, 0, 0, 0)
      onStartDateChange(newDate)
    } else if (!e.target.value) {
      onStartDateChange(null)
    }
  }

  const handleEndDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newDate = e.target.value ? new Date(e.target.value) : null
    if (newDate && !isNaN(newDate.getTime())) {
      newDate.setHours(23, 59, 59, 999)
      onEndDateChange(newDate)
    } else if (!e.target.value) {
      onEndDateChange(null)
    }
  }

  return (
    <div className="flex flex-col sm:flex-row gap-2">
      <div className="flex flex-col gap-1 flex-1">
        <label htmlFor="start-date" className="text-xs text-muted-foreground">
          Desde
        </label>
        <Input
          id="start-date"
          type="date"
          value={formatDateForInput(startDate)}
          onChange={handleStartDateChange}
          className="h-8 text-xs"
        />
      </div>
      <div className="flex flex-col gap-1 flex-1">
        <label htmlFor="end-date" className="text-xs text-muted-foreground">
          Hasta
        </label>
        <Input
          id="end-date"
          type="date"
          value={formatDateForInput(endDate)}
          onChange={handleEndDateChange}
          className="h-8 text-xs"
        />
      </div>
    </div>
  )
}
