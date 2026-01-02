"use client";

import { useMemo, useState } from "react";
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
import { Select } from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { portalRepo } from "@/lib/portalRepo";
import type {
  AuditLogAction,
  AuditLogTargetType,
  AwardSearchIntegrationConfig,
} from "@/lib/types";
import { resetPortalData, seedSampleTrips } from "@/lib/portalStore";
import { useCurrentUser } from "@/lib/auth/mockAuth";
import { can } from "@/lib/auth/permissions";

export default function SettingsPage() {
  const { data: portalData, isHydrated } = portalRepo.usePortalData();
  const integrations = portalRepo.getAwardSearchIntegrations(portalData);
  const currentUser = useCurrentUser();
  const canResetDemo = can(currentUser, "demo.reset");
  const canClearAuditLog = currentUser.role === "admin";
  const auditLog = portalRepo.listAuditLog(portalData);
  const [actionFilter, setActionFilter] = useState<AuditLogAction | "all">(
    "all"
  );
  const [targetFilter, setTargetFilter] = useState<AuditLogTargetType | "all">(
    "all"
  );
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  const actionOptions = useMemo<AuditLogAction[]>(() => {
    const actions = new Set<AuditLogAction>();
    auditLog.forEach((entry) => actions.add(entry.action));
    return Array.from(actions);
  }, [auditLog]);

  const targetOptions = useMemo<AuditLogTargetType[]>(() => {
    const targets = new Set<AuditLogTargetType>();
    auditLog.forEach((entry) => targets.add(entry.targetType));
    return Array.from(targets);
  }, [auditLog]);

  const filteredEntries = useMemo(() => {
    return auditLog.filter((entry) => {
      if (actionFilter !== "all" && entry.action !== actionFilter) {
        return false;
      }
      if (targetFilter !== "all" && entry.targetType !== targetFilter) {
        return false;
      }
      if (startDate) {
        const start = new Date(startDate);
        start.setHours(0, 0, 0, 0);
        if (new Date(entry.timestamp) < start) {
          return false;
        }
      }
      if (endDate) {
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);
        if (new Date(entry.timestamp) > end) {
          return false;
        }
      }
      return true;
    });
  }, [actionFilter, auditLog, endDate, startDate, targetFilter]);

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

  const handleExportAuditLog = () => {
    const headers = [
      "Timestamp",
      "Actor",
      "Role",
      "Action",
      "Target Type",
      "Target ID",
      "Metadata",
    ];
    const rows = filteredEntries.map((entry) => [
      entry.timestamp,
      entry.actorName,
      entry.actorRole,
      entry.action,
      entry.targetType,
      entry.targetId,
      JSON.stringify(entry.metadata ?? {}),
    ]);
    const csv = [headers, ...rows]
      .map((row) =>
        row
          .map((cell) => `"${String(cell).replaceAll("\"", '""')}"`)
          .join(",")
      )
      .join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "milesmapped-audit-log.csv";
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
  };

  const handleClearAuditLog = () => {
    if (!canClearAuditLog) {
      return;
    }
    const confirmed = window.confirm(
      "Clear the audit log? This action cannot be undone."
    );
    if (!confirmed) {
      return;
    }
    portalRepo.clearAuditLog({
      name: currentUser.name,
      role: currentUser.role,
    });
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
      <Card>
        <CardHeader>
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <CardTitle>Audit Log</CardTitle>
              <CardDescription>
                Review sensitive actions logged in the portal.
              </CardDescription>
            </div>
            <div className="flex flex-wrap gap-2">
              <Button variant="outline" onClick={handleExportAuditLog}>
                Export CSV
              </Button>
              <Button
                variant="outline"
                onClick={handleClearAuditLog}
                disabled={!canClearAuditLog}
              >
                Clear Log
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <div className="space-y-2">
              <label className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                Action
              </label>
              <Select
                value={actionFilter}
                onChange={(event) =>
                  setActionFilter(event.target.value as AuditLogAction | "all")
                }
              >
                <option value="all">All actions</option>
                {actionOptions.map((action) => (
                  <option key={action} value={action}>
                    {action}
                  </option>
                ))}
              </Select>
            </div>
            <div className="space-y-2">
              <label className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                Target Type
              </label>
              <Select
                value={targetFilter}
                onChange={(event) =>
                  setTargetFilter(
                    event.target.value as AuditLogTargetType | "all"
                  )
                }
              >
                <option value="all">All targets</option>
                {targetOptions.map((target) => (
                  <option key={target} value={target}>
                    {target}
                  </option>
                ))}
              </Select>
            </div>
            <div className="space-y-2">
              <label className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                Start Date
              </label>
              <Input
                type="date"
                value={startDate}
                onChange={(event) => setStartDate(event.target.value)}
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                End Date
              </label>
              <Input
                type="date"
                value={endDate}
                onChange={(event) => setEndDate(event.target.value)}
              />
            </div>
          </div>
          <div className="rounded-lg border border-slate-200">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Timestamp</TableHead>
                  <TableHead>Actor</TableHead>
                  <TableHead>Action</TableHead>
                  <TableHead>Target</TableHead>
                  <TableHead>Metadata</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredEntries.length ? (
                  filteredEntries.map((entry) => (
                    <TableRow key={entry.id}>
                      <TableCell className="text-xs text-slate-600">
                        {new Date(entry.timestamp).toLocaleString()}
                      </TableCell>
                      <TableCell className="text-sm text-slate-700">
                        <div className="font-semibold text-slate-900">
                          {entry.actorName}
                        </div>
                        <div className="text-xs text-slate-500">
                          {entry.actorRole}
                        </div>
                      </TableCell>
                      <TableCell className="text-sm text-slate-700">
                        {entry.action}
                      </TableCell>
                      <TableCell className="text-sm text-slate-700">
                        <div className="font-semibold text-slate-900">
                          {entry.targetType}
                        </div>
                        <div className="text-xs text-slate-500">
                          {entry.targetId}
                        </div>
                      </TableCell>
                      <TableCell className="max-w-xs text-xs text-slate-500">
                        <pre className="whitespace-pre-wrap font-sans">
                          {JSON.stringify(entry.metadata ?? {}, null, 2)}
                        </pre>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell
                      colSpan={5}
                      className="py-10 text-center text-sm text-slate-500"
                    >
                      No audit entries match the selected filters.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
