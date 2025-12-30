import type { AwardOption, Itinerary, Trip } from "@/lib/types";

export type TripMetrics = {
  totalMilesUsed: number | null;
  totalFeesUSD: number | null;
  estimatedCashValue: number | null;
  estimatedSavingsUSD: number | null;
};

export type GlobalMetrics = {
  avgSavingsPerTrip: number | null;
  avgMilesUsedPerTrip: number | null;
  totalTripsDelivered: number;
  avgDeliveryTimeDays: number | null;
};

export type TripDeliveryTimestamps = {
  draftReadyAt?: string;
  sentAt?: string;
};

const currencyFormatter = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 0,
});
const milesFormatter = new Intl.NumberFormat("en-US", {
  maximumFractionDigits: 0,
});
const dayFormatter = new Intl.NumberFormat("en-US", {
  minimumFractionDigits: 1,
  maximumFractionDigits: 1,
});

export function formatCurrency(value: number | null): string {
  if (value === null || Number.isNaN(value)) {
    return "—";
  }
  return currencyFormatter.format(value);
}

export function formatMiles(value: number | null): string {
  if (value === null || Number.isNaN(value)) {
    return "—";
  }
  return milesFormatter.format(value);
}

export function formatDurationDays(value: number | null): string {
  if (value === null || Number.isNaN(value)) {
    return "—";
  }
  return `${dayFormatter.format(value)} days`;
}

export function getPrimaryAwardOption(trip: Trip): AwardOption | null {
  if (trip.awardOptions.length === 0) {
    return null;
  }

  if (trip.pinnedAwardOptionId) {
    const pinned = trip.awardOptions.find(
      (option) => option.id === trip.pinnedAwardOptionId
    );
    if (pinned) {
      return pinned;
    }
  }

  return trip.awardOptions[0] ?? null;
}

export function computeTripMetrics(trip: Trip): TripMetrics {
  const primaryOption = getPrimaryAwardOption(trip);

  if (!primaryOption) {
    return {
      totalMilesUsed: null,
      totalFeesUSD: null,
      estimatedCashValue: null,
      estimatedSavingsUSD: null,
    };
  }

  const estimatedCashValue = primaryOption.cashEquivalentUSD ?? null;
  const totalFeesUSD = primaryOption.feesUSD;
  const estimatedSavingsUSD =
    estimatedCashValue === null ? null : estimatedCashValue - totalFeesUSD;

  return {
    totalMilesUsed: primaryOption.milesRequired,
    totalFeesUSD,
    estimatedCashValue,
    estimatedSavingsUSD,
  };
}

function isValidNumber(value: number | null): value is number {
  return value !== null && !Number.isNaN(value);
}

function average(values: Array<number | null>): number | null {
  const valid = values.filter(isValidNumber);
  if (valid.length === 0) {
    return null;
  }
  const total = valid.reduce((sum, value) => sum + value, 0);
  return total / valid.length;
}

function parseDate(value?: string | null): number | null {
  if (!value) {
    return null;
  }
  const time = Date.parse(value);
  return Number.isNaN(time) ? null : time;
}

function resolveDraftReadyAt(trip: Trip & TripDeliveryTimestamps): number | null {
  if (trip.draftReadyAt) {
    return parseDate(trip.draftReadyAt);
  }

  const primaryOption = getPrimaryAwardOption(trip);
  return parseDate(primaryOption?.createdAt ?? null);
}

function resolveSentAt(
  trip: Trip & TripDeliveryTimestamps,
  itineraries: Itinerary[]
): number | null {
  if (trip.sentAt) {
    return parseDate(trip.sentAt);
  }

  const timestamps = itineraries
    .filter((itinerary) => itinerary.tripId === trip.id)
    .map((itinerary) => parseDate(itinerary.generatedAt))
    .filter(isValidNumber);

  if (timestamps.length === 0) {
    return null;
  }

  return Math.min(...timestamps);
}

export function computeGlobalMetrics(
  trips: Array<Trip & TripDeliveryTimestamps>,
  itineraries: Itinerary[] = []
): GlobalMetrics {
  const deliveredTrips = trips.filter(
    (trip) => trip.status === "Sent" || trip.status === "Booked"
  );
  const tripMetrics = deliveredTrips.map(computeTripMetrics);
  const avgSavingsPerTrip = average(
    tripMetrics.map((metrics) => metrics.estimatedSavingsUSD)
  );
  const avgMilesUsedPerTrip = average(
    tripMetrics.map((metrics) => metrics.totalMilesUsed)
  );

  const deliveryDurations = deliveredTrips
    .map((trip) => {
      const draftReadyAt = resolveDraftReadyAt(trip);
      const sentAt = resolveSentAt(trip, itineraries);
      if (draftReadyAt === null || sentAt === null) {
        return null;
      }
      const durationMs = sentAt - draftReadyAt;
      if (durationMs < 0) {
        return null;
      }
      return durationMs / (1000 * 60 * 60 * 24);
    })
    .filter(isValidNumber);

  return {
    avgSavingsPerTrip,
    avgMilesUsedPerTrip,
    totalTripsDelivered: deliveredTrips.length,
    avgDeliveryTimeDays: deliveryDurations.length
      ? average(deliveryDurations)
      : null,
  };
}
