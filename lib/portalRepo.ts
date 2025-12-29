"use client";

import type { Client, Trip } from "@/lib/types";
import { addClient, addTrip, updateClient, updateTrip } from "@/lib/portalStore";

export const portalRepo = {
  createClient: (client: Client) => {
    addClient(client);
    return client;
  },
  createTrip: (trip: Trip) => {
    addTrip(trip);
    return trip;
  },
  updateClient: (clientId: string, updater: (client: Client) => Client) => {
    updateClient(clientId, updater);
  },
  updateTrip: (tripId: string, updater: (trip: Trip) => Trip) => {
    updateTrip(tripId, updater);
  },
};
