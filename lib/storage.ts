import { clients, itineraries, trips } from "@/lib/mock/data";
import type {
  AwardSearchIntegrationsSettings,
  Client,
  Itinerary,
  Trip,
} from "@/lib/types";

const STORAGE_KEY = "milesmapped.portalData";
const SCHEMA_VERSION = 1;

export interface PortalData {
  schemaVersion: number;
  clients: Client[];
  trips: Trip[];
  itineraries: Itinerary[];
  awardSearchIntegrations: AwardSearchIntegrationsSettings;
}

const defaultAwardSearchIntegrations: AwardSearchIntegrationsSettings = {
  pointMe: {
    enabled: true,
    baseUrl: "https://www.point.me",
    urlTemplate: "",
  },
  roame: {
    enabled: true,
    baseUrl: "https://roame.travel",
    urlTemplate: "",
  },
};

const defaultPortalData: PortalData = {
  schemaVersion: SCHEMA_VERSION,
  clients,
  trips,
  itineraries,
  awardSearchIntegrations: defaultAwardSearchIntegrations,
};

function ensureSchemaVersion(data: PortalData): PortalData {
  if (typeof data.schemaVersion === "number") {
    return {
      ...data,
      awardSearchIntegrations: {
        pointMe: {
          ...defaultAwardSearchIntegrations.pointMe,
          ...data.awardSearchIntegrations?.pointMe,
        },
        roame: {
          ...defaultAwardSearchIntegrations.roame,
          ...data.awardSearchIntegrations?.roame,
        },
      },
    };
  }

  return {
    ...data,
    schemaVersion: SCHEMA_VERSION,
    awardSearchIntegrations: {
      pointMe: {
        ...defaultAwardSearchIntegrations.pointMe,
        ...data.awardSearchIntegrations?.pointMe,
      },
      roame: {
        ...defaultAwardSearchIntegrations.roame,
        ...data.awardSearchIntegrations?.roame,
      },
    },
  };
}

function isPortalDataShape(value: unknown): value is PortalData {
  return (
    typeof value === "object" &&
    value !== null &&
    "clients" in value &&
    "trips" in value &&
    "itineraries" in value &&
    Array.isArray((value as PortalData).clients) &&
    Array.isArray((value as PortalData).trips) &&
    Array.isArray((value as PortalData).itineraries)
  );
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
    if (!isPortalDataShape(parsed)) {
      return null;
    }
    return ensureSchemaVersion(parsed);
  } catch (error) {
    console.error("Failed to parse portal data", error);
    return null;
  }
}

export function savePortalData(data: PortalData) {
  if (typeof window === "undefined") {
    return;
  }
  window.localStorage.setItem(
    STORAGE_KEY,
    JSON.stringify(ensureSchemaVersion(data))
  );
}

export function initializeFromMockIfEmpty(): PortalData {
  if (typeof window === "undefined") {
    return defaultPortalData;
  }

  const existing = readFromStorage();
  if (existing) {
    savePortalData(existing);
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
    if (existing.schemaVersion !== SCHEMA_VERSION) {
      const normalized = { ...existing, schemaVersion: SCHEMA_VERSION };
      savePortalData(normalized);
      return normalized;
    }
    return existing;
  }

  return initializeFromMockIfEmpty();
}

export function resetPortalStorage() {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.removeItem(STORAGE_KEY);
}
