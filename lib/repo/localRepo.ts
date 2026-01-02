"use client";

import type {
  AwardSearchIntegrationsSettings,
  Client,
  CommunicationEntry,
  Itinerary,
  KnowledgeArticle,
  Trip,
} from "@/lib/types";
import {
  addAwardOption,
  addClient,
  addCommunicationEntry,
  addItinerary,
  addKnowledgeArticle,
  addTrip,
  clearAuditLog,
  isTripReadOnly,
  removeAwardOption,
  setPinnedAwardOption,
  updateItinerary,
  updateAwardSearchIntegrations,
  updateAwardOption,
  updateClient,
  updateKnowledgeArticle,
  updateTrip,
  usePortalData,
  type PortalData,
} from "@/lib/portalStore";

export const localRepo = {
  dataMode: "local" as const,
  isSupabaseConfigured: true,
  supabaseWarning: null as string | null,

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
  getItineraryByShareToken: (
    data: PortalData | null | undefined,
    token: string
  ) =>
    data?.itineraries.find((itinerary) => itinerary.shareToken === token) ?? null,
  createItinerary: (itinerary: Itinerary) => {
    addItinerary(itinerary);
    return itinerary;
  },
  updateItinerary: (
    itineraryId: string,
    updater: (itinerary: Itinerary) => Itinerary
  ) => {
    updateItinerary(itineraryId, updater);
  },

  listKnowledgeArticles: (
    data?: PortalData | null
  ): PortalData["knowledgeArticles"] => data?.knowledgeArticles ?? [],
  getKnowledgeArticle: (
    data: PortalData | null | undefined,
    id: string
  ): PortalData["knowledgeArticles"][number] | null =>
    data?.knowledgeArticles.find((article) => article.id === id) ?? null,
  createKnowledgeArticle: (article: KnowledgeArticle) => {
    addKnowledgeArticle(article);
    return article;
  },
  updateKnowledgeArticle: (
    articleId: string,
    updater: (article: KnowledgeArticle) => KnowledgeArticle
  ) => {
    updateKnowledgeArticle(articleId, updater);
  },

  listCommunicationEntries: (
    data?: PortalData | null
  ): PortalData["communicationEntries"] => data?.communicationEntries ?? [],
  createCommunicationEntry: (entry: CommunicationEntry) => {
    addCommunicationEntry(entry);
    return entry;
  },

  listAuditLog: (data?: PortalData | null) => data?.auditLog ?? [],
  clearAuditLog: (actor: { name: string; role: string }) =>
    clearAuditLog(actor),

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

  usePortalData,
  isTripReadOnly,
  addAwardOption,
  updateAwardOption,
  removeAwardOption,
  setPinnedAwardOption,
};
