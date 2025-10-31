"use client"

import { useState, useEffect } from "react"
import { StatsPageHeader } from "~/components/stats/stats-page-header"
import { StatsNavigation } from "~/components/stats/stats-navigation"
import { StatsTabs } from "~/components/stats/stats-tabs"
import { TaskStatsSection } from "~/components/stats/task-stats-section"
import { RecurrenceStatsSection } from "~/components/stats/recurrence-stats-section"
import { OccurrenceStatsSection } from "~/components/stats/occurrence-stats-section"
import { CalendarStatsSection } from "~/components/stats/calendar-stats-section"
import { KPIsSection } from "~/components/stats/kpis-section"
import { InsightsSection } from "~/components/stats/insights-section"
import { api } from "~/trpc/react"
import { mockStatsData } from "~/lib/mock-stats-data"
import type { StatsSection } from "~/components/stats/types"
import { toast } from "sonner"

export default function StatsPage() {
  const [activeSection, setActiveSection] = useState<StatsSection>("tasks")
  
  const { data: taskStats, isLoading: loadingTask, error: errorTask } = 
    api.stats.getTaskStats.useQuery(undefined, { enabled: activeSection === "tasks" })
  
  const { data: recurrenceStats, isLoading: loadingRecurrence, error: errorRecurrence } = 
    api.stats.getRecurrenceStats.useQuery(undefined, { enabled: activeSection === "recurrences" })
  
  const { data: occurrenceStats, isLoading: loadingOccurrence, error: errorOccurrence } = 
    api.stats.getOccurrenceStats.useQuery(undefined, { enabled: activeSection === "occurrences" })
  
  const { data: calendarStats, isLoading: loadingCalendar, error: errorCalendar } = 
    api.stats.getCalendarStats.useQuery(undefined, { enabled: activeSection === "calendar" })
  
  const { data: kpis, isLoading: loadingKPIs, error: errorKPIs } = 
    api.stats.getGlobalKPIs.useQuery(undefined, { enabled: activeSection === "kpis" })
  
  const { data: insights, isLoading: loadingInsights, error: errorInsights } = 
    api.stats.getInsights.useQuery(undefined, { enabled: activeSection === "insights" })

  // Show toast when there's an error in the active section
  useEffect(() => {
    const error = 
      (activeSection === "tasks" && errorTask) ||
      (activeSection === "recurrences" && errorRecurrence) ||
      (activeSection === "occurrences" && errorOccurrence) ||
      (activeSection === "calendar" && errorCalendar) ||
      (activeSection === "kpis" && errorKPIs) ||
      (activeSection === "insights" && errorInsights)
    
    if (error) {
      toast.error("Error al cargar estadísticas", { 
        description: error.message || "No se pudieron cargar las estadísticas" 
      })
      //console.error("Error fetching stats:", error)
    }
  }, [activeSection, errorTask, errorRecurrence, errorOccurrence, errorCalendar, errorKPIs, errorInsights])

  // Determine loading state for active section
  const isLoading = 
    (activeSection === "tasks" && loadingTask) ||
    (activeSection === "recurrences" && loadingRecurrence) ||
    (activeSection === "occurrences" && loadingOccurrence) ||
    (activeSection === "calendar" && loadingCalendar) ||
    (activeSection === "kpis" && loadingKPIs) ||
    (activeSection === "insights" && loadingInsights)

  const renderSection = () => {
    // Show loading spinner for active section
    if (isLoading) {
      return (
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      )
    }

    // Render section with real data (or fallback to mock on error)
    return getSectionComponent(activeSection)
  }

  const getSectionComponent = (section: StatsSection) => {
    switch (section) {
      case "tasks":
        return <TaskStatsSection data={taskStats ?? mockStatsData.taskStats} />
      case "recurrences":
        return <RecurrenceStatsSection data={recurrenceStats ?? mockStatsData.recurrenceStats} />
      case "occurrences":
        return <OccurrenceStatsSection data={occurrenceStats ?? mockStatsData.occurrenceStats} />
      case "calendar":
        return <CalendarStatsSection data={calendarStats ?? mockStatsData.calendarStats} />
      case "kpis":
        return <KPIsSection data={kpis ?? mockStatsData.globalKPIs} />
      case "insights":
        return <InsightsSection data={insights ?? mockStatsData.insights} />
      default:
        return <TaskStatsSection data={mockStatsData.taskStats} />
    }
  }

  return (
    <div className="flex flex-col h-full">
      <div className="container mx-auto p-4 md:p-8">
        <StatsPageHeader />
      </div>

      {/* Mobile Tabs - Fixed at bottom of screen */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-background border-t">
        <StatsTabs activeSection={activeSection} onSectionChange={setActiveSection} />
      </div>

      <div className="container mx-auto p-4 md:p-8 flex-1 pb-16 lg:mb-0">
        <div className="grid grid-cols-1 lg:grid-cols-[240px_1fr] gap-4 lg:gap-8">
          {/* Desktop Navigation - Sidebar */}
          <aside className="hidden lg:block">
            <StatsNavigation activeSection={activeSection} onSectionChange={setActiveSection} />
          </aside>
          
          {/* Content - Single section at a time */}
          <div className="min-h-[400px]">
            {renderSection()}
          </div>
        </div>
      </div>
    </div>
  )
}

