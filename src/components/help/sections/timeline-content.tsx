"use client"

import React from "react"
import { TimelineNavigationContent } from "./timeline/navigation"
import { TimelineReadingContent } from "./timeline/reading"
import { TimelineFiltersContent } from "./timeline/filters"
import { TimelineInfoContent } from "./timeline/info"
import { TimelineGlobalContent } from "./events/timeline-global"

interface TimelineContentProps {
  id: string
}

export function TimelineContent({ id }: TimelineContentProps) {
  switch (id) {
    case "timeline":
      return <TimelineGlobalContent />
    case "timeline-nav":
      return <TimelineNavigationContent />
    case "timeline-read":
      return <TimelineReadingContent />
    case "timeline-filters":
      return <TimelineFiltersContent />
    case "timeline-info":
      return <TimelineInfoContent />
    default:
      return null
  }
}
