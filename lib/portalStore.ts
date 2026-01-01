"use client";

import { useEffect, useSyncExternalStore } from "react";
import { clients, itineraries, knowledgeArticles, trips } from "@/lib/mock/data";
import { resetPortalStorage } from "@/lib/storage";
import type {
  AwardOption,
  AwardSearchIntegrationsSettings,
  Client,
  CommunicationEntry,
  Itinerary,
  KnowledgeArticle,
  Trip,
} from "@/lib/types";
import { defaultTripIntake } from "@/lib/types";

const STORAGE_KEY = "milesmapped.portalData";
const SCHEMA_VERSION = 2;

export interface PortalData {
  schemaVersion: number;
  clients: typeof clients;
  trips: Trip[];
  itineraries: Itinerary[];
  communicationEntries: CommunicationEntry[];
  awardSearchIntegrations: AwardSearchIntegrationsSettings;
  knowledgeArticles: KnowledgeArticle[];
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
  communicationEntries: [],
  awardSearchIntegrations: defaultAwardSearchIntegrations,
  knowledgeArticles,
};

let portalDataState: PortalData = defaultPortalData;
let isHydratedState = false;
let snapshotState = { data: portalDataState, isHydrated: isHydratedState };
const serverSnapshot = { data: defaultPortalData, isHydrated: false };
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
    "knowledgeArticles" in value &&
    (value as PortalData).schemaVersion === SCHEMA_VERSION &&
    Array.isArray((value as PortalData).clients) &&
    Array.isArray((value as PortalData).trips) &&
    Array.isArray((value as PortalData).itineraries) &&
    (!("communicationEntries" in value) ||
      Array.isArray((value as PortalData).communicationEntries)) &&
    Array.isArray((value as PortalData).knowledgeArticles)
  );
}

function normalizeTrip(trip: Trip): Trip {
  const awardOptions = trip.awardOptions ?? [];
  const hasPinned =
    trip.pinnedAwardOptionId &&
    awardOptions.some((option) => option.id === trip.pinnedAwardOptionId);
  const intake = { ...defaultTripIntake, ...trip.intake };

  return {
    ...trip,
    awardOptions,
    assignedAgentName: trip.assignedAgentName ?? "Admin",
    pinnedAwardOptionId: hasPinned ? trip.pinnedAwardOptionId : undefined,
    intake,
  };
}

function normalizePortalData(data: PortalData): PortalData {
  return {
    ...data,
    schemaVersion: SCHEMA_VERSION,
    trips: data.trips.map((trip) => normalizeTrip(trip)),
    communicationEntries: data.communicationEntries ?? [],
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
    knowledgeArticles:
      data.knowledgeArticles?.length ? data.knowledgeArticles : knowledgeArticles,
  };
}

function createId(prefix: string) {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return `${prefix}_${crypto.randomUUID()}`;
  }

  return `${prefix}_${Date.now()}_${Math.floor(Math.random() * 1000)}`;
}

function buildSampleTrips(availableClients: Client[]): Trip[] {
  const [primaryClient, secondaryClient, tertiaryClient] = availableClients;
  const fallbackClientId = clients[0]?.id ?? "client_001";

  const tripOneId = createId("trip");
  const tripOneOptionOneId = createId("award");
  const tripOneOptionTwoId = createId("award");
  const tripTwoId = createId("trip");
  const tripTwoOptionOneId = createId("award");
  const tripTwoOptionTwoId = createId("award");
  const tripThreeId = createId("trip");
  const tripThreeOptionOneId = createId("award");

  return [
    {
      id: tripOneId,
      clientId: primaryClient?.id ?? fallbackClientId,
      title: "Tokyo Cherry Blossom Sprint",
      origin: "LAX",
      destination: "HND",
      dateStart: "2025-03-22",
      dateEnd: "2025-03-30",
      flexibilityDays: 2,
      passengers: 2,
      cabinPref: "Business",
      cashBudget: 3200,
      status: "Searching",
      assignedAgentName: "Admin",
      notes: "Target ANA/JAL sweet spots and low-fuel-surcharge options.",
      intake: {
        ...defaultTripIntake,
        travelerNamesCaptured: true,
        preferredAirportsConfirmed: true,
        datesConfirmed: true,
        cabinConfirmed: true,
        pointsReviewed: true,
      },
      awardOptions: [
        {
          id: tripOneOptionOneId,
          tripId: tripOneId,
          program: "Virgin Atlantic",
          route: "LAX–HND",
          milesRequired: 60000,
          feesUSD: 155,
          cashEquivalentUSD: 2200,
          transferRequired: true,
          transferTime: "Instant",
          badges: ["Sweet Spot"],
          createdAt: "2025-01-15",
        },
        {
          id: tripOneOptionTwoId,
          tripId: tripOneId,
          program: "American AAdvantage",
          route: "LAX–HND",
          milesRequired: 80000,
          feesUSD: 53,
          cashEquivalentUSD: 2100,
          transferRequired: false,
          transferTime: "Instant",
          badges: ["Low Fees"],
          createdAt: "2025-01-16",
        },
      ],
      hotelOptions: [],
      pinnedAwardOptionId: tripOneOptionOneId,
    },
    {
      id: tripTwoId,
      clientId: secondaryClient?.id ?? fallbackClientId,
      title: "Rome & Amalfi Anniversary",
      origin: "ORD",
      destination: "FCO",
      dateStart: "2025-05-07",
      dateEnd: "2025-05-16",
      flexibilityDays: 3,
      passengers: 2,
      cabinPref: "Premium",
      cashBudget: 2600,
      status: "Draft Ready",
      assignedAgentName: "Jordan Lee",
      notes: "Prioritize overnight outbound and coastal hotel points options.",
      intake: {
        ...defaultTripIntake,
        travelerNamesCaptured: true,
        preferredAirportsConfirmed: true,
        datesConfirmed: true,
        cabinConfirmed: true,
        pointsReviewed: true,
        docsChecked: true,
        budgetNotesAdded: true,
      },
      awardOptions: [
        {
          id: tripTwoOptionOneId,
          tripId: tripTwoId,
          program: "Air France",
          route: "ORD–FCO",
          milesRequired: 45000,
          feesUSD: 210,
          cashEquivalentUSD: 1400,
          transferRequired: true,
          transferTime: "1–2 days",
          badges: ["Low Fees"],
          createdAt: "2025-02-03",
        },
        {
          id: tripTwoOptionTwoId,
          tripId: tripTwoId,
          program: "United",
          route: "ORD–FCO",
          milesRequired: 60000,
          feesUSD: 6,
          cashEquivalentUSD: 1800,
          transferRequired: false,
          transferTime: "Instant",
          badges: ["Nonstop"],
          createdAt: "2025-02-04",
        },
      ],
      hotelOptions: [],
    },
    {
      id: tripThreeId,
      clientId: tertiaryClient?.id ?? fallbackClientId,
      title: "Singapore + Bali Workcation",
      origin: "SEA",
      destination: "SIN",
      dateStart: "2025-06-11",
      dateEnd: "2025-06-24",
      flexibilityDays: 1,
      passengers: 1,
      cabinPref: "Business",
      cashBudget: 3100,
      status: "Intake",
      assignedAgentName: "Agent A",
      notes: "Needs strong Wi-Fi and flexible return routing via DPS.",
      intake: {
        ...defaultTripIntake,
        travelerNamesCaptured: true,
        preferredAirportsConfirmed: false,
        datesConfirmed: true,
      },
      awardOptions: [
        {
          id: tripThreeOptionOneId,
          tripId: tripThreeId,
          program: "Singapore KrisFlyer",
          route: "SEA–SIN",
          milesRequired: 111500,
          feesUSD: 64,
          cashEquivalentUSD: 2800,
          transferRequired: true,
          transferTime: "Instant",
          badges: ["Premium Cabin"],
          createdAt: "2025-02-18",
        },
      ],
      hotelOptions: [],
      pinnedAwardOptionId: tripThreeOptionOneId,
    },
  ];
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
  snapshotState = { data: portalDataState, isHydrated: isHydratedState };
  notifyListeners();
}

type PortalDataUpdater = PortalData | ((previous: PortalData) => PortalData);

function setPortalData(update: PortalDataUpdater) {
  const nextData =
    typeof update === "function" ? update(portalDataState) : update;
  portalDataState = normalizePortalData(nextData);
  persist(portalDataState);
  snapshotState = { data: portalDataState, isHydrated: isHydratedState };
  notifyListeners();
}

export function usePortalData() {
  const snapshot = useSyncExternalStore(
    subscribe,
    () => snapshotState,
    () => serverSnapshot
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

export function resetPortalData() {
  if (!isHydratedState) {
    hydrateStore();
  }

  resetPortalStorage();
  portalDataState = normalizePortalData(defaultPortalData);
  persist(portalDataState);
  isHydratedState = true;
  snapshotState = { data: portalDataState, isHydrated: isHydratedState };
  notifyListeners();
}

export function seedSampleTrips() {
  if (!isHydratedState) {
    hydrateStore();
  }

  setPortalData((previous) => ({
    ...previous,
    trips: [...buildSampleTrips(previous.clients), ...previous.trips],
  }));
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

export function updateClient(
  clientId: string,
  updater: (client: Client) => Client
) {
  setPortalData((previous) => {
    const client = previous.clients.find((item) => item.id === clientId);
    if (!client) {
      return previous;
    }

    const updatedClient = updater(client);
    return {
      ...previous,
      clients: previous.clients.map((item) =>
        item.id === clientId ? updatedClient : item
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

export function addClient(client: Client) {
  setPortalData((previous) => ({
    ...previous,
    clients: [client, ...previous.clients],
  }));
}

export function addTrip(trip: Trip) {
  setPortalData((previous) => ({
    ...previous,
    trips: [normalizeTrip(trip), ...previous.trips],
  }));
}

type AwardSearchIntegrationsPatch = Partial<{
  pointMe: Partial<AwardSearchIntegrationsSettings["pointMe"]>;
  roame: Partial<AwardSearchIntegrationsSettings["roame"]>;
}>;

export function updateAwardSearchIntegrations(
  patch: AwardSearchIntegrationsPatch
) {
  setPortalData((previous) => ({
    ...previous,
    awardSearchIntegrations: {
      ...previous.awardSearchIntegrations,
      pointMe: {
        ...previous.awardSearchIntegrations.pointMe,
        ...patch.pointMe,
      },
      roame: {
        ...previous.awardSearchIntegrations.roame,
        ...patch.roame,
      },
    },
  }));
}
