"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { activities } from "@/lib/mock/data";
import PageHeader from "@/components/page-header";
import KPIStatCard from "@/components/kpi-stat-card";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { initializeFromMockIfEmpty, type PortalData } from "@/lib/storage";

export default function DashboardPage() {
  const [portalData, setPortalData] = useState<PortalData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const data = initializeFromMockIfEmpty();
    setPortalData(data);
    setIsLoading(false);
  }, []);

  const kpis = useMemo(() => {
    const clients = portalData?.clients ?? [];
    const trips = portalData?.trips ?? [];

    return [
      {
        label: "Active Clients",
        value: clients.filter((client) => client.status === "Active").length.toString(),
      },
      {
        label: "Trips In Progress",
        value: trips
          .filter((trip) => trip.status === "Searching" || trip.status === "Draft Ready")
          .length.toString(),
      },
      {
        label: "Trips Delivered",
        value: trips
          .filter((trip) => trip.status === "Sent" || trip.status === "Booked")
          .length.toString(),
      },
      { label: "Avg Points Saved", value: "48k" },
      { label: "Revenue MTD", value: "$18.4k" },
      { label: "Pending Followups", value: "6" },
    ];
  }, [portalData]);

  if (isLoading) {
    return (
      <div className="space-y-8">
        <PageHeader
          title="Dashboard"
          description="Daily performance snapshot and workflow queue."
        />
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {Array.from({ length: 6 }).map((_, index) => (
            <div
              key={`kpi-skeleton-${index}`}
              className="h-24 animate-pulse rounded-xl border border-slate-200 bg-white"
            />
          ))}
        </div>
        <div className="grid gap-6 lg:grid-cols-2">
          <div className="h-64 animate-pulse rounded-xl border border-slate-200 bg-white" />
          <div className="h-64 animate-pulse rounded-xl border border-slate-200 bg-white" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <PageHeader
        title="Dashboard"
        description="Daily performance snapshot and workflow queue."
        actions={
          <div className="flex items-center gap-2">
            <Link
              href="/clients"
              className={cn(buttonVariants({ variant: "outline" }))}
            >
              New Client
            </Link>
            <Link
              href="/trips"
              className={cn(buttonVariants({ variant: "outline" }))}
            >
              New Trip
            </Link>
            <Link href="/award-search" className={cn(buttonVariants({}))}>
              Award Search
            </Link>
          </div>
        }
      />

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {kpis.map((kpi) => (
          <KPIStatCard key={kpi.label} {...kpi} />
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {activities.map((activity) => (
              <div key={activity.id} className="flex items-start gap-3">
                <Badge variant="secondary">{activity.category}</Badge>
                <div>
                  <p className="text-sm font-semibold text-slate-900">
                    {activity.title}
                  </p>
                  <p className="text-xs text-slate-500">{activity.description}</p>
                  <p className="text-xs text-slate-400">{activity.createdAt}</p>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Link
              href="/clients"
              className={cn(buttonVariants(), "w-full justify-between")}
            >
              Add a new client intake
              <span aria-hidden>→</span>
            </Link>
            <Link
              href="/trips"
              className={cn(
                buttonVariants({ variant: "secondary" }),
                "w-full justify-between"
              )}
            >
              Start a trip workflow
              <span aria-hidden>→</span>
            </Link>
            <Link
              href="/award-search"
              className={cn(
                buttonVariants({ variant: "outline" }),
                "w-full justify-between"
              )}
            >
              Launch award search workspace
              <span aria-hidden>→</span>
            </Link>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
