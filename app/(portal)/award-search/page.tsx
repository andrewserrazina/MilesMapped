"use client";

import PageHeader from "@/components/page-header";
import EmptyState from "@/components/common/EmptyState";
import { portalRepo } from "@/lib/portalRepo";

export default function AwardSearchPage() {
  const { isHydrated } = portalRepo.usePortalData();

  if (!isHydrated) {
    return (
      <div className="space-y-6">
        <PageHeader
          title="Award Search"
          description="Launch program-specific award search workflows here."
        />
        <div className="h-40 animate-pulse rounded-xl border border-slate-200 bg-white" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Award Search"
        description="Launch program-specific award search workflows here."
      />
      <EmptyState
        title="Search workspace coming soon"
        description="Wire this page to real award search APIs when ready."
      />
    </div>
  );
}
