import PageHeader from "@/components/page-header";

export default function Loading() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Clients"
        description="Manage client profiles, preferences, and trip history."
      />
      <div className="space-y-4 rounded-xl border border-slate-200 bg-white p-6">
        <div className="h-4 w-40 animate-pulse rounded bg-slate-200" />
        <div className="h-10 w-full animate-pulse rounded bg-slate-100" />
        <div className="h-40 w-full animate-pulse rounded bg-slate-100" />
      </div>
    </div>
  );
}
