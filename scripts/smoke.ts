import type { PortalData } from "@/lib/portalStore";
import type { Client, Trip } from "@/lib/types";
import { knowledgeArticles, clients, itineraries, trips } from "@/lib/mock/data";
import { logError, logInfo } from "@/lib/log";
import { localRepo } from "@/lib/repo/localRepo";
import {
  getClosedStatusRule,
  getItineraryGenerationRule,
  getSearchingTransitionRule,
  getSentStatusRule,
  getStatusTransitionRule,
} from "@/lib/sop/rules";

const seedPortalData: PortalData = {
  schemaVersion: 3,
  clients,
  trips,
  itineraries,
  communicationEntries: [],
  awardSearchIntegrations: {
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
  },
  knowledgeArticles,
  auditLog: [],
};

function assert(condition: boolean, message: string) {
  if (!condition) {
    throw new Error(message);
  }
}

function runSmokeChecks() {
  const seededClients: Client[] = localRepo.listClients(seedPortalData);
  const seededTrips: Trip[] = localRepo.listTrips(seedPortalData);

  assert(seededClients.length > 0, "Expected at least one client in mock seed.");
  assert(seededTrips.length > 0, "Expected at least one trip in mock seed.");

  const sampleTrip = seededTrips[0];

  getSearchingTransitionRule(sampleTrip);
  getItineraryGenerationRule(sampleTrip);
  getSentStatusRule(sampleTrip, seedPortalData.itineraries);
  getClosedStatusRule(sampleTrip);
  getStatusTransitionRule(sampleTrip, "Searching", seedPortalData.itineraries);
}

try {
  runSmokeChecks();
  logInfo("Smoke checks passed.");
} catch (error) {
  logError("Smoke checks failed.", error);
  process.exitCode = 1;
}
