"use client";
import { cn } from "@/lib/utils";

export default function InternalNotesEditor({
  value,
  onChange,
  placeholder,
  className,
  readOnly = false,
}: {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  readOnly?: boolean;
}) {
  return (
    <textarea
      className={cn(
        "min-h-[160px] w-full rounded-lg border border-slate-200 bg-white p-4 text-sm text-slate-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400",
        readOnly && "opacity-70",
        className
      )}
      value={value}
      onChange={(event) => onChange(event.target.value)}
      placeholder={placeholder}
      readOnly={readOnly}
    />
  );
}
