import PageHeader from "@/components/page-header";
import EmptyState from "@/components/empty-state";

export default function ItinerariesPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Itineraries"
        description="Generate and track client-facing itineraries."
      />
      <EmptyState
        title="No itineraries generated yet"
        description="Generate an itinerary from a trip once an award option is pinned."
      />
    </div>
  );
}
