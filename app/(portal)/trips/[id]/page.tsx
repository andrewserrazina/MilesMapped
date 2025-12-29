"use client";

import { useMemo, useState } from "react";
import { useParams } from "next/navigation";
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
import { clients, getTripById, tripStatusOrder } from "@/lib/mock/data";
import type { AwardOption, TripStatus } from "@/lib/types";

export default function TripDetailPage() {
  const params = useParams<{ id: string }>();
  const initialTrip = useMemo(() => getTripById(params.id), [params.id]);
  const client = useMemo(
    () => clients.find((item) => item.id === initialTrip?.clientId),
    [initialTrip]
  );

  const [status, setStatus] = useState<TripStatus>(
    initialTrip?.status ?? "Intake"
  );
  const [awardOptions, setAwardOptions] = useState<AwardOption[]>(
    initialTrip?.awardOptions ?? []
  );
  const [pinnedAwardOptionId, setPinnedAwardOptionId] = useState<
    string | undefined
  >(initialTrip?.pinnedAwardOptionId);
  const [notes, setNotes] = useState(initialTrip?.notes ?? "");
  const [awardModalState, setAwardModalState] = useState<{
    open: boolean;
    mode: "add" | "edit";
    option: AwardOption | null;
  }>({ open: false, mode: "add", option: null });

  if (!initialTrip || !client) {
    return (
      <Card>
        <CardContent className="p-6 text-sm text-slate-500">
          Trip not found.
        </CardContent>
      </Card>
    );
  }

  const isClosed = status === "Closed";
  const pinnedOption = awardOptions.find(
    (option) => option.id === pinnedAwardOptionId
  );
  const hasPinnedOption = Boolean(pinnedOption);
  const canGenerate = status === "Draft Ready" && hasPinnedOption;

  const orderedAwardOptions = useMemo(() => {
    const unpinned = awardOptions.filter(
      (option) => option.id !== pinnedAwardOptionId
    );
    const sortedUnpinned = [...unpinned].sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
    return pinnedOption ? [pinnedOption, ...sortedUnpinned] : sortedUnpinned;
  }, [awardOptions, pinnedAwardOptionId, pinnedOption]);

  const generateHelperText =
    status !== "Draft Ready"
      ? "Set status to Draft Ready to generate."
      : !hasPinnedOption
        ? "Pin an award option to generate."
        : undefined;

  const handleSaveAwardOption = (values: AwardOptionFormOutput) => {
    if (awardModalState.mode === "add") {
      const created: AwardOption = {
        id: `award_${Date.now()}`,
        tripId: initialTrip.id,
        program: values.program,
        route: values.route,
        milesRequired: values.milesRequired,
        feesUSD: values.feesUSD,
        transferRequired: values.transferRequired,
        transferTime: values.transferTime,
        badges: values.badges,
        createdAt: new Date().toISOString(),
      };
      setAwardOptions((prev) => [created, ...prev]);
    } else if (awardModalState.option) {
      setAwardOptions((prev) =>
        prev.map((item) =>
          item.id === awardModalState.option?.id
            ? {
                ...item,
                program: values.program,
                route: values.route,
                milesRequired: values.milesRequired,
                feesUSD: values.feesUSD,
                transferRequired: values.transferRequired,
                transferTime: values.transferTime,
                badges: values.badges,
              }
            : item
        )
      );
    }
    setAwardModalState({ open: false, mode: "add", option: null });
  };

  const handleRemoveAwardOption = (option: AwardOption) => {
    if (window.confirm("Remove this award option?")) {
      setAwardOptions((prev) => prev.filter((item) => item.id !== option.id));
      if (pinnedAwardOptionId === option.id) {
        setPinnedAwardOptionId(undefined);
      }
    }
  };

  return (
    <div className="space-y-6">
      <TripHeader
        title={`Trip: ${client.fullName} — ${initialTrip.title}`}
        status={status}
        statusOptions={tripStatusOrder}
        onStatusChange={setStatus}
        onGenerateItinerary={() => undefined}
        generateDisabled={!canGenerate || isClosed}
        generateHelperText={generateHelperText}
        isReadOnly={isClosed}
      />

      <TripNextStepBanner status={status} />

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
                    {initialTrip.origin} → {initialTrip.destination}
                  </p>
                </div>
                <div>
                  <p className="text-xs uppercase tracking-wide text-slate-400">
                    Dates
                  </p>
                  <p className="font-semibold text-slate-900">
                    {initialTrip.dateStart} to {initialTrip.dateEnd}
                  </p>
                </div>
                <div className="grid gap-3 md:grid-cols-3">
                  <div>
                    <p className="text-xs uppercase tracking-wide text-slate-400">
                      Flexibility
                    </p>
                    <p className="font-semibold text-slate-900">
                      ±{initialTrip.flexibilityDays} days
                    </p>
                  </div>
                  <div>
                    <p className="text-xs uppercase tracking-wide text-slate-400">
                      Passengers
                    </p>
                    <p className="font-semibold text-slate-900">
                      {initialTrip.passengers}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs uppercase tracking-wide text-slate-400">
                      Cabin
                    </p>
                    <p className="font-semibold text-slate-900">
                      {initialTrip.cabinPref}
                    </p>
                  </div>
                </div>
                {initialTrip.cashBudget ? (
                  <div>
                    <p className="text-xs uppercase tracking-wide text-slate-400">
                      Cash Budget
                    </p>
                    <p className="font-semibold text-slate-900">
                      ${initialTrip.cashBudget}
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
                  const isPinned = pinnedAwardOptionId === option.id;
                  return (
                    <AwardOptionCard
                      key={option.id}
                      option={option}
                      isPinned={isPinned}
                      isReadOnly={isClosed}
                      onPin={() => setPinnedAwardOptionId(option.id)}
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
            {initialTrip.hotelOptions.length ? (
              initialTrip.hotelOptions.map((hotel) => (
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
            value={notes}
            onChange={setNotes}
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
