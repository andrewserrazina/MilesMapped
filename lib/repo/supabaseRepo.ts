"use client";

import { useEffect, useSyncExternalStore } from "react";
import type {
  AwardSearchIntegrationsSettings,
  AwardOption,
  Client,
  ClientBalances,
  ClientPreferences,
  CommunicationEntry,
  Itinerary,
  KnowledgeArticle,
  Trip,
  TripIntake,
} from "@/lib/types";
import { defaultTripIntake } from "@/lib/types";
import {
  isTripReadOnly,
  usePortalData as useLocalPortalData,
  type PortalData,
} from "@/lib/portalStore";
import { logError, logWarn } from "@/lib/log";
import { generateShareToken } from "@/lib/shareTokens";
import { isSupabaseConfigured, supabase } from "@/lib/supabase/client";

const supabaseWarning = isSupabaseConfigured
  ? null
  : "Supabase mode is enabled but missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY. Add both to .env.local and restart the dev server.";

const notImplementedWarning =
  "Supabase mode is enabled, but this repository method is not implemented yet.";

const warnNotImplemented = (() => {
  let warned = false;
  return () => {
    if (warned) {
      return;
    }
    warned = true;
    logWarn(notImplementedWarning);
  };
})();

const notImplementedError = () => {
  warnNotImplemented();
  return new Error(notImplementedWarning);
};

const notImplementedValue = <T,>(fallback: T): T => {
  warnNotImplemented();
  return fallback;
};

const markUnused = (..._args: unknown[]) => {
  void _args;
};

const defaultPreferences: ClientPreferences = {
  homeAirports: [],
  cabinPref: "Economy",
  flexibilityDays: 0,
};

const defaultBalances: ClientBalances = {
  amexMR: 0,
  chaseUR: 0,
  cap1: 0,
  united: 0,
  hyatt: 0,
  marriott: 0,
};

type SupabaseClientRow = {
  id: string;
  full_name: string;
  email: string;
  phone: string | null;
  status: Client["status"];
  assigned_agent_id: string | null;
  preferences: ClientPreferences;
  balances: ClientBalances;
  created_at: string;
};

type SupabaseTripRow = {
  id: string;
  client_id: string;
  title: string;
  origin: string;
  destination: string;
  date_start: string;
  date_end: string;
  flexibility_days: number;
  passengers: number;
  cabin_pref: Trip["cabinPref"];
  cash_budget: number | null;
  status: Trip["status"];
  assigned_agent_id: string | null;
  notes: string | null;
  intake: TripIntake;
  pinned_award_option_id: string | null;
  created_at: string;
};

type SupabaseAwardOptionRow = {
  id: string;
  trip_id: string;
  program: string;
  route: string;
  miles_required: number;
  fees_usd: number;
  cash_equivalent_usd: number | null;
  transfer_required: boolean;
  transfer_time: AwardOption["transferTime"];
  badges: string[] | null;
  created_at: string;
};

type SupabaseItineraryRow = {
  id: string;
  trip_id: string;
  generated_at: string;
  option_a_id: string;
  backup_option_ids: string[] | null;
  share_token: string | null;
  notes: string | null;
};

type SupabaseCommunicationRow = {
  id: string;
  client_id: string;
  trip_id: string | null;
  type: string;
  summary: string;
  created_at: string;
  created_by: string | null;
};

type SupabaseState = {
  clients: Client[];
  trips: Trip[];
  itineraries: Itinerary[];
  communicationEntries: CommunicationEntry[];
  isHydrated: boolean;
};

let supabaseState: SupabaseState = {
  clients: [],
  trips: [],
  itineraries: [],
  communicationEntries: [],
  isHydrated: false,
};

const supabaseListeners = new Set<() => void>();

const notifySupabaseListeners = () => {
  supabaseListeners.forEach((listener) => listener());
};

const subscribeSupabase = (listener: () => void) => {
  supabaseListeners.add(listener);
  return () => supabaseListeners.delete(listener);
};

const getSupabaseSnapshot = () => supabaseState;

const supabaseServerSnapshot: SupabaseState = {
  clients: [],
  trips: [],
  itineraries: [],
  communicationEntries: [],
  isHydrated: false,
};

const setSupabaseState = (updater: (state: SupabaseState) => SupabaseState) => {
  supabaseState = updater(supabaseState);
  notifySupabaseListeners();
};

const mapClientRow = (row: SupabaseClientRow): Client => ({
  id: row.id,
  fullName: row.full_name,
  email: row.email,
  phone: row.phone ?? "",
  status: row.status,
  assignedAgentName: row.assigned_agent_id ? "Assigned Agent" : "Unassigned",
  preferences: { ...defaultPreferences, ...(row.preferences ?? {}) },
  balances: { ...defaultBalances, ...(row.balances ?? {}) },
  createdAt: row.created_at,
});

const mapAwardOptionRow = (row: SupabaseAwardOptionRow): AwardOption => ({
  id: row.id,
  tripId: row.trip_id,
  program: row.program,
  route: row.route,
  milesRequired: row.miles_required,
  feesUSD: Number(row.fees_usd),
  cashEquivalentUSD: row.cash_equivalent_usd ?? undefined,
  transferRequired: row.transfer_required,
  transferTime: row.transfer_time,
  badges: row.badges ?? [],
  createdAt: row.created_at,
});

const mapTripRow = (
  row: SupabaseTripRow,
  awardOptions: AwardOption[],
  clientName?: string
): Trip =>
  ({
    id: row.id,
    clientId: row.client_id,
    title: row.title,
    origin: row.origin,
    destination: row.destination,
    dateStart: row.date_start,
    dateEnd: row.date_end,
    flexibilityDays: row.flexibility_days,
    passengers: row.passengers,
    cabinPref: row.cabin_pref,
    cashBudget: row.cash_budget ?? undefined,
    status: row.status,
    assignedAgentName: row.assigned_agent_id ? "Assigned Agent" : "Unassigned",
    notes: row.notes ?? undefined,
    intake: { ...defaultTripIntake, ...(row.intake ?? {}) },
    awardOptions,
    hotelOptions: [],
    pinnedAwardOptionId: row.pinned_award_option_id ?? undefined,
    ...(clientName ? { clientName } : {}),
  } as Trip);

const mapItineraryRow = (row: SupabaseItineraryRow): Itinerary => ({
  id: row.id,
  tripId: row.trip_id,
  generatedAt: row.generated_at,
  optionAId: row.option_a_id,
  backupOptionIds: row.backup_option_ids ?? [],
  shareToken: row.share_token ?? undefined,
  notes: row.notes ?? undefined,
});

const mapCommunicationRow = (
  row: SupabaseCommunicationRow
): CommunicationEntry => ({
  id: row.id,
  clientId: row.client_id,
  tripId: row.trip_id ?? undefined,
  type: row.type,
  summary: row.summary,
  createdAt: row.created_at,
  createdBy: row.created_by ?? "System",
});

const buildTripsFromRows = (
  tripRows: SupabaseTripRow[],
  awardRows: SupabaseAwardOptionRow[],
  clients: Client[]
) => {
  const awardOptions = awardRows.map(mapAwardOptionRow);
  const awardOptionsByTrip = new Map<string, AwardOption[]>();

  awardOptions.forEach((option) => {
    const options = awardOptionsByTrip.get(option.tripId) ?? [];
    options.push(option);
    awardOptionsByTrip.set(option.tripId, options);
  });

  const clientNameById = new Map(
    clients.map((client) => [client.id, client.fullName])
  );

  return tripRows.map((row) =>
    mapTripRow(
      row,
      awardOptionsByTrip.get(row.id) ?? [],
      clientNameById.get(row.client_id)
    )
  );
};

const toClientInsert = (client: Client) => ({
  id: client.id,
  full_name: client.fullName,
  email: client.email,
  phone: client.phone || null,
  status: client.status,
  assigned_agent_id: null,
  preferences: client.preferences,
  balances: client.balances,
  created_at: client.createdAt,
});

const toClientUpdate = (client: Client) => ({
  full_name: client.fullName,
  email: client.email,
  phone: client.phone || null,
  status: client.status,
  assigned_agent_id: null,
  preferences: client.preferences,
  balances: client.balances,
});

const toTripInsert = (trip: Trip) => ({
  id: trip.id,
  client_id: trip.clientId,
  title: trip.title,
  origin: trip.origin,
  destination: trip.destination,
  date_start: trip.dateStart,
  date_end: trip.dateEnd,
  flexibility_days: trip.flexibilityDays,
  passengers: trip.passengers,
  cabin_pref: trip.cabinPref,
  cash_budget: trip.cashBudget ?? null,
  status: trip.status,
  assigned_agent_id: null,
  notes: trip.notes ?? null,
  intake: trip.intake,
  pinned_award_option_id: trip.pinnedAwardOptionId ?? null,
});

const toTripUpdate = (trip: Trip) => ({
  client_id: trip.clientId,
  title: trip.title,
  origin: trip.origin,
  destination: trip.destination,
  date_start: trip.dateStart,
  date_end: trip.dateEnd,
  flexibility_days: trip.flexibilityDays,
  passengers: trip.passengers,
  cabin_pref: trip.cabinPref,
  cash_budget: trip.cashBudget ?? null,
  status: trip.status,
  notes: trip.notes ?? null,
  intake: trip.intake,
  pinned_award_option_id: trip.pinnedAwardOptionId ?? null,
});

const toAwardOptionInsert = (tripId: string, option: AwardOption) => ({
  id: option.id,
  trip_id: tripId,
  program: option.program,
  route: option.route,
  miles_required: option.milesRequired,
  fees_usd: option.feesUSD,
  cash_equivalent_usd: option.cashEquivalentUSD ?? null,
  transfer_required: option.transferRequired,
  transfer_time: option.transferTime,
  badges: option.badges ?? [],
  created_at: option.createdAt,
});

const toItineraryInsert = (itinerary: Itinerary) => ({
  id: itinerary.id,
  trip_id: itinerary.tripId,
  generated_at: itinerary.generatedAt,
  option_a_id: itinerary.optionAId,
  backup_option_ids: itinerary.backupOptionIds ?? [],
  share_token: itinerary.shareToken ?? null,
  notes: itinerary.notes ?? null,
});

const toItineraryUpdate = (itinerary: Itinerary) => ({
  trip_id: itinerary.tripId,
  generated_at: itinerary.generatedAt,
  option_a_id: itinerary.optionAId,
  backup_option_ids: itinerary.backupOptionIds ?? [],
  share_token: itinerary.shareToken ?? null,
  notes: itinerary.notes ?? null,
});

const toCommunicationInsert = (entry: CommunicationEntry) => ({
  id: entry.id,
  client_id: entry.clientId,
  trip_id: entry.tripId ?? null,
  type: entry.type,
  summary: entry.summary,
  created_at: entry.createdAt,
  created_by: null,
});

const toAwardOptionPatch = (patch: Partial<AwardOption>) => {
  const update: Partial<SupabaseAwardOptionRow> = {};

  if (patch.program !== undefined) {
    update.program = patch.program;
  }
  if (patch.route !== undefined) {
    update.route = patch.route;
  }
  if (patch.milesRequired !== undefined) {
    update.miles_required = patch.milesRequired;
  }
  if (patch.feesUSD !== undefined) {
    update.fees_usd = patch.feesUSD;
  }
  if (patch.cashEquivalentUSD !== undefined) {
    update.cash_equivalent_usd = patch.cashEquivalentUSD ?? null;
  }
  if (patch.transferRequired !== undefined) {
    update.transfer_required = patch.transferRequired;
  }
  if (patch.transferTime !== undefined) {
    update.transfer_time = patch.transferTime;
  }
  if (patch.badges !== undefined) {
    update.badges = patch.badges ?? [];
  }
  if (patch.createdAt !== undefined) {
    update.created_at = patch.createdAt;
  }

  return update;
};

const getClientName = (clientId: string) =>
  getSupabaseSnapshot().clients.find((client) => client.id === clientId)
    ?.fullName;

const withClientName = (trip: Trip) => {
  const clientName = getClientName(trip.clientId);
  if (!clientName) {
    return trip;
  }
  return { ...trip, clientName } as Trip;
};

const hydrateSupabaseState = async () => {
  if (!supabase) {
    setSupabaseState((prev) => ({ ...prev, isHydrated: true }));
    return;
  }

  const [
    clientsResult,
    tripsResult,
    awardOptionsResult,
    itinerariesResult,
    communicationsResult,
  ] =
    await Promise.all([
      supabase.from("clients").select("*").order("created_at", {
        ascending: false,
      }),
      supabase.from("trips").select("*").order("created_at", {
        ascending: false,
      }),
      supabase.from("award_options").select("*").order("created_at", {
        ascending: false,
      }),
      supabase.from("itineraries").select("*").order("generated_at", {
        ascending: false,
      }),
      supabase.from("communications").select("*").order("created_at", {
        ascending: false,
      }),
    ]);

  if (clientsResult.error) {
    logError("Failed to load clients", clientsResult.error);
  }
  if (tripsResult.error) {
    logError("Failed to load trips", tripsResult.error);
  }
  if (awardOptionsResult.error) {
    logError("Failed to load award options", awardOptionsResult.error);
  }
  if (itinerariesResult.error) {
    logError("Failed to load itineraries", itinerariesResult.error);
  }
  if (communicationsResult.error) {
    logError("Failed to load communications", communicationsResult.error);
  }

  const clients = (clientsResult.data ?? []).map(mapClientRow);
  const trips = buildTripsFromRows(
    tripsResult.data ?? [],
    awardOptionsResult.data ?? [],
    clients
  );
  const itineraries = (itinerariesResult.data ?? []).map(mapItineraryRow);
  const communicationEntries = (communicationsResult.data ?? []).map(
    mapCommunicationRow
  );

  setSupabaseState((prev) => ({
    ...prev,
    clients,
    trips,
    itineraries,
    communicationEntries,
    isHydrated: true,
  }));
};

const updateTripState = (tripId: string, updater: (trip: Trip) => Trip) => {
  let nextTrip: Trip | null = null;
  setSupabaseState((prev) => {
    const trip = prev.trips.find((item) => item.id === tripId);
    if (!trip) {
      return prev;
    }
    if (isTripReadOnly(trip)) {
      return prev;
    }
    const updatedTrip = updater(trip);
    nextTrip = updatedTrip;
    return {
      ...prev,
      trips: prev.trips.map((item) =>
        item.id === tripId ? updatedTrip : item
      ),
    };
  });
  return nextTrip;
};

const updateClientState = (
  clientId: string,
  updater: (client: Client) => Client
) => {
  let nextClient: Client | null = null;
  setSupabaseState((prev) => {
    const client = prev.clients.find((item) => item.id === clientId);
    if (!client) {
      return prev;
    }
    const updatedClient = updater(client);
    nextClient = updatedClient;
    return {
      ...prev,
      clients: prev.clients.map((item) =>
        item.id === clientId ? updatedClient : item
      ),
    };
  });
  return nextClient;
};

const updateItineraryState = (
  itineraryId: string,
  updater: (itinerary: Itinerary) => Itinerary
) => {
  let nextItinerary: Itinerary | null = null;
  setSupabaseState((prev) => {
    const itinerary = prev.itineraries.find((item) => item.id === itineraryId);
    if (!itinerary) {
      return prev;
    }
    const updatedItinerary = updater(itinerary);
    nextItinerary = updatedItinerary;
    return {
      ...prev,
      itineraries: prev.itineraries.map((item) =>
        item.id === itineraryId ? updatedItinerary : item
      ),
    };
  });
  return nextItinerary;
};

const refreshTripClientName = (trip: Trip) => withClientName(trip);

const shareTokenFetches = new Set<string>();
const missingShareTokens = new Set<string>();

export const supabaseRepo = {
  dataMode: "supabase" as const,
  isSupabaseConfigured,
  supabaseWarning,

  listClients: (data?: PortalData | null) => data?.clients ?? [],
  getClient: (data: PortalData | null | undefined, id: string) =>
    data?.clients.find((client) => client.id === id) ?? null,
  createClient: (client: Client) => {
    if (!supabase) {
      return client;
    }

    setSupabaseState((prev) => ({
      ...prev,
      clients: [client, ...prev.clients],
    }));

    void supabase
      .from("clients")
      .insert(toClientInsert(client))
      .select("*")
      .single()
      .then(({ data, error }) => {
        if (error) {
          logError("Failed to create client", error);
          return;
        }
        if (!data) {
          return;
        }
        const mapped = mapClientRow(data as SupabaseClientRow);
        setSupabaseState((prev) => ({
          ...prev,
          clients: prev.clients.map((item) =>
            item.id === mapped.id ? mapped : item
          ),
        }));
      });

    return client;
  },
  updateClient: (clientId: string, updater: (client: Client) => Client) => {
    const updatedClient = updateClientState(clientId, updater);
    if (!updatedClient || !supabase) {
      return;
    }

    void supabase
      .from("clients")
      .update(toClientUpdate(updatedClient))
      .eq("id", clientId)
      .then(({ error }) => {
        if (error) {
          logError("Failed to update client", error);
        }
      });
  },

  listTrips: (data?: PortalData | null) => data?.trips ?? [],
  getTrip: (data: PortalData | null | undefined, id: string) =>
    data?.trips.find((trip) => trip.id === id) ?? null,
  createTrip: (trip: Trip) => {
    if (!supabase) {
      return trip;
    }

    const nextTrip = refreshTripClientName(trip);
    setSupabaseState((prev) => ({
      ...prev,
      trips: [nextTrip, ...prev.trips],
    }));

    void supabase
      .from("trips")
      .insert(toTripInsert(trip))
      .select("*")
      .single()
      .then(({ data, error }) => {
        if (error) {
          logError("Failed to create trip", error);
          return;
        }
        if (!data) {
          return;
        }
        const mappedTrip = mapTripRow(
          data as SupabaseTripRow,
          trip.awardOptions ?? [],
          getClientName(trip.clientId)
        );
        setSupabaseState((prev) => ({
          ...prev,
          trips: prev.trips.map((item) =>
            item.id === mappedTrip.id ? mappedTrip : item
          ),
        }));
      });

    return trip;
  },
  updateTrip: (tripId: string, updater: (trip: Trip) => Trip) => {
    const previousTrip: Trip | undefined = supabaseState.trips.find(
      (item) => item.id === tripId
    );
    const updatedTrip = updateTripState(tripId, updater);
    if (!updatedTrip || !supabase || isTripReadOnly(updatedTrip)) {
      return;
    }

    if (
      previousTrip &&
      previousTrip.status !== updatedTrip.status &&
      (updatedTrip.status === "Sent" ||
        updatedTrip.status === "Booked" ||
        updatedTrip.status === "Closed")
    ) {
      const entryId =
        typeof crypto !== "undefined" && "randomUUID" in crypto
          ? crypto.randomUUID()
          : `comm_${Date.now()}`;
      supabaseRepo.createCommunicationEntry({
        id: entryId,
        clientId: updatedTrip.clientId,
        tripId: updatedTrip.id,
        type: "Status Update",
        summary: `Trip marked ${updatedTrip.status}.`,
        createdAt: new Date().toISOString(),
        createdBy: "System",
      });
    }

    void supabase
      .from("trips")
      .update(toTripUpdate(updatedTrip))
      .eq("id", tripId)
      .then(({ error }) => {
        if (error) {
          logError("Failed to update trip", error);
        }
      });
  },

  listItineraries: (data?: PortalData | null) => data?.itineraries ?? [],
  getItinerary: (data: PortalData | null | undefined, id: string) =>
    data?.itineraries.find((itinerary) => itinerary.id === id) ?? null,
  getItineraryByShareToken: (
    data: PortalData | null | undefined,
    token: string
  ) => {
    const match =
      data?.itineraries.find((itinerary) => itinerary.shareToken === token) ??
      null;
    if (supabase && !missingShareTokens.has(token) && !shareTokenFetches.has(token)) {
      shareTokenFetches.add(token);
      void supabase
        .from("itineraries")
        .select("*")
        .eq("share_token", token)
        .maybeSingle()
        .then(({ data: row, error }) => {
          shareTokenFetches.delete(token);
          if (error) {
            logError("Failed to load itinerary by share token", error);
            return;
          }
          if (!row) {
            missingShareTokens.add(token);
            setSupabaseState((prev) => ({ ...prev }));
            return;
          }
          const mapped = mapItineraryRow(row as SupabaseItineraryRow);
          setSupabaseState((prev) => {
            if (prev.itineraries.some((item) => item.id === mapped.id)) {
              return prev;
            }
            return { ...prev, itineraries: [mapped, ...prev.itineraries] };
          });
        });
    }
    return match;
  },
  createItinerary: (itinerary: Itinerary) => {
    if (!supabase) {
      return itinerary;
    }

    setSupabaseState((prev) => ({
      ...prev,
      itineraries: [itinerary, ...prev.itineraries],
    }));

    void supabase
      .from("itineraries")
      .insert(toItineraryInsert(itinerary))
      .select("*")
      .single()
      .then(({ data, error }) => {
        if (error) {
          logError("Failed to create itinerary", error);
          return;
        }
        if (!data) {
          return;
        }
        const mapped = mapItineraryRow(data as SupabaseItineraryRow);
        setSupabaseState((prev) => ({
          ...prev,
          itineraries: prev.itineraries.map((item) =>
            item.id === mapped.id ? mapped : item
          ),
        }));
      });

    return itinerary;
  },
  updateItinerary: (
    itineraryId: string,
    updater: (itinerary: Itinerary) => Itinerary
  ) => {
    const updatedItinerary = updateItineraryState(itineraryId, updater);
    if (!updatedItinerary || !supabase) {
      return;
    }

    void supabase
      .from("itineraries")
      .update(toItineraryUpdate(updatedItinerary))
      .eq("id", itineraryId)
      .then(({ error }) => {
        if (error) {
          logError("Failed to update itinerary", error);
        }
      });
  },
  regenerateShareToken: (itineraryId: string) => {
    const nextToken = generateShareToken();
    const updatedItinerary = updateItineraryState(itineraryId, (current) => ({
      ...current,
      shareToken: nextToken,
    }));
    if (!updatedItinerary || !supabase) {
      return nextToken;
    }
    void supabase
      .from("itineraries")
      .update({ share_token: nextToken })
      .eq("id", itineraryId)
      .then(({ error }) => {
        if (error) {
          logError("Failed to regenerate share token", error);
        }
      });
    return nextToken;
  },
  isShareTokenMissing: (token: string) => missingShareTokens.has(token),

  listKnowledgeArticles: (data?: PortalData | null) =>
    // TODO: Replace with Supabase SELECT on knowledge articles.
    notImplementedValue(data?.knowledgeArticles ?? []),
  getKnowledgeArticle: (data: PortalData | null | undefined, id: string) =>
    // TODO: Replace with Supabase SELECT by id.
    notImplementedValue(
      data?.knowledgeArticles.find((article) => article.id === id) ?? null
    ),
  createKnowledgeArticle: (_article: KnowledgeArticle) => {
    // TODO: Replace with Supabase INSERT for knowledge articles.
    markUnused(_article);
    return notImplementedError();
  },
  updateKnowledgeArticle: (
    _articleId: string,
    _updater: (article: KnowledgeArticle) => KnowledgeArticle
  ) => {
    // TODO: Replace with Supabase UPDATE for knowledge articles.
    markUnused(_articleId, _updater);
    return notImplementedError();
  },

  listCommunicationEntries: (data?: PortalData | null) =>
    data?.communicationEntries ?? [],
  listCommunications: (clientId: string, tripId?: string) => {
    const entries = supabaseState.communicationEntries.filter((entry) => {
      if (entry.clientId !== clientId) {
        return false;
      }
      if (tripId && entry.tripId !== tripId) {
        return false;
      }
      return true;
    });
    return entries;
  },
  createCommunicationEntry: (entry: CommunicationEntry) => {
    if (!supabase) {
      return entry;
    }

    setSupabaseState((prev) => ({
      ...prev,
      communicationEntries: [entry, ...prev.communicationEntries],
    }));

    void supabase
      .from("communications")
      .insert(toCommunicationInsert(entry))
      .select("*")
      .single()
      .then(({ data, error }) => {
        if (error) {
          logError("Failed to create communication entry", error);
          return;
        }
        if (!data) {
          return;
        }
        const mapped = mapCommunicationRow(data as SupabaseCommunicationRow);
        setSupabaseState((prev) => ({
          ...prev,
          communicationEntries: prev.communicationEntries.map((item) =>
            item.id === mapped.id ? mapped : item
          ),
        }));
      });

    return entry;
  },
  createCommunication: (entry: CommunicationEntry) =>
    supabaseRepo.createCommunicationEntry(entry),

  listAuditLog: (data?: PortalData | null) =>
    // TODO: Replace with Supabase SELECT on audit log.
    notImplementedValue(data?.auditLog ?? []),
  clearAuditLog: (_actor: { name: string; role: string }) => {
    // TODO: Replace with Supabase DELETE for audit log (admin-only).
    markUnused(_actor);
    return notImplementedError();
  },

  getAwardSearchIntegrations: (data?: PortalData | null) =>
    // TODO: Replace with Supabase SELECT for integrations.
    notImplementedValue(data?.awardSearchIntegrations ?? null),
  updateAwardSearchIntegrations: (
    _patch: Partial<{
      pointMe: Partial<AwardSearchIntegrationsSettings["pointMe"]>;
      roame: Partial<AwardSearchIntegrationsSettings["roame"]>;
    }>
  ) => {
    // TODO: Replace with Supabase UPDATE for integrations.
    markUnused(_patch);
    return notImplementedError();
  },

  usePortalData: () => {
    const base = useLocalPortalData();
    const supabaseSnapshot = useSyncExternalStore(
      subscribeSupabase,
      getSupabaseSnapshot,
      () => supabaseServerSnapshot
    );

    useEffect(() => {
      if (!isSupabaseConfigured) {
        setSupabaseState((prev) => ({
          ...prev,
          clients: base.data?.clients ?? [],
          trips: base.data?.trips ?? [],
          itineraries: base.data?.itineraries ?? [],
          communicationEntries: base.data?.communicationEntries ?? [],
          isHydrated: true,
        }));
        return;
      }

      if (!supabaseSnapshot.isHydrated) {
        void hydrateSupabaseState();
      }
    }, [
      base.data?.clients,
      base.data?.trips,
      supabaseSnapshot.isHydrated,
    ]);

    const mergedData = base.data
      ? {
          ...base.data,
          clients: isSupabaseConfigured
            ? supabaseSnapshot.clients
            : base.data.clients,
          trips: isSupabaseConfigured
            ? supabaseSnapshot.trips
            : base.data.trips,
          itineraries: isSupabaseConfigured
            ? supabaseSnapshot.itineraries
            : base.data.itineraries,
          communicationEntries: isSupabaseConfigured
            ? supabaseSnapshot.communicationEntries
            : base.data.communicationEntries,
        }
      : null;

    return {
      ...base,
      data: mergedData,
      isHydrated: isSupabaseConfigured
        ? base.isHydrated && supabaseSnapshot.isHydrated
        : base.isHydrated,
    };
  },
  isTripReadOnly,
  addAwardOption: async (tripId: string, option: AwardOption) => {
    const previousTrip = supabaseState.trips.find((trip) => trip.id === tripId);
    const updatedTrip = updateTripState(tripId, (trip) => ({
      ...trip,
      awardOptions: [{ ...option, tripId }, ...trip.awardOptions],
    }));

    if (!updatedTrip || !supabase || isTripReadOnly(updatedTrip)) {
      return;
    }

    const { error } = await supabase
      .from("award_options")
      .insert(toAwardOptionInsert(tripId, option));

    if (error) {
      logError("Failed to add award option", error);
      if (previousTrip) {
        setSupabaseState((prev) => ({
          ...prev,
          trips: prev.trips.map((trip) =>
            trip.id === tripId ? previousTrip : trip
          ),
        }));
      }
      throw error;
    }
  },
  updateAwardOption: (
    tripId: string,
    optionId: string,
    patch: Partial<AwardOption>
  ) => {
    const updatedTrip = updateTripState(tripId, (trip) => ({
      ...trip,
      awardOptions: trip.awardOptions.map((option) =>
        option.id === optionId ? { ...option, ...patch } : option
      ),
    }));

    if (!updatedTrip || !supabase || isTripReadOnly(updatedTrip)) {
      return;
    }

    const update = toAwardOptionPatch(patch);
    if (!Object.keys(update).length) {
      return;
    }

    void supabase
      .from("award_options")
      .update(update)
      .eq("id", optionId)
      .then(({ error }) => {
        if (error) {
          logError("Failed to update award option", error);
        }
      });
  },
  removeAwardOption: (tripId: string, optionId: string) => {
    const updatedTrip = updateTripState(tripId, (trip) => ({
      ...trip,
      awardOptions: trip.awardOptions.filter((option) => option.id !== optionId),
    }));

    if (!updatedTrip || !supabase || isTripReadOnly(updatedTrip)) {
      return;
    }

    void supabase
      .from("award_options")
      .delete()
      .eq("id", optionId)
      .then(({ error }) => {
        if (error) {
          logError("Failed to remove award option", error);
        }
      });
  },
  setPinnedAwardOption: (tripId: string, optionId: string) => {
    const updatedTrip = updateTripState(tripId, (trip) => {
      const exists = trip.awardOptions.some((option) => option.id === optionId);
      if (!exists || trip.pinnedAwardOptionId === optionId) {
        return trip;
      }
      return {
        ...trip,
        pinnedAwardOptionId: optionId,
      };
    });

    if (!updatedTrip || !supabase || isTripReadOnly(updatedTrip)) {
      return;
    }

    void supabase
      .from("trips")
      .update({ pinned_award_option_id: optionId })
      .eq("id", tripId)
      .then(({ error }) => {
        if (error) {
          logError("Failed to pin award option", error);
        }
      });
  },
};
