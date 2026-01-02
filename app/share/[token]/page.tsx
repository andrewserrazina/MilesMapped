"use client";

import { useMemo } from "react";
import { useParams } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { AwardOption } from "@/lib/types";
import { portalRepo } from "@/lib/portalRepo";

export default function ShareItineraryPage() {
  const params = useParams<{ token: string }>();
  const { data: portalData, isHydrated } = portalRepo.usePortalData();

  const itinerary = portalRepo.getItineraryByShareToken(
    portalData,
    params.token
  );
  const trip = itinerary
    ? portalRepo.getTrip(portalData, itinerary.tripId)
    : null;
  const client = trip ? portalRepo.getClient(portalData, trip.clientId) : null;

  const optionA = useMemo(() => {
    if (!trip || !itinerary) {
      return undefined;
    }
    return (
      trip.awardOptions.find((option) => option.id === itinerary.optionAId) ??
      trip.awardOptions.find((option) => option.id === trip.pinnedAwardOptionId)
    );
  }, [itinerary, trip]);

  const backupOptions = useMemo(() => {
    if (!trip || !itinerary) {
      return [];
    }
    return itinerary.backupOptionIds
      .map((id) => trip.awardOptions.find((option) => option.id === id))
      .filter((option): option is AwardOption => Boolean(option));
  }, [itinerary, trip]);

  const howToBookSteps = useMemo(() => {
    if (!optionA) {
      return [];
    }

    const transferStep = optionA.transferRequired
      ? `Transfer points to ${optionA.program}. Transfers typically take ${optionA.transferTime}.`
      : `No transfer required — use your ${optionA.program} balance directly.`;

    return [
      `Log in to ${optionA.program} and verify the award calendar for ${optionA.route}.`,
      transferStep,
      "Confirm passenger names, dates, and cabin class before placing the award on hold.",
      `Book the award for ${optionA.milesRequired.toLocaleString()} miles plus $${optionA.feesUSD} in fees.`,
      "Screenshot the confirmation page and save the record locator.",
      "Share the confirmation with the client and set reminders for any ticketing deadlines.",
    ];
  }, [optionA]);

  if (!isHydrated) {
    return (
      <div className="min-h-screen bg-slate-50">
        <header className="border-b border-slate-200 bg-white">
          <div className="mx-auto flex max-w-5xl flex-wrap items-center justify-between gap-3 px-6 py-4">
            <div className="text-sm font-semibold text-slate-900">MilesMapped</div>
            <div className="text-xs uppercase tracking-wide text-slate-400">
              Prepared by MilesMapped
            </div>
          </div>
        </header>
        <main className="mx-auto w-full max-w-5xl space-y-6 px-6 py-8">
          <div className="rounded-xl border border-slate-200 bg-white p-6">
            <div className="h-4 w-36 animate-pulse rounded bg-slate-200" />
            <div className="mt-4 h-8 w-2/3 animate-pulse rounded bg-slate-100" />
            <div className="mt-6 h-32 w-full animate-pulse rounded bg-slate-100" />
          </div>
        </main>
      </div>
    );
  }

  if (!itinerary || !trip || !client) {
    return (
      <div className="min-h-screen bg-slate-50">
        <header className="border-b border-slate-200 bg-white">
          <div className="mx-auto flex max-w-5xl flex-wrap items-center justify-between gap-3 px-6 py-4">
            <div className="text-sm font-semibold text-slate-900">MilesMapped</div>
            <div className="text-xs uppercase tracking-wide text-slate-400">
              Prepared by MilesMapped
            </div>
          </div>
        </header>
        <main className="mx-auto w-full max-w-5xl space-y-6 px-6 py-8">
          <Card>
            <CardContent className="p-6 text-sm text-slate-500">
              Itinerary not found.
            </CardContent>
          </Card>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-5xl flex-wrap items-center justify-between gap-3 px-6 py-4">
          <div>
            <div className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">
              MilesMapped
            </div>
            <div className="text-lg font-semibold text-slate-900">
              Client Itinerary
            </div>
          </div>
          <div className="text-xs uppercase tracking-wide text-slate-400">
            Prepared by MilesMapped
          </div>
        </div>
      </header>
      <main className="mx-auto w-full max-w-5xl space-y-6 px-6 py-8">
        <div className="space-y-2">
          <h1 className="text-2xl font-semibold text-slate-900">
            {trip.title} for {client.fullName}
          </h1>
          <p className="text-sm text-slate-500">
            Generated on {new Date(itinerary.generatedAt).toLocaleDateString()}.
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Trip Summary</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4 text-sm text-slate-600 md:grid-cols-4">
            <div>
              <p className="text-xs uppercase tracking-wide text-slate-400">Route</p>
              <p className="font-semibold text-slate-900">
                {trip.origin} → {trip.destination}
              </p>
            </div>
            <div>
              <p className="text-xs uppercase tracking-wide text-slate-400">Dates</p>
              <p className="font-semibold text-slate-900">
                {trip.dateStart} to {trip.dateEnd}
              </p>
            </div>
            <div>
              <p className="text-xs uppercase tracking-wide text-slate-400">
                Passengers
              </p>
              <p className="font-semibold text-slate-900">{trip.passengers}</p>
            </div>
            <div>
              <p className="text-xs uppercase tracking-wide text-slate-400">Cabin</p>
              <p className="font-semibold text-slate-900">{trip.cabinPref}</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Flight Option A</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {optionA ? (
              <div className="space-y-3 text-sm text-slate-600">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-base font-semibold text-slate-900">
                    {optionA.program}
                  </span>
                  {optionA.badges?.map((badge) => (
                    <Badge key={badge} variant="secondary">
                      {badge}
                    </Badge>
                  ))}
                </div>
                <div className="grid gap-3 md:grid-cols-2">
                  <div>
                    <p className="text-xs uppercase tracking-wide text-slate-400">
                      Route
                    </p>
                    <p className="font-semibold text-slate-900">{optionA.route}</p>
                  </div>
                  <div>
                    <p className="text-xs uppercase tracking-wide text-slate-400">
                      Miles Required
                    </p>
                    <p className="font-semibold text-slate-900">
                      {optionA.milesRequired.toLocaleString()}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs uppercase tracking-wide text-slate-400">
                      Fees
                    </p>
                    <p className="font-semibold text-slate-900">${optionA.feesUSD}</p>
                  </div>
                  <div>
                    <p className="text-xs uppercase tracking-wide text-slate-400">
                      Transfer Required
                    </p>
                    <p className="font-semibold text-slate-900">
                      {optionA.transferRequired ? "Yes" : "No"}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs uppercase tracking-wide text-slate-400">
                      Transfer Time
                    </p>
                    <p className="font-semibold text-slate-900">
                      {optionA.transferTime}
                    </p>
                  </div>
                </div>
              </div>
            ) : (
              <p className="text-sm text-slate-500">
                The pinned award option is no longer available.
              </p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Backup Options</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {backupOptions.length ? (
              backupOptions.map((option) => (
                <div
                  key={option.id}
                  className="rounded-lg border border-slate-200 p-3"
                >
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div>
                      <p className="text-sm font-semibold text-slate-900">
                        {option.program} — {option.route}
                      </p>
                      <p className="text-xs text-slate-500">
                        {option.milesRequired.toLocaleString()} miles · $
                        {option.feesUSD} fees
                      </p>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {option.badges?.map((badge) => (
                        <Badge key={badge} variant="secondary">
                          {badge}
                        </Badge>
                      ))}
                      <Badge variant={option.transferRequired ? "warning" : "info"}>
                        {option.transferRequired
                          ? `Transfer ${option.transferTime}`
                          : "No transfer"}
                      </Badge>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-sm text-slate-500">
                No backup award options were included.
              </p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>How to Book</CardTitle>
          </CardHeader>
          <CardContent>
            {howToBookSteps.length ? (
              <ol className="list-decimal space-y-2 pl-5 text-sm text-slate-600">
                {howToBookSteps.map((step) => (
                  <li key={step} className="leading-relaxed">
                    {step}
                  </li>
                ))}
              </ol>
            ) : (
              <p className="text-sm text-slate-500">
                Booking steps will appear once a pinned award option is selected.
              </p>
            )}
          </CardContent>
        </Card>

        {itinerary.notes ? (
          <Card>
            <CardHeader>
              <CardTitle>Notes</CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-slate-600">
              {itinerary.notes}
            </CardContent>
          </Card>
        ) : null}
      </main>
    </div>
  );
}
