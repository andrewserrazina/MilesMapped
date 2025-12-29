"use client";

import { useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import AwardOptionCard from "@/components/trips/AwardOptionCard";
import AwardOptionModal, {
  type AwardOptionFormOutput,
} from "@/components/trips/AwardOptionModal";
import TripHeader from "@/components/trips/TripHeader";
import TripNextStepBanner from "@/components/trips/TripNextStepBanner";
import HotelOptionCard from "@/components/hotel-option-card";
import InternalNotesEditor from "@/components/internal-notes-editor";
import EmptyState from "@/components/empty-state";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { tripStatusOrder } from "@/lib/mock/data";
import {
  addAwardOption,
  addItinerary,
  isTripReadOnly,
  removeAwardOption,
  setPinnedAwardOption,
  updateAwardOption,
  updateTrip,
  usePortalData,
} from "@/lib/portalStore";
import type { AwardOption, Itinerary, TripStatus } from "@/lib/types";

export default function TripDetailPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const { data: portalData, isHydrated } = usePortalData();
  const [awardModalState, setAwardModalState] = useState<{
    open: boolean;
    mode: "add" | "edit";
    option: AwardOption | null;
  }>({ open: false, mode: "add", option: null });

  const trip = useMemo(
    () => portalData.trips.find((item) => item.id === params.id) ?? null,
    [params.id, portalData.trips]
  );
  const client = useMemo(
    () =>
      portalData.clients.find((item) => item.id === trip?.clientId) ?? null,
    [portalData.clients, trip?.clientId]
  );

  const pinnedOption = trip?.awardOptions.find(
    (option) => option.id === trip.pinnedAwardOptionId
  );
  const orderedAwardOptions = useMemo(() => {
    if (!trip) {
      return [];
    }

    const unpinned = trip.awardOptions.filter(
      (option) => option.id !== trip.pinnedAwardOptionId
    );
    const sortedUnpinned = [...unpinned].sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
    return pinnedOption ? [pinnedOption, ...sortedUnpinned] : sortedUnpinned;
  }, [trip, pinnedOption]);

  const hasPinnedOption = Boolean(pinnedOption);
  const isClosed = trip ? isTripReadOnly(trip) : false;
  const canGenerate = trip?.status === "Draft Ready" && hasPinnedOption;

  const generateHelperText =
    trip?.status !== "Draft Ready"
      ? "Set status to Draft Ready to generate."
      : !hasPinnedOption
        ? "Pin an award option to generate."
        : undefined;

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

  if (!trip || !client) {
    return (
      <Card>
        <CardContent className="p-6 text-sm text-slate-500">
          Trip not found.
        </CardContent>
      </Card>
    );
  }

  const handleSaveAwardOption = (values: AwardOptionFormOutput) => {
    if (!trip) {
      return;
    }

    if (awardModalState.mode === "add") {
      const created: AwardOption = {
        id: `award_${Date.now()}`,
        tripId: trip.id,
        program: values.program,
        route: values.route,
        milesRequired: values.milesRequired,
        feesUSD: values.feesUSD,
        transferRequired: values.transferRequired,
        transferTime: values.transferTime,
        badges: values.badges,
        createdAt: new Date().toISOString(),
      };
      addAwardOption(trip.id, created);
    } else if (awardModalState.option) {
      updateAwardOption(trip.id, awardModalState.option.id, {
        program: values.program,
        route: values.route,
        milesRequired: values.milesRequired,
        feesUSD: values.feesUSD,
        transferRequired: values.transferRequired,
        transferTime: values.transferTime,
        badges: values.badges,
      });
    }
    setAwardModalState({ open: false, mode: "add", option: null });
  };

  const handleRemoveAwardOption = (option: AwardOption) => {
    if (window.confirm("Remove this award option?")) {
      removeAwardOption(trip.id, option.id);
    }
  };

  const handleGenerateItinerary = () => {
    if (!trip || !pinnedOption) {
      return;
    }

    const backupOptions = trip.awardOptions.filter(
      (option) => option.id !== pinnedOption.id
    );

    const newItinerary: Itinerary = {
      id: `itinerary_${Date.now()}`,
      tripId: trip.id,
      generatedAt: new Date().toISOString(),
      optionAId: pinnedOption.id,
      backupOptionIds: backupOptions.map((option) => option.id),
    };

    addItinerary(newItinerary);
    router.push(`/itineraries/${newItinerary.id}`);
  };

  return (
    <div className="space-y-6">
      <TripHeader
        title={`Trip: ${client.fullName} — ${trip.title}`}
        status={trip.status}
        statusOptions={tripStatusOrder}
        onStatusChange={(nextStatus: TripStatus) =>
          updateTrip(trip.id, (current) => ({ ...current, status: nextStatus }))
        }
        onGenerateItinerary={handleGenerateItinerary}
        generateDisabled={!canGenerate || isClosed}
        generateHelperText={generateHelperText}
        isReadOnly={isClosed}
      />

      <TripNextStepBanner status={trip.status} />

      <Tabs defaultValue="overview">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="awards">Award Options</TabsTrigger>
          <TabsTrigger value="hotels">Hotels</TabsTrigger>
          <TabsTrigger value="notes">Notes</TabsTrigger>
        </TabsList>

        <TabsContent value="overview">
          <div className="grid gap-6 lg:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Trip Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm text-slate-600">
                <div>
                  <p className="text-xs uppercase tracking-wide text-slate-400">
                    Route
                  </p>
                  <p className="font-semibold text-slate-900">
                    {trip.origin} → {trip.destination}
                  </p>
                </div>
                <div>
                  <p className="text-xs uppercase tracking-wide text-slate-400">
                    Dates
                  </p>
                  <p className="font-semibold text-slate-900">
                    {trip.dateStart} to {trip.dateEnd}
                  </p>
                </div>
                <div className="grid gap-3 md:grid-cols-3">
                  <div>
                    <p className="text-xs uppercase tracking-wide text-slate-400">
                      Flexibility
                    </p>
                    <p className="font-semibold text-slate-900">
                      ±{trip.flexibilityDays} days
                    </p>
                  </div>
                  <div>
                    <p className="text-xs uppercase tracking-wide text-slate-400">
                      Passengers
                    </p>
                    <p className="font-semibold text-slate-900">
                      {trip.passengers}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs uppercase tracking-wide text-slate-400">
                      Cabin
                    </p>
                    <p className="font-semibold text-slate-900">
                      {trip.cabinPref}
                    </p>
                  </div>
                </div>
                {trip.cashBudget ? (
                  <div>
                    <p className="text-xs uppercase tracking-wide text-slate-400">
                      Cash Budget
                    </p>
                    <p className="font-semibold text-slate-900">
                      ${trip.cashBudget}
                    </p>
                  </div>
                ) : null}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Client Snapshot</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm text-slate-600">
                <p className="text-base font-semibold text-slate-900">
                  {client.fullName}
                </p>
                <div className="grid gap-3 md:grid-cols-2">
                  <div>
                    <p className="text-xs uppercase tracking-wide text-slate-400">
                      Amex MR
                    </p>
                    <p className="font-semibold text-slate-900">
                      {client.balances.amexMR.toLocaleString()}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs uppercase tracking-wide text-slate-400">
                      Chase UR
                    </p>
                    <p className="font-semibold text-slate-900">
                      {client.balances.chaseUR.toLocaleString()}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs uppercase tracking-wide text-slate-400">
                      United
                    </p>
                    <p className="font-semibold text-slate-900">
                      {client.balances.united.toLocaleString()}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs uppercase tracking-wide text-slate-400">
                      Hyatt
                    </p>
                    <p className="font-semibold text-slate-900">
                      {client.balances.hyatt.toLocaleString()}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="awards">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-slate-900">
                Award Options
              </h3>
              <Button
                variant="outline"
                onClick={() =>
                  setAwardModalState({ open: true, mode: "add", option: null })
                }
                disabled={isClosed}
              >
                + Add Award Option
              </Button>
            </div>

            {orderedAwardOptions.length ? (
              <div className="space-y-4">
                {orderedAwardOptions.map((option) => {
                  const isPinned = trip.pinnedAwardOptionId === option.id;
                  return (
                    <AwardOptionCard
                      key={option.id}
                      option={option}
                      isPinned={isPinned}
                      isReadOnly={isClosed}
                      onPin={() => setPinnedAwardOption(trip.id, option.id)}
                      onEdit={() =>
                        setAwardModalState({
                          open: true,
                          mode: "edit",
                          option,
                        })
                      }
                      onRemove={() => handleRemoveAwardOption(option)}
                    />
                  );
                })}
              </div>
            ) : (
              <EmptyState
                title="No award options yet"
                description="Add an award option once you find availability to start comparisons."
                actionLabel={isClosed ? undefined : "Add award option"}
                onAction={
                  isClosed
                    ? undefined
                    : () =>
                        setAwardModalState({
                          open: true,
                          mode: "add",
                          option: null,
                        })
                }
              />
            )}
          </div>
        </TabsContent>

        <TabsContent value="hotels">
          <div className="space-y-4">
            {trip.hotelOptions.length ? (
              trip.hotelOptions.map((hotel) => (
                <HotelOptionCard key={hotel.id} option={hotel} />
              ))
            ) : (
              <EmptyState
                title="No hotel options"
                description="Add hotel options after confirming award availability."
              />
            )}
          </div>
        </TabsContent>

        <TabsContent value="notes">
          <InternalNotesEditor
            value={trip.notes ?? ""}
            onChange={(value) =>
              updateTrip(trip.id, (current) => ({ ...current, notes: value }))
            }
            placeholder="Add internal workflow notes here."
            readOnly={isClosed}
          />
        </TabsContent>
      </Tabs>

      <AwardOptionModal
        open={awardModalState.open}
        mode={awardModalState.mode}
        initialValues={awardModalState.option ?? undefined}
        onOpenChange={(open) =>
          setAwardModalState((prev) => ({
            ...prev,
            open,
            option: open ? prev.option : null,
            mode: open ? prev.mode : "add",
          }))
        }
        onSave={handleSaveAwardOption}
      />
    </div>
  );
}
