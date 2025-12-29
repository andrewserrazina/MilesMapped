"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import PageHeader from "@/components/page-header";
import DataTable from "@/components/data-table";
import StatusBadge from "@/components/common/StatusBadge";
import { Input } from "@/components/ui/input";
import { tripStatusOrder } from "@/lib/mock/data";
import type { Trip } from "@/lib/types";
import { usePortalData } from "@/lib/portalStore";

const statusOptions = ["All", ...tripStatusOrder] as const;

export default function TripsPage() {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<
    (typeof statusOptions)[number]
  >("All");
  const { data: portalData, isHydrated } = usePortalData();

  const filteredTrips = useMemo(() => {
    const trips = portalData?.trips ?? [];
    const clients = portalData?.clients ?? [];

    return trips.filter((trip) => {
      const client = clients.find((c) => c.id === trip.clientId);
      const matchesQuery =
        trip.title.toLowerCase().includes(query.toLowerCase()) ||
        client?.fullName.toLowerCase().includes(query.toLowerCase());
      const matchesStatus = statusFilter === "All" || trip.status === statusFilter;
      return matchesQuery && matchesStatus;
    });
  }, [portalData, query, statusFilter]);

  if (!isHydrated) {
    return (
      <div className="space-y-6">
        <PageHeader
          title="Trips"
          description="Track active workflows and status-driven milestones."
        />
        <div className="space-y-4 rounded-xl border border-slate-200 bg-white p-6">
          <div className="h-4 w-40 animate-pulse rounded bg-slate-200" />
          <div className="h-10 w-full animate-pulse rounded bg-slate-100" />
          <div className="h-40 w-full animate-pulse rounded bg-slate-100" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Trips"
        description="Track active workflows and status-driven milestones."
      />

      <div className="flex flex-wrap items-center gap-3">
        <div className="w-full max-w-sm">
          <Input
            placeholder="Search trips or clients"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
          />
        </div>
        <select
          className="h-10 rounded-md border border-slate-200 bg-white px-3 text-sm"
          value={statusFilter}
          onChange={(event) =>
            setStatusFilter(event.target.value as (typeof statusOptions)[number])
          }
        >
          {statusOptions.map((status) => (
            <option key={status} value={status}>
              {status}
            </option>
          ))}
        </select>
      </div>

      <DataTable
        columns={[
          {
            key: "client",
            header: "Client",
            render: (trip: Trip) => {
              const client = portalData?.clients.find(
                (c) => c.id === trip.clientId
              );
              return (
                <div>
                  <p className="font-semibold text-slate-900">{client?.fullName}</p>
                  <p className="text-xs text-slate-500">{trip.title}</p>
                </div>
              );
            },
          },
          {
            key: "route",
            header: "Route",
            render: (trip: Trip) => (
              <span className="text-sm text-slate-600">
                {trip.origin} → {trip.destination}
              </span>
            ),
          },
          {
            key: "dates",
            header: "Dates",
            render: (trip: Trip) => (
              <span className="text-sm text-slate-600">
                {trip.dateStart} → {trip.dateEnd}
              </span>
            ),
          },
          {
            key: "status",
            header: "Status",
            render: (trip: Trip) => <StatusBadge status={trip.status} />,
          },
        ]}
        data={filteredTrips}
        emptyMessage="No trips match this filter yet."
        onRowClick={(trip) => router.push(`/trips/${trip.id}`)}
      />
    </div>
  );
}
