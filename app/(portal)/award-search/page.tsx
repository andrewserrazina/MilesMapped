import PageHeader from "@/components/page-header";
import EmptyState from "@/components/common/EmptyState";

export default function AwardSearchPage() {
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
