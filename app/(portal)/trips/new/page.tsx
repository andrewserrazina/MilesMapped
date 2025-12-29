"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import PageHeader from "@/components/page-header";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { defaultTripIntake, type ClientPreferences, type Trip } from "@/lib/types";
import { portalRepo } from "@/lib/portalRepo";
import { useCurrentUser } from "@/lib/auth/mockAuth";
import { can } from "@/lib/auth/permissions";

const cabinOptions: ClientPreferences["cabinPref"][] = [
  "Economy",
  "Premium",
  "Business",
  "First",
];

export default function NewTripPage() {
  const router = useRouter();
  const { data: portalData, isHydrated } = portalRepo.usePortalData();
  const clients = portalRepo.listClients(portalData);
  const currentUser = useCurrentUser();
  const canCreateTrip = can(currentUser, "trip.create");

  const [clientSearch, setClientSearch] = useState("");
  const [clientId, setClientId] = useState("");
  const [isClientDropdownOpen, setIsClientDropdownOpen] = useState(false);

  const [title, setTitle] = useState("");
  const [origin, setOrigin] = useState("");
  const [destination, setDestination] = useState("");
  const [dateStart, setDateStart] = useState("");
  const [dateEnd, setDateEnd] = useState("");
  const [flexibilityDays, setFlexibilityDays] = useState(0);
  const [passengers, setPassengers] = useState(1);
  const [cabinPref, setCabinPref] = useState<ClientPreferences["cabinPref"]>(
    "Economy"
  );

  const [touchedFields, setTouchedFields] = useState<Record<string, boolean>>({});
  const [hasSubmitted, setHasSubmitted] = useState(false);

  const selectedClient = clients.find((client) => client.id === clientId);

  const filteredClients = useMemo(() => {
    const term = clientSearch.toLowerCase();
    if (!term) {
      return clients;
    }
    return clients.filter(
      (client) =>
        client.fullName.toLowerCase().includes(term) ||
        client.email.toLowerCase().includes(term)
    );
  }, [clients, clientSearch]);

  const errors = useMemo(() => {
    const nextErrors: Record<string, string> = {};

    if (!clientId) {
      nextErrors.clientId = "Select a client to continue.";
    }
    if (!title.trim()) {
      nextErrors.title = "Trip title is required.";
    }
    if (!origin.trim()) {
      nextErrors.origin = "Origin is required.";
    }
    if (!destination.trim()) {
      nextErrors.destination = "Destination is required.";
    }
    if (!dateStart) {
      nextErrors.dateStart = "Start date is required.";
    }
    if (!dateEnd) {
      nextErrors.dateEnd = "End date is required.";
    } else if (dateStart && dateEnd < dateStart) {
      nextErrors.dateEnd = "End date must be on or after the start date.";
    }
    if (passengers < 1) {
      nextErrors.passengers = "Passengers must be at least 1.";
    }

    return nextErrors;
  }, [clientId, title, origin, destination, dateStart, dateEnd, passengers]);

  const isValid = Object.keys(errors).length === 0;

  const shouldShowError = (field: string) =>
    Boolean(errors[field]) && (touchedFields[field] || hasSubmitted);

  const handleClientSelect = (id: string) => {
    const client = clients.find((item) => item.id === id);
    if (!client) {
      return;
    }
    setClientId(id);
    setClientSearch(`${client.fullName} • ${client.email}`);
    setIsClientDropdownOpen(false);
  };

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setHasSubmitted(true);
    if (!isValid) {
      return;
    }
    if (!canCreateTrip) {
      return;
    }

    const newTrip: Trip = {
      id: crypto.randomUUID(),
      clientId,
      title: title.trim(),
      origin: origin.trim(),
      destination: destination.trim(),
      dateStart,
      dateEnd,
      flexibilityDays,
      passengers,
      cabinPref,
      status: "Intake",
      assignedAgentName: currentUser.name,
      intake: { ...defaultTripIntake },
      awardOptions: [],
      hotelOptions: [],
    };

    portalRepo.createTrip(newTrip);
    router.push(`/trips/${newTrip.id}`);
  };

  if (!isHydrated) {
    return (
      <div className="space-y-6">
        <PageHeader title="New Trip" />
        <div className="h-64 animate-pulse rounded-xl border border-slate-200 bg-white" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader title="New Trip" />
      <Card>
        <CardHeader>
          <CardTitle>Trip intake</CardTitle>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent>
            <fieldset className="space-y-5" disabled={!canCreateTrip}>
              <div className="grid gap-2">
                <label className="text-sm font-medium text-slate-700" htmlFor="client">
                  Client
                </label>
                <div className="relative">
                  <Input
                    id="client"
                    value={clientSearch}
                    onChange={(event) => {
                      setClientSearch(event.target.value);
                      setClientId("");
                      setIsClientDropdownOpen(true);
                    }}
                    onFocus={() => setIsClientDropdownOpen(true)}
                    onBlur={() => {
                      setTouchedFields((previous) => ({
                        ...previous,
                        clientId: true,
                      }));
                      window.setTimeout(() => setIsClientDropdownOpen(false), 150);
                    }}
                    placeholder="Search clients"
                  />
                  {isClientDropdownOpen ? (
                    <div className="absolute z-20 mt-1 w-full rounded-md border border-slate-200 bg-white shadow-lg">
                      {filteredClients.length === 0 ? (
                        <div className="px-3 py-2 text-sm text-slate-500">
                          No matching clients.
                        </div>
                      ) : (
                        <div className="max-h-56 overflow-y-auto">
                          {filteredClients.map((client) => (
                            <button
                              key={client.id}
                              type="button"
                              className="flex w-full flex-col items-start gap-1 px-3 py-2 text-left text-sm hover:bg-slate-50"
                              onMouseDown={() => handleClientSelect(client.id)}
                            >
                              <span className="font-medium text-slate-900">
                                {client.fullName}
                              </span>
                              <span className="text-xs text-slate-500">
                                {client.email}
                              </span>
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  ) : null}
                </div>
                {shouldShowError("clientId") ? (
                  <p className="text-xs text-red-500">{errors.clientId}</p>
                ) : null}
              </div>

            {selectedClient ? (
              <div className="rounded-lg border border-slate-200 bg-slate-50 p-4 text-sm text-slate-700">
                <p className="font-semibold text-slate-900">
                  {selectedClient.fullName}
                </p>
                <p>{selectedClient.email}</p>
                <p className="text-xs text-slate-500">
                  Status: {selectedClient.status} · Agent: {selectedClient.assignedAgentName}
                </p>
              </div>
            ) : null}

            <div className="grid gap-2">
              <label className="text-sm font-medium text-slate-700" htmlFor="title">
                Trip title
              </label>
              <Input
                id="title"
                value={title}
                onChange={(event) => setTitle(event.target.value)}
                onBlur={() =>
                  setTouchedFields((previous) => ({
                    ...previous,
                    title: true,
                  }))
                }
                placeholder="e.g. Europe Honeymoon"
              />
              {shouldShowError("title") ? (
                <p className="text-xs text-red-500">{errors.title}</p>
              ) : null}
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="grid gap-2">
                <label className="text-sm font-medium text-slate-700" htmlFor="origin">
                  Origin
                </label>
                <Input
                  id="origin"
                  value={origin}
                  onChange={(event) => setOrigin(event.target.value)}
                  onBlur={() =>
                    setTouchedFields((previous) => ({
                      ...previous,
                      origin: true,
                    }))
                  }
                  placeholder="e.g. JFK"
                />
                {shouldShowError("origin") ? (
                  <p className="text-xs text-red-500">{errors.origin}</p>
                ) : null}
              </div>
              <div className="grid gap-2">
                <label
                  className="text-sm font-medium text-slate-700"
                  htmlFor="destination"
                >
                  Destination
                </label>
                <Input
                  id="destination"
                  value={destination}
                  onChange={(event) => setDestination(event.target.value)}
                  onBlur={() =>
                    setTouchedFields((previous) => ({
                      ...previous,
                      destination: true,
                    }))
                  }
                  placeholder="e.g. CDG"
                />
                {shouldShowError("destination") ? (
                  <p className="text-xs text-red-500">{errors.destination}</p>
                ) : null}
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="grid gap-2">
                <label
                  className="text-sm font-medium text-slate-700"
                  htmlFor="dateStart"
                >
                  Start date
                </label>
                <Input
                  id="dateStart"
                  type="date"
                  value={dateStart}
                  onChange={(event) => setDateStart(event.target.value)}
                  onBlur={() =>
                    setTouchedFields((previous) => ({
                      ...previous,
                      dateStart: true,
                    }))
                  }
                />
                {shouldShowError("dateStart") ? (
                  <p className="text-xs text-red-500">{errors.dateStart}</p>
                ) : null}
              </div>
              <div className="grid gap-2">
                <label
                  className="text-sm font-medium text-slate-700"
                  htmlFor="dateEnd"
                >
                  End date
                </label>
                <Input
                  id="dateEnd"
                  type="date"
                  value={dateEnd}
                  onChange={(event) => setDateEnd(event.target.value)}
                  onBlur={() =>
                    setTouchedFields((previous) => ({
                      ...previous,
                      dateEnd: true,
                    }))
                  }
                />
                {shouldShowError("dateEnd") ? (
                  <p className="text-xs text-red-500">{errors.dateEnd}</p>
                ) : null}
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-3">
              <div className="grid gap-2">
                <label
                  className="text-sm font-medium text-slate-700"
                  htmlFor="flexibilityDays"
                >
                  Flexibility (days)
                </label>
                <Input
                  id="flexibilityDays"
                  type="number"
                  min={0}
                  value={flexibilityDays}
                  onChange={(event) =>
                    setFlexibilityDays(Number(event.target.value))
                  }
                />
              </div>
              <div className="grid gap-2">
                <label
                  className="text-sm font-medium text-slate-700"
                  htmlFor="passengers"
                >
                  Passengers
                </label>
                <Input
                  id="passengers"
                  type="number"
                  min={1}
                  value={passengers}
                  onChange={(event) => setPassengers(Number(event.target.value))}
                  onBlur={() =>
                    setTouchedFields((previous) => ({
                      ...previous,
                      passengers: true,
                    }))
                  }
                />
                {shouldShowError("passengers") ? (
                  <p className="text-xs text-red-500">{errors.passengers}</p>
                ) : null}
              </div>
              <div className="grid gap-2">
                <label
                  className="text-sm font-medium text-slate-700"
                  htmlFor="cabinPref"
                >
                  Cabin preference
                </label>
                <Select
                  id="cabinPref"
                  value={cabinPref}
                  onChange={(event) =>
                    setCabinPref(
                      event.target.value as ClientPreferences["cabinPref"]
                    )
                  }
                >
                  {cabinOptions.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </Select>
              </div>
            </div>
            </fieldset>
          </CardContent>
          <CardFooter className="flex flex-wrap justify-between gap-3">
            <Link
              href="/trips"
              className={cn(buttonVariants({ variant: "outline" }))}
            >
              Cancel
            </Link>
            <div className="flex flex-col items-end gap-2">
              <button
                type="submit"
                className={cn(buttonVariants())}
                disabled={!isValid || !canCreateTrip}
              >
                Create Trip
              </button>
              {!canCreateTrip ? (
                <p className="text-xs text-slate-400">
                  Only admins can create trips.
                </p>
              ) : null}
            </div>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
