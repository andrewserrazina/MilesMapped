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
import type { Client, ClientStatus } from "@/lib/types";
import { portalRepo } from "@/lib/portalRepo";

const statusOptions: ClientStatus[] = ["Lead", "Active", "Completed"];

export default function NewClientPage() {
  const router = useRouter();
  const { isHydrated } = portalRepo.usePortalData();
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [status, setStatus] = useState<ClientStatus>("Active");
  const [assignedAgentName, setAssignedAgentName] = useState("Admin");
  const [touchedFields, setTouchedFields] = useState<Record<string, boolean>>({});
  const [hasSubmitted, setHasSubmitted] = useState(false);

  const errors = useMemo(() => {
    const nextErrors: Record<string, string> = {};

    if (!fullName.trim()) {
      nextErrors.fullName = "Full name is required.";
    }

    if (!email.trim()) {
      nextErrors.email = "Email is required.";
    } else if (!email.includes("@")) {
      nextErrors.email = "Email must include an @ symbol.";
    }

    return nextErrors;
  }, [fullName, email]);

  const isValid = Object.keys(errors).length === 0;

  const shouldShowError = (field: string) =>
    Boolean(errors[field]) && (touchedFields[field] || hasSubmitted);

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setHasSubmitted(true);
    if (!isValid) {
      return;
    }

    const newClient: Client = {
      id: crypto.randomUUID(),
      fullName: fullName.trim(),
      email: email.trim(),
      phone: phone.trim(),
      status,
      assignedAgentName: assignedAgentName.trim() || "Admin",
      preferences: {
        homeAirports: [],
        cabinPref: "Economy",
        flexibilityDays: 0,
      },
      balances: {
        amexMR: 0,
        chaseUR: 0,
        cap1: 0,
        united: 0,
        hyatt: 0,
        marriott: 0,
      },
      createdAt: new Date().toISOString().split("T")[0],
    };

    portalRepo.createClient(newClient);
    router.push(`/clients/${newClient.id}`);
  };

  if (!isHydrated) {
    return (
      <div className="space-y-6">
        <PageHeader title="New Client" />
        <div className="h-64 animate-pulse rounded-xl border border-slate-200 bg-white" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader title="New Client" />
      <Card>
        <CardHeader>
          <CardTitle>Client details</CardTitle>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-5">
            <div className="grid gap-2">
              <label className="text-sm font-medium text-slate-700" htmlFor="fullName">
                Full name
              </label>
              <Input
                id="fullName"
                value={fullName}
                onChange={(event) => setFullName(event.target.value)}
                onBlur={() =>
                  setTouchedFields((previous) => ({
                    ...previous,
                    fullName: true,
                  }))
                }
                placeholder="Enter client name"
              />
              {shouldShowError("fullName") ? (
                <p className="text-xs text-red-500">{errors.fullName}</p>
              ) : null}
            </div>

            <div className="grid gap-2">
              <label className="text-sm font-medium text-slate-700" htmlFor="email">
                Email
              </label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                onBlur={() =>
                  setTouchedFields((previous) => ({
                    ...previous,
                    email: true,
                  }))
                }
                placeholder="name@example.com"
              />
              {shouldShowError("email") ? (
                <p className="text-xs text-red-500">{errors.email}</p>
              ) : null}
            </div>

            <div className="grid gap-2">
              <label className="text-sm font-medium text-slate-700" htmlFor="phone">
                Phone (optional)
              </label>
              <Input
                id="phone"
                value={phone}
                onChange={(event) => setPhone(event.target.value)}
                placeholder="+1 (555) 000-0000"
              />
            </div>

            <div className="grid gap-2">
              <label className="text-sm font-medium text-slate-700" htmlFor="status">
                Status
              </label>
              <Select
                id="status"
                value={status}
                onChange={(event) => setStatus(event.target.value as ClientStatus)}
              >
                {statusOptions.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </Select>
            </div>

            <div className="grid gap-2">
              <label
                className="text-sm font-medium text-slate-700"
                htmlFor="assignedAgentName"
              >
                Assigned agent
              </label>
              <Input
                id="assignedAgentName"
                value={assignedAgentName}
                onChange={(event) => setAssignedAgentName(event.target.value)}
                placeholder="Admin"
              />
            </div>
          </CardContent>
          <CardFooter className="flex flex-wrap justify-between gap-3">
            <Link
              href="/clients"
              className={cn(buttonVariants({ variant: "outline" }))}
            >
              Cancel
            </Link>
            <button
              type="submit"
              className={cn(buttonVariants())}
              disabled={!isValid}
            >
              Create Client
            </button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
