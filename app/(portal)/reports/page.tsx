import PageHeader from "@/components/page-header";
import EmptyState from "@/components/common/EmptyState";

export default function ReportsPage() {
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
