"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import PageHeader from "@/components/page-header";
import DataTable from "@/components/data-table";
import { Input } from "@/components/ui/input";
import type { Client } from "@/lib/types";
import { usePortalData } from "@/lib/portalStore";

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
  const { data: portalData, isHydrated } = usePortalData();

  const filteredClients = useMemo(() => {
    const clients = portalData?.clients ?? [];
    return clients.filter((client) => {
      const matchesQuery = client.fullName
        .toLowerCase()
        .includes(query.toLowerCase());
      const matchesStatus = statusFilter === "All" || client.status === statusFilter;
      return matchesQuery && matchesStatus;
    });
  }, [portalData, query, statusFilter]);

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
          },
          {
            key: "status",
            header: "Status",
            render: (client: Client) => (
              <span className="text-sm text-slate-600">{client.status}</span>
            ),
          },
          {
            key: "trips",
            header: "Trips",
            render: (client: Client) => (
              <span className="text-sm text-slate-600">
                {portalData?.trips.filter((trip) => trip.clientId === client.id).length ??
                  0}
              </span>
            ),
          },
          {
            key: "agent",
            header: "Assigned Agent",
            render: (client: Client) => (
              <span className="text-sm text-slate-600">
                {client.assignedAgentName}
              </span>
            ),
          },
        ]}
        data={filteredClients}
        emptyMessage="No clients match this filter yet."
        onRowClick={(client) => router.push(`/clients/${client.id}`)}
      />
    </div>
  );
}
