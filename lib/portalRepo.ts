"use client";

import type {
  AwardSearchIntegrationsSettings,
  Client,
  Itinerary,
  KnowledgeArticle,
  Trip,
} from "@/lib/types";
import {
  addAwardOption,
  addClient,
  addItinerary,
  addTrip,
  isTripReadOnly,
  removeAwardOption,
  setPinnedAwardOption,
  updateAwardSearchIntegrations,
  updateAwardOption,
  updateClient,
  updateTrip,
  usePortalData,
  type PortalData,
} from "@/lib/portalStore";

// Supabase replacement notes:
// - Replace reads that call list/get helpers with SELECT queries against the
//   clients, trips, and itineraries tables.
// - Replace writes that call create/update helpers with INSERT/UPDATE queries,
//   instead of localStorage-backed portalStore mutations.
export const portalRepo = {
  // Table mapping: clients table → listClients/getClient/createClient/updateClient.
  listClients: (data?: PortalData | null) => data?.clients ?? [],
  getClient: (data: PortalData | null | undefined, id: string) =>
    data?.clients.find((client) => client.id === id) ?? null,
  createClient: (client: Client) => {
    addClient(client);
    return client;
  },
  updateClient: (clientId: string, updater: (client: Client) => Client) => {
    updateClient(clientId, updater);
  },

  // Table mapping: trips table → listTrips/getTrip/createTrip/updateTrip.
  listTrips: (data?: PortalData | null) => data?.trips ?? [],
  getTrip: (data: PortalData | null | undefined, id: string) =>
    data?.trips.find((trip) => trip.id === id) ?? null,
  createTrip: (trip: Trip) => {
    addTrip(trip);
    return trip;
  },
  updateTrip: (tripId: string, updater: (trip: Trip) => Trip) => {
    updateTrip(tripId, updater);
  },

  // Table mapping: itineraries table → listItineraries/getItinerary/createItinerary.
  listItineraries: (data?: PortalData | null) => data?.itineraries ?? [],
  getItinerary: (data: PortalData | null | undefined, id: string) =>
    data?.itineraries.find((itinerary) => itinerary.id === id) ?? null,
  createItinerary: (itinerary: Itinerary) => {
    addItinerary(itinerary);
    return itinerary;
  },

  getAwardSearchIntegrations: (data?: PortalData | null) =>
    data?.awardSearchIntegrations ?? null,
  updateAwardSearchIntegrations: (
    patch: Partial<{
      pointMe: Partial<AwardSearchIntegrationsSettings["pointMe"]>;
      roame: Partial<AwardSearchIntegrationsSettings["roame"]>;
    }>
  ) => {
    updateAwardSearchIntegrations(patch);
  },

  listKnowledgeArticles: (data?: PortalData | null): KnowledgeArticle[] =>
    data?.knowledgeArticles ?? [],
  getKnowledgeArticle: (
    data: PortalData | null | undefined,
    id: string
  ): KnowledgeArticle | null =>
    data?.knowledgeArticles.find((article) => article.id === id) ?? null,

  usePortalData,
  isTripReadOnly,
  addAwardOption,
  updateAwardOption,
  removeAwardOption,
  setPinnedAwardOption,
};
