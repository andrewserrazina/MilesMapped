"use client";

import type {
  AwardSearchIntegrationsSettings,
  AwardOption,
  Client,
  CommunicationEntry,
  Itinerary,
  KnowledgeArticle,
  Trip,
} from "@/lib/types";
import { isTripReadOnly, usePortalData, type PortalData } from "@/lib/portalStore";

const supabaseWarning =
  "Supabase mode enabled but not configured yet.";

const warnNotImplemented = (() => {
  let warned = false;
  return () => {
    if (warned) {
      return;
    }
    warned = true;
    console.warn(supabaseWarning);
  };
})();

const notImplementedError = () => {
  warnNotImplemented();
  return new Error(supabaseWarning);
};

const notImplementedValue = <T,>(fallback: T): T => {
  warnNotImplemented();
  return fallback;
};

const markUnused = (..._args: unknown[]) => {
  void _args;
};

export const supabaseRepo = {
  dataMode: "supabase" as const,
  isSupabaseConfigured: false,
  supabaseWarning,

  listClients: (data?: PortalData | null) =>
    // TODO: Replace with Supabase SELECT on clients.
    notImplementedValue(data?.clients ?? []),
  getClient: (data: PortalData | null | undefined, id: string) =>
    // TODO: Replace with Supabase SELECT by id.
    notImplementedValue(data?.clients.find((client) => client.id === id) ?? null),
  createClient: (_client: Client) => {
    // TODO: Replace with Supabase INSERT for clients.
    markUnused(_client);
    return notImplementedError();
  },
  updateClient: (_clientId: string, _updater: (client: Client) => Client) => {
    // TODO: Replace with Supabase UPDATE for clients.
    markUnused(_clientId, _updater);
    return notImplementedError();
  },

  listTrips: (data?: PortalData | null) =>
    // TODO: Replace with Supabase SELECT on trips.
    notImplementedValue(data?.trips ?? []),
  getTrip: (data: PortalData | null | undefined, id: string) =>
    // TODO: Replace with Supabase SELECT by id.
    notImplementedValue(data?.trips.find((trip) => trip.id === id) ?? null),
  createTrip: (_trip: Trip) => {
    // TODO: Replace with Supabase INSERT for trips.
    markUnused(_trip);
    return notImplementedError();
  },
  updateTrip: (_tripId: string, _updater: (trip: Trip) => Trip) => {
    // TODO: Replace with Supabase UPDATE for trips.
    markUnused(_tripId, _updater);
    return notImplementedError();
  },

  listItineraries: (data?: PortalData | null) =>
    // TODO: Replace with Supabase SELECT on itineraries.
    notImplementedValue(data?.itineraries ?? []),
  getItinerary: (data: PortalData | null | undefined, id: string) =>
    // TODO: Replace with Supabase SELECT by id.
    notImplementedValue(
      data?.itineraries.find((itinerary) => itinerary.id === id) ?? null
    ),
  createItinerary: (_itinerary: Itinerary) => {
    // TODO: Replace with Supabase INSERT for itineraries.
    markUnused(_itinerary);
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

  usePortalData,
  isTripReadOnly,
  addAwardOption: (_tripId: string, _option: AwardOption) => {
    markUnused(_tripId, _option);
    return notImplementedError();
  },
  updateAwardOption: (
    _tripId: string,
    _optionId: string,
    _patch: Partial<AwardOption>
  ) => {
    markUnused(_tripId, _optionId, _patch);
    return notImplementedError();
  },
  removeAwardOption: (_tripId: string, _optionId: string) => {
    markUnused(_tripId, _optionId);
    return notImplementedError();
  },
  setPinnedAwardOption: (_tripId: string, _optionId: string) => {
    markUnused(_tripId, _optionId);
    return notImplementedError();
  },
};
