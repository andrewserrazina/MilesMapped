import SidebarNav from "@/components/sidebar-nav";

export default function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen bg-slate-100">
      <aside className="hidden w-64 flex-col border-r border-slate-200 bg-white p-6 md:flex">
        <div className="mb-8">
          <div className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">
            MilesMapped
          </div>
          <h1 className="text-xl font-semibold text-slate-900">Agent Portal</h1>
        </div>
        <SidebarNav />
        <div className="mt-auto pt-8">
          <div className="flex items-center gap-3 rounded-lg border border-slate-200 bg-slate-50 p-3">
            <div className="h-10 w-10 rounded-full bg-slate-300" />
            <div>
              <p className="text-sm font-semibold text-slate-900">Agent Jordan</p>
              <p className="text-xs text-slate-500">Points Strategist</p>
            </div>
          </div>
        </div>
      </aside>
      <main className="flex-1 px-6 py-8 md:px-10">
        <div className="mx-auto w-full max-w-6xl space-y-6">{children}</div>
      </main>
    </div>
  );
}
