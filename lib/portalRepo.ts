"use client";

import type { Client, Trip } from "@/lib/types";
import { addClient, addTrip } from "@/lib/portalStore";

export const portalRepo = {
  createClient: (client: Client) => {
    addClient(client);
    return client;
  },
  createTrip: (trip: Trip) => {
    addTrip(trip);
    return trip;
  },
};
