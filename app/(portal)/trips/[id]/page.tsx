"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { useParams } from "next/navigation";
import PageHeader from "@/components/page-header";
import Tabs from "@/components/tabs";
import AwardOptionCard from "@/components/award-option-card";
import HotelOptionCard from "@/components/hotel-option-card";
import InternalNotesEditor from "@/components/internal-notes-editor";
import StatusBadge from "@/components/status-badge";
import EmptyState from "@/components/empty-state";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { clients, getTripById, tripStatusOrder } from "@/lib/mock/data";
import type { AwardOption, TripStatus } from "@/lib/types";

const nextStepCopy: Record<TripStatus, string> = {
  Intake: "Complete intake details, then start Searching.",
  Searching: "Add award options and pin the best option.",
  "Draft Ready": "Generate itinerary and send to client.",
  Sent: "Follow up; mark booked when confirmed.",
  Booked: "Capture final notes; close trip.",
  Closed: "Read-only.",
};

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
  const [pinnedAwardOptionId, setPinnedAwardOptionId] = useState<string | undefined>(
    initialTrip?.pinnedAwardOptionId
  );
  const [hotels] = useState(initialTrip?.hotelOptions ?? []);
  const [notes, setNotes] = useState(initialTrip?.notes ?? "");
  const [isAddingAward, setIsAddingAward] = useState(false);
  const [editingAwardId, setEditingAwardId] = useState<string | null>(null);
  const [newAward, setNewAward] = useState({
    program: "",
    route: "",
    milesRequired: "",
    feesUSD: "",
    transferRequired: "true",
    transferTime: "Instant",
    badges: "",
  });

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
  const hasPinned = Boolean(pinnedAwardOptionId);
  const canGenerate = status === "Draft Ready" && awardOptions.length > 0 && hasPinned;

  const handleAddAward = () => {
    if (!newAward.program || !newAward.route || !newAward.milesRequired) {
      return;
    }

    const created: AwardOption = {
      id: `award_${Date.now()}`,
      tripId: initialTrip.id,
      program: newAward.program,
      route: newAward.route,
      milesRequired: Number(newAward.milesRequired),
      feesUSD: Number(newAward.feesUSD || 0),
      transferRequired: newAward.transferRequired === "true",
      transferTime: newAward.transferTime as AwardOption["transferTime"],
      badges: newAward.badges
        ? newAward.badges.split(",").map((badge) => badge.trim())
        : [],
      createdAt: new Date().toISOString().split("T")[0],
    };

    setAwardOptions((prev) => [created, ...prev]);
    setIsAddingAward(false);
    setNewAward({
      program: "",
      route: "",
      milesRequired: "",
      feesUSD: "",
      transferRequired: "true",
      transferTime: "Instant",
      badges: "",
    });
  };

  const handleEditAward = (option: AwardOption, updates: Partial<AwardOption>) => {
    setAwardOptions((prev) =>
      prev.map((item) => (item.id === option.id ? { ...item, ...updates } : item))
    );
  };

  const tabs = [
    {
      id: "overview",
      label: "Overview",
      content: (
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
      ),
    },
    {
      id: "awards",
      label: "Award Options",
      content: (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-slate-900">
              Award Options
            </h3>
            <Button
              variant="outline"
              onClick={() => setIsAddingAward(true)}
              disabled={isClosed}
            >
              + Add Award Option
            </Button>
          </div>

          {isAddingAward ? (
            <Card className="border border-dashed border-slate-200 p-4">
              <div className="grid gap-3 md:grid-cols-2">
                <Input
                  placeholder="Program"
                  value={newAward.program}
                  onChange={(event) =>
                    setNewAward((prev) => ({ ...prev, program: event.target.value }))
                  }
                />
                <Input
                  placeholder="Route"
                  value={newAward.route}
                  onChange={(event) =>
                    setNewAward((prev) => ({ ...prev, route: event.target.value }))
                  }
                />
                <Input
                  placeholder="Miles Required"
                  type="number"
                  value={newAward.milesRequired}
                  onChange={(event) =>
                    setNewAward((prev) => ({
                      ...prev,
                      milesRequired: event.target.value,
                    }))
                  }
                />
                <Input
                  placeholder="Fees USD"
                  type="number"
                  value={newAward.feesUSD}
                  onChange={(event) =>
                    setNewAward((prev) => ({ ...prev, feesUSD: event.target.value }))
                  }
                />
                <select
                  className="h-10 rounded-md border border-slate-200 bg-white px-3 text-sm"
                  value={newAward.transferRequired}
                  onChange={(event) =>
                    setNewAward((prev) => ({
                      ...prev,
                      transferRequired: event.target.value,
                    }))
                  }
                >
                  <option value="true">Transfer Required</option>
                  <option value="false">No Transfer</option>
                </select>
                <select
                  className="h-10 rounded-md border border-slate-200 bg-white px-3 text-sm"
                  value={newAward.transferTime}
                  onChange={(event) =>
                    setNewAward((prev) => ({
                      ...prev,
                      transferTime: event.target.value,
                    }))
                  }
                >
                  <option value="Instant">Instant</option>
                  <option value="1–2 days">1–2 days</option>
                  <option value="Unknown">Unknown</option>
                </select>
                <Input
                  placeholder="Badges (comma separated)"
                  value={newAward.badges}
                  onChange={(event) =>
                    setNewAward((prev) => ({ ...prev, badges: event.target.value }))
                  }
                  className="md:col-span-2"
                />
              </div>
              <div className="mt-4 flex items-center gap-2">
                <Button onClick={handleAddAward}>Save option</Button>
                <Button
                  variant="ghost"
                  onClick={() => setIsAddingAward(false)}
                >
                  Cancel
                </Button>
              </div>
            </Card>
          ) : null}

          {awardOptions.length ? (
            <div className="space-y-4">
              {awardOptions.map((option) => {
                const isPinned = pinnedAwardOptionId === option.id;
                const isEditing = editingAwardId === option.id;
                return (
                  <div key={option.id} className="space-y-3">
                    <AwardOptionCard
                      option={option}
                      isPinned={isPinned}
                      onPin={() => {
                        if (!isClosed) {
                          setPinnedAwardOptionId(option.id);
                        }
                      }}
                      onEdit={
                        isClosed
                          ? undefined
                          : () =>
                              setEditingAwardId(
                                editingAwardId === option.id ? null : option.id
                              )
                      }
                      onRemove={() =>
                        !isClosed &&
                        setAwardOptions((prev) => {
                          const remaining = prev.filter(
                            (item) => item.id !== option.id
                          );
                          if (pinnedAwardOptionId === option.id) {
                            setPinnedAwardOptionId(undefined);
                          }
                          return remaining;
                        })
                      }
                    />
                    {isEditing ? (
                      <Card className="border border-dashed border-slate-200 p-4">
                        <div className="grid gap-3 md:grid-cols-2">
                          <Input
                            value={option.program}
                            onChange={(event) =>
                              handleEditAward(option, {
                                program: event.target.value,
                              })
                            }
                          />
                          <Input
                            value={option.route}
                            onChange={(event) =>
                              handleEditAward(option, {
                                route: event.target.value,
                              })
                            }
                          />
                          <Input
                            type="number"
                            value={option.milesRequired}
                            onChange={(event) =>
                              handleEditAward(option, {
                                milesRequired: Number(event.target.value),
                              })
                            }
                          />
                          <Input
                            type="number"
                            value={option.feesUSD}
                            onChange={(event) =>
                              handleEditAward(option, {
                                feesUSD: Number(event.target.value),
                              })
                            }
                          />
                        </div>
                        <div className="mt-3 flex items-center gap-2">
                          <Button onClick={() => setEditingAwardId(null)}>
                            Done
                          </Button>
                        </div>
                      </Card>
                    ) : null}
                  </div>
                );
              })}
            </div>
          ) : (
            <EmptyState
              title="No award options yet"
              description="Add an award option once you find availability to start comparisons."
              actionLabel="Add award option"
              onAction={() => setIsAddingAward(true)}
            />
          )}
        </div>
      ),
    },
    {
      id: "hotels",
      label: "Hotels",
      content: (
        <div className="space-y-4">
          {hotels.length ? (
            hotels.map((hotel) => <HotelOptionCard key={hotel.id} option={hotel} />)
          ) : (
            <EmptyState
              title="No hotel options"
              description="Add hotel options after confirming award availability."
            />
          )}
        </div>
      ),
    },
    {
      id: "notes",
      label: "Notes",
      content: (
        <InternalNotesEditor
          value={notes}
          onChange={setNotes}
          placeholder="Add internal workflow notes here."
        />
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="text-sm text-slate-500">
        <Link href="/trips" className="hover:text-slate-700">
          Trips
        </Link>
        <span className="mx-2">/</span>
        <span>{initialTrip.title}</span>
      </div>

      <PageHeader
        title={`Trip: ${client.fullName} — ${initialTrip.title}`}
        description={`${initialTrip.origin} → ${initialTrip.destination}`}
        actions={
          <div className="flex flex-wrap items-center gap-2">
            <StatusBadge status={status} />
            <select
              className="h-9 rounded-md border border-slate-200 bg-white px-3 text-sm"
              value={status}
              onChange={(event) => setStatus(event.target.value as TripStatus)}
              disabled={isClosed}
            >
              {tripStatusOrder.map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </select>
            <Button disabled={!canGenerate}>
              Generate Itinerary
            </Button>
          </div>
        }
      />

      <Card className="border border-slate-200 bg-white">
        <CardContent className="flex flex-wrap items-center justify-between gap-3 p-4">
          <div>
            <p className="text-xs uppercase tracking-wide text-slate-400">
              Next step
            </p>
            <p className="text-sm font-medium text-slate-700">
              {nextStepCopy[status]}
            </p>
          </div>
          {!canGenerate ? (
            <Badge variant="secondary">
              {status !== "Draft Ready"
                ? "Update status to Draft Ready"
                : "Pin an award option to enable itinerary"}
            </Badge>
          ) : null}
        </CardContent>
      </Card>

      <Tabs tabs={tabs} />
    </div>
  );
}
