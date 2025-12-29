"use client";

import PageHeader from "@/components/page-header";
import EmptyState from "@/components/common/EmptyState";
import { portalRepo } from "@/lib/portalRepo";

export default function KnowledgeBasePage() {
  const { isHydrated } = portalRepo.usePortalData();

  if (!isHydrated) {
    return (
      <div className="space-y-6">
        <PageHeader
          title="Knowledge Base"
          description="Curated playbooks, program rules, and transfer tips."
        />
        <div className="h-40 animate-pulse rounded-xl border border-slate-200 bg-white" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Knowledge Base"
        description="Curated playbooks, program rules, and transfer tips."
      />
      <EmptyState
        title="Knowledge base coming soon"
        description="Add SOPs, playbooks, and transfer guides here."
      />
    </div>
  );
}
