import { clients, itineraries, trips } from "@/lib/mock/data";
import type { Client, Itinerary, Trip } from "@/lib/types";

const STORAGE_KEY = "milesmapped.portalData";
const SCHEMA_VERSION = 1;

export interface PortalData {
  schemaVersion: number;
  clients: Client[];
  trips: Trip[];
  itineraries: Itinerary[];
}

const defaultPortalData: PortalData = {
  schemaVersion: SCHEMA_VERSION,
  clients,
  trips,
  itineraries,
};

function readFromStorage(): PortalData | null {
  if (typeof window === "undefined") {
    return null;
  }

  const raw = window.localStorage.getItem(STORAGE_KEY);
  if (!raw) {
    return null;
  }

  try {
    return JSON.parse(raw) as PortalData;
  } catch (error) {
    console.error("Failed to parse portal data", error);
    return null;
  }
}

export function savePortalData(data: PortalData) {
  if (typeof window === "undefined") {
    return;
  }
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

export function initializeFromMockIfEmpty(): PortalData {
  if (typeof window === "undefined") {
    return defaultPortalData;
  }

  const existing = readFromStorage();
  if (existing) {
    return existing;
  }

  savePortalData(defaultPortalData);
  return defaultPortalData;
}

export function getPortalData(): PortalData {
  if (typeof window === "undefined") {
    return defaultPortalData;
  }

  const existing = readFromStorage();
  if (existing) {
    return existing;
  }

  return initializeFromMockIfEmpty();
}
