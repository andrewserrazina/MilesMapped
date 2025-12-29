import PageHeader from "@/components/page-header";
import EmptyState from "@/components/common/EmptyState";

export default function SettingsPage() {
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
    </div>
  );
}
