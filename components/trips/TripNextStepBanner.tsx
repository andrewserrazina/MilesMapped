import { Card, CardContent } from "@/components/ui/card";
import type { TripStatus } from "@/lib/types";

const nextStepCopy: Record<TripStatus, string> = {
  Intake: "Complete intake details, then start Searching.",
  Searching: "Add award options and pin the best option.",
  "Draft Ready": "Generate itinerary and send to client.",
  Sent: "Follow up; mark booked when confirmed.",
  Booked: "Capture final notes; close trip.",
  Closed: "Read-only.",
};

export default function TripNextStepBanner({ status }: { status: TripStatus }) {
  return (
    <Card className="border border-slate-200 bg-white">
      <CardContent className="p-4">
        <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
          Next step
        </p>
        <p className="mt-1 text-sm font-medium text-slate-700">
          {nextStepCopy[status]}
        </p>
      </CardContent>
    </Card>
  );
}
