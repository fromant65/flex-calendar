/**
 * Timeline Controls Component
 */

import { ChevronLeft, ChevronRight, Calendar } from "lucide-react"
import { Button } from "../ui/button"

export type NavigationInterval = "day" | "week" | "month" | "year"

interface TimelineControlsProps {
  navigationInterval: NavigationInterval
  setNavigationInterval: (interval: NavigationInterval) => void
  daysToShow: number
  setDaysToShow: (days: number) => void
  onPrevious: () => void
  onNext: () => void
  onToday: () => void
}

export function TimelineControls({
  navigationInterval,
  setNavigationInterval,
  daysToShow,
  setDaysToShow,
  onPrevious,
  onNext,
  onToday,
}: TimelineControlsProps) {
  return (
    <div className="flex items-center justify-between flex-wrap gap-2">
      <div className="flex items-center gap-2">
        <Button variant="outline" size="icon" onClick={onPrevious}>
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <Button variant="outline" size="icon" onClick={onNext}>
          <ChevronRight className="h-4 w-4" />
        </Button>
        <Button variant="outline" onClick={onToday}>
          <Calendar className="mr-2 h-4 w-4" />
          Today
        </Button>
        
        <div className="flex items-center gap-1 ml-2">
          <span className="text-xs text-muted-foreground">Step:</span>
          <select
            value={navigationInterval}
            onChange={(e) => setNavigationInterval(e.target.value as NavigationInterval)}
            className="rounded-md border border-border bg-background px-2 py-1 text-xs"
          >
            <option value="day">Day</option>
            <option value="week">Week</option>
            <option value="month">Month</option>
            <option value="year">Year</option>
          </select>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <span className="text-sm text-muted-foreground">View:</span>
        <select
          value={daysToShow}
          onChange={(e) => setDaysToShow(Number(e.target.value))}
          className="rounded-md border border-border bg-background px-3 py-1 text-sm"
        >
          <option value={1}>1 day</option>
          <option value={3}>3 days</option>
          <option value={7}>1 week</option>
          <option value={14}>2 weeks</option>
          <option value={30}>1 month</option>
          <option value={90}>3 months</option>
          <option value={180}>6 months</option>
          <option value={365}>1 year</option>
        </select>
      </div>
    </div>
  )
}
