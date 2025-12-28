import { Badge } from "@/components/ui/badge";
import type { TripStatus } from "@/lib/types";

const statusStyles: Record<TripStatus, { label: string; variant: "info" | "warning" | "success" | "secondary" | "default" }>
  = {
    Intake: { label: "Intake", variant: "secondary" },
    Searching: { label: "Searching", variant: "info" },
    "Draft Ready": { label: "Draft Ready", variant: "warning" },
    Sent: { label: "Sent", variant: "info" },
    Booked: { label: "Booked", variant: "success" },
    Closed: { label: "Closed", variant: "default" },
  };

export default function StatusBadge({ status }: { status: TripStatus }) {
  const style = statusStyles[status];
  return <Badge variant={style.variant}>{style.label}</Badge>;
}
