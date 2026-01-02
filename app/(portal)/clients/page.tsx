"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import PageHeader from "@/components/page-header";
import DataTable from "@/components/data-table";
import EmptyState from "@/components/common/EmptyState";
import { Input } from "@/components/ui/input";
import { buttonVariants } from "@/components/ui/button";
import type { Client } from "@/lib/types";
import { cn } from "@/lib/utils";
import { portalRepo } from "@/lib/portalRepo";
import { useCurrentUser } from "@/lib/auth/mockAuth";
import { can } from "@/lib/auth/permissions";

const statusOptions: Array<Client["status"] | "All"> = [
  "All",
  "Lead",
  "Active",
  "Completed",
];

export default function ClientsPage() {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<(typeof statusOptions)[number]>("All");
  const { data: portalData, isHydrated } = portalRepo.usePortalData();
  const currentUser = useCurrentUser();
  const canCreateClient = can(currentUser, "client.create");
  const clients = portalRepo.listClients(portalData);
  const trips = portalRepo.listTrips(portalData);
  const tripCounts = useMemo(() => {
    const counts = new Map<string, number>();
    trips.forEach((trip) => {
      counts.set(trip.clientId, (counts.get(trip.clientId) ?? 0) + 1);
    });
    return counts;
  }, [trips]);
  const statusSortOrder: Record<Client["status"], number> = {
    Lead: 0,
    Active: 1,
    Completed: 2,
  };

  const filteredClients = useMemo(() => {
    return clients.filter((client) => {
      const matchesQuery = client.fullName
        .toLowerCase()
        .includes(query.toLowerCase());
      const matchesStatus = statusFilter === "All" || client.status === statusFilter;
      return matchesQuery && matchesStatus;
    });
  }, [clients, query, statusFilter]);

  const hasFilters = query.length > 0 || statusFilter !== "All";

  if (!isHydrated) {
    return (
      <div className="space-y-6">
        <PageHeader
          title="Clients"
          description="Manage client profiles, preferences, and trip history."
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
        title="Clients"
        description="Manage client profiles, preferences, and trip history."
        actions={
          <div className="flex flex-col items-end gap-2">
            {canCreateClient ? (
              <Link
                href="/clients/new"
                className={cn(buttonVariants(), "whitespace-nowrap")}
              >
                + New Client
              </Link>
            ) : (
              <button
                type="button"
                className={cn(buttonVariants(), "whitespace-nowrap")}
                disabled
              >
                + New Client
              </button>
            )}
            {!canCreateClient ? (
              <span className="text-xs text-slate-400">
                Only admins can create clients.
              </span>
            ) : null}
          </div>
        }
      />

      <div className="flex flex-wrap items-center gap-3">
        <div className="w-full max-w-sm">
          <Input
            placeholder="Search clients"
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
      {filteredClients.length === 0 ? (
        <EmptyState
          title="No clients match your filters"
          description="Try adjusting your search or status filter to find a client."
          primaryActionLabel={hasFilters ? "Clear filters" : undefined}
          onPrimaryAction={
            hasFilters
              ? () => {
                  setQuery("");
                  setStatusFilter("All");
                }
              : undefined
          }
        />
      ) : (
        <DataTable
          columns={[
            {
              key: "name",
              header: "Name",
              render: (client: Client) => (
                <div>
                  <p className="font-semibold text-slate-900">{client.fullName}</p>
                  <p className="text-xs text-slate-500">{client.email}</p>
                </div>
              ),
              sortValue: (client: Client) => client.fullName,
            },
            {
              key: "status",
              header: "Status",
              render: (client: Client) => (
                <span className="text-sm text-slate-600">{client.status}</span>
              ),
              sortValue: (client: Client) => statusSortOrder[client.status],
            },
            {
              key: "trips",
              header: "Trips",
              render: (client: Client) => (
                <span className="text-sm text-slate-600">
                  {tripCounts.get(client.id) ?? 0}
                </span>
              ),
              sortValue: (client: Client) => tripCounts.get(client.id) ?? 0,
            },
            {
              key: "agent",
              header: "Assigned Agent",
              render: (client: Client) => (
                <span className="text-sm text-slate-600">
                  {client.assignedAgentName}
                </span>
              ),
              sortValue: (client: Client) => client.assignedAgentName,
            },
          ]}
          data={filteredClients}
          emptyMessage="No clients match this filter yet."
          onRowClick={(client) => router.push(`/clients/${client.id}`)}
        />
      )}
    </div>
  );
}
