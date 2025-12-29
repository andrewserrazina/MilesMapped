"use client";

import { useEffect, useSyncExternalStore } from "react";
import { clients, itineraries, trips } from "@/lib/mock/data";
import type { AwardOption, Itinerary, Trip } from "@/lib/types";

const STORAGE_KEY = "milesmapped.portalData";
const SCHEMA_VERSION = 1;

export interface PortalData {
  schemaVersion: number;
  clients: typeof clients;
  trips: Trip[];
  itineraries: Itinerary[];
}

const defaultPortalData: PortalData = {
  schemaVersion: SCHEMA_VERSION,
  clients,
  trips,
  itineraries,
};

let portalDataState: PortalData = defaultPortalData;
let isHydratedState = false;
const listeners = new Set<() => void>();

function notifyListeners() {
  listeners.forEach((listener) => listener());
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

function readFromStorage(): PortalData | null {
  if (typeof window === "undefined") {
    return null;
  }

  const raw = window.localStorage.getItem(STORAGE_KEY);
  if (!raw) {
    return null;
  }

  try {
    const parsed = JSON.parse(raw) as PortalData;
    if (!isPortalData(parsed)) {
      return null;
    }
    return parsed;
  } catch (error) {
    console.error("Failed to parse portal data", error);
    return null;
  }
}

function persist(data: PortalData) {
  if (typeof window === "undefined") {
    return;
  }
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  // In production, swap this localStorage write for a Supabase upsert call and
  // hydrate the store from the response payload instead of the mock dataset.
}

function isPortalData(value: unknown): value is PortalData {
  return (
    typeof value === "object" &&
    value !== null &&
    "schemaVersion" in value &&
    "clients" in value &&
    "trips" in value &&
    "itineraries" in value &&
    (value as PortalData).schemaVersion === SCHEMA_VERSION &&
    Array.isArray((value as PortalData).clients) &&
    Array.isArray((value as PortalData).trips) &&
    Array.isArray((value as PortalData).itineraries)
  );
}

function normalizeTrip(trip: Trip): Trip {
  const awardOptions = trip.awardOptions ?? [];
  const hasPinned =
    trip.pinnedAwardOptionId &&
    awardOptions.some((option) => option.id === trip.pinnedAwardOptionId);

  return {
    ...trip,
    awardOptions,
    pinnedAwardOptionId: hasPinned ? trip.pinnedAwardOptionId : undefined,
  };
}

function normalizePortalData(data: PortalData): PortalData {
  return {
    ...data,
    schemaVersion: SCHEMA_VERSION,
    trips: data.trips.map((trip) => normalizeTrip(trip)),
  };
}

function hydrateStore() {
  if (typeof window === "undefined" || isHydratedState) {
    return;
  }

  const stored = readFromStorage();
  if (stored) {
    portalDataState = normalizePortalData(stored);
  } else {
    portalDataState = normalizePortalData(defaultPortalData);
    persist(portalDataState);
  }

  isHydratedState = true;
  notifyListeners();
}

type PortalDataUpdater = PortalData | ((previous: PortalData) => PortalData);

function setPortalData(update: PortalDataUpdater) {
  const nextData =
    typeof update === "function" ? update(portalDataState) : update;
  portalDataState = normalizePortalData(nextData);
  persist(portalDataState);
  notifyListeners();
}

export function usePortalData() {
  const snapshot = useSyncExternalStore(
    subscribe,
    () => ({ data: portalDataState, isHydrated: isHydratedState }),
    () => ({ data: defaultPortalData, isHydrated: false })
  );

  useEffect(() => {
    hydrateStore();
  }, []);

  return {
    data: snapshot.data,
    setData: setPortalData,
    isHydrated: snapshot.isHydrated,
  };
}

export function isTripReadOnly(trip: Trip) {
  return trip.status === "Closed";
}

export function updateTrip(tripId: string, updater: (trip: Trip) => Trip) {
  setPortalData((previous) => {
    const trip = previous.trips.find((item) => item.id === tripId);
    if (!trip || isTripReadOnly(trip)) {
      return previous;
    }

    const updatedTrip = normalizeTrip(updater(trip));
    return {
      ...previous,
      trips: previous.trips.map((item) =>
        item.id === tripId ? updatedTrip : item
      ),
    };
  });
}

export function addAwardOption(tripId: string, option: AwardOption) {
  updateTrip(tripId, (trip) => ({
    ...trip,
    awardOptions: [{ ...option, tripId }, ...trip.awardOptions],
  }));
}

export function updateAwardOption(
  tripId: string,
  optionId: string,
  patch: Partial<AwardOption>
) {
  updateTrip(tripId, (trip) => ({
    ...trip,
    awardOptions: trip.awardOptions.map((option) =>
      option.id === optionId ? { ...option, ...patch } : option
    ),
  }));
}

export function removeAwardOption(tripId: string, optionId: string) {
  updateTrip(tripId, (trip) => ({
    ...trip,
    awardOptions: trip.awardOptions.filter((option) => option.id !== optionId),
  }));
}

export function setPinnedAwardOption(tripId: string, optionId: string) {
  updateTrip(tripId, (trip) => {
    const exists = trip.awardOptions.some((option) => option.id === optionId);
    if (!exists) {
      return trip;
    }
    return {
      ...trip,
      pinnedAwardOptionId: optionId,
    };
  });
}

export function addItinerary(itinerary: Itinerary) {
  setPortalData((previous) => ({
    ...previous,
    itineraries: [itinerary, ...previous.itineraries],
  }));
}
