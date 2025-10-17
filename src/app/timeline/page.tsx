import { TimelineView } from "~/components/timeline/timeline-view"

export default function TimelinePage() {
    // TODO: dejar de usar mock data y usar datos reales de la API
    // Cambiar a false
  return (
    <div className="h-full">
      <TimelineView initialDays={7} useMockData={true} />
    </div>
  )
}
