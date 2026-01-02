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

type SupabaseState = {
  clients: Client[];
  trips: Trip[];
  isHydrated: boolean;
};

let supabaseState: SupabaseState = {
  clients: [],
  trips: [],
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

  const [clientsResult, tripsResult, awardOptionsResult] =
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

  const clients = (clientsResult.data ?? []).map(mapClientRow);
  const trips = buildTripsFromRows(
    tripsResult.data ?? [],
    awardOptionsResult.data ?? [],
    clients
  );

  setSupabaseState((prev) => ({ ...prev, clients, trips, isHydrated: true }));
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

const refreshTripClientName = (trip: Trip) => withClientName(trip);

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
    const updatedTrip = updateTripState(tripId, updater);
    if (!updatedTrip || !supabase || isTripReadOnly(updatedTrip)) {
      return;
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

  listItineraries: (data?: PortalData | null) =>
    // TODO: Replace with Supabase SELECT on itineraries.
    notImplementedValue(data?.itineraries ?? []),
  getItinerary: (data: PortalData | null | undefined, id: string) =>
    // TODO: Replace with Supabase SELECT by id.
    notImplementedValue(
      data?.itineraries.find((itinerary) => itinerary.id === id) ?? null
    ),
  getItineraryByShareToken: (
    data: PortalData | null | undefined,
    token: string
  ) =>
    // TODO: Replace with Supabase SELECT by share token.
    notImplementedValue(
      data?.itineraries.find((itinerary) => itinerary.shareToken === token) ??
        null
    ),
  createItinerary: (_itinerary: Itinerary) => {
    // TODO: Replace with Supabase INSERT for itineraries.
    markUnused(_itinerary);
    return notImplementedError();
  },
  updateItinerary: (
    _itineraryId: string,
    _updater: (itinerary: Itinerary) => Itinerary
  ) => {
    // TODO: Replace with Supabase UPDATE for itineraries.
    markUnused(_itineraryId, _updater);
    return notImplementedError();
  },

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
    // TODO: Replace with Supabase SELECT on communication entries.
    notImplementedValue(data?.communicationEntries ?? []),
  createCommunicationEntry: (_entry: CommunicationEntry) => {
    // TODO: Replace with Supabase INSERT for communication entries.
    markUnused(_entry);
    return notImplementedError();
  },

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
      isSupabaseConfigured,
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
  addAwardOption: (tripId: string, option: AwardOption) => {
    const updatedTrip = updateTripState(tripId, (trip) => ({
      ...trip,
      awardOptions: [{ ...option, tripId }, ...trip.awardOptions],
    }));

    if (!updatedTrip || !supabase || isTripReadOnly(updatedTrip)) {
      return;
    }

    void supabase
      .from("award_options")
      .insert(toAwardOptionInsert(tripId, option))
      .then(({ error }) => {
        if (error) {
          logError("Failed to add award option", error);
        }
      });
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
