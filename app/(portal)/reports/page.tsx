"use client";

import { useMemo } from "react";
import PageHeader from "@/components/page-header";
import { Card, CardContent } from "@/components/ui/card";
import { buttonVariants } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { portalRepo } from "@/lib/portalRepo";
import {
  computeTripMetrics,
  formatCurrency,
  formatMiles,
} from "@/lib/metrics/compute";
import type { Trip } from "@/lib/types";
import { cn } from "@/lib/utils";

type TripRow = {
  id: string;
  tripTitle: string;
  clientName: string;
  status: Trip["status"];
  totalMilesUsed: number | null;
  totalFeesUSD: number | null;
  estimatedCashValue: number | null;
  estimatedSavingsUSD: number | null;
};

function sumMetrics(values: Array<number | null>): number | null {
  const valid = values.filter((value): value is number => value !== null);
  if (valid.length === 0) {
    return null;
  }
  return valid.reduce((sum, value) => sum + value, 0);
}

function buildCsv(rows: TripRow[], totals: TripRow): string {
  const headers = [
    "Trip",
    "Client",
    "Status",
    "Miles Used",
    "Fees USD",
    "Cash Value USD",
    "Savings USD",
  ];
  const dataRows = rows.map((row) => [
    row.tripTitle,
    row.clientName,
    row.status,
    row.totalMilesUsed ?? "",
    row.totalFeesUSD ?? "",
    row.estimatedCashValue ?? "",
    row.estimatedSavingsUSD ?? "",
  ]);
  dataRows.push([
    "Total",
    "",
    "",
    totals.totalMilesUsed ?? "",
    totals.totalFeesUSD ?? "",
    totals.estimatedCashValue ?? "",
    totals.estimatedSavingsUSD ?? "",
  ]);

  return [headers, ...dataRows]
    .map((row) =>
      row
        .map((cell) => `"${String(cell).replaceAll("\"", '""')}"`)
        .join(",")
    )
    .join("\n");
}

export default function ReportsPage() {
  const { data: portalData, isHydrated } = portalRepo.usePortalData();
  const trips = portalRepo.listTrips(portalData);
  const clients = portalRepo.listClients(portalData);

  const rows = useMemo<TripRow[]>(() => {
    return trips.map((trip) => {
      const client = clients.find((item) => item.id === trip.clientId);
      const metrics = computeTripMetrics(trip);
      return {
        id: trip.id,
        tripTitle: trip.title,
        clientName: client?.fullName ?? "Unknown client",
        status: trip.status,
        totalMilesUsed: metrics.totalMilesUsed,
        totalFeesUSD: metrics.totalFeesUSD,
        estimatedCashValue: metrics.estimatedCashValue,
        estimatedSavingsUSD: metrics.estimatedSavingsUSD,
      };
    });
  }, [clients, trips]);

  const totals = useMemo<TripRow>(() => {
    return {
      id: "totals",
      tripTitle: "Totals",
      clientName: "",
      status: "Intake",
      totalMilesUsed: sumMetrics(rows.map((row) => row.totalMilesUsed)),
      totalFeesUSD: sumMetrics(rows.map((row) => row.totalFeesUSD)),
      estimatedCashValue: sumMetrics(rows.map((row) => row.estimatedCashValue)),
      estimatedSavingsUSD: sumMetrics(rows.map((row) => row.estimatedSavingsUSD)),
    };
  }, [rows]);

  const handleExportCsv = () => {
    const csv = buildCsv(rows, totals);
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "milesmapped-reports.csv";
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
  };

  if (!isHydrated) {
    return (
      <div className="space-y-6">
        <PageHeader
          title="Reports"
          description="Operational metrics and revenue insights."
        />
        <div className="h-40 animate-pulse rounded-xl border border-slate-200 bg-white" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Reports"
        description="Operational metrics and revenue insights."
        actions={
          <button
            type="button"
            onClick={handleExportCsv}
            className={cn(buttonVariants({ variant: "outline" }))}
          >
            Export CSV
          </button>
        }
      />
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Trip</TableHead>
                <TableHead>Client</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Miles Used</TableHead>
                <TableHead className="text-right">Fees</TableHead>
                <TableHead className="text-right">Cash Value</TableHead>
                <TableHead className="text-right">Savings</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.map((row) => (
                <TableRow key={row.id}>
                  <TableCell>
                    <p className="font-semibold text-slate-900">{row.tripTitle}</p>
                  </TableCell>
                  <TableCell className="text-sm text-slate-600">
                    {row.clientName}
                  </TableCell>
                  <TableCell className="text-sm text-slate-600">
                    {row.status}
                  </TableCell>
                  <TableCell className="text-right text-sm text-slate-700">
                    {formatMiles(row.totalMilesUsed)}
                  </TableCell>
                  <TableCell className="text-right text-sm text-slate-700">
                    {formatCurrency(row.totalFeesUSD)}
                  </TableCell>
                  <TableCell className="text-right text-sm text-slate-700">
                    {formatCurrency(row.estimatedCashValue)}
                  </TableCell>
                  <TableCell className="text-right text-sm text-slate-700">
                    {formatCurrency(row.estimatedSavingsUSD)}
                  </TableCell>
                </TableRow>
              ))}
              <TableRow className="bg-slate-50">
                <TableCell className="font-semibold text-slate-900">Totals</TableCell>
                <TableCell />
                <TableCell />
                <TableCell className="text-right font-semibold text-slate-900">
                  {formatMiles(totals.totalMilesUsed)}
                </TableCell>
                <TableCell className="text-right font-semibold text-slate-900">
                  {formatCurrency(totals.totalFeesUSD)}
                </TableCell>
                <TableCell className="text-right font-semibold text-slate-900">
                  {formatCurrency(totals.estimatedCashValue)}
                </TableCell>
                <TableCell className="text-right font-semibold text-slate-900">
                  {formatCurrency(totals.estimatedSavingsUSD)}
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
