import PageHeader from "@/components/page-header";
import EmptyState from "@/components/common/EmptyState";

export default function KnowledgeBasePage() {
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
