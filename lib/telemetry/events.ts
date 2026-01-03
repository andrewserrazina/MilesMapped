"use client";

export type TelemetryEventName =
  | "client_created"
  | "trip_created"
  | "award_added"
  | "award_pinned"
  | "itinerary_generated"
  | "status_changed"
  | "share_link_copied"
  | "export_printed"
  | "permission_denied"
  | "error_boundary";

export type TelemetryEventPayload = Record<
  string,
  string | number | boolean | null | undefined
>;

export interface TelemetryEvent {
  id: string;
  name: TelemetryEventName;
  timestamp: string;
  payload: TelemetryEventPayload;
}

const STORAGE_KEY = "milesmapped.telemetry.events";
const MAX_EVENTS = 500;
const isProduction = process.env.NODE_ENV === "production";

const hasWindow = () => typeof window !== "undefined";

const generateId = () => {
  if (hasWindow() && "crypto" in window && "randomUUID" in window.crypto) {
    return window.crypto.randomUUID();
  }
  return `telemetry_${Date.now()}_${Math.random().toString(16).slice(2)}`;
};

const sanitizePayload = (payload: TelemetryEventPayload): TelemetryEventPayload =>
  Object.fromEntries(
    Object.entries(payload).map(([key, value]) => {
      if (key.toLowerCase().includes("email") || key.toLowerCase().includes("phone")) {
        return [key, "[redacted]"];
      }
      if (typeof value === "string") {
        if (/\b\S+@\S+\.\S+\b/.test(value)) {
          return [key, "[redacted]"];
        }
        if (/\+?\d[\d\s\-().]{7,}\d/.test(value)) {
          return [key, "[redacted]"];
        }
      }
      return [key, value];
    })
  );

const readStoredEvents = (): TelemetryEvent[] => {
  if (!hasWindow()) {
    return [];
  }
  const raw = window.localStorage.getItem(STORAGE_KEY);
  if (!raw) {
    return [];
  }
  try {
    const parsed = JSON.parse(raw) as TelemetryEvent[];
    if (!Array.isArray(parsed)) {
      return [];
    }
    return parsed;
  } catch {
    return [];
  }
};

const writeStoredEvents = (events: TelemetryEvent[]) => {
  if (!hasWindow()) {
    return;
  }
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(events));
};

export const emitEvent = (
  name: TelemetryEventName,
  payload: TelemetryEventPayload = {}
) => {
  const event: TelemetryEvent = {
    id: generateId(),
    name,
    timestamp: new Date().toISOString(),
    payload: sanitizePayload(payload),
  };

  if (isProduction) {
    const events = readStoredEvents();
    const nextEvents = [...events, event].slice(-MAX_EVENTS);
    writeStoredEvents(nextEvents);
    return;
  }

  console.info("[telemetry]", event);
};

export const getTelemetryEvents = (): TelemetryEvent[] => readStoredEvents();

export const clearTelemetryEvents = () => {
  if (!hasWindow()) {
    return;
  }
  window.localStorage.removeItem(STORAGE_KEY);
};

export const buildTelemetryCsv = (events: TelemetryEvent[]) => {
  const headers = ["Timestamp", "Event", "Payload"];
  const rows = events.map((event) => [
    event.timestamp,
    event.name,
    JSON.stringify(event.payload ?? {}),
  ]);
  return [headers, ...rows]
    .map((row) =>
      row.map((cell) => `"${String(cell).replaceAll("\"", '""')}"`).join(",")
    )
    .join("\n");
};
