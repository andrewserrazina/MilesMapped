"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import PageHeader from "@/components/page-header";
import EmptyState from "@/components/empty-state";
import StatusBadge from "@/components/common/StatusBadge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { initializeFromMockIfEmpty, type PortalData } from "@/lib/storage";

export default function ItinerariesPage() {
  const [portalData, setPortalData] = useState<PortalData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const data = initializeFromMockIfEmpty();
    setPortalData(data);
    setIsLoading(false);
  }, []);

  const itineraries = useMemo(() => {
    if (!portalData) {
      return [];
    }
    return [...portalData.itineraries].sort(
      (a, b) => new Date(b.generatedAt).getTime() - new Date(a.generatedAt).getTime()
    );
  }, [portalData]);

  if (isLoading) {
    return (
      <div className="space-y-6">
        <PageHeader
          title="Itineraries"
          description="Generate and track client-facing itineraries."
        />
        <div className="space-y-4 rounded-xl border border-slate-200 bg-white p-6">
          <div className="h-4 w-48 animate-pulse rounded bg-slate-200" />
          <div className="h-10 w-full animate-pulse rounded bg-slate-100" />
          <div className="h-40 w-full animate-pulse rounded bg-slate-100" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Itineraries"
        description="Generate and track client-facing itineraries."
      />

      {itineraries.length === 0 ? (
        <EmptyState
          title="No itineraries yet. Generate one from a trip."
          description="Head to a trip and pin an award option to generate."
        />
      ) : (
        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Trip</TableHead>
                  <TableHead>Generated</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {itineraries.map((itinerary) => {
                  const trip = portalData?.trips.find(
                    (item) => item.id === itinerary.tripId
                  );
                  const client = portalData?.clients.find(
                    (item) => item.id === trip?.clientId
                  );

                  return (
                    <TableRow key={itinerary.id}>
                      <TableCell>
                        <div>
                          <p className="font-semibold text-slate-900">
                            {client?.fullName ?? "Unknown client"}
                          </p>
                          <p className="text-xs text-slate-500">
                            {trip?.title ?? "Unknown trip"}
                          </p>
                        </div>
                      </TableCell>
                      <TableCell className="text-sm text-slate-600">
                        {new Date(itinerary.generatedAt).toLocaleDateString()}
                      </TableCell>
                      <TableCell>
                        {trip ? (
                          <StatusBadge status={trip.status} />
                        ) : (
                          <span className="text-sm text-slate-500">Unknown</span>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        <Button variant="ghost" size="sm" asChild>
                          <Link href={`/itineraries/${itinerary.id}`}>View</Link>
                        </Button>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
