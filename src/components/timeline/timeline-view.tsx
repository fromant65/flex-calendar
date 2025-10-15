"use client"

import { useState, useEffect, useMemo } from "react"
import { motion, AnimatePresence } from "motion/react"
import { mockTimelineApi, type TimelineData } from "~/lib/mock-timeline-data"
import type { OccurrenceWithTask, EventWithDetails } from "~/types"
import { api } from "~/trpc/react"
import { TimelineControls, type NavigationInterval } from "./timeline-controls"
import { TimelineHeader } from "./timeline-header"
import { TimelineTaskRow } from "./timeline-task-row"
import { TimelineModals } from "./timeline-modals"
import { formatDate, formatDayOfWeek } from "./timeline-utils"

interface TimelineViewProps {
  initialDays?: number
  useMockData?: boolean
}

export function TimelineView({ initialDays = 7, useMockData = true }: TimelineViewProps) {
  const [currentDate, setCurrentDate] = useState(new Date("2025-01-13"))
  const [daysToShow, setDaysToShow] = useState(initialDays)
  const [dataCache, setDataCache] = useState<Map<string, TimelineData>>(new Map())
  const [navigationInterval, setNavigationInterval] = useState<NavigationInterval>("day")
  const [selectedOccurrence, setSelectedOccurrence] = useState<OccurrenceWithTask | null>(null)
  const [selectedEvent, setSelectedEvent] = useState<EventWithDetails | null>(null)
  const [direction, setDirection] = useState<"forward" | "backward">("forward")

  // Calculate date range
  const dateRange = useMemo(() => {
    const dates: Date[] = []
    for (let i = 0; i < daysToShow; i++) {
      const date = new Date(currentDate)
      date.setDate(date.getDate() + i)
      dates.push(date)
    }
    return dates
  }, [currentDate, daysToShow])

  const startDate = dateRange[0]
  const endDate = dateRange[dateRange.length - 1]

  // Fetch real data using tRPC
  const { data: realData, isLoading } = api.timeline.getTimelineData.useQuery(
    {
      startDate: startDate!,
      endDate: endDate!,
    },
    {
      enabled: !useMockData,
    }
  )

  // Fetch data with caching for mock data
  useEffect(() => {
    if (!useMockData) return
    
    const cacheKey = `${startDate?.toISOString()}-${endDate?.toISOString()}`

    if (!dataCache.has(cacheKey)) {
      console.log("Loading mock data for", startDate, "to", endDate)
      const data = mockTimelineApi.getTimelineData(startDate!, endDate!)
      console.log("Mock data loaded:", data)
      setDataCache((prev) => new Map(prev).set(cacheKey, data))
    }
  }, [startDate, endDate, useMockData, dataCache])

  // Get current data from cache or real data
  const currentData = useMemo(() => {
    if (!useMockData && realData) {
      console.log("Using real data:", realData)
      return realData
    }
    
    if (useMockData) {
      const cacheKey = `${startDate!.toISOString()}-${endDate!.toISOString()}`
      const data = dataCache.get(cacheKey) || { tasks: [], occurrences: [], events: [] }
      console.log("Using mock data from cache:", data)
      return data
    }
    
    return { tasks: [], occurrences: [], events: [] }
  }, [startDate, endDate, dataCache, useMockData, realData])

  // Navigate timeline based on selected interval
  const goToPrevious = () => {
    setDirection("backward")
    const newDate = new Date(currentDate)
    switch (navigationInterval) {
      case "day":
        newDate.setDate(newDate.getDate() - 1)
        break
      case "week":
        newDate.setDate(newDate.getDate() - 7)
        break
      case "month":
        newDate.setMonth(newDate.getMonth() - 1)
        break
      case "year":
        newDate.setFullYear(newDate.getFullYear() - 1)
        break
    }
    setCurrentDate(newDate)
  }

  const goToNext = () => {
    setDirection("forward")
    const newDate = new Date(currentDate)
    switch (navigationInterval) {
      case "day":
        newDate.setDate(newDate.getDate() + 1)
        break
      case "week":
        newDate.setDate(newDate.getDate() + 7)
        break
      case "month":
        newDate.setMonth(newDate.getMonth() + 1)
        break
      case "year":
        newDate.setFullYear(newDate.getFullYear() + 1)
        break
    }
    setCurrentDate(newDate)
  }

  const goToToday = () => {
    setDirection("forward")
    setCurrentDate(new Date())
  }

  // Get occurrence end date (completedAt or last completed event)
  const getOccurrenceEndDate = (occurrence: OccurrenceWithTask): Date => {
    if (occurrence.completedAt) {
      return new Date(occurrence.completedAt)
    }

    const occurrenceEvents = currentData.events.filter(
      (e) => e.associatedOccurrenceId === occurrence.id && e.isCompleted && e.completedAt,
    )

    if (occurrenceEvents.length > 0) {
      const lastEventDate = Math.max(...occurrenceEvents.map((e) => new Date(e.completedAt!).getTime()))
      return new Date(lastEventDate)
    }

    return new Date(occurrence.startDate)
  }

  return (
    <div className="flex h-full flex-col gap-2 bg-background p-4">
      {/* Header Controls */}
      <TimelineControls
        navigationInterval={navigationInterval}
        setNavigationInterval={setNavigationInterval}
        daysToShow={daysToShow}
        setDaysToShow={setDaysToShow}
        onPrevious={goToPrevious}
        onNext={goToNext}
        onToday={goToToday}
      />

      {/* Timeline Container */}
      <div className="flex-1 overflow-auto rounded-lg bg-card">
        <div className="min-w-[800px] relative">
          {/* Date Header - Sticky */}
          <div className="sticky top-0 z-20 bg-card">
            <TimelineHeader dateRange={dateRange} />
          </div>

          {/* Vertical day separator lines - extends through entire content */}
          <div className="pointer-events-none absolute left-0 right-0 top-0 h-full flex z-0" style={{ paddingLeft: '12rem' }}>
            {dateRange.map((date, index) => (
              <div key={index} className="flex-1 relative">
                <div className="absolute left-0 top-0 h-full w-px bg-border/50" />
              </div>
            ))}
          </div>

          {/* Timeline Rows */}
          <motion.div 
            className="relative z-10 min-h-0"
            key={currentDate.toISOString()}
            initial={{ opacity: 0, x: direction === "forward" ? 20 : -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: direction === "forward" ? -20 : 20 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
          >
            {isLoading && !useMockData ? (
              <div className="flex h-32 items-center justify-center text-muted-foreground">
                Loading timeline data...
              </div>
            ) : currentData.tasks.length === 0 ? (
              <div className="flex h-32 items-center justify-center text-muted-foreground">
                No completed tasks in this date range
              </div>
            ) : (
              currentData.tasks.map((task) => {
                const taskOccurrences = currentData.occurrences.filter((occ) => occ.associatedTaskId === task.id)
                const taskEvents = currentData.events.filter((e) => 
                  e.associatedOccurrenceId && taskOccurrences.some(occ => occ.id === e.associatedOccurrenceId)
                )

                return (
                  <TimelineTaskRow
                    key={task.id}
                    task={task}
                    occurrences={taskOccurrences}
                    events={taskEvents}
                    dateRange={dateRange}
                    onOccurrenceClick={setSelectedOccurrence}
                    onEventClick={setSelectedEvent}
                    getOccurrenceEndDate={getOccurrenceEndDate}
                  />
                )
              })
            )}
          </motion.div>
        </div>
      </div>

      {/* Legend */}
      <div className="flex items-center gap-6 text-sm">
        <div className="flex items-center gap-2">
          <div className="h-4 w-8 rounded bg-primary/20" />
          <span className="text-muted-foreground">Occurrence</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="h-4 w-8 rounded border border-yellow-500 bg-yellow-500/60" />
          <span className="text-muted-foreground">Active Event</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="h-4 w-8 rounded border border-accent bg-accent/60" />
          <span className="text-muted-foreground">Completed Event</span>
        </div>
      </div>

      {/* Modals */}
      <TimelineModals
        selectedOccurrence={selectedOccurrence}
        selectedEvent={selectedEvent}
        onOccurrenceClose={() => setSelectedOccurrence(null)}
        onEventClose={() => setSelectedEvent(null)}
      />
    </div>
  )
}
