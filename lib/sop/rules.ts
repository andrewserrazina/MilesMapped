import type { Itinerary, Trip, TripIntake, TripStatus } from "@/lib/types";

export type SopRuleResult = {
  allowed: boolean;
  reason?: string;
};

const MIN_INTAKE_COMPLETE = 4;

export function countCompletedIntake(intake: TripIntake): number {
  return Object.values(intake).filter(Boolean).length;
}

export function getPinnedAwardOptionCount(trip: Trip): number {
  if (!trip.pinnedAwardOptionId) {
    return 0;
  }
  return trip.awardOptions.filter(
    (option) => option.id === trip.pinnedAwardOptionId
  ).length;
}

export function getSearchingTransitionRule(trip: Trip): SopRuleResult {
  const completedCount = countCompletedIntake(trip.intake);
  if (completedCount >= MIN_INTAKE_COMPLETE) {
    return { allowed: true };
  }

  return {
    allowed: false,
    reason: "Complete at least 4 intake checklist items to move to Searching.",
  };
}

export function getItineraryGenerationRule(trip: Trip): SopRuleResult {
  const isDraftReady = trip.status === "Draft Ready";
  const pinnedCount = getPinnedAwardOptionCount(trip);
  const hasSinglePinned = pinnedCount === 1;

  if (isDraftReady && hasSinglePinned) {
    return { allowed: true };
  }

  if (!isDraftReady && !hasSinglePinned) {
    return {
      allowed: false,
      reason:
        "Set status to Draft Ready and pin exactly one award option to generate an itinerary.",
    };
  }

  if (!isDraftReady) {
    return {
      allowed: false,
      reason: "Set status to Draft Ready to generate an itinerary.",
    };
  }

  return {
    allowed: false,
    reason: "Pin exactly one award option to generate an itinerary.",
  };
}

export function getSentStatusRule(
  trip: Trip,
  itineraries: Itinerary[]
): SopRuleResult {
  const hasItinerary = itineraries.some(
    (itinerary) => itinerary.tripId === trip.id
  );

  if (hasItinerary) {
    return { allowed: true };
  }

  return {
    allowed: false,
    reason: "Generate an itinerary before marking Sent.",
  };
}

export function getClosedStatusRule(trip: Trip): SopRuleResult {
  if (trip.status === "Booked") {
    return { allowed: true };
  }

  return {
    allowed: false,
    reason: "Trip must be Booked before closing.",
  };
}

export function getStatusTransitionRule(
  trip: Trip,
  nextStatus: TripStatus,
  itineraries: Itinerary[]
): SopRuleResult {
  if (nextStatus === "Searching") {
    return getSearchingTransitionRule(trip);
  }

  if (nextStatus === "Sent") {
    return getSentStatusRule(trip, itineraries);
  }

  if (nextStatus === "Closed") {
    return getClosedStatusRule(trip);
  }

  return { allowed: true };
}
