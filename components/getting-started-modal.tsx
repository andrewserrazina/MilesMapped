"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogOverlay,
  DialogTitle,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";

type QuickLink = {
  label: string;
  href: string;
  description: string;
};

export default function GettingStartedModal({ userName }: { userName: string }) {
  const [open, setOpen] = useState(false);
  const storageKey = useMemo(
    () => `mm-portal:getting-started:${userName.toLowerCase().replace(/\s+/g, "-")}`,
    [userName]
  );

  const quickLinks = useMemo<QuickLink[]>(
    () => [
      {
        label: "Create New Client",
        href: "/clients/new",
        description: "Capture client preferences and balances.",
      },
      {
        label: "Create New Trip",
        href: "/trips/new",
        description: "Start a trip intake and timeline.",
      },
      {
        label: "Open Knowledge Base",
        href: "/kb",
        description: "Find SOPs, sweet spots, and playbooks.",
      },
      {
        label: "View Health Check",
        href: "/health-check",
        description: "Confirm system integrations are online.",
      },
    ],
    []
  );

  useEffect(() => {
    const storedValue = window.localStorage.getItem(storageKey);
    if (!storedValue) {
      setOpen(true);
    }
  }, [storageKey]);

  const handleDismiss = () => {
    window.localStorage.setItem(storageKey, "dismissed");
    setOpen(false);
  };

  if (!open) {
    return null;
  }

  return (
    <Dialog open={open}>
      <DialogOverlay />
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Getting Started</DialogTitle>
          <DialogDescription>
            Welcome back, {userName}. Here’s the fastest way to start a trip and
            stay aligned with the MilesMapped SOP.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-3 md:grid-cols-2">
          {quickLinks.map((link) => (
            <Link
              key={link.label}
              href={link.href}
              className={cn(
                "rounded-lg border border-slate-200 bg-slate-50 p-4 text-left transition hover:border-slate-300 hover:bg-white",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400 focus-visible:ring-offset-2"
              )}
            >
              <p className="text-sm font-semibold text-slate-900">{link.label}</p>
              <p className="mt-1 text-xs text-slate-500">{link.description}</p>
              <span className="mt-3 inline-flex items-center text-xs font-semibold text-slate-600">
                Open →
              </span>
            </Link>
          ))}
        </div>
        <DialogFooter className="mt-4">
          <Button variant="secondary" onClick={handleDismiss}>
            Dismiss
          </Button>
          <Button onClick={handleDismiss}>Let’s Go</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
