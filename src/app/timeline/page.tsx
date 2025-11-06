import { TimelineView } from "~/components/timeline/timeline-view"

export default function TimelinePage() {
  return (
    <TimelineView initialDays={7} useMockData={false} />
  )
}
