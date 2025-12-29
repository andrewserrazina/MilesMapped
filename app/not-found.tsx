import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export default function NotFound() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-100 px-6 py-16">
      <div className="w-full max-w-lg space-y-6 rounded-2xl border border-slate-200 bg-white p-10 text-center shadow-sm">
        <p className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-400">
          MilesMapped
        </p>
        <div className="space-y-2">
          <h1 className="text-3xl font-semibold text-slate-900">Page not found</h1>
          <p className="text-sm text-slate-500">
            The page you are looking for doesn’t exist or was moved. Head back to the
            dashboard to continue.
          </p>
        </div>
        <Link
          href="/dashboard"
          className={cn(buttonVariants(), "mx-auto inline-flex")}
        >
          Back to dashboard
        </Link>
      </div>
    </div>
  );
}
