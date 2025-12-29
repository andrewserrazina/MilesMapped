"use client";

import PageHeader from "@/components/page-header";
import EmptyState from "@/components/common/EmptyState";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { portalRepo } from "@/lib/portalRepo";
import type { AwardSearchIntegrationConfig } from "@/lib/types";
import { resetPortalData, seedSampleTrips } from "@/lib/portalStore";
import { useCurrentUser } from "@/lib/auth/mockAuth";
import { can } from "@/lib/auth/permissions";

export default function SettingsPage() {
  const { data: portalData, isHydrated } = portalRepo.usePortalData();
  const integrations = portalRepo.getAwardSearchIntegrations(portalData);
  const currentUser = useCurrentUser();
  const canResetDemo = can(currentUser, "demo.reset");

  const handleReset = () => {
    if (!canResetDemo) {
      return;
    }
    const confirmed = window.confirm(
      "Reset demo data? This will overwrite any portal changes and restore the mock dataset."
    );
    if (!confirmed) {
      return;
    }

    resetPortalData();
  };

  const handleSeedTrips = () => {
    if (!canResetDemo) {
      return;
    }
    seedSampleTrips();
  };

  const handleIntegrationChange = (
    key: "pointMe" | "roame",
    patch: Partial<AwardSearchIntegrationConfig>
  ) => {
    portalRepo.updateAwardSearchIntegrations({
      [key]: patch,
    });
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
      {integrations ? (
        <Card>
          <CardHeader>
            <CardTitle>Award Search Integrations</CardTitle>
            <CardDescription>
              Configure deep-link templates for award search tools. Leave the
              template blank to open the provider homepage.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {(
              [
                { key: "pointMe", label: "point.me" },
                { key: "roame", label: "Roame" },
              ] as const
            ).map(({ key, label }) => {
              const config = integrations[key];
              return (
                <div
                  key={key}
                  className="space-y-4 rounded-lg border border-slate-200 p-4"
                >
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <h3 className="text-base font-semibold text-slate-900">
                      {label}
                    </h3>
                    <label className="flex items-center gap-2 text-sm text-slate-600">
                      <Checkbox
                        checked={config.enabled}
                        onChange={(event) =>
                          handleIntegrationChange(key, {
                            enabled: event.target.checked,
                          })
                        }
                      />
                      Enabled
                    </label>
                  </div>
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <label className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                        Base URL
                      </label>
                      <Input
                        value={config.baseUrl}
                        onChange={(event) =>
                          handleIntegrationChange(key, {
                            baseUrl: event.target.value,
                          })
                        }
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                        URL Template
                      </label>
                      <Input
                        value={config.urlTemplate}
                        onChange={(event) =>
                          handleIntegrationChange(key, {
                            urlTemplate: event.target.value,
                          })
                        }
                        placeholder="Leave blank to open base URL"
                      />
                    </div>
                  </div>
                  <div className="space-y-2 text-xs text-slate-500">
                    <p>
                      Supported variables: {"{origin}"}, {"{destination}"},{" "}
                      {"{dateStart}"}, {"{dateEnd}"}, {"{flexibilityDays}"},{" "}
                      {"{passengers}"}, {"{cabinPref}"}, {"{cabinCode}"}.
                    </p>
                    <p>
                      Values are URL-encoded (strings) when substituted. If the
                      template is blank, the portal opens the base URL.
                    </p>
                    <p>
                      Example (edit to match actual provider URL format):{" "}
                      <span className="font-mono text-slate-600">
                        https://provider.com/search?origin={"{"}origin{"}"}
                        &destination={"{"}destination{"}"}
                        &dateStart={"{"}dateStart{"}"}
                      </span>
                    </p>
                  </div>
                </div>
              );
            })}
          </CardContent>
        </Card>
      ) : null}
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
          <Button
            variant="outline"
            onClick={handleReset}
            disabled={!isHydrated || !canResetDemo}
          >
            Reset Demo Data
          </Button>
          <Button onClick={handleSeedTrips} disabled={!isHydrated || !canResetDemo}>
            Seed Sample Trips
          </Button>
          {!canResetDemo ? (
            <p className="text-xs text-slate-400">
              Only admins can reset demo data.
            </p>
          ) : null}
        </CardContent>
      </Card>
    </div>
  );
}
