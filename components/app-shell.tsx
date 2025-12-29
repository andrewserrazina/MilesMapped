"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import SidebarNav from "@/components/sidebar-nav";
import { Input } from "@/components/ui/input";
import { portalRepo } from "@/lib/portalRepo";

export default function AppShell({ children }: { children: React.ReactNode }) {
  const { data: portalData } = portalRepo.usePortalData();
  const clients = portalRepo.listClients(portalData);
  const trips = portalRepo.listTrips(portalData);
  const [query, setQuery] = useState("");
  const normalizedQuery = query.trim().toLowerCase();

  const clientResults = useMemo(() => {
    if (!normalizedQuery) {
      return [];
    }

    return clients.filter((client) => {
      return (
        client.fullName.toLowerCase().includes(normalizedQuery) ||
        client.email.toLowerCase().includes(normalizedQuery)
      );
    });
  }, [clients, normalizedQuery]);

  const tripResults = useMemo(() => {
    if (!normalizedQuery) {
      return [];
    }

    return trips.filter((trip) => {
      const client = portalRepo.getClient(portalData, trip.clientId);
      const route = `${trip.origin} ${trip.destination}`.toLowerCase();
      return (
        trip.title.toLowerCase().includes(normalizedQuery) ||
        route.includes(normalizedQuery) ||
        client?.fullName.toLowerCase().includes(normalizedQuery)
      );
    });
  }, [normalizedQuery, portalData, trips]);

  const showResults = normalizedQuery.length > 0;

  return (
    <div className="flex min-h-screen bg-slate-100">
      <aside className="hidden w-64 flex-col border-r border-slate-200 bg-white p-6 md:flex print-hidden">
        <div className="mb-8">
          <div className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">
            MilesMapped
          </div>
          <h1 className="text-xl font-semibold text-slate-900">Agent Portal</h1>
        </div>
        <SidebarNav />
        <div className="mt-auto pt-8">
          <div className="flex items-center gap-3 rounded-lg border border-slate-200 bg-slate-50 p-3">
            <div className="h-10 w-10 rounded-full bg-slate-300" />
            <div>
              <p className="text-sm font-semibold text-slate-900">Agent Jordan</p>
              <p className="text-xs text-slate-500">Points Strategist</p>
            </div>
          </div>
        </div>
      </aside>
      <main className="flex-1 px-6 py-8 md:px-10">
        <div className="mx-auto w-full max-w-6xl space-y-6">
          <div className="flex items-center justify-between gap-4 print-hidden">
            <div className="relative w-full max-w-xl">
              <Input
                placeholder="Search clients or trips"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
              />
              {showResults ? (
                <div className="absolute left-0 right-0 top-full z-20 mt-2 rounded-lg border border-slate-200 bg-white shadow-lg">
                  <div className="border-b border-slate-100 px-4 py-2 text-xs font-semibold uppercase tracking-wide text-slate-400">
                    Clients
                  </div>
                  <div className="max-h-64 overflow-y-auto">
                    {clientResults.length ? (
                      clientResults.map((client) => (
                        <Link
                          key={client.id}
                          href={`/clients/${client.id}`}
                          className="block px-4 py-2 text-sm text-slate-700 hover:bg-slate-50"
                        >
                          <div className="font-medium text-slate-900">
                            {client.fullName}
                          </div>
                          <div className="text-xs text-slate-500">
                            {client.email}
                          </div>
                        </Link>
                      ))
                    ) : (
                      <p className="px-4 py-3 text-sm text-slate-500">
                        No matching clients.
                      </p>
                    )}
                  </div>
                  <div className="border-t border-slate-100 px-4 py-2 text-xs font-semibold uppercase tracking-wide text-slate-400">
                    Trips
                  </div>
                  <div className="max-h-64 overflow-y-auto">
                    {tripResults.length ? (
                      tripResults.map((trip) => {
                        const client = portalRepo.getClient(portalData, trip.clientId);
                        return (
                          <Link
                            key={trip.id}
                            href={`/trips/${trip.id}`}
                            className="block px-4 py-2 text-sm text-slate-700 hover:bg-slate-50"
                          >
                            <div className="font-medium text-slate-900">
                              {trip.title}
                            </div>
                            <div className="text-xs text-slate-500">
                              {client?.fullName ?? "Unknown client"} · {trip.origin} →{" "}
                              {trip.destination}
                            </div>
                          </Link>
                        );
                      })
                    ) : (
                      <p className="px-4 py-3 text-sm text-slate-500">
                        No matching trips.
                      </p>
                    )}
                  </div>
                </div>
              ) : null}
            </div>
          </div>
          {children}
        </div>
      </main>
    </div>
  );
}
