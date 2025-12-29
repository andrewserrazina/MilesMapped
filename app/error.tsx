"use client";

import { useEffect } from "react";
import Link from "next/link";
import { Button, buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-100 px-6 py-16">
      <div className="w-full max-w-lg space-y-6 rounded-2xl border border-slate-200 bg-white p-10 text-center shadow-sm">
        <p className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-400">
          MilesMapped
        </p>
        <div className="space-y-2">
          <h1 className="text-3xl font-semibold text-slate-900">Something went wrong</h1>
          <p className="text-sm text-slate-500">
            We hit an unexpected error while loading the portal. Try again or return
            to the dashboard.
          </p>
        </div>
        <div className="flex flex-wrap justify-center gap-3">
          <Button onClick={reset}>Try again</Button>
          <Link
            href="/dashboard"
            className={cn(buttonVariants({ variant: "outline" }))}
          >
            Back to dashboard
          </Link>
        </div>
      </div>
    </div>
  );
}
