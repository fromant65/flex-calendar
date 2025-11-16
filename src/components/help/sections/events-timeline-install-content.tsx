"use client"

import React from "react"
import { EisenhowerContent } from "./events/eisenhower"
import { CalendarContent } from "./events/calendar"
import { TimelineGlobalContent } from "./events/timeline-global"
import { InstallContent } from "./events/install"

interface EventsTimelineInstallContentProps {
  id: string
}

export function EventsTimelineInstallContent({ id }: EventsTimelineInstallContentProps) {
  switch (id) {
    case "events":
    case "events-eisenhower":
      return <EisenhowerContent />
    case "events-calendar":
      return <CalendarContent />
    case "timeline":
      return <TimelineGlobalContent />
    case "install":
      return <InstallContent />
    default:
      return null
  }
}
