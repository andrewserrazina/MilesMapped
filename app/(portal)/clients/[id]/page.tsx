"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { useParams } from "next/navigation";
import PageHeader from "@/components/page-header";
import Tabs from "@/components/tabs";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { Client, Trip } from "@/lib/types";
import { usePortalData } from "@/lib/portalStore";

export default function ClientDetailPage() {
  const params = useParams<{ id: string }>();
  const { data: portalData, isHydrated } = usePortalData();
  const [notes, setNotes] = useState(
    "Meeting notes and client-specific follow-ups live here."
  );

  const client = useMemo(
    () => portalData?.clients.find((item) => item.id === params.id) ?? null,
    [params.id, portalData]
  );
  const trips = useMemo<Trip[]>(
    () =>
      portalData?.trips.filter((trip) => trip.clientId === client?.id) ?? [],
    [client, portalData]
  );

  if (!isHydrated) {
    return (
      <div className="space-y-6">
        <div className="rounded-xl border border-slate-200 bg-white p-6">
          <div className="h-4 w-32 animate-pulse rounded bg-slate-200" />
          <div className="mt-4 h-8 w-1/2 animate-pulse rounded bg-slate-100" />
          <div className="mt-6 h-32 w-full animate-pulse rounded bg-slate-100" />
        </div>
      </div>
    );
  }

  if (!client) {
    return (
      <Card>
        <CardContent className="p-6 text-sm text-slate-500">
          Client not found.
        </CardContent>
      </Card>
    );
  }

  const tabs = [
    {
      id: "overview",
      label: "Overview",
      content: (
        <div className="grid gap-6 lg:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Contact</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm text-slate-600">
              <p className="text-base font-semibold text-slate-900">
                {client.fullName}
              </p>
              <p>{client.email}</p>
              <p>{client.phone}</p>
              <div>
                <Badge variant="secondary">{client.status}</Badge>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Assigned Agent</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm text-slate-600">
              <p className="text-base font-semibold text-slate-900">
                {client.assignedAgentName}
              </p>
              <p className="text-xs text-slate-500">Client since {client.createdAt}</p>
            </CardContent>
          </Card>
        </div>
      ),
    },
    {
      id: "points",
      label: "Points & Miles",
      content: (
        <Card>
          <CardHeader>
            <CardTitle>Balances</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm text-slate-600">
            {Object.entries(client.balances).map(([key, value]) => {
              if (key === "other" && value && typeof value === "object") {
                return Object.entries(value as Record<string, number>).map(
                  ([program, points]) => (
                    <div
                      key={program}
                      className="flex items-center justify-between"
                    >
                      <span className="capitalize">{program}</span>
                      <span className="font-semibold text-slate-900">
                        {points.toLocaleString()}
                      </span>
                    </div>
                  )
                );
              }
              if (key === "other") {
                return null;
              }
              return (
                <div key={key} className="flex items-center justify-between">
                  <span className="capitalize">{key}</span>
                  <span className="font-semibold text-slate-900">
                    {Number(value).toLocaleString()}
                  </span>
                </div>
              );
            })}
          </CardContent>
        </Card>
      ),
    },
    {
      id: "preferences",
      label: "Preferences",
      content: (
        <Card>
          <CardHeader>
            <CardTitle>Travel Preferences</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm text-slate-600">
            <div>
              <p className="text-xs uppercase tracking-wide text-slate-400">
                Home Airports
              </p>
              <p className="font-semibold text-slate-900">
                {client.preferences.homeAirports.join(", ")}
              </p>
            </div>
            <div>
              <p className="text-xs uppercase tracking-wide text-slate-400">
                Cabin Preference
              </p>
              <p className="font-semibold text-slate-900">
                {client.preferences.cabinPref}
              </p>
            </div>
            <div>
              <p className="text-xs uppercase tracking-wide text-slate-400">
                Flexibility
              </p>
              <p className="font-semibold text-slate-900">
                ±{client.preferences.flexibilityDays} days
              </p>
            </div>
            {client.preferences.notes ? (
              <div>
                <p className="text-xs uppercase tracking-wide text-slate-400">
                  Notes
                </p>
                <p className="text-sm text-slate-600">
                  {client.preferences.notes}
                </p>
              </div>
            ) : null}
          </CardContent>
        </Card>
      ),
    },
    {
      id: "trips",
      label: "Trips",
      content: (
        <Card>
          <CardHeader>
            <CardTitle>Trips</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm text-slate-600">
            {trips.length ? (
              trips.map((trip) => (
                <Link
                  key={trip.id}
                  href={`/trips/${trip.id}`}
                  className="flex items-center justify-between rounded-lg border border-slate-200 bg-slate-50 px-4 py-3"
                >
                  <div>
                    <p className="font-semibold text-slate-900">{trip.title}</p>
                    <p className="text-xs text-slate-500">
                      {trip.origin} → {trip.destination}
                    </p>
                  </div>
                  <Badge variant="secondary">{trip.status}</Badge>
                </Link>
              ))
            ) : (
              <p className="text-sm text-slate-500">No trips yet.</p>
            )}
          </CardContent>
        </Card>
      ),
    },
    {
      id: "notes",
      label: "Notes",
      content: (
        <Card>
          <CardHeader>
            <CardTitle>Internal Notes</CardTitle>
          </CardHeader>
          <CardContent>
            <textarea
              className="min-h-[160px] w-full rounded-lg border border-slate-200 p-4 text-sm"
              value={notes}
              onChange={(event) => setNotes(event.target.value)}
            />
          </CardContent>
        </Card>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title={client.fullName}
        description="Client profile and trip history."
        actions={
          <Badge variant="secondary">Assigned: {client.assignedAgentName}</Badge>
        }
      />
      <Tabs tabs={tabs} />
    </div>
  );
}
