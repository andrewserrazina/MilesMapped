import { Suspense } from "react";
import PageHeader from "@/components/page-header";
import KnowledgeBaseClient from "./knowledge-base-client";

function KnowledgeBaseFallback() {
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

export default function KnowledgeBasePage() {
  return (
    <Suspense fallback={<KnowledgeBaseFallback />}>
      <KnowledgeBaseClient />
    </Suspense>
  );
}
