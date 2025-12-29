"use client";

import PageHeader from "@/components/page-header";
import EmptyState from "@/components/common/EmptyState";
import { portalRepo } from "@/lib/portalRepo";

export default function ReportsPage() {
  const { isHydrated } = portalRepo.usePortalData();

  if (!isHydrated) {
    return (
      <div className="space-y-6">
        <PageHeader
          title="Reports"
          description="Operational metrics and revenue insights."
        />
        <div className="h-40 animate-pulse rounded-xl border border-slate-200 bg-white" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Reports"
        description="Operational metrics and revenue insights."
      />
      <EmptyState
        title="Reporting dashboards coming soon"
        description="Connect real data sources to unlock analytics views."
      />
    </div>
  );
}
