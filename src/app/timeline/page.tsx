import { TimelineView } from "~/components/timeline/timeline-view"

export default function TimelinePage() {
  return (
    <div className="h-full">
      <TimelineView initialDays={7} useMockData={true} />
    </div>
  )
}
