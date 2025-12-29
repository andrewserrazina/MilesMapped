import type { CurrentUser } from "@/lib/auth/mockAuth";

export type PermissionAction =
  | "client.create"
  | "client.edit"
  | "client.balance.edit"
  | "trip.create"
  | "trip.edit"
  | "trip.assign"
  | "trip.close"
  | "demo.reset"
  | "trip.markSent"
  | "trip.markBooked"
  | "award.add"
  | "itinerary.generate"
  | "notes.add"
  | "tasks.add";

export function can(
  user: CurrentUser,
  action: PermissionAction,
  _resource?: unknown
): boolean {
  if (user.role === "admin") {
    return true;
  }

  switch (action) {
    case "award.add":
    case "itinerary.generate":
    case "notes.add":
    case "tasks.add":
    case "trip.markSent":
    case "trip.markBooked":
      return true;
    default:
      return false;
  }
}
