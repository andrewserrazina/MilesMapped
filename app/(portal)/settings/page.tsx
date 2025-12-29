"use client";

import PageHeader from "@/components/page-header";
import EmptyState from "@/components/common/EmptyState";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { resetPortalData, seedSampleTrips, usePortalData } from "@/lib/portalStore";

export default function SettingsPage() {
  const { isHydrated } = usePortalData();

  const handleReset = () => {
    const confirmed = window.confirm(
      "Reset demo data? This will overwrite any portal changes and restore the mock dataset."
    );
    if (!confirmed) {
      return;
    }

    resetPortalData();
  };

  const handleSeedTrips = () => {
    seedSampleTrips();
  };

  if (!isHydrated) {
    return (
      <div className="space-y-6">
        <PageHeader
          title="Settings"
          description="Configure agent preferences, templates, and automations."
        />
        <div className="h-40 animate-pulse rounded-xl border border-slate-200 bg-white" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Settings"
        description="Configure agent preferences, templates, and automations."
      />
      <EmptyState
        title="Settings coming soon"
        description="Define team rules, templates, and integrations later."
      />
      <Card>
        <CardHeader>
          <div className="flex flex-wrap items-center justify-between gap-2">
            <CardTitle>Dev Tools</CardTitle>
            <span className="text-xs font-semibold uppercase tracking-wide text-slate-500">
              Admin-only
            </span>
          </div>
          <CardDescription>
            Developer controls for testing portal data flows without a hard
            refresh.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-3">
          <Button variant="outline" onClick={handleReset} disabled={!isHydrated}>
            Reset Demo Data
          </Button>
          <Button onClick={handleSeedTrips} disabled={!isHydrated}>
            Seed Sample Trips
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
